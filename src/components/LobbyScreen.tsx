import { motion } from 'framer-motion';

type Props = {
  playerName: string;
  playerCount: number;
};

const rules = [
  { icon: '🔴', text: '5 red lights turn on one by one' },
  { icon: '⚡', text: 'When all lights go out — tap as fast as you can' },
  { icon: '🚫', text: 'Tap before lights go out = false start (attempt wasted)' },
  { icon: '🏁', text: '3 attempts — your best time goes on the leaderboard' },
];

export function LobbyScreen({ playerName, playerCount }: Props) {
  return (
    <div className="lobby-screen">
      <div className="lobby-lights">
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            className="light light--dim"
            animate={{ opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
          />
        ))}
      </div>

      <h2 className="lobby-screen__name">Ready, {playerName}</h2>

      <div className="lobby-rules">
        <p className="lobby-rules__heading">How it works</p>
        <ul className="lobby-rules__list">
          {rules.map((r, i) => (
            <li key={i} className="lobby-rules__item">
              <span className="lobby-rules__icon">{r.icon}</span>
              <span>{r.text}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="lobby-status">
        <motion.div
          className="lobby-status__dot"
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 1.2, repeat: Infinity }}
        />
        <span>Waiting for host to start…</span>
      </div>

      <p className="lobby-waiting__count">
        {playerCount} driver{playerCount !== 1 ? 's' : ''} in lobby
      </p>
    </div>
  );
}
