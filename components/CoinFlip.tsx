import React, { useState } from 'react';
import { GameState } from '../types';
import { Coins, CircleDollarSign, ArrowUp } from 'lucide-react';

interface CoinFlipProps {
  gameState: GameState;
  onWin: (amount: number) => void;
  removeBalance: (amount: number) => void;
}

export const CoinFlip: React.FC<CoinFlipProps> = ({ gameState, onWin, removeBalance }) => {
  const [betAmount, setBetAmount] = useState(100);
  const [selectedSide, setSelectedSide] = useState<'heads' | 'tails' | null>(null);
  const [isFlipping, setIsFlipping] = useState(false);
  const [result, setResult] = useState<'heads' | 'tails' | null>(null);
  const [winMessage, setWinMessage] = useState<string | null>(null);

  const flip = () => {
    if (!selectedSide) return;
    if (gameState.balance < betAmount || betAmount <= 0) return;
    if (isFlipping) return;

    removeBalance(betAmount);
    setIsFlipping(true);
    setResult(null);
    setWinMessage(null);

    // Determine Result
    const outcome = Math.random() > 0.5 ? 'heads' : 'tails';

    // Animation Duration
    setTimeout(() => {
      setIsFlipping(false);
      setResult(outcome);

      if (outcome === selectedSide) {
        const win = betAmount * 2;
        onWin(win);
        setWinMessage(`WON $${win.toLocaleString()}!`);
      } else {
        setWinMessage('LOST');
      }
    }, 2000);
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 flex flex-col items-center">
      <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-yellow-300 to-yellow-600 mb-8">
        COIN FLIP
      </h2>

      <div className="flex flex-col md:flex-row gap-12 w-full items-center justify-center">
        
        {/* Controls Side */}
        <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 w-full max-w-sm shadow-xl">
          
          <div className="mb-6">
            <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Bet Amount</label>
            <div className="flex items-center gap-2 bg-black border border-slate-700 rounded-xl p-3">
              <span className="text-yellow-500 font-bold">$</span>
              <input 
                type="number" 
                value={betAmount}
                onChange={(e) => setBetAmount(Math.max(0, parseInt(e.target.value) || 0))}
                disabled={isFlipping}
                className="bg-transparent w-full text-white font-mono font-bold outline-none"
              />
            </div>
            <div className="flex gap-2 mt-2">
               <button onClick={() => setBetAmount(Math.max(10, betAmount / 2))} disabled={isFlipping} className="flex-1 bg-slate-800 hover:bg-slate-700 text-xs font-bold py-1 rounded text-white">1/2</button>
               <button onClick={() => setBetAmount(betAmount * 2)} disabled={isFlipping} className="flex-1 bg-slate-800 hover:bg-slate-700 text-xs font-bold py-1 rounded text-white">x2</button>
               <button onClick={() => setBetAmount(gameState.balance)} disabled={isFlipping} className="flex-1 bg-yellow-900/40 text-yellow-500 hover:bg-yellow-900/60 text-xs font-bold py-1 rounded">MAX</button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <button
              onClick={() => setSelectedSide('heads')}
              disabled={isFlipping}
              className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${selectedSide === 'heads' ? 'bg-yellow-500/20 border-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.3)]' : 'bg-slate-800 border-slate-700 hover:border-slate-500'}`}
            >
              <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center shadow-lg">
                <CircleDollarSign className="text-yellow-900 w-8 h-8" />
              </div>
              <span className={`font-bold ${selectedSide === 'heads' ? 'text-yellow-400' : 'text-slate-400'}`}>HEADS</span>
            </button>

            <button
              onClick={() => setSelectedSide('tails')}
              disabled={isFlipping}
              className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${selectedSide === 'tails' ? 'bg-slate-200/20 border-slate-200 shadow-[0_0_20px_rgba(255,255,255,0.3)]' : 'bg-slate-800 border-slate-700 hover:border-slate-500'}`}
            >
              <div className="w-12 h-12 bg-slate-300 rounded-full flex items-center justify-center shadow-lg">
                <Coins className="text-slate-800 w-8 h-8" />
              </div>
              <span className={`font-bold ${selectedSide === 'tails' ? 'text-white' : 'text-slate-400'}`}>TAILS</span>
            </button>
          </div>

          <button
            onClick={flip}
            disabled={!selectedSide || isFlipping || gameState.balance < betAmount}
            className={`
              w-full py-4 rounded-xl font-black text-xl tracking-widest shadow-lg transition-all transform active:scale-95
              ${!selectedSide || isFlipping || gameState.balance < betAmount
                ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white hover:shadow-orange-500/50'}
            `}
          >
            {isFlipping ? 'FLIPPING...' : 'FLIP COIN'}
          </button>

        </div>

        {/* Visual Side */}
        <div className="relative w-64 h-64 flex items-center justify-center perspective-1000">
           <div className={`
              relative w-48 h-48 transition-transform duration-500 transform-style-3d
              ${isFlipping ? 'animate-spin-y-fast' : ''}
              ${!isFlipping && result === 'heads' ? 'rotate-y-0' : ''}
              ${!isFlipping && result === 'tails' ? 'rotate-y-180' : ''}
           `}>
              {/* Heads Side */}
              <div className="absolute inset-0 w-full h-full rounded-full bg-yellow-500 border-4 border-yellow-300 shadow-[inset_0_0_30px_rgba(0,0,0,0.3),0_0_20px_rgba(234,179,8,0.5)] flex items-center justify-center backface-hidden">
                  <CircleDollarSign size={80} className="text-yellow-800 drop-shadow-md" />
              </div>
              
              {/* Tails Side (Rotated) */}
              <div className="absolute inset-0 w-full h-full rounded-full bg-slate-300 border-4 border-slate-100 shadow-[inset_0_0_30px_rgba(0,0,0,0.3),0_0_20px_rgba(255,255,255,0.5)] flex items-center justify-center backface-hidden rotate-y-180">
                  <Coins size={80} className="text-slate-700 drop-shadow-md" />
              </div>
           </div>

           {/* Result Text Overlay */}
           {!isFlipping && winMessage && (
             <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 whitespace-nowrap animate-in zoom-in slide-in-from-bottom-4">
               <div className={`px-6 py-2 rounded-xl border-2 font-black text-xl ${winMessage.includes('WON') ? 'bg-green-600/20 border-green-500 text-green-400' : 'bg-red-600/20 border-red-500 text-red-400'}`}>
                 {winMessage}
               </div>
             </div>
           )}
        </div>

      </div>

      <style>{`
        .perspective-1000 { perspective: 1000px; }
        .transform-style-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
        .rotate-y-0 { transform: rotateY(0deg); }
        @keyframes spin-y-fast {
          0% { transform: rotateY(0deg); }
          100% { transform: rotateY(1800deg); }
        }
        .animate-spin-y-fast {
          animation: spin-y-fast 2s cubic-bezier(0.4, 2.5, 0.6, 0.5);
        }
      `}</style>
    </div>
  );
};