import React, { useState, useRef, useEffect } from 'react';
import { GameState } from '../types';
import { Play } from 'lucide-react';

interface PlinkoProps {
  gameState: GameState;
  onWin: (amount: number) => void;
  removeBalance: (amount: number) => void;
}

export const Plinko: React.FC<PlinkoProps> = ({ gameState, onWin, removeBalance }) => {
  const [bet, setBet] = useState(100);
  const [ballHistory, setBallHistory] = useState<{ id: number, multiplier: number, path: number[] }[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<any>(null);

  // Constants
  const ROWS = 16;
  const PEGS_START = 3; // Top row has 3 pegs
  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 600;
  
  // Multipliers for 16 rows (High Risk)
  const MULTIPLIERS = [110, 41, 10, 5, 3, 1.5, 1, 0.5, 0.3, 0.5, 1, 1.5, 3, 5, 10, 41, 110];
  const COLORS = [
      '#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e', '#3b82f6', '#6366f1', '#a855f7', '#ec4899', 
      '#a855f7', '#6366f1', '#3b82f6', '#22c55e', '#84cc16', '#eab308', '#f97316', '#ef4444'
  ];

  const dropBall = () => {
      if (gameState.balance < bet || bet <= 0) return;
      removeBalance(bet);

      // Determine outcome based on probabilities (Bell curve)
      // We simulate left/right bounces for each row
      let position = 0; // Center is 0 relative to row width
      const path: number[] = [];
      
      // Simulate bounces (0 = Left, 1 = Right)
      // Since it's a pyramid, path.length = ROWS
      for(let i=0; i<ROWS; i++) {
          const bounce = Math.random() > 0.5 ? 1 : 0;
          path.push(bounce);
          position += bounce; 
      }
      
      const multiplierIndex = position; // 0 to 16
      const win = Math.floor(bet * MULTIPLIERS[multiplierIndex]);
      
      // Visual only state for history (could be used for drawing, but we'll use CSS for simplicity)
      setBallHistory(prev => [{ id: Date.now(), multiplier: MULTIPLIERS[multiplierIndex], path }, ...prev].slice(0, 5));
      
      // Animate locally (fake physics)
      animateBall(path, win);
  };

  const animateBall = (path: number[], winAmount: number) => {
      const ball = document.createElement('div');
      ball.className = "absolute w-4 h-4 bg-yellow-400 rounded-full shadow-[0_0_10px_orange] z-20 pointer-events-none";
      ball.style.top = '20px';
      ball.style.left = '50%';
      ball.style.transform = 'translate(-50%, 0)';
      
      const container = document.getElementById('plinko-board');
      if(container) container.appendChild(ball);

      // Simple keyframe animation generator
      // We start at top center.
      // Each step moves down Y and shifts X based on path.
      
      let step = 0;
      let xOffset = 0;
      const stepY = (550) / ROWS; // Height / rows
      const stepX = 22; // Horizontal spread

      const interval = setInterval(() => {
          if (step >= ROWS) {
              clearInterval(interval);
              if(container && ball.parentNode === container) container.removeChild(ball);
              onWin(winAmount);
              return;
          }

          const direction = path[step] === 0 ? -1 : 1;
          xOffset += direction * (stepX / 2 + (Math.random() * 5)); // Add jitter
          
          ball.style.top = `${20 + ((step + 1) * stepY)}px`;
          ball.style.left = `calc(50% + ${xOffset}px)`;
          
          step++;
      }, 50); // Speed
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 flex flex-col items-center">
        <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-pink-400 to-purple-600 mb-8">
            PLINKO
        </h2>

        <div className="flex flex-col md:flex-row gap-8 w-full">
            {/* Controls */}
            <div className="md:w-1/3 bg-slate-900 p-6 rounded-2xl border border-slate-800 flex flex-col gap-6 h-min">
                <div>
                    <label className="text-slate-400 font-bold text-xs uppercase mb-2 block">Bet Amount</label>
                    <div className="flex gap-2 bg-black border border-slate-700 rounded p-3">
                        <span className="text-yellow-500 font-bold">$</span>
                        <input 
                            type="number" 
                            value={bet} 
                            onChange={(e) => setBet(Math.max(0, parseInt(e.target.value) || 0))}
                            className="bg-transparent w-full text-white font-mono font-bold outline-none"
                        />
                    </div>
                    <div className="flex gap-2 mt-2">
                        <button onClick={() => setBet(Math.max(10, bet / 2))} className="flex-1 bg-slate-800 text-xs font-bold py-1 rounded text-white">1/2</button>
                        <button onClick={() => setBet(bet * 2)} className="flex-1 bg-slate-800 text-xs font-bold py-1 rounded text-white">x2</button>
                        <button onClick={() => setBet(gameState.balance)} className="flex-1 bg-yellow-900/40 text-yellow-500 text-xs font-bold py-1 rounded">MAX</button>
                    </div>
                </div>

                <button 
                    onClick={dropBall}
                    disabled={gameState.balance < bet || bet <= 0}
                    className="w-full py-4 bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black rounded-xl shadow-lg transition-all active:scale-95"
                >
                    DROP BALL
                </button>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 max-h-40 overflow-y-auto">
                    <div className="text-xs font-bold text-slate-500 uppercase mb-2">History</div>
                    {ballHistory.map(h => (
                        <div key={h.id} className="flex justify-between text-xs py-1 border-b border-slate-800 last:border-0">
                            <span className={h.multiplier >= 10 ? 'text-yellow-400 font-bold' : h.multiplier < 1 ? 'text-slate-500' : 'text-white'}>
                                {h.multiplier}x
                            </span>
                            <span className="text-slate-600 font-mono">
                                ${Math.floor(bet * h.multiplier).toLocaleString()}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Board */}
            <div className="md:w-2/3 bg-slate-900 rounded-2xl border border-slate-800 relative overflow-hidden flex flex-col items-center pt-8 pb-4 min-h-[600px]" id="plinko-board">
                {/* Pegs */}
                <div className="relative z-10 flex flex-col items-center gap-[22px]">
                    {Array.from({ length: ROWS }).map((_, row) => (
                        <div key={row} className="flex gap-[32px]">
                            {Array.from({ length: row + 3 }).map((_, col) => (
                                <div key={col} className="w-2 h-2 bg-white rounded-full opacity-50 shadow-[0_0_5px_white]"></div>
                            ))}
                        </div>
                    ))}
                </div>

                {/* Multipliers */}
                <div className="flex gap-2 mt-8 z-10 px-4 w-full justify-center">
                    {MULTIPLIERS.map((m, i) => (
                        <div 
                            key={i}
                            className="flex-1 h-8 rounded text-[9px] font-bold flex items-center justify-center text-black shadow-lg transform transition-transform hover:scale-110"
                            style={{ backgroundColor: COLORS[i] }}
                        >
                            {m}x
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
  );
};