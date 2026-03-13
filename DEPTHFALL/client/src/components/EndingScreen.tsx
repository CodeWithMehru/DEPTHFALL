import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSubmitScore } from '../hooks/use-leaderboard';
import { Loader2 } from 'lucide-react';

interface EndingScreenProps {
  depth: number;
  onRestart: () => void;
}

export function EndingScreen({ depth, onRestart }: EndingScreenProps) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const { mutate: submitScore, isPending } = useSubmitScore();

  useEffect(() => {
    const timer1 = setTimeout(() => setStep(1), 3000);
    const timer2 = setTimeout(() => setStep(2), 8000);
    return () => { clearTimeout(timer1); clearTimeout(timer2); };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    submitScore(
      { playerName: name.trim(), depthReached: depth },
      { onSuccess: () => setSubmitted(true) }
    );
  };

  return (
    <div className="absolute inset-0 z-50 bg-black flex items-center justify-center overflow-hidden">
      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div
            key="step0"
            exit={{ opacity: 0 }}
            transition={{ duration: 2 }}
            className="w-full h-full bg-[#FFD700]/10"
          />
        )}
        
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2 }}
            className="text-center px-8"
          >
            <h1 className="text-4xl md:text-6xl font-serif text-[#FFD700] italic max-w-3xl leading-relaxed text-glow">
              "You found the lost gold!"
            </h1>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2 }}
            className="text-center px-8 max-w-md w-full"
          >
             <h2 className="text-[#FFD700] font-display font-bold text-3xl mb-4 text-glow tracking-widest">
               TREASURE SECURED
             </h2>
             <p className="text-muted-foreground mb-8">Depth Conquered: {depth}m</p>

             {!submitted ? (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={20}
                  placeholder="Sign the victor's log"
                  className="w-full bg-transparent border-b-2 border-[#FFD700]/50 px-4 py-3 text-center text-lg font-serif text-[#FFD700] focus:outline-none focus:border-[#FFD700] transition-all placeholder:text-muted-foreground/30"
                  required
                />
                <button
                  type="submit"
                  disabled={isPending || !name.trim()}
                  className="mt-4 text-[#FFD700] uppercase tracking-widest hover:text-white transition-colors disabled:opacity-50"
                >
                  {isPending ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "CLAIM REWARD"}
                </button>
              </form>
            ) : (
              <div className="py-4 text-[#FFD700] font-serif italic text-lg opacity-80">
                Your victory is recorded in the deep.
              </div>
            )}

            <button 
              onClick={onRestart}
              className="mt-16 text-xs text-[#FFD700] hover:text-white uppercase tracking-[0.3em] transition-all opacity-50 hover:opacity-100"
            >
              Return to Surface
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}