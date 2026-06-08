'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { BACKEND_BASE_URL, authenticatedFetcher } from '@/lib/fetcher' // Import BACKEND_BASE_URL
import { useAuthStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { 
  BarChart3,
  DollarSign, 
  Briefcase, 
  TrendingUp, 
  Wallet, 
  RefreshCw, 
  AlertCircle, 
  ArrowUpRight 
} from 'lucide-react'

interface EarningsStats {
  totalEarnings: number
  jobsCompleted: number
  avgPayout: number
  withdrawableBalance: number
}

export default function DriverEarningsPage() {
  const token = useAuthStore((state) => state.token)
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Live SWR Hook pulling carrier financial data streams directly from backend database rows
  const { data: stats, error, isLoading, mutate } = useSWR<EarningsStats>(
    token ? `${BACKEND_BASE_URL}/api/bookings/driver-earnings-stats` : null,
    authenticatedFetcher,
    { refreshInterval: 5000 }
  )

  const handleWithdrawRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) return

    setSubmitting(true)
    try {
      // Placeholder for your payment gateway route integration layer (e.g., M-Pesa / Stripe Escrow payouts)
      alert(`Withdrawal request for $${withdrawAmount} received. Processing payout sequence...`)
      setWithdrawAmount('')
      mutate()
    } catch (err) {
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto text-foreground pb-12">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Net Take-home Income</span>
              <h3 className="text-2xl font-black mt-2 text-foreground">
                ${stats ? stats.totalEarnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
              </h3>
            </div>
            <DollarSign className="w-12 h-12 text-accent/30" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Completed Manifests</span>
              <h3 className="text-2xl font-black mt-2 text-foreground">{stats?.jobsCompleted || 0}</h3>
            </div>
            <BarChart3 className="w-12 h-12 text-accent/30" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Avg. Profit / Route</span>
              <h3 className="text-2xl font-black mt-2 text-foreground">
                ${stats ? stats.avgPayout.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
              </h3>
            </div>
            <TrendingUp className="w-12 h-12 text-accent/30" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Available Balance</span>
              <h3 className="text-2xl font-black mt-2 text-emerald-500">
                ${stats ? stats.withdrawableBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
              </h3>
            </div>
            <Wallet className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center" />
          </div>
        </div>
      </div>

      {/* Payout Withdrawal Action Processing Block Form */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-xs max-w-xl">
        <h3 className="text-lg font-bold flex items-center gap-2 mb-1.5">
          <Wallet className="w-5 h-5 text-accent" /> Withdraw Platform Balance
        </h3>
        <p className="text-xs text-muted-foreground mb-4">Transfer your secure carrier settlements instantly to your linked banking or electronic wallet setup entries.</p>
        
        <form onSubmit={handleWithdrawRequest} className="space-y-4">
          <div>
            <label htmlFor="amount-input" className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Withdrawal Amount ($)</label>
            <div className="relative">
              <span className="absolute left-4 top-3 text-muted-foreground font-mono text-sm">$</span>
              <input
                id="amount-input"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                max={stats?.withdrawableBalance || 0}
                className="w-full pl-8 pr-4 py-2.5 border border-border rounded-xl bg-background text-foreground text-sm font-mono focus:ring-2 focus:ring-accent outline-none"
                required
              />
            </div>
          </div>
          <Button 
            type="submit" 
            disabled={submitting || !withdrawAmount || parseFloat(withdrawAmount) <= 0}
            className="w-full bg-accent hover:bg-accent/90 text-white font-bold font-mono tracking-wider text-xs py-3 rounded-xl uppercase shadow-md cursor-pointer transition flex items-center justify-center gap-1.5"
          >
            {submitting ? 'Processing Payout...' : 'Request Balance Payout'} <ArrowUpRight className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}
