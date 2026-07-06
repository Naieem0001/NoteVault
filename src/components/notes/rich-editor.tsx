import type { Note } from '@/lib/db'
import { useNotesStore } from '@/store/notes'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Bold, Italic, List, CheckSquare, Code, Heading2, Trash2 } from 'lucide-react'

interface RichEditorProps {
  note: Note
}

export function RichEditor({ note }: RichEditorProps) {
  const { updateNote, deleteNote } = useNotesStore()
  const [title, setTitle] = useState(note.title)
  const [content, setContent] = useState(note.content)
  const [tags, setTags] = useState<string[]>(note.tags)
  const [tagInput, setTagInput] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')

  useEffect(() => {
    setTitle(note.title)
    setContent(note.content)
    setTags(note.tags)
  }, [note])

  const handleSave = async () => {
    setIsSaving(true)
    setSaveMessage('')

    try {
      await updateNote(note.id, {
        title: title || 'Untitled',
        content,
        tags,
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

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      const newTags = [...tags, tagInput.trim()]
      setTags(newTags)
      setTagInput('')
      updateNote(note.id, { tags: newTags })
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    const newTags = tags.filter((t) => t !== tagToRemove)
    setTags(newTags)
    updateNote(note.id, { tags: newTags })
  }

  const handleDelete = () => {
    if (confirm('Delete this note permanently?')) {
      deleteNote(note.id)
    }
  }

  // Auto-save
  useEffect(() => {
    const timer = setTimeout(() => {
      if (title !== note.title || content !== note.content) {
        handleSave()
      }
    }, 1500)

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
        <div className="flex items-center gap-3">
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
          <button
            onClick={handleDelete}
            className="rounded-lg p-2 hover:bg-red-100 dark:hover:bg-red-900/20"
            title="Delete note"
          >
            <Trash2 className="h-5 w-5 text-red-600 dark:text-red-400" />
          </button>
        </div>
      </div>

      {/* Editor Toolbar */}
      <div className="flex items-center gap-1 border-b border-neutral-200 bg-neutral-50 px-6 py-2 dark:border-dark-border dark:bg-dark-surface">
        <button
          className="rounded p-2 hover:bg-neutral-200 dark:hover:bg-dark-card"
          title="Bold"
          onClick={() => {
            const textarea = document.querySelector('textarea')
            if (textarea) {
              const start = textarea.selectionStart
              const end = textarea.selectionEnd
              const selected = content.substring(start, end)
              const newContent =
                content.substring(0, start) +
                `**${selected}**` +
                content.substring(end)
              setContent(newContent)
            }
          }}
        >
          <Bold className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
        </button>
        <button
          className="rounded p-2 hover:bg-neutral-200 dark:hover:bg-dark-card"
          title="Italic"
          onClick={() => {
            const textarea = document.querySelector('textarea')
            if (textarea) {
              const start = textarea.selectionStart
              const end = textarea.selectionEnd
              const selected = content.substring(start, end)
              const newContent =
                content.substring(0, start) +
                `*${selected}*` +
                content.substring(end)
              setContent(newContent)
            }
          }}
        >
          <Italic className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
        </button>
        <div className="mx-1 w-px h-6 bg-neutral-300 dark:bg-dark-border" />
        <button
          className="rounded p-2 hover:bg-neutral-200 dark:hover:bg-dark-card"
          title="Heading"
          onClick={() => {
            setContent(`## Heading\n${content}`)
          }}
        >
          <Heading2 className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
        </button>
        <button
          className="rounded p-2 hover:bg-neutral-200 dark:hover:bg-dark-card"
          title="Bullet list"
          onClick={() => {
            setContent(`- Item\n${content}`)
          }}
        >
          <List className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
        </button>
        <button
          className="rounded p-2 hover:bg-neutral-200 dark:hover:bg-dark-card"
          title="Checkbox"
          onClick={() => {
            setContent(`- [ ] Task\n${content}`)
          }}
        >
          <CheckSquare className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
        </button>
        <button
          className="rounded p-2 hover:bg-neutral-200 dark:hover:bg-dark-card"
          title="Code block"
          onClick={() => {
            setContent(`\`\`\`\ncode\n\`\`\`\n${content}`)
          }}
        >
          <Code className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
        </button>
      </div>

      {/* Editor Content */}
      <div className="flex-1 overflow-hidden flex flex-col p-6">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Start typing your note... Markdown is supported!"
          className="flex-1 resize-none bg-transparent text-neutral-700 placeholder-neutral-400 outline-none dark:text-neutral-300 dark:placeholder-neutral-500 font-mono text-sm leading-relaxed"
        />
      </div>

      {/* Tags Section */}
      <div className="border-t border-neutral-200 bg-neutral-50 px-6 py-3 dark:border-dark-border dark:bg-dark-surface">
        <div className="mb-2 text-xs font-semibold uppercase text-neutral-600 dark:text-neutral-400">
          Tags
        </div>
        <div className="flex flex-wrap gap-2 mb-3">
          {tags.map((tag) => (
            <div
              key={tag}
              className="inline-flex items-center gap-2 rounded-full bg-primary-100 px-3 py-1 text-sm text-primary-700 dark:bg-primary-900/30 dark:text-primary-400"
            >
              <span>#{tag}</span>
              <button
                onClick={() => handleRemoveTag(tag)}
                className="hover:text-primary-900 dark:hover:text-primary-300"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleAddTag()
              }
            }}
            placeholder="Add tag and press Enter..."
            className="input text-sm flex-1"
          />
        </div>
      </div>

      {/* Footer Info */}
      <div className="border-t border-neutral-200 bg-white px-6 py-3 text-xs text-neutral-600 dark:border-dark-border dark:bg-dark-surface dark:text-neutral-400 flex items-center justify-between">
        <span>
          {content.length} characters • {content.split(/\s+/).filter(Boolean).length} words
        </span>
        {isSaving && <span className="text-primary-500 dark:text-primary-400">Saving...</span>}
      </div>
    </div>
  )
}
