'use client'

import { Button } from '@/components/ui/button'
import { MapPin, Package, DollarSign, ChevronRight, Filter } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

const LOADS = [
  {
    id: 1,
    origin: 'Nairobi Industrial Area',
    destination: 'Mombasa Port',
    weight: '15 tons',
    cargo: 'Electronics & Appliances',
    distance: '480 km',
    price: '$580',
    posted: '30 mins ago',
    shipper: 'John Mwangi',
  },
  {
    id: 2,
    origin: 'Nakuru Town',
    destination: 'Kisumu City',
    weight: '8 tons',
    cargo: 'Cement & Building Materials',
    distance: '260 km',
    price: '$320',
    posted: '1 hour ago',
    shipper: 'Grace Kariuki',
  },
  {
    id: 3,
    origin: 'Kitale',
    destination: 'Nairobi CBD',
    weight: '12 tons',
    cargo: 'Grains & Agricultural Products',
    distance: '380 km',
    price: '$450',
    posted: '2 hours ago',
    shipper: 'Lucy Njeri',
  },
  {
    id: 4,
    origin: 'Eldoret',
    destination: 'Mombasa',
    weight: '20 tons',
    cargo: 'Heavy Machinery',
    distance: '600 km',
    price: '$750',
    posted: '3 hours ago',
    shipper: 'Mike Industries',
  },
]

export default function AvailableLoadsPage() {
  const [filterDistance, setFilterDistance] = useState('all')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Available Loads</h2>
          <p className="text-muted-foreground mt-1">Find loads that match your route</p>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-muted-foreground" />
          <select
            value={filterDistance}
            onChange={(e) => setFilterDistance(e.target.value)}
            className="px-4 py-2 border border-border rounded-lg bg-background text-foreground"
          >
            <option value="all">All Distances</option>
            <option value="short">Short (0-200 km)</option>
            <option value="medium">Medium (200-500 km)</option>
            <option value="long">Long (500+ km)</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4">
        {LOADS.map((load) => (
          <Link key={load.id} href={`/dashboard/driver/available-loads/${load.id}`}>
            <div className="bg-card border border-border rounded-lg p-6 hover:border-accent transition-colors cursor-pointer">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-accent" />
                      <span className="font-semibold text-foreground">{load.origin}</span>
                      <span className="text-muted-foreground">→</span>
                      <span className="font-semibold text-foreground">{load.destination}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm mb-3">
                    <span className="bg-accent/10 text-accent px-2 py-1 rounded text-xs font-semibold">{load.weight}</span>
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Package className="w-4 h-4" />
                      {load.cargo}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{load.distance}</span>
                    <span>•</span>
                    <span>Posted {load.posted}</span>
                    <span>•</span>
                    <span>Shipper: {load.shipper}</span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground mt-2" />
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-accent" />
                  <span className="text-xl font-bold text-foreground">{load.price}</span>
                </div>
                <Button className="bg-accent hover:bg-accent/90 text-primary font-bold">
                  Accept Load
                </Button>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
