# NoteVault - Offline-First Note Taking App

A beautiful, fast, and secure offline-first note-taking application. NoteVault works seamlessly whether you're online or offline, with automatic sync when connectivity is restored.

## Features

- **Offline-First**: Full functionality without internet using IndexedDB
- **Real-Time Sync**: Automatic sync with Supabase when online
- **Rich Text Editor**: Markdown support with formatting toolbar
- **Dark Mode**: Beautiful theme with persistent preference
- **PWA**: Install as native app on desktop and mobile
- **Authentication**: Email/password + OAuth (Google, GitHub)
- **Secure**: Row-level security with Supabase
- **Fast**: <2s load time with Vite optimization
- **Responsive**: Mobile-first design

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS v4
- **Database**: Supabase PostgreSQL
- **Auth**: Supabase Auth + OAuth
- **Offline**: Dexie.js (IndexedDB)
- **State**: Zustand
- **Animations**: Framer Motion
- **PWA**: Workbox + vite-plugin-pwa

## Quick Start

### Prerequisites
- Node.js 18+
- npm/yarn/pnpm

### Installation

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env.local

# Add your Supabase credentials:
# VITE_SUPABASE_URL=your_url
# VITE_SUPABASE_ANON_KEY=your_key
```

### Development

```bash
npm run dev     # Start dev server
npm run build   # Build for production
npm run preview # Preview build
```

## Database Setup

Apply Supabase migrations to create tables and RLS policies:

```bash
cd supabase
supabase db push
```

This creates:
- `profiles` - User data
- `folders` - Note organization
- `notes` - Note content
- `note_shares` - Sharing permissions

## Architecture

### Offline-First Sync

1. Local changes save immediately to IndexedDB
2. Failed operations queue automatically
3. Sync processes automatically when online
4. Conflict resolution uses timestamps

### File Structure

```
src/
├── components/
│   ├── layout/       # Layout components
│   ├── notes/        # Note components
│   └── ui/           # Reusable UI
├── lib/              # Utilities
├── pages/            # Page components
├── store/            # Zustand stores
└── main.tsx
```

## Deployment

### Vercel (Recommended)

```bash
npm install -g vercel
vercel
```

Set environment variables in Vercel dashboard.

## Performance

- Bundle: ~250KB gzipped
- First Load: <2s
- LCP: <2.5s
- INP: <200ms

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- iOS 14+ / Android 9+

## License

MIT License
