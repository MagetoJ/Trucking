import { Router, Response } from 'express';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';
import { db } from '../lib/db';

const router = Router();

// Enforce strict administrative clearance
function requireSuperAdmin(req: AuthenticatedRequest, res: Response, next: any) {
  if (req.user?.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ error: 'Access Denied. Administrative oversight clearance required.' });
  }
  next();
}

// GET: Complete Operational Oversight Statistics Matrix
router.get('/metrics', requireAuth, requireSuperAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    // 1. Compute Global User Distribution Metrics
    const userGroups = await db.user.groupBy({
      by: ['role'],
      _count: { _all: true },
    });

    const metrics = {
      shippersCount: userGroups.find(g => g.role === 'SHIPPER')?._count._all || 0,
      driversCount: userGroups.find(g => g.role === 'DRIVER')?._count._all || 0,
      unverifiedUsers: await db.user.count({ where: { verified: false } }),
    };

    // 2. Compute Global Load & Workflow Allocations
    const activeLoads = await db.booking.count({ where: { status: 'PENDING' } });
    const fulfilledLoads = await db.booking.count({ where: { status: 'COMPLETED' } });
    const inTransitLoads = await db.booking.count({ where: { status: 'ACCEPTED' } });

    // 3. Compute Financial System Gross Volume (Parsing dynamic string values securely)
    const bookingsData = await db.booking.findMany({
      where: { status: 'COMPLETED' },
      select: { price: true }
    });

    const totalRevenue = bookingsData.reduce((acc, current) => {
      // Stripping potential raw dollar signs or metric formatting extensions from the string fields
      const numericPrice = parseFloat(current.price.replace(/[^0-9.]/g, '')) || 0;
      return acc + numericPrice;
    }, 0);

    // 4. Fetch the Global Operational Ledger (combining drivers and shippers details under structural contexts)
    const recentBookings = await db.booking.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        shipper: { select: { name: true, phone: true } },
        driver: { select: { name: true, phone: true } }
      }
    });

    return res.json({
      metrics,
      workloads: { activeLoads, inTransitLoads, fulfilledLoads },
      financials: { totalRevenue },
      recentBookings
    });
  } catch (error) {
    console.error('Oversight data processing crash:', error);
    return res.status(500).json({ error: 'Failed to aggregate systemic overview statistics.' });
  }
});

export default router;