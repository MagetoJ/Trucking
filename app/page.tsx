'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Truck, MapPin, Users, ShieldCheck, Zap, ArrowRight, Package, Clock, Shield, Star, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import RegisterModal from '@/components/auth-modal'
import LoginModal from '@/components/login-modal'

export default function Page() {
  const [activeAuthModal, setActiveAuthModal] = useState<'none' | 'login' | 'register'>('none')

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-primary/10 bg-white/80 backdrop-blur-md">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 text-primary font-bold text-2xl hover:opacity-90 transition-opacity">
              <Truck className="w-8 h-8 text-accent" />
              TruckHub
          </Link>
          
          <div className="hidden md:flex items-center gap-8">
            <Link href="#solutions" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              Solutions
            </Link>
            <Link href="#features" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              Features
            </Link>
          </div>

          <div className="flex gap-4">
            <Button 
              variant="ghost" 
              className="text-primary hover:bg-primary/5 font-semibold"
              onClick={() => setActiveAuthModal('login')}
            >
              Login
            </Button>
            <Button 
              onClick={() => setActiveAuthModal('register')}
              className="bg-accent hover:bg-accent/90 text-white font-bold"
            >
              Sign Up
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-primary py-16 md:py-24">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-accent/20 rounded-full blur-[120px]" />
          <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-accent/10 rounded-full blur-[120px]" />
        </div>

        <div className="container relative mx-auto px-4 text-center text-white">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-accent text-sm font-medium mb-6">
            <Zap className="w-4 h-4" />
            <span>Next-gen logistics is here</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight">
            Move Anything, <span className="text-accent">Anywhere.</span>
          </h1>
          <p className="text-lg md:text-xl mb-10 text-white/70 max-w-2xl mx-auto leading-relaxed">
            TruckHub is the digital bridge between cargo and carrier. 
            Streamline your supply chain with real-time tracking, instant quotes, and a network of verified professional drivers.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Button 
              size="lg" 
              onClick={() => setActiveAuthModal('register')}
              className="bg-accent hover:bg-accent/90 text-white font-bold text-xl px-10 py-8 h-auto w-full sm:w-auto"
            >
              Find a Truck
              <ArrowRight className="ml-2 w-6 h-6" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              onClick={() => setActiveAuthModal('register')}
              className="border-white/30 text-white hover:bg-white/10 font-bold text-xl px-10 py-8 h-auto w-full sm:w-auto"
            >
              Drive & Earn
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <div className="bg-white border-b border-primary/5 py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-around gap-8 text-primary/40 text-sm font-bold uppercase tracking-[0.2em]">
            <div className="flex items-center gap-3"><ShieldCheck className="w-6 h-6 text-accent" /> 10k+ Verified Drivers</div>
            <div className="flex items-center gap-3"><Clock className="w-6 h-6 text-accent" /> 24/7 Monitoring</div>
            <div className="flex items-center gap-3"><Package className="w-6 h-6 text-accent" /> 1M+ Deliveries</div>
          </div>
        </div>
      </div>

      {/* Solutions Section */}
      <section id="solutions" className="py-24 bg-slate-50 scroll-mt-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-primary mb-4">Powerful Solutions for Logistics</h2>
            <p className="text-muted-foreground text-xl">Everything you need to manage freight, all in one place.</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            <div className="bg-white rounded-3xl p-10 shadow-sm border border-primary/5">
              <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mb-6">
                <Package className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-3xl font-bold text-primary mb-4">For Shippers</h3>
              <p className="text-muted-foreground text-lg mb-8">Get your goods delivered on time and within budget. Our platform gives you complete control over your shipments.</p>
              <ul className="space-y-4 mb-10">
                {[
                  'Post loads in seconds and get instant quotes',
                  'Live GPS tracking from pickup to delivery',
                  'Secure digital payments and automated invoicing',
                  'Access to a massive network of verified carriers'
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-primary/80 font-medium">
                    <CheckCircle2 className="w-5 h-5 text-accent" />
                    {item}
                  </li>
                ))}
              </ul>
              <Button 
                variant="outline" 
                className="w-full py-6 text-lg border-accent text-accent hover:bg-accent/5"
                onClick={() => setActiveAuthModal('register')}
              >
                Get Started as Shipper
              </Button>
            </div>

            <div className="bg-white rounded-3xl p-10 shadow-sm border border-primary/5">
              <div className="w-16 h-16 bg-primary/5 rounded-2xl flex items-center justify-center mb-6">
                <Truck className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-3xl font-bold text-primary mb-4">For Drivers</h3>
              <p className="text-muted-foreground text-lg mb-8">Turn your truck into a business. Find high-paying loads and get paid faster than ever before.</p>
              <ul className="space-y-4 mb-10">
                {[
                  'Browse and accept loads matching your route',
                  'Guaranteed payments with no hidden fees',
                  'Route optimization for better fuel efficiency',
                  'Manage your earnings and trips on the go'
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-primary/80 font-medium">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                    {item}
                  </li>
                ))}
              </ul>
              <Button 
                className="w-full py-6 text-lg bg-primary hover:bg-primary/90 text-white"
                onClick={() => setActiveAuthModal('register')}
              >
                Apply to Drive
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-white scroll-mt-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <MapPin className="w-10 h-10 text-accent" />
              </div>
              <h4 className="text-2xl font-bold text-primary mb-4">Precision Tracking</h4>
              <p className="text-muted-foreground leading-relaxed">Know exactly where your cargo is with meter-level GPS accuracy and real-time status notifications.</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="w-10 h-10 text-accent" />
              </div>
              <h4 className="text-2xl font-bold text-primary mb-4">Maximum Security</h4>
              <p className="text-muted-foreground leading-relaxed">Every load is insured, and every driver is thoroughly vetted to ensure your peace of mind.</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Star className="w-10 h-10 text-accent" />
              </div>
              <h4 className="text-2xl font-bold text-primary mb-4">Reliable Network</h4>
              <p className="text-muted-foreground leading-relaxed">Our rating system ensures only the highest quality shippers and drivers stay on the platform.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-primary py-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full -mr-32 -mt-32 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/10 rounded-full -ml-32 -mb-32 blur-3xl" />
        
        <div className="container relative mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Ready to scale your logistics?</h2>
          <p className="text-white/70 text-xl mb-10 max-w-2xl mx-auto">Join the future of freight transport. Create your account today and experience the difference.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => setActiveAuthModal('register')} 
              className="bg-accent hover:bg-accent/90 text-white font-bold text-xl px-12 py-8 h-auto"
            >
              Get Started Now
            </Button>
            <Button 
              variant="outline" 
              className="border-white/30 text-white hover:bg-white/10 font-bold text-xl px-12 py-8 h-auto"
              onClick={() => setActiveAuthModal('login')}
            >
              Sign In
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 py-12 text-center text-slate-400 text-sm border-t border-white/5">
        <div className="container mx-auto px-4">
          <Link href="/" className="flex items-center justify-center gap-2 text-white font-bold text-xl mb-6 hover:text-accent transition-colors">
            <Truck className="w-6 h-6 text-accent" />
            TruckHub
          </Link>
          <p>© {new Date().getFullYear()} TruckHub Logistics Platform. All rights reserved.</p>
        </div>
      </footer>

      {/* Auth Modals */}
      {activeAuthModal === 'login' && (
        <LoginModal 
          isOpen={true} 
          onClose={() => setActiveAuthModal('none')} 
          onToggleView={() => setActiveAuthModal('register')} 
        />
      )}
      {activeAuthModal === 'register' && (
        <RegisterModal 
          isOpen={true} 
          onClose={() => setActiveAuthModal('none')} 
          onToggleView={() => setActiveAuthModal('login')} 
        />
      )}
    </div>
  )
}
