import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-super-secret-key'

// Utility function to pull user data from authorization contexts
async function verifyAuth(request: NextRequest) {
  const authHeader = request.headers.get('Authorization')
  const cookieToken = request.cookies.get('token')?.value
  const token = authHeader?.split(' ')[1] || cookieToken

  if (!token) return null
  try {
    return jwt.verify(token, JWT_SECRET) as { id: string; role: string }
  } catch {
    return null
  }
}

export async function GET(request: NextRequest) {
  const authUser = await verifyAuth(request)
  if (!authUser) {
    return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const role = searchParams.get('role') || authUser.role.toLowerCase()
  const userId = searchParams.get('userId') || authUser.id

  try {
    let bookings;

    if (role === 'shipper') {
      bookings = await db.booking.findMany({
        where: { shipperId: userId },
        orderBy: { createdAt: 'desc' }
      })
    } else {
      // Drivers see their own claims or any open "PENDING" cargo waiting for service match
      bookings = await db.booking.findMany({
        where: {
          OR: [
            { driverId: userId },
            { status: 'PENDING' }
          ]
        },
        orderBy: { createdAt: 'desc' }
      })
    }

    return NextResponse.json(bookings)
  } catch (error) {
    return NextResponse.json({ error: 'Database fetch failed' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const authUser = await verifyAuth(request)
  if (!authUser) {
    return NextResponse.json({ error: 'Session identification required' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { origin, destination, cargo, weight, price } = body

    if (!origin || !destination) {
      return NextResponse.json({ error: 'Missing required routing components' }, { status: 400 })
    }

    const newBooking = await db.booking.create({
      data: {
        shipperId: authUser.id,
        origin,
        destination,
        cargo: cargo || 'General Goods',
        weight: weight ? `${weight} kg` : 'N/A',
        price: price ? `$${price}` : 'Negotiable',
        status: 'PENDING',
        date: new Date().toISOString().split('T')[0]
      }
    })

    return NextResponse.json(newBooking, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to record payload booking' }, { status: 500 })
  }
}