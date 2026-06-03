import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Check your .env.local file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: { eventsPerSecond: 10 },
  },
});

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
  semester: string;
  file_type: string;
  file_size: number;
  storage_path: string;
  public_url: string;
  description?: string;
  tags?: string[];
}
