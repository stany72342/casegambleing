import React, { useState, useRef, useEffect } from 'react';
import { GameState } from '../types';
import * as Icons from 'lucide-react';

interface RouletteProps {
  gameState: GameState;
  onWin: (amount: number) => void;
  removeBalance: (amount: number) => void;
}

// Standard CSGO Roulette Wheel Configuration
// 0 = Green, 1-7 = Red, 8-14 = Black
const WHEEL_ORDER = [
  { num: 1, color: 'red' }, { num: 14, color: 'black' }, { num: 2, color: 'red' }, { num: 13, color: 'black' },
  { num: 3, color: 'red' }, { num: 12, color: 'black' }, { num: 4, color: 'red' }, { num: 0, color: 'green' },
  { num: 11, color: 'black' }, { num: 5, color: 'red' }, { num: 10, color: 'black' }, { num: 6, color: 'red' },
  { num: 9, color: 'black' }, { num: 7, color: 'red' }, { num: 8, color: 'black' }
];

const CARD_WIDTH = 100;
const MARGIN_X = 2; // mx-[2px]
const TOTAL_ITEM_WIDTH = CARD_WIDTH + (MARGIN_X * 2); // 104px

// Sound Engine specific to Roulette
const SoundEffect = {
    ctx: null as AudioContext | null,
    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
    },
    playTick() {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(600, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.05);
        gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.05);
    },
    playWin(isBig: boolean) {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = isBig ? 'square' : 'sine';
        osc.frequency.setValueAtTime(isBig ? 440 : 523, now);
        if (isBig) {
            osc.frequency.setValueAtTime(440, now);
            osc.frequency.setValueAtTime(554, now + 0.1);
            osc.frequency.setValueAtTime(659, now + 0.2);
        }
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.5);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(now + 0.5);
    }
};

interface SpinTarget {
    index: number;
    outcome: { num: number, color: string };
    choice: 'red' | 'black' | 'green';
}

export const Roulette: React.FC<RouletteProps> = ({ gameState, onWin, removeBalance }) => {
  const [betAmount, setBetAmount] = useState(100);
  const [isSpinning, setIsSpinning] = useState(false);
  const [history, setHistory] = useState<number[]>([1, 14, 2, 13, 3, 12, 4, 0, 11, 5]);
  const [tape, setTape] = useState(WHEEL_ORDER);
  const [winNotification, setWinNotification] = useState<{amount: number, color: string} | null>(null);
  
  // State to coordinate render and animation
  const [spinTarget, setSpinTarget] = useState<SpinTarget | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastTickRef = useRef<number>(0);

  // Initialize Audio
  useEffect(() => {
      const initAudio = () => SoundEffect.init();
      window.addEventListener('click', initAudio, { once: true });
      return () => window.removeEventListener('click', initAudio);
  }, []);

  const spin = (colorChoice: 'red' | 'black' | 'green') => {
      if (isSpinning || gameState.balance < betAmount) return;

      SoundEffect.init();
      removeBalance(betAmount);
      setIsSpinning(true);
      setWinNotification(null);

      // 1. Determine Winner (RNG)
      const randomOutcome = WHEEL_ORDER[Math.floor(Math.random() * WHEEL_ORDER.length)];
      
      // 2. Build the "Tape"
      const LOOPS_BEFORE_WIN = 5; 
      // Find index of outcome in base wheel
      const outcomeIndex = WHEEL_ORDER.findIndex(x => x.num === randomOutcome.num);
      const WIN_INDEX_IN_TAPE = (WHEEL_ORDER.length * LOOPS_BEFORE_WIN) + outcomeIndex;
      const TOTAL_TAPE_LENGTH = WIN_INDEX_IN_TAPE + 15; // Buffer
      
      const newTape: typeof WHEEL_ORDER = [];
      for (let i = 0; i < TOTAL_TAPE_LENGTH; i++) {
          newTape.push(WHEEL_ORDER[i % WHEEL_ORDER.length]);
      }
      
      // Update state triggers re-render
      setTape(newTape);
      setSpinTarget({
          index: WIN_INDEX_IN_TAPE,
          outcome: randomOutcome,
          choice: colorChoice
      });
  };

  // Animation Effect - Triggers when spinTarget changes (after render)
  useEffect(() => {
      if (!isSpinning || !spinTarget || !scrollRef.current) return;

      const container = scrollRef.current;
      const mask = container.parentElement;
      if (!mask) return;
      
      // Reset to 0 instantly
      container.style.transition = 'none';
      container.style.transform = 'translateX(0px)';
      
      // Force Reflow
      void container.offsetHeight;

      // Find Target Card Element from the DOM to ensure exact position calculation
      // This fixes drift issues caused by sub-pixel rendering or margin miscalculations
      const targetCard = container.children[spinTarget.index] as HTMLElement;
      if (!targetCard) {
          console.error("Target card not found in DOM");
          return;
      }

      // Calculate Scroll Position using getBoundingClientRect for absolute precision
      const maskRect = mask.getBoundingClientRect();
      const cardRect = targetCard.getBoundingClientRect();
      
      // Center of the visible window
      const maskCenter = maskRect.left + (maskRect.width / 2);
      
      // Current center of the target card (at start position)
      const cardCenter = cardRect.left + (cardRect.width / 2);
      
      // Random jitter within +/- 25px to keep the marker inside the card
      const jitter = (Math.random() - 0.5) * 50; 
      
      // We need to move the tape so that 'cardCenter' moves to 'maskCenter + jitter'
      // Delta = (MaskCenter + Jitter) - CardCenter
      const finalTranslate = (maskCenter + jitter) - cardCenter;

      // Start Animation
      requestAnimationFrame(() => {
          container.style.transition = 'transform 6s cubic-bezier(0.15, 0.20, 0.10, 1.0)';
          container.style.transform = `translateX(${finalTranslate}px)`;
      });

      // Audio Ticks
      const start = performance.now();
      const duration = 6000;
      
      const trackTicks = (time: number) => {
          if (!isSpinning && time > start + duration) return;
          
          const progress = (time - start) / duration;
          if (progress >= 1) return;

          if (scrollRef.current) {
              const style = window.getComputedStyle(scrollRef.current);
              const matrix = new WebKitCSSMatrix(style.transform);
              const currentX = Math.abs(matrix.m41);
              
              const cardIndex = Math.floor(currentX / TOTAL_ITEM_WIDTH);
              if (cardIndex > lastTickRef.current) {
                  SoundEffect.playTick();
                  lastTickRef.current = cardIndex;
              }
          }
          
          if (performance.now() < start + duration) {
              requestAnimationFrame(trackTicks);
          }
      };
      const tickId = requestAnimationFrame(trackTicks);

      // Cleanup Timeout
      const timer = setTimeout(() => {
          setIsSpinning(false);
          lastTickRef.current = 0;
          setHistory(prev => [spinTarget.outcome.num, ...prev].slice(0, 15));
          
          let multiplier = 0;
          if (spinTarget.outcome.color === spinTarget.choice) {
              multiplier = spinTarget.outcome.color === 'green' ? 14 : 2;
          }

          if (multiplier > 0) {
              const win = betAmount * multiplier;
              onWin(win);
              SoundEffect.playWin(spinTarget.outcome.color === 'green');
              setWinNotification({ amount: win, color: spinTarget.outcome.color });
          } else {
              setWinNotification({ amount: 0, color: spinTarget.outcome.color });
          }
          setSpinTarget(null); // Reset target
      }, 6000);

      return () => {
          cancelAnimationFrame(tickId);
          clearTimeout(timer);
      };
  }, [isSpinning, spinTarget]); // eslint-disable-line react-hooks/exhaustive-deps

  const getColorStyles = (color: string) => {
      switch(color) {
          case 'red': return 'bg-gradient-to-br from-red-600 to-red-800 border-red-500 text-white';
          case 'black': return 'bg-gradient-to-br from-slate-800 to-slate-950 border-slate-600 text-white';
          case 'green': return 'bg-gradient-to-br from-green-500 to-green-700 border-green-400 text-white';
          default: return 'bg-slate-500';
      }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 flex flex-col items-center select-none">
        
        {/* Header / History */}
        <div className="w-full mb-8 flex flex-col items-center">
            <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-green-500 to-slate-500 mb-4 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
                ROULETTE
            </h2>
            
            <div className="flex gap-2 items-center bg-slate-900/50 p-2 rounded-full border border-slate-800">
                <span className="text-xs font-bold text-slate-500 pl-2 uppercase tracking-wider">Previous:</span>
                {history.map((num, i) => {
                    const color = WHEEL_ORDER.find(x => x.num === num)?.color || 'black';
                    return (
                        <div 
                            key={i} 
                            className={`
                                w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 shadow-lg
                                ${color === 'red' ? 'bg-red-600 border-red-400' : ''}
                                ${color === 'black' ? 'bg-slate-800 border-slate-600' : ''}
                                ${color === 'green' ? 'bg-green-500 border-green-300 text-black' : ''}
                                ${i === 0 ? 'scale-110 z-10 ring-2 ring-white/20' : 'opacity-70'}
                            `}
                        >
                            {num}
                        </div>
                    );
                })}
            </div>
        </div>

        {/* Wheel Container */}
        <div className="relative w-full h-[140px] bg-slate-950 border-y-4 border-slate-800 mb-12 overflow-hidden flex items-center shadow-[inset_0_0_50px_rgba(0,0,0,0.8)] rounded-xl group">
            
            {/* Center Marker */}
            <div className="absolute left-1/2 top-0 bottom-0 w-[4px] bg-yellow-400 z-30 -translate-x-1/2 shadow-[0_0_20px_rgba(250,204,21,1)]"></div>
            <div className="absolute left-1/2 -top-2 -translate-x-1/2 text-yellow-400 z-30 filter drop-shadow-lg"><Icons.ChevronDown size={32} fill="currentColor"/></div>
            <div className="absolute left-1/2 -bottom-2 -translate-x-1/2 text-yellow-400 z-30 filter drop-shadow-lg"><Icons.ChevronUp size={32} fill="currentColor"/></div>
            
            {/* Side Fades */}
            <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent z-20 pointer-events-none"></div>
            <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-slate-950 via-slate-950/80 to-transparent z-20 pointer-events-none"></div>

            {/* Tape */}
            <div 
                ref={scrollRef} 
                className="flex items-center h-full will-change-transform pl-[50%]" // Start padding to roughly center start
            >
                {tape.map((item, i) => (
                    <div 
                        key={i} 
                        className={`
                            flex-shrink-0 w-[100px] h-[100px] mx-[2px] rounded-lg flex items-center justify-center text-4xl font-black border-b-4 shadow-lg
                            ${getColorStyles(item.color)}
                        `}
                    >
                        {item.num}
                    </div>
                ))}
            </div>
        </div>

        {/* Win Notification Overlay */}
        {winNotification && !isSpinning && (
            <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
                <div className="bg-black/80 backdrop-blur-md p-8 rounded-3xl border-2 border-white/10 text-center animate-in zoom-in slide-in-from-bottom-10 shadow-2xl">
                    <div className="text-sm font-bold text-slate-400 uppercase mb-2">Outcome</div>
                    <div className={`text-6xl font-black mb-4 capitalize ${winNotification.color === 'red' ? 'text-red-500' : winNotification.color === 'green' ? 'text-green-500' : 'text-slate-200'}`}>
                        {winNotification.color}
                    </div>
                    {winNotification.amount > 0 ? (
                        <div className="text-4xl font-bold text-green-400 animate-bounce">
                            +${winNotification.amount.toLocaleString()}
                        </div>
                    ) : (
                        <div className="text-xl font-bold text-red-400">
                            Lost ${betAmount}
                        </div>
                    )}
                </div>
            </div>
        )}

        {/* Controls */}
        <div className="w-full max-w-4xl flex flex-col gap-8">
            
            {/* Bet Input */}
            <div className="flex justify-center items-center gap-2 bg-slate-900 p-2 rounded-xl border border-slate-800 w-full max-w-md mx-auto shadow-lg">
                 <div className="flex items-center gap-2 bg-black/50 px-4 py-2 rounded-lg border border-slate-700 flex-1">
                     <span className="text-yellow-500 font-bold">$</span>
                     <input 
                        type="number" 
                        value={betAmount} 
                        onChange={(e) => setBetAmount(Math.max(0, parseInt(e.target.value) || 0))}
                        disabled={isSpinning}
                        className="bg-transparent w-full font-mono font-bold text-white text-lg outline-none"
                     />
                 </div>
                 <div className="flex gap-1">
                    <button onClick={() => setBetAmount(Math.floor(betAmount / 2))} disabled={isSpinning} className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-bold text-xs transition-colors">1/2</button>
                    <button onClick={() => setBetAmount(betAmount * 2)} disabled={isSpinning} className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-bold text-xs transition-colors">x2</button>
                    <button onClick={() => setBetAmount(gameState.balance)} disabled={isSpinning} className="px-3 py-2 bg-yellow-600 hover:bg-yellow-500 text-black rounded font-bold text-xs transition-colors">MAX</button>
                 </div>
            </div>

            {/* Betting Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button 
                    onClick={() => spin('red')}
                    disabled={isSpinning || gameState.balance < betAmount}
                    className="group relative h-32 rounded-2xl bg-gradient-to-br from-red-600 to-red-900 border-2 border-red-500 hover:border-red-400 active:scale-95 transition-all shadow-[0_0_30px_rgba(220,38,38,0.2)] disabled:opacity-50 disabled:grayscale overflow-hidden"
                >
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                    <div className="relative z-10 flex flex-col items-center justify-center h-full">
                        <div className="text-white font-black text-3xl mb-1 group-hover:scale-110 transition-transform">WIN 2X</div>
                        <div className="text-red-200 text-sm font-bold bg-black/30 px-3 py-1 rounded-full">RED</div>
                    </div>
                </button>

                <button 
                    onClick={() => spin('green')}
                    disabled={isSpinning || gameState.balance < betAmount}
                    className="group relative h-32 rounded-2xl bg-gradient-to-br from-green-500 to-green-800 border-2 border-green-400 hover:border-green-300 active:scale-95 transition-all shadow-[0_0_30px_rgba(34,197,94,0.2)] disabled:opacity-50 disabled:grayscale overflow-hidden"
                >
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                    <div className="relative z-10 flex flex-col items-center justify-center h-full">
                        <div className="text-white font-black text-4xl mb-1 group-hover:scale-110 transition-transform">14X</div>
                        <div className="text-green-100 text-sm font-bold bg-black/30 px-3 py-1 rounded-full">ZERO</div>
                    </div>
                </button>

                <button 
                    onClick={() => spin('black')}
                    disabled={isSpinning || gameState.balance < betAmount}
                    className="group relative h-32 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 border-2 border-slate-500 hover:border-slate-400 active:scale-95 transition-all shadow-[0_0_30px_rgba(100,116,139,0.2)] disabled:opacity-50 disabled:grayscale overflow-hidden"
                >
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                    <div className="relative z-10 flex flex-col items-center justify-center h-full">
                        <div className="text-white font-black text-3xl mb-1 group-hover:scale-110 transition-transform">WIN 2X</div>
                        <div className="text-slate-300 text-sm font-bold bg-black/30 px-3 py-1 rounded-full">BLACK</div>
                    </div>
                </button>
            </div>
        </div>
    </div>
  );
};