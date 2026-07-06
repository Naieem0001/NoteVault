# NoteVault Deployment Guide

Complete guide for deploying NoteVault to production.

## Prerequisites

- GitHub account with NoteVault repository
- Vercel account (free tier available)
- Supabase account with PostgreSQL database
- Domain name (optional)

## Database Setup (Supabase)

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Set strong database password
4. Wait for project initialization

### 2. Apply Database Schema

```bash
# Install Supabase CLI
npm install -g supabase

# Create migrations directory
supabase init

# Apply migrations
supabase db push

# Or manually run SQL in Supabase dashboard:
# Copy contents of supabase/migrations/001_create_tables.sql
```

### 3. Configure Supabase Auth

1. Go to Authentication > Providers
2. Enable OAuth providers:
   - **Google**: Add OAuth credentials from Google Console
   - **GitHub**: Add OAuth credentials from GitHub Settings

3. Set redirect URLs:
   - Development: `http://localhost:5173/auth/callback`
   - Production: `https://yourdomain.com/auth/callback`

### 4. Get API Keys

1. Go to Settings > API
2. Copy:
   - Project URL → `VITE_SUPABASE_URL`
   - Anon Key → `VITE_SUPABASE_ANON_KEY`

## Deployment to Vercel

### 1. Connect GitHub

```bash
# Push code to GitHub
git push origin main
```

### 2. Create Vercel Project

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Select `NoteVault` project

### 3. Configure Environment Variables

In Vercel dashboard:

1. Go to Settings > Environment Variables
2. Add:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```
3. Make sure to add to all environments (Production, Preview, Development)

### 4. Deploy

1. Click "Deploy"
2. Wait for build to complete
3. Visit production URL

### 5. Configure Custom Domain (Optional)

1. Go to Settings > Domains
2. Add your domain
3. Update DNS records at your registrar
4. Wait for DNS propagation

## Post-Deployment

### 1. Update Auth Redirect URLs

Update Supabase redirect URLs to your production domain:

1. Go to Supabase dashboard
2. Authentication > URL Configuration
3. Add production URL to redirect URLs

### 2. Verify PWA

1. Visit your production URL
2. Check DevTools > Application > Manifest
3. Verify Service Worker is registered
4. Test install prompt on desktop/mobile

### 3. Monitor Performance

```bash
# Generate performance report
npm run build

# Analyze bundle size
npm run analyze
```

Check Core Web Vitals:
- LCP < 2.5s (good)
- INP < 200ms (good)
- CLS < 0.1 (good)

## Database Backups

### Automatic Backups (Supabase)

- Free: 7-day backups
- Pro: 30-day backups
- Business: Custom retention

Manual backup:
```bash
pg_dump postgresql://user:password@host/database > backup.sql
```

## Security Checklist

- [ ] Environment variables set in Vercel
- [ ] Database password is strong (20+ chars)
- [ ] RLS policies enabled on all tables
- [ ] Auth redirect URLs configured
- [ ] Domain uses HTTPS (Vercel auto)
- [ ] CORS configured if needed
- [ ] Rate limiting enabled on API

## Monitoring & Logging

### Vercel Analytics

1. Dashboard > Analytics
2. Monitor:
   - Web Vitals
   - Requests
   - Edge function usage

### Supabase Monitoring

1. Dashboard > Logs
2. Check:
   - Database logs
   - Auth logs
   - API usage

## Scaling Considerations

- **Database**: Upgrade plan if approaching limits
- **Storage**: Use Vercel Blob for file uploads
- **Edge Functions**: Consider for compute-heavy tasks
- **CDN**: Enabled by default on Vercel

## Troubleshooting

### Build fails
- Check environment variables are set
- Verify TypeScript compiles: `npm run type-check`
- Check build log for errors

### Auth not working
- Verify redirect URLs match
- Check OAuth credentials valid
- Ensure RLS policies allow auth

### Service Worker not registering
- Check DevTools > Application > Service Workers
- Verify sw.js is deployed
- Check network tab for 404 errors

### Sync not working
- Check browser console for errors
- Verify Supabase credentials
- Check database connectivity
- Verify RLS policies

## Rolling Back

### Revert to Previous Deployment

1. Vercel Dashboard > Deployments
2. Find previous working deployment
3. Click ⋮ > Promote to Production

### Database Rollback

```bash
# Restore from backup
psql postgresql://user:password@host/database < backup.sql
```

## Maintenance

### Regular Tasks

- Monitor database usage monthly
- Review auth logs weekly
- Check performance metrics
- Update dependencies quarterly

### Uptime Monitoring

Use services like:
- Uptime Robot
- Statuspage.io
- PagerDuty

## Support

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **NoteVault Issues**: GitHub Issues

## Cost Estimation

### Monthly Costs

| Service | Free Tier | Pro Tier |
|---------|-----------|----------|
| Vercel | $0 | $20 |
| Supabase | $0 | $25 |
| Domain | - | $12/year |
| **Total** | **$0** | **~$50** |

All services offer generous free tiers suitable for most users.
