import React from 'react';
import { GameState, ItemTemplate, RARITY_COLORS, RARITY_ORDER } from '../types';
import * as Icons from 'lucide-react';
import { useGameState } from '../hooks/useGameState';

export const Catalog: React.FC = () => {
  // We need to access gameState to get dynamic items
  const { gameState } = useGameState();

  const LucideIcon = ({ name, size = 24 }: { name: string, size?: number }) => {
    const Icon = (Icons as any)[name];
    return Icon ? <Icon size={size} /> : <Icons.HelpCircle size={size} />;
  };

  const itemsByRarity = RARITY_ORDER.reduce((acc, rarity) => {
    // Read from gameState.items
    acc[rarity] = (Object.values(gameState.items) as ItemTemplate[]).filter(item => item.rarity === rarity);
    return acc;
  }, {} as Record<string, ItemTemplate[]>);

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <h2 className="text-3xl font-black text-white mb-8 flex items-center gap-3">
         <Icons.BookOpen className="text-yellow-400" /> ITEM CATALOG
      </h2>

      <div className="space-y-12">
        {RARITY_ORDER.map(rarity => {
            const items = itemsByRarity[rarity];
            if (!items || items.length === 0) return null;

            return (
                <div key={rarity}>
                    <h3 className={`text-2xl font-bold mb-4 uppercase tracking-widest border-b border-slate-800 pb-2 ${RARITY_COLORS[rarity].text}`}>
                        {rarity} Collection
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {items.map(item => (
                            <div key={item.id} className={`bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col items-center hover:border-slate-600 transition-colors`}>
                                <div className={`mb-3 p-3 rounded-full bg-slate-800/50 ${RARITY_COLORS[item.rarity].text}`}>
                                    <LucideIcon name={item.icon} size={32} />
                                </div>
                                <div className={`font-bold text-sm text-center ${RARITY_COLORS[item.rarity].text}`}>{item.name}</div>
                                <div className="text-xs text-slate-500 mt-1">Val: ${item.baseValue.toLocaleString()}</div>
                                <div className="text-[10px] text-slate-600 mt-1">Circ: {item.circulation}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )
        })}
      </div>
    </div>
  );
};