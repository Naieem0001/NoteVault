import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './App'
import './index.css'

// Register service worker for PWA
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').catch((error) => {
    console.log('[PWA] Service worker registration failed:', error)
  })
}

// Listen for online/offline events
window.addEventListener('online', () => {
  console.log('[PWA] Back online')
})

window.addEventListener('offline', () => {
  console.log('[PWA] Gone offline')
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
