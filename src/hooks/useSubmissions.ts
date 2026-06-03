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
          try {
            if (payload.eventType === 'INSERT' && payload.new) {
              queryClient.setQueryData<Submission[]>(['submissions'], (old = []) => [
                payload.new as Submission,
                ...old,
              ]);
            } else if (payload.eventType === 'DELETE' && payload.old) {
              const oldRec = payload.old as unknown as { id?: string };
              if (oldRec.id) {
                queryClient.setQueryData<Submission[]>(['submissions'], (old = []) =>
                  old.filter((s) => s.id !== oldRec.id)
                );
              }
            } else if (payload.eventType === 'UPDATE' && payload.new) {
              const newRec = payload.new as unknown as { id?: string } & Partial<Submission>;
              if (newRec.id) {
                queryClient.setQueryData<Submission[]>(['submissions'], (old = []) =>
                  old.map((s) => (s.id === newRec.id ? (newRec as Submission) : s))
                );
              }
            }
          } catch (e) {
            console.error('[NoteVault] Realtime payload handling error', e);
          }
        }
      )
      .subscribe();

    return () => {
      try {
        // unsubscribe and remove channel if available
        // channel may be undefined if subscribe failed
        // ensure both methods are safe for cleanup
        if (typeof channel?.unsubscribe === 'function') channel.unsubscribe();
        // supabase.removeChannel exists in v2; call if available
        const maybeRemove = (supabase as unknown as { removeChannel?: (c: unknown) => void }).removeChannel;
        if (typeof maybeRemove === 'function') maybeRemove(channel);
      } catch (e) {
        console.warn('[NoteVault] Error removing realtime channel', e);
      }
    };
  }, [queryClient]);

  return query;
}
