import React, { useState } from 'react';
import { GameState } from '../types';
import * as Icons from 'lucide-react';

interface SlotsProps {
  gameState: GameState;
  onSpinResult: (winAmount: number) => void;
  removeBalance: (amount: number) => void;
}

const SYMBOLS = [
  { id: 'cherry', icon: 'Cherry', value: 2, color: 'text-red-500' },
  { id: 'grape', icon: 'Grape', value: 5, color: 'text-purple-500' },
  { id: 'clover', icon: 'Clover', value: 10, color: 'text-green-500' },
  { id: 'diamond', icon: 'Gem', value: 50, color: 'text-blue-400' },
  { id: 'crown', icon: 'Crown', value: 100, color: 'text-yellow-400' },
  { id: 'bomb', icon: 'Bomb', value: 0, color: 'text-slate-500' }, // Bomb makes it harder
];

export const Slots: React.FC<SlotsProps> = ({ gameState, onSpinResult, removeBalance }) => {
  const [reels, setReels] = useState([0, 0, 0]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [bet, setBet] = useState(10);
  const [winMessage, setWinMessage] = useState<string | null>(null);

  const LucideIcon = ({ name, size = 24, className }: { name: string, size?: number, className?: string }) => {
    const Icon = (Icons as any)[name];
    return Icon ? <Icon size={size} className={className} /> : <Icons.HelpCircle size={size} />;
  };

  const spin = () => {
    if (gameState.balance < bet || isSpinning) return;

    removeBalance(bet);
    setIsSpinning(true);
    setWinMessage(null);

    // Determine result immediately
    // Bomb Logic: If bomb appears, you lose.
    // Adding Bomb to the pool naturally dilutes the pool.
    // Let's use a weighted system to make Bomb appear enough to be annoying but not impossible.
    
    // We'll simulate standard RNG slot logic
    const finalReels = [
        Math.floor(Math.random() * SYMBOLS.length),
        Math.floor(Math.random() * SYMBOLS.length),
        Math.floor(Math.random() * SYMBOLS.length)
    ];

    // Animation simulation
    let spinCount = 0;
    const interval = setInterval(() => {
        setReels(prev => prev.map(() => Math.floor(Math.random() * SYMBOLS.length)));
        spinCount++;
        if (spinCount > 15) {
            clearInterval(interval);
            setReels(finalReels);
            setIsSpinning(false);
            calculateWin(finalReels);
        }
    }, 100);
  };

  const calculateWin = (currentReels: number[]) => {
      const s1 = SYMBOLS[currentReels[0]];
      const s2 = SYMBOLS[currentReels[1]];
      const s3 = SYMBOLS[currentReels[2]];

      // Check for Bomb
      if (s1.id === 'bomb' || s2.id === 'bomb' || s3.id === 'bomb') {
          setWinMessage(`BOMB! You lost everything.`);
          // No win, just loss
          return;
      }

      if (currentReels[0] === currentReels[1] && currentReels[1] === currentReels[2]) {
          // 3 match
          const win = bet * s1.value;
          onSpinResult(win);
          setWinMessage(`JACKPOT! Won $${win}`);
      } else if (currentReels[0] === currentReels[1] || currentReels[1] === currentReels[2] || currentReels[0] === currentReels[2]) {
          // 2 match - Small win
          const win = Math.floor(bet * 1.5);
          onSpinResult(win);
          setWinMessage(`Small Win! Won $${win}`);
      } else {
          setWinMessage(null);
      }
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 flex flex-col items-center">
        <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600 mb-8 drop-shadow-sm">
            GOLDEN SLOTS
        </h2>

        {/* Machine */}
        <div className="bg-slate-800 p-8 rounded-3xl border-8 border-yellow-600 shadow-2xl relative">
            
            {/* Reels Container */}
            <div className="flex gap-4 bg-black p-6 rounded-xl border-4 border-slate-700 shadow-inner mb-8">
                {reels.map((symbolIdx, i) => (
                    <div key={i} className="w-24 h-32 bg-gradient-to-b from-slate-100 to-slate-300 rounded-lg flex items-center justify-center border-2 border-slate-400 overflow-hidden relative shadow-[inset_0_0_20px_rgba(0,0,0,0.2)]">
                        <div className={`transform transition-all duration-100 ${isSpinning ? 'blur-sm scale-110' : 'scale-100'}`}>
                             <LucideIcon 
                                name={SYMBOLS[symbolIdx].icon} 
                                size={64} 
                                className={SYMBOLS[symbolIdx].color}
                             />
                        </div>
                        {/* Shine effect */}
                        <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent pointer-events-none"></div>
                    </div>
                ))}
            </div>

            {/* Controls */}
            <div className="flex flex-col items-center gap-6">
                
                {/* Win Display */}
                <div className="h-8 flex items-center justify-center">
                    {winMessage ? (
                        <span className={`font-bold text-xl animate-bounce ${winMessage.includes('BOMB') ? 'text-red-500' : 'text-green-400'}`}>{winMessage}</span>
                    ) : (
                        <span className="text-slate-500 font-mono">Avoid the bombs!</span>
                    )}
                </div>

                {/* Bet Selector */}
                <div className="flex items-center gap-4 bg-slate-900 p-2 rounded-full border border-slate-700">
                    <button 
                        onClick={() => setBet(Math.max(10, bet - 10))}
                        disabled={isSpinning}
                        className="w-8 h-8 rounded-full bg-slate-700 hover:bg-slate-600 text-white flex items-center justify-center font-bold"
                    >
                        -
                    </button>
                    <div className="font-mono text-yellow-400 w-20 text-center font-bold">
                        ${bet}
                    </div>
                    <button 
                        onClick={() => setBet(bet + 10)}
                        disabled={isSpinning || gameState.balance < bet + 10}
                        className="w-8 h-8 rounded-full bg-slate-700 hover:bg-slate-600 text-white flex items-center justify-center font-bold"
                    >
                        +
                    </button>
                </div>

                {/* Spin Button */}
                <button
                    onClick={spin}
                    disabled={isSpinning || gameState.balance < bet}
                    className={`
                        w-full py-4 rounded-xl font-black text-2xl uppercase tracking-widest shadow-lg transform transition-all
                        border-b-4 
                        ${isSpinning || gameState.balance < bet 
                            ? 'bg-slate-600 border-slate-800 text-slate-400 cursor-not-allowed' 
                            : 'bg-red-600 border-red-800 text-white hover:bg-red-500 hover:border-red-700 active:border-b-0 active:translate-y-1 shadow-red-900/50'}
                    `}
                >
                    {isSpinning ? '...' : 'SPIN'}
                </button>
            </div>
        </div>
    </div>
  );
};