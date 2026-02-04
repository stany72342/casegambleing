import React, { useState } from 'react';
import { GameState } from '../types';
import { Dna, RefreshCw } from 'lucide-react';

interface DiceProps {
  gameState: GameState;
  onWin: (amount: number) => void;
  removeBalance: (amount: number) => void;
}

export const Dice: React.FC<DiceProps> = ({ gameState, onWin, removeBalance }) => {
  const [bet, setBet] = useState(100);
  const [winChance, setWinChance] = useState(50);
  const [isRolling, setIsRolling] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const [history, setHistory] = useState<{roll: number, won: boolean}[]>([]);

  // Simple multiplier logic: 98 / chance (1% house edge roughly)
  const multiplier = 98 / winChance;

  const roll = () => {
      if (gameState.balance < bet || isRolling || bet <= 0) return;
      
      removeBalance(bet);
      setIsRolling(true);
      
      // Simulate roll time
      setTimeout(() => {
          const outcome = Math.random() * 100;
          setResult(outcome);
          const won = outcome < winChance;
          
          setHistory(prev => [{roll: outcome, won}, ...prev].slice(0, 10));
          
          if (won) {
              onWin(Math.floor(bet * multiplier));
          }
          setIsRolling(false);
      }, 500);
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 flex flex-col items-center">
        <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-cyan-400 to-blue-600 mb-8">
            CYBER DICE
        </h2>

        <div className="w-full bg-slate-900 border-4 border-slate-800 rounded-3xl p-8 shadow-2xl">
            
            {/* History Bar */}
            <div className="flex gap-2 mb-8 overflow-hidden justify-center h-10">
                {history.map((h, i) => (
                    <div 
                        key={i} 
                        className={`w-12 h-8 rounded-full flex items-center justify-center font-bold text-xs ${h.won ? 'bg-green-500 text-black' : 'bg-slate-800 text-slate-500'}`}
                    >
                        {h.roll.toFixed(0)}
                    </div>
                ))}
            </div>

            {/* Slider Visual */}
            <div className="relative h-16 bg-slate-800 rounded-full mb-12 overflow-hidden border-2 border-slate-700">
                <div 
                    className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-green-500 to-green-400 transition-all duration-300"
                    style={{ width: `${winChance}%` }}
                ></div>
                
                {/* Result Marker */}
                {result !== null && (
                    <div 
                        className="absolute top-0 bottom-0 w-2 bg-white z-10 shadow-[0_0_15px_white] transition-all duration-300"
                        style={{ left: `${result}%` }}
                    ></div>
                )}

                <div className="absolute inset-0 flex items-center justify-between px-6 font-bold text-slate-900 z-0">
                    <span>0</span>
                    <span>25</span>
                    <span>50</span>
                    <span>75</span>
                    <span>100</span>
                </div>
            </div>

            {/* Controls */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                
                <div className="bg-black/40 p-4 rounded-xl border border-slate-700">
                    <div className="text-slate-500 text-xs font-bold uppercase mb-2">Bet Amount</div>
                    <div className="flex gap-2">
                        <span className="text-yellow-500 font-bold">$</span>
                        <input 
                            type="number" 
                            value={bet} 
                            onChange={e => setBet(Math.max(0, parseInt(e.target.value) || 0))}
                            className="bg-transparent w-full font-mono font-bold text-white outline-none"
                        />
                    </div>
                </div>

                <div className="bg-black/40 p-4 rounded-xl border border-slate-700">
                    <div className="flex justify-between mb-2">
                        <span className="text-slate-500 text-xs font-bold uppercase">Win Chance</span>
                        <span className="text-white font-bold">{winChance}%</span>
                    </div>
                    <input 
                        type="range" 
                        min="1" 
                        max="98" 
                        value={winChance} 
                        onChange={e => setWinChance(parseInt(e.target.value))}
                        className="w-full accent-cyan-500"
                    />
                </div>

                <div className="bg-black/40 p-4 rounded-xl border border-slate-700 text-center">
                    <div className="text-slate-500 text-xs font-bold uppercase mb-1">Multiplier</div>
                    <div className="text-2xl font-mono font-bold text-green-400">x{multiplier.toFixed(4)}</div>
                </div>

            </div>

            <button 
                onClick={roll}
                disabled={isRolling || gameState.balance < bet || bet <= 0}
                className="w-full mt-8 py-4 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black rounded-xl text-xl shadow-lg transition-all active:scale-95"
            >
                {isRolling ? 'ROLLING...' : `ROLL UNDER ${winChance}`}
            </button>

        </div>
    </div>
  );
};