Supabase security hardening and migration notes
=============================================

Follow these steps to secure your Supabase project and adapt the app for a modern, safe upload flow.

1) Rotate leaked keys
  - In Supabase Dashboard → Settings → API: rotate the anon key and service_role key.
  - Update your deployed environment variables with the new values and remove the old keys from any CI or repo.

2) Remove leaked keys from git history (if committed)
  - Add `.env.local` to `.gitignore` (done).
  - Use `git filter-repo` or BFG to purge `.env.local` from history, then force-push. Notify collaborators.

3) Make uploads secure
  Option A (recommended): Private storage + signed URLs
    - Make the `submissions` bucket **private** in the Storage settings.
    - Client obtains a signed upload URL from a server-side function (Supabase Edge Function or your backend) that uses the `service_role` key.
    - Upload files to the signed URL, then save metadata to `submissions` table with `uploader_id = auth.uid()`.

  Option B: If public bucket required
    - Keep public bucket but apply strict RLS and content scanning. Be aware of spam/abuse risk.

4) Database schema improvements
  - Add `uploader_id uuid` column to `public.submissions`.
  - Use `auth.uid()` everywhere to assert authorship.
  - Example SQL:

    ALTER TABLE public.submissions ADD COLUMN uploader_id uuid;

    -- Ensure inserts come from authenticated users and uploader_id matches auth.uid()
    CREATE POLICY "Authenticated insert"
      ON public.submissions
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() IS NOT NULL AND uploader_id = auth.uid());

    -- Allow users to update only their own rows (example for metadata updates)
    CREATE POLICY "Owner update"
      ON public.submissions
      FOR UPDATE
      USING (uploader_id = auth.uid())
      WITH CHECK (uploader_id = auth.uid());

    -- Admin deletes: create an `admins` table that lists admin user IDs, then:
    CREATE TABLE IF NOT EXISTS public.admins (user_id uuid PRIMARY KEY);

    CREATE POLICY "Admin delete"
      ON public.submissions
      FOR DELETE
      USING (EXISTS (SELECT 1 FROM public.admins WHERE admins.user_id = auth.uid()));

5) Realtime and replication
  - Ensure you enabled replication for `public.submissions` in Database → Replication.
  - Confirm `ALTER PUBLICATION supabase_realtime ADD TABLE public.submissions;` succeeded.

6) Storage policies
  - For private buckets, use the following pattern for signed access via server-side code.
  - If keeping public, restrict `storage.objects` policies to the `submissions` bucket and consider rate-limiting uploads.

7) Monitoring and alerts
  - Enable project logs and set up alerting for unusual upload volumes or large numbers of 4xx/5xx errors.

8) Client changes required (already applied in codebase)
  - Include `uploader_id` when inserting metadata (set to `auth.uid()` from client or server function).
  - If switching to signed uploads, change upload flow to obtain signed URL from server and then upload directly to storage.

9) Testing checklist
  - Run `curl` REST test with new anon key to confirm read access.
  - Upload a test file via the new flow and verify `uploader_id` is set and RLS allows/denies actions correctly.

If you want, I can produce the exact Edge Function code to generate signed URLs or prepare an SQL migration script for your DB.
The repository now includes:
- `migrations/001_add_uploader_id_and_rls.sql` — migration to add `uploader_id` and tighten RLS.
- `supabase/functions/get_signed_upload/index.ts` — Edge Function scaffold to create signed upload URLs (server-side, uses `SUPABASE_SERVICE_ROLE_KEY`).

Deployment notes for the Edge Function:
 - Set the `SUPABASE_SERVICE_ROLE_KEY` and `SUPABASE_URL` as environment vars for the function (do NOT expose service role key to clients).
 - Deploy via `supabase` CLI: `supabase functions deploy get_signed_upload --project-ref your-ref`.
 - The client calls a backend route (e.g., `/api/signed-upload`) which proxies to the Edge Function or call the function directly from the browser with the proper endpoint.

Example client flow (already implemented with fallback in `useUpload`):
 1. Client POSTs `{ path, contentType }` to `/api/signed-upload`.
 2. Server returns `{ uploadUrl, publicUrl }`.
 3. Client uploads the file with `PUT uploadUrl`.
 4. Client inserts metadata row referencing `publicUrl` and `uploader_id`.
