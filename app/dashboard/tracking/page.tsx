'use client'

import { useState, useEffect, useMemo } from 'react'
import useSWR from 'swr'
import { authenticatedFetcher } from '@/lib/fetcher'
import { useAuthStore } from '@/lib/store'
import { MapPin, Search, RefreshCw, AlertCircle, Milestone } from 'lucide-react'
import { Button } from '@/components/ui/button'

// Dynamically import Leaflet components to prevent Next.js Server-Side Rendering (SSR) reference errors
import dynamic from 'next/dynamic'

const MapContainer = dynamic(() => import('react-leaflet').then((mod) => mod.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import('react-leaflet').then((mod) => mod.TileLayer), { ssr: false })
const Marker = dynamic(() => import('react-leaflet').then((mod) => mod.Marker), { ssr: false })
const Polyline = dynamic(() => import('react-leaflet').then((mod) => mod.Polyline), { ssr: false })

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
}

// Helper coordinates mapping baseline cities for Kenya logistics pipelines
const CITY_COORDINATES: Record<string, [number, number]> = {
  "nairobi": [-1.2921, 36.8219],
  "naivasha": [-0.7172, 36.4310],
  "nakuru": [-0.3031, 36.0800],
  "kericho": [-0.3677, 35.2831],
  "eldoret": [0.5143, 35.2697],
  "kisumu": [-0.1022, 34.7617],
  "mombasa": [-4.0435, 39.6682]
}

export default function RealTimeTrackingPage() {
  const token = useAuthStore((state) => state.token)
  const [searchId, setSearchId] = useState('')
  const [activeTrackingId, setActiveTrackingId] = useState<string | null>(null)
  const [routeCoordinates, setRouteCoordinates] = useState<[number, number][]>([])

  // Inject standard Leaflet map style layers onto document header at runtime to format markers
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)
    }
  }, [])

  const { data: trip, error, isLoading } = useSWR<TrackingDetails>(
    token && activeTrackingId ? `/api/bookings/${activeTrackingId}` : null,
    authenticatedFetcher,
    { refreshInterval: 5000, revalidateOnFocus: false }
  )

  // Fetch the free OSRM highway route path geometry when a valid trip loads
  useEffect(() => {
    if (!trip) return

    const originKey = trip.origin.toLowerCase().trim()
    const destKey = trip.destination.toLowerCase().trim()

    const startCoords = CITY_COORDINATES[originKey] || CITY_COORDINATES["nairobi"]
    const endCoords = CITY_COORDINATES[destKey] || CITY_COORDINATES["kisumu"]

    // Query the Open-Source Routing Machine (OSRM) free demo cluster engine
    const url = `https://router.project-osrm.org/route/v1/driving/${startCoords[1]},${startCoords[0]};${endCoords[1]},${endCoords[0]}?overview=full&geometries=geojson`

    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (data.routes && data.routes.length > 0) {
          // Convert GeoJSON Long/Lat segments back to Leaflet Lat/Long arrays
          const coords = data.routes[0].geometry.coordinates.map((c: [number, number]) => [c[1], c[0]])
          setRouteCoordinates(coords)
        }
      })
      .catch(err => console.error("OSRM Route engine failure:", err))
  }, [trip])

  const handleTrackTrigger = (e: React.FormEvent) => {
    e.preventDefault()
    const cleanId = searchId.trim().replace(/\D/g, '')
    if (cleanId) {
      setActiveTrackingId(cleanId)
    }
  }

  // Determine center focus coordinates based on search target parameters
  const currentMapCenter = trip ? (CITY_COORDINATES[trip.origin.toLowerCase().trim()] || [-1.2921, 36.8219]) : [-1.2921, 36.8219]

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <div>
        <h2 className="text-3xl font-bold text-slate-100">Live Telemetry & Tracking</h2>
        <p className="text-slate-400 text-xs font-mono mt-1">Audit active shipment routes using open-source OpenStreetMap frameworks.</p>
      </div>

      {/* Query Lookups Input Form */}
      <form onSubmit={handleTrackTrigger} className="bg-slate-900 border border-slate-800/80 p-4 rounded-xl flex gap-4 shadow-xl">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Enter Numeric Booking or Trip Reference ID (e.g., 1, 2, 3)..."
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-slate-200 placeholder:text-slate-600 focus:border-indigo-500 outline-none text-sm font-medium transition-all"
            required
          />
        </div>
        <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 rounded-xl cursor-pointer">
          Locate Consignment
        </Button>
      </form>

      {activeTrackingId && isLoading && (
        <p className="text-xs font-mono text-slate-500 animate-pulse">Querying relational database mapping indicators...</p>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center gap-2 text-xs font-mono max-w-xl">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>Tracking Pipeline Error: Target consignment manifest record #{activeTrackingId} could not be located or verified under your active authorization scope.</span>
        </div>
      )}

      {trip && !isLoading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          {/* Main Visual Map Widget Box (2 Columns wide) */}
          {/* OPENSTREETMAP CANVAS COMPONENT */}
          <div className="lg:col-span-2 h-[450px] bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden relative shadow-2xl z-10">
            <MapContainer 
              center={currentMapCenter as [number, number]} 
              zoom={7} 
              style={{ width: '100%', height: '100%', background: '#0f172a' }}
            >
              {/* Using Stadia Smooth Dark theme tiles for a continuous ecosystem layout look */}
              <TileLayer
                url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
                {...({
                  attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                } as any)}
              />
              
              {routeCoordinates.length > 0 && (
                <>
                  <Polyline positions={routeCoordinates} color="#6366f1" weight={4} />
                  <Marker position={routeCoordinates[0]} />
                  <Marker position={routeCoordinates[routeCoordinates.length - 1]} />
                </>
              )}
            </MapContainer>
          </div>

          {/* Right Column Metrics Summary Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-xl text-sm">
            <h3 className="font-bold text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-2"><Milestone className="w-4 h-4 text-indigo-500" /> Consignment Manifest</h3>
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Waybill Route Corridor</span>
                <div className="flex items-center gap-1.5 font-bold text-slate-200 mt-1 text-sm">
                  <MapPin className="w-4 h-4 text-orange-500 shrink-0" />
                  <span className="truncate max-w-[110px]">{trip.origin}</span>
                  <span className="text-slate-600 font-normal">➔</span>
                  <span className="truncate max-w-[110px]">{trip.destination}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 border-t border-slate-800 pt-3">
                <div>
                  <span className="text-[10px] font-mono text-slate-500 uppercase block">Expected ETA</span>
                  <p className="font-bold text-orange-400 mt-0.5">{trip.eta}</p>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-slate-500 uppercase block">Escrow Valuation</span>
                  <p className="font-mono font-bold text-emerald-400 mt-0.5">{trip.price}</p>
                </div>
              </div>
              <div className="border-t border-slate-800 pt-3">
                <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1">Transit Track Milestone</span>
                <div className="w-full bg-slate-950 rounded-full h-2 mt-2 overflow-hidden border border-slate-800">
                  <div className="bg-indigo-500 h-2 rounded-full transition-all duration-300" style={{ width: `${trip.progress || 10}%` }} />
                </div>
                <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 mt-1">
                  <span>Status: <strong className="text-orange-400 uppercase">{trip.status}</strong></span>
                  <span>{trip.progress || 10}% Progress</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}