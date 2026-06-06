import { NextRequest, NextResponse } from 'next/server'

// In-memory mock user database for demonstration
// In a production app, this would be replaced with a real database (PostgreSQL, MongoDB, etc.)
export const mockUsers: Record<string, any> = {
  '+254712345678': {
    id: '1',
    name: 'John Mwangi',
    phone: '+254712345678',
    email: 'john@example.com',
    role: 'shipper',
    rating: 4.8,
    verified: true,
  },
  '+254712345679': {
    id: '2',
    name: 'Sarah Kipchoge',
    phone: '+254712345679',
    email: 'sarah@example.com',
    role: 'driver',
    rating: 4.9,
    verified: true,
  },
}

export async function POST(request: NextRequest) {
  try {
    const { phone, password } = await request.json()

    const user = mockUsers[phone]

    // Simulation of a database lookup and password check
    // For this demo, all users have the same password: 'password'
    if (!user || password !== 'password') {
      return NextResponse.json(
        { error: 'Invalid phone number or password' },
        { status: 401 }
      )
    }

    // Generate mock JWT token
    const token = Buffer.from(JSON.stringify(user)).toString('base64')

    return NextResponse.json({ user, token })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
