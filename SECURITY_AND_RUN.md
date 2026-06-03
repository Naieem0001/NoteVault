Quick run & security steps

1) Unblock npm (Windows EPERM): close editors, kill node, remove locked file, then run `npm ci`.

2) Start local signed-upload proxy (for private bucket testing)

Environment (example `.env.local`):
```
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_USE_SIGNED_UPLOAD=true
```

Install dependencies and start proxy:
```bash
npm ci
node server/signedUploadProxy.js
```

3) Run the app (in another terminal):
```bash
# from repo root
npm run dev
```

4) Run migrations (Supabase SQL Editor or CLI)
 - Open `migrations/001_add_uploader_id_and_rls.sql` and run in Supabase SQL Editor

5) Rotate leaked keys
 - In Supabase Dashboard → Settings → API: rotate anon and service_role keys
 - Update deployment secrets and `.env.local` (do NOT commit)

6) Purge `.env.local` from git history (if previously committed)
 - Use `git filter-repo` or BFG. Example with git-filter-repo (install first):
```bash
git filter-repo --invert-paths --path .env.local
git push --force
```

If you want, I can prepare a commit that updates `package.json` scripts to include a `server:start` script for the proxy (or convert to TypeScript). Tell me which you prefer.
