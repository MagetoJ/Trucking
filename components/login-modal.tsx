'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { BACKEND_BASE_URL } from '@/lib/fetcher' // Import BACKEND_BASE_URL
import { useAuthStore } from '@/lib/store'
import { X, Truck, Eye, EyeOff } from 'lucide-react'

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
  onToggleView: () => void // Triggers a switch to the Register view panel
}

export default function LoginModal({ isOpen, onClose, onToggleView }: LoginModalProps) {
  const router = useRouter()
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const loginStore = useAuthStore((state) => state.login) // Renamed to avoid conflict with local login function

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      // Authenticates with /api/auth/login and stores session safely in localStorage (assuming loginStore uses BACKEND_BASE_URL internally)
      await loginStore(phone, password)
      onClose()
      router.push('/dashboard') // Redirects directly to the workspace
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-card border border-border rounded-xl shadow-2xl relative flex flex-col overflow-hidden">
        
        {/* Dismiss trigger */}
        <button
          onClick={onClose}
          aria-label="Close"
          title="Close"
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors z-10 p-1 rounded-full hover:bg-muted"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6">
          {/* Logo Header */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Truck className="w-8 h-8 text-accent" />
              <span className="text-2xl font-bold text-foreground">TruckHub</span>
            </div>
            <h2 className="text-xl font-bold text-foreground">Welcome Back</h2>
            <p className="text-xs text-muted-foreground mt-1">Sign in to your account to continue</p>
          </div>

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-2.5 rounded-lg text-xs mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="modal-phone" className="block text-xs font-semibold text-foreground mb-1.5">
                Phone Number
              </label>
              <input
                id="modal-phone"
                type="tel"
                placeholder="+254 712 345678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent bg-background text-foreground"
                required
              />
            </div>

            <div>
              <label htmlFor="modal-password" className="block text-xs font-semibold text-foreground mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="modal-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent bg-background text-foreground pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading || !phone || !password}
              className="w-full bg-accent hover:bg-accent/90 text-white font-bold text-sm py-2.5 mt-2"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          {/* Inline Demo Credentials Hint Card matching app rules */}
          <div className="mt-4 bg-muted/60 border border-border rounded-lg p-2.5 text-center text-[11px] text-muted-foreground">
            <p className="font-semibold mb-1 text-foreground">Quick Demo Credentials</p>
            <p>Shipper: +254712345678 / password</p>
            <p>Driver: +254712345679 / password</p>
          </div>

          {/* Panel Toggle Switch View Trigger */}
          <p className="text-center text-xs text-muted-foreground mt-5">
            New to TruckHub?{' '}
            <button onClick={onToggleView} className="text-accent hover:underline font-semibold bg-transparent border-0 p-0 cursor-pointer">
              Create Account
            </button>
          </p>
        </div>

      </div>
    </div>
  )
}