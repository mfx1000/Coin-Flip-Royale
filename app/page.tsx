import GameClient from "@/components/client/GameClient";

/**
 * This is the main homepage for the application.
 * It is rendered at the root URL ('/').
 * Its primary role is to render the main GameClient component,
 * which handles all the interactive game logic.
 */
export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <h1 className="text-6xl font-bold text-[#FBBF24] tracking-wider uppercase" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
          Coin Flip
        </h1>
        <h2 className="text-7xl font-black text-white -mt-4 mb-8" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
          ROYALE
        </h2>
        <GameClient />
      </div>
    </main>
  );
}
