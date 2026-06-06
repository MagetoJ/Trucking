import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type UserRole = 'shipper' | 'driver'

export interface User {
  id: string
  name: string
  phone: string
  email?: string
  role: UserRole
  avatar?: string
  rating: number
  verified: boolean
  createdAt: string
}

export interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (phone: string, password: string) => Promise<void>
  register: (data: Omit<User, 'id' | 'rating' | 'verified' | 'createdAt'> & { password: string }) => Promise<void>
  logout: () => void
  setUser: (user: User | null) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: false,
      login: async (phone, password) => {
        set({ isLoading: true })
        try {
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone, password }),
          })
          const data = await response.json()
          set({ user: data.user, token: data.token, isLoading: false })
        } catch (error) {
          console.error('Login failed:', error)
          set({ isLoading: false })
          throw error
        }
      },
      register: async (data) => {
        set({ isLoading: true })
        try {
          const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          })
          const result = await response.json()
          set({ user: result.user, token: result.token, isLoading: false })
        } catch (error) {
          console.error('Registration failed:', error)
          set({ isLoading: false })
          throw error
        }
      },
      logout: () => set({ user: null, token: null }),
      setUser: (user) => set({ user }),
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
)
