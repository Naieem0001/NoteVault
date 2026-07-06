import { useState, useEffect } from 'react'
import { Wifi, WifiOff } from 'lucide-react'
import { motion } from 'framer-motion'

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (isOnline) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-0 left-0 right-0 z-40 bg-amber-50 border-b border-amber-200 px-4 py-3 dark:bg-amber-900/20 dark:border-amber-800"
    >
      <div className="flex items-center justify-center gap-2 text-sm font-medium text-amber-700 dark:text-amber-400">
        <WifiOff className="h-4 w-4" />
        You are offline. Your changes will sync when you&apos;re back online.
      </div>
    </motion.div>
  )
}
