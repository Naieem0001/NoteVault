import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/auth'
import { useNotesStore } from '@/store/notes'
import { AuthPages } from '@/pages/auth'
import { Dashboard } from '@/pages/dashboard'
import { Loader } from '@/components/ui/loader'

export function App() {
  const { user, loading: authLoading, initializeAuth } = useAuthStore()
  const { fetchFolders, fetchNotes } = useNotesStore()
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    const init = async () => {
      await initializeAuth()
      setInitialized(true)
    }
    init()
  }, [initializeAuth])

  useEffect(() => {
    if (user && initialized) {
      fetchFolders(user.id)
      fetchNotes(user.id)
    }
  }, [user, initialized, fetchFolders, fetchNotes])

  if (!initialized || authLoading) {
    return <Loader />
  }

  return user ? <Dashboard /> : <AuthPages />
}
