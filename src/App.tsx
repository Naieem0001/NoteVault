import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/auth'
import { useNotesStore } from '@/store/notes'
import { AuthPages } from '@/pages/auth'
import { Dashboard } from '@/pages/dashboard'
import { Loader } from '@/components/ui/loader'
import { OfflineIndicator } from '@/components/ui/offline-indicator'
import { InstallPrompt } from '@/components/ui/install-prompt'
import { initTheme } from '@/lib/theme'

export function App() {
  const { user, loading: authLoading, initializeAuth } = useAuthStore()
  const { fetchFolders, fetchNotes } = useNotesStore()
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    const init = async () => {
      initTheme()
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

  return (
    <>
      <InstallPrompt />
      <OfflineIndicator />
      {user ? <Dashboard /> : <AuthPages />}
    </>
  )
}
