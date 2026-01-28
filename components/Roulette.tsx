import React, { useState, useRef, useEffect } from 'react';
import { GameState } from '../types';
import * as Icons from 'lucide-react';

interface RouletteProps {
  gameState: GameState;
  onWin: (amount: number) => void;
  removeBalance: (amount: number) => void;
}

// Configuration
const NUMBERS = [
    { num: 1, color: 'red' }, { num: 14, color: 'black' }, { num: 2, color: 'red' }, { num: 13, color: 'black' },
    { num: 3, color: 'red' }, { num: 12, color: 'black' }, { num: 4, color: 'red' }, { num: 0, color: 'green' },
    { num: 11, color: 'black' }, { num: 5, color: 'red' }, { num: 10, color: 'black' }, { num: 6, color: 'red' },
    { num: 9, color: 'black' }, { num: 7, color: 'red' }, { num: 8, color: 'black' }
];
// Repeat pattern for infinite feel
const TAPE = [...NUMBERS, ...NUMBERS, ...NUMBERS, ...NUMBERS, ...NUMBERS, ...NUMBERS]; 
const CARD_WIDTH = 80;

export const Roulette: React.FC<RouletteProps> = ({ gameState, onWin, removeBalance }) => {
  const [betAmount, setBetAmount] = useState(100);
  const [betColor, setBetColor] = useState<'red' | 'black' | 'green' | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [lastWin, setLastWin] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const spin = (color: 'red' | 'black' | 'green') => {
      if (gameState.balance < betAmount || isSpinning) return;
      
      setBetColor(color);
      setIsSpinning(true);
      removeBalance(betAmount);
      setLastWin(null);

      // Determine Outcome
      const rand = Math.random();
      let winningIndex;
      // Weights: Green is rare (1/15), others roughly equal
      // Visual TAPE has 90 items (15 * 6). We want to land somewhere in the middle (set 3 or 4)
      const offset = NUMBERS.length * 3; 
      
      // Simple RNG for outcome
      // 0-14. 0 is Green. 1-7 Red. 8-14 Black. (Based on NUMBERS array layout)
      const winningNumObj = NUMBERS[Math.floor(Math.random() * NUMBERS.length)];
      
      // Find a specific index in the tape that matches this number, preferably in the middle section
      // Tape has 6 sets. Let's aim for set 4 (index 3, 0-based)
      const baseIndex = (NUMBERS.length * 3) + NUMBERS.findIndex(n => n.num === winningNumObj.num);
      
      // Random jitter within the card
      const jitter = Math.floor(Math.random() * (CARD_WIDTH - 10)) + 5;
      
      // Calculate scroll position
      // Center of container needs to align with center of card
      // We translate the strip to the left.
      // Final Position = (Index * WIDTH) - (ContainerCenter) + (CardHalf)
      // Actually simpler: ScrollAmount = (Index * WIDTH) + jitter
      // But we are using translateX negative.
      
      if (scrollRef.current) {
          const containerWidth = scrollRef.current.parentElement?.offsetWidth || 0;
          const centerOffset = containerWidth / 2 - (CARD_WIDTH / 2);
          const finalScroll = -((baseIndex * CARD_WIDTH) - centerOffset + jitter); // Random spot on the card

          // Reset to start (optional, or just spin from current if we track it)
          scrollRef.current.style.transition = 'none';
          scrollRef.current.style.transform = 'translateX(0px)';
          
          // Force Reflow
          void scrollRef.current.offsetHeight;

          // Spin
          requestAnimationFrame(() => {
              if (scrollRef.current) {
                  scrollRef.current.style.transition = 'transform 5s cubic-bezier(0.1, 0.05, 0.1, 1.0)'; // Ease out
                  scrollRef.current.style.transform = `translateX(${finalScroll}px)`;
              }
          });

          // End
          setTimeout(() => {
              setIsSpinning(false);
              let multiplier = 0;
              if (winningNumObj.color === color) {
                  if (color === 'green') multiplier = 14;
                  else multiplier = 2;
              }
              
              if (multiplier > 0) {
                  const win = betAmount * multiplier;
                  onWin(win);
                  setLastWin(win);
              } else {
                  setLastWin(0);
              }
          }, 5000);
      }
  };

  return (
    <div className="max-w-6xl mx-auto py-12 px-4 flex flex-col items-center">
        <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-green-500 to-black mb-8">
            ROULETTE
        </h2>

        {/* Wheel Container */}
        <div className="relative w-full h-40 bg-slate-900 border-y-4 border-slate-700 mb-8 overflow-hidden flex items-center shadow-inner">
            {/* Center Marker */}
            <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-yellow-400 z-20 -translate-x-1/2 shadow-[0_0_15px_rgba(250,204,21,0.8)]"></div>
            <div className="absolute left-1/2 -top-1 -translate-x-1/2 text-yellow-400 z-20"><Icons.ChevronDown size={24} fill="currentColor"/></div>
            
            {/* Fade Gradients */}
            <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-slate-950 to-transparent z-10"></div>
            <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-slate-950 to-transparent z-10"></div>

            {/* Tape */}
            <div ref={scrollRef} className="flex h-full items-center will-change-transform">
                {TAPE.map((item, i) => (
                    <div 
                        key={i} 
                        className={`
                            flex-shrink-0 w-[80px] h-[80px] mx-[1px] rounded flex items-center justify-center text-2xl font-black border-b-4
                            ${item.color === 'red' ? 'bg-red-600 border-red-800 text-white' : ''}
                            ${item.color === 'black' ? 'bg-slate-800 border-slate-950 text-white' : ''}
                            ${item.color === 'green' ? 'bg-green-500 border-green-700 text-white' : ''}
                        `}
                    >
                        {item.num}
                    </div>
                ))}
            </div>
        </div>

        {/* Controls */}
        <div className="w-full max-w-3xl flex flex-col gap-6">
            
            {/* Bet Input */}
            <div className="flex justify-center items-center gap-4 bg-slate-900 p-3 rounded-xl border border-slate-800 w-max mx-auto">
                 <button onClick={() => setBetAmount(Math.max(10, betAmount / 2))} className="px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded font-bold text-xs">1/2</button>
                 <div className="flex items-center gap-2">
                     <span className="text-slate-400 font-bold">$</span>
                     <input 
                        type="number" 
                        value={betAmount} 
                        onChange={(e) => setBetAmount(parseInt(e.target.value) || 0)}
                        className="bg-transparent w-24 font-mono font-bold text-white text-center outline-none"
                     />
                 </div>
                 <button onClick={() => setBetAmount(betAmount * 2)} className="px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded font-bold text-xs">x2</button>
                 <button onClick={() => setBetAmount(gameState.balance)} className="px-3 py-1 bg-yellow-900/50 text-yellow-500 hover:bg-yellow-900 rounded font-bold text-xs">MAX</button>
            </div>

            {/* Betting Buttons */}
            <div className="grid grid-cols-3 gap-4">
                <button 
                    onClick={() => spin('red')}
                    disabled={isSpinning || gameState.balance < betAmount}
                    className="h-24 rounded-xl bg-gradient-to-br from-red-500 to-red-700 border-b-4 border-red-900 hover:scale-105 active:scale-95 transition-all shadow-lg flex flex-col items-center justify-center gap-1 group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <div className="text-white font-black text-2xl group-hover:scale-110 transition-transform">RED</div>
                    <div className="text-red-200 text-xs font-bold">WIN 2X</div>
                </button>

                <button 
                    onClick={() => spin('green')}
                    disabled={isSpinning || gameState.balance < betAmount}
                    className="h-24 rounded-xl bg-gradient-to-br from-green-500 to-green-700 border-b-4 border-green-900 hover:scale-105 active:scale-95 transition-all shadow-lg flex flex-col items-center justify-center gap-1 group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <div className="text-white font-black text-2xl group-hover:scale-110 transition-transform">ZERO</div>
                    <div className="text-green-200 text-xs font-bold">WIN 14X</div>
                </button>

                <button 
                    onClick={() => spin('black')}
                    disabled={isSpinning || gameState.balance < betAmount}
                    className="h-24 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 border-b-4 border-black hover:scale-105 active:scale-95 transition-all shadow-lg flex flex-col items-center justify-center gap-1 group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <div className="text-white font-black text-2xl group-hover:scale-110 transition-transform">BLACK</div>
                    <div className="text-slate-400 text-xs font-bold">WIN 2X</div>
                </button>
            </div>

            {/* Status */}
            <div className="text-center h-8">
                {isSpinning ? (
                    <span className="text-yellow-400 font-bold animate-pulse">ROLLING...</span>
                ) : lastWin !== null ? (
                    lastWin > 0 ? (
                        <span className="text-green-400 font-black text-2xl animate-bounce">WON ${lastWin.toLocaleString()}!</span>
                    ) : (
                        <span className="text-red-500 font-bold">Better luck next time.</span>
                    )
                ) : (
                    <span className="text-slate-500">Place your bets.</span>
                )}
            </div>
        </div>
    </div>
  );
};