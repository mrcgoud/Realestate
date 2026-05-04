import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User } from '@/types'
import { apiClient } from '@/lib/api-client'

interface AuthStore {
  user: User | null
  token: string | null
  isLoading: boolean
  error: string | null

  // Actions
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<void>
  logout: () => Promise<void>
  fetchCurrentUser: () => Promise<void>
  updateUser: (updates: Partial<User>) => Promise<void>
  clearError: () => void
  setUser: (user: User | null) => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null })
        try {
          const response = await apiClient.login(email, password)
          set({
            user: response.user,
            token: response.accessToken,
            isLoading: false,
          })
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : 'Login failed'
          set({ error: message, isLoading: false })
          throw error
        }
      },

      register: async (email: string, password: string, firstName: string, lastName: string) => {
        set({ isLoading: true, error: null })
        try {
          const response = await apiClient.register(email, password, firstName, lastName)
          set({
            user: response.user,
            token: response.accessToken,
            isLoading: false,
          })
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : 'Registration failed'
          set({ error: message, isLoading: false })
          throw error
        }
      },

      logout: async () => {
        set({ isLoading: true })
        try {
          await apiClient.logout()
        } finally {
          set({
            user: null,
            token: null,
            isLoading: false,
            error: null,
          })
        }
      },

      fetchCurrentUser: async () => {
        set({ isLoading: true })
        try {
          const user = await apiClient.getCurrentUser()
          set({ user, isLoading: false })
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : 'Failed to fetch user'
          set({ error: message, isLoading: false })
        }
      },

      updateUser: async (updates: Partial<User>) => {
        set({ isLoading: true, error: null })
        try {
          const user = await apiClient.updateUser(updates)
          set({ user, isLoading: false })
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : 'Failed to update user'
          set({ error: message, isLoading: false })
          throw error
        }
      },

      clearError: () => set({ error: null }),

      setUser: (user: User | null) => set({ user }),
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
)
