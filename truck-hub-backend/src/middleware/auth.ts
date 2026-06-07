import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-super-secret-key'

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string
    role: string
    phone: string
  }
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  // Read token value out of incoming headers or parsed request cookie pools
  const authHeader = req.headers.authorization
  const token = authHeader?.split(' ')[1] || req.cookies?.token

  if (!token) {
    return res.status(401).json({ error: 'Authorization verification token context required.' })
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any
    req.user = { id: decoded.id, role: decoded.role, phone: decoded.phone }
    next()
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired authorization token profile.' })
  }
}