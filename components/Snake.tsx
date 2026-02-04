import React, { useState, useEffect, useRef } from 'react';
import { RefreshCw, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Play, DollarSign } from 'lucide-react';
import { GameState } from '../types';

interface SnakeProps {
  gameState: GameState;
  addBalance: (amount: number) => void;
  removeBalance: (amount: number) => void;
}

export const Snake: React.FC<SnakeProps> = ({ gameState, addBalance, removeBalance }) => {
  const CANVAS_SIZE = 400;
  const GRID_SIZE = 20;
  const CELL_SIZE = CANVAS_SIZE / GRID_SIZE;
  const ENTRY_FEE = 50;
  const APPLE_REWARD = 15;
  
  const [snake, setSnake] = useState<{x: number, y: number}[]>([]);
  const [food, setFood] = useState<{x: number, y: number}>({x: 15, y: 15});
  const [direction, setDirection] = useState<{x: number, y: number}>({x: 0, y: 0});
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [earnings, setEarnings] = useState(0);
  const [highScore, setHighScore] = useState(parseInt(localStorage.getItem('snake_highscore') || '0'));
  const [gameOver, setGameOver] = useState(false);
  
  const gameLoopRef = useRef<any>(null);

  // Helper to generate snake of length 5
  const createInitialSnake = () => {
      const startX = 10;
      const startY = 10;
      const initialSnake = [];
      for (let i = 0; i < 5; i++) {
          initialSnake.push({ x: startX, y: startY + i }); // Vertical initial snake
      }
      return initialSnake;
  }

  const spawnFood = () => {
      const x = Math.floor(Math.random() * GRID_SIZE);
      const y = Math.floor(Math.random() * GRID_SIZE);
      setFood({x, y});
  };

  const startGame = () => {
      if (gameState.balance < ENTRY_FEE) {
          alert("Not enough funds!");
          return;
      }
      removeBalance(ENTRY_FEE);
      
      setSnake(createInitialSnake());
      setDirection({x: 0, y: -1}); // Moving UP initially
      setScore(0);
      setEarnings(0);
      setGameOver(false);
      setIsPlaying(true);
      spawnFood();
  };

  useEffect(() => {
      if (isPlaying) {
          gameLoopRef.current = setInterval(gameLoop, 100);
      } else {
          clearInterval(gameLoopRef.current);
      }
      return () => clearInterval(gameLoopRef.current);
  }, [isPlaying, snake, direction]);

  useEffect(() => {
      const handleKey = (e: KeyboardEvent) => {
          if (!isPlaying) return;
          switch(e.key) {
              case 'ArrowUp': if (direction.y !== 1) setDirection({x: 0, y: -1}); break;
              case 'ArrowDown': if (direction.y !== -1) setDirection({x: 0, y: 1}); break;
              case 'ArrowLeft': if (direction.x !== 1) setDirection({x: -1, y: 0}); break;
              case 'ArrowRight': if (direction.x !== -1) setDirection({x: 1, y: 0}); break;
          }
      };
      window.addEventListener('keydown', handleKey);
      return () => window.removeEventListener('keydown', handleKey);
  }, [isPlaying, direction]);

  const gameLoop = () => {
      const head = { ...snake[0] };
      head.x += direction.x;
      head.y += direction.y;

      // Wall collision
      if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
          endGame();
          return;
      }

      // Self collision
      if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
          endGame();
          return;
      }

      const newSnake = [head, ...snake];

      // Eat food
      if (head.x === food.x && head.y === food.y) {
          addBalance(APPLE_REWARD); // Instant Reward
          setEarnings(e => e + APPLE_REWARD);
          
          setScore(s => {
              const newScore = s + 1;
              if (newScore > highScore) {
                  setHighScore(newScore);
                  localStorage.setItem('snake_highscore', newScore.toString());
              }
              return newScore;
          });
          spawnFood();
      } else {
          newSnake.pop();
      }

      setSnake(newSnake);
  };

  const endGame = () => {
      setIsPlaying(false);
      setGameOver(true);
  };

  return (
    <div className="flex flex-col items-center py-12">
        <h2 className="text-4xl font-black text-green-400 mb-2">RETRO SNAKE</h2>
        <div className="text-slate-400 text-sm mb-8 flex gap-4">
            <span>Entry: <b className="text-white">${ENTRY_FEE}</b></span>
            <span>Reward: <b className="text-green-400">${APPLE_REWARD}/apple</b></span>
        </div>
        
        <div className="relative bg-slate-900 border-4 border-slate-700 rounded-xl p-1 shadow-2xl">
            {/* Grid */}
            <div 
                className="relative bg-black" 
                style={{ width: CANVAS_SIZE, height: CANVAS_SIZE, display: 'grid', gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}
            >
                {/* Render Snake */}
                {snake.map((segment, i) => (
                    <div 
                        key={i}
                        className="bg-green-500 border border-green-600 rounded-sm absolute"
                        style={{ 
                            left: segment.x * CELL_SIZE, 
                            top: segment.y * CELL_SIZE, 
                            width: CELL_SIZE, 
                            height: CELL_SIZE 
                        }}
                    ></div>
                ))}
                
                {/* Render Food */}
                <div 
                    className="bg-red-500 rounded-full absolute animate-pulse shadow-[0_0_10px_red]"
                    style={{ 
                        left: food.x * CELL_SIZE, 
                        top: food.y * CELL_SIZE, 
                        width: CELL_SIZE, 
                        height: CELL_SIZE 
                    }}
                ></div>

                {/* Overlays */}
                {!isPlaying && !gameOver && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                        <button onClick={startGame} className="px-8 py-4 bg-green-600 hover:bg-green-500 text-white font-black rounded-xl text-xl flex items-center gap-2">
                            <Play size={24} /> START (${ENTRY_FEE})
                        </button>
                    </div>
                )}

                {gameOver && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-900/80 backdrop-blur-sm animate-in fade-in">
                        <h3 className="text-4xl font-black text-white mb-2">GAME OVER</h3>
                        <p className="text-xl text-white mb-1">Score: {score}</p>
                        <p className="text-lg text-green-300 mb-6 font-bold">Earned: ${earnings}</p>
                        <button onClick={startGame} className="px-8 py-4 bg-white text-red-900 font-black rounded-xl text-xl flex items-center gap-2 hover:scale-105 transition-transform">
                            <RefreshCw size={24} /> TRY AGAIN (${ENTRY_FEE})
                        </button>
                    </div>
                )}
            </div>
        </div>

        {/* Stats */}
        <div className="flex gap-8 mt-8">
            <div className="bg-slate-800 px-6 py-3 rounded-xl border border-slate-700">
                <div className="text-xs font-bold text-slate-500 uppercase">Current Run</div>
                <div className="text-3xl font-mono font-bold text-green-400">+${earnings}</div>
            </div>
            <div className="bg-slate-800 px-6 py-3 rounded-xl border border-slate-700">
                <div className="text-xs font-bold text-slate-500 uppercase">High Score</div>
                <div className="text-3xl font-mono font-bold text-yellow-400">{highScore}</div>
            </div>
        </div>

        {/* Controls Hint */}
        <div className="mt-8 text-slate-500 flex gap-4 text-sm">
            <div className="flex flex-col items-center gap-1">
                <div className="w-8 h-8 border border-slate-600 rounded flex items-center justify-center"><ArrowUp size={16} /></div>
                <span className="text-[10px]">UP</span>
            </div>
            <div className="flex gap-1 items-end">
                <div className="flex flex-col items-center gap-1">
                    <div className="w-8 h-8 border border-slate-600 rounded flex items-center justify-center"><ArrowLeft size={16} /></div>
                    <span className="text-[10px]">LEFT</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                    <div className="w-8 h-8 border border-slate-600 rounded flex items-center justify-center"><ArrowDown size={16} /></div>
                    <span className="text-[10px]">DOWN</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                    <div className="w-8 h-8 border border-slate-600 rounded flex items-center justify-center"><ArrowRight size={16} /></div>
                    <span className="text-[10px]">RIGHT</span>
                </div>
            </div>
        </div>
    </div>
  );
};