import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GameState, ItemTemplate, RARITY_COLORS } from '../types';
import * as Icons from 'lucide-react';

interface CaseOpenerProps {
  gameState: GameState;
  onOpen: (caseId: string) => ItemTemplate | null;
  onWin: (templateId: string) => void;
  removeBalance: (amount: number) => void;
}

// Configuration
const CARD_WIDTH = 160;
const GAP = 12;
const SLOT_WIDTH = CARD_WIDTH + GAP;
const TOTAL_CARDS = 60; // Total cards in strip
const WIN_INDEX = 50; // Index where winner lands
const ANIMATION_DURATION = 6000; // ms

// --- SOUND ENGINE (Web Audio API) ---
const SoundEngine = {
  ctx: null as AudioContext | null,
  
  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  },

  playTick() {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.05);
    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  },

  playWin(rarity: string) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    
    // Chord based on rarity
    const freqs = rarity === 'LEGENDARY' || rarity === 'MYTHIC' 
        ? [440, 554, 659, 880] // A Major 
        : [523, 659, 783];     // C Major

    freqs.forEach((f, i) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sine';
        osc.frequency.value = f;
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(now + i * 0.05);
        osc.stop(now + 2);
    });
  }
};

export const CaseOpener: React.FC<CaseOpenerProps> = ({ gameState, onOpen, onWin, removeBalance }) => {
  const [selectedCase, setSelectedCase] = useState(gameState.cases[0]);
  const [isRolling, setIsRolling] = useState(false);
  const [wonItem, setWonItem] = useState<ItemTemplate | null>(null);
  const [rollItems, setRollItems] = useState<ItemTemplate[]>([]);
  const [fastMode, setFastMode] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [recentDrops, setRecentDrops] = useState<ItemTemplate[]>([]);
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const soundIntervalRef = useRef<any>(null);

  // Dynamic values
  const casePrice = Math.floor(selectedCase.price * gameState.config.casePriceMultiplier);
  const userHasKey = selectedCase.keyTemplateId 
    ? gameState.inventory.some(i => i.templateId === selectedCase.keyTemplateId)
    : true;
  const requiredKeyName = selectedCase.keyTemplateId ? gameState.items[selectedCase.keyTemplateId]?.name : null;

  // Initialize Audio Context on user interaction
  useEffect(() => {
      const handleUserGesture = () => {
          if (soundEnabled) SoundEngine.init();
          window.removeEventListener('click', handleUserGesture);
      };
      window.addEventListener('click', handleUserGesture);
      return () => {
           window.removeEventListener('click', handleUserGesture);
           if (soundIntervalRef.current) clearInterval(soundIntervalRef.current);
      };
  }, [soundEnabled]);

  const generateRollStrip = useCallback((winningItem: ItemTemplate) => {
    const caseItems = selectedCase.contains.map(c => gameState.items[c.templateId]).filter(Boolean);
    const strip: ItemTemplate[] = [];
    
    // Fill Strip
    for (let i = 0; i < TOTAL_CARDS; i++) {
        if (i === WIN_INDEX) {
            strip.push(winningItem);
        } else {
            // Weighted random for visuals (roughly accurate to case odds)
            const randomItem = caseItems[Math.floor(Math.random() * caseItems.length)];
            strip.push(randomItem);
        }
    }
    return strip;
  }, [selectedCase, gameState.items]);

  const handleOpen = () => {
    if (isRolling) return;
    
    // Validation
    if (selectedCase.keyTemplateId && !userHasKey) {
        alert(`You need a ${requiredKeyName} to open this case!`);
        return;
    }
    if (casePrice > 0 && gameState.balance < casePrice) {
        alert("Not enough coins!");
        return;
    }

    // Process Transaction & RNG
    const winner = onOpen(selectedCase.id);
    if (!winner) return;

    // Setup Roll
    setWonItem(null);
    const strip = generateRollStrip(winner);
    setRollItems(strip);
    setIsRolling(true);

    if (fastMode) {
        // FAST OPEN
        setRecentDrops(prev => [winner, ...prev].slice(0, 10));
        setWonItem(winner);
        onWin(winner.id);
        setIsRolling(false);
        if (soundEnabled) SoundEngine.playWin(winner.rarity);
    } 
    // Animation is handled by useEffect when isRolling becomes true
  };

  // Animation Effect
  useEffect(() => {
      if (isRolling && !fastMode && rollItems.length > 0 && scrollContainerRef.current) {
          const container = scrollContainerRef.current;
          const winner = rollItems[WIN_INDEX];

          // Reset Position
          container.style.transition = 'none';
          container.style.transform = 'translateX(0px)';
          
          // Force Reflow
          void container.offsetHeight;

          // Calculate Landing Position
          const containerWidth = container.parentElement?.offsetWidth || 0;
          const center = containerWidth / 2;
          
          // Random landing spot on the card (from 15px to 145px)
          const margin = 15;
          // This represents where the "center line" will hit on the card relative to the card's left edge
          const landingSpot = Math.floor(Math.random() * (CARD_WIDTH - (margin * 2))) + margin;
          
          // We want the Winning Card's Left Edge to be at: (center - landingSpot)
          // The Winning Card's Left Edge is currently at: (WIN_INDEX * SLOT_WIDTH)
          // We need to move the strip LEFT by: (WIN_INDEX * SLOT_WIDTH) - (center - landingSpot)
          
          const finalPosition = -((WIN_INDEX * SLOT_WIDTH) - (center - landingSpot));

          // Start Animation
          // Use a slight delay to ensure browser paints the reset state
          requestAnimationFrame(() => {
              container.style.transition = `transform ${ANIMATION_DURATION}ms cubic-bezier(0.15, 0.25, 0.10, 1.0)`;
              container.style.transform = `translateX(${finalPosition}px)`;
          });

          // Simulate Ticking Sound
          if (soundEnabled) {
              let tickCount = 0;
              const maxTicks = 40;
              soundIntervalRef.current = setInterval(() => {
                  tickCount++;
                  if (tickCount < maxTicks && Math.random() > (tickCount / maxTicks)) {
                      SoundEngine.playTick();
                  }
                  if (tickCount >= maxTicks && soundIntervalRef.current) clearInterval(soundIntervalRef.current);
              }, 100);
          }

          // End Animation
          const timer = setTimeout(() => {
              setIsRolling(false);
              setWonItem(winner);
              setRecentDrops(prev => [winner, ...prev].slice(0, 10));
              onWin(winner.id);
              if (soundEnabled) SoundEngine.playWin(winner.rarity);
              if (soundIntervalRef.current) clearInterval(soundIntervalRef.current);
          }, ANIMATION_DURATION);

          return () => {
              clearTimeout(timer);
              if (soundIntervalRef.current) clearInterval(soundIntervalRef.current);
          };
      }
  }, [isRolling, rollItems, fastMode, soundEnabled]); // Removed wonItem and onWin dependencies to avoid loops

  const LucideIcon = ({ name, size = 24, className }: { name: string, size?: number, className?: string }) => {
    const Icon = (Icons as any)[name];
    return Icon ? <Icon size={size} className={className} /> : <Icons.HelpCircle size={size} className={className} />;
  };

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto py-6">
      
      {/* --- ROLLER SECTION --- */}
      <div className="relative group">
        {/* Main Roller Box */}
        <div className="relative w-full h-[280px] bg-slate-950 rounded-2xl border-4 border-slate-800 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col justify-center">
            
            {/* Background Texture */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-700 via-slate-900 to-black"></div>

            {/* Center Marker Line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-[4px] bg-yellow-500 z-30 transform -translate-x-1/2 shadow-[0_0_20px_rgba(234,179,8,0.8)]"></div>
            <div className="absolute left-1/2 top-0 -translate-x-1/2 z-30 text-yellow-500 filter drop-shadow-lg"><Icons.ChevronDown size={32} fill="currentColor" /></div>
            <div className="absolute left-1/2 bottom-0 -translate-x-1/2 z-30 text-yellow-500 filter drop-shadow-lg"><Icons.ChevronUp size={32} fill="currentColor" /></div>

            {/* Side Fades */}
            <div className="absolute left-0 top-0 bottom-0 w-48 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent z-20 pointer-events-none"></div>
            <div className="absolute right-0 top-0 bottom-0 w-48 bg-gradient-to-l from-slate-950 via-slate-950/80 to-transparent z-20 pointer-events-none"></div>

            {/* The Strip */}
            <div 
                ref={scrollContainerRef}
                className="flex items-center absolute left-0 will-change-transform"
                style={{ gap: `${GAP}px` }}
            >
                {rollItems.length > 0 ? rollItems.map((item, idx) => (
                    <div 
                        key={idx}
                        className={`
                            relative flex-shrink-0 rounded-xl overflow-hidden
                            flex flex-col items-center justify-center
                            transition-all duration-300
                            ${RARITY_COLORS[item.rarity].bg} bg-opacity-10
                            border-b-4 ${RARITY_COLORS[item.rarity].border}
                        `}
                        style={{ 
                            width: `${CARD_WIDTH}px`, 
                            height: `${CARD_WIDTH}px`,
                            backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.8) 100%)`
                        }}
                    >
                        {/* Rarity Glow Behind */}
                        <div className={`absolute inset-0 opacity-20 ${RARITY_COLORS[item.rarity].bg}`}></div>
                        
                        <div className={`relative z-10 transform transition-transform duration-300 ${idx === WIN_INDEX && !isRolling ? 'scale-110' : ''}`}>
                             <LucideIcon name={item.icon} size={64} className={RARITY_COLORS[item.rarity].text} />
                        </div>
                        
                        <div className="absolute bottom-3 left-0 right-0 text-center px-2">
                             <div className={`text-xs font-bold truncate text-white shadow-black drop-shadow-md`}>{item.name}</div>
                        </div>
                    </div>
                )) : (
                    // Idle State - Manually Centered
                    <div className="w-full h-full flex items-center justify-center text-slate-700 font-bold tracking-widest text-2xl animate-pulse gap-2 pl-[50vw]">
                       <span>OPEN A CASE</span>
                    </div>
                )}
            </div>
        </div>

        {/* Controls Bar */}
        <div className="absolute -bottom-16 left-0 right-0 flex items-center justify-center gap-6">
             <label className="flex items-center gap-2 text-slate-400 text-sm font-bold bg-slate-900/80 px-4 py-2 rounded-full cursor-pointer hover:text-white transition-colors border border-slate-800">
                <input type="checkbox" checked={fastMode} onChange={e => setFastMode(e.target.checked)} className="rounded bg-slate-800 border-slate-600 text-yellow-500 focus:ring-yellow-500" />
                <Icons.Zap size={16} className={fastMode ? 'text-yellow-400' : 'text-slate-600'} /> FAST OPEN
            </label>
            <button onClick={() => setSoundEnabled(!soundEnabled)} className={`flex items-center gap-2 text-sm font-bold bg-slate-900/80 px-4 py-2 rounded-full cursor-pointer hover:text-white transition-colors border border-slate-800 ${soundEnabled ? 'text-green-400' : 'text-slate-500'}`}>
                {soundEnabled ? <Icons.Volume2 size={16} /> : <Icons.VolumeX size={16} />} SOUND
            </button>
        </div>
      </div>

      {/* --- DROP HISTORY --- */}
      {recentDrops.length > 0 && (
          <div className="mt-12 overflow-hidden relative">
              <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Icons.History size={14} /> Live Drop Feed
              </h3>
              <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
                  {recentDrops.map((item, i) => (
                      <div key={i} className={`flex-shrink-0 w-32 h-32 bg-slate-900 border border-slate-800 rounded-lg p-2 flex flex-col items-center justify-center relative overflow-hidden animate-in fade-in slide-in-from-right duration-500`}>
                          <div className={`absolute bottom-0 left-0 right-0 h-1 ${RARITY_COLORS[item.rarity].bg}`}></div>
                          <LucideIcon name={item.icon} size={24} className={RARITY_COLORS[item.rarity].text} />
                          <div className={`mt-2 text-xs font-bold truncate w-full text-center ${RARITY_COLORS[item.rarity].text}`}>{item.name}</div>
                      </div>
                  ))}
              </div>
          </div>
      )}

      {/* --- MODAL: WINNER --- */}
      {wonItem && !isRolling && !fastMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in zoom-in duration-300" onClick={() => setWonItem(null)}>
            <div 
                className={`bg-slate-950 border-2 ${RARITY_COLORS[wonItem.rarity].border} p-1 max-w-md w-full rounded-3xl relative overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)]`}
                onClick={e => e.stopPropagation()}
            >
                {/* Dynamic Background based on rarity */}
                <div className={`absolute inset-0 ${RARITY_COLORS[wonItem.rarity].bg} opacity-10`}></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/10 to-transparent opacity-50"></div>

                <div className="relative z-10 bg-slate-900/80 backdrop-blur-xl rounded-[20px] p-8 text-center border border-white/5">
                    <h2 className="text-4xl font-black text-white mb-6 italic tracking-tighter drop-shadow-lg">UNBOXED!</h2>
                    
                    <div className="my-8 flex justify-center">
                        <div className={`w-40 h-40 rounded-2xl flex items-center justify-center ${RARITY_COLORS[wonItem.rarity].bg} bg-opacity-20 border-4 ${RARITY_COLORS[wonItem.rarity].border} ${RARITY_COLORS[wonItem.rarity].glow} animate-bounce`}>
                            <LucideIcon name={wonItem.icon} size={80} className={RARITY_COLORS[wonItem.rarity].text} />
                        </div>
                    </div>
                    
                    <div className="space-y-1 mb-8">
                        <h3 className={`text-2xl font-bold ${RARITY_COLORS[wonItem.rarity].text}`}>{wonItem.name}</h3>
                        <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold bg-black/50 border border-white/10 ${RARITY_COLORS[wonItem.rarity].text}`}>
                            {wonItem.rarity} | {wonItem.type}
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button 
                            onClick={() => setWonItem(null)} 
                            className="flex-1 py-4 bg-white text-black font-black rounded-xl hover:bg-slate-200 transition-colors shadow-lg"
                        >
                            COLLECT
                        </button>
                        <button 
                            onClick={() => { setWonItem(null); handleOpen(); }} 
                            className="flex-1 py-4 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-700 transition-colors border border-slate-700"
                        >
                            SPIN AGAIN
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* --- CASE SELECTOR --- */}
      <div className="mt-8">
          <h2 className="text-2xl font-bold text-white mb-6">Available Cases</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {gameState.cases.map((box) => {
                const currentPrice = Math.floor(box.price * gameState.config.casePriceMultiplier);
                const isSelected = selectedCase.id === box.id;
                
                return (
                <button
                    key={box.id}
                    onClick={() => !isRolling && setSelectedCase(box)}
                    disabled={isRolling}
                    className={`relative p-1 rounded-2xl transition-all duration-300 group ${isSelected ? 'scale-105 z-10' : 'hover:scale-105 opacity-80 hover:opacity-100'}`}
                >
                    <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${isSelected ? 'from-yellow-500 to-orange-600' : 'from-slate-700 to-slate-800'} opacity-100`}></div>
                    
                    <div className="relative bg-slate-900 rounded-xl p-6 h-full flex flex-col items-center text-center border border-white/5">
                        <div className="text-5xl mb-4 transform group-hover:-translate-y-2 transition-transform">{box.image}</div>
                        
                        <h3 className="text-lg font-bold text-white mb-1">{box.name}</h3>
                        
                        <div className="mt-auto pt-4">
                             {currentPrice > 0 ? (
                                <div className="text-yellow-400 font-mono font-bold text-lg bg-yellow-400/10 px-4 py-1 rounded-full border border-yellow-400/20">
                                    ${currentPrice}
                                </div>
                             ) : (
                                <div className="text-slate-400 font-bold text-sm bg-slate-800 px-4 py-1 rounded-full border border-slate-700">
                                    FREE
                                </div>
                             )}
                        </div>

                        {isSelected && (
                            <div className="absolute top-2 right-2 w-3 h-3 bg-green-500 rounded-full shadow-[0_0_10px_#22c55e]"></div>
                        )}
                    </div>
                </button>
            )})}
          </div>
      </div>

      {/* --- ACTION BUTTON --- */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40">
        <button
            onClick={handleOpen}
            disabled={isRolling}
            className={`
                px-16 py-6 rounded-full font-black text-2xl tracking-widest shadow-2xl transform transition-all border-4
                flex items-center gap-4 group
                ${isRolling 
                    ? 'bg-slate-800 border-slate-700 text-slate-500 scale-95 grayscale cursor-not-allowed'
                    : !userHasKey && selectedCase.keyTemplateId
                        ? 'bg-orange-600 border-orange-400 text-white hover:bg-orange-500 hover:scale-105'
                        : (casePrice > 0 && gameState.balance < casePrice)
                            ? 'bg-red-900 border-red-700 text-red-200 cursor-not-allowed'
                            : 'bg-gradient-to-b from-yellow-400 to-orange-600 border-yellow-300 text-white hover:scale-110 hover:shadow-orange-500/50 active:scale-95'}
            `}
        >
            {isRolling ? (
                <span className="animate-pulse">ROLLING...</span>
            ) : (
                <>
                    {userHasKey ? (
                        <>OPEN CASE <Icons.ChevronRight className="group-hover:translate-x-2 transition-transform" /></>
                    ) : (
                        <><Icons.Lock /> NEED KEY</>
                    )}
                </>
            )}
        </button>
      </div>

      {/* Spacer for fixed button */}
      <div className="h-24"></div>
    </div>
  );
};