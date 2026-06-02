import type { LeaderboardEntry } from '../lib/scoring';

type Props = {
  entries: LeaderboardEntry[];
  loading: boolean;
};

export function LeaderboardTable({ entries, loading }: Props) {
  if (loading) return <p className="leaderboard-loading">Loading…</p>;
  if (entries.length === 0) return <p className="leaderboard-empty">No scores yet. Be the first!</p>;

  return (
    <table className="leaderboard-table">
      <thead>
        <tr>
          <th>#</th>
          <th>Driver</th>
          <th>Best Time</th>
          <th>False Starts</th>
        </tr>
      </thead>
      <tbody>
        {entries.map((e, i) => (
          <tr key={e.id} className={i === 0 ? 'leaderboard-table__row--first' : ''}>
            <td>{i + 1}</td>
            <td>{e.player_name}</td>
            <td>{e.best_time_ms}ms</td>
            <td>{e.false_starts}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
