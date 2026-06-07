import { Router, Response } from 'express';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';
import { db } from '../lib/db';

const router = Router();

// Middleware checking if the requesting account is an authenticated Super Admin
function requireSuperAdmin(req: AuthenticatedRequest, res: Response, next: any) {
  if (req.user?.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ error: 'Access Denied. Super Admin clearance required.' });
  }
  next();
}

// GET: Super admins can see all registered platform profiles (Drivers & Shippers combined)
router.get('/users', requireAuth, requireSuperAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const users = await db.user.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return res.json(users);
  } catch (error) {
    return res.status(500).json({ error: 'Database records retrieval failed.' });
  }
});

// PUT: Admin approval control to toggle user verification status
router.put('/users/:id', requireAuth, requireSuperAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { verified } = req.body;
    const updatedUser = await db.user.update({
      where: { id: req.params.id },
      data: { verified: Boolean(verified) }
    });
    return res.json(updatedUser);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update target account visibility state.' });
  }
});

// DELETE: Full account wipe out option
router.delete('/users/:id', requireAuth, requireSuperAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    await db.user.delete({ where: { id: req.params.id } });
    return res.json({ message: 'User account successfully purged from the platform.' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to drop specified user profile.' });
  }
});

export default router;