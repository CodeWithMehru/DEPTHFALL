import React, { useState, useCallback } from 'react';
import { GameCanvas } from '../components/GameCanvas';
import { MainMenu } from '../components/MainMenu';
import { GameOverMenu } from '../components/GameOverMenu';
import { LeaderboardMenu } from '../components/LeaderboardMenu';
import { EndingScreen } from '../components/EndingScreen';
import { AnimatePresence } from 'framer-motion';

type AppState = 'menu' | 'playing' | 'gameover' | 'leaderboard' | 'ending';

export default function Home() {
  const [appState, setAppState] = useState<AppState>('menu');
  
  // Game state lifted for UI overlay
  const [depth, setDepth] = useState(0);
  const [oxygen, setOxygen] = useState(100);
  const [deathReason, setDeathReason] = useState('');

  const handleUpdateUI = useCallback((state: { depth: number; oxygen: number }) => {
    setDepth(state.depth);
    setOxygen(state.oxygen);
  }, []);

  const handleGameOver = useCallback((finalDepth: number, reason: string) => {
    setDepth(finalDepth);
    setDeathReason(reason);
    setAppState('gameover');
  }, []);

  const handleEnding = useCallback((finalDepth: number) => {
    setDepth(finalDepth);
    setAppState('ending');
  }, []);

  return (
    <main className="relative w-full h-screen bg-black overflow-hidden select-none">
      {/* The Phaser canvas mounts here when 'playing' */}
      {appState === 'playing' && (
        <GameCanvas 
          onUpdateUI={handleUpdateUI}
          onGameOver={handleGameOver}
          onEnding={handleEnding}
        />
      )}

      {/* In-Game HUD overlay */}
      {appState === 'playing' && (
        <div className="absolute inset-0 pointer-events-none z-10 p-6 flex justify-between items-start">
          <div className="glass-panel p-4 rounded-xl flex flex-col gap-2 min-w-[200px]">
            <span className="text-xs uppercase tracking-widest text-primary/70 font-display">Oxygen Level</span>
            <div className="h-3 w-full bg-black/50 rounded-full overflow-hidden border border-white/10">
              <div 
                className="h-full transition-all duration-300 ease-out"
                style={{ 
                  width: `${oxygen}%`, 
                  backgroundColor: oxygen > 20 ? 'hsl(var(--primary))' : 'hsl(var(--accent))',
                  boxShadow: oxygen > 20 ? '0 0 10px hsl(var(--primary))' : '0 0 10px hsl(var(--accent))'
                }}
              />
            </div>
          </div>

          <div className="glass-panel p-4 rounded-xl flex flex-col items-end min-w-[150px]">
             <span className="text-xs uppercase tracking-widest text-primary/70 font-display">Depth</span>
             <span className="text-4xl font-display font-bold text-white text-glow">
                {depth} <span className="text-xl text-white/50">m</span>
             </span>
          </div>
        </div>
      )}

      {/* UI States Overlay */}
      <AnimatePresence>
        {appState === 'menu' && (
          <MainMenu 
            onStart={() => {
              setDepth(0);
              setOxygen(100);
              setAppState('playing');
            }} 
            onLeaderboard={() => setAppState('leaderboard')} 
          />
        )}
        
        {appState === 'leaderboard' && (
          <LeaderboardMenu onBack={() => setAppState('menu')} />
        )}

        {appState === 'gameover' && (
          <GameOverMenu 
            depth={depth} 
            reason={deathReason}
            onRestart={() => setAppState('menu')} 
          />
        )}

        {appState === 'ending' && (
          <EndingScreen 
            depth={depth} 
            onRestart={() => setAppState('menu')} 
          />
        )}
      </AnimatePresence>
    </main>
  );
}
