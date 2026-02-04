import React, { useState } from 'react';
import { GameState } from '../types';
import { Scissors, FileText, Circle } from 'lucide-react';

interface RPSProps {
  gameState: GameState;
  onWin: (amount: number) => void;
  removeBalance: (amount: number) => void;
}

type Choice = 'rock' | 'paper' | 'scissors';

export const RPS: React.FC<RPSProps> = ({ gameState, onWin, removeBalance }) => {
  const [bet, setBet] = useState(100);
  const [playerChoice, setPlayerChoice] = useState<Choice | null>(null);
  const [houseChoice, setHouseChoice] = useState<Choice | null>(null);
  const [result, setResult] = useState<'win' | 'lose' | 'tie' | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const choices: { id: Choice, icon: any, beats: Choice }[] = [
      { id: 'rock', icon: Circle, beats: 'scissors' },
      { id: 'paper', icon: FileText, beats: 'rock' },
      { id: 'scissors', icon: Scissors, beats: 'paper' }
  ];

  const play = (choice: Choice) => {
      if (gameState.balance < bet || isPlaying || bet <= 0) return;
      
      removeBalance(bet);
      setIsPlaying(true);
      setPlayerChoice(choice);
      setHouseChoice(null);
      setResult(null);

      setTimeout(() => {
          const house = choices[Math.floor(Math.random() * choices.length)].id;
          setHouseChoice(house);
          
          if (choice === house) {
              setResult('tie');
              onWin(bet); // Return bet
          } else if (choices.find(c => c.id === choice)?.beats === house) {
              setResult('win');
              onWin(bet * 2);
          } else {
              setResult('lose');
          }
          setIsPlaying(false);
      }, 1000);
  };

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 flex flex-col items-center">
        <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-orange-400 to-red-600 mb-8">
            ROCK PAPER SCISSORS
        </h2>

        <div className="w-full bg-slate-900 border-4 border-slate-800 rounded-3xl p-8 shadow-2xl text-center">
            
            {/* Bet Input */}
            <div className="mb-8 flex justify-center">
                <div className="bg-black/40 p-4 rounded-xl border border-slate-700 flex gap-2 items-center">
                    <span className="text-yellow-500 font-bold">$</span>
                    <input 
                        type="number" 
                        value={bet} 
                        onChange={e => setBet(Math.max(0, parseInt(e.target.value) || 0))}
                        className="bg-transparent font-mono font-bold text-white outline-none w-24"
                        disabled={isPlaying}
                    />
                </div>
            </div>

            {/* Arena */}
            <div className="flex justify-between items-center mb-12 px-8 min-h-[160px]">
                <div className="flex flex-col items-center gap-2">
                    <div className={`w-32 h-32 rounded-full border-4 flex items-center justify-center transition-all ${playerChoice ? 'bg-blue-600 border-blue-400 scale-110' : 'bg-slate-800 border-slate-700'}`}>
                        {playerChoice && React.createElement(choices.find(c => c.id === playerChoice)!.icon, { size: 64, className: 'text-white' })}
                        {!playerChoice && <span className="text-slate-500 font-bold">YOU</span>}
                    </div>
                </div>

                <div className="text-4xl font-black text-slate-600">VS</div>

                <div className="flex flex-col items-center gap-2">
                    <div className={`w-32 h-32 rounded-full border-4 flex items-center justify-center transition-all ${houseChoice ? 'bg-red-600 border-red-400 scale-110' : 'bg-slate-800 border-slate-700'}`}>
                        {houseChoice ? (
                            React.createElement(choices.find(c => c.id === houseChoice)!.icon, { size: 64, className: 'text-white' })
                        ) : (
                            <span className="text-slate-500 font-bold">{isPlaying ? '...' : 'HOUSE'}</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Result */}
            {result && (
                <div className={`mb-8 text-4xl font-black animate-bounce ${result === 'win' ? 'text-green-400' : result === 'tie' ? 'text-yellow-400' : 'text-red-500'}`}>
                    {result.toUpperCase()}
                </div>
            )}

            {/* Selection */}
            <div className="grid grid-cols-3 gap-4">
                {choices.map(c => (
                    <button 
                        key={c.id}
                        onClick={() => play(c.id)}
                        disabled={isPlaying || gameState.balance < bet || bet <= 0}
                        className="p-6 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 rounded-2xl flex flex-col items-center gap-2 border-b-4 border-slate-950 active:border-b-0 active:translate-y-1 transition-all"
                    >
                        <c.icon size={48} className="text-white" />
                        <span className="font-bold text-white uppercase">{c.id}</span>
                    </button>
                ))}
            </div>

        </div>
    </div>
  );
};