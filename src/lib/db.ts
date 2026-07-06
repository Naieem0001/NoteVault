import Dexie from 'dexie'
import type { Table } from 'dexie'

export interface Note {
  id: string
  userId: string
  folderId?: string
  title: string
  content: string
  isPinned: boolean
  tags: string[]
  createdAt: number
  updatedAt: number
  syncedAt?: number
  isSyncPending?: boolean
}

export interface Folder {
  id: string
  userId: string
  name: string
  color?: string
  icon?: string
  order: number
  createdAt: number
  updatedAt: number
  syncedAt?: number
  isSyncPending?: boolean
}

export interface SyncQueue {
  id: string
  operation: 'create' | 'update' | 'delete'
  table: 'notes' | 'folders'
  data: any
  createdAt: number
  attempts: number
}

export class NoteVaultDB extends Dexie {
  notes!: Table<Note>
  folders!: Table<Folder>
  syncQueue!: Table<SyncQueue>

  constructor() {
    super('NoteVaultDB')
    this.version(1).stores({
      notes: '++id, userId, folderId, &[userId+id]',
      folders: '++id, userId, &[userId+id]',
      syncQueue: '++id, createdAt, table',
    })
  }
}

export const db = new NoteVaultDB()
