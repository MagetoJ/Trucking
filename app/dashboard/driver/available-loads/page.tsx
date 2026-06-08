'use client'

import useSWR from 'swr'
import { useState } from 'react'
import { authenticatedFetcher } from '@/lib/fetcher'
import { useAuthStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { MapPin, RefreshCw, AlertCircle, CheckCircle, Box, DollarSign, XCircle, CheckCircle2 } from 'lucide-react'

interface OpenBooking {
  id: number
  origin: string
  destination: string
  cargo: string
  weight: string
  price: string
  status: string
}

export default function AvailableLoadsPage() {
  const token = useAuthStore((state) => state.token)
  const [actionId, setActionId] = useState<number | null>(null)
  const [declinedJobIds, setDeclinedJobIds] = useState<number[]>([])
  const [message, setMessage] = useState({ type: '', text: '' })
  
  const { data: loads, error, isLoading, mutate } = useSWR<OpenBooking[]>(
    token ? 'http://localhost:5000/api/bookings?role=driver' : null,
    authenticatedFetcher,
    { refreshInterval: 4000 } // Poll every 4 seconds for live sync
  )

  const handleJobAction = async (id: number, action: 'accept' | 'decline') => {
    setActionId(id)
    setMessage({ type: '', text: '' })

    try {
      const response = await fetch(`http://localhost:5000/api/bookings/${id}/${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      
      if (action === 'decline') {
        setDeclinedJobIds((prev) => [...prev, id])
        setMessage({ type: 'success', text: 'Job offer declined and removed from your active feed.' })
        mutate()
        return
      }

      if (response.status === 410) {
        setDeclinedJobIds((prev) => [...prev, id])
        throw new Error("Job Taken! Another driver claimed this offer.")
      }

      if (!response.ok) throw new Error(data.error || 'Failed to complete job offer action.')

      setMessage({ type: 'success', text: 'Job offer accepted! Trip generated under your My Trips workspace.' })
      mutate()
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Execution mismatch failure.' })
    } finally {
      setActionId(null)
    }
  }

  if (!token) {
    return (
      <div className="text-sm font-mono text-muted-foreground p-6">
        Synchronizing driver session state...
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64 text-muted-foreground font-mono">
        <RefreshCw className="w-6 h-6 animate-spin mr-2 text-accent" /> 
        STREAMING LIVE LOGISTICS MARKETPLACE...
      </div>
    )
  }

  if (error) return (
    <div className="bg-destructive/10 text-destructive p-4 border border-destructive/20 rounded-lg flex items-center gap-2 font-mono text-xs">
      <AlertCircle className="w-5 h-5 shrink-0" />
      <span>Pipeline Error: {error.message}</span>
    </div>
  )

  // Filter out listings that this instance knows are fully confirmed/taken or no longer pending
  const activeAvailableLoads = loads?.filter(load => load.status === 'PENDING' && !declinedJobIds.includes(load.id)) || []

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Available Marketplace Offers</h2>
          <p className="text-muted-foreground mt-1">Review live cargo haulage requests. Accept to claim or decline to hide them.</p>
        </div>
        <Button variant="outline" onClick={() => mutate()} className="border-border text-foreground">
          <RefreshCw className="w-4 h-4 mr-1" /> Refresh Feed
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

      {activeAvailableLoads.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-border rounded-xl bg-card">
          <Box className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-foreground font-medium">The marketplace pipeline is currently empty</p>
          <p className="text-muted-foreground text-sm mt-1">Waiting for an upstream shipper to upload a new load offer...</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {activeAvailableLoads.map((load) => (
            <div key={load.id} className="bg-card border border-border rounded-xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all hover:border-accent/40">
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
                  <span>Cargo classification: <strong className="text-foreground">{load.cargo}</strong></span>
                  <span>•</span>
                  <span>Mass Weight: <strong className="text-foreground">{load.weight}</strong></span>
                </div>
              </div>

              <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-4 border-t md:border-0 pt-4 md:pt-0 border-border shrink-0">
                <div className="flex items-center gap-0.5 text-2xl font-black text-foreground">
                  <DollarSign className="w-5 h-5 text-accent shrink-0" />
                  <span>{load.price.replace(/[^0-9.]/g, '')}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleJobAction(load.id, 'decline')}
                    disabled={actionId !== null}
                    className="px-4 py-2 border border-red-500/30 text-red-500 hover:bg-red-500/10 rounded-lg text-sm font-medium transition cursor-pointer flex items-center gap-1.5"
                  >
                    <XCircle className="w-4 h-4" /> Decline
                  </button>
                  <Button 
                    onClick={() => handleJobAction(load.id, 'accept')}
                    disabled={actionId !== null}
                    className="bg-accent hover:bg-accent/90 text-white font-bold px-5 cursor-pointer"
                  >
                    {actionId === load.id ? 'Processing...' : 'Accept Offer'}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}