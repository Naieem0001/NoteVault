import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import { syncManager } from '@/lib/sync'

export interface User {
  id: string
  email: string
  fullName?: string
  avatarUrl?: string
}

interface AuthStore {
  user: User | null
  loading: boolean
  error: string | null
  signUp: (email: string, password: string, fullName: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signInWithGitHub: () => Promise<void>
  signOut: () => Promise<void>
  initializeAuth: () => Promise<void>
  clearError: () => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  loading: false,
  error: null,

  signUp: async (email: string, password: string, fullName: string) => {
    set({ loading: true, error: null })
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })

      if (error) throw error

      if (data?.user) {
        set({
          user: {
            id: data.user.id,
            email: data.user.email!,
            fullName: fullName,
          },
          loading: false,
        })

        // Start sync
        syncManager.startSync()
        await syncManager.pullRemoteData(data.user.id)
      }
    } catch (error: any) {
      set({
        error: error.message || 'Sign up failed',
        loading: false,
      })
      throw error
    }
  },

  signIn: async (email: string, password: string) => {
    set({ loading: true, error: null })
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      if (data?.user) {
        set({
          user: {
            id: data.user.id,
            email: data.user.email!,
          },
          loading: false,
        })

        // Start sync
        syncManager.startSync()
        await syncManager.pullRemoteData(data.user.id)
      }
    } catch (error: any) {
      set({
        error: error.message || 'Sign in failed',
        loading: false,
      })
      throw error
    }
  },

  signInWithGoogle: async () => {
    set({ loading: true, error: null })
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error
    } catch (error: any) {
      set({
        error: error.message || 'Google sign in failed',
        loading: false,
      })
      throw error
    }
  },

  signInWithGitHub: async () => {
    set({ loading: true, error: null })
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error
    } catch (error: any) {
      set({
        error: error.message || 'GitHub sign in failed',
        loading: false,
      })
      throw error
    }
  },

  signOut: async () => {
    set({ loading: true, error: null })
    try {
      syncManager.stopSync()
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      set({
        user: null,
        loading: false,
      })
    } catch (error: any) {
      set({
        error: error.message || 'Sign out failed',
        loading: false,
      })
      throw error
    }
  },

  initializeAuth: async () => {
    set({ loading: true })
    try {
      const { data, error } = await supabase.auth.getSession()

      if (error) throw error

      if (data?.session?.user) {
        const user = data.session.user
        set({
          user: {
            id: user.id,
            email: user.email!,
            fullName: user.user_metadata?.full_name,
            avatarUrl: user.user_metadata?.avatar_url,
          },
          loading: false,
        })

        // Start sync
        syncManager.startSync()
        await syncManager.pullRemoteData(user.id)
      } else {
        set({ loading: false })
      }
    } catch (error: any) {
      console.error('[Auth] Initialization error:', error)
      set({ loading: false })
    }
  },

  clearError: () => set({ error: null }),
}))
