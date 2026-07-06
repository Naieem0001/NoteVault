import type { Note } from '@/lib/db'
import { X } from 'lucide-react'

interface SearchResultsProps {
  query: string
  results: Note[]
  onSelectNote: (id: string) => void
  onClose: () => void
}

export function SearchResults({
  query,
  results,
  onSelectNote,
  onClose,
}: SearchResultsProps) {
  if (!query.trim()) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm md:hidden">
      <div className="flex h-full flex-col bg-white dark:bg-dark-bg">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3 dark:border-dark-border">
          <h2 className="font-semibold text-neutral-900 dark:text-neutral-50">
            Search Results for "{query}"
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-neutral-100 dark:hover:bg-dark-surface"
          >
            <X className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
          </button>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto">
          {results.length === 0 ? (
            <div className="flex items-center justify-center p-8 text-center">
              <p className="text-neutral-500 dark:text-neutral-400">
                No notes found matching your search
              </p>
            </div>
          ) : (
            <div className="space-y-2 p-3">
              {results.map((note) => (
                <button
                  key={note.id}
                  onClick={() => {
                    onSelectNote(note.id)
                    onClose()
                  }}
                  className="w-full rounded-lg border border-neutral-200 bg-white p-3 text-left transition-default hover:bg-neutral-50 dark:border-dark-border dark:bg-dark-surface dark:hover:bg-dark-card"
                >
                  <h3 className="font-medium text-neutral-900 dark:text-neutral-50">
                    {note.title || 'Untitled'}
                  </h3>
                  <p className="truncate text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                    {note.content?.substring(0, 100) || 'No content'}
                  </p>
                  {note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {note.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="inline-block rounded-full bg-primary-100 px-2 py-0.5 text-xs text-primary-700 dark:bg-primary-900/30 dark:text-primary-400"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
