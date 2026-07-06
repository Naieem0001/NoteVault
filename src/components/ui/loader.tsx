export function Loader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-dark-bg dark:to-dark-surface">
      <div className="flex flex-col items-center gap-4">
        <div className="relative h-16 w-16">
          <div className="absolute inset-0 animate-spin rounded-full border-4 border-neutral-200 border-t-primary-500 dark:border-dark-border dark:border-t-primary-400"></div>
        </div>
        <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
          Loading NoteVault...
        </p>
      </div>
    </div>
  )
}
