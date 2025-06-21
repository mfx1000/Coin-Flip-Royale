import { Coin } from "../Coin";

export default function ResultsView({ state }: { state: any }) {
    return (
        <div className="w-full max-w-sm mx-auto text-center animate-fade-in">
            <div className="flex justify-between items-center bg-black bg-opacity-50 p-3 rounded-md mb-6">
                <span className="font-semibold">ROUND {state.currentRound} RESULTS</span>
                 <span className="font-mono text-2xl text-gray-400">{state.countdown}s</span>
            </div>

            <Coin isFlipping={false} result={state.lastFlipResult} />
            
            <div className="mt-8 bg-black bg-opacity-60 p-4 rounded-lg">
                <p className="text-3xl font-bold text-red-500">{state.eliminatedCount} players eliminated</p>
                <p className="text-xl text-green-400">{state.activePlayerCount} players advance</p>
            </div>
        </div>
    );
}