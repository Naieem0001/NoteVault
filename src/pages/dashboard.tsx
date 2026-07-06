import { useState } from 'react'
import { useAuthStore } from '@/store/auth'
import { useNotesStore } from '@/store/notes'
import { Sidebar } from '@/components/layout/sidebar'
import { RichEditor } from '@/components/notes/rich-editor'
import { NotesList } from '@/components/notes/notes-list'
import { TopBar } from '@/components/layout/topbar'
import { Plus } from 'lucide-react'
import { motion } from 'framer-motion'

export function Dashboard() {
  const { user } = useAuthStore()
  const { notes, selectedFolderId, createNote } = useNotesStore()
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const selectedNote = notes.find((n) => n.id === selectedNoteId)

  const handleCreateNote = async () => {
    if (user) {
      const note = await createNote(user.id, 'Untitled Note', selectedFolderId || undefined)
      setSelectedNoteId(note.id)
    }
  }

  return (
    <div className="flex h-screen flex-col bg-white dark:bg-dark-bg">
      {/* Top Bar */}
      <TopBar 
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onSelectNote={setSelectedNoteId}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        {(sidebarOpen || window.innerWidth >= 768) && (
          <Sidebar onClose={() => setSidebarOpen(false)} />
        )}

        {/* Main Content */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Notes List */}
          <div className="flex flex-1 overflow-hidden md:border-r md:border-neutral-200 md:dark:border-dark-border">
            <div className="flex w-full flex-col md:w-80">
              <div className="flex items-center justify-between border-b border-neutral-200 p-4 dark:border-dark-border">
                <h2 className="font-semibold text-neutral-900 dark:text-neutral-50">
                  {selectedFolderId ? 'Folder Notes' : 'All Notes'}
                </h2>
                <button
                  onClick={handleCreateNote}
                  className="rounded-lg p-2 hover:bg-neutral-100 dark:hover:bg-dark-surface"
                  title="New note"
                >
                  <Plus className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
                </button>
              </div>
              <NotesList
                notes={notes}
                selectedNoteId={selectedNoteId}
                onSelectNote={setSelectedNoteId}
              />
            </div>
          </div>

          {/* Note Editor */}
          <div className="hidden flex-1 overflow-hidden md:flex">
            {selectedNote ? (
              <motion.div
                key={selectedNote.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="flex-1"
              >
                <RichEditor note={selectedNote} />
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="flex flex-1 items-center justify-center bg-neutral-50 dark:bg-dark-surface"
              >
                <div className="text-center">
                  <p className="text-neutral-500 dark:text-neutral-400">
                    Select a note to start editing
                  </p>
                  <button
                    onClick={handleCreateNote}
                    className="btn-primary mt-4"
                  >
                    <Plus className="h-4 w-4" />
                    Create your first note
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
