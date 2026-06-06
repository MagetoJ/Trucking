'use client'

import { Button } from '@/components/ui/button'
import { MapPin, Package, Truck, DollarSign } from 'lucide-react'
import { useState } from 'react'

export default function PostLoadPage() {
  const [formData, setFormData] = useState({
    origin: '',
    destination: '',
    description: '',
    weight: '',
    dimensions: '',
    pickupDate: '',
    price: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form submitted:', formData)
    alert('Load posted successfully! (Demo)')
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground">Post a Load</h2>
        <p className="text-muted-foreground mt-1">Create a new shipment request</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-card border border-border rounded-lg p-8 space-y-6">
        {/* Locations */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              <MapPin className="w-4 h-4 inline mr-2" />
              Origin Location
            </label>
            <input
              type="text"
              name="origin"
              placeholder="Starting location"
              value={formData.origin}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent bg-background text-foreground"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              <MapPin className="w-4 h-4 inline mr-2" />
              Destination
            </label>
            <input
              type="text"
              name="destination"
              placeholder="Ending location"
              value={formData.destination}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent bg-background text-foreground"
              required
            />
          </div>
        </div>

        {/* Cargo Details */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">
            <Package className="w-4 h-4 inline mr-2" />
            Cargo Description
          </label>
          <textarea
            name="description"
            placeholder="Describe your cargo (type, fragility, special handling, etc.)"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent bg-background text-foreground"
            required
          />
        </div>

        {/* Cargo Specs */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">Weight (kg)</label>
            <input
              type="number"
              name="weight"
              placeholder="e.g., 500"
              value={formData.weight}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent bg-background text-foreground"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">Dimensions</label>
            <input
              type="text"
              name="dimensions"
              placeholder="L x W x H (cm)"
              value={formData.dimensions}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent bg-background text-foreground"
            />
          </div>
        </div>

        {/* Pickup Date and Price */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">Pickup Date</label>
            <input
              type="date"
              name="pickupDate"
              value={formData.pickupDate}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent bg-background text-foreground"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              <DollarSign className="w-4 h-4 inline mr-2" />
              Offered Price
            </label>
            <input
              type="number"
              name="price"
              placeholder="0.00"
              value={formData.price}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent bg-background text-foreground"
              required
            />
          </div>
        </div>

        {/* Submit */}
        <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-primary font-bold py-2">
          <Truck className="w-4 h-4 mr-2" />
          Post Load
        </Button>
      </form>
    </div>
  )
}
