'use client'

import { useAuthStore } from '@/lib/store'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { 
  Truck, Home, Map, Users, LogOut, Menu, X, Settings, 
  BarChart3, FileText, ShieldAlert, RefreshCw, Sun, Moon 
} from 'lucide-react' // IMPORT SUN AND MOON ICONS
import { Button } from '@/components/ui/button'
import { useTheme } from '@/components/theme-provider' // IMPORT CONFIG HOOK

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const router = useRouter()
  const pathname = usePathname()
  
  // Responsive sidebar control flags
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { theme, toggleTheme } = useTheme() // HOOK THEME VALUES HERE

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
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-muted-foreground font-mono text-sm">
        <RefreshCw className="w-5 h-5 animate-spin text-accent mb-2" />
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
    { icon: Home, label: 'Dashboard', href: '/dashboard' },
    { icon: Users, label: 'Users', href: '/dashboard/users' },
    { icon: Map, label: 'Tracking', href: '/dashboard/tracking' },
  ]

  // Role-specific navigation
  const shipperItems = [
    { icon: FileText, label: 'Post Load', href: '/dashboard/shipper/post-load' },
    { icon: BarChart3, label: 'Active Bookings', href: '/dashboard/shipper/active-bookings' },
    { icon: Settings, label: 'Payment Methods', href: '/dashboard/shipper/payment-method' },
  ]

  const driverItems = [
    { icon: FileText, label: 'Available Loads', href: '/dashboard/driver/available-loads' },
    { icon: BarChart3, label: 'My Trips', href: '/dashboard/driver/my-trips' },
    { icon: Settings, label: 'Earnings', href: '/dashboard/driver/earnings' },
  ]

  const adminItems = [
    { icon: ShieldAlert, label: 'Ecosystem Control', href: '/dashboard/admin' }
  ]

  const navItems = user.role === 'super_admin' 
    ? adminItems 
    : user.role === 'shipper' ? shipperItems : driverItems

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      
      {/* Mobile Sidebar Backdrop Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 md:hidden backdrop-blur-xs"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Adaptive Responsive Navigation Drawer */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen bg-sidebar border-r border-sidebar-border transition-transform duration-300 z-50 w-64 shrink-0 flex flex-col ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Banner */}
        <div className="h-16 border-b border-sidebar-border flex items-center px-6 justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Truck className="w-8 h-8 text-sidebar-accent" />
            <span className="text-lg font-bold text-sidebar-foreground">TruckHub</span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="p-1 rounded text-sidebar-foreground md:hidden hover:bg-sidebar-accent/10">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Navigation Nodes Links */}
        <nav className="p-4 space-y-1.5 flex-1 overflow-y-auto">
          {commonItems.map((item) => (
            <Link key={item.href} href={item.href} className="block">
              <Button
                variant="ghost"
                className={`w-full justify-start gap-3 text-sidebar-foreground min-h-[44px] px-4 rounded-xl hover:bg-sidebar-accent/10 ${
                  pathname === item.href ? 'bg-sidebar-accent/15 font-bold border-l-4 border-sidebar-primary' : ''
                }`}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                <span>{item.label}</span>
              </Button>
            </Link>
          ))}

          <div className="my-4 border-t border-sidebar-border/60"></div>

          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="block">
              <Button
                variant="ghost"
                className={`w-full justify-start gap-3 text-sidebar-foreground min-h-[44px] px-4 rounded-xl hover:bg-sidebar-accent/10 ${
                  pathname === item.href ? 'bg-sidebar-accent/15 font-bold border-l-4 border-sidebar-primary' : ''
                }`}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                <span>{item.label}</span>
              </Button>
            </Link>
          ))}
        </nav>

        {/* Footer Identity Context */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-sidebar-border p-4 bg-sidebar-accent/5">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-sidebar-accent/20 flex items-center justify-center text-sidebar-foreground font-bold shrink-0">
                {user.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-sidebar-foreground truncate">{user.name}</p>
                <p className="text-xs text-sidebar-foreground/70 capitalize">{user.role}</p>
              </div>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full text-sidebar-foreground border-sidebar-accent/30 hover:bg-sidebar-accent/10 justify-start gap-2 min-h-[40px] cursor-pointer text-xs font-bold"
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
        <header className="h-16 bg-card border-b border-border flex items-center px-4 sm:px-6 justify-between gap-4 shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-foreground hover:bg-muted p-2 rounded-xl focus:ring-2 focus:ring-accent outline-none cursor-pointer md:hidden"
              aria-label="Toggle Navigation Bar Drawer Menu"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-base sm:text-lg font-bold text-foreground truncate max-w-[180px] sm:max-w-none">
              Welcome, {user.name}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Dark Mode Sync Toggle Switch Trigger */}
            <button
              onClick={toggleTheme}
              className="p-2.5 border border-border bg-background rounded-xl text-foreground hover:bg-muted active:scale-95 transition-all cursor-pointer flex items-center justify-center shadow-xs"
              title={`Toggle ${theme === 'light' ? 'Dark' : 'Light'} Color Layout Theme Mode`}
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-400" />}
            </button>

            <div className="flex items-center gap-2">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-foreground">{user.name}</p>
                <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
              </div>
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent font-black shrink-0">
                {user.name.charAt(0)}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area Container Block with Fluid Overflow Scrolling properties */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-background text-foreground">
          {children}
        </main>
      </div>

    </div>
  )
}
