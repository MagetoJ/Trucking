import { Router } from 'express'
import { db } from '../lib/db'
import { superAdminAuth } from '../middleware/superAdmin'

const router = Router();
router.use(superAdminAuth); // All routes below require SUPER_ADMIN

// ── USER MANAGEMENT ──────────────────────────────────────

// Get all users with filters and pagination
router.get('/users', async (req, res) => {
  try {
    const { role, verified, page, limit } = req.query
    const where = {
      ...(role && { role: (role as string).toUpperCase() as any }),
      ...(verified !== undefined && { verified: verified === 'true' }),
    }

    // If pagination is requested, return the object with metadata
    if (page || limit) {
      const p = parseInt(page as string || '1')
      const l = parseInt(limit as string || '20')
      const users = await db.user.findMany({
        where,
        select: {
          id: true, name: true, email: true, phone: true,
          role: true, verified: true, rating: true, createdAt: true,
          _count: { select: { shipments: true, trips: true, vehicles: true } }
        },
        skip: (p - 1) * l,
        take: l,
        orderBy: { createdAt: 'desc' }
      })
      const total = await db.user.count({ where })
      return res.json({ users, total, page: p })
    }

    // Default: return array for backward compatibility with existing dashboard
    const users = await db.user.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    })
    return res.json(users)
  } catch (e: any) {
    res.status(500).json({ error: e.message })
  }
})

// Legacy PUT route for compatibility with AdministrativeOversightCenter toggleVerification
router.put('/users/:id', async (req, res) => {
  try {
    const { verified } = req.body
    const updatedUser = await db.user.update({
      where: { id: req.params.id },
      data: { verified: Boolean(verified) }
    })
    return res.json(updatedUser)
  } catch (e: any) {
    return res.status(500).json({ error: e.message })
  }
})

// Verify a user
router.patch('/users/:id/verify', async (req, res) => {
  try {
    const user = await db.user.update({
      where: { id: req.params.id },
      data: { verified: true }
    })
    res.json({ message: 'User verified', user })
  } catch (e: any) {
    res.status(500).json({ error: e.message })
  }
})

// Suspend a user (set verified to false)
router.patch('/users/:id/suspend', async (req, res) => {
  try {
    const user = await db.user.update({
      where: { id: req.params.id },
      data: { verified: false }
    })
    res.json({ message: 'User suspended', user })
  } catch (e: any) {
    res.status(500).json({ error: e.message })
  }
})

// DELETE: Full account wipe out option
router.delete('/users/:id', async (req, res) => {
  try {
    await db.user.delete({ where: { id: req.params.id } })
    return res.json({ message: 'User account successfully purged from the platform.' })
  } catch (e: any) {
    return res.status(500).json({ error: e.message })
  }
})

// ── BOOKING OVERSIGHT ────────────────────────────────────

// Get all bookings
router.get('/bookings', async (req, res) => {
  try {
    const { status, page = '1', limit = '20' } = req.query
    const bookings = await db.booking.findMany({
      where: { ...(status && { status: (status as string).toUpperCase() as any }) },
      include: {
        shipper: { select: { name: true, email: true, phone: true } },
        driver:  { select: { name: true, email: true, phone: true } },
        vehicle: { select: { type: true, plate: true } }
      },
      skip: (parseInt(page as string) - 1) * parseInt(limit as string),
      take: parseInt(limit as string),
      orderBy: { createdAt: 'desc' }
    })
    const total = await db.booking.count()
    res.json({ bookings, total })
  } catch (e: any) {
    res.status(500).json({ error: e.message })
  }
})

// Cancel a booking
router.patch('/bookings/:id/cancel', async (req, res) => {
  try {
    const booking = await db.booking.update({
      where: { id: parseInt(req.params.id) },
      data: { status: 'CANCELLED' }
    })
    res.json({ message: 'Booking cancelled', booking })
  } catch (e: any) {
    res.status(500).json({ error: e.message })
  }
})

// ── VEHICLE MANAGEMENT ───────────────────────────────────

// Get all vehicles
router.get('/vehicles', async (req, res) => {
  try {
    const vehicles = await db.vehicle.findMany({
      include: {
        driver: { select: { name: true, email: true, phone: true, verified: true } },
        _count: { select: { bookings: true } }
      },
      orderBy: { createdAt: 'desc' }
    })
    res.json({ vehicles })
  } catch (e: any) {
    res.status(500).json({ error: e.message })
  }
})

// Approve vehicle (set status ACTIVE)
router.patch('/vehicles/:id/approve', async (req, res) => {
  try {
    const vehicle = await db.vehicle.update({
      where: { id: req.params.id },
      data: { status: 'ACTIVE' }
    })
    res.json({ message: 'Vehicle approved', vehicle })
  } catch (e: any) {
    res.status(500).json({ error: e.message })
  }
})

// Reject vehicle
router.patch('/vehicles/:id/reject', async (req, res) => {
  try {
    const vehicle = await db.vehicle.update({
      where: { id: req.params.id },
      data: { status: 'REJECTED' }
    })
    res.json({ message: 'Vehicle rejected', vehicle })
  } catch (e: any) {
    res.status(500).json({ error: e.message })
  }
})

// ── ANALYTICS ────────────────────────────────────────────

router.get('/analytics', async (req, res) => {
  try {
    const [
      totalUsers, totalDrivers, totalShippers,
      totalBookings, completedBookings, cancelledBookings,
      pendingBookings, totalVehicles, recentBookings
    ] = await Promise.all([
      db.user.count(),
      db.user.count({ where: { role: 'DRIVER' } }),
      db.user.count({ where: { role: 'SHIPPER' } }),
      db.booking.count(),
      db.booking.count({ where: { status: 'COMPLETED' } }),
      db.booking.count({ where: { status: 'CANCELLED' } }),
      db.booking.count({ where: { status: 'PENDING' } }),
      db.vehicle.count(),
      db.booking.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          shipper: { select: { name: true } },
          driver:  { select: { name: true } }
        }
      })
    ])

    res.json({
      users:    { total: totalUsers, drivers: totalDrivers, shippers: totalShippers },
      bookings: { total: totalBookings, completed: completedBookings, cancelled: cancelledBookings, pending: pendingBookings },
      vehicles: { total: totalVehicles },
      recentBookings
    })
  } catch (e: any) {
    res.status(500).json({ error: e.message })
  }
})

// ── DRIVER VETTING ───────────────────────────────────────

// GET: Fetch all driver document configurations pending supervisor inspection
router.get('/documents/review', async (req, res) => {
  try {
    const docs = await db.driverDocument.findMany({
      include: {
        driver: { select: { id: true, name: true, phone: true, email: true } }
      },
      orderBy: { insuranceExpiry: 'asc' }
    });
    return res.json(docs);
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
});

// PATCH: Approve or Reject a driver's legal credentials packet
router.patch('/documents/:id/status', async (req, res) => {
  const { status } = req.body; // APPROVED or REJECTED
  try {
    const updatedDoc = await db.driverDocument.update({
      where: { id: req.params.id },
      data: { status }
    });

    // Automatically verify the user profile on the platform network if documents match approval parameters
    if (status === 'APPROVED') {
      await db.user.update({
        where: { id: updatedDoc.driverId },
        data: { verified: true }
      });
    }

    return res.json({ message: 'Vetting status updated successfully.', updatedDoc });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
});

export default router;