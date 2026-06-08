'use client'

import useSWR from 'swr'
import { authenticatedFetcher } from '@/lib/fetcher'
import { BACKEND_BASE_URL, authenticatedFetcher } from '@/lib/fetcher' // Import BACKEND_BASE_URL
import { Button } from '@/components/ui/button'
import { MapPin, Clock, DollarSign, ChevronRight, RefreshCw, AlertCircle, Truck } from 'lucide-react'
import Link from 'next/link'

interface Booking {
  id: number
  origin: string
  destination: string
  cargo: string
  weight: string
  price: string
  status: string
  progress: number
  eta: string
  date: string
  shipper?: { name: string; phone: string; email: string; rating: number } | null // Add shipper details
}

export default function MyTripsPage() {
  const token = useAuthStore((state) => state.token)

  // Fetch real matching trips assigned to this carrier profile
  const { data: trips, error, isLoading, mutate } = useSWR<Booking[]>(
    token ? `${BACKEND_BASE_URL}/api/bookings?role=driver` : null,
    authenticatedFetcher,
    { refreshInterval: 4000 }
  )

  if (!token) {
    return <div className="text-sm font-mono text-muted-foreground p-6">Loading profile context...</div>
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64 text-muted-foreground font-mono">
        <RefreshCw className="w-6 h-6 animate-spin mr-2 text-accent" /> FETCHING REAL-TIME ASSIGNED MANIFESTS...
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-destructive/10 text-destructive p-4 border border-destructive/20 rounded-lg flex items-center gap-2 font-mono text-xs">
        <AlertCircle className="w-5 h-5 shrink-0" />
        <span>Fetch Error: {error.message}</span>
      </div>
    )
  }

  // Filter out unassigned marketplace postings
  const myAssignedTrips = trips?.filter(t => t.status !== 'PENDING') || []

  return (
    <div className="space-y-6 max-w-5xl mx-auto text-black">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-foreground">My Trips Manifest</h2>
          <p className="text-muted-foreground mt-1">Review live routes, active transits, and completed billing histories.</p>
        </div>
        <Button variant="outline" onClick={() => mutate()} className="text-xs">
          <RefreshCw className="w-3.5 h-3.5 mr-1" /> Sync Manifest
        </Button>
      </div>

      {myAssignedTrips.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-border rounded-xl bg-card">
          <Truck className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <p className="text-foreground font-medium">No assigned routes discovered</p>
          <p className="text-muted-foreground text-sm mt-1">Go to Available Loads to claim a shipment offer.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {myAssignedTrips.map((trip) => (
            <Link key={trip.id} href={`/dashboard/driver/trip-details/${trip.id}`}>
              <div className="bg-card border border-border rounded-lg p-6 hover:border-accent transition-all shadow-sm block group cursor-pointer">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <MapPin className="w-5 h-5 text-accent" />
                      <span className="font-bold text-foreground text-lg">{trip.origin}</span>
                      <span className="text-muted-foreground font-normal">→</span>
                      <span className="font-bold text-foreground text-lg">{trip.destination}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                      <span className={`px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider text-[10px] border ${
                        trip.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' :
                        trip.status === 'CANCELLED' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                        'bg-accent/10 text-accent border-accent/20'
                      }`}>
                        {trip.status}
                      </span>
                      <span>•</span>
                      <span>Cargo: <strong className="text-foreground">{trip.cargo}</strong></span>
                      <span>•</span>
                      <span>Payload Mass: <strong className="text-foreground">{trip.weight}</strong></span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-accent transition-colors" />
                </div>

                {trip.status !== 'COMPLETED' && trip.status !== 'CANCELLED' && (
                  <div className="mb-4 space-y-1">
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-accent transition-all duration-300"
                        style={{ width: `${trip.progress || 10}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Live Shipper Client Details Box - Will hide automatically upon COMPLETION since server returns null */}
                {trip.shipper ? (
                  <div className="my-4 p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-indigo-600/10 text-indigo-600 font-bold flex items-center justify-center text-xs">
                        {trip.shipper.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">Client Shipper: {trip.shipper.name}</p>
                        <p className="text-[11px] text-slate-500">Shipper Account Rating: {trip.shipper.rating?.toFixed(1) || '5.0'} ⭐</p>
                      </div>
                    </div>
                    <div className="text-xs font-mono bg-white border px-2.5 py-1 rounded text-slate-800 self-start sm:self-center">
                      <span>📞 Call Client: <strong>{trip.shipper.phone}</strong></span>
                    </div>
                  </div>
                ) : trip.status === 'COMPLETED' ? (
                  <div className="my-3 p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-xs text-emerald-700 font-medium">
                    ✓ Order marked completed! Shipper information has been cleared from your active views.
                  </div>
                ) : null}

                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-100 px-2.5 py-1 rounded">
                      <Clock className="w-4 h-4 text-accent" />
                      <span>ETA: <strong>{trip.eta}</strong></span>
                    </div>
                    <div className="flex items-center gap-0.5 text-foreground font-black text-lg">
                      <DollarSign className="w-4 h-4 text-accent" />
                      <span>{trip.price.replace(/[^0-9.]/g, '')}</span>
                    </div>
                  </div>
                  <Button variant="outline" className="border-accent text-accent group-hover:bg-accent group-hover:text-white transition-all text-xs" size="sm">
                    Manage Trip Parameters
                  </Button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}