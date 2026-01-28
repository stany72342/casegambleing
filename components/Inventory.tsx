import React, { useMemo, useState, useEffect } from 'react';
import { GameState, RARITY_COLORS, RARITY_ORDER, Rarity, ItemType } from '../types';
import * as Icons from 'lucide-react';

interface InventoryProps {
  gameState: GameState;
  onSell: (itemId: string) => void;
  onSellBulk: (itemIds: string[]) => void;
}

export const Inventory: React.FC<InventoryProps> = ({ gameState, onSell, onSellBulk }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');
  const [selectedRarities, setSelectedRarities] = useState<Rarity[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<ItemType[]>([]);
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  
  const ITEMS_PER_PAGE = 24;

  const LucideIcon = ({ name, size = 24, className }: { name: string, size?: number, className?: string }) => {
    const Icon = (Icons as any)[name];
    return Icon ? <Icon size={size} className={className} /> : <Icons.HelpCircle size={size} className={className} />;
  };

  // --- FILTER & SORT LOGIC ---
  const filteredItems = useMemo(() => {
    let items = [...gameState.inventory];

    // Search
    if (searchTerm) {
        const lowerTerm = searchTerm.toLowerCase();
        items = items.filter(i => i.name.toLowerCase().includes(lowerTerm));
    }

    // Rarity Filter
    if (selectedRarities.length > 0) {
        items = items.filter(i => selectedRarities.includes(i.rarity));
    }

    // Type Filter
    if (selectedTypes.length > 0) {
        items = items.filter(i => selectedTypes.includes(i.type));
    }

    // Sort
    items.sort((a, b) => {
        switch (sortOrder) {
            case 'newest': return b.obtainedAt - a.obtainedAt;
            case 'oldest': return a.obtainedAt - b.obtainedAt;
            case 'value-high': return b.value - a.value;
            case 'value-low': return a.value - b.value;
            case 'rarity-high': return RARITY_ORDER.indexOf(b.rarity) - RARITY_ORDER.indexOf(a.rarity);
            case 'rarity-low': return RARITY_ORDER.indexOf(a.rarity) - RARITY_ORDER.indexOf(b.rarity);
            default: return 0;
        }
    });

    return items;
  }, [gameState.inventory, searchTerm, sortOrder, selectedRarities, selectedTypes]);

  // Reset page when filters change
  useEffect(() => {
      setCurrentPage(1);
  }, [searchTerm, selectedRarities, selectedTypes, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
  const paginatedItems = filteredItems.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  // Stats
  const totalValue = Math.floor(gameState.inventory.reduce((acc, item) => acc + item.value, 0) * gameState.config.sellValueMultiplier);
  const filteredValue = Math.floor(filteredItems.reduce((acc, item) => acc + item.value, 0) * gameState.config.sellValueMultiplier);

  // Bulk Selection
  const toggleSelect = (itemId: string) => {
      setSelectedItems(prev => 
          prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
      );
  };

  const toggleSelectAllPage = () => {
      const pageIds = paginatedItems.map(i => i.id);
      const allSelected = pageIds.every(id => selectedItems.includes(id));
      
      if (allSelected) {
          setSelectedItems(prev => prev.filter(id => !pageIds.includes(id)));
      } else {
          setSelectedItems(prev => [...new Set([...prev, ...pageIds])]);
      }
  };

  const handleBulkSell = () => {
      if (selectedItems.length === 0) return;
      if (confirm(`Sell ${selectedItems.length} items? This cannot be undone.`)) {
          onSellBulk(selectedItems);
          setSelectedItems([]);
      }
  };

  const selectedValue = Math.floor(selectedItems.reduce((acc, id) => {
      const item = gameState.inventory.find(i => i.id === id);
      return acc + (item ? item.value : 0);
  }, 0) * gameState.config.sellValueMultiplier);

  const toggleRarityFilter = (r: Rarity) => {
      setSelectedRarities(prev => prev.includes(r) ? prev.filter(x => x !== r) : [...prev, r]);
  };

  const toggleTypeFilter = (t: ItemType) => {
      setSelectedTypes(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 animate-in fade-in duration-500">
        
        {/* HEADER STATS */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6 flex flex-col md:flex-row justify-between items-center gap-6 shadow-xl">
            <div>
                <h2 className="text-3xl font-black text-white mb-1 flex items-center gap-2">
                    <Icons.Package className="text-blue-500" /> INVENTORY
                </h2>
                <div className="text-slate-400 text-sm flex gap-4">
                    <span>Total Items: <b className="text-white">{gameState.inventory.length}</b></span>
                    <span>Est. Value: <b className="text-green-400">${totalValue.toLocaleString()}</b></span>
                </div>
            </div>
            
            {gameState.config.sellValueMultiplier !== 1 && (
                <div className="bg-yellow-500/10 border border-yellow-500/50 px-4 py-2 rounded-lg text-yellow-500 font-bold text-sm flex items-center gap-2 animate-pulse">
                    <Icons.TrendingUp size={16} />
                    MARKET BOOM: {gameState.config.sellValueMultiplier}x SELL VALUE
                </div>
            )}

            <div className="flex gap-2">
                 <button
                    onClick={() => {
                        setIsBulkMode(!isBulkMode);
                        setSelectedItems([]);
                    }}
                    className={`px-5 py-2.5 rounded-xl text-sm font-bold border transition-all flex items-center gap-2 ${isBulkMode ? 'bg-yellow-500 text-black border-yellow-500 shadow-lg shadow-yellow-500/20' : 'bg-slate-800 text-white border-slate-700 hover:bg-slate-700'}`}
                >
                    <Icons.Layers size={18} /> {isBulkMode ? 'Done Selecting' : 'Bulk Mode'}
                </button>
            </div>
        </div>

        {/* CONTROLS BAR */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-6 space-y-4">
            
            {/* Top Row: Search & Sort */}
            <div className="flex flex-col md:flex-row gap-4 justify-between">
                <div className="relative flex-1 max-w-md">
                    <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search items..." 
                        className="w-full bg-black border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:border-blue-500 outline-none transition-colors"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                
                <div className="flex items-center gap-3 overflow-x-auto no-scrollbar">
                    <select 
                        className="bg-black border border-slate-700 text-white text-sm rounded-lg px-4 py-2.5 focus:border-blue-500 outline-none cursor-pointer"
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value)}
                    >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="value-high">Value: High to Low</option>
                        <option value="value-low">Value: Low to High</option>
                        <option value="rarity-high">Rarity: High to Low</option>
                        <option value="rarity-low">Rarity: Low to High</option>
                    </select>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col gap-3 pt-4 border-t border-slate-800">
                
                {/* Rarity Filter */}
                <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-xs font-bold text-slate-500 uppercase mr-2">Rarity:</span>
                    {RARITY_ORDER.map(r => (
                        <button
                            key={r}
                            onClick={() => toggleRarityFilter(r)}
                            className={`
                                px-3 py-1 rounded text-[10px] font-bold uppercase border transition-all
                                ${selectedRarities.includes(r) 
                                    ? `${RARITY_COLORS[r].bg} text-white border-transparent shadow-lg` 
                                    : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-600'}
                            `}
                        >
                            {r.replace('_', ' ')}
                        </button>
                    ))}
                    {selectedRarities.length > 0 && (
                        <button onClick={() => setSelectedRarities([])} className="text-xs text-red-400 hover:underline ml-2">Clear</button>
                    )}
                </div>

                {/* Type Filter */}
                <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-xs font-bold text-slate-500 uppercase mr-4">Type:</span>
                    {['equipment', 'character', 'key', 'artifact'].map((t) => (
                        <button
                            key={t}
                            onClick={() => toggleTypeFilter(t as ItemType)}
                            className={`
                                px-3 py-1 rounded text-[10px] font-bold uppercase border transition-all
                                ${selectedTypes.includes(t as ItemType) 
                                    ? 'bg-blue-600 text-white border-blue-500' 
                                    : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-600'}
                            `}
                        >
                            {t}
                        </button>
                    ))}
                     {selectedTypes.length > 0 && (
                        <button onClick={() => setSelectedTypes([])} className="text-xs text-red-400 hover:underline ml-2">Clear</button>
                    )}
                </div>
            </div>
        </div>

        {/* BULK ACTION BAR */}
        {isBulkMode && (
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 border border-yellow-500/50 shadow-[0_0_50px_rgba(234,179,8,0.2)] rounded-2xl px-6 py-4 flex items-center gap-6 animate-in slide-in-from-bottom-10">
                <div className="flex flex-col">
                    <span className="text-xs text-slate-400 uppercase font-bold">Selected</span>
                    <span className="text-xl font-black text-white">{selectedItems.length} <span className="text-sm font-normal text-slate-500">items</span></span>
                </div>
                <div className="h-8 w-px bg-slate-700"></div>
                <div className="flex flex-col">
                    <span className="text-xs text-slate-400 uppercase font-bold">Value</span>
                    <span className="text-xl font-mono font-bold text-green-400">${selectedValue.toLocaleString()}</span>
                </div>
                <div className="h-8 w-px bg-slate-700"></div>
                <div className="flex gap-2">
                    <button 
                        onClick={toggleSelectAllPage}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-lg transition-colors"
                    >
                        {paginatedItems.every(i => selectedItems.includes(i.id)) ? 'Deselect Page' : 'Select Page'}
                    </button>
                    <button 
                        onClick={handleBulkSell}
                        disabled={selectedItems.length === 0}
                        className="px-6 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold rounded-lg shadow-lg transition-colors flex items-center gap-2"
                    >
                        <Icons.Trash2 size={14} /> SELL SELECTED
                    </button>
                </div>
            </div>
        )}

        {/* ITEMS GRID */}
        {filteredItems.length === 0 ? (
            <div className="text-center py-32 bg-slate-900/50 rounded-3xl border-2 border-dashed border-slate-800">
                <Icons.Ghost className="mx-auto h-16 w-16 text-slate-700 mb-4" />
                <h3 className="text-xl font-bold text-slate-500">No items found</h3>
                <p className="text-slate-600 mt-2">Try adjusting your filters or search terms.</p>
                <button onClick={() => { setSearchTerm(''); setSelectedRarities([]); setSelectedTypes([]); }} className="mt-6 px-6 py-2 bg-slate-800 text-white rounded-full font-bold hover:bg-slate-700">
                    Clear Filters
                </button>
            </div>
        ) : (
            <div className="space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {paginatedItems.map((item) => {
                        const currentSellValue = Math.floor(item.value * gameState.config.sellValueMultiplier);
                        const isSelected = selectedItems.includes(item.id);

                        return (
                            <div 
                                key={item.id}
                                onClick={() => isBulkMode && toggleSelect(item.id)}
                                className={`
                                    relative group rounded-xl border transition-all duration-200 overflow-hidden bg-slate-900
                                    ${isBulkMode ? 'cursor-pointer' : 'hover:-translate-y-1 hover:shadow-xl'}
                                    ${isSelected ? 'border-yellow-500 ring-2 ring-yellow-500/30' : 'border-slate-800 hover:border-slate-600'}
                                `}
                            >
                                {/* Selection Indicator */}
                                {isBulkMode && (
                                    <div className={`absolute top-2 right-2 z-10 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ? 'bg-yellow-500 border-yellow-500' : 'bg-black/50 border-slate-500'}`}>
                                        {isSelected && <Icons.Check size={14} className="text-black stroke-[3]" />}
                                    </div>
                                )}

                                {/* Card Header / Background Glow */}
                                <div className={`h-24 w-full relative flex items-center justify-center overflow-hidden bg-gradient-to-b from-slate-800 to-slate-900`}>
                                    <div className={`absolute inset-0 opacity-20 ${RARITY_COLORS[item.rarity].bg}`}></div>
                                    {/* Radial Glow */}
                                    <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 ${RARITY_COLORS[item.rarity].bg} opacity-20 blur-xl rounded-full`}></div>
                                    
                                    <div className={`relative z-10 p-2 rounded-xl transition-transform duration-300 group-hover:scale-110 ${RARITY_COLORS[item.rarity].text}`}>
                                        <LucideIcon name={item.icon} size={48} />
                                    </div>
                                </div>

                                {/* Card Body */}
                                <div className="p-3 bg-slate-900 relative">
                                    {/* Rarity Bar */}
                                    <div className={`absolute top-0 left-0 right-0 h-[2px] ${RARITY_COLORS[item.rarity].bg}`}></div>

                                    <h3 className={`text-xs font-bold truncate mb-1 ${RARITY_COLORS[item.rarity].text}`}>
                                        {item.name}
                                    </h3>
                                    <div className="flex justify-between items-center text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-3">
                                        <span>{item.type}</span>
                                        <span>{item.rarity}</span>
                                    </div>

                                    <div className="bg-black/30 rounded p-2 flex justify-between items-center border border-slate-800">
                                        <span className="text-xs font-mono text-slate-400">Value</span>
                                        <span className="text-sm font-mono font-bold text-white">${item.value.toLocaleString()}</span>
                                    </div>

                                    {/* Sell Button (Only when not bulk) */}
                                    {!isBulkMode && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onSell(item.id);
                                            }}
                                            className="w-full mt-3 py-2 bg-slate-800 hover:bg-green-600 hover:text-white text-slate-400 text-[10px] font-bold rounded transition-colors flex items-center justify-center gap-1 group/btn"
                                        >
                                            <Icons.DollarSign size={12} /> SELL <span className="group-hover/btn:text-white text-green-400">${currentSellValue.toLocaleString()}</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* PAGINATION */}
                {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-4 py-6 border-t border-slate-800 mt-8">
                        <button 
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-white"
                        >
                            <Icons.ChevronLeft size={20} />
                        </button>
                        <span className="text-sm font-bold text-slate-400">
                            Page <span className="text-white">{currentPage}</span> of <span className="text-white">{totalPages}</span>
                        </span>
                        <button 
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-white"
                        >
                            <Icons.ChevronRight size={20} />
                        </button>
                    </div>
                )}
            </div>
        )}
    </div>
  );
};