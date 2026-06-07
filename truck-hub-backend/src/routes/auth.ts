import { Router, Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { parsePhoneNumberFromString } from 'libphonenumber-js'
import { db } from '../lib/db'

const router = Router()
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-super-secret-key'

// User Account Login Verification endpoint
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { phone, password } = req.body
    if (!phone || !password) return res.status(400).json({ error: 'Missing credentials.' })

    const phoneNumber = parsePhoneNumberFromString(phone, 'KE')
    const formattedPhone = phoneNumber ? phoneNumber.number : phone

    const user = await db.user.findUnique({ where: { phone: formattedPhone } })
    if (!user) return res.status(401).json({ error: 'Invalid phone number or password.' })

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) return res.status(401).json({ error: 'Invalid phone number or password.' })

    const token = jwt.sign({ id: user.id, role: user.role, phone: user.phone }, JWT_SECRET, { expiresIn: '7d' })

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/'
    })

    const { password: _, ...safeUser } = user
    return res.json({ user: { ...safeUser, role: safeUser.role.toLowerCase() }, token })
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error during authentication.' })
  }
})

// New User Registration account configuration creation endpoint
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, phone, email, password, role } = req.body
    if (!name || !phone || !email || !password || !role) {
      return res.status(400).json({ error: 'Missing parameters.' })
    }

    const phoneNumber = parsePhoneNumberFromString(phone, 'KE')
    const formattedPhone = phoneNumber ? phoneNumber.number : phone

    const existingUser = await db.user.findFirst({
      where: { OR: [{ phone: formattedPhone }, { email }] }
    })
    if (existingUser) {
      return res.status(409).json({ error: 'Account with phone or email already exists.' })
    }

    const hashedPassword = await bcrypt.hash(password, 12)
    const newUser = await db.user.create({
      data: {
        name,
        phone: formattedPhone,
        email,
        password: hashedPassword,
        role: role.toUpperCase() === 'DRIVER' ? 'DRIVER' : 'SHIPPER'
      }
    })

    if (newUser.role === 'DRIVER') {
      await db.vehicle.create({
        data: {
          driverId: newUser.id,
          type: 'Box Truck 5-Ton',
          plate: 'K' + Math.random().toString(36).substring(2, 7).toUpperCase(),
          capacity: '5000kg'
        }
      })
    }

    const token = jwt.sign({ id: newUser.id, role: newUser.role, phone: newUser.phone }, JWT_SECRET, { expiresIn: '7d' })

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/'
    })

    const { password: _, ...safeUser } = newUser
    return res.status(201).json({ user: { ...safeUser, role: safeUser.role.toLowerCase() }, token })
  } catch (error) {
    // This will print the exact Prisma database or code crash reason in your backend terminal console!
    console.error("CRITICAL REGISTRATION CRASH:", error);
    return res.status(500).json({ 
      error: 'Registration execution failed.', 
      details: error instanceof Error ? error.message : String(error) 
    })
  }
})

export default router