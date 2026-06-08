'use client'

import useSWR from 'swr'
import { authenticatedFetcher } from '@/lib/fetcher'
import { BACKEND_BASE_URL, authenticatedFetcher } from '@/lib/fetcher' // Import BACKEND_BASE_URL
import { BarChart3, TrendingUp, Users, DollarSign, MapPin, RefreshCw, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface Booking {
  id: number
  origin: string
  destination: string
  cargo: string
  weight: string
  price: string
  status: string
  createdAt: string
}

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user)
  const token = useAuthStore((state) => state.token)

  // General single call architecture for real role sync
  const roleQueryParam = user?.role === 'shipper' ? 'shipper' : 'driver'
  const { data: bookings, error, isLoading, mutate } = useSWR<Booking[]>(
    token ? `${BACKEND_BASE_URL}/api/bookings?role=${roleQueryParam}` : null,
    authenticatedFetcher,
    { refreshInterval: 5000 }
  )

  if (!user) return null

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-muted-foreground font-mono text-sm">
        <RefreshCw className="w-5 h-5 animate-spin text-accent mb-2" />
        LOADING SECURE REAL-TIME STATS...
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-destructive/10 text-destructive p-4 border border-destructive/20 rounded-lg flex items-center gap-2 font-mono text-xs">
        <AlertCircle className="w-5 h-5 shrink-0" />
        <span>Pipeline Sync Error: {error.message}</span>
      </div>
    )
  }

  const parsePrice = (priceStr: string) => parseFloat(priceStr.replace(/[^0-9.]/g, '')) || 0

  // ── SHIPPER RENDER MODE ────────────────────────────────
  if (user.role === 'shipper') {
    const activeBookings = bookings?.filter((b) => b.status !== 'COMPLETED' && b.status !== 'CANCELLED') || []
    const completedBookings = bookings?.filter((b) => b.status === 'COMPLETED') || []
    const totalSpent = bookings?.reduce((sum, b) => sum + parsePrice(b.price), 0) || 0
    const recentActivity = bookings?.slice(0, 3) || []

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Welcome back, {user.name}</h2>
          <p className="text-muted-foreground mt-1">Manage your corporate shipments and bookings securely</p>
        </div>

        {/* Live Metrics Grid */}
        <div className="grid md:grid-cols-4 gap-4">
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Active Bookings</p>
                <p className="text-3xl font-bold text-foreground mt-2">{activeBookings.length}</p>
              </div>
              <BarChart3 className="w-12 h-12 text-accent/30" />
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Total Volume Spent</p>
                <p className="text-3xl font-bold text-foreground mt-2">${totalSpent.toLocaleString()}</p>
              </div>
              <DollarSign className="w-12 h-12 text-accent/30" />
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Completed Transits</p>
                <p className="text-3xl font-bold text-foreground mt-2">{completedBookings.length}</p>
              </div>
              <TrendingUp className="w-12 h-12 text-accent/30" />
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Rating Status</p>
                <p className="text-3xl font-bold text-foreground mt-2">{user.rating?.toFixed(1) || '5.0'} ⭐</p>
              </div>
              <Users className="w-12 h-12 text-accent/30" />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-4">
          <Link href="/dashboard/shipper/post-load">
            <Button className="w-full h-20 bg-accent hover:bg-accent/90 text-white font-bold text-lg cursor-pointer">
              Post New Cargo Load Request
            </Button>
          </Link>
          <Link href="/dashboard/shipper/active-bookings">
            <Button variant="outline" className="w-full h-20 border-accent text-accent hover:bg-accent/10 font-bold text-lg cursor-pointer">
              View All Active Bookings ({activeBookings.length})
            </Button>
          </Link>
        </div>

        {/* Live Activity Logs Feed */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-xl font-bold text-foreground mb-4">Recent Activity Feed</h3>
          <div className="space-y-3">
            {recentActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground italic py-4 text-center">No recent shipment activity recorded yet.</p>
            ) : (
              recentActivity.map((booking) => (
                <div key={booking.id} className="flex items-center gap-4 pb-3 border-b border-border last:border-b-0">
                  <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-accent" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">Load #{booking.id} - {booking.origin} to {booking.destination}</p>
                    <p className="text-sm text-muted-foreground">Cargo: {booking.cargo} • Mass: {booking.weight}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground">{booking.price}</p>
                    <span className={`inline-block px-2 py-0.5 rounded font-mono text-[9px] font-bold uppercase ${
                      booking.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-500' :
                      booking.status === 'PENDING' ? 'bg-amber-500/10 text-amber-500' : 'bg-blue-500/10 text-blue-500'
                    }`}>
                      {booking.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    )
  }

  // ── DRIVER RENDER MODE ────────────────────────────────
  const myTrips = bookings?.filter((b) => b.status !== 'PENDING') || []
  const activeTripsCount = myTrips.filter((b) => b.status !== 'COMPLETED' && b.status !== 'CANCELLED').length
  const completedTrips = myTrips.filter((b) => b.status === 'COMPLETED')
  const completedCount = completedTrips.length
  const monthlyEarnings = completedTrips.reduce((sum, b) => sum + parsePrice(b.price), 0)
  const availableLoads = bookings?.filter((b) => b.status === 'PENDING').slice(0, 3) || []

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Welcome back, {user.name}</h2>
          <p className="text-muted-foreground mt-1">Find matching loads and manage active trips</p>
        </div>
        <Button variant="outline" onClick={() => mutate()} className="text-xs">
          <RefreshCw className="w-3.5 h-3.5 mr-1" /> Force Sync
        </Button>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm font-medium">This Month</p>
              <p className="text-3xl font-bold text-foreground mt-2">${monthlyEarnings.toLocaleString()}</p>
            </div>
            <DollarSign className="w-12 h-12 text-accent/30" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm font-medium">Active Trips</p>
              <p className="text-3xl font-bold text-foreground mt-2">{activeTripsCount}</p>
            </div>
            <BarChart3 className="w-12 h-12 text-accent/30" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm font-medium">Completed</p>
              <p className="text-3xl font-bold text-foreground mt-2">{completedCount}</p>
            </div>
            <TrendingUp className="w-12 h-12 text-accent/30" />
          </div>
          </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm font-medium">Rating</p>
              <p className="text-3xl font-bold text-foreground mt-2">{user.rating?.toFixed(1) || '5.0'} ⭐</p>
            </div>
            <Users className="w-12 h-12 text-accent/30" />
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Link href="/dashboard/driver/available-loads">
          <Button className="w-full h-20 bg-accent hover:bg-accent/90 text-white font-bold text-lg cursor-pointer">
            Find Available Loads
          </Button>
        </Link>
        <Link href="/dashboard/driver/my-trips">
          <Button variant="outline" className="w-full h-20 border-accent text-accent hover:bg-accent/10 font-bold text-lg cursor-pointer">
            View My Trips ({myTrips.length})
          </Button>
        </Link>
      </div>

      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-xl font-bold text-foreground mb-4">Available Marketplace Loads Near You</h3>
        <div className="space-y-3">
          {availableLoads.length === 0 ? (
            <p className="text-sm text-muted-foreground italic py-4 text-center">No unassigned loads available at the moment.</p>
          ) : (
            availableLoads.map((load) => (
              <div key={load.id} className="flex items-center gap-4 pb-4 border-b border-border last:border-b-0">
                <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-accent" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">Load #{load.id} - {load.origin} to {load.destination}</p>
                  <div className="flex gap-4 mt-1">
                    <span className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded font-mono">{load.weight}</span>
                    <span className="text-xs text-muted-foreground">Cargo: {load.cargo}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-foreground">{load.price}</p>
                  <span className="text-[10px] uppercase font-mono text-emerald-500 font-bold">Open</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
