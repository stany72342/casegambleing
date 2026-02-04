import React, { useState, useEffect } from 'react';
import { GameState } from '../types';
import { Brain, Play, HelpCircle, Check, X } from 'lucide-react';

interface MemoryProps {
  gameState: GameState;
  addBalance: (amount: number) => void;
  removeBalance: (amount: number) => void;
}

const ICONS = ['Zap', 'Heart', 'Star', 'Moon', 'Sun', 'Cloud', 'Umbrella', 'Anchor'];

export const Memory: React.FC<MemoryProps> = ({ gameState, addBalance, removeBalance }) => {
  const [cards, setCards] = useState<{id: number, icon: string, flipped: boolean, solved: boolean}[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [moves, setMoves] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);

  const ENTRY_FEE = 100;

  const initGame = () => {
      if (gameState.balance < ENTRY_FEE) {
          alert("Not enough funds!");
          return;
      }
      removeBalance(ENTRY_FEE);
      
      const pairs = [...ICONS, ...ICONS];
      const shuffled = pairs.sort(() => Math.random() - 0.5).map((icon, id) => ({
          id, icon, flipped: false, solved: false
      }));
      
      setCards(shuffled);
      setFlippedIndices([]);
      setMoves(0);
      setIsPlaying(true);
      setGameOver(false);
      setWon(false);
  };

  const handleCardClick = (index: number) => {
      if (!isPlaying || gameOver || cards[index].flipped || cards[index].solved || flippedIndices.length >= 2) return;

      const newCards = [...cards];
      newCards[index].flipped = true;
      setCards(newCards);
      
      const newFlipped = [...flippedIndices, index];
      setFlippedIndices(newFlipped);

      if (newFlipped.length === 2) {
          setMoves(m => m + 1);
          const [first, second] = newFlipped;
          
          if (cards[first].icon === cards[second].icon) {
              // Match
              setTimeout(() => {
                  newCards[first].solved = true;
                  newCards[second].solved = true;
                  setCards([...newCards]);
                  setFlippedIndices([]);
                  
                  if (newCards.every(c => c.solved)) {
                      endGame(true, moves + 1);
                  }
              }, 500);
          } else {
              // No match
              setTimeout(() => {
                  newCards[first].flipped = false;
                  newCards[second].flipped = false;
                  setCards([...newCards]);
                  setFlippedIndices([]);
              }, 1000);
          }
      }
  };

  const endGame = (success: boolean, finalMoves: number) => {
      setGameOver(true);
      setIsPlaying(false);
      setWon(success);
      
      let reward = 0;
      if (success) {
          if (finalMoves <= 16) reward = 200; // Perfect/Lucky
          else if (finalMoves <= 24) reward = 100; // Break even
          else reward = 0; // Loss due to inefficiency
      }
      
      if (reward > 0) addBalance(reward);
  };

  return (
    <div className="flex flex-col items-center py-12">
        <h2 className="text-4xl font-black text-blue-400 mb-2">MEMORY MATCH</h2>
        <div className="text-slate-400 text-sm mb-8 flex gap-4">
            <span>Entry: <b className="text-white">${ENTRY_FEE}</b></span>
            <span>Reward: <b className="text-green-400">Up to $200</b></span>
        </div>

        <div className="relative bg-slate-900 border-4 border-slate-800 rounded-3xl p-8 shadow-2xl">
            
            <div className="flex justify-between mb-6 px-2 text-white font-bold">
                <div>Moves: {moves}</div>
                <div className="text-slate-400 text-xs text-right">
                    Target: &lt;16 (2x)<br/>Safe: &lt;24 (1x)
                </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
                {cards.map((card, i) => (
                    <button
                        key={i}
                        onClick={() => handleCardClick(i)}
                        disabled={!isPlaying}
                        className={`
                            w-16 h-16 rounded-xl flex items-center justify-center text-2xl transition-all duration-300 transform perspective-1000
                            ${card.flipped || card.solved 
                                ? (card.solved ? 'bg-green-600 rotate-y-180' : 'bg-blue-600 rotate-y-180') 
                                : 'bg-slate-700 hover:bg-slate-600'}
                        `}
                    >
                        {(card.flipped || card.solved) ? (
                            // Placeholder for dynamic icon mapping since we don't have lucide icons imported by name string easily here without a map
                            // For simplicity in this demo, using text first letter
                            <span className="font-black text-white">{card.icon[0]}</span>
                        ) : (
                            <HelpCircle size={24} className="text-slate-500" />
                        )}
                    </button>
                ))}
                {cards.length === 0 && (
                    <div className="col-span-4 h-64 flex items-center justify-center text-slate-500">
                        Press Start
                    </div>
                )}
            </div>

            {!isPlaying && (
                <div className="absolute inset-0 bg-black/80 rounded-3xl flex flex-col items-center justify-center backdrop-blur-sm animate-in fade-in">
                    {gameOver && (
                        <div className="mb-6 text-center">
                            <h3 className="text-2xl font-bold text-white mb-1">{won ? 'CLEARED!' : 'GAME OVER'}</h3>
                            <p className="text-slate-400">Moves: {moves}</p>
                            <div className="text-green-400 font-mono font-bold text-xl">
                                {moves <= 16 ? '+$200 (Perfect!)' : moves <= 24 ? '+$100 (Safe)' : '$0 (Too Slow)'}
                            </div>
                        </div>
                    )}
                    <button 
                        onClick={initGame}
                        className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl text-xl flex items-center gap-2 shadow-lg hover:scale-105 transition-transform"
                    >
                        <Play size={24} /> PLAY (${ENTRY_FEE})
                    </button>
                </div>
            )}
        </div>
    </div>
  );
};