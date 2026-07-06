export type Theme = 'light' | 'dark' | 'system'

const THEME_KEY = 'notevault-theme'
const DARK_CLASS = 'dark'

export function initTheme() {
  const stored = localStorage.getItem(THEME_KEY) as Theme | null
  const theme = stored || 'system'
  applyTheme(theme)
  return theme
}

export function applyTheme(theme: Theme) {
  const html = document.documentElement
  const isDark =
    theme === 'dark' ||
    (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)

  if (isDark) {
    html.classList.add(DARK_CLASS)
  } else {
    html.classList.remove(DARK_CLASS)
  }

  localStorage.setItem(THEME_KEY, theme)
}

export function getSystemTheme(): Theme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function getCurrentTheme(): Theme {
  return (localStorage.getItem(THEME_KEY) as Theme) || 'system'
}

export function toggleTheme() {
  const current = getCurrentTheme()
  const next: Theme = current === 'light' ? 'dark' : 'light'
  applyTheme(next)
  return next
}

export function watchSystemTheme(callback: (isDark: boolean) => void) {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  const handler = (e: MediaQueryListEvent) => {
    const current = getCurrentTheme()
    if (current === 'system') {
      callback(e.matches)
    }
  }

  mediaQuery.addEventListener('change', handler)
  return () => mediaQuery.removeEventListener('change', handler)
}
