import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string) || '';
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables. The client will be unusable until configured.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: { eventsPerSecond: 10 },
  },
});

export async function getCurrentUserId(): Promise<string | null> {
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) return null;
    return (data?.user?.id as string) ?? null;
  } catch {
    return null;
  }
}

export type Database = {
  public: {
    Tables: {
      submissions: {
        Row: Submission;
        Insert: SubmissionInsert;
        Update: Partial<SubmissionInsert>;
      };
    };
  };
};

export interface Submission {
  id: string;
  file_name: string;
  display_name: string;
  subject: string;
  uploader_name: string;
  uploader_id?: string | null;
  semester: string;
  file_type: string;
  file_size: number;
  storage_path: string;
  public_url: string;
  description: string | null;
  tags: string[] | null;
  download_count: number;
  is_verified: boolean;
  uploaded_at: string;
}

export interface SubmissionInsert {
  file_name: string;
  display_name: string;
  subject: string;
  uploader_name: string;
  uploader_id?: string;
  semester: string;
  file_type: string;
  file_size: number;
  storage_path: string;
  public_url: string;
  description?: string;
  tags?: string[];
}
