import { create } from 'zustand'
import { db, type Note, type Folder } from '@/lib/db'
import { syncManager } from '@/lib/sync'
import { v4 as uuidv4 } from 'uuid'

interface NotesStore {
  notes: Note[]
  folders: Folder[]
  selectedFolderId: string | null
  searchQuery: string
  loading: boolean

  // Notes operations
  createNote: (userId: string, title: string, folderId?: string) => Promise<Note>
  updateNote: (id: string, updates: Partial<Note>) => Promise<void>
  deleteNote: (id: string) => Promise<void>
  togglePin: (id: string) => Promise<void>

  // Folder operations
  createFolder: (userId: string, name: string) => Promise<Folder>
  updateFolder: (id: string, updates: Partial<Folder>) => Promise<void>
  deleteFolder: (id: string) => Promise<void>

  // Fetching operations
  fetchNotes: (userId: string, folderId?: string) => Promise<void>
  fetchFolders: (userId: string) => Promise<void>

  // UI operations
  setSelectedFolderId: (id: string | null) => void
  setSearchQuery: (query: string) => void
  searchNotes: (query: string, userId: string) => Promise<Note[]>
}

export const useNotesStore = create<NotesStore>((set, get) => ({
  notes: [],
  folders: [],
  selectedFolderId: null,
  searchQuery: '',
  loading: false,

  createNote: async (userId: string, title: string, folderId?: string) => {
    const note: Note = {
      id: uuidv4(),
      userId,
      folderId,
      title,
      content: '',
      isPinned: false,
      tags: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isSyncPending: true,
    }

    await db.notes.add(note)
    await syncManager.addToQueue('create', 'notes', {
      id: note.id,
      user_id: userId,
      folder_id: folderId || null,
      title,
      content: '',
      is_pinned: false,
      tags: [],
      created_at: new Date(note.createdAt).toISOString(),
      updated_at: new Date(note.updatedAt).toISOString(),
    })

    set((state) => ({
      notes: [...state.notes, note],
    }))

    return note
  },

  updateNote: async (id: string, updates: Partial<Note>) => {
    await db.notes.update(id, {
      ...updates,
      updatedAt: Date.now(),
      isSyncPending: true,
    })

    const note = await db.notes.get(id)
    if (note) {
      await syncManager.addToQueue('update', 'notes', {
        id: note.id,
        user_id: note.userId,
        folder_id: note.folderId || null,
        title: note.title,
        content: note.content,
        is_pinned: note.isPinned,
        tags: note.tags,
        updated_at: new Date(note.updatedAt).toISOString(),
      })

      set((state) => ({
        notes: state.notes.map((n) => (n.id === id ? note : n)),
      }))
    }
  },

  deleteNote: async (id: string) => {
    const note = await db.notes.get(id)
    if (note) {
      await db.notes.delete(id)
      await syncManager.addToQueue('delete', 'notes', { id, user_id: note.userId })

      set((state) => ({
        notes: state.notes.filter((n) => n.id !== id),
      }))
    }
  },

  togglePin: async (id: string) => {
    const note = await db.notes.get(id)
    if (note) {
      await get().updateNote(id, { isPinned: !note.isPinned })
    }
  },

  createFolder: async (userId: string, name: string) => {
    const folder: Folder = {
      id: uuidv4(),
      userId,
      name,
      order: Date.now(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isSyncPending: true,
    }

    await db.folders.add(folder)
    await syncManager.addToQueue('create', 'folders', {
      id: folder.id,
      user_id: userId,
      name,
      order: folder.order,
      created_at: new Date(folder.createdAt).toISOString(),
      updated_at: new Date(folder.updatedAt).toISOString(),
    })

    set((state) => ({
      folders: [...state.folders, folder],
    }))

    return folder
  },

  updateFolder: async (id: string, updates: Partial<Folder>) => {
    await db.folders.update(id, {
      ...updates,
      updatedAt: Date.now(),
      isSyncPending: true,
    })

    const folder = await db.folders.get(id)
    if (folder) {
      await syncManager.addToQueue('update', 'folders', {
        id: folder.id,
        user_id: folder.userId,
        name: folder.name,
        color: folder.color,
        icon: folder.icon,
        order: folder.order,
        updated_at: new Date(folder.updatedAt).toISOString(),
      })

      set((state) => ({
        folders: state.folders.map((f) => (f.id === id ? folder : f)),
      }))
    }
  },

  deleteFolder: async (id: string) => {
    const folder = await db.folders.get(id)
    if (folder) {
      await db.folders.delete(id)
      await syncManager.addToQueue('delete', 'folders', { id, user_id: folder.userId })

      set((state) => ({
        folders: state.folders.filter((f) => f.id !== id),
      }))
    }
  },

  fetchNotes: async (userId: string, folderId?: string) => {
    set({ loading: true })
    try {
      let query = db.notes.where('userId').equals(userId)
      if (folderId) {
        query = db.notes.where('[userId+folderId]').equals([userId, folderId])
      }
      const notes = await query.toArray()
      set({ notes })
    } catch (error) {
      console.error('[Notes] Fetch error:', error)
    } finally {
      set({ loading: false })
    }
  },

  fetchFolders: async (userId: string) => {
    set({ loading: true })
    try {
      const folders = await db.folders.where('userId').equals(userId).toArray()
      set({ folders })
    } catch (error) {
      console.error('[Folders] Fetch error:', error)
    } finally {
      set({ loading: false })
    }
  },

  setSelectedFolderId: (id: string | null) => {
    set({ selectedFolderId: id })
  },

  setSearchQuery: (query: string) => {
    set({ searchQuery: query })
  },

  searchNotes: async (query: string, userId: string) => {
    if (!query.trim()) {
      return get().notes
    }

    const allNotes = await db.notes.where('userId').equals(userId).toArray()
    const searchLower = query.toLowerCase()

    return allNotes.filter(
      (note) =>
        note.title.toLowerCase().includes(searchLower) ||
        note.content.toLowerCase().includes(searchLower) ||
        note.tags.some((tag) => tag.toLowerCase().includes(searchLower)),
    )
  },
}))
