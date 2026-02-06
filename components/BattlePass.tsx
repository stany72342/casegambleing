import React from 'react';
import { GameState } from '../types';
import { BATTLE_PASS_LEVELS } from '../constants';
import { Lock, Unlock, Check, Star, Gift, Crown, Package } from 'lucide-react';

interface BattlePassProps {
  gameState: GameState;
  onClaim: (level: number, type: 'free' | 'premium') => void;
}

export const BattlePass: React.FC<BattlePassProps> = ({ gameState, onClaim }) => {
  const currentLevel = gameState.level;
  const tiers = BATTLE_PASS_LEVELS || []; // Safety fallback

  return (
    <div className="max-w-[90vw] mx-auto py-8 px-4">
        <div className="text-center mb-10">
            <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 mb-4">
                BATTLE PASS: SEASON 2
            </h1>
            <p className="text-slate-400 max-w-2xl mx-auto">
                Play games and open cases to level up. Unlock exclusive rewards as you progress. 
                Upgrade to Premium to unlock the bottom row of rewards.
            </p>
        </div>

        {/* Header Stats */}
        <div className="flex flex-col sm:flex-row justify-center gap-8 mb-12">
            <div className="bg-slate-900 border border-slate-700 rounded-xl px-8 py-4 text-center min-w-[200px]">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Current Level</div>
                <div className="text-4xl font-black text-white">{currentLevel}</div>
            </div>
            <div className={`bg-slate-900 border rounded-xl px-8 py-4 text-center min-w-[200px] ${gameState.isPremium ? 'border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.2)]' : 'border-slate-700'}`}>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Status</div>
                <div className={`text-4xl font-black ${gameState.isPremium ? 'text-yellow-400' : 'text-slate-400'}`}>
                    {gameState.isPremium ? 'PREMIUM' : 'FREE'}
                </div>
            </div>
        </div>

        {/* Scrollable Timeline */}
        <div className="relative">
            <div className="overflow-x-auto pb-12 pt-4 px-4 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900">
                {tiers.length === 0 ? (
                    <div className="text-center text-slate-500 py-12">Loading Battle Pass...</div>
                ) : (
                    <div className="flex gap-6 min-w-max px-8 relative">
                        
                        {/* Connecting Line Behind */}
                        <div className="absolute top-[50%] left-0 right-0 h-2 bg-slate-800 -z-10 rounded-full transform -translate-y-1/2"></div>

                        {tiers.map((tier) => {
                            const isUnlocked = currentLevel >= tier.level;
                            const freeClaimed = (gameState.bpClaimedFree || []).includes(tier.level);
                            const premiumClaimed = (gameState.bpClaimedPremium || []).includes(tier.level);
                            const isSpecial = tier.level % 5 === 0;

                            return (
                                <div key={tier.level} className="flex flex-col gap-6 w-40 flex-shrink-0 relative group">
                                    
                                    {/* Level Indicator Bubble */}
                                    <div className={`
                                        absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs z-20 border-4
                                        ${isUnlocked ? 'bg-blue-600 border-slate-900 text-white' : 'bg-slate-800 border-slate-900 text-slate-500'}
                                    `}>
                                        {tier.level}
                                    </div>

                                    {/* Free Reward Card (Top) */}
                                    <div className={`
                                        h-36 rounded-xl border-2 flex flex-col items-center justify-center relative overflow-hidden transition-all duration-300
                                        ${isUnlocked ? 'bg-slate-800 border-blue-500/30 hover:border-blue-500' : 'bg-slate-900 border-slate-800 opacity-60'}
                                        ${freeClaimed ? 'opacity-50 grayscale' : ''}
                                    `}>
                                        <div className="text-[10px] font-bold text-slate-500 absolute top-2 left-2 uppercase tracking-wider">FREE</div>
                                        
                                        {tier.freeReward.type === 'coins' ? (
                                            <Gift size={32} className="text-blue-400 mb-2" />
                                        ) : (
                                            <Package size={32} className="text-purple-400 mb-2" />
                                        )}
                                        
                                        <div className="font-bold text-white text-sm text-center px-2">
                                            {tier.freeReward.label || 'Reward'}
                                        </div>
                                        
                                        {isUnlocked && !freeClaimed && (
                                            <button 
                                                onClick={() => onClaim(tier.level, 'free')}
                                                className="absolute inset-0 bg-blue-600/90 flex items-center justify-center font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
                                            >
                                                CLAIM
                                            </button>
                                        )}
                                        {freeClaimed && (
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                                <Check size={32} className="text-green-500 drop-shadow-md" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Spacer for Line */}
                                    <div className="h-4"></div>

                                    {/* Premium Reward Card (Bottom) */}
                                    <div className={`
                                        h-36 rounded-xl border-2 flex flex-col items-center justify-center relative overflow-hidden transition-all duration-300
                                        ${isUnlocked ? (isSpecial ? 'bg-slate-800 border-purple-500/50 hover:border-purple-500' : 'bg-slate-800 border-yellow-500/30 hover:border-yellow-500') : 'bg-slate-900 border-slate-800 opacity-60'}
                                        ${premiumClaimed ? 'opacity-50 grayscale' : ''}
                                        ${isSpecial ? 'shadow-[0_0_15px_rgba(168,85,247,0.15)]' : ''}
                                    `}>
                                        <div className="text-[10px] font-bold text-yellow-600 absolute top-2 left-2 flex items-center gap-1 uppercase tracking-wider">
                                            <Crown size={10} /> PREMIUM
                                        </div>
                                        
                                        {!gameState.isPremium && (
                                            <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/60 backdrop-blur-[1px]">
                                                <Lock size={24} className="text-slate-500" />
                                            </div>
                                        )}

                                        {tier.premiumReward.type === 'coins' ? (
                                            <Gift size={32} className="text-yellow-400 mb-2" />
                                        ) : (
                                            <Star size={32} className="text-red-400 mb-2 animate-pulse" />
                                        )}
                                        
                                        <div className={`font-bold text-sm text-center px-2 ${isSpecial ? 'text-purple-300' : 'text-white'}`}>
                                            {tier.premiumReward.label || 'Reward'}
                                        </div>

                                        {isUnlocked && gameState.isPremium && !premiumClaimed && (
                                            <button 
                                                onClick={() => onClaim(tier.level, 'premium')}
                                                className="absolute inset-0 bg-yellow-600/90 flex items-center justify-center font-bold text-black opacity-0 group-hover:opacity-100 transition-opacity z-20 backdrop-blur-sm"
                                            >
                                                CLAIM
                                            </button>
                                        )}
                                        {premiumClaimed && (
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-20">
                                                <Check size={32} className="text-green-500 drop-shadow-md" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};