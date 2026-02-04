import React from 'react';
import { GameState } from '../types';
import { Trophy, Medal, User } from 'lucide-react';

interface LeaderboardProps {
  gameState: GameState;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ gameState }) => {
  
  // Calculate dynamic stats for all users in the database
  const allPlayers = Object.values(gameState.userDatabase).map(user => {
      // Calculate inventory value roughly (some users might not have full inventory loaded in memory if strictly typed, 
      // but for this state structure, userDatabase contains inventory arrays)
      const inventoryValue = (user.inventory || []).reduce((acc, item) => acc + item.value, 0);
      const totalNetWorth = user.balance + inventoryValue;
      
      return {
          name: user.username,
          value: totalNetWorth,
          level: user.level,
          isMe: user.username === gameState.username,
          role: user.role
      };
  }).sort((a, b) => b.value - a.value).slice(0, 50); // Top 50

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="text-center mb-10">
            <h2 className="text-4xl font-black text-white mb-4 flex items-center justify-center gap-3">
                <Trophy className="text-yellow-400" size={40} />
                GLOBAL RANKINGS
            </h2>
            <p className="text-slate-400">Top 50 wealthiest players in the network.</p>
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
                        <div className="flex flex-col">
                            <span className={`font-bold flex items-center gap-2 ${player.isMe ? 'text-yellow-400' : 'text-white'}`}>
                                {player.name} {player.isMe && '(You)'}
                                {player.role === 'ADMIN' || player.role === 'OWNER' ? <span className="text-[10px] bg-red-600 text-white px-1 rounded">STAFF</span> : null}
                            </span>
                        </div>
                    </div>

                    <div className="col-span-2 text-center font-mono text-slate-400">
                        {player.level}
                    </div>

                    <div className="col-span-2 text-right font-mono font-bold text-green-400">
                        ${player.value.toLocaleString()}
                    </div>
                </div>
            ))}
            
            {allPlayers.length === 0 && (
                <div className="p-8 text-center text-slate-500">
                    No rankings available yet.
                </div>
            )}
        </div>
    </div>
  );
};