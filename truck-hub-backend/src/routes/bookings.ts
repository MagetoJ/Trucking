import { Router, Response } from 'express'
import { requireAuth, AuthenticatedRequest } from '../middleware/auth'
import { db } from '../lib/db'

const router = Router()

// Utility helper function to create database notifications
async function createNotification(userId: string, title: string, message: string) {
  try {
    await db.notification.create({
      data: { userId, title, message }
    });
  } catch (err) {
    console.error('Failed to write notification to database:', err);
  }
}

// Get assigned or available loads matching user criteria context
router.get('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id
  const userRole = req.user!.role.toUpperCase() // Ensure uniform casing comparison ('SHIPPER', 'DRIVER', 'SUPER_ADMIN')
  const queryRole = (req.query.role as string) || req.user!.role.toLowerCase()

  try {
    let bookings;
    
    // ── SHIPPER REQUESTING OWN BOOKINGS ──
    if (queryRole === 'shipper') {
      bookings = await db.booking.findMany({
        where: { shipperId: userId },
        include: {
          driver: { select: { id: true, name: true, phone: true, email: true, rating: true } }
        },
        orderBy: { createdAt: 'desc' }
      });

      // Privacy Filter: Shippers can see driver details ONLY if the job is actively running
      bookings = bookings.map(b => {
        const isActive = ['ACCEPTED', 'PICKED_UP', 'IN_TRANSIT'].includes(b.status);
        if (!isActive) {
          return { ...b, driver: null }; // Strip driver information on PENDING, COMPLETED, or CANCELLED statuses
        }
        return b;
      });

    // ── DRIVER REQUESTING AVAILABLE OR ASSIGNED BOOKINGS ──
    } else {
      bookings = await db.booking.findMany({
        where: {
          OR: [
            { driverId: userId },
            { status: 'PENDING' } // Open marketplace offers
          ]
        },
        include: {
          shipper: { select: { id: true, name: true, phone: true, email: true, rating: true } }
        },
        orderBy: { createdAt: 'desc' }
      });

      // Privacy Filter & Dynamic Requirements Update:
      bookings = bookings.map(b => {
        // Enforce the rule: Shippers' details can be seen by DRIVERS alone.
        if (userRole !== 'DRIVER' && userRole !== 'SUPER_ADMIN') {
          return { ...b, shipper: null }; // Shield shipper information from all other roles
        }

        // If the driver has accepted the job, keep shipper contact open for lifecycle handling
        const isMyActiveJob = b.driverId === userId && ['ACCEPTED', 'PICKED_UP', 'IN_TRANSIT'].includes(b.status);
        const isOpenMarketplaceJob = b.status === 'PENDING';

        // Shippers are visible to drivers during bidding or when running the route, but disappear upon completion/cancellation
        if (!isMyActiveJob && !isOpenMarketplaceJob) {
          return { ...b, shipper: null };
        }
        
        return b;
      });
    }
    return res.json(bookings)
  } catch (error) {
    console.error('Failed to stream bookings manifest:', error)
    return res.status(500).json({ error: 'Database records streaming failed.' })
  }
})

// GET: Fetch all notification logs for the authenticated session user
router.get('/notifications', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const notifications = await db.notification.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
      take: 20
    });
    return res.json(notifications);
  } catch (error) {
    console.error('Failed to retrieve notification streams:', error);
    return res.status(500).json({ error: 'Failed to retrieve notification streams.' });
  }
});

// Create and record fresh haulage demands
router.post('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { origin, destination, cargo, weight, price } = req.body

  if (!origin || !destination) {
    return res.status(400).json({ error: 'Missing core origin or destination location components.' })
  }

  try {
    const newBooking = await db.booking.create({
      data: {
        shipperId: req.user!.id,
        origin,
        destination,
        cargo: cargo || 'General Goods',
        weight: weight ? `${weight} kg` : 'N/A',
        price: price ? `$${price}` : 'Negotiable',
        status: 'PENDING',
        date: new Date().toISOString().split('T')[0]
      }
    })
    return res.status(201).json(newBooking)
  } catch (error) {
    return res.status(500).json({ error: 'Failed to commit booking into relational database.' })
  }
})

// Update existing haulage demands
router.put('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const bookingId = parseInt(req.params.id, 10);
  const userId = req.user!.id;
  const { origin, destination, cargo, weight, price } = req.body;

  if (isNaN(bookingId)) {
    return res.status(400).json({ error: 'Invalid booking identity parameter.' });
  }

  try {
    const booking = await db.booking.findUnique({ where: { id: bookingId } });

    if (!booking) {
      return res.status(404).json({ error: 'The requested shipment payload could not be found.' });
    }

    if (booking.shipperId !== userId) {
      return res.status(403).json({ error: 'Access denied. You can only modify your own bookings.' });
    }

    const updatedBooking = await db.booking.update({
      where: { id: bookingId },
      data: {
        origin,
        destination,
        cargo: cargo || undefined,
        weight: weight ? `${weight} kg` : undefined,
        price: price ? `$${price}` : undefined,
      }
    });

    return res.json(updatedBooking);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update booking in the database.' });
  }
});

// GET: Retrieve absolute single booking details layout by ID parameter context
router.get('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const bookingId = parseInt(req.params.id, 10);
  if (isNaN(bookingId)) {
    return res.status(400).json({ error: 'Invalid tracking identity formatting structure.' });
  }

  try {
    const booking = await db.booking.findUnique({
      where: { id: bookingId },
      include: {
        shipper: {
          select: { name: true, phone: true, email: true, rating: true }
        }
      }
    });

    if (!booking) {
      return res.status(404).json({ error: 'Target haulage entry not discovered.' });
    }

    // Verify requesting identity is authorized to audit this transaction
    if (req.user!.role !== 'SUPER_ADMIN' && booking.driverId !== req.user!.id && booking.shipperId !== req.user!.id) {
      return res.status(403).json({ error: 'Access denied. Information privacy shield enforced.' });
    }

    return res.json(booking);
  } catch (error) {
    return res.status(500).json({ error: 'Database record lookup failed.' });
  }
});

// PATCH: Driver updates the status and progress of an assigned trip
router.patch('/:id/status-update', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const bookingId = parseInt(req.params.id, 10);
  const { status, progress } = req.body;
  const userId = req.user!.id;

  if (isNaN(bookingId) || !status || progress === undefined) {
    return res.status(400).json({ error: 'Invalid booking ID, status, or progress provided.' });
  }

  try {
    const booking = await db.booking.findUnique({ where: { id: bookingId } });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found.' });
    }

    // Ensure only the assigned driver can update the status
    if (booking.driverId !== userId) {
      return res.status(403).json({ error: 'Access denied. You are not the assigned driver for this trip.' });
    }

    const updatedBooking = await db.booking.update({
      where: { id: bookingId },
      data: { status, progress }
    });

    return res.json(updatedBooking);
  } catch (error) {
    console.error('Failed to update trip status:', error);
    return res.status(500).json({ error: 'Internal server error updating trip status.' });
  }
});

// POST: Driver declines/skips an available pending load request
router.post('/:id/decline', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const bookingId = parseInt(req.params.id, 10);
  const userRole = req.user!.role;

  if (isNaN(bookingId)) {
    return res.status(400).json({ error: 'Invalid booking identity parameter format provided.' });
  }

  if (userRole !== 'DRIVER') {
    return res.status(403).json({ error: 'Access denied. Only carriers/drivers can skip operations.' });
  }

  try {
    const booking = await db.booking.findUnique({ where: { id: bookingId } });
    if (!booking) {
      return res.status(444).json({ error: 'The requested shipment payload could not be found.' });
    }

    // Return a success flag along with the ID so the frontend can add it to a local hidden/skipped list
    return res.json({ success: true, message: 'Job successfully hidden from your marketplace view.', bookingId });
  } catch (error) {
    return res.status(500).json({ error: 'Internal system error skipping booking.' });
  }
});

// PATCH: Cancel an unassigned/pending shipment load
router.patch('/:id/cancel', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const bookingId = parseInt(req.params.id, 10);
  if (isNaN(bookingId)) return res.status(400).json({ error: 'Invalid booking ID.' });

  try {
    const booking = await db.booking.findUnique({ where: { id: bookingId } });
    if (!booking) return res.status(444).json({ error: 'Shipment not found.' });
    if (booking.shipperId !== req.user!.id) return res.status(403).json({ error: 'Unauthorized action.' });
    if (booking.status !== 'PENDING' && booking.status !== 'ACCEPTED') {
      return res.status(400).json({ error: 'In-transit loads cannot be cancelled directly.' });
    }

    const updatedBooking = await db.booking.update({
      where: { id: bookingId },
      data: { status: 'CANCELLED', progress: 0 }
    });

    return res.json(updatedBooking);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to cancel the target shipment.' });
  }
});

// PATCH: Confirm receipt/delivery of freight payload
router.patch('/:id/confirm-delivery', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const bookingId = parseInt(req.params.id, 10);
  if (isNaN(bookingId)) return res.status(400).json({ error: 'Invalid booking ID.' });

  try {
    const booking = await db.booking.findUnique({ where: { id: bookingId } });
    if (!booking) return res.status(444).json({ error: 'Shipment not found.' });
    if (booking.shipperId !== req.user!.id) return res.status(403).json({ error: 'Unauthorized.' });

    const updatedBooking = await db.booking.update({
      where: { id: bookingId },
      data: { status: 'COMPLETED', progress: 105 } // 100%+ marks fulfillment
    });

    return res.json(updatedBooking);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to confirm freight fulfillment.' });
  }
});

// Driver claims/accepts an available pending load
router.post('/:id/accept', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const bookingId = parseInt(req.params.id, 10); // CRITICAL FIX: Cast string id parameters safely to Int matching schema constraints
  const userId = req.user!.id;
  const userRole = req.user!.role;

  if (isNaN(bookingId)) {
    return res.status(400).json({ error: 'Invalid booking identity parameter format provided.' });
  }

  if (userRole !== 'DRIVER') {
    return res.status(403).json({ error: 'Access denied. Only carriers/drivers can claim freight match operations.' });
  }

  try {
    // Identify driver vehicle profile
    const vehicle = await db.vehicle.findFirst({
      where: { driverId: userId }
    });

    // Transaction evaluation ensures an asset isn't double booked or snatched if no longer PENDING
    const booking = await db.booking.findUnique({ where: { id: bookingId } });
    
    if (!booking) {
      return res.status(444).json({ error: 'The requested shipment payload could not be found.' });
    }

    if (booking.status !== 'PENDING') {
      return res.status(410).json({ error: 'Job Taken! This booking has already been claimed by another driver.' });
    }

    const updatedBooking = await db.booking.update({
      where: { id: bookingId },
      data: {
        driverId: userId,
        vehicleId: vehicle?.id || null,
        status: 'ACCEPTED',
        progress: 10,
        eta: 'Calculating route...'
      }
    });

    // Notify the Shipper that their load has been accepted
    await createNotification(
      booking.shipperId,
      'Driver Assigned 🎉',
      `Your cargo load offer from ${booking.origin} to ${booking.destination} has been claimed by a driver.`
    );
    return res.json(updatedBooking);
  } catch (error) {
    console.error('Driver claim execution failure:', error);
    return res.status(500).json({ error: 'Internal system error matching driver to booking.' });
  }
});

// POST: Submit driver rating performance values from Shipper context
router.post('/:id/rate-driver', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const bookingId = parseInt(req.params.id, 10);
  const { score } = req.body; // Expects a value between 1 and 5

  if (isNaN(bookingId) || !score || score < 1 || score > 5) {
    return res.status(400).json({ error: 'Invalid booking parameters or scoring bounds specified.' });
  }

  try {
    const booking = await db.booking.findUnique({ where: { id: bookingId } });
    if (!booking || booking.status !== 'COMPLETED') {
      return res.status(400).json({ error: 'Ratings can only be submitted for completed orders.' });
    }
    if (!booking.driverId) {
      return res.status(400).json({ error: 'No carrier/driver is bound to this booking instance.' });
    }

    // Retrieve target driver profile to recalculate dynamic rating average
    const targetDriver = await db.user.findUnique({ where: { id: booking.driverId } });
    if (!targetDriver) return res.status(444).json({ error: 'Driver profile not found.' });

    // For simplicity, we calculate an elegant shifting average update
    const nextRating = (targetDriver.rating + parseFloat(score)) / 2;

    await db.user.update({
      where: { id: booking.driverId },
      data: { rating: nextRating }
    });

    return res.json({ success: true, message: 'Driver rated successfully!', updatedRating: nextRating });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to record carrier rating parameter.' });
  }
});

// GET: Calculate and aggregate live financial analytics for the authenticated carrier/driver
router.get('/driver-earnings-stats', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const driverId = req.user!.id;

  if (req.user!.role !== 'DRIVER') {
    return res.status(403).json({ error: 'Access denied. Carrier parameters only.' });
  }

  try {
    // 1. Fetch the global configuration to get the live platform commission fee percent margin
    const config = await db.systemConfiguration.findUnique({
      where: { id: 'GLOBAL_CONFIG' }
    });
    const feeMultiplier = (config?.platformFeePercent || 10.0) / 100;

    // 2. Query all completed bookings assigned to this driver
    const completedJobs = await db.booking.findMany({
      where: {
        driverId: driverId,
        status: 'COMPLETED'
      }
    });

    // 3. Process calculations safely
    let totalGross = 0;
    completedJobs.forEach(job => {
      // Clean up string prices (e.g., "$1,200" -> 1200) to ensure accurate parsing
      const numericalPrice = parseFloat(job.price.replace(/[^0-9.]/g, '')) || 0;
      totalGross += numericalPrice;
    });

    const platformDeduction = totalGross * feeMultiplier;
    const netTakeHomeEarnings = totalGross - platformDeduction;
    const jobsCount = completedJobs.length;

    // Return the live processed financial matrix
    return res.json({
      totalEarnings: netTakeHomeEarnings,     // Net income after platform fee split
      jobsCompleted: jobsCount,               // Total completed manifest trips
      avgPayout: jobsCount > 0 ? (netTakeHomeEarnings / jobsCount) : 0,
      withdrawableBalance: netTakeHomeEarnings // Adjust this if you implement payouts
    });

  } catch (error) {
    console.error('Failed to parse carrier financial metrics:', error);
    return res.status(500).json({ error: 'Internal server error compiling earnings metrics ledger.' });
  }
});

export default router