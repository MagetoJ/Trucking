'use client'

import { useAuthStore } from '@/lib/store'
import { BarChart3, TrendingUp, Users, DollarSign, Clock, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user)

  if (!user) return null

  const isShipper = user.role === 'shipper'

  if (isShipper) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-3xl font-bold text-foreground">Welcome back, {user.name}</h2>
          <p className="text-muted-foreground mt-1">Manage your shipments and bookings</p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-4">
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Active Bookings</p>
                <p className="text-3xl font-bold text-foreground mt-2">3</p>
              </div>
              <BarChart3 className="w-12 h-12 text-accent/30" />
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Total Spent</p>
                <p className="text-3xl font-bold text-foreground mt-2">$1,250</p>
              </div>
              <DollarSign className="w-12 h-12 text-accent/30" />
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Completed</p>
                <p className="text-3xl font-bold text-foreground mt-2">12</p>
              </div>
              <TrendingUp className="w-12 h-12 text-accent/30" />
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Rating</p>
                <p className="text-3xl font-bold text-foreground mt-2">4.8 ⭐</p>
              </div>
              <Users className="w-12 h-12 text-accent/30" />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-4">
          <Link href="/dashboard/shipper/post-load">
            <Button className="w-full h-20 bg-accent hover:bg-accent/90 text-primary font-bold text-lg">
              Post New Load
            </Button>
          </Link>
          <Link href="/dashboard/shipper/active-bookings">
            <Button variant="outline" className="w-full h-20 border-accent text-accent hover:bg-accent/10 font-bold text-lg">
              View Active Bookings
            </Button>
          </Link>
        </div>

        {/* Recent Activity */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-xl font-bold text-foreground mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4 pb-3 border-b border-border last:border-b-0">
                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-accent" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">Load #{1000 + i} - In Transit</p>
                  <p className="text-sm text-muted-foreground">Driver John • 2 hours ago</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-foreground">$450</p>
                  <p className="text-xs text-accent">On time</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Driver Dashboard
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-foreground">Welcome back, {user.name}</h2>
        <p className="text-muted-foreground mt-1">Find loads and manage your trips</p>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm font-medium">This Month</p>
              <p className="text-3xl font-bold text-foreground mt-2">$3,240</p>
            </div>
            <DollarSign className="w-12 h-12 text-accent/30" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm font-medium">Active Trips</p>
              <p className="text-3xl font-bold text-foreground mt-2">2</p>
            </div>
            <BarChart3 className="w-12 h-12 text-accent/30" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm font-medium">Completed</p>
              <p className="text-3xl font-bold text-foreground mt-2">48</p>
            </div>
            <TrendingUp className="w-12 h-12 text-accent/30" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm font-medium">Rating</p>
              <p className="text-3xl font-bold text-foreground mt-2">4.9 ⭐</p>
            </div>
            <Users className="w-12 h-12 text-accent/30" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-4">
        <Link href="/dashboard/driver/available-loads">
          <Button className="w-full h-20 bg-accent hover:bg-accent/90 text-primary font-bold text-lg">
            Find Available Loads
          </Button>
        </Link>
        <Link href="/dashboard/driver/my-trips">
          <Button variant="outline" className="w-full h-20 border-accent text-accent hover:bg-accent/10 font-bold text-lg">
            View My Trips
          </Button>
        </Link>
      </div>

      {/* Available Loads Preview */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-xl font-bold text-foreground mb-4">Available Loads Near You</h3>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4 pb-4 border-b border-border last:border-b-0">
              <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center">
                <MapPin className="w-6 h-6 text-accent" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">Load #{5000 + i} - Nairobi to Mombasa</p>
                <div className="flex gap-4 mt-1">
                  <span className="text-xs bg-accent/10 text-accent px-2 py-1 rounded">5 tons</span>
                  <span className="text-xs text-muted-foreground">Posted 30 mins ago</span>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-foreground">$580</p>
                <p className="text-xs text-muted-foreground">22 km away</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
