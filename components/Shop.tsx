import React, { useState, useEffect, useMemo } from 'react';
import { ShoppingCart, RefreshCw, Lock, Rocket, ArrowUp } from 'lucide-react';
import { GameState, ItemTemplate, RARITY_COLORS } from '../types';
import { useGameState } from '../hooks/useGameState';
import * as Icons from 'lucide-react';

interface ShopProps {
  gameState: GameState;
  addBalance: (amount: number) => void;
  onBuyItem: (template: ItemTemplate, price: number) => void;
}

export const Shop: React.FC<ShopProps> = ({ gameState, addBalance, onBuyItem }) => {
  const [secondsUntilReset, setSecondsUntilReset] = useState(60);
  const [resetSeed, setResetSeed] = useState(Date.now());

  useEffect(() => {
      const interval = setInterval(() => {
          setSecondsUntilReset(prev => {
              if (prev <= 1) {
                  setResetSeed(Date.now()); // Trigger re-roll
                  return 60;
              }
              return prev - 1;
          });
      }, 1000);
      return () => clearInterval(interval);
  }, []);

  const LucideIcon = ({ name, size = 24, className }: { name: string, size?: number, className?: string }) => {
    const Icon = (Icons as any)[name];
    return Icon ? <Icon size={size} className={className} /> : <Icons.HelpCircle size={size} className={className} />;
  };

  const flashSales = useMemo(() => {
    const _ = resetSeed; 
    
    // Filter out keys from flash sales
    const allItems = (Object.values(gameState.items) as ItemTemplate[]).filter(i => 
        i.rarity !== 'COMMON' && 
        i.type !== 'key' && 
        !i.hidden
    );
    const shuffled = [...allItems].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3).map(item => ({
        ...item,
        price: Math.floor(item.baseValue * 1.5)
    }));
  }, [gameState.items, resetSeed]);

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
        
        {/* ADMIN CONFIG SHOP (Dynamic) */}
        {gameState.config.shopConfig && gameState.config.shopConfig.length > 0 && (
            <div className="mb-12">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                    <ShoppingCart className="text-green-400" />
                    Featured Items
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {gameState.config.shopConfig.map(entry => {
                        const item = gameState.items[entry.templateId];
                        if(!item) return null;
                        return (
                            <div key={entry.id} className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col items-center text-center hover:border-green-500 transition-colors">
                                <div className={`w-16 h-16 rounded-lg ${RARITY_COLORS[item.rarity].bg} bg-opacity-20 flex items-center justify-center border ${RARITY_COLORS[item.rarity].border} mb-4`}>
                                    <LucideIcon name={item.icon} size={32} className={RARITY_COLORS[item.rarity].text} />
                                </div>
                                <h3 className={`font-bold text-lg ${RARITY_COLORS[item.rarity].text} mb-2`}>{item.name}</h3>
                                <div className="text-xl font-mono font-bold text-white mb-4">
                                    ${entry.price.toLocaleString()}
                                </div>
                                <button 
                                    onClick={() => onBuyItem(item, entry.price)}
                                    disabled={gameState.balance < entry.price}
                                    className={`w-full py-2 rounded-lg font-bold text-sm transition-colors ${gameState.balance >= entry.price ? 'bg-green-600 hover:bg-green-500 text-white' : 'bg-slate-700 text-slate-500 cursor-not-allowed'}`}
                                >
                                    BUY
                                </button>
                            </div>
                        )
                    })}
                </div>
            </div>
        )}

        {/* Flash Sales Section */}
        <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <ShoppingCart className="text-blue-400" />
                    Flash Sales
                </h2>
                <div className="text-slate-400 text-sm flex items-center gap-1 font-mono">
                    <RefreshCw size={14} className={secondsUntilReset < 10 ? "animate-spin text-red-500" : ""} /> Resets in {secondsUntilReset}s
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {flashSales.map((item) => (
                    <div key={item.id} className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative overflow-hidden animate-in fade-in">
                        <div className={`absolute top-0 right-0 px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-bl-xl`}>
                            HOT
                        </div>
                        
                        <div className="flex items-center gap-4 mb-4">
                            <div className={`w-16 h-16 rounded-lg ${RARITY_COLORS[item.rarity].bg} bg-opacity-20 flex items-center justify-center border ${RARITY_COLORS[item.rarity].border}`}>
                                <LucideIcon name={item.icon} size={32} className={RARITY_COLORS[item.rarity].text} />
                            </div>
                            <div>
                                <h3 className={`font-bold ${RARITY_COLORS[item.rarity].text}`}>{item.name}</h3>
                                <span className="text-xs text-slate-500 uppercase">{item.type} • {item.rarity}</span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between mt-4">
                            <div className="text-2xl font-mono font-bold text-white">
                                ${item.price.toLocaleString()}
                            </div>
                            <button 
                                onClick={() => onBuyItem(item, item.price)}
                                disabled={gameState.balance < item.price}
                                className={`
                                    px-4 py-2 rounded-lg font-bold text-sm transition-colors
                                    ${gameState.balance >= item.price 
                                        ? 'bg-blue-600 hover:bg-blue-500 text-white' 
                                        : 'bg-slate-700 text-slate-500 cursor-not-allowed'}
                                `}
                            >
                                BUY NOW
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* SPECIAL HARDWARE */}
        <div>
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Rocket className="text-purple-400" />
                Coming Soon
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* PLACEHOLDERS */}
                <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 flex flex-col items-center relative overflow-hidden group opacity-60">
                    <div className="absolute inset-0 bg-black/50 z-10 flex items-center justify-center backdrop-blur-[1px]">
                        <div className="bg-slate-800 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2 border border-slate-600"><Lock size={12} /> SOON</div>
                    </div>
                    <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4 border border-slate-600">
                        <Icons.Ticket size={32} className="text-yellow-600" />
                    </div>
                    <h3 className="font-bold text-lg text-slate-300">Golden Ticket</h3>
                    <p className="text-xs text-slate-500 text-center mt-2">Access to high-roller VIP tournaments.</p>
                </div>

                <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 flex flex-col items-center relative overflow-hidden group opacity-60">
                    <div className="absolute inset-0 bg-black/50 z-10 flex items-center justify-center backdrop-blur-[1px]">
                        <div className="bg-slate-800 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2 border border-slate-600"><Lock size={12} /> SOON</div>
                    </div>
                    <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4 border border-slate-600">
                        <Icons.Users size={32} className="text-blue-600" />
                    </div>
                    <h3 className="font-bold text-lg text-slate-300">Clan Pass</h3>
                    <p className="text-xs text-slate-500 text-center mt-2">Create a clan and compete in wars.</p>
                </div>
            </div>
        </div>

    </div>
  );
};