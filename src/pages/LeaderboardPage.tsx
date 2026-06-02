import { useState } from 'react';
import { LeaderboardTable } from '../components/LeaderboardTable';
import { QRCodePanel } from '../components/QRCodePanel';
import { useLeaderboard } from '../hooks/useLeaderboard';
import { supabase } from '../lib/supabase';

const ADMIN_PASSCODE = import.meta.env.VITE_ADMIN_PASSCODE ?? 'lightsout';
const PLAY_URL = `${window.location.origin}/play`;

export function LeaderboardPage() {
  const { entries, loading } = useLeaderboard();
  const [showAdmin, setShowAdmin] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [clearing, setClearing] = useState(false);

  const handleClear = async () => {
    if (passcode !== ADMIN_PASSCODE) {
      alert('Wrong passcode.');
      return;
    }
    setClearing(true);
    await supabase.from('scores').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    setClearing(false);
    setShowAdmin(false);
    setPasscode('');
  };

  return (
    <div className="leaderboard-page">
      <div className="leaderboard-main">
        <h1 className="leaderboard-title">Lights Out Leaderboard</h1>
        <LeaderboardTable entries={entries} loading={loading} />
      </div>

      <aside className="leaderboard-aside">
        <QRCodePanel url={PLAY_URL} />
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
