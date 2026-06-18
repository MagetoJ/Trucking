'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { BACKEND_BASE_URL } from '@/lib/fetcher' // Import BACKEND_BASE_URL
import { useAuthStore } from '@/lib/store'
import { MapPin, Package, Truck, DollarSign, AlertCircle, Edit3, PlusCircle, LayoutList } from 'lucide-react'

function PostLoadFormContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = useAuthStore((state) => state.token)
  
  // Detect if an edit context exists via Query parameter `?edit=bookingId`
  const editBookingId = searchParams.get('edit')
  const preferredDriverId = searchParams.get('preferredDriverId') // <-- Add this
  const isEditMode = !!editBookingId

  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    origin: '',
    destination: '',
    description: '',
    weight: '',
    price: '',
    goodsType: 'GENERAL_CARGO', 
    isFragile: false,
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
        goodsType: 'ELECTRONICS', // Added to simulation
        isFragile: true,          // Added to simulation
      })
    }
  }, [isEditMode, editBookingId])

  // 2. UPDATED to handle both standard inputs/selects and checkboxes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
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
          price: formData.price,
          goodsType: formData.goodsType,
          isFragile: formData.isFragile,
          driverId: preferredDriverId || null // Simplified logic
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

        {/* 4. NEW: Goods Type Dropdown */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">
            <LayoutList className="w-4 h-4 inline mr-2 text-accent" /> Goods Category
          </label>
          <div className="relative">
            <select
              name="goodsType"
              value={formData.goodsType}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-slate-100 placeholder:text-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm font-medium transition-all appearance-none cursor-pointer"
              required
            >
              <option value="GENERAL_CARGO">General Cargo</option>
              <option value="ELECTRONICS">Electronics</option>
              <option value="FURNITURE">Furniture</option>
              <option value="AGRICULTURE">Agricultural Products</option>
              <option value="HAZARDOUS">Hazardous Materials</option>
              <option value="TEXTILES">Textiles & Garments</option>
            </select>
            {/* Custom dropdown arrow for better UI */}
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
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

        {/* 5. NEW: Fragile Checkbox toggle */}
        <div className="flex items-center space-x-3 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
          <input
            type="checkbox"
            name="isFragile"
            id="isFragile"
            checked={formData.isFragile}
            onChange={handleChange}
            className="w-5 h-5 rounded border-slate-700 bg-slate-950 text-accent focus:ring-accent focus:ring-offset-slate-950 cursor-pointer accent-indigo-500"
          />
          <label htmlFor="isFragile" className="text-sm font-semibold text-slate-200 cursor-pointer flex items-center select-none">
            <AlertCircle className={`w-5 h-5 inline mr-2 transition-colors ${formData.isFragile ? 'text-amber-500' : 'text-slate-500'}`} />
            These goods are fragile and require delicate handling
          </label>
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