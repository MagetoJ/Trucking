'use client'

import { useState, useMemo } from 'react'
import useSWR from 'swr'
import { authenticatedFetcher } from '@/lib/fetcher'
import { useAuthStore } from '@/lib/store'
import { GoogleMap, useJsApiLoader, MarkerF, DirectionsRenderer } from '@react-google-maps/api'
import { MapPin, Truck, Clock, DollarSign, Search, RefreshCw, AlertCircle, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface TrackingDetails {
  id: number
  origin: string
  destination: string
  cargo: string
  weight: string
  price: string
  status: string
  progress: number
  eta: string
  shipper?: { name: string; phone: string }
}

const mapContainerStyle = {
  width: '100%',
  height: '100%',
}

const defaultCenter = {
  lat: -1.2921, // Default focus matching Nairobi coordinates context
  lng: 36.8219,
}

export default function RealTimeTrackingPage() {
  const token = useAuthStore((state) => state.token)
  const [searchId, setSearchId] = useState('')
  const [activeTrackingId, setActiveTrackingId] = useState<string | null>(null)

  // Load Google Maps JavaScript SDK Core scripts safely using process API keys
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  })

  const { data: trip, error, isLoading } = useSWR<TrackingDetails>(
    token && activeTrackingId ? `http://localhost:5000/api/bookings/${activeTrackingId}` : null,
    authenticatedFetcher,
    { refreshInterval: 4000 }
  )

  const handleTrackTrigger = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchId.trim()) {
      setActiveTrackingId(searchId.trim())
    }
  }

  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center h-64 text-muted-foreground font-mono text-sm">
        <RefreshCw className="w-5 h-5 animate-spin text-accent mr-2" /> INITIALIZING INTERACTIVE GOOGLE MAPS API ENGINE...
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto text-black pb-12">
      <div>
        <h2 className="text-3xl font-bold text-foreground">Live Telemetry & Tracking</h2>
        <p className="text-muted-foreground mt-1">Monitor shipment locations, verify cargo details, and review travel milestones.</p>
      </div>

      {/* Query Lookups Input Form */}
      <form onSubmit={handleTrackTrigger} className="bg-card border border-border rounded-xl p-5 shadow-xs flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Enter active Booking or Trip Reference ID (e.g., 1, 2, 3)"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-border rounded-xl bg-background text-foreground focus:ring-2 focus:ring-accent outline-none font-medium text-sm"
            required
          />
        </div>
        <Button type="submit" className="bg-accent hover:bg-accent/90 text-white font-bold px-6 rounded-xl cursor-pointer">
          Locate Shipment
        </Button>
      </form>

      {activeTrackingId && isLoading && (
        <p className="text-sm font-mono text-muted-foreground animate-pulse">Querying relational database mapping coordinates...</p>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center gap-2 text-xs font-mono">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>Tracking pipeline error: Target assignment payload could not be located or verified.</span>
        </div>
      )}

      {trip && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Visual Map Widget Box (2 Columns wide) */}
          <div className="lg:col-span-2 h-[450px] bg-card border border-border rounded-2xl overflow-hidden shadow-sm relative">
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={defaultCenter}
              zoom={12}
              options={{
                disableDefaultUI: false,
                zoomControl: true,
              }}
            >
              {/* Plotting active baseline coordinates landmarks */}
              <MarkerF position={defaultCenter} label="🚚" />
            </GoogleMap>
          </div>

          {/* Right Column Metrics Summary Card */}
          <div className="space-y-4">
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="font-extrabold text-lg text-foreground border-b pb-2">Shipment Tracking Metadata</h3>
              
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Manifest Route</span>
                  <div className="flex items-center gap-1.5 font-bold text-slate-900 mt-1">
                    <MapPin className="w-4 h-4 text-accent shrink-0" />
                    <span className="truncate max-w-[110px]">{trip.origin}</span>
                    <span className="text-slate-400 font-normal">➔</span>
                    <span className="truncate max-w-[110px]">{trip.destination}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t pt-3">
                  <div>
                    <span className="text-xs text-slate-400 font-bold uppercase block">Current ETA</span>
                    <p className="font-bold text-foreground text-base mt-0.5">{trip.eta}</p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 font-bold uppercase block">Freight Cost</span>
                    <p className="font-mono font-bold text-emerald-600 text-base mt-0.5">{trip.price}</p>
                  </div>
                </div>

                <div className="border-t pt-3">
                  <span className="text-xs text-slate-400 font-bold uppercase block mb-1">Transit Completion Mile</span>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div className="bg-accent h-2 rounded-full" style={{ width: `${trip.progress || 10}%` }} />
                  </div>
                  <p className="text-[10px] font-mono text-slate-400 text-right mt-1">{trip.progress || 10}% Progress Tracked</p>
                </div>

                <div className="border-t pt-3 flex justify-between items-center">
                  <span className="text-xs text-slate-400 font-bold uppercase">Lifecycle Status</span>
                  <span className="px-2.5 py-0.5 bg-accent/10 border border-accent/20 text-accent font-mono text-[10px] font-black rounded-full uppercase">
                    {trip.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}