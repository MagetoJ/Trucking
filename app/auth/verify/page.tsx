'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Truck, CheckCircle2 } from 'lucide-react'

export default function VerifyPage() {
  const [otp, setOtp] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isVerified, setIsVerified] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      // In a real app, this would verify with backend
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setIsVerified(true)
      setTimeout(() => router.push('/dashboard'), 2000)
    } catch (err: any) {
      setError(err.message || 'Verification failed.')
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
          <h1 className="text-3xl font-bold text-white mb-2">Verify Your Phone</h1>
          <p className="text-primary/80">We sent a code to your phone number</p>
        </div>

        {isVerified ? (
          /* Success State */
          <div className="bg-card border border-border rounded-lg p-8 space-y-6 text-center">
            <div className="flex justify-center mb-6">
              <CheckCircle2 className="w-16 h-16 text-accent" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Verified Successfully!</h2>
            <p className="text-muted-foreground">Your account has been created and verified.</p>
            <p className="text-sm text-muted-foreground">Redirecting to dashboard...</p>
          </div>
        ) : (
          /* Verification Form */
          <form onSubmit={handleSubmit} className="bg-card border border-border rounded-lg p-8 space-y-6">
            {error && (
              <div className="bg-destructive/20 border border-destructive text-destructive px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="otp" className="block text-sm font-semibold text-foreground mb-2">
                Verification Code
              </label>
              <input
                id="otp"
                type="text"
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
                className="w-full px-4 py-2 border border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-950 text-slate-100 placeholder:text-slate-600 text-center text-2xl tracking-widest font-mono"
                required
              />
              <p className="text-xs text-muted-foreground mt-2">Enter the 6-digit code sent to your phone</p>
            </div>

            <Button
              type="submit"
              disabled={isLoading || otp.length !== 6}
              className="w-full bg-accent hover:bg-accent/90 text-primary font-bold py-2"
            >
              {isLoading ? 'Verifying...' : 'Verify Code'}
            </Button>

            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-3">Didn&apos;t receive code?</p>
              <Button
                type="button"
                variant="ghost"
                className="text-accent hover:text-accent/90"
                onClick={() => {
                  // Resend OTP logic
                  console.log('Resend OTP')
                }}
              >
                Resend Code
              </Button>
            </div>
          </form>
        )}

        {/* Back to Login */}
        <p className="text-center text-muted-foreground mt-6">
          <Link href="/auth/login" className="text-accent hover:underline font-semibold">
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  )
}
