import React from 'react';
import { GameState } from '../types';
import { Trophy, Medal, User } from 'lucide-react';

interface LeaderboardProps {
  gameState: GameState;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ gameState }) => {
  
  // Calculate user total value
  const userValue = gameState.inventory.reduce((acc, i) => acc + i.value, 0) + gameState.balance;

  // Static list of "real" top players (simulated, but not auction bots)
  const topPlayers = [
      { name: "NinjaSlayer99", value: 15400000, level: 42, isMe: false },
      { name: "KaiCenatFan", value: 12000000, level: 38, isMe: false },
      { name: "CaseOpenerPro", value: 8500000, level: 35, isMe: false },
      { name: "RNG_God", value: 5000000, level: 29, isMe: false },
      { name: "LuckyStrike", value: 2100000, level: 20, isMe: false },
  ];

  // Insert current user into the list and sort
  const allPlayers = [
      ...topPlayers,
      { name: gameState.username || "You", value: userValue, level: gameState.level, isMe: true }
  ].sort((a, b) => b.value - a.value);

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="text-center mb-10">
            <h2 className="text-4xl font-black text-white mb-4 flex items-center justify-center gap-3">
                <Trophy className="text-yellow-400" size={40} />
                GLOBAL RANKINGS
            </h2>
            <p className="text-slate-400">Compete against the world's best collectors.</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
            <div className="grid grid-cols-12 bg-slate-950 p-4 font-bold text-slate-500 text-xs uppercase tracking-wider">
                <div className="col-span-1 text-center">Rank</div>
                <div className="col-span-7">Player</div>
                <div className="col-span-2 text-center">Level</div>
                <div className="col-span-2 text-right">Net Worth</div>
            </div>

            {allPlayers.map((player, index) => (
                <div 
                    key={index}
                    className={`
                        grid grid-cols-12 p-4 items-center border-b border-slate-800 transition-colors
                        ${player.isMe ? 'bg-yellow-500/10 border-l-4 border-l-yellow-500' : 'hover:bg-slate-800'}
                    `}
                >
                    <div className="col-span-1 flex justify-center">
                        {index === 0 && <Medal className="text-yellow-400" />}
                        {index === 1 && <Medal className="text-slate-300" />}
                        {index === 2 && <Medal className="text-orange-400" />}
                        {index > 2 && <span className="font-mono text-slate-500 font-bold">#{index + 1}</span>}
                    </div>
                    
                    <div className="col-span-7 flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${player.isMe ? 'bg-yellow-500 text-black' : 'bg-slate-700 text-slate-300'}`}>
                            <User size={16} />
                        </div>
                        <span className={`font-bold ${player.isMe ? 'text-yellow-400' : 'text-white'}`}>
                            {player.name} {player.isMe && '(You)'}
                        </span>
                    </div>

                    <div className="col-span-2 text-center font-mono text-slate-400">
                        {player.level}
                    </div>

                    <div className="col-span-2 text-right font-mono font-bold text-green-400">
                        ${player.value.toLocaleString()}
                    </div>
                </div>
            ))}
        </div>
    </div>
  );
};