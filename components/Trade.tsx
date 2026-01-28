import React, { useState } from 'react';
import { GameState, RARITY_COLORS, Rarity, TradeOffer } from '../types';
import * as Icons from 'lucide-react';

interface TradeProps {
  gameState: GameState;
  createTradeListing: (itemId: string, requestRarity: Rarity) => void;
  fulfillTrade: (tradeId: string, offerItemId: string) => void;
  cancelTrade: (tradeId: string) => void;
}

export const Trade: React.FC<TradeProps> = ({ gameState, createTradeListing, fulfillTrade, cancelTrade }) => {
  const [activeTab, setActiveTab] = useState<'market' | 'create'>('market');
  const [selectedOfferItem, setSelectedOfferItem] = useState<string | null>(null);
  const [requestRarity, setRequestRarity] = useState<Rarity>(Rarity.LEGENDARY);

  const LucideIcon = ({ name, size = 24, className }: { name: string, size?: number, className?: string }) => {
    const Icon = (Icons as any)[name];
    return Icon ? <Icon size={size} className={className} /> : <Icons.HelpCircle size={size} className={className} />;
  };

  const handleCreate = () => {
      if (selectedOfferItem) {
          createTradeListing(selectedOfferItem, requestRarity);
          setSelectedOfferItem(null);
          setActiveTab('market');
      }
  };

  const myTrades = gameState.activeTrades.filter(t => t.creator === gameState.username);
  const publicTrades = gameState.activeTrades.filter(t => t.creator !== gameState.username);

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-8">
            <div>
                <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                    <Icons.Globe className="text-blue-400" />
                    Global Trading Network
                </h2>
                <p className="text-slate-400">Exchange items with players worldwide.</p>
            </div>
            <div className="flex gap-2">
                <button 
                    onClick={() => setActiveTab('market')}
                    className={`px-6 py-2 rounded-lg font-bold transition-all ${activeTab === 'market' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                >
                    Market
                </button>
                <button 
                    onClick={() => setActiveTab('create')}
                    className={`px-6 py-2 rounded-lg font-bold transition-all ${activeTab === 'create' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                >
                    Create Listing
                </button>
            </div>
        </div>

        {activeTab === 'market' && (
            <div className="space-y-8">
                {/* My Trades Section */}
                {myTrades.length > 0 && (
                    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                        <h3 className="text-xl font-bold text-white mb-4">My Active Listings</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {myTrades.map(trade => (
                                <div key={trade.id} className="bg-slate-950 p-4 rounded-lg border border-slate-800 flex justify-between items-center">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2 rounded bg-slate-900 ${RARITY_COLORS[trade.offeredItem.rarity].text}`}>
                                            <LucideIcon name={trade.offeredItem.icon} size={24} />
                                        </div>
                                        <div>
                                            <div className="font-bold text-sm">{trade.offeredItem.name}</div>
                                            <div className="text-xs text-slate-500">Requesting: {trade.requestRarity}</div>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => cancelTrade(trade.id)}
                                        className="text-red-500 text-xs font-bold hover:underline"
                                    >
                                        CANCEL
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Public Market */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {publicTrades.length === 0 ? (
                        <div className="col-span-full text-center py-20 text-slate-500">
                            No active trades found. Be the first to list!
                        </div>
                    ) : (
                        publicTrades.map(trade => (
                            <div key={trade.id} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-blue-500 transition-colors group">
                                <div className="p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center">
                                                <Icons.User size={16} className="text-slate-400" />
                                            </div>
                                            <span className="text-sm font-bold text-slate-300">{trade.creator}</span>
                                        </div>
                                        <div className="text-xs text-slate-500 font-mono">
                                            {new Date(trade.createdAt).toLocaleTimeString()}
                                        </div>
                                    </div>

                                    <div className="bg-black/50 rounded-lg p-4 mb-4 flex items-center gap-4 border border-slate-800">
                                        <div className={`p-3 rounded-lg bg-slate-900 ${RARITY_COLORS[trade.offeredItem.rarity].text}`}>
                                            <LucideIcon name={trade.offeredItem.icon} size={32} />
                                        </div>
                                        <div>
                                            <div className="text-xs text-slate-500 uppercase">Offering</div>
                                            <div className={`font-bold ${RARITY_COLORS[trade.offeredItem.rarity].text}`}>{trade.offeredItem.name}</div>
                                        </div>
                                    </div>

                                    <div className="text-center mb-4 text-slate-500 text-sm font-bold flex items-center gap-2 justify-center">
                                        <Icons.ArrowDown size={16} /> REQUESTING <Icons.ArrowDown size={16} />
                                    </div>

                                    <div className={`text-center py-2 rounded font-bold text-sm mb-6 ${RARITY_COLORS[trade.requestRarity].bg} ${RARITY_COLORS[trade.requestRarity].text} bg-opacity-20 border ${RARITY_COLORS[trade.requestRarity].border}`}>
                                        ANY {trade.requestRarity} ITEM
                                    </div>

                                    {/* Fulfill Action */}
                                    <div className="space-y-2">
                                        <div className="text-xs text-slate-500">Select an item to offer:</div>
                                        <select 
                                            className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm text-white"
                                            onChange={(e) => {
                                                if (e.target.value) fulfillTrade(trade.id, e.target.value);
                                            }}
                                            value=""
                                        >
                                            <option value="" disabled>Choose Item...</option>
                                            {gameState.inventory.filter(i => i.rarity === trade.requestRarity).map(i => (
                                                <option key={i.id} value={i.id}>{i.name} (${i.value})</option>
                                            ))}
                                            {gameState.inventory.filter(i => i.rarity === trade.requestRarity).length === 0 && (
                                                <option disabled>No matching items</option>
                                            )}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        )}

        {activeTab === 'create' && (
            <div className="max-w-2xl mx-auto bg-slate-900 p-8 rounded-2xl border border-slate-800">
                <h3 className="text-2xl font-bold text-white mb-6">Create New Listing</h3>
                
                <div className="mb-6">
                    <label className="block text-sm font-bold text-slate-400 mb-2">1. Select Item to Trade</label>
                    <div className="grid grid-cols-3 gap-2 max-h-60 overflow-y-auto p-2 bg-black rounded-lg border border-slate-800">
                        {gameState.inventory.map(item => (
                            <div 
                                key={item.id}
                                onClick={() => setSelectedOfferItem(item.id)}
                                className={`
                                    p-2 rounded cursor-pointer border flex flex-col items-center gap-2
                                    ${selectedOfferItem === item.id ? 'bg-blue-900 border-blue-500' : 'bg-slate-900 border-slate-800 hover:border-slate-600'}
                                `}
                            >
                                <LucideIcon name={item.icon} size={20} className={RARITY_COLORS[item.rarity].text} />
                                <div className="text-xs truncate w-full text-center font-bold text-slate-300">{item.name}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mb-8">
                    <label className="block text-sm font-bold text-slate-400 mb-2">2. What do you want in return?</label>
                    <select 
                        value={requestRarity}
                        onChange={(e) => setRequestRarity(e.target.value as Rarity)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-blue-500 outline-none"
                    >
                        {Object.keys(RARITY_COLORS).map(r => (
                            <option key={r} value={r}>Any {r} Item</option>
                        ))}
                    </select>
                </div>

                <button 
                    onClick={handleCreate}
                    disabled={!selectedOfferItem}
                    className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl"
                >
                    POST LISTING
                </button>
            </div>
        )}
    </div>
  );
};