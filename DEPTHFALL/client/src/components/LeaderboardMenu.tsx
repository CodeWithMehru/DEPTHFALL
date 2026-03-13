import React from 'react';
import { motion } from 'framer-motion';
import { useLeaderboard } from '../hooks/use-leaderboard';
import { Loader2, ArrowLeft } from 'lucide-react';

interface LeaderboardMenuProps {
  onBack: () => void;
}

export function LeaderboardMenu({ onBack }: LeaderboardMenuProps) {
  const { data: leaderboard, isLoading, isError } = useLeaderboard();

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="absolute inset-0 z-30 flex items-center justify-center bg-black/90 backdrop-blur-md p-6"
    >
      <div className="glass-panel rounded-2xl w-full max-w-2xl p-8 max-h-[80vh] flex flex-col relative overflow-hidden">
        
        <button 
          onClick={onBack}
          className="absolute top-6 left-6 text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" /> Back
        </button>

        <h2 className="text-4xl font-display font-bold text-center text-primary mb-8 text-glow">
          ABYSSAL RECORDS
        </h2>

        <div className="flex-1 overflow-y-auto pr-2">
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : isError ? (
            <div className="text-center text-destructive p-4 glass-panel rounded-lg border-destructive/50 text-glow-red">
              Failed to retrieve records from the deep.
            </div>
          ) : !leaderboard || leaderboard.length === 0 ? (
            <div className="text-center text-muted-foreground p-8 italic font-serif">
              No souls have braved the depths yet.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {leaderboard
                .sort((a, b) => b.depthReached - a.depthReached)
                .map((entry, idx) => (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  key={entry.id}
                  className="flex justify-between items-center p-4 rounded-xl bg-secondary/50 border border-white/5 hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <span className="font-display text-2xl text-primary/50 w-8 text-right">
                      {idx + 1}
                    </span>
                    <span className="font-bold text-lg">{entry.playerName}</span>
                  </div>
                  <span className="font-display text-primary text-xl font-bold">
                    {entry.depthReached} <span className="text-sm text-primary/50">m</span>
                  </span>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
