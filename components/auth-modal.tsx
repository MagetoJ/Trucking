'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useAuthStore, UserRole } from '@/lib/store'
import { X, Truck, Eye, EyeOff, CheckCircle2 } from 'lucide-react'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onToggleView: () => void // Changes active panel layout to Login view
}

export default function RegisterModal({ isOpen, onClose, onToggleView }: AuthModalProps) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'shipper' as UserRole,
  })
  
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const registerClient = useAuthStore((state) => state.register)

  if (!isOpen) return null

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleRoleSelect = (role: UserRole) => {
    setFormData({ ...formData, role })
  }

  const validateStep1 = () => {
    if (!formData.name || !formData.phone) {
      setError('Please fill in your name and phone number.')
      return false
    }
    return true
  }

  const validateStep2 = () => {
    if (!formData.email || !formData.password || !formData.confirmPassword) {
      setError('Credentials fields are mandatory.')
      return false
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.')
      return false
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.')
      return false
    }
    return true
  }

  const handleNext = () => {
    setError('')
    if (validateStep1()) setStep(2)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!validateStep2()) return

    setIsLoading(true)
    try {
      // Execute database records generation via state container
      await registerClient({
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      })
      onClose() // Dismiss authentication layer overlay
      router.push('/dashboard') // Route the authenticated session directly to the system workspace
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-card border border-border rounded-xl shadow-2xl relative flex flex-col overflow-hidden max-h-[90vh]">
        
        {/* Dismiss trigger button */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors z-10 p-1 rounded-full hover:bg-muted"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 overflow-y-auto">
          {/* Header Layout Info */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Truck className="w-8 h-8 text-accent" />
              <span className="text-2xl font-bold text-foreground">TruckHub</span>
            </div>
            <h2 className="text-xl font-bold text-foreground">Create Account</h2>
            <p className="text-xs text-muted-foreground mt-1">Step {step} of 3</p>
          </div>

          {/* Progress Node Tracker bar */}
          <div className="flex gap-1.5 mb-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                  i <= step ? 'bg-accent' : 'bg-muted'
                }`}
              />
            ))}
          </div>

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-2.5 rounded-lg text-xs mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* STEP 1: Profile Assignment entry */}
            {step === 1 && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-2">
                    What is your role?
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => handleRoleSelect('shipper')}
                      className={`p-3 rounded-lg border-2 text-left transition-all ${
                        formData.role === 'shipper'
                          ? 'border-accent bg-accent/5'
                          : 'border-border hover:border-accent/40 bg-background'
                      }`}
                    >
                      <div className="text-xl mb-1">📦</div>
                      <div className="font-bold text-sm text-foreground">Shipper</div>
                      <div className="text-[11px] text-muted-foreground leading-tight">Need cargo delivered</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRoleSelect('driver')}
                      className={`p-3 rounded-lg border-2 text-left transition-all ${
                        formData.role === 'driver'
                          ? 'border-accent bg-accent/5'
                          : 'border-border hover:border-accent/40 bg-background'
                      }`}
                    >
                      <div className="text-xl mb-1">🚛</div>
                      <div className="font-bold text-sm text-foreground">Driver</div>
                      <div className="text-[11px] text-muted-foreground leading-tight">Want to earn</div>
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="name" className="block text-xs font-semibold text-foreground mb-1.5">
                    Full Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent bg-background text-foreground"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-xs font-semibold text-foreground mb-1.5">
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="+254 712 345678"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent bg-background text-foreground"
                    required
                  />
                </div>

                <Button 
                  type="button" 
                  onClick={handleNext} 
                  className="w-full bg-accent hover:bg-accent/90 text-white font-bold text-sm py-2.5 mt-2"
                >
                  Next
                </Button>
              </>
            )}

            {/* STEP 2: Access Credentials fields */}
            {step === 2 && (
              <>
                <div>
                  <label htmlFor="email" className="block text-xs font-semibold text-foreground mb-1.5">
                    Email Address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent bg-background text-foreground"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-xs font-semibold text-foreground mb-1.5">
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

                <div>
                  <label htmlFor="confirmPassword" className="block text-xs font-semibold text-foreground mb-1.5">
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="Confirm password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent bg-background text-foreground"
                    required
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    onClick={() => setStep(1)}
                    variant="outline"
                    className="flex-1 border-accent text-accent hover:bg-accent/5 py-2.5"
                  >
                    Back
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      setError('')
                      if (validateStep2()) setStep(3)
                    }}
                    className="flex-1 bg-accent hover:bg-accent/90 text-white font-bold py-2.5"
                  >
                    Next
                  </Button>
                </div>
              </>
            )}

            {/* STEP 3: Summary Sheet verification and submission */}
            {step === 3 && (
              <>
                <div className="bg-muted/50 border border-border rounded-lg p-3.5 space-y-2.5 text-sm">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-muted-foreground">Full Name</div>
                      <div className="text-foreground font-medium">{formData.name}</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-muted-foreground">Phone Number</div>
                      <div className="text-foreground font-medium">{formData.phone}</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-muted-foreground">Account Profile Type</div>
                      <div className="text-foreground font-medium capitalize">{formData.role}</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-muted-foreground">Email Registration</div>
                      <div className="text-foreground font-medium break-all">{formData.email}</div>
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-muted-foreground text-center px-2">
                  By selecting Create Account, you acknowledge immediate system initialization configuration rules.
                </p>

                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    onClick={() => setStep(2)}
                    variant="outline"
                    className="flex-1 border-accent text-accent hover:bg-accent/5 py-2.5"
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-accent hover:bg-accent/90 text-white font-bold py-2.5"
                  >
                    {isLoading ? 'Creating...' : 'Create Account'}
                  </Button>
                </div>
              </>
            )}
          </form>

          {/* Footer toggle view triggers */}
          <p className="text-center text-xs text-muted-foreground mt-5">
            Already have an account?{' '}
            <button onClick={onToggleView} className="text-accent hover:underline font-semibold bg-transparent border-0 p-0 cursor-pointer">
              Sign in
            </button>
          </p>
        </div>

      </div>
    </div>
  )
}