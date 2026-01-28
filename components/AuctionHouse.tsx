import React, { useState } from 'react';
import { GameState, RARITY_COLORS } from '../types';
import * as Icons from 'lucide-react';

interface AuctionHouseProps {
  gameState: GameState;
  onBuy: (listingId: string) => void;
  onList: (itemId: string, price: number) => void;
  onCancel: (listingId: string) => void;
}

export const AuctionHouse: React.FC<AuctionHouseProps> = ({ gameState, onBuy, onList, onCancel }) => {
  const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy');
  const [sellPrice, setSellPrice] = useState<Record<string, string>>({});

  const LucideIcon = ({ name, size = 24, className }: { name: string, size?: number, className?: string }) => {
    const Icon = (Icons as any)[name];
    return Icon ? <Icon size={size} className={className} /> : <Icons.HelpCircle size={size} className={className} />;
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 border-b border-slate-800 pb-6">
            <div>
                <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                    <Icons.Gavel className="text-yellow-500" />
                    Auction House
                </h2>
                <p className="text-slate-400">Trade items with players worldwide. Find rare artifacts.</p>
            </div>
            <div className="flex gap-2">
                <button 
                    onClick={() => setActiveTab('buy')}
                    className={`px-6 py-2 rounded-lg font-bold transition-all ${activeTab === 'buy' ? 'bg-yellow-500 text-black' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                >
                    Browse Listings
                </button>
                <button 
                    onClick={() => setActiveTab('sell')}
                    className={`px-6 py-2 rounded-lg font-bold transition-all ${activeTab === 'sell' ? 'bg-yellow-500 text-black' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                >
                    Sell Items
                </button>
            </div>
        </div>

        {activeTab === 'buy' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {gameState.auctionListings.length === 0 ? (
                    <div className="col-span-full text-center py-20 text-slate-500">
                        <Icons.Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        No items currently listed. Check back soon.
                    </div>
                ) : (
                    gameState.auctionListings.map((listing) => (
                        <div key={listing.id} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-slate-600 transition-all group">
                            <div className={`h-1 w-full ${RARITY_COLORS[listing.item.rarity].bg}`}></div>
                            <div className="p-4">
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`w-16 h-16 rounded-lg ${RARITY_COLORS[listing.item.rarity].bg} bg-opacity-20 flex items-center justify-center border ${RARITY_COLORS[listing.item.rarity].border}`}>
                                        <LucideIcon name={listing.item.icon} size={32} className={RARITY_COLORS[listing.item.rarity].text} />
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs text-slate-500">Circulation</div>
                                        <div className="font-mono text-yellow-500 font-bold">{listing.item.circulation.toLocaleString()}</div>
                                    </div>
                                </div>
                                
                                <h3 className={`font-bold text-lg mb-1 truncate ${RARITY_COLORS[listing.item.rarity].text}`}>{listing.item.name}</h3>
                                <div className="text-xs text-slate-500 mb-4">Seller: {listing.seller}</div>

                                <div className="flex items-center justify-between mt-auto">
                                    <div className="font-mono font-bold text-xl text-white">${listing.price.toLocaleString()}</div>
                                    <button 
                                        onClick={() => onBuy(listing.id)}
                                        disabled={gameState.balance < listing.price}
                                        className={`px-4 py-2 rounded-lg text-sm font-bold ${gameState.balance >= listing.price ? 'bg-green-600 hover:bg-green-500 text-white' : 'bg-slate-700 text-slate-500 cursor-not-allowed'}`}
                                    >
                                        BUY
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        )}

        {activeTab === 'sell' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Active Listings */}
                <div>
                    <h3 className="text-xl font-bold text-white mb-4">Your Active Listings</h3>
                    <div className="space-y-4">
                        {gameState.userListings.length === 0 ? (
                            <div className="text-slate-500 text-sm italic">You have no items listed for sale.</div>
                        ) : (
                            gameState.userListings.map(listing => (
                                <div key={listing.id} className="bg-slate-900 border border-slate-700 rounded-lg p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded bg-slate-800 flex items-center justify-center ${RARITY_COLORS[listing.item.rarity].text}`}>
                                            <LucideIcon name={listing.item.icon} size={20} />
                                        </div>
                                        <div>
                                            <div className="font-bold text-sm text-white">{listing.item.name}</div>
                                            <div className="text-xs text-slate-500">Listed for ${listing.price.toLocaleString()}</div>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => onCancel(listing.id)}
                                        className="text-red-400 hover:text-red-300 text-xs font-bold px-3 py-1 bg-red-900/20 rounded hover:bg-red-900/40"
                                    >
                                        CANCEL
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Sell from Inventory */}
                <div>
                    <h3 className="text-xl font-bold text-white mb-4">List Item for Sale</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                        {gameState.inventory.map(item => (
                            <div key={item.id} className={`bg-slate-900 border border-slate-800 rounded-lg p-4 ${RARITY_COLORS[item.rarity].border} bg-opacity-50`}>
                                <div className="flex items-center gap-3 mb-3">
                                    <LucideIcon name={item.icon} size={24} className={RARITY_COLORS[item.rarity].text} />
                                    <div className="truncate font-bold text-sm text-slate-200">{item.name}</div>
                                </div>
                                <div className="flex gap-2">
                                    <input 
                                        type="number" 
                                        placeholder="Price"
                                        className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-sm text-white focus:border-yellow-500 outline-none"
                                        value={sellPrice[item.id] || ''}
                                        onChange={(e) => setSellPrice({...sellPrice, [item.id]: e.target.value})}
                                    />
                                    <button 
                                        onClick={() => {
                                            const price = parseInt(sellPrice[item.id]);
                                            if (price > 0) {
                                                onList(item.id, price);
                                                const newPrices = {...sellPrice};
                                                delete newPrices[item.id];
                                                setSellPrice(newPrices);
                                            }
                                        }}
                                        className="bg-yellow-600 hover:bg-yellow-500 text-white text-xs font-bold px-3 rounded"
                                    >
                                        LIST
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};