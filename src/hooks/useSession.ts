import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export type SessionStatus = 'lobby' | 'active' | 'complete';

export type Session = {
  id: string;
  status: SessionStatus;
  created_at: string;
  started_at: string | null;
  ended_at: string | null;
};

export type LobbyPlayer = {
  id: string;
  session_id: string;
  player_name: string;
  joined_at: string;
};

export function useSession(sessionId: string | null) {
  const [session, setSession] = useState<Session | null>(null);
  const [players, setPlayers] = useState<LobbyPlayer[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSession = useCallback(async () => {
    if (!sessionId) return;
    const { data } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', sessionId)
      .single();
    if (data) setSession(data as Session);
    setLoading(false);
  }, [sessionId]);

  const fetchPlayers = useCallback(async () => {
    if (!sessionId) return;
    const { data } = await supabase
      .from('lobby_players')
      .select('*')
      .eq('session_id', sessionId)
      .order('joined_at', { ascending: true });
    if (data) setPlayers(data as LobbyPlayer[]);
  }, [sessionId]);

  useEffect(() => {
    if (!sessionId) return;
    fetchSession();
    fetchPlayers();

    const channel = supabase
      .channel(`session-${sessionId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sessions', filter: `id=eq.${sessionId}` }, () => fetchSession())
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'lobby_players', filter: `session_id=eq.${sessionId}` }, () => fetchPlayers())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [sessionId, fetchSession, fetchPlayers]);

  return { session, players, loading };
}
