let refreshing = false

export function initServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    console.log('[PWA] Service Workers not supported')
    return
  }

  navigator.serviceWorker
    .register('/sw.js', { scope: '/' })
    .then((registration: ServiceWorkerRegistration) => {
      console.log('[PWA] Service Worker registered')
      
      // Check for updates every minute
      setInterval(() => {
        registration.update()
      }, 60000)

      // Listen for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'activated' && navigator.serviceWorker.controller) {
              console.log('[PWA] New content available')
              showUpdatePrompt()
            }
          })
        }
      })

      console.log('[PWA] App ready to work offline')
      showOfflineReady()
    })
    .catch((error: Error) => {
      console.error('[PWA] Service Worker registration error:', error)
    })

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (refreshing) return
    refreshing = true
    window.location.reload()
  })
}

function showUpdatePrompt() {
  const message = document.createElement('div')
  message.className =
    'fixed bottom-4 left-4 right-4 z-50 bg-primary-500 text-white p-4 rounded-lg shadow-elevated flex items-center justify-between gap-4'
  message.innerHTML = `
    <div>
      <p class="font-semibold">Update Available</p>
      <p class="text-sm opacity-90">A new version of NoteVault is ready</p>
    </div>
    <button class="px-4 py-2 bg-white text-primary-600 rounded font-medium hover:bg-neutral-100 transition-colors whitespace-nowrap">
      Reload
    </button>
  `

  document.body.appendChild(message)

  const button = message.querySelector('button')
  if (button) {
    button.addEventListener('click', () => {
      window.location.reload()
    })
  }

  setTimeout(() => {
    message.remove()
  }, 10000)
}

function showOfflineReady() {
  const message = document.createElement('div')
  message.className =
    'fixed bottom-4 left-4 right-4 z-50 bg-accent-lime text-neutral-900 p-4 rounded-lg shadow-elevated flex items-center justify-between gap-4'
  message.innerHTML = `
    <div>
      <p class="font-semibold">Ready for Offline</p>
      <p class="text-sm opacity-90">NoteVault can now work without internet</p>
    </div>
    <button class="px-4 py-2 bg-neutral-900 text-accent-lime rounded font-medium hover:bg-neutral-800 transition-colors whitespace-nowrap">
      Got it
    </button>
  `

  document.body.appendChild(message)

  const button = message.querySelector('button')
  if (button) {
    button.addEventListener('click', () => {
      message.remove()
    })
  }

  setTimeout(() => {
    if (message.parentElement) message.remove()
  }, 5000)
}
