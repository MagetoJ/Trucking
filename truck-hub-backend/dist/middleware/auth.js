"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-super-secret-key';
function requireAuth(req, res, next) {
    // Read token value out of incoming headers or parsed request cookie pools
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1] || req.cookies?.token;
    if (!token) {
        return res.status(401).json({ error: 'Authorization verification token context required.' });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        req.user = { id: decoded.id, role: decoded.role, phone: decoded.phone };
        next();
    }
    catch (err) {
        return res.status(401).json({ error: 'Invalid or expired authorization token profile.' });
    }
}
