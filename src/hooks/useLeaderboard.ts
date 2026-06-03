import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { LeaderboardEntry } from '../lib/scoring';

export function useLeaderboard(sessionId?: string | null) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchScores = useCallback(async () => {
    let query = supabase
      .from('scores')
      .select('*')
      .order('best_time_ms', { ascending: true })
      .order('false_starts', { ascending: true })
      .order('created_at', { ascending: true })
      .limit(20);

    if (sessionId) {
      query = query.eq('session_id', sessionId);
    }

    const { data } = await query;
    if (data) setEntries(data as LeaderboardEntry[]);
    setLoading(false);
  }, [sessionId]);

  useEffect(() => {
    fetchScores();

    const channel = supabase
      .channel('scores-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'scores' },
        () => fetchScores()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchScores]);

  return { entries, loading, refetch: fetchScores };
}
