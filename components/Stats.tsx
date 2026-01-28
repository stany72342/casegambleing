import React from 'react';
import { GameState } from '../types';
import { TrendingUp, TrendingDown, Diamond, Skull, Trophy, Ban } from 'lucide-react';

interface StatsProps {
  gameState: GameState;
  onRedeemCode: (code: string) => void;
}

export const Stats: React.FC<StatsProps> = ({ gameState, onRedeemCode }) => {
  const [promoInput, setPromoInput] = React.useState('');

  const profit = gameState.stats.totalItemValueObtained - gameState.stats.totalMoneySpent;
  const isProfitable = profit >= 0;

  // Calculate Luck Rating
  // Simple heuristic: Weighted rarities / Cases Opened
  // Baseline: 10 points per case is "Average"
  const luckScore = 
    (gameState.stats.legendariesPulled * 100) + 
    (gameState.stats.mythicsPulled * 500) + 
    (gameState.stats.contrabandsPulled * 2500);
  
  const averageLuck = gameState.stats.casesOpened > 0 ? luckScore / gameState.stats.casesOpened : 0;
  
  let luckGrade = "F";
  let luckColor = "text-slate-500";
  
  if (averageLuck > 50) { luckGrade = "S+"; luckColor = "text-yellow-400"; }
  else if (averageLuck > 20) { luckGrade = "A"; luckColor = "text-green-400"; }
  else if (averageLuck > 10) { luckGrade = "B"; luckColor = "text-blue-400"; }
  else if (averageLuck > 5) { luckGrade = "C"; luckColor = "text-slate-300"; }
  else if (averageLuck > 1) { luckGrade = "D"; luckColor = "text-slate-500"; }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h2 className="text-3xl font-black text-white mb-8 flex items-center gap-3">
         <TrendingUp className="text-blue-500" /> PLAYER STATISTICS
      </h2>

      {/* Main KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          
          {/* Profit/Loss */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group hover:border-slate-600 transition-all">
              <div className={`absolute right-0 top-0 p-4 opacity-10 ${isProfitable ? 'text-green-500' : 'text-red-500'}`}>
                  {isProfitable ? <TrendingUp size={100} /> : <TrendingDown size={100} />}
              </div>
              <h3 className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-2">Total Profit / Loss</h3>
              <div className={`text-4xl font-mono font-black ${isProfitable ? 'text-green-400' : 'text-red-500'}`}>
                 {isProfitable ? '+' : ''}${profit.toLocaleString()}
              </div>
              <div className="mt-4 flex gap-4 text-xs text-slate-500 font-mono">
                  <div>Spent: <span className="text-white">${gameState.stats.totalMoneySpent.toLocaleString()}</span></div>
                  <div>Gained: <span className="text-white">${gameState.stats.totalItemValueObtained.toLocaleString()}</span></div>
              </div>
          </div>

          {/* Luck Rating */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group hover:border-slate-600 transition-all">
               <div className="absolute right-0 top-0 p-4 opacity-10 text-yellow-500">
                  <Diamond size={100} />
              </div>
              <h3 className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-2">Luck Rating</h3>
              <div className={`text-6xl font-black ${luckColor}`}>
                  {luckGrade}
              </div>
              <div className="mt-2 text-slate-500 text-sm">
                  Based on drop rarity frequency
              </div>
          </div>
      </div>

      {/* High/Low Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800 flex items-center gap-4">
              <div className="p-3 bg-yellow-500/20 rounded-lg text-yellow-500">
                  <Trophy size={24} />
              </div>
              <div>
                  <div className="text-slate-500 text-xs font-bold uppercase">Best Pull</div>
                  <div className="text-white font-bold text-lg">{gameState.stats.bestDropName}</div>
                  <div className="text-green-400 font-mono text-sm">${gameState.stats.bestDropValue.toLocaleString()}</div>
              </div>
          </div>

           <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800 flex items-center gap-4">
              <div className="p-3 bg-red-500/20 rounded-lg text-red-500">
                  <Skull size={24} />
              </div>
              <div>
                  <div className="text-slate-500 text-xs font-bold uppercase">Worst Loss (Single Case)</div>
                  <div className="text-white font-bold text-lg">Bad Luck</div>
                  <div className="text-red-400 font-mono text-sm">-${gameState.stats.worstLossValue.toLocaleString()}</div>
              </div>
          </div>
      </div>

      {/* Rarity Grid */}
      <h3 className="text-slate-400 font-bold mb-4 uppercase tracking-wider text-sm">Legendary Tracker</h3>
      <div className="grid grid-cols-3 gap-4 mb-12">
          <div className="bg-slate-900 p-4 rounded-xl border border-yellow-900/30 text-center">
              <div className="text-yellow-500 font-black text-2xl">{gameState.stats.legendariesPulled}</div>
              <div className="text-yellow-500/50 text-xs font-bold uppercase mt-1">Legendaries</div>
          </div>
          <div className="bg-slate-900 p-4 rounded-xl border border-red-900/30 text-center">
              <div className="text-red-500 font-black text-2xl">{gameState.stats.mythicsPulled}</div>
              <div className="text-red-500/50 text-xs font-bold uppercase mt-1">Mythics</div>
          </div>
          <div className="bg-slate-900 p-4 rounded-xl border border-amber-900/30 text-center">
              <div className="text-amber-600 font-black text-2xl">{gameState.stats.contrabandsPulled}</div>
              <div className="text-amber-600/50 text-xs font-bold uppercase mt-1">Contraband</div>
          </div>
      </div>

      {/* Promo Codes */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-8 rounded-2xl border border-slate-700">
          <h3 className="text-white font-bold mb-2 flex items-center gap-2">
              <Ban className="text-green-400" /> Promo Codes
          </h3>
          <p className="text-slate-400 text-sm mb-4">Follow us on social media to find hidden codes.</p>
          
          <div className="flex gap-2">
              <input 
                  type="text" 
                  value={promoInput} 
                  onChange={(e) => setPromoInput(e.target.value)}
                  placeholder="ENTER-CODE-HERE"
                  className="flex-1 bg-black border border-slate-600 rounded-lg px-4 py-3 text-white font-mono uppercase focus:border-green-500 outline-none"
              />
              <button 
                  onClick={() => {
                      onRedeemCode(promoInput);
                      setPromoInput('');
                  }}
                  className="bg-green-600 hover:bg-green-500 text-white font-bold px-6 rounded-lg transition-colors"
              >
                  REDEEM
              </button>
          </div>
      </div>

    </div>
  );
};