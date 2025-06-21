import { useState } from 'react';
import { Coin } from '../Coin';

export default function PickingView({ state }: { state: any }) {
    const [choice, setChoice] = useState<'heads' | 'tails' | null>(null);

    const handlePick = async (pick: 'heads' | 'tails') => {
        setChoice(pick);
        await fetch('/api/game/choice', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pick }),
        });
    };

    return (
        <div className="w-full max-w-sm mx-auto text-center">
             <div className="flex justify-between items-center bg-black bg-opacity-50 p-3 rounded-md mb-6">
                <span className="font-semibold">ROUND {state.currentRound}</span>
                <span className="font-mono text-2xl text-red-500">{state.countdown}s</span>
             </div>
            
            <Coin isFlipping={state.phase === 'flipping'} result={state.lastFlipResult} />

            <div className="mt-8">
                <p className="text-lg uppercase tracking-widest text-gray-300 mb-4">Pick Heads or Tails</p>
                <div className="flex gap-4">
                    <button
                        onClick={() => handlePick('heads')}
                        disabled={!!choice || state.phase !== 'picking'}
                        className={`w-full p-4 rounded-lg font-bold text-2xl transition-all ${choice === 'heads' ? 'bg-yellow-500 ring-4 ring-white' : 'bg-gray-700 hover:bg-gray-600'}`}
                    >
                        HEADS
                    </button>
                    <button
                        onClick={() => handlePick('tails')}
                        disabled={!!choice || state.phase !== 'picking'}
                        className={`w-full p-4 rounded-lg font-bold text-2xl transition-all ${choice === 'tails' ? 'bg-yellow-500 ring-4 ring-white' : 'bg-gray-700 hover:bg-gray-600'}`}
                    >
                        TAILS
                    </button>
                </div>
            </div>
        </div>
    );
}