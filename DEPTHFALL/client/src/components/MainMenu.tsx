import React from 'react';
import { motion } from 'framer-motion';

interface MainMenuProps {
  onStart: () => void;
  onLeaderboard: () => void;
}

export function MainMenu({ onStart, onLeaderboard }: MainMenuProps) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm"
    >
      <div className="text-center max-w-xl mx-auto px-6">
        <motion.h1 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="text-7xl font-bold mb-4 font-display text-glow"
        >
          DEPTHFALL
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="text-xl text-muted-foreground mb-12 font-serif italic"
        >
          Descend into the abyss. Manage your oxygen. Beware what lurks below.
        </motion.p>
        
        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 1.2 }}
          className="flex flex-col gap-4 w-64 mx-auto"
        >
          <button 
            onClick={onStart}
            className="w-full py-4 bg-primary/10 border border-primary text-primary font-display font-bold text-lg rounded-lg box-glow hover:bg-primary/30 hover:scale-105 transition-all duration-300"
          >
            INITIATE DIVE
          </button>
          <button 
            onClick={onLeaderboard}
            className="w-full py-4 bg-secondary border border-border text-foreground font-display font-bold text-lg rounded-lg hover:bg-secondary/80 hover:scale-105 transition-all duration-300"
          >
            TOP DIVERS
          </button>
        </motion.div>

        <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           transition={{ duration: 1, delay: 2 }}
           className="mt-16 text-sm text-muted-foreground"
        >
          <p>Controls: WASD or Arrow Keys</p>
        </motion.div>
      </div>
    </motion.div>
  );
}
