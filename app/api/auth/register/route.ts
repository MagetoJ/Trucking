import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { parsePhoneNumberFromString } from 'libphonenumber-js'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-super-secret-key'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, phone, email, password, role } = body

    if (!name || !phone || !email || !password || !role) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
    }

    const phoneNumber = parsePhoneNumberFromString(phone, 'KE')
    const formattedPhone = phoneNumber ? phoneNumber.number : phone

    // Enforce business unique-constraints
    const existingUser = await db.user.findFirst({
      where: {
        OR: [ { phone: formattedPhone }, { email: email } ]
      }
    })

    if (existingUser) {
      return NextResponse.json({ error: 'Account with phone or email already exists' }, { status: 409 })
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

    // If role is a driver, set up an initial blank placeholder vehicle instance
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

    const { password: _, ...safeUser } = newUser

    // Generate token so user is authenticated immediately
    const token = jwt.sign(
      { id: newUser.id, role: newUser.role, phone: newUser.phone },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    const response = NextResponse.json({
      user: {
        ...safeUser,
        role: safeUser.role.toLowerCase()
      },
      token,
      msg: 'Verification pending'
    }, { status: 201 })

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7,
      path: '/'
    })

    return response

  } catch (error) {
    console.error('Registration API crash:', error)
    return NextResponse.json({ error: 'Failed execution' }, { status: 500 })
  }
}