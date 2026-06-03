import { useState, useCallback, useRef } from 'react';
import { supabase, type SubmissionInsert, getCurrentUserId } from '../lib/supabase';
import { validateFile, getFileType } from '../lib/validators';

export type UploadStatus = 'idle' | 'validating' | 'uploading' | 'inserting' | 'done' | 'error';

export interface UploadState {
  status: UploadStatus;
  progress: number;
  error: string | null;
}

export function useUpload() {
  const [state, setState] = useState<UploadState>({
    status: 'idle',
    progress: 0,
    error: null,
  });
  const abortRef = useRef<AbortController | null>(null);

  const reset = useCallback(() => {
    setState({ status: 'idle', progress: 0, error: null });
  }, []);

  const upload = useCallback(
    async (
      file: File,
      meta: {
        displayName: string;
        subject: string;
        uploaderName: string;
        semester: string;
        description?: string;
        tags?: string[];
      }
    ): Promise<boolean> => {
      // Validate
      setState({ status: 'validating', progress: 0, error: null });
      const validation = validateFile(file);
      if (!validation.valid) {
        setState({ status: 'error', progress: 0, error: validation.error! });
        return false;
      }

      try {
        abortRef.current = new AbortController();
        const fileType = getFileType(file.type);
        const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileType}`;
        const storagePath = `uploads/${uniqueName}`;

        // Upload to storage (supports optional signed-upload flow)
        setState({ status: 'uploading', progress: 10, error: null });

        const useSigned = (import.meta.env.VITE_USE_SIGNED_UPLOAD as string) === 'true';
        let publicUrlStr = '';

        if (useSigned) {
          // Expect a backend endpoint at `/api/signed-upload` that returns { uploadUrl, publicUrl }
          const resp = await fetch('/api/signed-upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ path: storagePath, contentType: file.type }),
          });
          if (!resp.ok) {
            const body = await resp.text();
            throw new Error(`Failed to get signed upload URL: ${body}`);
          }
          const json = await resp.json();
          if (!json.uploadUrl) throw new Error('Missing uploadUrl from signed-upload endpoint');

          // Upload the file to the signed URL
          const uploadResp = await fetch(json.uploadUrl, {
            method: 'PUT',
            headers: { 'Content-Type': file.type },
            body: file,
          });
          if (!uploadResp.ok) throw new Error('Signed upload failed');
          publicUrlStr = json.publicUrl;
        } else {
          const { error: storageError } = await supabase.storage
            .from('submissions')
            .upload(storagePath, file, {
              cacheControl: '3600',
              upsert: false,
            });

          if (storageError) throw storageError;
          setState((s) => ({ ...s, progress: 75 }));

          // Get public URL
          const { data: urlData } = supabase.storage
            .from('submissions')
            .getPublicUrl(storagePath);

          publicUrlStr = urlData.publicUrl;
        }

        setState({ status: 'inserting', progress: 85, error: null });

        // Insert metadata
        const uploaderId = await getCurrentUserId();

        const insert: SubmissionInsert = {
          file_name: file.name,
          display_name: meta.displayName,
          subject: meta.subject,
          uploader_name: meta.uploaderName,
          uploader_id: uploaderId ?? undefined,
          semester: meta.semester,
          file_type: fileType,
          file_size: file.size,
          storage_path: storagePath,
          public_url: publicUrlStr,
          description: meta.description,
          tags: meta.tags,
        };

        const { error: insertError } = await supabase.from('submissions').insert(insert);
        if (insertError) throw insertError;

        setState({ status: 'done', progress: 100, error: null });
        return true;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Upload failed. Please try again.';
        setState({ status: 'error', progress: 0, error: message });
        return false;
      }
    },
    []
  );

  return { state, upload, reset };
}
