'use client'

import { useState, useEffect } from 'react'
import useSWR from 'swr'
import { useParams } from 'next/navigation'
import { BACKEND_BASE_URL, authenticatedFetcher } from '@/lib/fetcher'
import { useAuthStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { 
  MapPin, 
  Phone, 
  Package, 
  Scale, 
  DollarSign, 
  Clock, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle, 
  ArrowLeft,
  Milestone,
  CheckCircle2,
  ShieldCheck,
  ClipboardCheck,
  Truck
} from 'lucide-react'
import Link from 'next/link'

interface BookingDetails {
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
  shipper: {
    name: string
    phone: string
    email: string
    rating: number
  }
}

interface ProcedureTask {
  id: string
  label: string
  phase: 'pre-trip' | 'transit' | 'offload'
  done: boolean
}

export default function DriverTripDetailsPage() {
  const token = useAuthStore((state) => state.token)
  const params = useParams()
  const tripId = params.id as string

  const [updating, setUpdating] = useState(false)
  const [errorBanner, setErrorBanner] = useState('')
  const [successBanner, setSuccessBanner] = useState('')

  // State tracker for physical hauler procedures
  const [tasks, setTasks] = useState<ProcedureTask[]>([
    // Pre-Trip / Loading phase tasks
    { id: 'inspect', label: 'Walk-around Safety Inspection (Tires, Brakes, Couplings)', phase: 'pre-trip', done: false },
    { id: 'weight', label: 'Verify Cargo Weight matches Axle Weighbridge thresholds', phase: 'pre-trip', done: false },
    { id: 'secure', label: 'Verify Chain/Strap Tie-downs & Weather Tarping', phase: 'pre-trip', done: false },
    { id: 'bol', label: 'Review & Sign warehouse Bill of Lading (BOL) sheet', phase: 'pre-trip', done: false },
    // En-Route phase tasks
    { id: 'weighbridge', label: 'Highway Weighbridge clearance checked', phase: 'transit', done: false },
    { id: 'hos', label: 'Mandatory Hours-of-Service (HOS) rest brake logged', phase: 'transit', done: false }
  ])

  // Pull real-time manifest state variables directly via relative fetcher mapping paths
  const { data: trip, error, isLoading, mutate } = useSWR<BookingDetails>(
    token && tripId ? `/api/bookings/${tripId}` : null,
    authenticatedFetcher,
    { refreshInterval: 4000 }
  )

  // Auto-fill checklist steps if the driver has already passed those phases in previous app sessions
  useEffect(() => {
    if (trip) {
      if (trip.status === 'IN_TRANSIT' || trip.status === 'COMPLETED') {
        setTasks(prev => prev.map(t => t.phase === 'pre-trip' ? { ...t, done: true } : t))
      }
    }
  }, [trip])

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(task => 
      task.id === id ? { ...task, done: !task.done } : task
    ))
  }

  // Verification helper: Ensures all steps in a specific logistics group are checked
  const isPhaseReady = (phase: 'pre-trip' | 'transit') => {
    return tasks.filter(t => t.phase === phase).every(t => t.done)
  }

  const handleUpdateStatus = async (nextStatus: string, nextProgress: number) => {
    setUpdating(true)
    setErrorBanner('')
    setSuccessBanner('')
    try {
      const response = await fetch(`${BACKEND_BASE_URL}/api/bookings/${tripId}/status-update`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: nextStatus, progress: nextProgress })
      })

      if (!response.ok) throw new Error('Failed to update cargo checkpoint parameters.')
      
      setSuccessBanner(`Milestone updated to ${nextStatus.replace('_', ' ')} successfully!`)
      mutate()
    } catch (err: any) {
      setErrorBanner(err.message || 'Network exception modifying milestone.')
    } finally {
      setUpdating(false)
    }
  }

  const fireArriveEndpoint = async () => {
    setUpdating(true)
    setErrorBanner('')
    setSuccessBanner('')
    try {
      const response = await fetch(`${BACKEND_BASE_URL}/api/bookings/${tripId}/arrive-destination`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to submit terminal site arrival sequence.')
      }

      setSuccessBanner('Delivery notice dispatched! Waiting for shipper confirmation.')
      mutate()
    } catch (err: any) {
      setErrorBanner(err.message || 'Network exception modifying milestone.')
    } finally {
      setUpdating(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64 text-muted-foreground font-mono text-xs">
        <RefreshCw className="w-5 h-5 animate-spin text-accent mr-2" /> STREAMING TRIP LOGISTICS CONFIGURATION MATRIX...
      </div>
    )
  }

  if (error || !trip) {
    return (
      <div className="bg-destructive/10 text-destructive p-5 border border-destructive/20 rounded-xl max-w-xl mx-auto space-y-3 font-mono text-xs mt-6">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <span className="font-bold">Pipeline Access Interrupted</span>
        </div>
        <p>Target assignment record could not be found or you do not have authorized cryptographic visibility keys to view it.</p>
        <Link href="/dashboard/driver/my-trips" className="block pt-2">
          <Button variant="outline" size="sm" className="text-xs">← Return to Trips Ledger</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12 text-foreground">
      
      {/* Upper Navigation Row */}
      <div className="flex items-center justify-between">
        <Link href="/dashboard/driver/my-trips" className="inline-flex items-center gap-1.5 text-xs font-bold text-accent hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to Manifest
        </Link>
        <span className="text-xs text-muted-foreground font-mono bg-muted px-2.5 py-1 rounded-md">Manifest Ref: #{trip.id}</span>
      </div>

      {/* Main Title Row */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-border pb-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Active Route Execution</h2>
          <p className="text-muted-foreground text-xs mt-1 font-mono">Manage haulage milestones and submit checkpoint updates directly to shippers.</p>
        </div>

        <div className="text-right self-start sm:self-center">
          <span className={`inline-block px-3 py-1 rounded-full font-mono text-xs font-bold uppercase border ${
            trip.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' :
            trip.status === 'CANCELLED' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
            'bg-accent/10 text-accent border-accent/20'
          }`}>
            Status: {trip.status}
          </span>
        </div>
      </div>

      {/* Internal State Error Warnings Banner */}
      {errorBanner && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-xl text-xs font-mono flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorBanner}</span>
        </div>
      )}

      {successBanner && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 p-4 rounded-xl text-xs font-mono flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successBanner}</span>
        </div>
      )}

      {/* TRIP TIMELINE TRAJECTORY STEPPER MODULE */}
      {/* TRIP TIMELINE */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-xs space-y-4">
        <h3 className="font-bold text-sm tracking-wide flex items-center gap-2">
          <Milestone className="w-4 h-4 text-accent" /> Journey Checklist Milestones
        </h3>
        
        <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
          <div className="h-full bg-accent transition-all duration-500" style={{ width: `${trip.progress || 15}%` }} />
        </div>

        <div className="flex justify-between items-center text-xs text-muted-foreground">
          <span>Current Progress: <strong>{trip.progress}%</strong></span>
          <span className="font-mono text-accent font-bold uppercase">Status: {trip.status}</span>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-sm border-b pb-2">Waybill Route Bounds</h3>
            <p className="text-sm font-semibold">🏁 Start: {trip.origin}</p>
            <p className="text-sm font-semibold">📍 End: {trip.destination}</p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-sm border-b pb-2">Freight Inventory Details</h3>
            <p className="text-sm">Cargo: <strong>{trip.cargo}</strong> ({trip.weight})</p>
          </div>

          {trip.shipper && (
            <div className="bg-card border border-border rounded-2xl p-6 shadow-xs space-y-4">
              <h3 className="font-bold text-sm border-b pb-2">Client Shipper Contact Information</h3>
              <p className="text-sm font-medium">Name: {trip.shipper.name}</p>
              <p className="text-sm font-mono bg-muted p-2 rounded w-fit">📞 Phone: {trip.shipper.phone}</p>
            </div>
          )}
        </div>

        {/* CONTROLS ACTION PANEL */}
        <div>
          <div className="bg-card border border-border rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-sm border-b pb-2">Transit Operations</h3>
            <div className="text-2xl font-black text-foreground mb-4">{trip.price}</div>

            {trip.status !== 'COMPLETED' && trip.status !== 'CANCELLED' ? (
              <Button
                disabled={updating || trip.progress >= 95}
                onClick={fireArriveEndpoint}
                className="w-full bg-accent hover:bg-accent/90 text-white font-bold py-3 rounded-xl cursor-pointer"
              >
                {updating ? 'Processing...' : trip.progress >= 95 ? 'Arrival Pending Shipper Action' : 'Mark Goods as Arrived 📍'}
              </Button>
            ) : (
              <div className="text-xs text-center p-3 bg-muted rounded-xl font-medium text-muted-foreground">
                This manifest timeline has concluded.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}