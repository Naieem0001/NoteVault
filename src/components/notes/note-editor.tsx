import type { Note } from '@/lib/db'
import { useNotesStore } from '@/store/notes'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface NoteEditorProps {
  note: Note
}

export function NoteEditor({ note }: NoteEditorProps) {
  const { updateNote } = useNotesStore()
  const [title, setTitle] = useState(note.title)
  const [content, setContent] = useState(note.content)
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')

  useEffect(() => {
    setTitle(note.title)
    setContent(note.content)
  }, [note])

  const handleSave = async () => {
    setIsSaving(true)
    setSaveMessage('')

    try {
      await updateNote(note.id, {
        title: title || 'Untitled',
        content,
      })
      setSaveMessage('Saved')
      setTimeout(() => setSaveMessage(''), 2000)
    } catch (error) {
      setSaveMessage('Error saving')
      setTimeout(() => setSaveMessage(''), 2000)
    } finally {
      setIsSaving(false)
    }
  }

  // Auto-save
  useEffect(() => {
    const timer = setTimeout(() => {
      if (title !== note.title || content !== note.content) {
        handleSave()
      }
    }, 1000)

    return () => clearTimeout(timer)
  }, [title, content, note.title, note.content])

  return (
    <div className="flex flex-col h-full bg-white dark:bg-dark-bg">
      {/* Editor Header */}
      <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4 dark:border-dark-border">
        <div className="flex-1">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Note title..."
            className="w-full bg-transparent text-2xl font-bold text-neutral-900 placeholder-neutral-400 outline-none dark:text-neutral-50 dark:placeholder-neutral-500"
          />
        </div>
        {saveMessage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`text-sm font-medium ${
              saveMessage === 'Saved'
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-600 dark:text-red-400'
            }`}
          >
            {saveMessage}
          </motion.div>
        )}
      </div>

      {/* Editor Content */}
      <div className="flex-1 overflow-hidden p-6">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Start typing..."
          className="h-full w-full resize-none bg-transparent text-neutral-700 placeholder-neutral-400 outline-none dark:text-neutral-300 dark:placeholder-neutral-500"
        />
      </div>

      {/* Footer Info */}
      <div className="border-t border-neutral-200 bg-neutral-50 px-6 py-3 text-xs text-neutral-600 dark:border-dark-border dark:bg-dark-surface dark:text-neutral-400">
        <div className="flex items-center justify-between">
          <span>
            {content.length} characters • {content.split(/\s+/).filter(Boolean).length} words
          </span>
          {isSaving && (
            <span className="text-primary-500 dark:text-primary-400">Saving...</span>
          )}
        </div>
      </div>
    </div>
  )
}
