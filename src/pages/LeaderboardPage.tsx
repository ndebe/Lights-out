import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { LeaderboardTable } from '../components/LeaderboardTable';
import { useLeaderboard } from '../hooks/useLeaderboard';
import { supabase } from '../lib/supabase';

const ADMIN_PASSCODE = import.meta.env.VITE_ADMIN_PASSCODE ?? 'lightsout';

export function LeaderboardPage() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session');
  const navigate = useNavigate();

  const { entries, loading } = useLeaderboard(sessionId);
  const [showAdmin, setShowAdmin] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [clearing, setClearing] = useState(false);

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

        {sessionId && (
          <button className="btn-primary leaderboard-restart" onClick={() => navigate('/host')}>
            Start new session
          </button>
        )}
      </div>

      <aside className="leaderboard-aside">
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
