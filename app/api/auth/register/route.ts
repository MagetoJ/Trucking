import { NextRequest, NextResponse } from 'next/server'

// Mock storage for bookings/trips
let mockBookings: any[] = [
  {
    id: 'BK-101',
    shipperId: '1',
    origin: 'Nairobi',
    destination: 'Mombasa',
    cargo: 'Electronics',
    weight: '5 Tons',
    price: '$450',
    status: 'In Transit',
    date: '2024-05-20',
    driverId: '2',
  },
  {
    id: 'BK-102',
    shipperId: '1',
    origin: 'Nakuru',
    destination: 'Nairobi',
    cargo: 'Agricultural Produce',
    weight: '2 Tons',
    price: '$180',
    status: 'Pending',
    date: '2024-05-22',
  }
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const role = searchParams.get('role')
  const userId = searchParams.get('userId')

  let filtered = [...mockBookings]

  // Filter based on user role and ID
  if (role === 'shipper' && userId) {
    filtered = filtered.filter(b => b.shipperId === userId)
  } else if (role === 'driver' && userId) {
    // Drivers see their own active trips or available 'Pending' loads
    filtered = filtered.filter(b => b.driverId === userId || b.status === 'Pending')
  }

  return NextResponse.json(filtered)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { shipperId, origin, destination, cargo, weight, price } = body

    if (!shipperId || !origin || !destination) {
      return NextResponse.json({ error: 'Missing required shipment details' }, { status: 400 })
    }

    const newBooking = {
      id: `BK-${Math.floor(Math.random() * 900) + 100}`,
      shipperId,
      origin,
      destination,
      cargo: cargo || 'General Goods',
      weight: weight || 'N/A',
      price: price || 'Negotiable',
      status: 'Pending',
      date: new Date().toISOString().split('T')[0],
    }

    mockBookings.push(newBooking)

    return NextResponse.json(newBooking, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    )
  }
}