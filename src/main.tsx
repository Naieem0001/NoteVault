import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './App'
import { initServiceWorker } from './lib/service-worker'
import './index.css'

// Initialize PWA service worker with update handling
initServiceWorker()

// Listen for online/offline events
window.addEventListener('online', () => {
  console.log('[PWA] Back online')
  // Trigger sync when coming back online
  if (navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({ type: 'TRIGGER_SYNC' })
  }
})

window.addEventListener('offline', () => {
  console.log('[PWA] Gone offline')
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
