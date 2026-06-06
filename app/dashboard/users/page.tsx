'use client'

import { useState, useMemo } from 'react'
import { Search, Star, Shield, Phone, Mail, Filter } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface User {
  id: string
  name: string
  phone: string
  email: string
  role: 'shipper' | 'driver'
  rating: number
  verified: boolean
  avatar?: string
}

const MOCK_USERS: User[] = [
  {
    id: '1',
    name: 'John Mwangi',
    phone: '+254712345678',
    email: 'john@example.com',
    role: 'shipper',
    rating: 4.8,
    verified: true,
  },
  {
    id: '2',
    name: 'Sarah Kipchoge',
    phone: '+254712345679',
    email: 'sarah@example.com',
    role: 'driver',
    rating: 4.9,
    verified: true,
  },
  {
    id: '3',
    name: 'Mike Ochieng',
    phone: '+254712345680',
    email: 'mike@example.com',
    role: 'driver',
    rating: 4.7,
    verified: true,
  },
  {
    id: '4',
    name: 'Grace Kariuki',
    phone: '+254712345681',
    email: 'grace@example.com',
    role: 'shipper',
    rating: 4.6,
    verified: true,
  },
  {
    id: '5',
    name: 'Peter Kimani',
    phone: '+254712345682',
    email: 'peter@example.com',
    role: 'driver',
    rating: 4.5,
    verified: false,
  },
  {
    id: '6',
    name: 'Lucy Njeri',
    phone: '+254712345683',
    email: 'lucy@example.com',
    role: 'shipper',
    rating: 4.9,
    verified: true,
  },
]

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState<'all' | 'shipper' | 'driver'>('all')

  const filteredUsers = useMemo(() => {
    return MOCK_USERS.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone.includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesRole = filterRole === 'all' || user.role === filterRole

      return matchesSearch && matchesRole
    })
  }, [searchTerm, filterRole])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-foreground">Users</h2>
        <p className="text-muted-foreground mt-1">Browse and view user profiles</p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name, phone, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent bg-background text-foreground placeholder:text-muted-foreground"
          />
        </div>

        <div className="flex gap-2">
          <div className="relative">
            <Filter className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value as 'all' | 'shipper' | 'driver')}
              className="pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent bg-background text-foreground cursor-pointer"
            >
              <option value="all">All Users</option>
              <option value="shipper">Shippers</option>
              <option value="driver">Drivers</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Count */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredUsers.length} of {MOCK_USERS.length} users
      </div>

      {/* Users Grid */}
      {filteredUsers.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUsers.map((user) => (
            <Link key={user.id} href={`/dashboard/users/${user.id}`}>
              <div className="bg-card border border-border rounded-lg p-6 hover:border-accent transition-colors cursor-pointer group">
                {/* User Avatar */}
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold text-lg">
                    {user.name.charAt(0)}
                  </div>
                  {user.verified && (
                    <Shield className="w-5 h-5 text-accent" />
                  )}
                </div>

                {/* User Info */}
                <h3 className="text-lg font-bold text-foreground group-hover:text-accent transition-colors">
                  {user.name}
                </h3>
                <p className="text-xs font-semibold text-accent capitalize mb-4">
                  {user.role === 'shipper' ? '📦 Shipper' : '🚛 Driver'}
                </p>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-4">
                  <Star className="w-4 h-4 text-accent fill-accent" />
                  <span className="text-sm font-semibold text-foreground">{user.rating}</span>
                  <span className="text-xs text-muted-foreground">(42 reviews)</span>
                </div>

                {/* Contact Info */}
                <div className="space-y-2 py-4 border-t border-border border-b">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="w-4 h-4" />
                    <span>{user.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    <span className="truncate">{user.email}</span>
                  </div>
                </div>

                {/* View Profile Button */}
                <Button className="w-full mt-4 bg-accent hover:bg-accent/90 text-primary font-bold">
                  View Profile
                </Button>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-card border border-border rounded-lg">
          <Search className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-foreground font-medium mb-1">No users found</p>
          <p className="text-muted-foreground text-sm">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  )
}
