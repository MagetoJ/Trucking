'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/lib/store'
import { MapPin, Package, Truck, DollarSign, AlertCircle } from 'lucide-react'

export default function PostLoadPage() {
  const router = useRouter()
  const token = useAuthStore((state) => state.token)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    origin: '',
    destination: '',
    description: '',
    weight: '',
    price: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch('http://localhost:5000/api/bookings', {
        method: 'POST',
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
      if (!response.ok) throw new Error(data.error || 'Failed to dispatch cargo load.')

      router.push('/dashboard/shipper/active-bookings')
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h2 className="text-3xl font-bold text-foreground">Post a New Load</h2>
        <p className="text-muted-foreground mt-1">Broadcast freight requirements onto the platform network map.</p>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg flex items-center gap-2 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-8 space-y-6 shadow-sm">
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
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground"
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
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground"
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
            rows={3}
            className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground"
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
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground"
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
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground"
              required
            />
          </div>
        </div>

        <Button type="submit" disabled={isLoading} className="w-full bg-accent hover:bg-accent/90 text-white font-bold py-3 text-base">
          <Truck className="w-5 h-5 mr-2" />
          {isLoading ? 'Streaming specifications to ledger...' : 'Publish Load Offer'}
        </Button>
      </form>
    </div>
  )
}