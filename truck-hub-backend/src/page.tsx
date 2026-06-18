'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '../../lib/store'
import { BACKEND_BASE_URL } from '../../lib/fetcher'
import { Button } from '../../components/ui/button'
import { Wallet, ArrowUpRight, Clock, Landmark, Smartphone, Zap, CheckCircle2 } from 'lucide-react'

export default function DriverEarningsPage() {
  const { user, token } = useAuthStore()
  const [wallet, setWallet] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [withdrawing, setWithdrawing] = useState(false)
  const [amount, setAmount] = useState('')

  useEffect(() => {
    fetchWallet()
  }, [])

  const fetchWallet = async () => {
    try {
      const res = await fetch(`${BACKEND_BASE_URL}/api/wallet/balance`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json()
      setWallet(data)
    } catch (err) {
      console.error('Wallet fetch failed:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || isNaN(Number(amount))) return
    
    setWithdrawing(true)
    try {
      const res = await fetch(`${BACKEND_BASE_URL}/api/wallet/withdraw`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ amount: Number(amount) })
      })
      const data = await res.json()
      if (res.ok) {
        alert('Withdrawal request received! Funds will be dispatched shortly.')
        setAmount('')
        fetchWallet()
      } else {
        alert(data.error)
      }
    } catch (err) {
      alert('Transaction failed.')
    } finally {
      setWithdrawing(false)
    }
  }

  if (loading) return <div className="p-8 font-mono animate-pulse">Accessing Secure Vault...</div>

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12 text-foreground">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <Wallet className="w-8 h-8 text-accent" /> Driver Payout Hub
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage your Pan-African earnings and instant liquidity options.
          </p>
        </div>
        <div className="bg-accent/10 border border-accent/20 px-4 py-2 rounded-lg">
           <span className="text-xs font-bold text-accent uppercase tracking-wider">Localized Currency</span>
           <p className="text-lg font-black">{wallet?.currency || 'USD'}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Main Balance Card */}
        <div className="md:col-span-2 bg-card border border-border rounded-2xl p-8 relative overflow-hidden shadow-lg">
          <div className="absolute top-0 right-0 p-4 opacity-10">
             <Landmark className="w-24 h-24" />
          </div>
          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">Available Balance</p>
          <h3 className="text-5xl font-black mt-2 mb-6">
            {wallet?.currency} {Number(wallet?.balance).toLocaleString()}
          </h3>
          
          <form onSubmit={handleWithdraw} className="flex gap-3">
            <div className="relative flex-1">
               <span className="absolute left-3 top-2.5 text-muted-foreground font-bold">{wallet?.currency}</span>
               <input 
                type="number" 
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-12 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-accent outline-none font-bold"
                required
               />
            </div>
            <Button 
              disabled={withdrawing || !amount}
              className="bg-accent hover:bg-accent/90 text-white font-black px-6 rounded-xl shadow-md cursor-pointer"
            >
              {withdrawing ? 'Processing...' : <><Zap className="w-4 h-4 mr-2" /> Instant Withdraw</>}
            </Button>
          </form>
          <p className="text-[10px] text-muted-foreground mt-4 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" /> 
            Funds will be routed to registered {wallet?.payoutMethod || 'Mobile Money'} account: {wallet?.payoutAccount || 'Not Set'}
          </p>
        </div>

        {/* Quick Stats Sidebar */}
        <div className="space-y-4">
          <div className="bg-muted/40 border border-border p-5 rounded-2xl">
            <div className="flex items-center gap-3 text-muted-foreground mb-1">
              <Smartphone className="w-4 h-4" />
              <span className="text-xs font-bold uppercase">Payout Method</span>
            </div>
            <p className="font-bold text-sm">{wallet?.payoutMethod || 'Configure in Settings'}</p>
          </div>

          <div className="bg-emerald-500/5 border border-emerald-500/20 p-5 rounded-2xl">
            <div className="flex items-center gap-3 text-emerald-500 mb-1">
              <ArrowUpRight className="w-4 h-4" />
              <span className="text-xs font-bold uppercase">This Month Earnings</span>
            </div>
            <p className="font-black text-xl text-emerald-500">{wallet?.currency} ---</p>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6">
         <h4 className="font-bold mb-4 flex items-center gap-2"><Clock className="w-4 h-4" /> Recent Payout History</h4>
         <div className="text-center py-8 text-muted-foreground text-sm border-2 border-dashed border-border rounded-xl">
            No recent withdrawal requests discovered in your payout ledger.
         </div>
      </div>
    </div>
  )
}