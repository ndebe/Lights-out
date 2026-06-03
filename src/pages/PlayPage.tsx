import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PlayerForm } from '../components/PlayerForm';
import { GameScreen } from '../components/GameScreen';
import { useReactionGame } from '../hooks/useReactionGame';
import { useSession } from '../hooks/useSession';
import { supabase } from '../lib/supabase';

export function PlayPage() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session');

  const { session, players } = useSession(sessionId);
  const game = useReactionGame();
  const [playerName, setPlayerName] = useState('');
  const [joinedLobby, setJoinedLobby] = useState(false);

  // When session goes active, start the game automatically
  useEffect(() => {
    if (session?.status === 'active' && joinedLobby && game.gameState === 'idle') {
      game.startGame(playerName);
    }
  }, [session?.status]);

  const handleJoin = async (name: string) => {
    setPlayerName(name);
    if (sessionId) {
      await supabase.from('lobby_players').insert({ session_id: sessionId, player_name: name });
      setJoinedLobby(true);
      // If game already active (late joiner), start immediately
      if (session?.status === 'active') {
        game.startGame(name);
      }
    } else {
      // No session — solo mode, start immediately
      game.startGame(name);
    }
  };

  // Session mode: show lobby wait screen after joining
  if (sessionId && joinedLobby && session?.status === 'lobby' && game.gameState === 'idle') {
    return (
      <div className="player-form">
        <div className="lobby-waiting">
          <div className="lobby-lights">
            {[0,1,2,3,4].map(i => <div key={i} className="light light--dim" />)}
          </div>
          <h2 className="lobby-waiting__title">Ready, {playerName}</h2>
          <p className="lobby-waiting__sub">Waiting for the host to start…</p>
          <p className="lobby-waiting__count">{players.length} driver{players.length !== 1 ? 's' : ''} in lobby</p>
        </div>
      </div>
    );
  }

  if (game.gameState === 'idle') {
    return <PlayerForm onStart={handleJoin} />;
  }

  return (
    <GameScreen
      gameState={game.gameState}
      litCount={game.litCount}
      currentAttempt={game.currentAttempt}
      lastReactionMs={game.lastReactionMs}
      finalScore={game.finalScore}
      submitting={game.submitting}
      submitted={game.submitted}
      playerName={game.playerName}
      sessionId={sessionId}
      onInput={game.handleInput}
      onAdvance={game.advanceFromResult}
      onSubmitScore={game.submitScore}
      onReset={game.reset}
    />
  );
}
