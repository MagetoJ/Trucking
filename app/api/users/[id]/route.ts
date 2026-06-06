import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // TODO: Implement actual user profile fetching from database
    // TODO: Include user reviews and trip history

    const mockUserProfiles: Record<string, any> = {
      '1': {
        id: '1',
        name: 'John Mwangi',
        phone: '+254712345678',
        email: 'john@example.com',
        role: 'shipper',
        rating: 4.8,
        verified: true,
        location: 'Nairobi, Kenya',
        joinDate: 'January 2023',
        bio: 'Logistics entrepreneur with 10+ years of experience.',
        totalShipments: 245,
        completionRate: 98.5,
        reviews: [
          { author: 'Sarah K.', rating: 5, comment: 'Excellent service' },
        ],
      },
      '2': {
        id: '2',
        name: 'Sarah Kipchoge',
        phone: '+254712345679',
        email: 'sarah@example.com',
        role: 'driver',
        rating: 4.9,
        verified: true,
        location: 'Mombasa, Kenya',
        joinDate: 'March 2022',
        bio: 'Professional truck driver with 15 years of experience.',
        totalTrips: 487,
        completionRate: 99.8,
        reviews: [
          { author: 'John M.', rating: 5, comment: 'Very trustworthy' },
        ],
      },
    }

    const user = mockUserProfiles[id]

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(user)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch user profile' },
      { status: 500 }
    )
  }
}
