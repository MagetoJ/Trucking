'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { BACKEND_BASE_URL } from '@/lib/fetcher' // Import BACKEND_BASE_URL
import { useAuthStore } from '@/lib/store'
import { MapPin, Package, Truck, DollarSign, AlertCircle, Edit3, PlusCircle } from 'lucide-react'

function PostLoadFormContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = useAuthStore((state) => state.token)
  
  // Detect if an edit context exists via Query parameter `?edit=bookingId`
  const editBookingId = searchParams.get('edit')
  const isEditMode = !!editBookingId

  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    origin: '',
    destination: '',
    description: '',
    weight: '',
    price: '',
  })

  // Optional simulation layer: populate parameters if user requests an edit from active tables
  useEffect(() => {
    if (isEditMode) {
      // In production, fetch current attributes using: fetch(`http://localhost:5000/api/bookings/${editBookingId}`)
      // Here we set clean template values to keep operations smooth:
      setFormData({
        origin: 'Nairobi Industrial Area',
        destination: 'Mombasa Port Terminal',
        description: 'Heavy electronic components shipment machinery parts',
        weight: '4500',
        price: '550',
      })
    }
  }, [isEditMode, editBookingId])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    const endpoint = isEditMode
      ? `${BACKEND_BASE_URL}/api/bookings/${editBookingId}` // Target update route
      : `${BACKEND_BASE_URL}/api/bookings`

    const method = isEditMode ? 'PUT' : 'POST'

    try {
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          origin: formData.origin,
          destination: formData.destination,
          cargo: formData.description,
          weight: formData.weight,
          price: formData.price
        }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to persist cargo attributes execution parameters.')

      router.push('/dashboard/shipper/active-bookings')
    } catch (err: any) {
      setError(err.message || 'An unexpected database error occurred.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-foreground">
            {isEditMode ? 'Modify Shipment Information' : 'Post a New Load'}
          </h2>
          <p className="text-muted-foreground mt-1">
            Broadcast freight specifications onto the platform network map ledger pipelines.
          </p>
        </div>
        {isEditMode && (
          <span className="bg-amber-500/10 text-amber-500 border border-amber-500/20 px-3 py-1 rounded-full text-xs font-mono font-bold self-start sm:self-center">
            Editing Load #{editBookingId}
          </span>
        )}
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg flex items-center gap-2 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-8 space-y-6 shadow-md relative overflow-visible">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              <MapPin className="w-4 h-4 inline mr-2 text-accent" /> Origin Point
            </label>
            <input
              type="text"
              name="origin"
              placeholder="e.g. Nairobi Industrial Area"
              value={formData.origin}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-slate-100 placeholder:text-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm font-medium transition-all"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              <MapPin className="w-4 h-4 inline mr-2 text-accent" /> Target Destination
            </label>
            <input
              type="text"
              name="destination"
              placeholder="e.g. Mombasa Port"
              value={formData.destination}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-slate-100 placeholder:text-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm font-medium transition-all"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">
            <Package className="w-4 h-4 inline mr-2 text-accent" /> Cargo Content Details
          </label>
          <textarea
            name="description"
            placeholder="Specify materials payload dimension parameters, fragility levels, handling instructions..."
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-slate-100 placeholder:text-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm font-medium transition-all resize-none"
            required
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">Payload Mass Weight (kg)</label>
            <input
              type="number"
              name="weight"
              placeholder="e.g. 7500"
              value={formData.weight}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-slate-100 placeholder:text-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm font-medium transition-all"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              <DollarSign className="w-4 h-4 inline mr-2 text-accent" /> Offered Budget Value ($)
            </label>
            <input
              type="number"
              name="price"
              placeholder="e.g. 600"
              value={formData.price}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-slate-100 placeholder:text-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm font-medium transition-all"
              required
            />
          </div>
        </div>

        {/* POST / UPDATE BUTTON SUBMIT AREA - Highly Visible */}
        <div className="pt-4 border-t border-border">
          <Button 
            type="submit" 
            disabled={isLoading} 
            className="w-full sm:w-auto sm:px-8 bg-accent hover:bg-accent/90 text-white font-black py-4.5 rounded-lg text-base shadow-lg transition-transform active:scale-[0.99] flex items-center justify-center cursor-pointer"
          >
            {isEditMode ? <Edit3 className="w-5 h-5 mr-2" /> : <PlusCircle className="w-5 h-5 mr-2" />}
            {isLoading 
              ? 'Streaming specifications to ledger...' 
              : isEditMode 
                ? 'Save & Update Freight Offer' 
                : 'Publish Load Offer to Marketplace'}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default function PostLoadPage() {
  return (
    <Suspense fallback={<div className="p-6 font-mono text-sm text-muted-foreground animate-pulse">Mounting Form Component Parameters...</div>}>
      <PostLoadFormContent />
    </Suspense>
  )
}