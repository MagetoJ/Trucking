'use client'

import useSWR from 'swr'
import { authenticatedFetcher } from '@/lib/fetcher'
import { useAuthStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { MapPin, Box, RefreshCw, AlertTriangle, Trash2, CheckCircle2, ShieldCheck, Clock, Star } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

interface Booking {
  id: number
  origin: string
  destination: string
  cargo: string
  weight: string
  price: string
  status: 'PENDING' | 'ACCEPTED' | 'PICKED_UP' | 'IN_TRANSIT' | 'COMPLETED' | 'CANCELLED'
  progress: number
  eta: string
  date: string
  driver?: { name: string; phone: string; rating: number } | null
}

export default function ActiveBookingsPage() {
  const token = useAuthStore((state) => state.token)
  const [processingId, setProcessingId] = useState<number | null>(null)
  const [ratedJobIds, setRatedJobIds] = useState<number[]>([])
  const [selectedStars, setSelectedStars] = useState<Record<number, number>>({})

  const { data: bookings, error, isLoading, mutate } = useSWR<Booking[]>(
    token ? 'http://localhost:5000/api/bookings?role=shipper' : null,
    authenticatedFetcher,
    { refreshInterval: 4000 } // Auto-poll to catch driver acceptance changes live
  )

  const handleStatusAction = async (id: number, action: 'cancel' | 'confirm-delivery') => {
    if (action === 'cancel' && !confirm('Are you sure you want to cancel this freight load?')) return;
    setProcessingId(id)
    try {
      const endpoint = action === 'cancel' ? 'cancel' : 'confirm-delivery'
      const response = await fetch(`http://localhost:5000/api/bookings/${id}/${endpoint}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })
      if (!response.ok) throw new Error('Action execution rejected by engine.')
      mutate()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Action failed.')
    } finally {
      setProcessingId(null)
    }
  }

  const submitDriverRating = async (id: number) => {
    const score = selectedStars[id] || 5
    try {
      const response = await fetch(`http://localhost:5000/api/bookings/${id}/rate-driver`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ score })
      })
      if (response.ok) {
        setRatedJobIds((prev) => [...prev, id])
        alert('Thank you for your feedback! Driver rating committed successfully.')
      }
    } catch (err) {
      console.error(err)
    }
  }

  if (!token) return <div className="text-sm font-mono text-muted-foreground p-6">Synchronizing session context...</div>

  if (isLoading) return (
    <div className="flex justify-center items-center h-64 text-muted-foreground font-mono">
      <RefreshCw className="w-6 h-6 animate-spin mr-2 text-accent" /> STREAMING ACTIVE FREIGHT LIFECYCLE LEDGER...
    </div>
  )

  if (error) return (
    <div className="bg-destructive/10 text-destructive p-4 border border-destructive/20 rounded-lg flex items-center gap-2 font-mono text-xs">
      <AlertTriangle className="w-5 h-5 shrink-0" />
      <span>Pipeline Error: {error.message}</span>
    </div>
  )

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 text-black">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Cargo Tracking Control Center</h2>
          <p className="text-muted-foreground mt-1">Manage load changes, confirm delivery fulfillments, and verify escrow transactions.</p>
        </div>
        <Button variant="outline" onClick={() => mutate()} className="border-border text-foreground">
          <RefreshCw className="w-4 h-4 mr-1" /> Revalidate Ledger
        </Button>
      </div>

      {bookings?.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-border rounded-xl bg-card">
          <Box className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-foreground font-medium mb-4">No shipments found on your profile.</p>
          <Link href="/dashboard/shipper/post-load">
            <Button className="bg-accent text-white font-bold">Post Your First Load</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-6">
          {bookings?.map((booking) => (
            <div key={booking.id} className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-6">
              
              {/* Top Banner Row */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
                <div>
                  <div className="flex items-center gap-2 text-lg font-bold text-foreground mb-1.5">
                    <MapPin className="w-5 h-5 text-accent" />
                    <span>{booking.origin}</span>
                    <span className="text-muted-foreground mx-1">➔</span>
                    <span>{booking.destination}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="bg-muted text-foreground px-2 py-0.5 rounded font-mono font-medium">ID: #{booking.id}</span>
                    <span>•</span>
                    <span>Cargo: <strong className="text-foreground">{booking.cargo}</strong> ({booking.weight})</span>
                    <span>•</span>
                    <span>Posted Date: {booking.date}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 self-start md:self-center">
                  <div className="text-right">
                    <p className="text-2xl font-black text-foreground">{booking.price}</p>
                    <div className="flex items-center text-xs text-emerald-500 font-medium gap-1 mt-0.5">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Escrow Secured</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dynamic Milestone Progression Tracker */}
              <div className="space-y-3">
                <div className="flex justify-between text-xs font-semibold text-muted-foreground">
                  <span className={booking.status === 'PENDING' ? 'text-accent font-bold' : ''}>1. Order Placed</span>
                  <span className={booking.status === 'ACCEPTED' ? 'text-accent font-bold' : ''}>2. Driver Assigned</span>
                  <span className={(booking.status === 'PICKED_UP' || booking.status === 'IN_TRANSIT') ? 'text-accent font-bold' : ''}>3. In Transit</span>
                  <span className={booking.status === 'COMPLETED' ? 'text-emerald-500 font-bold' : ''}>4. Fulfilled</span>
                </div>
                
                <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${booking.status === 'CANCELLED' ? 'bg-red-500' : booking.status === 'COMPLETED' ? 'bg-emerald-500' : 'bg-accent'}`}
                    style={{ 
                      width: booking.status === 'CANCELLED' ? '100%' : 
                             booking.status === 'PENDING' ? '15%' : 
                             booking.status === 'ACCEPTED' ? '45%' : 
                             booking.status === 'IN_TRANSIT' || booking.status === 'PICKED_UP' ? '75%' : '100%' 
                    }}
                  />
                </div>

                <div className="flex justify-between items-center text-xs text-muted-foreground pt-1">
                  <div className="flex items-center gap-1.5 bg-primary/5 text-foreground px-2.5 py-1 rounded-md">
                    <Clock className="w-3.5 h-3.5 text-accent" />
                    <span>ETA Status: <strong>{booking.status === 'CANCELLED' ? 'N/A' : booking.eta}</strong></span>
                  </div>
                  <span className="font-mono uppercase font-bold text-accent">Status: {booking.status}</span>
                </div>
              </div>

              {/* Conditional Visibility Action Logic Section */}
              {booking.driver ? (
                /* Driver details display ONLY during active transit */
                <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-accent/10 text-accent font-black flex items-center justify-center text-sm">
                      {booking.driver.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">Assigned Driver: {booking.driver.name}</p>
                      <p className="text-xs text-slate-500">Carrier Performance Score: {booking.driver.rating?.toFixed(1) || '5.0'} ⭐</p>
                    </div>
                  </div>
                  <div className="text-xs font-mono bg-white border px-3 py-1.5 rounded-lg text-slate-800 self-start sm:self-center">
                    <span>📞 Contact: <strong>{booking.driver.phone}</strong></span>
                  </div>
                </div>
              ) : booking.status === 'COMPLETED' && !ratedJobIds.includes(booking.id) ? (
                /* Driver disappears upon completion, replaced by the rating block prompt */
                <div className="p-4 bg-orange-50/50 border border-orange-200 rounded-xl space-y-3">
                  <p className="text-sm font-bold text-orange-800">Rate Your Carrier Service</p>
                  <p className="text-xs text-slate-600">The driver has disappeared from active contact fields. Please submit a service score rating to release feedback metrics:</p>
                  <div className="flex items-center gap-3 pt-1">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setSelectedStars(prev => ({ ...prev, [booking.id]: star }))}
                          className="focus:outline-none cursor-pointer transition-transform active:scale-95"
                        >
                          <Star 
                            className={`w-6 h-6 ${
                              star <= (selectedStars[booking.id] || 5) 
                                ? 'fill-amber-400 text-amber-400' 
                                : 'text-slate-300'
                            }`} 
                          />
                        </button>
                      ))}
                    </div>
                    <Button 
                      onClick={() => submitDriverRating(booking.id)}
                      className="bg-accent hover:bg-accent/90 text-white font-bold text-xs px-4 py-2 cursor-pointer h-auto"
                    >
                      Submit Driver Rating
                    </Button>
                  </div>
                </div>
              ) : booking.status === 'PENDING' ? (
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700 font-medium">
                  ⌛ Waiting for a verified carrier to accept and claim this haulage specification load...
                </div>
              ) : null}

              {/* Functional Controls Action Row */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-100">
                <div>
                  {booking.status === 'PENDING' && (
                    <Button 
                      variant="destructive"
                      disabled={processingId !== null}
                      onClick={() => handleStatusAction(booking.id, 'cancel')}
                      className="cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4 mr-1.5" /> Cancel Load Request
                    </Button>
                  )}
                  {(booking.status === 'ACCEPTED' || booking.status === 'IN_TRANSIT' || booking.status === 'PICKED_UP') && (
                    <Button 
                      disabled={processingId !== null}
                      onClick={() => handleStatusAction(booking.id, 'confirm-delivery')}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer shadow-sm"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-1.5" /> Confirm Cargo Received
                    </Button>
                  )}
                  {booking.status === 'COMPLETED' && (
                    <span className="text-xs text-emerald-600 font-bold bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg flex items-center gap-1">
                      ✓ Order Successfully Completed & Escrow Settled
                    </span>
                  )}
                  {booking.status === 'CANCELLED' && (
                    <span className="text-xs text-red-500 font-bold bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-lg">
                      ✕ This specific load offer has been cancelled.
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Link href={`/dashboard/shipper/post-load?edit=${booking.id}`}>
                    <Button variant="outline" className="border-border text-foreground hover:bg-muted text-xs cursor-pointer">
                      Edit Load Fields
                    </Button>
                  </Link>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  )
}