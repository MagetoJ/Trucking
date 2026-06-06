'use client'

import { useState, Suspense, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/lib/store'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Truck, Eye, EyeOff, CheckCircle2 } from 'lucide-react'
import { UserRole } from '@/lib/store'

function RegisterContent() {
  const [step, setStep] = useState(1)
  const searchParams = useSearchParams()
  const initialRole = (searchParams.get('role') as UserRole) || 'shipper'

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: initialRole,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const register = useAuthStore((state) => state.register)

  // Sync role if query param changes
  useEffect(() => {
    const role = searchParams.get('role') as UserRole
    if (role && (role === 'shipper' || role === 'driver')) {
      setFormData(prev => ({ ...prev, role }))
    }
  }, [searchParams])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleRoleSelect = (role: UserRole) => {
    setFormData({ ...formData, role })
  }

  const validateStep1 = () => {
    if (!formData.name || !formData.phone) {
      setError('Please fill in all fields')
      return false
    }
    return true
  }

  const validateStep2 = () => {
    if (!formData.email || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all fields')
      return false
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return false
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return false
    }
    return true
  }

  const handleNext = () => {
    setError('')
    if (validateStep1()) {
      setStep(2)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!validateStep2()) return

    setIsLoading(true)
    try {
      await register({
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      })
      router.push('/auth/verify')
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary to-primary/80 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Truck className="w-12 h-12 text-accent" />
            <span className="text-3xl font-bold text-white">TruckHub</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
          <p className="text-primary/80">Step {step} of 3</p>
        </div>

        {/* Progress Indicator */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={`h-2 flex-1 rounded-full transition-all ${
                i <= step ? 'bg-accent' : 'bg-primary/30'
              }`}
            />
          ))}
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-lg p-8 space-y-6">
          {error && (
            <div className="bg-destructive/20 border border-destructive text-destructive px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Step 1: Role Selection */}
          {step === 1 && (
            <>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-4">
                  What is your role?
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => handleRoleSelect('shipper')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      formData.role === 'shipper'
                        ? 'border-accent bg-accent/10'
                        : 'border-border hover:border-accent/50'
                    }`}
                  >
                    <div className="text-2xl mb-2">📦</div>
                    <div className="font-semibold text-foreground">Shipper</div>
                    <div className="text-xs text-muted-foreground">Need cargo delivered</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRoleSelect('driver')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      formData.role === 'driver'
                        ? 'border-accent bg-accent/10'
                        : 'border-border hover:border-accent/50'
                    }`}
                  >
                    <div className="text-2xl mb-2">🚛</div>
                    <div className="font-semibold text-foreground">Driver</div>
                    <div className="text-xs text-muted-foreground">Want to earn</div>
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-foreground mb-2">
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent bg-background text-foreground placeholder:text-muted-foreground"
                  required
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-semibold text-foreground mb-2">
                  Phone Number
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent bg-background text-foreground placeholder:text-muted-foreground"
                  required
                />
              </div>

              <Button onClick={handleNext} className="w-full bg-accent hover:bg-accent/90 text-primary font-bold py-2">
                Next
              </Button>
            </>
          )}

          {/* Step 2: Email & Password */}
          {step === 2 && (
            <>
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-foreground mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent bg-background text-foreground placeholder:text-muted-foreground"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-foreground mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="At least 6 characters"
                    value={formData.password}
                    onChange={handleChange}
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

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-foreground mb-2">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent bg-background text-foreground placeholder:text-muted-foreground"
                  required
                />
              </div>

              <div className="flex gap-4">
                <Button
                  type="button"
                  onClick={() => setStep(1)}
                  variant="outline"
                  className="flex-1 border-accent text-accent hover:bg-accent/10"
                >
                  Back
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    setError('')
                    if (validateStep2()) setStep(3)
                  }}
                  className="flex-1 bg-accent hover:bg-accent/90 text-primary font-bold"
                >
                  Next
                </Button>
              </div>
            </>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <>
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-sm font-semibold text-foreground">Full Name</div>
                    <div className="text-sm text-muted-foreground">{formData.name}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-sm font-semibold text-foreground">Phone</div>
                    <div className="text-sm text-muted-foreground">{formData.phone}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-sm font-semibold text-foreground">Role</div>
                    <div className="text-sm text-muted-foreground capitalize">{formData.role}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-sm font-semibold text-foreground">Email</div>
                    <div className="text-sm text-muted-foreground">{formData.email}</div>
                  </div>
                </div>
              </div>

              <p className="text-sm text-muted-foreground text-center">
                By creating an account, you agree to our Terms of Service and Privacy Policy.
              </p>

              <div className="flex gap-4">
                <Button
                  type="button"
                  onClick={() => setStep(2)}
                  variant="outline"
                  className="flex-1 border-accent text-accent hover:bg-accent/10"
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-accent hover:bg-accent/90 text-primary font-bold py-2"
                >
                  {isLoading ? 'Creating...' : 'Create Account'}
                </Button>
              </div>
            </>
          )}
        </form>

        {/* Login Link */}
        <p className="text-center text-muted-foreground mt-6">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-accent hover:underline font-semibold">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-primary flex items-center justify-center"><div className="text-white">Loading...</div></div>}>
      <RegisterContent />
    </Suspense>
  )
}
