import { Router, Response } from 'express'
import { requireAuth, AuthenticatedRequest } from '../middleware/auth'
import { db } from '../lib/db'

const router = Router()

// Get assigned or available loads matching user criteria context
router.get('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id
  const role = (req.query.role as string) || req.user!.role.toLowerCase()

  try {
    let bookings
    if (role === 'shipper') {
      bookings = await db.booking.findMany({
        where: { shipperId: userId },
        orderBy: { createdAt: 'desc' }
      })
    } else {
      bookings = await db.booking.findMany({
        where: {
          OR: [
            { driverId: userId },
            { status: 'PENDING' }
          ]
        },
        orderBy: { createdAt: 'desc' }
      })
    }
    return res.json(bookings)
  } catch (error) {
    return res.status(500).json({ error: 'Database records streaming failed.' })
  }
})

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

// Driver claims/accepts an available pending load
router.post('/:id/accept', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const bookingId = req.params.id; // bookingId is already a string from req.params
  const userId = req.user!.id;
  const userRole = req.user!.role;

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
      return res.status(410).json({ error: 'Load unavailable. This booking has already been claimed by another driver.' });
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

    return res.json(updatedBooking);
  } catch (error) {
    console.error('Driver claim execution failure:', error);
    return res.status(500).json({ error: 'Internal system error matching driver to booking.' });
  }
});

export default router