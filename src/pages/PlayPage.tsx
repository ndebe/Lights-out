import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { PlayerForm } from '../components/PlayerForm';
import { GameScreen } from '../components/GameScreen';
import { LobbyScreen } from '../components/LobbyScreen';
import { useReactionGame } from '../hooks/useReactionGame';
import { useSession } from '../hooks/useSession';
import { supabase } from '../lib/supabase';

export function PlayPage() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session');
  const navigate = useNavigate();

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

  // When session ends, redirect to session leaderboard
  useEffect(() => {
    if (session?.status === 'complete' && joinedLobby) {
      navigate(`/leaderboard?session=${sessionId}`);
    }
  }, [session?.status]);

  const handleJoin = async (name: string) => {
    setPlayerName(name);
    if (sessionId) {
      await supabase.from('lobby_players').insert({ session_id: sessionId, player_name: name });
      setJoinedLobby(true);
      if (session?.status === 'active') {
        game.startGame(name);
      }
    } else {
      game.startGame(name);
    }
  };

  // Lobby waiting screen
  if (sessionId && joinedLobby && session?.status === 'lobby' && game.gameState === 'idle') {
    return <LobbyScreen playerName={playerName} playerCount={players.length} />;
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
