import React, { useState, useEffect, useRef } from 'react';
import { GameState } from '../types';
import { Hammer, Play, Clock, Skull } from 'lucide-react';

interface MoleSmashProps {
  gameState: GameState;
  addBalance: (amount: number) => void;
  removeBalance: (amount: number) => void;
}

export const MoleSmash: React.FC<MoleSmashProps> = ({ gameState, addBalance, removeBalance }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [moles, setMoles] = useState<boolean[]>(Array(9).fill(false)); // 3x3 Grid
  const [activeMoleIndex, setActiveMoleIndex] = useState<number | null>(null);
  
  const timerRef = useRef<any>(null);
  const moleTimerRef = useRef<any>(null);

  const ENTRY_FEE = 50;
  const HIT_REWARD = 5;

  const startGame = () => {
      if (gameState.balance < ENTRY_FEE) {
          alert("Not enough funds!");
          return;
      }
      removeBalance(ENTRY_FEE);
      setIsPlaying(true);
      setScore(0);
      setTimeLeft(30);
      
      // Start Game Loop
      timerRef.current = setInterval(() => {
          setTimeLeft(prev => {
              if (prev <= 1) {
                  endGame();
                  return 0;
              }
              return prev - 1;
          });
      }, 1000);

      moleCycle();
  };

  const moleCycle = () => {
      // Clear previous
      setActiveMoleIndex(null);
      
      const randomDelay = Math.random() * 500 + 400; // 400-900ms gap
      
      moleTimerRef.current = setTimeout(() => {
          const idx = Math.floor(Math.random() * 9);
          setActiveMoleIndex(idx);
          
          // Mole stays up for a bit
          const stayDuration = Math.random() * 600 + 400; // 400-1000ms up time
          setTimeout(() => {
              if (moleTimerRef.current) moleCycle(); // Next cycle
          }, stayDuration);
          
      }, randomDelay);
  };

  const hitMole = (index: number) => {
      if (!isPlaying || index !== activeMoleIndex) return;
      
      setActiveMoleIndex(null); // Hide mole immediately
      setScore(s => s + 1);
      addBalance(HIT_REWARD);
      
      // Clear current cycle timeout and trigger next one immediately for fast gameplay
      if (moleTimerRef.current) clearTimeout(moleTimerRef.current);
      moleCycle();
  };

  const endGame = () => {
      setIsPlaying(false);
      setActiveMoleIndex(null);
      if (timerRef.current) clearInterval(timerRef.current);
      if (moleTimerRef.current) clearTimeout(moleTimerRef.current);
  };

  // Cleanup on unmount
  useEffect(() => {
      return () => {
          if (timerRef.current) clearInterval(timerRef.current);
          if (moleTimerRef.current) clearTimeout(moleTimerRef.current);
      };
  }, []);

  return (
    <div className="flex flex-col items-center py-12">
        <h2 className="text-4xl font-black text-orange-500 mb-2">MOLE SMASH</h2>
        <div className="text-slate-400 text-sm mb-8 flex gap-4">
            <span>Entry: <b className="text-white">${ENTRY_FEE}</b></span>
            <span>Reward: <b className="text-green-400">${HIT_REWARD}/hit</b></span>
        </div>

        <div className="relative bg-slate-900 border-4 border-slate-800 rounded-3xl p-8 shadow-2xl">
            
            {/* Stats Bar */}
            <div className="flex justify-between mb-6 px-4">
                <div className="flex items-center gap-2 text-xl font-bold text-white">
                    <Clock size={24} className="text-blue-400" /> {timeLeft}s
                </div>
                <div className="flex items-center gap-2 text-xl font-bold text-white">
                    <Hammer size={24} className="text-orange-400" /> {score}
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-3 gap-4">
                {Array.from({ length: 9 }).map((_, i) => (
                    <button
                        key={i}
                        onClick={() => hitMole(i)}
                        disabled={!isPlaying}
                        className={`
                            w-24 h-24 rounded-full border-4 relative overflow-hidden transition-all active:scale-95
                            ${i === activeMoleIndex 
                                ? 'bg-orange-500 border-orange-600 cursor-pointer' 
                                : 'bg-slate-950 border-slate-800 cursor-default'}
                        `}
                    >
                        <div className="absolute inset-0 shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] rounded-full pointer-events-none"></div>
                        {i === activeMoleIndex && (
                            <div className="absolute inset-0 flex items-center justify-center animate-in zoom-in duration-100">
                                <Skull size={48} className="text-orange-900" />
                            </div>
                        )}
                    </button>
                ))}
            </div>

            {/* Overlay */}
            {!isPlaying && (
                <div className="absolute inset-0 bg-black/80 rounded-3xl flex flex-col items-center justify-center backdrop-blur-sm animate-in fade-in">
                    {score > 0 && (
                        <div className="mb-6 text-center">
                            <h3 className="text-2xl font-bold text-white mb-1">TIME'S UP!</h3>
                            <div className="text-green-400 font-mono font-bold text-xl">+${score * HIT_REWARD}</div>
                        </div>
                    )}
                    <button 
                        onClick={startGame}
                        className="px-8 py-4 bg-orange-600 hover:bg-orange-500 text-white font-black rounded-xl text-xl flex items-center gap-2 shadow-lg hover:scale-105 transition-transform"
                    >
                        <Play size={24} /> PLAY (${ENTRY_FEE})
                    </button>
                </div>
            )}
        </div>
    </div>
  );
};