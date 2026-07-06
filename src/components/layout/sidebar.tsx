import { useAuthStore } from '@/store/auth'
import { useNotesStore } from '@/store/notes'
import { FolderPlus, LogOut, Settings, FileText, Inbox } from 'lucide-react'
import { useState } from 'react'

interface SidebarProps {
  onClose: () => void
}

export function Sidebar({ onClose }: SidebarProps) {
  const { user, signOut } = useAuthStore()
  const { folders, createFolder, setSelectedFolderId, selectedFolderId } = useNotesStore()
  const [creatingFolder, setCreatingFolder] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')

  const handleCreateFolder = async () => {
    if (user && newFolderName.trim()) {
      await createFolder(user.id, newFolderName)
      setNewFolderName('')
      setCreatingFolder(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    onClose()
  }

  return (
    <div className="flex w-64 flex-col border-r border-neutral-200 bg-white dark:border-dark-border dark:bg-dark-surface">
      {/* User Section */}
      <div className="border-b border-neutral-200 p-4 dark:border-dark-border">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-primary text-white">
            {user?.fullName?.[0] || user?.email?.[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate font-medium text-neutral-900 dark:text-neutral-50">
              {user?.fullName || 'User'}
            </p>
            <p className="truncate text-xs text-neutral-600 dark:text-neutral-400">
              {user?.email}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {/* All Notes */}
        <button
          onClick={() => setSelectedFolderId(null)}
          className={`w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-default ${
            selectedFolderId === null
              ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
              : 'text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-dark-card'
          }`}
        >
          <Inbox className="h-4 w-4" />
          All Notes
        </button>

        {/* Folders */}
        <div className="space-y-1">
          <div className="flex items-center justify-between px-3 py-2">
            <p className="text-xs font-semibold uppercase text-neutral-600 dark:text-neutral-400">
              Folders
            </p>
            <button
              onClick={() => setCreatingFolder(true)}
              className="rounded p-1 hover:bg-neutral-100 dark:hover:bg-dark-card"
            >
              <FolderPlus className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
            </button>
          </div>

          {creatingFolder && (
            <div className="flex gap-2 px-3 py-2">
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Folder name..."
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateFolder()
                  if (e.key === 'Escape') {
                    setCreatingFolder(false)
                    setNewFolderName('')
                  }
                }}
                className="input text-xs"
              />
            </div>
          )}

          {folders.map((folder) => (
            <button
              key={folder.id}
              onClick={() => setSelectedFolderId(folder.id)}
              className={`w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-default ${
                selectedFolderId === folder.id
                  ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                  : 'text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-dark-card'
              }`}
            >
              <FileText className="h-4 w-4" />
              <span className="truncate">{folder.name}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t border-neutral-200 p-3 dark:border-dark-border">
        <div className="space-y-2">
          <button className="btn-ghost w-full justify-start gap-3">
            <Settings className="h-4 w-4" />
            Settings
          </button>
          <button
            onClick={handleSignOut}
            className="btn-ghost w-full justify-start gap-3 text-red-600 dark:text-red-400"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  )
}
