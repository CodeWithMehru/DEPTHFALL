import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useSubmitScore } from '../hooks/use-leaderboard';
import { Loader2 } from 'lucide-react';

interface GameOverMenuProps {
  depth: number;
  reason: string;
  onRestart: () => void;
}

export function GameOverMenu({ depth, reason, onRestart }: GameOverMenuProps) {
  const [name, setName] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const { mutate: submitScore, isPending } = useSubmitScore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    submitScore(
      { playerName: name.trim(), depthReached: depth },
      { onSuccess: () => setSubmitted(true) }
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 z-30 flex items-center justify-center bg-black/95"
    >
      <div className="max-w-md w-full p-8 glass-panel rounded-2xl text-center border-accent/20 border">
        <h2 className="text-5xl font-display font-bold text-accent mb-2 text-glow-red">
          YOU DIED
        </h2>
        <p className="text-muted-foreground mb-8 uppercase tracking-widest font-bold">
          Cause: {reason}
        </p>

        <div className="mb-8 p-6 bg-secondary/50 rounded-xl border border-white/10">
          <p className="text-sm text-muted-foreground mb-1 uppercase tracking-wider">Depth Reached</p>
          <p className="text-6xl font-display font-bold text-white text-glow">
            {depth} <span className="text-2xl text-white/50">m</span>
          </p>
        </div>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={20}
              placeholder="Enter your name"
              className="w-full bg-black/50 border-2 border-border rounded-xl px-4 py-3 text-center text-lg font-bold focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/50"
              required
            />
            <button
              type="submit"
              disabled={isPending || !name.trim()}
              className="w-full py-4 bg-primary text-primary-foreground font-bold font-display rounded-xl shadow-[0_0_15px_rgba(0,255,255,0.4)] hover:shadow-[0_0_25px_rgba(0,255,255,0.6)] hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
            >
              {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "LOG RECORD"}
            </button>
          </form>
        ) : (
          <div className="py-4 text-primary font-bold text-lg">
            Record archived in the deep.
          </div>
        )}

        <button 
          onClick={onRestart}
          className="mt-6 text-muted-foreground hover:text-white underline-offset-4 hover:underline transition-all"
        >
          Return to surface
        </button>
      </div>
    </motion.div>
  );
}
