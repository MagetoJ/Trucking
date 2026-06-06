'use client'

import { Button } from '@/components/ui/button'
import { MapPin, User, TrendingUp, ChevronRight } from 'lucide-react'
import Link from 'next/link'

const BOOKINGS = [
  {
    id: 1,
    origin: 'Nairobi',
    destination: 'Mombasa',
    driver: 'Sarah Kipchoge',
    status: 'In Transit',
    progress: 65,
    eta: '2 hours',
    price: '$450',
    date: '2024-01-15',
  },
  {
    id: 2,
    origin: 'Kisumu',
    destination: 'Nairobi',
    driver: 'John Kipchoge',
    status: 'Picked Up',
    progress: 30,
    eta: '5 hours',
    price: '$380',
    date: '2024-01-16',
  },
  {
    id: 3,
    origin: 'Nakuru',
    destination: 'Nairobi',
    driver: 'Mike Ochieng',
    status: 'Pending',
    progress: 0,
    eta: 'TBD',
    price: '$320',
    date: '2024-01-17',
  },
]

export default function ActiveBookingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground">Active Bookings</h2>
        <p className="text-muted-foreground mt-1">Track your current shipments</p>
      </div>

      <div className="grid gap-4">
        {BOOKINGS.map((booking) => (
          <Link key={booking.id} href={`/dashboard/shipper/booking-details/${booking.id}`}>
            <div className="bg-card border border-border rounded-lg p-6 hover:border-accent transition-colors cursor-pointer">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-accent" />
                      <span className="font-semibold text-foreground">{booking.origin}</span>
                      <span className="text-muted-foreground">→</span>
                      <span className="font-semibold text-foreground">{booking.destination}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{booking.driver}</span>
                    </div>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-muted-foreground">{booking.date}</span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-accent" />
                    <span className={`text-xs font-semibold px-2 py-1 rounded ${
                      booking.status === 'In Transit' ? 'bg-accent/20 text-accent' :
                      booking.status === 'Picked Up' ? 'bg-blue-500/20 text-blue-500' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {booking.status}
                    </span>
                  </div>
                  <span className="text-sm text-muted-foreground">ETA: {booking.eta}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-accent h-2 rounded-full transition-all"
                    style={{ width: `${booking.progress}%` }}
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between">
                <span className="font-bold text-foreground">{booking.price}</span>
                <Button variant="outline" className="border-accent text-accent hover:bg-accent/10" size="sm">
                  View Details
                </Button>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
