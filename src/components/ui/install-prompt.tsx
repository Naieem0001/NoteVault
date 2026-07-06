import { useEffect, useState } from 'react'
import { X, Download } from 'lucide-react'
import { motion } from 'framer-motion'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      const promptEvent = e as BeforeInstallPromptEvent
      setDeferredPrompt(promptEvent)
      setShowPrompt(true)
    }

    const displayModeHandler = () => {
      const displayMode = window.matchMedia('(display-mode: standalone)').matches
      if (displayMode) {
        setIsInstalled(true)
        setShowPrompt(false)
      }
    }

    window.addEventListener('beforeinstallprompt', handler)
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true)
      setShowPrompt(false)
    })
    displayModeHandler()
    window.matchMedia('(display-mode: standalone)').addEventListener('change', () => {
      displayModeHandler()
    })

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
      window.removeEventListener('appinstalled', () => {})
    }
  }, [])

  if (!showPrompt || isInstalled) return null

  const handleInstall = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setShowPrompt(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="fixed left-0 right-0 top-0 z-50 bg-gradient-primary p-4 text-white shadow-elevated"
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-3">
          <Download className="h-5 w-5 flex-shrink-0" />
          <div>
            <p className="font-semibold">Install NoteVault</p>
            <p className="text-sm opacity-90">Add to your home screen for offline access</p>
          </div>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={handleInstall}
            className="rounded-lg bg-white px-4 py-2 font-medium text-primary-600 hover:bg-neutral-100 transition-colors"
          >
            Install
          </button>
          <button
            onClick={() => setShowPrompt(false)}
            className="rounded-lg p-2 hover:bg-white/20 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}
