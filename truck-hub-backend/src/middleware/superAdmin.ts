import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string
    role: string
    phone?: string
    email?: string
  }
}

export const superAdminAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization
  const token = authHeader && authHeader.split(' ')[1]
  
  if (!token) return res.status(401).json({ error: 'No token provided' })

  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'fallback-super-secret-key')
    if (decoded.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: 'Super Admin access required' })
    }
    req.user = decoded
    next()
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}