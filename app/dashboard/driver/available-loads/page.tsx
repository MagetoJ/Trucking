'use client'

import useSWR from 'swr'
import { useState } from 'react'
import { BACKEND_BASE_URL, authenticatedFetcher } from '@/lib/fetcher' // Import BACKEND_BASE_URL
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
    token ? '/api/bookings?role=driver' : null, // 👈 Strip out ${BACKEND_BASE_URL}
    authenticatedFetcher,
    { refreshInterval: 4000 } // Poll every 4 seconds for live sync
  )

  const handleJobAction = async (id: number, action: 'accept' | 'decline') => {
    setActionId(id)
    setMessage({ type: '', text: '' })

    try {
      const response = await fetch(`${BACKEND_BASE_URL}/api/bookings/${id}/${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      
      if (!response.ok) {
        // Surfaced directly from our backend route-matching constraints check
        throw new Error(data.error || 'Failed to complete job offer action.')
      }

      if (action === 'decline') {
        setMessage({ type: 'success', text: 'Job offer successfully declined and returned to open marketplace pools.' })
      } else {
        setMessage({ type: 'success', text: 'Job offer accepted! Route contract assigned onto your workspace manifest.' })
      }
      
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
      <div className="flex justify-center items-center h-64 text-slate-400 font-mono text-xs">
        <RefreshCw className="w-5 h-5 animate-spin mr-2 text-indigo-500" /> 
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
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-100">Marketplace Load Offers</h2>
          <p className="text-slate-400 text-xs font-mono mt-1">Review live anonymized cargo hauling demands. Claim routes to unlock shipper details.</p>
        </div>
        <Button variant="outline" onClick={() => mutate()} className="border-slate-800 text-slate-300 hover:bg-slate-900 text-xs font-mono">
          <RefreshCw className="w-3.5 h-3.5 mr-1" /> Force Refresh Feed
        </Button>
      </div>

      {message.text && (
        <div className={`p-4 rounded-xl border text-xs font-mono flex items-center gap-2 ${
          message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-destructive/10 border-destructive/20 text-destructive'
        }`}>
          {message.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{message.text}</span>
        </div>
      )}

      {activeAvailableLoads.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-slate-900 rounded-xl bg-slate-900/40">
          <Box className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-300 text-sm font-bold">Marketplace pipeline is empty</p>
          <p className="text-slate-500 text-xs mt-1 font-mono">Waiting for downstream corporate shippers to publish new specifications...</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {activeAvailableLoads.map((load) => (
            <div key={load.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all hover:border-indigo-500/40 shadow-xl">
              <div className="space-y-2">
                <div className="flex items-center gap-2 font-bold text-base text-slate-200">
                  <MapPin className="w-4 h-4 text-orange-500" />
                  <span>{load.origin}</span>
                  <span className="text-slate-600 font-normal">➔</span>
                  <span>{load.destination}</span>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                  <span className="bg-slate-950 text-slate-500 border border-slate-850 px-2 py-0.5 rounded font-mono font-bold">ID: #{load.id}</span>
                  <span>•</span>
                  <span>Cargo: <strong className="text-slate-300">{load.cargo}</strong></span>
                  <span>•</span>
                  <span>Mass: <strong className="text-slate-300">{load.weight}</strong></span>
                </div>
              </div>

              <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-4 border-t md:border-0 pt-4 md:pt-0 border-slate-800 shrink-0">
                <div className="flex items-center text-xl font-black text-slate-200">
                  <DollarSign className="w-4 h-4 text-orange-500 shrink-0" />
                  <span>{load.price.replace(/[^0-9.]/g, '')}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleJobAction(load.id, 'decline')}
                    disabled={actionId !== null}
                    className="px-3 py-1.5 border border-red-500/20 bg-red-500/5 text-red-400 hover:bg-red-500/10 rounded-lg text-xs font-bold font-mono transition cursor-pointer"
                  >
                    Decline
                  </button>
                  <Button 
                    onClick={() => handleJobAction(load.id, 'accept')}
                    disabled={actionId !== null}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs h-8 px-4 cursor-pointer rounded-lg"
                  >
                    {actionId === load.id ? 'Claiming...' : 'Accept Offer'}
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