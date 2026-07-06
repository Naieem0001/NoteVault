import { useNotesStore } from '@/store/notes'
import { useAuthStore } from '@/store/auth'
import { Menu, Search, Moon, Sun } from 'lucide-react'
import { useState, useEffect } from 'react'
import { SearchResults } from '@/components/notes/search-results'
import { toggleTheme } from '@/lib/theme'

interface TopBarProps {
  onToggleSidebar: () => void
  onSelectNote: (id: string) => void
}

export function TopBar({ onToggleSidebar, onSelectNote }: TopBarProps) {
  const { searchQuery, setSearchQuery, searchNotes } = useNotesStore()
  const { user } = useAuthStore()
  const [isDark, setIsDark] = useState(false)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [showResults, setShowResults] = useState(false)

  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains('dark')
    setIsDark(isDarkMode)
  }, [])

  useEffect(() => {
    const performSearch = async () => {
      if (user && searchQuery.trim()) {
        const results = await searchNotes(searchQuery, user.id)
        setSearchResults(results)
        setShowResults(true)
      } else {
        setShowResults(false)
      }
    }

    const timer = setTimeout(performSearch, 300)
    return () => clearTimeout(timer)
  }, [searchQuery, user, searchNotes])

  const handleThemeToggle = () => {
    toggleTheme()
    setIsDark(!isDark)
  }

  return (
    <>
      <header className="border-b border-neutral-200 bg-white px-4 py-3 dark:border-dark-border dark:bg-dark-surface">
        <div className="flex items-center justify-between gap-4">
        {/* Left: Menu and Logo */}
        <div className="flex items-center gap-4">
          <button
            onClick={onToggleSidebar}
            className="md:hidden rounded-lg p-2 hover:bg-neutral-100 dark:hover:bg-dark-card"
          >
            <Menu className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
          </button>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary text-white text-sm font-bold">
              📝
            </div>
            <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-50">
              NoteVault
            </h1>
          </div>
        </div>

        {/* Center: Search */}
        <div className="hidden flex-1 max-w-md md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-9"
            />
          </div>
        </div>

        {/* Right: Theme Toggle */}
          <button
            onClick={handleThemeToggle}
            className="rounded-lg p-2 hover:bg-neutral-100 dark:hover:bg-dark-card transition-colors"
            aria-label="Toggle dark mode"
          >
            {isDark ? (
              <Sun className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
            ) : (
              <Moon className="h-4 w-4 text-neutral-600" />
            )}
          </button>
      </div>

      {/* Mobile Search */}
      <div className="mt-3 md:hidden">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-9 text-sm"
          />
        </div>
      </div>
    </header>

      {/* Search Results Modal */}
      {showResults && (
        <SearchResults
          query={searchQuery}
          results={searchResults}
          onSelectNote={onSelectNote}
          onClose={() => {
            setShowResults(false)
            setSearchQuery('')
          }}
        />
      )}
    </>
  )
}
