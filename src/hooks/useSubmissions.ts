import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase, type Submission } from '../lib/supabase';

export function useSubmissions() {
  const queryClient = useQueryClient();

  const query = useQuery<Submission[]>({
    queryKey: ['submissions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .order('uploaded_at', { ascending: false });

      if (error) {
        console.error('[NoteVault] Supabase query error:', error.message, error);
        throw error;
      }
      return (data ?? []) as Submission[];
    },
    staleTime: 30_000,
  });

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('submissions-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'submissions' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            queryClient.setQueryData<Submission[]>(['submissions'], (old = []) => [
              payload.new as Submission,
              ...old,
            ]);
          } else if (payload.eventType === 'DELETE') {
            queryClient.setQueryData<Submission[]>(['submissions'], (old = []) =>
              old.filter((s) => s.id !== payload.old.id)
            );
          } else if (payload.eventType === 'UPDATE') {
            queryClient.setQueryData<Submission[]>(['submissions'], (old = []) =>
              old.map((s) => (s.id === payload.new.id ? (payload.new as Submission) : s))
            );
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  return query;
}
