'use client'

import { Button } from '@/components/ui/button'
import { MapPin, Clock, DollarSign, ChevronRight } from 'lucide-react'
import Link from 'next/link'

const TRIPS = [
  {
    id: 1,
    origin: 'Nairobi',
    destination: 'Mombasa',
    status: 'In Progress',
    progress: 68,
    eta: '2 hours 15 mins',
    earnings: '$580',
    shipper: 'John Mwangi',
    date: '2024-01-15',
  },
  {
    id: 2,
    origin: 'Kisumu',
    destination: 'Nairobi',
    status: 'Completed',
    progress: 100,
    eta: 'Delivered',
    earnings: '$420',
    shipper: 'Grace Kariuki',
    date: '2024-01-14',
  },
  {
    id: 3,
    origin: 'Nakuru',
    destination: 'Eldoret',
    status: 'Upcoming',
    progress: 0,
    eta: 'Tomorrow 8:00 AM',
    earnings: '$350',
    shipper: 'Lucy Njeri',
    date: '2024-01-17',
  },
]

export default function MyTripsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground">My Trips</h2>
        <p className="text-muted-foreground mt-1">Track all your deliveries</p>
      </div>

      <div className="grid gap-4">
        {TRIPS.map((trip) => (
          <Link key={trip.id} href={`/dashboard/driver/trip-details/${trip.id}`}>
            <div className="bg-card border border-border rounded-lg p-6 hover:border-accent transition-colors cursor-pointer">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-accent" />
                      <span className="font-semibold text-foreground">{trip.origin}</span>
                      <span className="text-muted-foreground">→</span>
                      <span className="font-semibold text-foreground">{trip.destination}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      trip.status === 'In Progress' ? 'bg-accent/20 text-accent' :
                      trip.status === 'Completed' ? 'bg-green-500/20 text-green-600' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {trip.status}
                    </span>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-muted-foreground">{trip.shipper}</span>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-muted-foreground">{trip.date}</span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </div>

              {/* Progress Bar */}
              {trip.status !== 'Completed' && (
                <div className="mb-4">
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        trip.status === 'In Progress' ? 'bg-accent' : 'bg-muted-foreground'
                      }`}
                      style={{ width: `${trip.progress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{trip.eta}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4 text-accent" />
                    <span className="font-bold text-foreground">{trip.earnings}</span>
                  </div>
                </div>
                <Button variant="outline" className="border-accent text-accent hover:bg-accent/10" size="sm">
                  View
                </Button>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
