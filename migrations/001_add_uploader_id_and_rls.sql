-- Migration: add uploader_id and tighten RLS for submissions
BEGIN;

ALTER TABLE public.submissions
  ADD COLUMN IF NOT EXISTS uploader_id uuid;

-- Require authenticated inserts and ensure uploader_id matches auth.uid()
DROP POLICY IF EXISTS "Public insert access" ON public.submissions;
CREATE POLICY "Authenticated insert"
  ON public.submissions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL AND uploader_id = auth.uid());

-- Allow select for public (read-only)
DROP POLICY IF EXISTS "Public read access" ON public.submissions;
CREATE POLICY "Public read access"
  ON public.submissions
  FOR SELECT
  USING (true);

-- Allow users to update their own rows
DROP POLICY IF EXISTS "Public download count update" ON public.submissions;
CREATE POLICY "Owner update"
  ON public.submissions
  FOR UPDATE
  USING (uploader_id = auth.uid())
  WITH CHECK (uploader_id = auth.uid());

-- Admin delete: create admins table and policy
CREATE TABLE IF NOT EXISTS public.admins (user_id uuid PRIMARY KEY);
DROP POLICY IF EXISTS "Admin delete access" ON public.submissions;
CREATE POLICY "Admin delete"
  ON public.submissions
  FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.admins WHERE admins.user_id = auth.uid()));

COMMIT;

-- Note: Run this migration in Supabase SQL Editor or via a migration tool.