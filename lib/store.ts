import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// Define types for your store state and actions
export type UserRole = 'shipper' | 'driver'

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

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: false,

      login: async (phone: string, password: string) => {
        set({ isLoading: true })
        try {

          const response = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone, password }),
            credentials: 'include',
          })
          
          if (!response.ok) {
            const errorMsg = await response.json()
            throw new Error(errorMsg.error || 'Authentication failure')
          }
          
          const data = await response.json()
          set({ user: data.user, token: data.token, isLoading: false })
        } catch (error: any) {
          set({ isLoading: false })
          throw error
        }
      },

      register: async (userData: RegisterData) => {
        set({ isLoading: true })
        try {
          const response = await fetch('http://localhost:5000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData),
            credentials: 'include',
          })

          if (!response.ok) {
            const errorMsg = await response.json()
            throw new Error(errorMsg.error || 'Registration failed')
          }

          const data = await response.json()
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