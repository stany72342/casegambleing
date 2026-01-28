import React from 'react';
import { GameState } from '../types';
import { Crown, Zap, Coins, Clock, Star, Code, Terminal, Cpu, Database } from 'lucide-react';

interface PremiumProps {
  gameState: GameState;
  onBuyPremium: (level: number) => void;
}

export const Premium: React.FC<PremiumProps> = ({ gameState, onBuyPremium }) => {
  return (
    <div className="max-w-6xl mx-auto py-12 px-4 text-center">
        
        <div className="mb-8 animate-in zoom-in duration-500">
            <div className="w-24 h-24 bg-gradient-to-tr from-yellow-400 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_50px_rgba(234,179,8,0.5)]">
                <Crown size={48} className="text-white" />
            </div>
            <h1 className="text-5xl font-black text-white mb-2">BECOME A LEGEND</h1>
            <p className="text-xl text-yellow-400 font-bold">Unlock Exclusive Perks & Multipliers</p>
        </div>

        {gameState.premiumLevel > 0 ? (
             <div className={`
                border rounded-2xl p-12 max-w-2xl mx-auto overflow-hidden relative
                ${gameState.premiumLevel === 2 
                    ? 'bg-slate-950 border-cyan-500 shadow-[0_0_50px_rgba(6,182,212,0.3)]' 
                    : 'bg-gradient-to-r from-yellow-900/50 to-orange-900/50 border-yellow-500/50'}
             `}>
                 {gameState.premiumLevel === 2 && (
                     <div className="absolute inset-0 bg-[url('https://media.giphy.com/media/26tn33aiTi1jkl6H6/giphy.gif')] opacity-5 pointer-events-none mix-blend-overlay bg-cover"></div>
                 )}
                 <h2 className={`text-3xl font-black mb-4 ${gameState.premiumLevel === 2 ? 'text-cyan-400 tracking-widest' : 'text-white'}`}>
                     {gameState.premiumLevel === 2 ? 'SYSTEM OVERRIDE: ACTIVE' : 'PREMIUM ELITE ACTIVE'}
                 </h2>
                 <p className="text-slate-300 mb-6 relative z-10">Your benefits are currently active.</p>
                 <div className="flex justify-center gap-2 relative z-10">
                    <Star className={gameState.premiumLevel === 2 ? "text-cyan-400 fill-cyan-400" : "text-yellow-400 fill-yellow-400"} />
                    <Star className={gameState.premiumLevel === 2 ? "text-cyan-400 fill-cyan-400" : "text-yellow-400 fill-yellow-400"} />
                    <Star className={gameState.premiumLevel === 2 ? "text-cyan-400 fill-cyan-400" : "text-yellow-400 fill-yellow-400"} />
                    <Star className={gameState.premiumLevel === 2 ? "text-cyan-400 fill-cyan-400" : "text-yellow-400 fill-yellow-400"} />
                    <Star className={gameState.premiumLevel === 2 ? "text-cyan-400 fill-cyan-400" : "text-yellow-400 fill-yellow-400"} />
                 </div>
                 {gameState.premiumLevel === 1 && (
                     <button 
                        onClick={() => onBuyPremium(2)}
                        className="mt-6 px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg hover:scale-105 transition-transform shadow-[0_0_20px_rgba(6,182,212,0.5)]"
                     >
                         UPGRADE TO ARCHITECT
                     </button>
                 )}
             </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 items-end">
                {/* Free Plan */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col items-center h-min">
                    <h3 className="text-xl font-bold text-slate-400 mb-2">Standard</h3>
                    <div className="text-3xl font-bold text-white mb-6">$0 <span className="text-sm font-normal text-slate-500">/ forever</span></div>
                    
                    <ul className="space-y-4 mb-8 text-left w-full text-sm">
                        <li className="flex items-center gap-3 text-slate-300">
                            <Clock size={16} /> Basic Passive Income
                        </li>
                        <li className="flex items-center gap-3 text-slate-300">
                            <Coins size={16} /> Standard Luck
                        </li>
                        <li className="flex items-center gap-3 text-slate-500 line-through">
                            <Zap size={16} /> 2x XP Gain
                        </li>
                    </ul>
                    
                    <button disabled className="w-full py-3 bg-slate-800 text-slate-500 font-bold rounded-xl cursor-not-allowed">
                        CURRENT PLAN
                    </button>
                </div>

                {/* Premium Elite */}
                <div className="bg-slate-900 border-2 border-orange-500 rounded-2xl p-6 flex flex-col items-center transform md:scale-105 shadow-xl shadow-orange-900/20 relative z-10">
                    <h3 className="text-xl font-bold text-orange-400 mb-2">PREMIUM ELITE</h3>
                    <div className="text-3xl font-bold text-white mb-6">$4.99 <span className="text-sm font-normal text-slate-500">/ month</span></div>
                    
                    <ul className="space-y-4 mb-8 text-left w-full text-sm">
                        <li className="flex items-center gap-3 text-white">
                            <Clock size={16} className="text-orange-500" /> <span className="font-bold">2x Passive Income</span>
                        </li>
                        <li className="flex items-center gap-3 text-white">
                            <Zap size={16} className="text-orange-500" /> <span className="font-bold">2x XP Gain</span>
                        </li>
                        <li className="flex items-center gap-3 text-white">
                            <Crown size={16} className="text-orange-500" /> <span className="font-bold">Golden Name</span>
                        </li>
                         <li className="flex items-center gap-3 text-white">
                            <Star size={16} className="text-orange-500" /> <span className="font-bold">Priority Support</span>
                        </li>
                    </ul>
                    
                    <button 
                        onClick={() => onBuyPremium(1)}
                        className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold rounded-xl hover:shadow-lg hover:scale-105 transition-all"
                    >
                        GET ELITE
                    </button>
                </div>

                {/* THE ARCHITECT (Replaces JS VIP) */}
                <div className="bg-slate-950 border-2 border-cyan-500 rounded-2xl p-6 flex flex-col items-center transform md:scale-110 shadow-[0_0_40px_rgba(6,182,212,0.3)] relative z-20 overflow-hidden">
                     <div className="absolute top-0 right-0 bg-gradient-to-l from-cyan-500 to-blue-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg tracking-wider">ROOT ACCESS</div>
                    
                    {/* Decor lines */}
                    <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[linear-gradient(45deg,transparent_25%,rgba(6,182,212,0.1)_50%,transparent_75%,transparent_100%)] bg-[length:10px_10px]"></div>

                    <div className="mb-2 p-3 bg-cyan-900/30 rounded-full border border-cyan-500/50 animate-pulse">
                        <Cpu size={32} className="text-cyan-400" />
                    </div>
                    <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 mb-2 tracking-widest uppercase">The Architect</h3>
                    <div className="text-3xl font-bold text-white mb-6">$19.99 <span className="text-sm font-normal text-slate-500">/ month</span></div>
                    
                    <ul className="space-y-4 mb-8 text-left w-full text-sm relative z-10">
                        <li className="flex items-center gap-3 text-white">
                            <Database size={16} className="text-cyan-400" /> <span className="font-bold text-cyan-300">50x Passive Income</span>
                        </li>
                        <li className="flex items-center gap-3 text-white">
                            <Zap size={16} className="text-cyan-400" /> <span className="font-bold">10x XP Gain</span>
                        </li>
                        <li className="flex items-center gap-3 text-white">
                            <Code size={16} className="text-cyan-400" /> <span className="font-bold">Root Badge</span>
                        </li>
                         <li className="flex items-center gap-3 text-white">
                            <Terminal size={16} className="text-cyan-400" /> <span className="font-bold">GUI Editor Access</span>
                        </li>
                    </ul>
                    
                    <button 
                        onClick={() => onBuyPremium(2)}
                        className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-black rounded-xl hover:shadow-[0_0_20px_rgba(6,182,212,0.6)] hover:scale-105 transition-all relative z-10 border border-cyan-400/30"
                    >
                        INITIALIZE
                    </button>
                </div>

            </div>
        )}
        
        <p className="text-slate-500 text-sm">Payments are processed securely (Simulation).</p>
    </div>
  );
};