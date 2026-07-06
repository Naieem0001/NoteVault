import type { Note } from '@/lib/db'
import { Pin, Trash2 } from 'lucide-react'
import { useNotesStore } from '@/store/notes'
import { formatDistanceToNow } from 'date-fns'

interface NotesListProps {
  notes: Note[]
  selectedNoteId: string | null
  onSelectNote: (id: string) => void
}

export function NotesList({ notes, selectedNoteId, onSelectNote }: NotesListProps) {
  const { togglePin, deleteNote } = useNotesStore()

  const pinnedNotes = notes.filter((n) => n.isPinned).sort((a, b) => b.updatedAt - a.updatedAt)
  const regularNotes = notes.filter((n) => !n.isPinned).sort((a, b) => b.updatedAt - a.updatedAt)

  const handlePin = (e: React.MouseEvent, noteId: string) => {
    e.stopPropagation()
    togglePin(noteId)
  }

  const handleDelete = (e: React.MouseEvent, noteId: string) => {
    e.stopPropagation()
    if (confirm('Delete this note?')) {
      deleteNote(noteId)
    }
  }

  const renderNoteItem = (note: Note) => (
    <button
      key={note.id}
      onClick={() => onSelectNote(note.id)}
      className={`group w-full border-b border-neutral-200 p-3 text-left transition-default dark:border-dark-border ${
        selectedNoteId === note.id
          ? 'bg-primary-50 dark:bg-primary-900/20'
          : 'hover:bg-neutral-50 dark:hover:bg-dark-card'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="truncate font-medium text-neutral-900 dark:text-neutral-50">
            {note.title || 'Untitled'}
          </h3>
          <p className="truncate text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            {note.content?.substring(0, 100) || 'No content'}
          </p>
          <time className="text-xs text-neutral-400 dark:text-neutral-500 block mt-1">
            {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}
          </time>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => handlePin(e, note.id)}
            className="rounded p-1 hover:bg-neutral-200 dark:hover:bg-dark-border"
            title={note.isPinned ? 'Unpin' : 'Pin'}
          >
            <Pin className={`h-4 w-4 ${note.isPinned ? 'fill-current text-amber-500' : 'text-neutral-400'}`} />
          </button>
          <button
            onClick={(e) => handleDelete(e, note.id)}
            className="rounded p-1 hover:bg-red-100 dark:hover:bg-red-900/20"
            title="Delete"
          >
            <Trash2 className="h-4 w-4 text-red-500 dark:text-red-400" />
          </button>
        </div>
      </div>
    </button>
  )

  if (notes.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center text-center text-neutral-500 dark:text-neutral-400 p-4">
        <p>No notes yet. Create one to get started!</p>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {pinnedNotes.length > 0 && (
        <>
          <div className="sticky top-0 bg-neutral-50 px-3 py-2 text-xs font-semibold uppercase text-neutral-600 dark:bg-dark-card dark:text-neutral-400">
            Pinned
          </div>
          {pinnedNotes.map(renderNoteItem)}
        </>
      )}
      {regularNotes.length > 0 && (
        <>
          {pinnedNotes.length > 0 && (
            <div className="sticky top-8 bg-neutral-50 px-3 py-2 text-xs font-semibold uppercase text-neutral-600 dark:bg-dark-card dark:text-neutral-400">
              Recent
            </div>
          )}
          {regularNotes.map(renderNoteItem)}
        </>
      )}
    </div>
  )
}
