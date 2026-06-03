import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { supabase } from '../lib/supabase';
import { useSession } from '../hooks/useSession';
import type { Session } from '../hooks/useSession';

const ADMIN_PASSCODE = import.meta.env.VITE_ADMIN_PASSCODE ?? 'lightsout';

export function HostPage() {
  const [passcode, setPasscode] = useState('');
  const [authed, setAuthed] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [creating, setCreating] = useState(false);

  const navigate = useNavigate();
  const { session: liveSession, players } = useSession(session?.id ?? null);
  const current = liveSession ?? session;

  // Redirect host to session leaderboard when session ends
  useEffect(() => {
    if (current?.status === 'complete') {
      navigate(`/leaderboard?session=${current.id}`);
    }
  }, [current?.status]);

  const playUrl = current
    ? `${window.location.origin}/play?session=${current.id}`
    : null;

  const handleAuth = () => {
    if (passcode === ADMIN_PASSCODE) setAuthed(true);
    else alert('Wrong passcode.');
  };

  const createSession = async () => {
    setCreating(true);
    const { data } = await supabase.from('sessions').insert({ status: 'lobby' }).select().single();
    if (data) setSession(data as Session);
    setCreating(false);
  };

  const startGame = async () => {
    if (!current) return;
    await supabase
      .from('sessions')
      .update({ status: 'active', started_at: new Date().toISOString() })
      .eq('id', current.id);
  };

  const endGame = async () => {
    if (!current) return;
    await supabase
      .from('sessions')
      .update({ status: 'complete', ended_at: new Date().toISOString() })
      .eq('id', current.id);
  };

  const clearLeaderboard = async () => {
    if (!current) return;
    await supabase.from('scores').delete().eq('session_id', current.id);
  };

  if (!authed) {
    return (
      <div className="player-form">
        <h1 className="title">Host</h1>
        <p className="subtitle">Enter passcode to continue.</p>
        <input
          className="name-input"
          type="password"
          placeholder="Passcode"
          value={passcode}
          onChange={(e) => setPasscode(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAuth()}
        />
        <button className="btn-primary" onClick={handleAuth}>Enter</button>
      </div>
    );
  }

  return (
    <div className="host-page">
      <h1 className="title">Game Master</h1>

      {!current && (
        <button className="btn-primary" disabled={creating} onClick={createSession}>
          {creating ? 'Creating…' : 'Create new session'}
        </button>
      )}

      {current && (
        <>
          <div className={`session-status session-status--${current.status}`}>
            {current.status.toUpperCase()}
          </div>

          <div className="host-players">
            <p className="host-players__count">{players.length} player{players.length !== 1 ? 's' : ''} in lobby</p>
            <ul className="host-players__list">
              {players.map((p) => (
                <li key={p.id}>{p.player_name}</li>
              ))}
            </ul>
          </div>

          {playUrl && (
            <div className="host-qr">
              <QRCodeSVG value={playUrl} size={180} bgColor="#0a0a0a" fgColor="#ffffff" />
              <p className="qr-panel__url">{playUrl}</p>
            </div>
          )}

          <div className="host-actions">
            {current.status === 'lobby' && (
              <button className="btn-primary" onClick={startGame}>
                Start game
              </button>
            )}
            {current.status === 'active' && (
              <button className="btn-primary" onClick={endGame}>
                End game
              </button>
            )}
            {current.status === 'complete' && (
              <>
                <p className="complete-screen__submitted">Session complete!</p>
                <button className="btn-secondary" onClick={clearLeaderboard}>
                  Clear scores
                </button>
                <button className="btn-secondary" onClick={() => setSession(null)}>
                  New session
                </button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
