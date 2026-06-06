'use client'

import { useAuthStore } from '@/lib/store'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Truck, Home, Map, Users, LogOut, Menu, X, Settings, BarChart3, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => {
    if (!user) {
      router.push('/auth/login')
    }
  }, [user, router])

  if (!user) {
    return null
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

  const navItems = user.role === 'shipper' ? shipperItems : driverItems

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full bg-sidebar border-r border-sidebar-border transition-all duration-300 z-40 ${
          sidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        {/* Logo */}
        <div className="h-16 border-b border-sidebar-border flex items-center px-4 justify-between">
          {sidebarOpen && (
            <Link href="/dashboard" className="flex items-center gap-2">
              <Truck className="w-8 h-8 text-sidebar-accent" />
              <span className="text-lg font-bold text-sidebar-foreground hidden lg:inline">TruckHub</span>
            </Link>
          )}
          {!sidebarOpen && <Truck className="w-8 h-8 text-sidebar-accent mx-auto" />}
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {/* Common Items */}
          {commonItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                className={`w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent/10 ${
                  !sidebarOpen && 'justify-center'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {sidebarOpen && item.label}
              </Button>
            </Link>
          ))}

          {/* Divider */}
          {sidebarOpen && <div className="my-4 border-t border-sidebar-border"></div>}

          {/* Role-Specific Items */}
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                className={`w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent/10 ${
                  !sidebarOpen && 'justify-center'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {sidebarOpen && item.label}
              </Button>
            </Link>
          ))}
        </nav>

        {/* User Profile */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-sidebar-border p-4 bg-sidebar-accent/5">
          {sidebarOpen ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-sidebar-accent/20 flex items-center justify-center text-sidebar-foreground font-bold">
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
                className="w-full text-sidebar-foreground border-sidebar-accent/30 hover:bg-sidebar-accent/10 justify-start gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          ) : (
            <button
              onClick={handleLogout}
              className="w-full p-2 rounded hover:bg-sidebar-accent/10 flex justify-center"
            >
              <LogOut className="w-5 h-5 text-sidebar-foreground" />
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        {/* Top Bar */}
        <div className="sticky top-0 h-16 bg-card border-b border-border flex items-center px-6 gap-4 z-30">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-foreground hover:bg-muted p-2 rounded-lg"
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-semibold text-foreground">Welcome, {user.name}</h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right">
              <p className="text-sm font-semibold text-foreground">{user.name}</p>
              <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold">
              {user.name.charAt(0)}
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-6">{children}</div>
      </main>
    </div>
  )
}
