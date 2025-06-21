"use client";

import { useState, useEffect } from "react"; // FIXED: Missing React imports
import { useIframeSdk } from "@whop/react";
import { getPusherClient } from "@/lib/pusher";
import { useCurrentUser } from "@/hooks/useCurrentUser"; // FIXED: This will now be found

import LobbyView from "./views/LobbyView";
import PickingView from "./views/PickingView";
import ResultsView from "./views/ResultsView";
import { EndView } from "./views/EndView";


// FIXED: Define the structure of the game state used on the client
type ClientGameState = {
    id: string;
    phase: 'waiting' | 'picking' | 'flipping' | 'results' | 'finished';
    startTime: string;
    players: any[];
    prizePool: number;
    currentRound?: number;
    countdown?: number;
    lastFlipResult?: 'heads' | 'tails';
    eliminatedCount?: number;
    activePlayerCount?: number;
    winner?: {
        whopId: string;
        username: string;
        avatar: string;
    } | null;
}

export default function GameClient() {
    const [gameState, setGameState] = useState<ClientGameState | null>(null);
    const [nextGameStartTime, setNextGameStartTime] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const { userId: currentWhopId } = useCurrentUser(); // Correctly use the new hook
    const iframeSdk = useIframeSdk();

    useEffect(() => {
        const fetchInitialState = async () => {
            try {
               //  const res = await fetch('/api/game/state');
					 const res = await fetch('/api/game-status');
                if (!res.ok) throw new Error("Could not connect to the game server.");
                const data = await res.json();
                setGameState(data);
            } catch (err: any) {
                setError(err.message);
            }
        };
        fetchInitialState();
    }, []);

    useEffect(() => {
        if (!gameState?.id) return;

        const pusherClient = getPusherClient();
        if (!pusherClient) return;

        const channel = pusherClient.subscribe(gameState.id);

        const handlePlayerJoined = (data: any) => {
            setGameState(prev => prev ? { ...prev, players: [...prev.players, data.player], prizePool: data.prizePool } : null);
        };
        const handleRoundStarted = (data: any) => {
            setGameState(prev => prev ? { ...prev, ...data, phase: 'picking' } : null);
        };
        const handleRoundFlipping = (data: any) => {
            setGameState(prev => prev ? { ...prev, lastFlipResult: data.result, phase: 'flipping', countdown: data.countdown } : null);
        };
        const handleRoundResults = (data: any) => {
            setGameState(prev => prev ? { ...prev, ...data, phase: 'results' } : null);
        };
        const handleGameOver = (data: any) => {
            const now = new Date();
            const nextHour = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours() + 1, 0, 0, 0);
            setNextGameStartTime(nextHour.toISOString());
            setGameState(prev => prev ? { ...prev, winner: data.winner, phase: 'finished' } : null);
        };

        // Bind all pusher events
        channel.bind('player-joined', handlePlayerJoined);
        channel.bind('round-started', handleRoundStarted);
        channel.bind('round-flipping', handleRoundFlipping);
        channel.bind('round-results', handleRoundResults);
        channel.bind('game-over', handleGameOver);

        return () => {
            if (gameState?.id) {
                pusherClient.unsubscribe(gameState.id);
            }
        };
    }, [gameState?.id]);
    
    if (error) {
        return <div className="text-center text-red-500 bg-red-500/10 p-4 rounded-lg">Error: {error}</div>;
    }

    if (!gameState) {
        return <div className="text-center text-gray-400">Loading Game...</div>;
    }

    const handleJoin = async () => {
        setError(null);
        try {
            const res = await fetch('/api/game/join', { method: 'POST' });
            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || 'Failed to join game.');
            }
            const session = await res.json();
            await iframeSdk.inAppPurchase(session);
        } catch (e: any) {
            setError(e.message);
        }
    };
    
    switch (gameState.phase) {
        case 'picking':
        case 'flipping':
            return <PickingView state={gameState} />;
        case 'results':
            return <ResultsView state={gameState} />;
        case 'finished':
            return <EndView state={gameState} currentWhopId={currentWhopId} nextGameStartTime={nextGameStartTime} />;
        case 'waiting':
        default:
            return <LobbyView state={gameState} onJoin={handleJoin} error={error} />;
    }
}

