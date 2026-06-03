import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { LeaderboardTable } from '../components/LeaderboardTable';
import { QRCodePanel } from '../components/QRCodePanel';
import { useLeaderboard } from '../hooks/useLeaderboard';
import { supabase } from '../lib/supabase';

const ADMIN_PASSCODE = import.meta.env.VITE_ADMIN_PASSCODE ?? 'lightsout';

export function LeaderboardPage() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session');

  const { entries, loading } = useLeaderboard(sessionId);
  const [showAdmin, setShowAdmin] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [clearing, setClearing] = useState(false);

  const playUrl = sessionId
    ? `${window.location.origin}/play?session=${sessionId}`
    : `${window.location.origin}/play`;

  const handleClear = async () => {
    if (passcode !== ADMIN_PASSCODE) {
      alert('Wrong passcode.');
      return;
    }
    setClearing(true);
    if (sessionId) {
      await supabase.from('scores').delete().eq('session_id', sessionId);
    } else {
      await supabase.from('scores').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    }
    setClearing(false);
    setShowAdmin(false);
    setPasscode('');
  };

  return (
    <div className="leaderboard-page">
      <div className="leaderboard-main">
        <h1 className="leaderboard-title">
          {sessionId ? 'Session Results' : 'Lights Out Leaderboard'}
        </h1>
        <LeaderboardTable entries={entries} loading={loading} />
      </div>

      <aside className="leaderboard-aside">
        <QRCodePanel url={playUrl} />
        <button className="btn-ghost admin-toggle" onClick={() => setShowAdmin((v) => !v)}>
          Admin
        </button>
        {showAdmin && (
          <div className="admin-panel">
            <input
              type="password"
              placeholder="Passcode"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
            />
            <button className="btn-danger" disabled={clearing} onClick={handleClear}>
              {clearing ? 'Clearing…' : 'Clear leaderboard'}
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}
