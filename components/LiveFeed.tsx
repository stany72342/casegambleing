import React, { useEffect, useRef } from 'react';
import { GameState, RARITY_COLORS } from '../types';
import * as Icons from 'lucide-react';

interface LiveFeedProps {
  gameState: GameState;
}

export const LiveFeed: React.FC<LiveFeedProps> = ({ gameState }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const LucideIcon = ({ name, size = 16, className }: { name: string, size?: number, className?: string }) => {
    const Icon = (Icons as any)[name];
    return Icon ? <Icon size={size} className={className} /> : <Icons.HelpCircle size={size} className={className} />;
  };

  return (
    <div className="w-full bg-slate-950 border-b border-slate-800 h-12 overflow-hidden relative flex items-center">
        <div className="absolute left-0 top-0 bottom-0 bg-slate-900 px-3 z-10 flex items-center border-r border-slate-800">
            <span className="text-[10px] font-bold text-green-400 flex items-center gap-1 animate-pulse">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span> LIVE
            </span>
        </div>
        
        <div className="flex items-center gap-4 px-4 overflow-hidden animate-in fade-in">
            {gameState.liveFeed.map((entry) => (
                <div key={entry.id} className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded px-2 py-1 flex-shrink-0 animate-in slide-in-from-right duration-500">
                    <span className="text-xs font-bold text-slate-400">{entry.username}</span>
                    <span className="text-slate-600 text-[10px]">unboxed</span>
                    <div className={`flex items-center gap-1 ${RARITY_COLORS[entry.item.rarity].text}`}>
                        <LucideIcon name={entry.item.icon} size={14} />
                        <span className="text-xs font-bold">{entry.item.name}</span>
                    </div>
                </div>
            ))}
        </div>
        
        {/* Right Fade */}
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-slate-950 to-transparent pointer-events-none"></div>
    </div>
  );
};