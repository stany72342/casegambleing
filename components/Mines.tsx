import React, { useState } from 'react';
import { GameState } from '../types';
import { Bomb, Gem, Coins } from 'lucide-react';

interface MinesProps {
  gameState: GameState;
  onGameEnd: (winAmount: number) => void;
  removeBalance: (amount: number) => void;
}

export const Mines: React.FC<MinesProps> = ({ gameState, onGameEnd, removeBalance }) => {
  const [mineCount, setMineCount] = useState(3);
  const [betAmount, setBetAmount] = useState(100);
  const [isPlaying, setIsPlaying] = useState(false);
  const [grid, setGrid] = useState<boolean[]>(Array(25).fill(false)); // true = mine
  const [revealed, setRevealed] = useState<boolean[]>(Array(25).fill(false));
  const [gameOver, setGameOver] = useState(false);
  const [explodedIndex, setExplodedIndex] = useState<number | null>(null);
  const [currentMultiplier, setCurrentMultiplier] = useState(1);

  // Calculate Next Multiplier
  const getNextMultiplier = (currentRevealedCount: number) => {
      // Logic: (25 / (25 - mines - currentRevealed)) * HouseEdge
      // Simplified increasing curve
      const safeTiles = 25 - mineCount;
      const remainingSafe = safeTiles - currentRevealedCount;
      if (remainingSafe <= 0) return currentMultiplier;
      
      const probability = remainingSafe / (25 - currentRevealedCount);
      const fairMult = 1 / probability;
      const houseEdge = 1 - (gameState.config.gameSettings.minesHouseEdge || 0.05);
      return currentMultiplier * fairMult * houseEdge;
  };

  const startGame = () => {
      if (gameState.balance < betAmount) return;
      
      removeBalance(betAmount);
      setIsPlaying(true);
      setGameOver(false);
      setExplodedIndex(null);
      setRevealed(Array(25).fill(false));
      setCurrentMultiplier(1);

      // Generate Mines
      const newGrid = Array(25).fill(false);
      let placed = 0;
      while (placed < mineCount) {
          const idx = Math.floor(Math.random() * 25);
          if (!newGrid[idx]) {
              newGrid[idx] = true;
              placed++;
          }
      }
      setGrid(newGrid);
  };

  const handleTileClick = (index: number) => {
      if (!isPlaying || gameOver || revealed[index]) return;

      const newRevealed = [...revealed];
      newRevealed[index] = true;
      setRevealed(newRevealed);

      if (grid[index]) {
          // Boom
          setGameOver(true);
          setExplodedIndex(index);
          setIsPlaying(false);
          // Reveal all mines
          setRevealed(Array(25).fill(true));
      } else {
          // Safe
          const revealedCount = newRevealed.filter((r, i) => r && !grid[i]).length;
          const nextMult = getNextMultiplier(revealedCount - 1); // Previous count for math step
          setCurrentMultiplier(nextMult);
      }
  };

  const cashOut = () => {
      if (!isPlaying || gameOver) return;
      const win = Math.floor(betAmount * currentMultiplier);
      onGameEnd(win);
      setIsPlaying(false);
      setGameOver(true); // End visual state
      setRevealed(Array(25).fill(true)); // Show full board
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 flex flex-col items-center">
        <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-purple-400 to-pink-600 mb-8">
            MINESWEEPER
        </h2>

        <div className="flex flex-col md:flex-row gap-8 w-full">
            {/* Controls */}
            <div className="md:w-1/3 bg-slate-900 p-6 rounded-2xl border border-slate-800 flex flex-col gap-6">
                <div>
                    <label className="text-slate-400 font-bold text-xs uppercase mb-2 block">Bet Amount</label>
                    <div className="flex gap-2">
                        <input 
                            type="number" 
                            value={betAmount} 
                            onChange={(e) => setBetAmount(parseInt(e.target.value) || 0)}
                            disabled={isPlaying}
                            className="w-full bg-black border border-slate-700 rounded p-3 text-white font-mono font-bold"
                        />
                    </div>
                </div>

                <div>
                    <label className="text-slate-400 font-bold text-xs uppercase mb-2 block">Mines (1-24)</label>
                    <input 
                        type="range" 
                        min="1" 
                        max="24" 
                        value={mineCount} 
                        onChange={(e) => setMineCount(parseInt(e.target.value))}
                        disabled={isPlaying}
                        className="w-full accent-purple-500"
                    />
                    <div className="text-right text-purple-400 font-bold">{mineCount} Mines</div>
                </div>

                {!isPlaying ? (
                    <button 
                        onClick={startGame}
                        disabled={gameState.balance < betAmount}
                        className="w-full py-4 bg-purple-600 hover:bg-purple-500 text-white font-black rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        START GAME
                    </button>
                ) : (
                    <button 
                        onClick={cashOut}
                        className="w-full py-4 bg-green-600 hover:bg-green-500 text-white font-black rounded-xl shadow-lg transition-all active:scale-95 flex flex-col items-center leading-tight"
                    >
                        <span>CASH OUT</span>
                        <span className="text-xs opacity-80">${Math.floor(betAmount * currentMultiplier).toLocaleString()}</span>
                    </button>
                )}

                <div className="text-center mt-4">
                    <div className="text-slate-500 text-xs uppercase font-bold">Current Multiplier</div>
                    <div className="text-3xl font-mono font-bold text-white">x{currentMultiplier.toFixed(2)}</div>
                </div>
            </div>

            {/* Grid */}
            <div className="md:w-2/3 bg-slate-900 p-6 rounded-2xl border border-slate-800 grid grid-cols-5 gap-3 aspect-square">
                {Array.from({ length: 25 }).map((_, i) => (
                    <button
                        key={i}
                        onClick={() => handleTileClick(i)}
                        disabled={!isPlaying || (revealed[i] && !gameOver)}
                        className={`
                            rounded-xl flex items-center justify-center transition-all duration-300 relative overflow-hidden
                            ${revealed[i] 
                                ? (grid[i] ? 'bg-red-900/50 border-red-500 border-2' : 'bg-slate-800 border-green-500/50 border-2') 
                                : 'bg-slate-800 hover:bg-slate-700 border-slate-700 border-b-4 active:border-b-0 active:translate-y-1'}
                        `}
                    >
                        {revealed[i] ? (
                            grid[i] ? (
                                <Bomb size={32} className={`text-red-500 ${explodedIndex === i ? 'animate-bounce' : ''}`} />
                            ) : (
                                <Gem size={32} className="text-green-400 animate-in zoom-in duration-300" />
                            )
                        ) : (
                            <div className="w-full h-full"></div>
                        )}
                    </button>
                ))}
            </div>
        </div>
    </div>
  );
};