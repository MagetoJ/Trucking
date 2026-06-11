"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const db_1 = require("../lib/db");
const router = (0, express_1.Router)();
// Enforce strict administrative clearance
function requireSuperAdmin(req, res, next) {
    if (req.user?.role !== 'SUPER_ADMIN') {
        return res.status(403).json({ error: 'Access Denied. Administrative oversight clearance required.' });
    }
    next();
}
// Helper for security auditing
async function logAdminAction(adminId, action, targetId, details) {
    try {
        await db_1.db.auditTrail.create({
            data: { adminId, action, targetId, details }
        });
    }
    catch (err) {
        console.error('Failed to write to audit log:', err);
    }
}
// Helper to parse string prices (e.g., "$450") to numbers
const parsePrice = (price) => parseFloat(price.replace(/[^0-9.]/g, '')) || 0;
// GET: User Management Summary with Revenue Metrics
router.get('/users-summary', auth_1.requireAuth, requireSuperAdmin, async (req, res) => {
    try {
        const users = await db_1.db.user.findMany({
            include: {
                shipments: { select: { price: true, status: true } },
                trips: { select: { price: true, status: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        const formattedUsers = users.map(user => {
            const shipmentsRevenue = user.shipments
                .filter(s => s.status === 'COMPLETED')
                .reduce((sum, s) => sum + parsePrice(s.price), 0);
            const tripsRevenue = user.trips
                .filter(t => t.status === 'COMPLETED')
                .reduce((sum, t) => sum + parsePrice(t.price), 0);
            return {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role.toLowerCase(),
                verified: user.verified,
                createdAt: user.createdAt,
                revenueGenerated: user.role === 'SHIPPER' ? shipmentsRevenue : tripsRevenue
            };
        });
        return res.json(formattedUsers);
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to fetch user management summary.' });
    }
});
// GET: System-wide Configuration Settings
router.get('/config', auth_1.requireAuth, requireSuperAdmin, async (req, res) => {
    try {
        let config = await db_1.db.systemConfiguration.findUnique({ where: { id: 'GLOBAL_CONFIG' } });
        if (!config) {
            config = await db_1.db.systemConfiguration.create({ data: { id: 'GLOBAL_CONFIG' } });
        }
        return res.json(config);
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to retrieve system configuration.' });
    }
});
// POST: Update Platform Fees or Base Rates
router.post('/config', auth_1.requireAuth, requireSuperAdmin, async (req, res) => {
    const { platformFeePercent, basePricePerKm } = req.body;
    try {
        const updated = await db_1.db.systemConfiguration.update({
            where: { id: 'GLOBAL_CONFIG' },
            data: {
                platformFeePercent: platformFeePercent !== undefined ? parseFloat(platformFeePercent) : undefined,
                basePricePerKm: basePricePerKm !== undefined ? basePricePerKm : undefined
            }
        });
        await logAdminAction(req.user.id, 'UPDATE_CONFIG', 'GLOBAL_CONFIG', `Platform fee adjusted to ${platformFeePercent}%`);
        return res.json(updated);
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to update system parameters.' });
    }
});
// GET: Retrieve all audit logs
router.get('/audit-logs', auth_1.requireAuth, requireSuperAdmin, async (req, res) => {
    try {
        const auditLogs = await db_1.db.auditTrail.findMany({
            orderBy: { timestamp: 'desc' },
            take: 50, // Limit to recent logs for performance
        });
        return res.json(auditLogs);
    }
    catch (error) {
        console.error('Failed to retrieve audit logs:', error);
        return res.status(500).json({ error: 'Failed to fetch audit trail records.' });
    }
});
// GET: Complete Operational Oversight Statistics Matrix
router.get('/metrics', auth_1.requireAuth, requireSuperAdmin, async (req, res) => {
    try {
        // 1. Compute Global User Distribution Metrics
        const userGroups = await db_1.db.user.groupBy({
            by: ['role'],
            _count: { _all: true },
        });
        const metrics = {
            shippersCount: userGroups.find(g => g.role === 'SHIPPER')?._count._all || 0,
            driversCount: userGroups.find(g => g.role === 'DRIVER')?._count._all || 0,
            unverifiedUsers: await db_1.db.user.count({ where: { verified: false } }),
        };
        // 2. Compute Global Load & Workflow Allocations
        const activeLoads = await db_1.db.booking.count({ where: { status: 'PENDING' } });
        const fulfilledLoads = await db_1.db.booking.count({ where: { status: 'COMPLETED' } });
        const inTransitLoads = await db_1.db.booking.count({ where: { status: 'ACCEPTED' } });
        // 3. Compute Financial System Gross Volume (Parsing dynamic string values securely)
        const bookingsData = await db_1.db.booking.findMany({
            where: { status: 'COMPLETED' },
            select: { price: true }
        });
        const totalRevenue = bookingsData.reduce((acc, current) => {
            // Stripping potential raw dollar signs or metric formatting extensions from the string fields
            const numericPrice = parseFloat(current.price.replace(/[^0-9.]/g, '')) || 0;
            return acc + numericPrice;
        }, 0);
        // 4. Fetch the Global Operational Ledger (combining drivers and shippers details under structural contexts)
        const recentBookings = await db_1.db.booking.findMany({
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
    }
    catch (error) {
        console.error('Oversight data processing crash:', error);
        return res.status(500).json({ error: 'Failed to aggregate systemic overview statistics.' });
    }
});
// PATCH: Manually override or update transaction escrow statuses (Disputes/Refunds)
router.patch('/escrow/:id/status', auth_1.requireAuth, requireSuperAdmin, async (req, res) => {
    const { status } = req.body; // HELD, RELEASED, DISPUTED, REFUNDED
    try {
        const transaction = await db_1.db.escrowTransaction.update({
            where: { id: req.params.id },
            data: {
                status,
                ...(status === 'RELEASED' && { releasedAt: new Date() })
            }
        });
        await db_1.db.auditTrail.create({
            data: {
                adminId: req.user.id,
                action: 'UPDATE_ESCROW_STATUS',
                targetId: transaction.id,
                details: `Escrow forced to status: ${status}`
            }
        });
        return res.json(transaction);
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
});
exports.default = router;
