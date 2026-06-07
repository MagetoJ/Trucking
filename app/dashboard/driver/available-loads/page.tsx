'use client'

import useSWR from 'swr'
import { useState } from 'react'
import { authenticatedFetcher } from '@/lib/fetcher'
import { useAuthStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { MapPin, Package, DollarSign, RefreshCw, AlertCircle, CheckCircle, Box } from 'lucide-react'

interface OpenBooking {
  id: number
  origin: string
  destination: string
  cargo: string
  weight: string
  price: string
  date: string
}

export default function AvailableLoadsPage() {
  const token = useAuthStore((state) => state.token)
  const [actionId, setActionId] = useState<number | null>(null)
  const [message, setMessage] = useState({ type: '', text: '' })
  
  const { data: loads, error, isLoading, mutate } = useSWR<OpenBooking[]>(
    token ? 'http://localhost:5000/api/bookings?role=driver' : null,
    authenticatedFetcher,
    { refreshInterval: 5000 } // Keeps available loads updated in real-time
  )

  const handleClaimLoad = async (id: number) => {
    setActionId(id)
    setMessage({ type: '', text: '' })

    try {
      const response = await fetch(`http://localhost:5000/api/bookings/${id}/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to claim tracking dispatch allocation.')

      setMessage({ type: 'success', text: 'Workload payload claimed successfully! Trip generated under your dashboard.' })
      mutate() // Revalidation updates regional cached rows
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Execution mismatch failure.' })
    } finally {
      setActionId(null)
    }
  }

  if (!token) {
    return (
      <div className="text-sm font-mono text-muted-foreground p-6">
        Synchronizing driver session state token...
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64 text-muted-foreground font-mono">
        <RefreshCw className="w-6 h-6 animate-spin mr-2 text-accent" /> 
        STREAMING MARKETPLACE DISPATCH PIPELINE...
      </div>
    )
  }

  if (error) return (
    <div className="bg-destructive/10 text-destructive p-4 border border-destructive/20 rounded-lg flex items-center gap-2 font-mono text-xs">
      <AlertCircle className="w-5 h-5 shrink-0" />
      <span>Pipeline Error: {error.message}</span>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Available Cargo Loads</h2>
          <p className="text-muted-foreground mt-1">Claim open shipments listed in the logistics marketplace pool.</p>
        </div>
        <Button variant="outline" onClick={() => mutate()} className="border-border text-foreground">
          <RefreshCw className="w-4 h-4 mr-1" /> Refresh Pipeline
        </Button>
      </div>

      {message.text && (
        <div className={`p-4 rounded-lg border text-sm flex items-center gap-2 ${
          message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600' : 'bg-destructive/10 border-destructive/20 text-destructive'
        }`}>
          {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span>{message.text}</span>
        </div>
      )}

      {loads?.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-border rounded-xl bg-card">
          <Box className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-foreground font-medium">The marketplace pipeline is currently empty</p>
          <p className="text-muted-foreground text-sm mt-1">Check back shortly for new cargo listings.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {loads?.map((load) => (
            <div key={load.id} className="bg-card border border-border rounded-xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6 transition-all hover:border-accent/40">
              <div className="space-y-2">
                <div className="flex items-center gap-2 font-bold text-lg text-foreground">
                  <MapPin className="w-5 h-5 text-accent" />
                  <span>{load.origin}</span>
                  <span className="text-muted-foreground font-normal">➔</span>
                  <span>{load.destination}</span>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span className="bg-primary/10 text-primary-foreground px-2 py-0.5 rounded font-mono font-medium">ID: #{load.id}</span>
                  <span>•</span>
                  <span>Cargo: <strong className="text-foreground">{load.cargo}</strong></span>
                  <span>•</span>
                  <span>Mass Weight: <strong className="text-foreground">{load.weight}</strong></span>
                </div>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 border-t sm:border-0 pt-4 sm:pt-0 border-border shrink-0">
                <div className="flex items-center gap-0.5 text-2xl font-black text-foreground">
                  <DollarSign className="w-5 h-5 text-accent shrink-0" />
                  <span>{load.price.replace(/[^0-9.]/g, '')}</span>
                </div>
                <Button 
                  onClick={() => handleClaimLoad(load.id)}
                  disabled={actionId !== null}
                  className="bg-accent hover:bg-accent/90 text-white font-bold px-6"
                >
                  {actionId === load.id ? 'Claiming Load...' : 'Accept Load'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}