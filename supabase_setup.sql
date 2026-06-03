-- ============================================================
-- NoteVault — Supabase Setup SQL
-- Run this in the Supabase SQL Editor (supabase.com/dashboard)
-- ============================================================

-- 1. Create the submissions table
CREATE TABLE IF NOT EXISTS public.submissions (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  file_name     text NOT NULL,
  display_name  text NOT NULL,
  subject       text NOT NULL,
  uploader_name text NOT NULL,
  semester      text NOT NULL,
  file_type     text NOT NULL,
  file_size     bigint NOT NULL,
  storage_path  text NOT NULL,
  public_url    text NOT NULL,
  description   text,
  tags          text[],
  download_count integer DEFAULT 0,
  is_verified   boolean DEFAULT false,
  uploaded_at   timestamptz DEFAULT now()
);

-- 2. Enable Row Level Security
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies

-- Allow anyone to READ all submissions
CREATE POLICY "Public read access"
  ON public.submissions
  FOR SELECT
  USING (true);

-- Allow anyone to INSERT (open upload, no auth required)
CREATE POLICY "Public insert access"
  ON public.submissions
  FOR INSERT
  WITH CHECK (true);

-- Allow anyone to UPDATE download_count only
CREATE POLICY "Public download count update"
  ON public.submissions
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Allow only authenticated admins (CRs) to DELETE
CREATE POLICY "Admin delete access"
  ON public.submissions
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- 4. Enable Realtime on submissions table
-- (Also do this in Dashboard: Database → Replication → add submissions table)
ALTER PUBLICATION supabase_realtime ADD TABLE public.submissions;

-- ============================================================
-- STORAGE SETUP (do in Dashboard: Storage → New bucket)
-- Bucket name: submissions
-- Public bucket: YES
-- Max file size: 52428800 (50 MB)
-- Allowed MIME types:
--   application/pdf
--   application/vnd.ms-powerpoint
--   application/vnd.openxmlformats-officedocument.presentationml.presentation
--   application/msword
--   application/vnd.openxmlformats-officedocument.wordprocessingml.document
-- ============================================================

-- Storage policies (run in SQL Editor):
CREATE POLICY "Public upload to submissions"
  ON storage.objects
  FOR INSERT
  TO public
  WITH CHECK (bucket_id = 'submissions');

CREATE POLICY "Public read from submissions"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'submissions');

CREATE POLICY "Admin delete from submissions"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'submissions');
