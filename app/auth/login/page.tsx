'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/lib/store'
import { BACKEND_BASE_URL } from '@/lib/fetcher' // Import BACKEND_BASE_URL
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Truck, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const loginStore = useAuthStore((state) => state.login) // Renamed to avoid conflict with local login function

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      // 1. Fire the store's login request to backend engine (assuming loginStore uses BACKEND_BASE_URL internally)
      await loginStore(phone, password)

      // 2. Add an explicit tiny pause to allow localStorage synchronization to finish writing
      await new Promise((resolve) => setTimeout(resolve, 50))

      // 3. Navigate into the secure view dashboard portal area safely
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Login execution failed.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary to-primary/80 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Truck className="w-12 h-12 text-accent" />
            <span className="text-3xl font-bold text-white">TruckHub</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-primary/80">Sign in to your account to continue</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-lg p-8 space-y-6">
          {error && (
            <div className="bg-destructive/20 border border-destructive text-destructive px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Phone Field */}
          <div>
            <label htmlFor="phone" className="block text-sm font-semibold text-foreground mb-2">
              Phone Number
            </label>
            <input
              id="phone"
              type="tel"
              placeholder="+1 (555) 123-4567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent bg-background text-foreground placeholder:text-muted-foreground"
              required
            />
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-foreground mb-2">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent bg-background text-foreground placeholder:text-muted-foreground"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading || !phone || !password}
            className="w-full bg-accent hover:bg-accent/90 text-primary font-bold py-2"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-card text-muted-foreground">New to TruckHub?</span>
            </div>
          </div>

          {/* Register Link */}
          <Link href="/auth/register">
            <Button variant="outline" className="w-full border-accent text-accent hover:bg-accent/10">
              Create Account
            </Button>
          </Link>
        </form>
      </div>
    </div>
  )
}
