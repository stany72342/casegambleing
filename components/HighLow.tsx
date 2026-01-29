import React, { useState } from 'react';
import { GameState } from '../types';
import { ArrowUp, ArrowDown, Play } from 'lucide-react';

interface HighLowProps {
  gameState: GameState;
  onGameEnd: (winAmount: number) => void;
  removeBalance: (amount: number) => void;
}

type Card = {
    suit: 'H' | 'D' | 'C' | 'S';
    value: string;
    rank: number;
};

export const HighLow: React.FC<HighLowProps> = ({ gameState, onGameEnd, removeBalance }) => {
    const [bet, setBet] = useState(100);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentCard, setCurrentCard] = useState<Card | null>(null);
    const [nextCard, setNextCard] = useState<Card | null>(null);
    const [multiplier, setMultiplier] = useState(1.0);
    const [streak, setStreak] = useState(0);
    const [message, setMessage] = useState<string | null>(null);

    const generateCard = (): Card => {
        const suits: ('H' | 'D' | 'C' | 'S')[] = ['H', 'D', 'C', 'S'];
        const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
        const suit = suits[Math.floor(Math.random() * suits.length)];
        const value = values[Math.floor(Math.random() * values.length)];
        let rank = parseInt(value);
        if (value === 'J') rank = 11;
        if (value === 'Q') rank = 12;
        if (value === 'K') rank = 13;
        if (value === 'A') rank = 14;
        return { suit, value, rank };
    };

    const startGame = () => {
        if (gameState.balance < bet) return;
        removeBalance(bet);
        setIsPlaying(true);
        setCurrentCard(generateCard());
        setNextCard(null);
        setMultiplier(1.0);
        setStreak(0);
        setMessage(null);
    };

    const cashOut = () => {
        if (!isPlaying) return;
        const win = Math.floor(bet * multiplier);
        onGameEnd(win);
        setIsPlaying(false);
        setMessage(`Cashed out $${win.toLocaleString()}!`);
    };

    const guess = (direction: 'higher' | 'lower') => {
        if (!currentCard) return;

        const newCard = generateCard();
        setNextCard(newCard);

        let won = false;
        let tie = false;

        if (newCard.rank === currentCard.rank) {
            tie = true;
        } else if (direction === 'higher' && newCard.rank > currentCard.rank) {
            won = true;
        } else if (direction === 'lower' && newCard.rank < currentCard.rank) {
            won = true;
        }

        setTimeout(() => {
            if (tie) {
                // House wins on tie to maintain edge
                setIsPlaying(false);
                setMessage("Tie! House wins.");
            } else if (won) {
                // Calculate Multiplier Logic
                // Probability of Higher = (14 - currentRank) / 13
                // Probability of Lower = (currentRank - 2) / 13
                // We use a simplified multiplier curve for gameplay feel
                let riskFactor = 1.0;
                
                if (direction === 'higher') {
                    // Harder to guess higher if card is already high
                    riskFactor = 1 + (currentCard.rank / 14); 
                } else {
                    // Harder to guess lower if card is already low
                    riskFactor = 1 + ((14 - currentCard.rank) / 14);
                }

                // Base multiplier step * risk
                const increase = 0.2 * riskFactor;
                const nextMult = multiplier + increase;

                setMultiplier(nextMult);
                setCurrentCard(newCard);
                setNextCard(null);
                setStreak(streak + 1);
            } else {
                setIsPlaying(false);
                setMessage("Wrong! You lost.");
            }
        }, 1000);
    };

    const renderCard = (card: Card | null, hidden: boolean = false) => {
        if (!card && !hidden) return <div className="w-32 h-48 bg-slate-800 rounded-xl border-2 border-slate-700 border-dashed flex items-center justify-center text-slate-600 font-bold">?</div>;
        
        if (hidden) return (
            <div className="w-32 h-48 bg-red-900 border-4 border-white rounded-xl shadow-xl flex items-center justify-center">
                 <div className="w-20 h-32 border-2 border-red-800 bg-red-950 opacity-50"></div>
            </div>
        );
        
        const isRed = card!.suit === 'H' || card!.suit === 'D';
        return (
            <div className="w-32 h-48 bg-white rounded-xl shadow-2xl flex flex-col items-center justify-between p-4 animate-in zoom-in duration-300">
                <div className={`text-2xl font-black self-start ${isRed ? 'text-red-600' : 'text-black'}`}>{card!.value}</div>
                <div className={`text-5xl ${isRed ? 'text-red-600' : 'text-black'}`}>
                    {card!.suit === 'H' && '♥'}
                    {card!.suit === 'D' && '♦'}
                    {card!.suit === 'C' && '♣'}
                    {card!.suit === 'S' && '♠'}
                </div>
                <div className={`text-2xl font-black self-end ${isRed ? 'text-red-600' : 'text-black'}`}>{card!.value}</div>
            </div>
        )
    };

    return (
        <div className="max-w-2xl mx-auto py-12 px-4 flex flex-col items-center">
            <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-blue-400 to-indigo-600 mb-8">
                HIGH LOW
            </h2>

            <div className="w-full bg-slate-900 border-4 border-slate-800 rounded-3xl p-8 relative overflow-hidden shadow-2xl">
                {/* Stats Overlay */}
                <div className="flex justify-between items-start mb-8">
                     <div className="bg-black/40 px-4 py-2 rounded-lg border border-slate-700">
                         <div className="text-xs text-slate-500 uppercase font-bold">Streak</div>
                         <div className="text-xl font-mono text-white">{streak}</div>
                     </div>
                     <div className="text-right">
                        <div className="text-xs text-slate-500 uppercase font-bold">Current Payout</div>
                        <div className="text-3xl font-mono font-bold text-green-400">
                            ${Math.floor(bet * multiplier).toLocaleString()} 
                            <span className="text-sm text-slate-400 ml-1">(x{multiplier.toFixed(2)})</span>
                        </div>
                    </div>
                </div>

                <div className="flex justify-center gap-8 mb-12 min-h-[220px]">
                     <div className="flex flex-col items-center gap-2">
                         {renderCard(currentCard)}
                         <span className="text-xs font-bold text-slate-500 uppercase">Current</span>
                     </div>
                     <div className="flex flex-col items-center gap-2">
                         {renderCard(nextCard, isPlaying && !nextCard)}
                         <span className="text-xs font-bold text-slate-500 uppercase">Next</span>
                     </div>
                </div>
                
                {message && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center z-20">
                         <div className={`py-4 font-black text-2xl border-y-4 shadow-2xl animate-in zoom-in backdrop-blur-md ${message.includes('lost') ? 'bg-red-900/90 border-red-500 text-white' : 'bg-green-900/90 border-green-500 text-white'}`}>
                             {message}
                         </div>
                    </div>
                )}

                {!isPlaying ? (
                    <div className="flex flex-col gap-4 max-w-sm mx-auto">
                         <div className="flex items-center gap-2 bg-black/50 p-2 rounded-xl border border-slate-700">
                             <span className="text-slate-400 font-bold px-2">$</span>
                             <input 
                                type="number" 
                                value={bet} 
                                onChange={e => setBet(Math.max(0, parseInt(e.target.value) || 0))}
                                className="bg-transparent w-full text-white font-mono font-bold outline-none"
                             />
                             <button onClick={() => setBet(bet * 2)} className="px-3 py-1 bg-slate-800 text-xs font-bold rounded hover:bg-slate-700">x2</button>
                             <button onClick={() => setBet(gameState.balance)} className="px-3 py-1 bg-yellow-600/20 text-yellow-500 text-xs font-bold rounded hover:bg-yellow-600/40">MAX</button>
                         </div>
                         <button 
                            onClick={startGame}
                            disabled={gameState.balance < bet || bet <= 0}
                            className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black rounded-xl shadow-lg transition-all"
                         >
                             DEAL CARDS
                         </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-4">
                        <button 
                            onClick={() => guess('higher')}
                            disabled={!!nextCard}
                            className="py-6 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-black rounded-xl flex flex-col items-center gap-1 transition-all active:scale-95 shadow-lg border-b-4 border-green-800 active:border-b-0 active:translate-y-1"
                        >
                            <ArrowUp size={32} /> HIGHER
                        </button>
                        <button 
                            onClick={() => guess('lower')}
                            disabled={!!nextCard}
                            className="py-6 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-black rounded-xl flex flex-col items-center gap-1 transition-all active:scale-95 shadow-lg border-b-4 border-red-800 active:border-b-0 active:translate-y-1"
                        >
                            <ArrowDown size={32} /> LOWER
                        </button>
                        <button 
                            onClick={cashOut}
                            disabled={streak === 0 || !!nextCard}
                            className="col-span-2 py-4 bg-yellow-600 hover:bg-yellow-500 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg transition-all"
                        >
                            CASH OUT (${Math.floor(bet * multiplier).toLocaleString()})
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};