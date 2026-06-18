import { Router, Response } from 'express';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';
import { db } from '../lib/db';

const router = Router();

/**
 * GET: Retrieve the driver's current wallet balance and payout configuration.
 */
router.get('/balance', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    let wallet = await db.wallet.findUnique({
      where: { userId: req.user!.id }
    });

    // Auto-provision a wallet if one doesn't exist for the driver
    if (!wallet) {
      wallet = await db.wallet.create({
        data: {
          userId: req.user!.id,
          currency: req.user!.role === 'DRIVER' ? 'KES' : 'USD', // Default to localized currency
          balance: 0
        }
      });
    }

    return res.json(wallet);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to retrieve wallet ledger.' });
  }
});

/**
 * POST: Request a withdrawal to the registered payout method (e.g., M-Pesa).
 */
router.post('/withdraw', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { amount } = req.body;
  const userId = req.user!.id;

  if (!amount || isNaN(amount) || amount <= 0) {
    return res.status(400).json({ error: 'Invalid withdrawal amount specified.' });
  }

  try {
    const wallet = await db.wallet.findUnique({ where: { userId } });

    if (!wallet || Number(wallet.balance) < amount) {
      return res.status(400).json({ error: 'Insufficient funds in wallet for this transaction.' });
    }

    // Atomic transaction: Decrease balance and log the audit trail
    const result = await db.$transaction([
      db.wallet.update({
        where: { userId },
        data: { balance: { decrement: amount } }
      }),
      db.auditTrail.create({
        data: {
          adminId: 'SYSTEM',
          action: 'WITHDRAWAL',
          targetId: userId,
          details: `Withdrawal of ${amount} ${wallet.currency} requested via ${wallet.payoutMethod || 'unspecified method'}`
        }
      })
    ]);

    return res.json({ success: true, newBalance: result[0].balance });
  } catch (error) {
    return res.status(500).json({ error: 'Withdrawal processing failed. Please contact support.' });
  }
});

export default router;