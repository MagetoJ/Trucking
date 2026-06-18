import { Router, Response } from 'express';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';
import { db } from '../lib/db';

const router = Router();

// ==========================================
// 1. DELIVERY HISTORY VAULT API
// ==========================================
router.get('/:shipperId/history', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Security: Ensure users can only access their own history
    if (req.user!.id !== req.params.shipperId && req.user!.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: "Access denied to history vault." });
    }

    const history = await db.booking.findMany({
      where: { 
        shipperId: req.params.shipperId,
        status: 'COMPLETED' 
      },
      orderBy: { updatedAt: 'desc' },
      include: { driver: { select: { name: true, phone: true } } }
    });
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch history vault" });
  }
});

// ==========================================
// 2. PREFERRED DRIVER NETWORK APIs
// ==========================================
router.get('/:shipperId/preferred-drivers', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (req.user!.id !== req.params.shipperId && req.user!.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: "Access denied." });
    }

    const drivers = await db.preferredDriver.findMany({
      where: { shipperId: req.params.shipperId },
      include: { 
        driver: { select: { id: true, name: true, phone: true, rating: true, vehicles: true } } 
      }
    });
    res.json(drivers.map(d => d.driver)); 
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch preferred drivers" });
  }
});

router.post('/preferred-drivers/add', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { shipperId, driverId } = req.body;
  if (req.user!.id !== shipperId) return res.status(403).json({ error: "Unauthorized." });

  try {
    const newFavorite = await db.preferredDriver.create({
      data: { shipperId, driverId }
    });
    res.json({ message: "Driver added to favorites!", newFavorite });
  } catch (error) {
    res.status(400).json({ error: "Driver already favorited or invalid IDs" });
  }
});

export default router;