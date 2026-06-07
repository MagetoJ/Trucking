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

export default router