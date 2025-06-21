import React from 'react';
import Image from 'next/image';
import Countdown from 'react-countdown';

// Define the expected structure for the game state and winner object
interface EndViewState {
  prizePool: number;
  winner?: {
    whopId: string;
    username: string;
    avatar: string;
  } | null;
}

interface EndViewProps {
  state: EndViewState;
  currentWhopId: string | null; // The Whop ID of the person viewing the screen
  nextGameStartTime: string; // The start time for the next game's countdown
}

/**
 * Renders the game over screen, showing the winner or an elimination message.
 */
export const EndView: React.FC<EndViewProps> = ({ state, currentWhopId, nextGameStartTime }) => {
  // Determine if the currently logged-in user is the winner
  const isWinner = state.winner && state.winner.whopId === currentWhopId;

  // Calculate the winner's prize (70% of the total pool)
  const prizeWon = (state.prizePool * 0.70).toFixed(2);

  if (!state.winner) {
    return (
      <div className="w-full max-w-md mx-auto text-center p-6 bg-black bg-opacity-50 rounded-lg shadow-lg border border-gray-700 animate-fade-in">
        <h2 className="text-3xl font-bold text-gray-400">Game Over</h2>
        <p className="text-lg text-gray-500 mt-2">No winner was decided in this round.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto text-center p-8 bg-black bg-opacity-50 rounded-lg shadow-lg border border-yellow-500/30 animate-fade-in">
      {isWinner ? (
        // UI for the person who won
        <>
          <h1 className="text-5xl font-black text-yellow-400 uppercase tracking-wider" style={{ textShadow: '0 0 15px rgba(250, 204, 21, 0.5)' }}>
            YOU WON!
          </h1>
          <p className="text-2xl font-bold text-white mt-2">${prizeWon} Prize</p>
        </>
      ) : (
        // UI for spectators
        <>
          <h1 className="text-4xl font-bold text-white uppercase tracking-wider">
            Winner
          </h1>
          <p className="text-xl font-light text-gray-400">A new champion is crowned!</p>
        </>
      )}

      {/* Winner's Profile Section */}
      <div className="my-6 flex flex-col items-center">
        <Image
          src={state.winner.avatar}
          alt={state.winner.username}
          width={128}
          height={128}
          className={`rounded-full border-4 ${isWinner ? 'border-yellow-400' : 'border-gray-600'} shadow-2xl`}
        />
        <p className="mt-4 text-3xl font-bold text-white">
          @{state.winner.username}
        </p>
      </div>

      {/* Countdown to Next Game */}
      <div className="mt-8 pt-6 border-t border-gray-700">
        <p className="text-gray-400 text-sm uppercase tracking-widest">Next game starts in</p>
        <Countdown
            date={nextGameStartTime}
            renderer={({ minutes, seconds }) => (
                <div className="text-4xl font-mono font-bold text-white mt-1">
                    {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                </div>
            )}
        />
      </div>
    </div>
  );
};