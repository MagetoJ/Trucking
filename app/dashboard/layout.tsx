'use client'

import useSWR from 'swr'
import { useAuthStore } from '@/lib/store'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { 
  Truck, Home, Map, Users, LogOut, Menu, X, Settings, Bell, // IMPORT BELL ICON
  BarChart3, FileText, ShieldAlert, RefreshCw, Sun, Moon
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { authenticatedFetcher } from '@/lib/fetcher'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = useAuthStore((state) => state.user)
  const token = useAuthStore((state) => state.token) // <-- ADDED THIS LINE
  const logout = useAuthStore((state) => state.logout)
  const router = useRouter() // <-- ADDED THIS LINE
  const pathname = usePathname()
  
  const [sidebarOpen, setSidebarOpen] = useState(false)

  /* Dynamic Live SWR Notifications Counter Icon Widget Component */
  const { data: alerts } = useSWR<any[]>(
    token ? '/api/bookings/notifications' : null,
    authenticatedFetcher,
    { refreshInterval: 4000 }
  )
  const unreadCount = alerts?.filter(n => !n.isRead).length || 0

  // Automatically collapse sidebar drawer when changing pages on mobile screens
  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!user) {
      router.push('/auth/login')
    }
  }, [user, router])

  // CRITICAL: Block rendering entirely if no valid state token exists.
  // This prevents child components from making broken 401 API fetches.
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-400 font-mono text-xs">
        <RefreshCw className="w-5 h-5 animate-spin text-indigo-500 mb-2" />
        VALIDATING AUTHENTICATION SESSION...
      </div>
    )
  }

  const handleLogout = () => {
    logout()
    router.push('/auth/login')
  }

  // Common navigation items
  const commonItems = [
    { icon: Home, label: 'Dashboard', href: '/dashboard' }, // Updated label
    { icon: Users, label: 'Users Directory', href: '/dashboard/users' }, // Updated label
    { icon: Map, label: 'Live Tracking Map', href: '/dashboard/tracking' }, // Updated label
  ]

  // Role-specific navigation
  const shipperItems = [
    { icon: FileText, label: 'Post Cargo Load', href: '/dashboard/shipper/post-load' }, // Updated label
    { icon: BarChart3, label: 'Active Bookings', href: '/dashboard/shipper/active-bookings' },
    { icon: Settings, label: 'Escrow & Payments', href: '/dashboard/shipper/payment-method' }, // Updated label
  ]

  const driverItems = [
    { icon: FileText, label: 'Marketplace Offers', href: '/dashboard/driver/available-loads' }, // Updated label
    { icon: BarChart3, label: 'My Assigned Trips', href: '/dashboard/driver/my-trips' }, // Updated label
    { icon: Settings, label: 'Earning Ledger', href: '/dashboard/driver/earnings' }, // Updated label
  ]

  const adminItems = [
    { icon: ShieldAlert, label: 'Ecosystem Control', href: '/dashboard/admin' }
  ]

  const navItems = user.role === 'super_admin' 
    ? adminItems 
    : user.role === 'shipper' ? shipperItems : driverItems

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans antialiased">
      
      {/* Mobile Drawer Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden backdrop-blur-xs"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Adaptive Responsive Navigation Drawer */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen bg-slate-900 border-r border-slate-900/60 transition-transform duration-300 z-50 w-64 shrink-0 flex flex-col ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Banner */}
        <div className="h-16 border-b border-slate-950 flex items-center px-6 justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Truck className="w-6 h-6 text-indigo-500" />
            <span className="text-base font-black tracking-tight text-white">TruckHub Control</span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="p-1 rounded text-slate-400 md:hidden hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Navigation Nodes Links */}
        <nav className="p-4 space-y-1.5 flex-1 overflow-y-auto">
          {commonItems.map((item) => (
            <Link key={item.href} href={item.href} className="block">
              <Button
                variant="ghost"
                className={`w-full justify-start gap-3 text-slate-400 h-10 px-3 rounded-lg hover:bg-slate-800 hover:text-slate-100 ${
                  pathname === item.href ? 'bg-indigo-600 text-white font-bold shadow-md hover:bg-indigo-600' : ''
                }`}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                <span>{item.label}</span>
              </Button>
            </Link>
          ))}

          <div className="my-4 border-t border-slate-850"></div>

          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="block">
              <Button
                variant="ghost"
                className={`w-full justify-start gap-3 text-slate-400 h-10 px-3 rounded-lg hover:bg-slate-800 hover:text-slate-100 ${
                  pathname === item.href ? 'bg-indigo-600 text-white font-bold shadow-md hover:bg-indigo-600' : ''
                }`}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                <span>{item.label}</span>
              </Button>
            </Link>
          ))}
        </nav>

        {/* Sidebar Profile Card */}
        <div className="border-t border-slate-900 p-4 bg-slate-900/40">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-600/20 flex items-center justify-center text-indigo-400 font-bold shrink-0 text-xs">
                {user.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-200 truncate">{user.name}</p>
                <p className="text-[10px] font-mono text-slate-500 capitalize">{user.role}</p>
              </div>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full text-slate-300 border-slate-800 hover:bg-slate-800 justify-start gap-2 h-8 text-xs font-bold cursor-pointer"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Framework Viewport Content Portal Area */}
      <div className="flex-1 min-w-0 flex flex-col h-screen overflow-hidden"> 
        
        {/* Top Sticky Header */}
        <header className="h-16 bg-slate-950 border-b border-slate-900/40 flex items-center px-6 justify-between gap-4 shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-slate-400 hover:bg-slate-900 p-2 rounded-lg md:hidden cursor-pointer"
              aria-label="Toggle Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-sm font-bold text-slate-200 truncate">
              Oversight System Console / <span className="text-indigo-400 font-mono text-xs uppercase ml-1">{user.role}</span>
            </h1>
          </div>

          {/* Dynamic Live SWR Notifications Counter Icon Widget Component */}
          <div className="flex items-center gap-4">
            {/* Notifications Popover */}
            <div className="relative group">
              <button className="p-2 border border-slate-900 bg-slate-900/40 rounded-lg text-slate-300 hover:bg-slate-800 transition flex items-center justify-center relative cursor-pointer">
                <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-500 text-white font-mono font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
              </button>
            
              <div className="absolute right-0 top-10 bg-slate-900 border border-slate-850 text-slate-200 p-4 w-72 rounded-xl shadow-2xl hidden group-hover:block z-50 space-y-2 animate-fade-in">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-800 pb-1.5 font-mono">Ecosystem Event Log</p>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {!alerts || alerts.length === 0 ? (
                  <p className="text-xs text-slate-500 italic py-2 text-center">No unread system notices.</p>
                ) : (
                  alerts.map((n) => (
                    <div key={n.id} className="text-[11px] leading-tight border-b border-slate-850 pb-1.5 last:border-0 last:pb-0">
                      <p className="font-bold text-slate-200">{n.title}</p>
                      <p className="text-slate-400 mt-0.5 font-sans">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
            
            <div className="w-px h-6 bg-slate-900"></div>

            {/* User Profile Widget */}
            <div className="flex items-center gap-2">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-slate-200">{user.name}</p>
                <p className="text-[10px] font-mono text-slate-500">Live Secure Connection</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-indigo-600/10 text-indigo-400 font-bold flex items-center justify-center text-xs">
                {user.name.charAt(0)}
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Content Pane */}
        <main className="flex-1 overflow-y-auto p-6 bg-slate-950 text-slate-200">
          {children}
        </main>
      </div>

    </div>
  )
}
