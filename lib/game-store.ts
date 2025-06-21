import { pusherServer } from './pusher';
import { issuePayouts, sendPushNotification } from './whop';

export interface Player {
  whopId: string;
  username: string;
  avatar: string;
  pick?: 'heads' | 'tails';
  receiptId: string;
}

type GamePhase = 'waiting' | 'picking' | 'flipping' | 'results' | 'finished';

interface GameState {
  id: string;
  phase: GamePhase;
  startTime: Date;
  players: Map<string, Player>;
  activePlayerIds: Set<string>;
  prizePool: number;
  currentRound: number;
  countdown: number;
  lastFlipResult?: 'heads' | 'tails';
  eliminatedCount: number;
}

let currentGame: GameState | null = null;

const ROUND_PICK_TIME = 10;
const ROUND_FLIP_TIME = 4;
const ROUND_RESULTS_TIME = 4;

const createNewGame = (): GameState => {
  const now = new Date();
  const nextHour = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours() + 1, 0, 0, 0);
  return {
    id: `game-${nextHour.getTime()}`,
    phase: 'waiting',
    startTime: nextHour,
    players: new Map(),
    activePlayerIds: new Set(),
    prizePool: 0,
    currentRound: 0,
    countdown: 0,
    eliminatedCount: 0,
  };
};

export const getGame = () => {
  if (!currentGame || new Date() > currentGame.startTime) {
    if (currentGame) {
        sendPushNotification({
            title: 'Coin Flip Royale Starting!',
            message: `A new game is starting now. Join in!`,
        }).catch(console.error);
    }
    currentGame = createNewGame();
  }
  return { ...currentGame, players: Array.from(currentGame.players.values()) };
};

export const addPlayer = (player: Player) => {
  if (currentGame && currentGame.phase === 'waiting') {
    currentGame.players.set(player.whopId, player);
    currentGame.activePlayerIds.add(player.whopId);
    currentGame.prizePool += 5.0;
    
    pusherServer.trigger(currentGame.id, 'player-joined', {
        player,
        playerCount: currentGame.players.size,
        prizePool: currentGame.prizePool,
    });
    return true;
  }
  return false;
};

export const makeChoice = (whopId: string, pick: 'heads' | 'tails') => {
    if (currentGame && currentGame.phase === 'picking' && currentGame.activePlayerIds.has(whopId)) {
        const player = currentGame.players.get(whopId);
        if (player) {
            player.pick = pick;
            return true;
        }
    }
    return false;
}

export const advanceGame = async () => {
    if (!currentGame) return;

    switch (currentGame.phase) {
        case 'waiting':
            if (new Date() >= currentGame.startTime) {
                if (currentGame.players.size < 2) {
                    console.log("Not enough players, resetting game.");
                    currentGame = createNewGame();
                    pusherServer.trigger(getGame().id, 'game-reset', {});
                } else {
                    currentGame.phase = 'picking';
                    currentGame.currentRound = 1;
                    currentGame.countdown = ROUND_PICK_TIME;
                    pusherServer.trigger(currentGame.id, 'round-started', {
                        round: currentGame.currentRound,
                        countdown: ROUND_PICK_TIME,
                        activePlayerCount: currentGame.activePlayerIds.size,
                    });
                }
            }
            break;

        case 'picking':
            currentGame.countdown--;
            if (currentGame.countdown <= 0) {
                // FIXED: Create a stable reference to currentGame to use within this block.
                const game = currentGame;
                game.phase = 'flipping';
                const flipResult = Math.random() < 0.5 ? 'heads' : 'tails';
                game.lastFlipResult = flipResult;
                
                const eliminated = new Set<string>();
                game.activePlayerIds.forEach(id => {
                    const player = game.players.get(id);
                    if (player?.pick !== flipResult) {
                        eliminated.add(id);
                    }
                });
                
                eliminated.forEach(id => game.activePlayerIds.delete(id));
                game.eliminatedCount = eliminated.size;

                pusherServer.trigger(game.id, 'round-flipping', {
                    result: flipResult,
                    countdown: ROUND_FLIP_TIME,
                });
                game.countdown = ROUND_FLIP_TIME;
            }
            break;
            
        case 'flipping':
            currentGame.countdown--;
            if (currentGame.countdown <= 0) {
                 if (currentGame.activePlayerIds.size <= 1) {
                    const winnerId = currentGame.activePlayerIds.values().next().value;
                    currentGame.phase = 'finished';
                    const winner = winnerId ? currentGame.players.get(winnerId) : null;
                    
                    if (winner) {
                        await issuePayouts(currentGame.id, winner.whopId, currentGame.prizePool);
                    }

                    if (!currentGame) return;

                    pusherServer.trigger(currentGame.id, 'game-over', { winner });
                    setTimeout(() => { currentGame = null; }, 10 * 60 * 1000); // Reset game after 10 minutes
                } else {
                    currentGame.phase = 'results';
                    pusherServer.trigger(currentGame.id, 'round-results', {
                        eliminatedCount: currentGame.eliminatedCount,
                        activePlayerCount: currentGame.activePlayerIds.size,
                        countdown: ROUND_RESULTS_TIME,
                    });
                    currentGame.countdown = ROUND_RESULTS_TIME;
                }
            }
            break;

        case 'results':
            currentGame.countdown--;
            if (currentGame.countdown <= 0) {
                currentGame.phase = 'picking';
                currentGame.currentRound++;
                currentGame.players.forEach(p => p.pick = undefined);
                currentGame.countdown = ROUND_PICK_TIME;
                pusherServer.trigger(currentGame.id, 'round-started', {
                    round: currentGame.currentRound,
                    countdown: ROUND_PICK_TIME,
                    activePlayerCount: currentGame.activePlayerIds.size,
                });
            }
            break;
    }
}
