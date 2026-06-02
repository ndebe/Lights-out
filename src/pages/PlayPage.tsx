import { PlayerForm } from '../components/PlayerForm';
import { GameScreen } from '../components/GameScreen';
import { useReactionGame } from '../hooks/useReactionGame';

export function PlayPage() {
  const game = useReactionGame();

  if (game.gameState === 'idle') {
    return <PlayerForm onStart={game.startGame} />;
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
      onInput={game.handleInput}
      onAdvance={game.advanceFromResult}
      onSubmitScore={game.submitScore}
      onReset={game.reset}
    />
  );
}
