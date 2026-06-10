'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { 
  CreditCard, 
  Wallet, 
  Plus, 
  ShieldCheck, 
  Trash2, 
  CheckCircle2, 
  AlertCircle,
  Building,
  ArrowUpRight
} from 'lucide-react'

interface PaymentMethod {
  id: string
  type: 'card' | 'mpesa' | 'bank'
  title: string
  subtitle: string
  isDefault: boolean
}

export default function ShipperPaymentMethodPage() {
  const [activeTab, setActiveTab] = useState<'saved' | 'add-card' | 'add-mpesa'>('saved')
  const [successMsg, setSuccessMsg] = useState('')
  
  // Mock initialized state for testing
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: '1',
      type: 'mpesa',
      title: 'M-Pesa Express Wallet',
      subtitle: '+254 712 *** 678',
      isDefault: true
    },
    {
      id: '2',
      type: 'card',
      title: 'Visa Corporate Card',
      subtitle: 'Ending in 4242',
      isDefault: false
    }
  ])

  // Form State
  const [mpesaPhone, setMpesaPhone] = useState('')
  const [cardName, setCardName] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvc, setCardCVC] = useState('')

  const handleSetDefault = (id: string) => {
    setPaymentMethods(prev => prev.map(method => ({
      ...method,
      isDefault: method.id === id
    })))
    showBanner('Default payment profile updated successfully.')
  }

  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to remove this payment entry?')) return
    setPaymentMethods(prev => prev.filter(m => m.id !== id))
    showBanner('Payment profile removed.')
  }

  const showBanner = (msg: string) => {
    setSuccessMsg(msg)
    setTimeout(() => setSuccessMsg(''), 4000)
  }

  const handleAddMpesaSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!mpesaPhone) return

    const newMethod: PaymentMethod = {
      id: Math.random().toString(),
      type: 'mpesa',
      title: 'M-Pesa Wallet',
      subtitle: mpesaPhone,
      isDefault: paymentMethods.length === 0
    }

    setPaymentMethods(prev => [...prev, newMethod])
    setMpesaPhone('')
    setActiveTab('saved')
    showBanner('M-Pesa authorization endpoint attached safely.')
  }

  const handleAddCardSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!cardNumber || !cardExpiry) return

    const newMethod: PaymentMethod = {
      id: Math.random().toString(),
      type: 'card',
      title: 'Visa Web Card',
      subtitle: `Ending in ${cardNumber.slice(-4)}`,
      isDefault: paymentMethods.length === 0
    }

    setPaymentMethods(prev => [...prev, newMethod])
    setCardName('')
    setCardNumber('')
    setCardExpiry('')
    setCardCVC('')
    setActiveTab('saved')
    showBanner('Credit card encrypted escrow entry added.')
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12 text-foreground">
      {/* Top Title Section */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Payment Methods & Escrow</h2>
        <p className="text-muted-foreground mt-1">
          Securely manage your corporate credit accounts, digital phone wallets, and transit escrow triggers.
        </p>
      </div>

      {/* Live System Feedback Banner */}
      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 p-4 rounded-xl flex items-center gap-2 text-sm font-medium animate-fade-in">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex gap-2 border-b border-border pb-px">
        <button
          onClick={() => setActiveTab('saved')}
          className={`px-4 py-2 text-sm font-semibold transition-all border-b-2 cursor-pointer ${
            activeTab === 'saved' ? 'border-accent text-accent' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Saved Profiles
        </button>
        <button
          onClick={() => setActiveTab('add-mpesa')}
          className={`px-4 py-2 text-sm font-semibold transition-all border-b-2 cursor-pointer ${
            activeTab === 'add-mpesa' ? 'border-accent text-accent' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Connect M-Pesa
        </button>
        <button
          onClick={() => setActiveTab('add-card')}
          className={`px-4 py-2 text-sm font-semibold transition-all border-b-2 cursor-pointer ${
            activeTab === 'add-card' ? 'border-accent text-accent' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Add Credit Card
        </button>
      </div>

      {/* TAB PANEL 1: SAVED PROFILES DISPLAY */}
      {activeTab === 'saved' && (
        <div className="grid md:grid-cols-3 gap-6 items-start">
          <div className="md:col-span-2 space-y-4">
            {paymentMethods.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-border rounded-2xl bg-card">
                <Wallet className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="font-medium text-muted-foreground">No authorized payout avenues detected</p>
                <p className="text-xs text-muted-foreground mt-1">Connect a verification profile to allow direct freight post bidding.</p>
              </div>
            ) : (
              paymentMethods.map((method) => (
                <div 
                  key={method.id} 
                  className={`bg-card border rounded-xl p-5 flex items-center justify-between gap-4 shadow-xs transition-all ${
                    method.isDefault ? 'border-accent ring-1 ring-accent/30' : 'border-border hover:border-accent/30'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center text-primary shrink-0">
                      {method.type === 'mpesa' ? <Wallet className="w-6 h-6 text-emerald-600" /> : <CreditCard className="w-6 h-6 text-indigo-600" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-sm text-foreground">{method.title}</p>
                        {method.isDefault && (
                          <span className="bg-accent/10 text-accent border border-accent/20 px-2 py-0.5 rounded-full font-mono text-[9px] font-black uppercase tracking-wider">
                            Active Default
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-mono text-muted-foreground mt-0.5">{method.subtitle}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {!method.isDefault && (
                      <button 
                        onClick={() => handleSetDefault(method.id)}
                        className="text-[11px] font-bold text-muted-foreground hover:text-accent border border-border bg-background rounded-lg px-2.5 py-1.5 transition cursor-pointer"
                      >
                        Set Default
                      </button>
                    )}
                    <button 
                      onClick={() => handleDelete(method.id)}
                      title="Remove Account"
                      className="p-2 border border-destructive/20 bg-destructive/5 text-destructive hover:bg-destructive/10 rounded-lg transition cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Side Overview Balance Tracker Module */}
          <div className="bg-card border border-border rounded-2xl p-6 space-y-4 shadow-xs">
            <h3 className="font-bold text-base flex items-center gap-1.5">
              <ShieldCheck className="w-5 h-5 text-accent" /> Escrow Balance Ledger
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              TruckHub handles all booking actions through a verified safety gateway vault. Shippers fund routes when accepting driver manifest bids.
            </p>
            <div className="border-t border-border pt-4 mt-2">
              <span className="text-[10px] uppercase font-mono text-muted-foreground tracking-wider block">Active Held Hold Volume</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-black text-foreground">$1,250.00</span>
                <span className="text-xs text-muted-foreground font-mono">USD</span>
              </div>
            </div>
            <div className="bg-primary/5 border border-primary/10 rounded-xl p-3 text-[11px] text-muted-foreground flex gap-2">
              <AlertCircle className="w-4 h-4 text-accent shrink-0 mt-0.5" />
              <span>Funds are only permanently debited to drivers upon explicit digital cargo delivery confirmation signature forms.</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB PANEL 2: ADD M-PESA GATEWAY */}
      {activeTab === 'add-mpesa' && (
        <div className="bg-card border border-border rounded-2xl p-8 shadow-md max-w-xl">
          <div className="mb-6">
            <h3 className="text-lg font-bold">Connect SafariCom M-Pesa STK Push Wallet</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Attach a direct payment terminal handler to receive instant STK pin requests on checkout layers.</p>
          </div>

          <form onSubmit={handleAddMpesaSubmit} className="space-y-4">
            <div>
              <label htmlFor="mpesa-phone-input" className="block text-xs font-semibold text-muted-foreground uppercase mb-2 tracking-wider">Registered Phone Number</label>
              <input 
                id="mpesa-phone-input"
                type="tel"
                placeholder="e.g. +254 712 345 678"
                value={mpesaPhone}
                onChange={(e) => setMpesaPhone(e.target.value)}
                className="w-full px-4 py-2.5 border border-border rounded-xl bg-background font-mono text-sm focus:ring-2 focus:ring-accent outline-none"
                required
              />
              <p className="text-[11px] text-muted-foreground mt-1.5">Ensure country flags match formatting structures (+254 standard format expected).</p>
            </div>

            <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-white font-bold py-3 rounded-xl cursor-pointer">
              Authorize M-Pesa Gateway Connection
            </Button>
          </form>
        </div>
      )}

      {/* TAB PANEL 3: ADD STRIPE / VISA CARD PROFILE */}
      {activeTab === 'add-card' && (
        <div className="bg-card border border-border rounded-2xl p-8 shadow-md max-w-xl">
          <div className="mb-6">
            <h3 className="text-lg font-bold">Encrypted Credit Account Card Entry</h3>
            <p className="text-xs text-muted-foreground mt-0.5">PCI-compliant data tokens preserve safety boundaries directly on backend execution models.</p>
          </div>

          <form onSubmit={handleAddCardSubmit} className="space-y-4">
            <div>
              <label htmlFor="card-name-input" className="block text-xs font-semibold text-muted-foreground uppercase mb-2">Card Holder Legal Name</label>
              <input 
                id="card-name-input"
                type="text"
                placeholder="John Doe"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                className="w-full px-4 py-2.5 border border-border rounded-xl bg-background text-sm focus:ring-2 focus:ring-accent outline-none"
                required
              />
            </div>

            <div>
              <label htmlFor="card-number-input" className="block text-xs font-semibold text-muted-foreground uppercase mb-2">16-Digit Card Number</label>
              <div className="relative">
                <input 
                  id="card-number-input"
                  type="text"
                  maxLength={16}
                  placeholder="0000 0000 0000 0000"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, ''))}
                  className="w-full pl-11 pr-4 py-2.5 border border-border rounded-xl bg-background font-mono text-sm focus:ring-2 focus:ring-accent outline-none"
                  required
                />
                <CreditCard className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="card-expiry-input" className="block text-xs font-semibold text-muted-foreground uppercase mb-2">Expiry Date</label>
                <input 
                  id="card-expiry-input"
                  type="text"
                  maxLength={5}
                  placeholder="MM/YY"
                  value={cardExpiry}
                  onChange={(e) => setCardExpiry(e.target.value)}
                  className="w-full px-4 py-2.5 border border-border rounded-xl bg-background font-mono text-sm focus:ring-2 focus:ring-accent outline-none text-center"
                  required
                />
              </div>
              <div>
                <label htmlFor="card-cvc-input" className="block text-xs font-semibold text-muted-foreground uppercase mb-2">Security Code (CVC)</label>
                <input 
                  id="card-cvc-input"
                  type="password"
                  maxLength={3}
                  placeholder="***"
                  value={cardCvc}
                  onChange={(e) => setCardCVC(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-4 py-2.5 border border-border rounded-xl bg-background font-mono text-sm focus:ring-2 focus:ring-accent outline-none text-center"
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-white font-bold py-3 rounded-xl mt-2 cursor-pointer">
              Bind Secure Processing Asset
            </Button>
          </form>
        </div>
      )}
    </div>
  )
}