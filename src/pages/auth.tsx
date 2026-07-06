import { useState } from 'react'
import { useAuthStore } from '@/store/auth'
import { Mail, GitBranch, Loader2 } from 'lucide-react'

type AuthMode = 'signin' | 'signup'

export function AuthPages() {
  const [mode, setMode] = useState<AuthMode>('signin')
  const { signIn, signUp, signInWithGoogle, signInWithGitHub, loading, error, clearError } = useAuthStore()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()

    try {
      if (mode === 'signin') {
        await signIn(email, password)
      } else {
        await signUp(email, password, fullName)
      }
    } catch (err) {
      console.error('[Auth] Error:', err)
    }
  }

  const handleSocialSignIn = async (provider: 'google' | 'github') => {
    clearError()
    try {
      if (provider === 'google') {
        await signInWithGoogle()
      } else {
        await signInWithGitHub()
      }
    } catch (err) {
      console.error('[Auth] Social sign in error:', err)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-neutral-50 via-blue-50 to-neutral-100 dark:from-dark-bg dark:via-dark-surface dark:to-dark-card">
      <div className="w-full max-w-md px-6">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 flex items-center justify-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary">
              <span className="text-lg font-bold text-white">📝</span>
            </div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">NoteVault</h1>
          </div>
          <p className="text-neutral-600 dark:text-neutral-400">
            Your secure, offline-first note-taking app
          </p>
        </div>

        {/* Form Card */}
        <div className="card p-6 sm:p-8">
          {/* Error Message */}
          {error && (
            <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Full Name
                </label>
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  required
                  className="input"
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="input"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="input"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === 'signin' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 border-t border-neutral-200 dark:border-dark-border"></div>
            <span className="text-xs text-neutral-500 dark:text-neutral-400">or continue with</span>
            <div className="flex-1 border-t border-neutral-200 dark:border-dark-border"></div>
          </div>

          {/* Social Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleSocialSignIn('google')}
              disabled={loading}
              className="btn-secondary gap-2"
            >
              <Mail className="h-4 w-4" />
              <span className="hidden sm:inline">Google</span>
            </button>
            <button
              onClick={() => handleSocialSignIn('github')}
              disabled={loading}
              className="btn-secondary gap-2"
            >
              <GitBranch className="h-4 w-4" />
              <span className="hidden sm:inline">GitHub</span>
            </button>
          </div>

          {/* Mode Toggle */}
          <p className="mt-6 text-center text-sm text-neutral-600 dark:text-neutral-400">
            {mode === 'signin' ? (
              <>
                Don&apos;t have an account?{' '}
                <button
                  onClick={() => {
                    setMode('signup')
                    clearError()
                  }}
                  className="font-semibold text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  onClick={() => {
                    setMode('signin')
                    clearError()
                  }}
                  className="font-semibold text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
                >
                  Sign in
                </button>
              </>
            )}
          </p>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-neutral-500 dark:text-neutral-500">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  )
}
