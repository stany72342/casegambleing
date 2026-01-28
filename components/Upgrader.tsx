import React, { useState, useEffect } from 'react';
import { GameState, Item, ItemTemplate, Rarity, RARITY_COLORS } from '../types';
import * as Icons from 'lucide-react';

interface UpgraderProps {
  gameState: GameState;
  onUpgradeAttempt: (itemId: string, targetTemplateId: string, chance: number) => boolean;
  getNextRarity: (rarity: Rarity) => Rarity | null;
  getItemsByRarity: (rarity: Rarity) => ItemTemplate[];
}

export const Upgrader: React.FC<UpgraderProps> = ({ gameState, onUpgradeAttempt, getNextRarity, getItemsByRarity }) => {
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [upgrading, setUpgrading] = useState(false);
  const [result, setResult] = useState<'idle' | 'success' | 'fail'>('idle');
  const [targetItem, setTargetItem] = useState<ItemTemplate | null>(null);
  const [winChance, setWinChance] = useState(0);

  const LucideIcon = ({ name, size = 24, className }: { name: string, size?: number, className?: string }) => {
    const Icon = (Icons as any)[name];
    return Icon ? <Icon size={size} className={className} /> : <Icons.HelpCircle size={size} className={className} />;
  };

  const calculateChance = (source: Item, target: ItemTemplate) => {
      // Logic: If source value >= target value, chance is high (max 90%)
      // If source value < target value, chance scales linearly but with house edge.
      // Formula: (Source / Target) * 90%
      // Example: 10 / 100 = 10% * 0.9 = 9% chance.
      const ratio = source.value / target.baseValue;
      const chance = Math.min(90, Math.max(1, ratio * 90));
      return Number(chance.toFixed(2));
  };

  const handleSelect = (item: Item) => {
    if (upgrading) return;
    setSelectedItem(item);
    setResult('idle');
    
    // Auto select a random target of next rarity
    const nextRarity = getNextRarity(item.rarity);
    if (nextRarity) {
        const potentialTargets = getItemsByRarity(nextRarity);
        if (potentialTargets.length > 0) {
            const target = potentialTargets[Math.floor(Math.random() * potentialTargets.length)];
            setTargetItem(target);
            setWinChance(calculateChance(item, target));
        } else {
            setTargetItem(null); 
            setWinChance(0);
        }
    } else {
        setTargetItem(null);
        setWinChance(0);
    }
  };

  const handleUpgrade = () => {
    if (!selectedItem || !targetItem) return;
    
    setUpgrading(true);
    setResult('idle');
    
    // Animation delay
    setTimeout(() => {
        const success = onUpgradeAttempt(selectedItem.id, targetItem.id, winChance);
        setResult(success ? 'success' : 'fail');
        setUpgrading(false);
        if (!success) {
            setSelectedItem(null);
            setTargetItem(null);
            setWinChance(0);
        } else {
            setSelectedItem(null);
            setTargetItem(null);
            setWinChance(0);
        }
    }, 2000);
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
        <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-white mb-2">Item Upgrader</h2>
            <p className="text-slate-400">Risk your items for a chance to upgrade them to the next rarity tier.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            
            {/* Left: Input */}
            <div className="md:col-span-5 flex flex-col items-center">
                <div className={`
                    w-48 h-48 rounded-2xl bg-slate-900 border-2 border-dashed border-slate-700 flex items-center justify-center relative
                    ${selectedItem ? RARITY_COLORS[selectedItem.rarity].border + ' border-solid bg-opacity-20 ' + RARITY_COLORS[selectedItem.rarity].bg : ''}
                `}>
                    {selectedItem ? (
                        <div className="flex flex-col items-center animate-in zoom-in">
                            <LucideIcon name={selectedItem.icon} size={64} className={RARITY_COLORS[selectedItem.rarity].text} />
                            <div className={`mt-4 font-bold ${RARITY_COLORS[selectedItem.rarity].text}`}>{selectedItem.name}</div>
                            <div className="text-sm text-slate-400 mt-1">${selectedItem.value}</div>
                        </div>
                    ) : (
                        <div className="text-slate-600 text-center p-4">
                            Select an item from inventory
                        </div>
                    )}
                </div>
            </div>

            {/* Middle: Action */}
            <div className="md:col-span-2 flex flex-col items-center justify-center gap-4">
                <div className="text-2xl font-bold text-white text-center">
                    <div className="text-sm text-slate-400 uppercase tracking-widest mb-1">Chance</div>
                    <span className={`text-3xl ${winChance > 50 ? 'text-green-400' : 'text-yellow-400'}`}>{winChance}%</span>
                </div>
                
                {/* Progress Bar / Button */}
                <button
                    onClick={handleUpgrade}
                    disabled={!selectedItem || !targetItem || upgrading}
                    className={`
                        w-full h-16 rounded-xl font-bold text-lg shadow-lg transition-all transform
                        flex items-center justify-center gap-2
                        ${upgrading 
                            ? 'bg-slate-700 cursor-wait' 
                            : !selectedItem || !targetItem 
                                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-500 text-white hover:scale-105 active:scale-95 shadow-blue-500/30'}
                    `}
                >
                    {upgrading ? (
                        <Icons.Loader2 className="animate-spin" />
                    ) : (
                        <>UPGRADE</>
                    )}
                </button>

                {/* Result Message */}
                {result === 'success' && (
                    <div className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg border border-green-500/50 font-bold animate-in slide-in-from-top-2">
                        SUCCESS!
                    </div>
                )}
                {result === 'fail' && (
                    <div className="px-4 py-2 bg-red-500/20 text-red-500 rounded-lg border border-red-500/50 font-bold animate-in slide-in-from-top-2">
                        DESTROYED
                    </div>
                )}
            </div>

            {/* Right: Output */}
            <div className="md:col-span-5 flex flex-col items-center">
                <div className={`
                    w-48 h-48 rounded-2xl bg-slate-900 border-2 border-dashed border-slate-700 flex items-center justify-center relative
                    ${targetItem ? RARITY_COLORS[targetItem.rarity].border + ' border-solid bg-opacity-20 ' + RARITY_COLORS[targetItem.rarity].bg : ''}
                `}>
                    {targetItem ? (
                         <div className="flex flex-col items-center animate-pulse">
                            <LucideIcon name={targetItem.icon} size={64} className={RARITY_COLORS[targetItem.rarity].text} />
                            <div className={`mt-4 font-bold ${RARITY_COLORS[targetItem.rarity].text}`}>{targetItem.name}</div>
                            <div className="text-sm text-slate-400 mt-1">${targetItem.baseValue}</div>
                            <div className="absolute top-2 right-2 text-xs bg-slate-900 px-2 py-1 rounded text-slate-400">Target</div>
                        </div>
                    ) : (
                        <div className="text-slate-600">
                           ???
                        </div>
                    )}
                </div>
            </div>

        </div>

        {/* Inventory Selector */}
        <div className="mt-12">
            <h3 className="text-slate-400 font-bold mb-4">Select Item to Upgrade</h3>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
                {gameState.inventory.filter(i => getNextRarity(i.rarity) !== null).map(item => (
                     <button 
                        key={item.id}
                        onClick={() => handleSelect(item)}
                        className={`
                            flex-shrink-0 w-32 h-32 bg-slate-800 rounded-xl border-2 flex flex-col items-center justify-center p-2 transition-all
                            ${selectedItem?.id === item.id ? 'border-yellow-500 ring-2 ring-yellow-500/50' : 'border-slate-700 hover:border-slate-500'}
                        `}
                     >
                         <LucideIcon name={item.icon} size={24} className={RARITY_COLORS[item.rarity].text} />
                         <div className={`mt-2 text-xs text-center font-bold truncate w-full ${RARITY_COLORS[item.rarity].text}`}>{item.name}</div>
                         <div className="text-xs text-slate-500 mt-1">${item.value}</div>
                     </button>
                ))}
                {gameState.inventory.length === 0 && (
                    <div className="w-full text-center text-slate-500 py-8">Inventory empty or no upgradeable items.</div>
                )}
            </div>
        </div>
    </div>
  );
};