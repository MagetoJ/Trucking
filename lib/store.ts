import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// Define types for your store state and actions
export type UserRole = 'shipper' | 'driver' | 'super_admin'

interface User {
  id: string
  name: string
  phone: string
  email: string
  role: UserRole
  // Add other user properties as needed
}

interface RegisterData {
  name: string
  phone: string
  email: string
  password: string
  role: UserRole
}

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (phone: string, password: string) => Promise<void>
  register: (userData: RegisterData) => Promise<void>
  logout: () => void
  setUser: (user: User) => void
}

// Global variable pointing to your standalone Express application port
const BACKEND_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
const BACKEND_API_URL = `${BACKEND_BASE}/api`;



export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: false,

      login: async (phone: string, password: string) => {
        set({ isLoading: true })
        try {
          const response = await fetch(`${BACKEND_API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone, password }),
            credentials: 'include',
          })
          
          const data = await response.json()
          if (!response.ok) {
            throw new Error(data.error || 'Authentication failure')
          }
          
          set({ user: data.user, token: data.token, isLoading: false })
        } catch (error: any) {
          set({ isLoading: false })
          throw error
        }
      },

      register: async (userData: RegisterData) => {
        set({ isLoading: true })
        try {
          const response = await fetch(`${BACKEND_API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData),
            credentials: 'include',
          })

          const data = await response.json()
          if (!response.ok) {
            throw new Error(data.error || 'Registration failed')
          }

          set({ user: data.user, token: data.token, isLoading: false })
        } catch (error: any) {
          set({ isLoading: false })
          throw error
        }
      },

      logout: () => {
        set({ user: null, token: null })
      },

      setUser: (user: User) => {
        set({ user })
      },
    }),
    {
      name: 'auth-storage', // unique name
      storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
    }
  )
)