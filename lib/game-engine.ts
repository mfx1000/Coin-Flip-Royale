import { advanceGame } from './game-store';

// A flag to ensure that we don't start the engine more than once.
let isEngineRunning = false;

/**
 * Starts the global game engine.
 * This function sets up a timer that calls the main game logic function (`advanceGame`)
 * every second. This is what drives the real-time progression of the game,
 * from the waiting lobby countdown to the round timers.
 */
export function startGameEngine() {
  if (isEngineRunning) {
    // If the engine is already running, do nothing.
    return;
  }

  isEngineRunning = true;
  console.log("Game Engine Started: Ticking every second.");

  // Set up an interval to call advanceGame every 1000 milliseconds (1 second).
  setInterval(advanceGame, 1000);
}

// --- Initialization ---
// To ensure the game engine starts when your server starts, we call the function
// right here at the module level. The first time any server-side code imports
// this file, the engine will be initialized automatically.
startGameEngine();

