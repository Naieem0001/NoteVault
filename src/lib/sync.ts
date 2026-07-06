import { db, type SyncQueue } from './db'
import { supabase } from './supabase'

class SyncManager {
  private isSyncing = false
  private syncInterval: ReturnType<typeof setInterval> | null = null

  async startSync() {
    if (this.isSyncing) return

    this.isSyncing = true
    await this.processQueue()
    this.isSyncing = false

    // Set up periodic sync
    if (!this.syncInterval) {
      this.syncInterval = setInterval(() => {
        this.processQueue()
      }, 10000) // Sync every 10 seconds
    }
  }

  stopSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
      this.syncInterval = null
    }
  }

  async addToQueue(operation: 'create' | 'update' | 'delete', table: 'notes' | 'folders', data: any) {
    const queueItem: SyncQueue = {
      id: `${table}-${data.id}-${Date.now()}`,
      operation,
      table,
      data,
      createdAt: Date.now(),
      attempts: 0,
    }

    await db.syncQueue.add(queueItem)

    // Try to sync immediately if online
    if (navigator.onLine) {
      this.processQueue()
    }
  }

  private async processQueue() {
    if (!navigator.onLine) return

    const queue = await db.syncQueue.toArray()
    if (queue.length === 0) return

    for (const item of queue) {
      try {
        if (item.table === 'notes') {
          await this.syncNote(item)
        } else if (item.table === 'folders') {
          await this.syncFolder(item)
        }
        await db.syncQueue.delete(item.id)
      } catch (error) {
        console.error('[Sync] Error syncing item:', error)
        const updatedItem = { ...item, attempts: item.attempts + 1 }
        if (updatedItem.attempts < 3) {
          await db.syncQueue.put(updatedItem)
        } else {
          console.error('[Sync] Max attempts reached for:', item.id)
          await db.syncQueue.delete(item.id)
        }
      }
    }
  }

  private async syncNote(item: SyncQueue) {
    const { data, operation } = item

    if (operation === 'create') {
      const { error } = await supabase.from('notes').insert([data])
      if (error) throw error
    } else if (operation === 'update') {
      const { error } = await supabase.from('notes').update(data).eq('id', data.id)
      if (error) throw error
    } else if (operation === 'delete') {
      const { error } = await supabase.from('notes').delete().eq('id', data.id)
      if (error) throw error
    }

    // Mark as synced
    if (operation !== 'delete') {
      await db.notes.update(data.id, { syncedAt: Date.now() })
    }
  }

  private async syncFolder(item: SyncQueue) {
    const { data, operation } = item

    if (operation === 'create') {
      const { error } = await supabase.from('folders').insert([data])
      if (error) throw error
    } else if (operation === 'update') {
      const { error } = await supabase.from('folders').update(data).eq('id', data.id)
      if (error) throw error
    } else if (operation === 'delete') {
      const { error } = await supabase.from('folders').delete().eq('id', data.id)
      if (error) throw error
    }

    // Mark as synced
    if (operation !== 'delete') {
      await db.folders.update(data.id, { syncedAt: Date.now() })
    }
  }

  async pullRemoteData(userId: string) {
    if (!navigator.onLine) return

    try {
      // Fetch notes
      const { data: notes, error: notesError } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', userId)

      if (notesError) throw notesError

      // Fetch folders
      const { data: folders, error: foldersError } = await supabase
        .from('folders')
        .select('*')
        .eq('user_id', userId)

      if (foldersError) throw foldersError

      // Merge with local data
      if (notes) {
        for (const note of notes) {
          const local = await db.notes.get(note.id)
          if (!local || local.updatedAt < new Date(note.updated_at).getTime()) {
            await db.notes.put({
              ...note,
              userId: note.user_id,
              folderId: note.folder_id,
              isPinned: note.is_pinned,
              createdAt: new Date(note.created_at).getTime(),
              updatedAt: new Date(note.updated_at).getTime(),
              syncedAt: Date.now(),
            })
          }
        }
      }

      if (folders) {
        for (const folder of folders) {
          const local = await db.folders.get(folder.id)
          if (!local || local.updatedAt < new Date(folder.updated_at).getTime()) {
            await db.folders.put({
              ...folder,
              userId: folder.user_id,
              createdAt: new Date(folder.created_at).getTime(),
              updatedAt: new Date(folder.updated_at).getTime(),
              syncedAt: Date.now(),
            })
          }
        }
      }
    } catch (error) {
      console.error('[Sync] Error pulling remote data:', error)
    }
  }
}

export const syncManager = new SyncManager()
