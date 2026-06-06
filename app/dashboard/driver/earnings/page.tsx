'use client'

import { BarChart3, TrendingUp, DollarSign, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function EarningsPage() {
  const earnings = [
    { month: 'January', amount: 3240, trips: 12 },
    { month: 'December', amount: 2890, trips: 10 },
    { month: 'November', amount: 3120, trips: 11 },
    { month: 'October', amount: 2750, trips: 9 },
  ]

  const totalEarnings = earnings.reduce((sum, e) => sum + e.amount, 0)
  const totalTrips = earnings.reduce((sum, e) => sum + e.trips, 0)
  const averagePerTrip = Math.round(totalEarnings / totalTrips)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground">Earnings</h2>
        <p className="text-muted-foreground mt-1">Track your income and performance</p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm font-medium">Total Earnings</p>
              <p className="text-3xl font-bold text-foreground mt-2">${totalEarnings}</p>
            </div>
            <DollarSign className="w-12 h-12 text-accent/30" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm font-medium">Total Trips</p>
              <p className="text-3xl font-bold text-foreground mt-2">{totalTrips}</p>
            </div>
            <BarChart3 className="w-12 h-12 text-accent/30" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm font-medium">Avg per Trip</p>
              <p className="text-3xl font-bold text-foreground mt-2">${averagePerTrip}</p>
            </div>
            <TrendingUp className="w-12 h-12 text-accent/30" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm font-medium">Pending Payout</p>
              <p className="text-3xl font-bold text-foreground mt-2">$580</p>
            </div>
            <Calendar className="w-12 h-12 text-accent/30" />
          </div>
        </div>
      </div>

      {/* Withdrawal */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-xl font-bold text-foreground mb-4">Withdraw Earnings</h3>
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-semibold text-foreground mb-2">Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-foreground font-semibold">$</span>
              <input
                type="number"
                placeholder="0.00"
                className="w-full pl-7 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent bg-background text-foreground"
                max={580}
              />
            </div>
          </div>
          <Button className="bg-accent hover:bg-accent/90 text-primary font-bold">
            Request Withdrawal
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">Minimum: $50. Payouts processed within 2-3 business days.</p>
      </div>

      {/* Earnings History */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-xl font-bold text-foreground mb-6">Earnings by Month</h3>
        <div className="space-y-4">
          {earnings.map((earning, index) => (
            <div key={index} className="flex items-center justify-between pb-4 border-b border-border last:border-b-0">
              <div>
                <p className="font-semibold text-foreground">{earning.month}</p>
                <p className="text-sm text-muted-foreground">{earning.trips} trips completed</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-foreground">${earning.amount}</p>
                <p className="text-sm text-accent">${Math.round(earning.amount / earning.trips)}/trip</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
