import { Button } from "@/components/ui/Button";
import Countdown, { CountdownRenderProps } from "react-countdown";

// Define the expected shape of the 'state' prop for type safety
interface LobbyViewState {
  players: any[];
  prizePool: number;
  startTime: string;
}

interface LobbyViewProps {
  state: LobbyViewState;
  onJoin: () => void;
  error: string | null;
}

export default function LobbyView({ state, onJoin, error }: LobbyViewProps) {
    return (
        <div className="bg-black bg-opacity-50 p-6 rounded-lg shadow-lg border border-yellow-500/20 w-full max-w-sm mx-auto text-center">
            <div className="flex justify-between items-center text-lg mb-4">
                <span>{state.players.length} entries</span>
                <span className="font-bold text-[#FBBF24]">${state.prizePool.toFixed(2)} prize</span>
            </div>

            <div className="mb-6">
                <p className="text-gray-400 text-sm uppercase tracking-widest">Next game starts in</p>
                <Countdown
                    date={state.startTime}
                    renderer={({ minutes, seconds }: CountdownRenderProps) => (
                        <div className="text-6xl font-mono font-bold text-white">
                            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                        </div>
                    )}
                />
            </div>

            <Button onClick={onJoin} className="w-full">Enter Game ($5.00)</Button>
            {error && <p className="text-red-500 mt-4 text-sm">{error}</p>}
        </div>
    );
}

// FIXED: Add an empty export at the end of the file.
// This explicitly tells the Next.js compiler that this file is a module,
// which resolves the stubborn Vercel build error.
export { LobbyView as GET };
