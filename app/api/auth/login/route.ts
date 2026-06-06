import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { parsePhoneNumberFromString } from 'libphonenumber-js'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-super-secret-key'

export async function POST(request: NextRequest) {
  try {
    const { phone, password } = await request.json()

    if (!phone || !password) {
      return NextResponse.json({ error: 'Missing credentials' }, { status: 400 })
    }

    // Standardize phone format (e.g., handles +254 inputs seamlessly)
    const phoneNumber = parsePhoneNumberFromString(phone, 'KE')
    const formattedPhone = phoneNumber ? phoneNumber.number : phone

    const user = await db.user.findUnique({
      where: { phone: formattedPhone }
    })

    if (!user) {
      return NextResponse.json({ error: 'Invalid phone number or password' }, { status: 401 })
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password)
    if (!isPasswordMatch) {
      return NextResponse.json({ error: 'Invalid phone number or password' }, { status: 401 })
    }

    // Sign payload
    const token = jwt.sign(
      { id: user.id, role: user.role, phone: user.phone },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    // Mask sensitive structural values out of backend response
    const { password: _, ...safeUser } = user

    const response = NextResponse.json({
      user: {
        ...safeUser,
        role: safeUser.role.toLowerCase() // Align backend casing with Zustand store validation expectations
      },
      token
    })

    // Set secure HttpOnly cookies for Server-Component authentication layers later
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7,
      path: '/'
    })

    return response
  } catch (error) {
    console.error('Authentication backend error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}