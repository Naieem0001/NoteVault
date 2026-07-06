# Contributing to NoteVault

Thank you for your interest in contributing to NoteVault! This document provides guidelines and instructions.

## Development Setup

### Prerequisites
- Node.js 18+
- Git
- Supabase account (for testing)

### Installation

```bash
# Clone the repository
git clone https://github.com/Naieem0001/NoteVault.git
cd NoteVault

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Add your Supabase credentials to .env.local
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

## Available Scripts

### Development
```bash
npm run dev      # Start Vite dev server with HMR (http://localhost:5173)
npm run build    # Build for production
npm run preview  # Preview production build locally
```

### Code Quality
```bash
npm run format   # Format code with Prettier
npm run lint     # Run ESLint checks
npm run type-check  # TypeScript type checking
```

## Project Structure

```
NoteVault/
├── src/
│   ├── components/
│   │   ├── layout/        # TopBar, Sidebar
│   │   ├── notes/         # Editor, list, search
│   │   └── ui/            # Reusable components
│   ├── lib/
│   │   ├── supabase.ts    # Supabase client
│   │   ├── db.ts          # Dexie database
│   │   ├── sync.ts        # Sync manager
│   │   ├── service-worker.ts  # PWA setup
│   │   └── theme.ts       # Theme utilities
│   ├── pages/
│   │   ├── auth.tsx       # Auth page
│   │   └── dashboard.tsx  # Main app
│   ├── store/
│   │   ├── auth.ts        # Auth state
│   │   └── notes.ts       # Notes state
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── supabase/
│   └── migrations/        # Database migrations
├── public/
│   ├── manifest.json      # PWA manifest
│   └── icons/             # App icons
├── vite.config.ts
├── tailwind.config.js
└── README.md
```

## Code Style

### TypeScript
- Strict mode enabled
- Type all function parameters and returns
- Use interfaces for object types
- Avoid `any` type

### React Components
- Functional components only
- Use hooks (useState, useEffect, useContext)
- Component names must be PascalCase
- Props interface should end with `Props`

### Styling
- Use Tailwind CSS classes
- Support dark mode with `dark:` prefix
- Follow mobile-first approach
- Use semantic color tokens

### Git Commits
```
Format: <type>(<scope>): <subject>

Types: feat, fix, refactor, docs, style, test, chore
Scope: component, feature, or area affected
Subject: imperative, lowercase, no period

Examples:
feat(auth): add OAuth sign-in with Google
fix(notes): prevent duplicate syncs on mount
docs(README): update installation steps
```

## Making Changes

### Before Starting
1. Check existing issues and PRs
2. Create issue for new features
3. Discuss major changes first

### During Development
1. Create feature branch from `main`
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes following code style

3. Test thoroughly
   ```bash
   npm run build  # Verify build succeeds
   npm run lint   # Check code quality
   ```

4. Commit with clear messages
   ```bash
   git commit -m "feat(feature): description of change"
   ```

### Creating Pull Request
1. Push to your fork
   ```bash
   git push origin feature/your-feature-name
   ```

2. Create PR with:
   - Clear title and description
   - Reference related issues
   - Screenshots for UI changes
   - Testing steps

3. Address review feedback

## Testing

### Manual Testing
- Test on multiple browsers
- Test offline functionality (DevTools > Network > Offline)
- Test on mobile devices
- Test dark mode toggle
- Verify auth flows (email, Google, GitHub)

### Performance
```bash
npm run build
npm run preview
# Open DevTools > Lighthouse
# Run audit for Performance, Accessibility, Best Practices
```

## Database Changes

### Creating Migrations
1. Create new file in `supabase/migrations/`
   ```
   supabase/migrations/002_add_feature.sql
   ```

2. Write SQL with:
   - Clear comments
   - Proper indexing
   - RLS policies

3. Test locally:
   ```bash
   supabase db push
   ```

4. Document in migration file

## Reporting Issues

Include:
- Clear title and description
- Steps to reproduce
- Expected vs actual behavior
- Browser/device info
- Screenshots/videos if applicable

## Questions?

- Open a GitHub Discussion
- Check existing docs
- Review related code

## License

By contributing, you agree your work will be under MIT License.

Thank you for contributing to NoteVault!
