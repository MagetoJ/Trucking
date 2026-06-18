'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { BACKEND_BASE_URL } from '@/lib/fetcher'
import { useAuthStore } from '@/lib/store'
import { Users, Star, Truck, ShieldCheck, Zap, Phone } from 'lucide-react'

export default function PreferredDriversPage() {
  const [drivers, setDrivers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  
  // Get current user (shipper) info
  const { user, token } = useAuthStore()

  useEffect(() => {
    const fetchPreferredDrivers = async () => {
      try {
        const res = await fetch(`${BACKEND_BASE_URL}/api/shipper-tools/${user?.id}/preferred-drivers`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        const data = await res.json()
        if (Array.isArray(data)) { // Ensure data is an array before setting state
          setDrivers(data)
        }
      } catch (err) {
        console.error("Failed to fetch driver network", err)
      } finally {
        setIsLoading(false)
      }
    }

    if (user?.id) fetchPreferredDrivers()
  }, [user, token])

  // Direct Book Feature
  const handleDirectBook = (driverId: string) => {
    // Redirects to post-load, but passes the specific driverId in the URL
    // so the backend knows this isn't a public load offer, it's a direct assignment.
    router.push(`/dashboard/shipper/post-load?preferredDriverId=${driverId}`)
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <div>
        <h2 className="text-3xl font-bold text-foreground flex items-center">
          <Users className="w-8 h-8 mr-3 text-accent" />
          My Trusted Network
        </h2>
        <p className="text-muted-foreground mt-1">
          Drivers you've favorited for their excellent service. Book them directly to guarantee your load is handled by someone you trust.
        </p>
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 bg-slate-800 rounded-xl w-full"></div>
          ))}
        </div>
      ) : drivers.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center flex flex-col items-center">
          <ShieldCheck className="w-16 h-16 text-slate-700 mb-4" />
          <h3 className="text-xl font-bold text-slate-300 mb-2">No trusted drivers yet</h3>
          <p className="text-slate-500 max-w-md">
            When a driver successfully completes a delivery for you, you can add them to your Trusted Network here for faster, safer rebooking.
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {drivers.map((driver) => (
            <div key={driver.id} className="bg-card border border-border rounded-xl p-6 shadow-md hover:border-indigo-500/50 transition-all group relative overflow-hidden">
              
              {/* Top Badge */}
              <div className="absolute top-0 right-0 bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-bl-lg text-xs font-bold flex items-center">
                <ShieldCheck className="w-3 h-3 mr-1" />
                Verified
              </div>

              {/* Driver Header */}
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center border-2 border-slate-700">
                  <Users className="w-8 h-8 text-slate-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-100">{driver.name}</h3>
                  <div className="flex items-center text-amber-500 text-sm font-semibold">
                    <Star className="w-4 h-4 fill-current mr-1" />
                    {driver.rating?.toFixed(1) || '5.0'} Rating
                  </div>
                </div>
              </div>

              {/* Driver Stats/Info */}
              <div className="space-y-2 mb-6">
                <div className="flex items-center text-sm text-slate-400">
                  <Phone className="w-4 h-4 mr-2 text-slate-500" />
                  {driver.phone}
                </div>
                <div className="flex items-center text-sm text-slate-400">
                  <Truck className="w-4 h-4 mr-2 text-slate-500" />
                  {/* Assuming driver.vehicles is an array, take the first one for display */}
                  {driver.vehicles?.[0]?.type || 'Heavy Duty Truck'} • {driver.vehicles?.[0]?.plate || 'Verified Plate'}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-auto">
                <Button 
                  onClick={() => handleDirectBook(driver.id)}
                  className="w-full bg-accent hover:bg-accent/90 text-white font-bold"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Direct Book
                </Button>
                <Button variant="outline" className="px-3 border-destructive/20 text-destructive hover:bg-destructive/10 hover:text-destructive">
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}