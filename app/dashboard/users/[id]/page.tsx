'use client'

import { Button } from '@/components/ui/button'
import { Star, Shield, Phone, Mail, MapPin, Calendar, TrendingUp, MessageCircle } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

// Mock user data
const USERS_DATA: Record<string, any> = {
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
    bio: 'Logistics entrepreneur with 10+ years of experience in freight management.',
    totalShipments: 245,
    completionRate: 98.5,
    avgDeliveryTime: '2.3 days',
    totalSpent: '$45,200',
    vehicles: [
      { type: '20ft Container', year: 2020, status: 'Active' },
    ],
    reviews: [
      { author: 'Sarah K.', rating: 5, comment: 'Excellent service, very professional.' },
      { author: 'Mike O.', rating: 4.5, comment: 'Great communication and on-time delivery.' },
    ]
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
    bio: 'Professional truck driver with 15 years of experience. Insured and reliable.',
    totalTrips: 487,
    completionRate: 99.8,
    avgDeliveryTime: '2.1 days',
    totalEarned: '$67,300',
    vehicles: [
      { type: '32-Ton Truck', year: 2019, status: 'Active' },
      { type: 'Pickup Truck', year: 2021, status: 'Standby' }
    ],
    reviews: [
      { author: 'John M.', rating: 5, comment: 'Very trustworthy and punctual driver.' },
      { author: 'Lucy N.', rating: 5, comment: 'Best driver on the platform!' },
    ]
  }
}

export default function UserProfilePage() {
  const params = useParams()
  const userId = params.id as string
  const user = USERS_DATA[userId]

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-foreground font-medium mb-4">User not found</p>
        <Link href="/dashboard/users">
          <Button>Back to Users</Button>
        </Link>
      </div>
    )
  }

  const isDriver = user.role === 'driver'

  return (
    <div className="space-y-6">
      {/* Header */}
      <Link href="/dashboard/users" className="text-accent hover:underline text-sm">
        ← Back to Users
      </Link>

      {/* Profile Card */}
      <div className="bg-card border border-border rounded-lg p-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-4">
            <div className="w-32 h-32 rounded-full bg-accent/20 flex items-center justify-center text-accent text-5xl font-bold">
              {user.name.charAt(0)}
            </div>
            <Button className="bg-accent hover:bg-accent/90 text-primary font-bold">
              <MessageCircle className="w-4 h-4 mr-2" />
              Contact
            </Button>
          </div>

          {/* Profile Info */}
          <div className="flex-1">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-4xl font-bold text-foreground">{user.name}</h1>
                <p className="text-lg text-accent capitalize font-semibold mt-1">
                  {isDriver ? '🚛 Driver' : '📦 Shipper'}
                </p>
              </div>
              {user.verified && (
                <div className="flex items-center gap-2 bg-accent/10 px-3 py-1 rounded-lg">
                  <Shield className="w-5 h-5 text-accent" />
                  <span className="text-sm font-semibold text-accent">Verified</span>
                </div>
              )}
            </div>

            {/* Rating */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-6 h-6 ${
                      i < Math.floor(user.rating)
                        ? 'fill-accent text-accent'
                        : 'text-muted-foreground'
                    }`}
                  />
                ))}
              </div>
              <span className="text-2xl font-bold text-foreground">{user.rating}</span>
              <span className="text-muted-foreground">(127 reviews)</span>
            </div>

            {/* Bio */}
            <p className="text-muted-foreground leading-relaxed mb-4">{user.bio}</p>

            {/* Contact Info */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-accent" />
                <div>
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="font-semibold text-foreground">{user.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-accent" />
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="font-semibold text-foreground text-sm">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-accent" />
                <div>
                  <p className="text-xs text-muted-foreground">Location</p>
                  <p className="font-semibold text-foreground">{user.location}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm font-medium">
                {isDriver ? 'Total Trips' : 'Total Shipments'}
              </p>
              <p className="text-3xl font-bold text-foreground mt-2">
                {isDriver ? user.totalTrips : user.totalShipments}
              </p>
            </div>
            <TrendingUp className="w-12 h-12 text-accent/30" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div>
            <p className="text-muted-foreground text-sm font-medium">Completion Rate</p>
            <p className="text-3xl font-bold text-foreground mt-2">{user.completionRate}%</p>
            <div className="mt-3 w-full bg-muted rounded-full h-2">
              <div
                className="bg-accent h-2 rounded-full"
                style={{ width: `${user.completionRate}%` }}
              />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div>
            <p className="text-muted-foreground text-sm font-medium">
              {isDriver ? 'Total Earned' : 'Total Spent'}
            </p>
            <p className="text-3xl font-bold text-foreground mt-2">
              {isDriver ? user.totalEarned : user.totalSpent}
            </p>
          </div>
        </div>
      </div>

      {/* Vehicles Section (Driver) */}
      {isDriver && (
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-2xl font-bold text-foreground mb-4">Vehicles</h2>
          <div className="space-y-3">
            {user.vehicles.map((vehicle: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div>
                  <p className="font-semibold text-foreground">{vehicle.type}</p>
                  <p className="text-sm text-muted-foreground">Year: {vehicle.year}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  vehicle.status === 'Active'
                    ? 'bg-accent/20 text-accent'
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {vehicle.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reviews Section */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-2xl font-bold text-foreground mb-4">Reviews</h2>
        <div className="space-y-4">
          {user.reviews.map((review: any, index: number) => (
            <div key={index} className="pb-4 border-b border-border last:border-b-0">
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold text-foreground">{review.author}</p>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(review.rating)
                          ? 'fill-accent text-accent'
                          : 'text-muted-foreground'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-muted-foreground text-sm">{review.comment}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Member Info */}
      <div className="bg-primary/10 border border-primary/20 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-primary" />
          <p className="font-semibold text-foreground">Member since {user.joinDate}</p>
        </div>
        <p className="text-muted-foreground text-sm">Average delivery time: {user.avgDeliveryTime}</p>
      </div>
    </div>
  )
}
