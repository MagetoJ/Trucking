'use client'

import { useState } from 'react'
import { MapPin, Truck, Clock, DollarSign, Phone, User } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function TrackingPage() {
  const [trackingId, setTrackingId] = useState('')
  const [isTracking, setIsTracking] = useState(false)

  const handleTrack = () => {
    if (trackingId) {
      setIsTracking(true)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground">Real-Time Tracking</h2>
        <p className="text-muted-foreground mt-1">Track shipments and trips in real-time</p>
      </div>

      {/* Search Box */}
      <div className="bg-card border border-border rounded-lg p-8">
        <div className="flex gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Enter Booking ID or Trip ID (e.g., BK001, TP042)"
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value)}
              className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent bg-background text-foreground"
            />
          </div>
          <Button
            onClick={handleTrack}
            disabled={!trackingId}
            className="bg-accent hover:bg-accent/90 text-primary font-bold px-8"
          >
            Track
          </Button>
        </div>
      </div>

      {/* Active Tracking */}
      {isTracking && (
        <div className="space-y-6">
          {/* Map Placeholder */}
          <div className="bg-card border border-border rounded-lg overflow-hidden h-96 flex items-center justify-center">
            <div className="text-center">
              <MapPin className="w-16 h-16 text-accent/30 mx-auto mb-4" />
              <p className="text-foreground font-medium mb-2">Live Map Tracking</p>
              <p className="text-muted-foreground text-sm">Integration with Google Maps API ready for backend connection</p>
            </div>
          </div>

          {/* Tracking Details */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Left Side - Trip Info */}
            <div className="space-y-4">
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="text-xl font-bold text-foreground mb-4">Trip Information</h3>

                <div className="space-y-4">
                  {/* Route */}
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">Route</p>
                    <div className="flex items-center gap-2 mt-2">
                      <MapPin className="w-5 h-5 text-accent" />
                      <span className="font-semibold text-foreground">Nairobi Industrial</span>
                      <span className="text-muted-foreground">→</span>
                      <span className="font-semibold text-foreground">Mombasa Port</span>
                    </div>
                  </div>

                  {/* Distance & Time */}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                    <div>
                      <p className="text-xs text-muted-foreground">Total Distance</p>
                      <p className="text-2xl font-bold text-foreground">480 km</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">ETA</p>
                      <p className="text-2xl font-bold text-foreground">2:15h</p>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="pt-4 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-3">Progress</p>
                    <div className="w-full bg-muted rounded-full h-3">
                      <div className="bg-accent h-3 rounded-full" style={{ width: '68%' }} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">68% Complete</p>
                  </div>

                  {/* Status */}
                  <div className="pt-4 border-t border-border">
                    <span className="inline-block bg-accent/20 text-accent px-3 py-1 rounded-full text-xs font-semibold">
                      In Transit
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Driver & Pricing */}
            <div className="space-y-4">
              {/* Driver Info */}
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="text-xl font-bold text-foreground mb-4">Driver Information</h3>

                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border">
                  <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center text-accent text-2xl font-bold">
                    SK
                  </div>
                  <div>
                    <p className="font-bold text-foreground">Sarah Kipchoge</p>
                    <p className="text-sm text-muted-foreground">Rating: 4.9 ⭐</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Truck className="w-5 h-5 text-accent" />
                    <div>
                      <p className="text-xs text-muted-foreground">Vehicle</p>
                      <p className="font-semibold text-foreground">32-Ton Truck (KBC 123X)</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-accent" />
                    <div>
                      <p className="text-xs text-muted-foreground">Contact</p>
                      <p className="font-semibold text-foreground">+254 712 345 679</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="text-xl font-bold text-foreground mb-4">Pricing Details</h3>

                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-3 border-b border-border">
                    <span className="text-muted-foreground">Base Price</span>
                    <span className="font-semibold text-foreground">$450</span>
                  </div>

                  <div className="flex items-center justify-between pb-3 border-b border-border">
                    <span className="text-muted-foreground">Insurance</span>
                    <span className="font-semibold text-foreground">$50</span>
                  </div>

                  <div className="flex items-center justify-between pt-3">
                    <span className="font-bold text-foreground">Total</span>
                    <span className="text-2xl font-bold text-accent">$500</span>
                  </div>
                </div>

                <Button className="w-full mt-6 bg-accent hover:bg-accent/90 text-primary font-bold">
                  Chat with Driver
                </Button>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-xl font-bold text-foreground mb-6">Journey Timeline</h3>

            <div className="space-y-4">
              {[
                { status: 'Pickup Confirmed', time: '8:30 AM', completed: true },
                { status: 'In Transit', time: 'Current', completed: true },
                { status: 'Arriving Soon', time: '~11:00 AM', completed: false },
                { status: 'Delivery Complete', time: 'Pending', completed: false },
              ].map((event, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-4 h-4 rounded-full ${event.completed ? 'bg-accent' : 'border-2 border-muted'}`} />
                    {index < 3 && <div className="w-1 h-8 bg-muted mt-2" />}
                  </div>
                  <div className="pb-4">
                    <p className="font-semibold text-foreground">{event.status}</p>
                    <p className="text-sm text-muted-foreground">{event.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Info Box */}
      {!isTracking && (
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-6 text-center">
          <MapPin className="w-12 h-12 text-primary/30 mx-auto mb-3" />
          <p className="text-foreground font-medium mb-2">Real-Time Tracking Ready</p>
          <p className="text-muted-foreground text-sm">
            Enter a booking or trip ID above to start tracking your shipment in real-time with live GPS updates.
          </p>
        </div>
      )}
    </div>
  )
}
