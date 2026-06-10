import { Router, Response } from 'express'
import { requireAuth, AuthenticatedRequest } from '../middleware/auth'
import { db } from '../lib/db'

const router = Router()

// Utility function to generate system notifications
async function createNotification(userId: string, title: string, message: string) {
  try {
    await db.notification.create({
      data: { userId, title, message }
    });
  } catch (err) {
    console.error('Failed to write notification to database:', err);
  }
}

// Reusable standard routing sequence map for Kenya highway pathways
// Used to validate route-grouping logic when matching multiple cargo loads on a single journey
const ROUTE_MILESTONES_ORDER = [
  "nairobi",
  "naivasha",
  "nakuru",
  "kericho",
  "eldoret",
  "kisumu",
  "malaba",
  "mombasa"
];

/**
 * Validates if an upcoming load matches the progressive direction of an active route.
 * Returns true if both the new origin and new destination appear sequentially along the existing path.
 */
function isLoadOnSameRoute(activeOrigin: string, activeDest: string, newOrigin: string, newDest: string): boolean {
  const aoIdx = ROUTE_MILESTONES_ORDER.indexOf(activeOrigin.toLowerCase().trim());
  const adIdx = ROUTE_MILESTONES_ORDER.indexOf(activeDest.toLowerCase().trim());
  const noIdx = ROUTE_MILESTONES_ORDER.indexOf(newOrigin.toLowerCase().trim());
  const ndIdx = ROUTE_MILESTONES_ORDER.indexOf(newDest.toLowerCase().trim());

  // If cities are outside our standard highway tracking array, fallback to safety checks
  if (aoIdx === -1 || adIdx === -1 || noIdx === -1 || ndIdx === -1) return false;

  const isActiveForward = adIdx > aoIdx;
  const isNewForward = ndIdx > noIdx;

  // 1. Both loads must be heading in the same geographical direction
  if (isActiveForward !== isNewForward) return false;

  if (isActiveForward) {
    // Forward journey validation (e.g. Nairobi -> Nakuru -> Eldoret -> Kisumu)
    return noIdx >= aoIdx && ndIdx <= adIdx;
  } else {
    // Reverse journey validation
    return noIdx <= aoIdx && ndIdx >= adIdx;
  }
}

// ── GET: READ BOOKINGS MANIFEST WITH PRIVACY SHIELDS ──
router.get('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const userRole = req.user!.role.toUpperCase();
  const queryRole = (req.query.role as string) || req.user!.role.toLowerCase();

  try {
    let bookings;
    
    if (queryRole === 'shipper') {
      bookings = await db.booking.findMany({
        where: { shipperId: userId },
        include: {
          driver: { select: { id: true, name: true, phone: true, email: true, rating: true } }
        },
        orderBy: { createdAt: 'desc' }
      });

      bookings = bookings.map(b => {
        const isActive = ['ACCEPTED', 'PICKED_UP', 'IN_TRANSIT', 'COMPLETED'].includes(b.status);
        if (!isActive) return { ...b, driver: null };
        return b;
      });

    } else {
      bookings = await db.booking.findMany({
        where: {
          OR: [
            { driverId: userId },
            { status: 'PENDING' }
          ]
        },
        include: {
          shipper: { select: { id: true, name: true, phone: true, email: true, rating: true } }
        },
        orderBy: { createdAt: 'desc' }
      });

      bookings = bookings.map(b => {
        const isMyAssignedActiveJob = b.driverId === userId && ['ACCEPTED', 'PICKED_UP', 'IN_TRANSIT'].includes(b.status);
        const isOpenMarketplaceJob = b.status === 'PENDING';

        if (isOpenMarketplaceJob) {
          return { ...b, shipperId: "ANONYMOUS", shipper: null };
        }
        if (!isMyAssignedActiveJob) {
          return { ...b, shipper: null };
        }
        return b;
      });
    }
    return res.json(bookings)
  } catch (error) {
    return res.status(500).json({ error: 'Database records streaming failed.' })
  }
})

// ── POST: SHIPPER BROADCASTS FRESH HAULAGE DEMANDS ──
router.post('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { origin, destination, cargo, weight, price } = req.body

  if (!origin || !destination || !cargo || !weight || !price) {
    return res.status(400).json({ error: 'Missing core cargo manifest requirements.' })
  }

  try {
    const newBooking = await db.booking.create({
      data: {
        shipperId: req.user!.id,
        origin,
        destination,
        cargo,
        weight: weight.toString().includes('kg') ? weight : `${weight} kg`,
        price: price.toString().includes('$') ? price : `$${price}`,
        status: 'PENDING',
        date: new Date().toISOString().split('T')[0]
      }
    })

    const drivers = await db.user.findMany({ where: { role: 'DRIVER' } });
    for (const driver of drivers) {
      await createNotification(
        driver.id,
        'New Load Broadcasted 📦',
        `A load request from ${origin} to ${destination} is now open for bidding.`
      );
    }

    return res.status(201).json(newBooking)
  } catch (error) {
    return res.status(500).json({ error: 'Failed to commit booking into database.' })
  }
})

// ── POST: DRIVER CLAIMS FREIGHT WITH ROUTE MATCHING ENFORCEMENT ──
router.post('/:id/accept', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const bookingId = parseInt(req.params.id, 10);
  const userId = req.user!.id;

  if (req.user!.role !== 'DRIVER') {
    return res.status(403).json({ error: 'Access denied. Carriers only.' });
  }

  try {
    const targetLoad = await db.booking.findUnique({ where: { id: bookingId } });
    if (!targetLoad) return res.status(404).json({ error: 'Load manifest not found.' });
    if (targetLoad.status !== 'PENDING') return res.status(410).json({ error: 'This load has already been claimed.' });

    // Look for any active, incomplete jobs currently handled by this driver
    const myActiveJobs = await db.booking.findMany({
      where: {
        driverId: userId,
        status: { in: ['ACCEPTED', 'PICKED_UP', 'IN_TRANSIT'] }
      }
    });

    // If the driver is already running a route, evaluate sub-route capability bounds
    if (myActiveJobs.length > 0) {
      const primaryJob = myActiveJobs[0]; // Evaluate based on the primary layout journey
      
      const routeCompatible = isLoadOnSameRoute(
        primaryJob.origin, 
        primaryJob.destination, 
        targetLoad.origin, 
        targetLoad.destination
      );

      if (!routeCompatible) {
        return res.status(422).json({ 
          error: `Capacity Constraint Overlap! You cannot accept unrelated secondary jobs unless they follow your active transit route path (${primaryJob.origin} ➔ ${primaryJob.destination}).` 
        });
      }
    }

    const driverProfile = await db.user.findUnique({ where: { id: userId } });
    const vehicle = await db.vehicle.findFirst({ where: { driverId: userId } });

    const updatedBooking = await db.booking.update({
      where: { id: bookingId },
      data: {
        driverId: userId,
        vehicleId: vehicle?.id || null,
        status: 'ACCEPTED',
        progress: 15,
        eta: 'Calculating route sequence...'
      }
    });

    await createNotification(
      targetLoad.shipperId,
      'Driver Assigned 🚛',
      `Your shipment load has been claimed by driver: ${driverProfile?.name}. Contact details are now unlocked.`
    );

    return res.json(updatedBooking);
  } catch (error) {
    return res.status(500).json({ error: 'Internal system error assigning carrier.' });
  }
});

// ── POST: DRIVER DECLINES / DROPS AN ALREADY ACCEPTED LOAD (RE-POOLS TO MARKETPLACE) ──
router.post('/:id/decline', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const bookingId = parseInt(req.params.id, 10);
  const userId = req.user!.id;

  try {
    const booking = await db.booking.findUnique({ where: { id: bookingId } });
    if (!booking) return res.status(404).json({ error: 'Shipment record not found.' });

    // 1. If it's a completely unassigned marketplace offer, let the driver skip/hide it locally
    if (booking.status === 'PENDING') {
      return res.json({ success: true, message: 'Job hidden from local feed.', bookingId });
    }

    // 2. If the driver is dropping a contract they previously accepted:
    if (booking.driverId !== userId) {
      return res.status(403).json({ error: 'Unauthorized. You can only drop contracts assigned to your account.' });
    }

    if (['PICKED_UP', 'IN_TRANSIT', 'COMPLETED'].includes(booking.status)) {
      return res.status(400).json({ error: 'Cargo is already in custody. In-transit loads cannot be dropped to the marketplace.' });
    }

    // Reset fields to release the load back onto the public marketplace map
    const rePooledBooking = await db.booking.update({
      where: { id: bookingId },
      data: {
        driverId: null,
        vehicleId: null,
        status: 'PENDING',
        progress: 0,
        eta: 'TBD'
      }
    });

    // Notify the shipper that their load has returned to the open market pool
    await createNotification(
      booking.shipperId,
      'Load Re-pooled ⚠️',
      `The assigned driver has dropped the contract. Your load request has been returned to the public marketplace pool.`
    );

    return res.json({ success: true, message: 'Contract released back to the open market.', rePooledBooking });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to release contract back to marketplace.' });
  }
});

// GET: Single Booking details
router.get('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const bookingId = parseInt(req.params.id, 10);
  if (isNaN(bookingId)) {
    return res.status(400).json({ error: 'Invalid tracking identity formatting parameters.' });
  }

  try {
    const booking = await db.booking.findUnique({
      where: { id: bookingId },
      include: {
        shipper: { select: { id: true, name: true, phone: true, email: true, rating: true } },
        driver: { select: { id: true, name: true, phone: true, email: true, rating: true } }
      }
    });

    if (!booking) {
      return res.status(404).json({ error: 'Target haulage entry not discovered on global database ledger.' });
    }

    // Security Check: Restrict view access to participants only (Shipper, Driver, or Super Admin)
    const isParticipant = booking.shipperId === req.user!.id || booking.driverId === req.user!.id;
    if (req.user!.role !== 'SUPER_ADMIN' && !isParticipant) {
      return res.status(403).json({ error: 'Access denied. Cryptographic tracking shield isolation enforced.' });
    }

    return res.json(booking);
  } catch (error) {
    console.error('Database query lookup exception:', error);
    return res.status(500).json({ error: 'Database transaction lookup failed.' });
  }
});

// PATCH: Confirm delivery completion
router.patch('/:id/confirm-delivery', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const booking = await db.booking.findUnique({ where: { id: parseInt(req.params.id, 10) } });
    if (!booking || booking.shipperId !== req.user!.id) return res.status(403).json({ error: 'Unauthorized.' });

    const updated = await db.booking.update({
      where: { id: booking.id },
      data: { status: 'COMPLETED', progress: 100, eta: 'Delivered' }
    });

    if (booking.driverId) {
      await createNotification(booking.driverId, 'Escrow Settled 💰', `The shipper confirmed delivery for load #${booking.id}.`);
    }
    return res.json(updated);
  } catch (e) {
    return res.status(500).json({ error: 'Confirmation failed.' });
  }
});

// PATCH: Driver logs destination arrival
router.patch('/:id/arrive-destination', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const booking = await db.booking.findUnique({ where: { id: parseInt(req.params.id, 10) } });
    if (!booking || booking.driverId !== req.user!.id) return res.status(403).json({ error: 'Unauthorized.' });

    const updated = await db.booking.update({
      where: { id: booking.id },
      data: { status: 'PICKED_UP', progress: 95, eta: 'Arrived at Destination' }
    });

    await createNotification(booking.shipperId, 'Goods Arrived 📍', `The driver arrived at the destination for load #${booking.id}. Please confirm receipt.`);
    return res.json(updated);
  } catch (e) {
    return res.status(500).json({ error: 'Arrival update failed.' });
  }
});

export default router;