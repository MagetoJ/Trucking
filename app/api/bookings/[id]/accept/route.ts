import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-super-secret-key'

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const authHeader = request.headers.get('Authorization')
  const token = authHeader?.split(' ')[1]
  
  if (!token) return NextResponse.json({ error: 'Missing authorization' }, { status: 401 })

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; role: string }
    if (decoded.role !== 'DRIVER') {
      return NextResponse.json({ error: 'Only drivers can accept shipments' }, { status: 403 })
    }

    // Identify driver vehicle profiles
    const vehicle = await db.vehicle.findFirst({
      where: { driverId: decoded.id }
    })

    // Transaction modification ensures an asset isn't double booked
    const booking = await db.booking.findUnique({ where: { id: params.id } })
    
    if (!booking || booking.status !== 'PENDING') {
      return NextResponse.json({ error: 'Load unavailable or already taken' }, { status: 410 })
    }

    const updatedBooking = await db.booking.update({
      where: { id: params.id },
      data: {
        driverId: decoded.id,
        vehicleId: vehicle?.id || null,
        status: 'ACCEPTED',
        progress: 10,
        eta: 'Calculating...'
      }
    })

    return NextResponse.json(updatedBooking)
  } catch (err) {
    return NextResponse.json({ error: 'Invalid token or internal error' }, { status: 500 })
  }
}