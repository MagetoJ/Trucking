'use client'

import useSWR from 'swr'
import { authenticatedFetcher } from '@/lib/fetcher'
import { useAuthStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { MapPin, Box, RefreshCw, AlertTriangle, Truck } from 'lucide-react'
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
}

export default function ActiveBookingsPage() {
  const token = useAuthStore((state) => state.token)

  const { data: bookings, error, isLoading, mutate } = useSWR<Booking[]>(
    token ? 'http://localhost:5000/api/bookings?role=shipper' : null,
    authenticatedFetcher,
    { refreshInterval: 5000 } // Poll every 5 seconds for live status changes
  )

  if (!token) return <div className="text-sm font-mono text-muted-foreground">Synchronizing session state...</div>

  if (isLoading) return (
    <div className="flex justify-center items-center h-64 text-muted-foreground font-mono">
      <RefreshCw className="w-6 h-6 animate-spin mr-2 text-accent" /> STREAMING SECURE FREIGHT LEDGER...
    </div>
  )

  if (error) return (
    <div className="bg-destructive/10 text-destructive p-4 border border-destructive/20 rounded-lg flex items-center gap-2 font-mono text-xs">
      <AlertTriangle className="w-5 h-5 shrink-0" />
      <span>Pipeline Error: {error.message}</span>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Active Shipments Feed</h2>
          <p className="text-muted-foreground mt-1">Live tracking data securely pulled from database channels.</p>
        </div>
        <Button variant="outline" onClick={() => mutate()} className="border-border text-foreground">
          <RefreshCw className="w-4 h-4 mr-1" /> Revalidate Ledger
        </Button>
      </div>

      {bookings?.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-border rounded-xl bg-card">
          <Box className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-foreground font-medium">No shipments posted yet</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {bookings?.map((booking) => (
            <div key={booking.id} className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 text-base font-semibold text-foreground mb-1.5">
                    <MapPin className="w-4 h-4 text-accent" />
                    <span>{booking.origin}</span>
                    <span className="text-muted-foreground mx-1">➔</span>
                    <span>{booking.destination}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="bg-primary/10 text-primary-foreground px-2 py-0.5 rounded font-mono font-medium">ID: #{booking.id}</span>
                    <span>•</span>
                    <span>Cargo: <strong className="text-foreground">{booking.cargo}</strong> ({booking.weight})</span>
                  </div>
                </div>

                <div className="text-left md:text-right shrink-0">
                  <p className="text-xl font-black text-foreground">{booking.price}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}