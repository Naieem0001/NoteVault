import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
      }
      folders: {
        Row: {
          id: string
          user_id: string
          name: string
          color: string | null
          icon: string | null
          order: number
          created_at: string
          updated_at: string
        }
      }
      notes: {
        Row: {
          id: string
          user_id: string
          folder_id: string | null
          title: string
          content: string
          is_pinned: boolean
          tags: string[]
          created_at: string
          updated_at: string
          synced_at: string | null
        }
      }
    }
  }
}
