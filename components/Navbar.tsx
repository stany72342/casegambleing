import React, { useState } from 'react';
import { LayoutDashboard, Package, Dna, Coins, Menu, X, Trophy, ShoppingBag, LogOut, User, TrendingUp, BookOpen, Terminal, Mail, Bell, Dice5 } from 'lucide-react';
import { GameState } from '../types';
import { XP_PER_LEVEL_BASE, XP_MULTIPLIER } from '../constants';

interface NavbarProps {
  currentTab: string;
  setTab: (tab: string) => void;
  gameState: GameState;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setTab, gameState, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [showInbox, setShowInbox] = useState(false);
  const [showUpdates, setShowUpdates] = useState(false);

  const xpForNext = Math.floor(XP_PER_LEVEL_BASE * Math.pow(XP_MULTIPLIER, gameState.level - 1));
  const progress = Math.min(100, (gameState.xp / xpForNext) * 100);

  const unreadCount = gameState.inbox.filter(m => !m.read).length;

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      notation: "compact",
      maximumFractionDigits: 1
    }).format(num);
  };

  const isCasinoActive = ['casino', 'blackjack', 'roulette', 'mines', 'slots'].includes(currentTab);

  const navItems = [
    { id: 'cases', label: 'Cases', icon: LayoutDashboard },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'shop', label: 'Shop', icon: ShoppingBag, disabled: !gameState.config.featureToggles.shop },
    { id: 'casino', label: 'Casino', icon: Dice5, active: isCasinoActive },
    { id: 'stats', label: 'Stats', icon: TrendingUp },
    { id: 'catalog', label: 'Catalog', icon: BookOpen },
    { id: 'upgrader', label: 'Upgrader', icon: Dna, disabled: !gameState.config.featureToggles.upgrader },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 shadow-lg relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center gap-2 cursor-pointer" onClick={() => setTab('cases')}>
            <div className="w-8 h-8 bg-gradient-to-tr from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/20">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-white hidden sm:block">Case<span className="text-yellow-400">Clicker</span></span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden xl:flex items-center space-x-1 overflow-x-auto no-scrollbar max-w-2xl px-2">
            {navItems.filter(i => !i.disabled).map((item) => (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2 flex-shrink-0
                  ${(item.active || currentTab === item.id)
                    ? 'bg-slate-800 text-yellow-400 shadow-inner' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}
                `}
              >
                <item.icon size={16} />
                {item.label}
              </button>
            ))}
          </div>

          {/* Stats Display */}
          <div className="flex items-center gap-3">
             {/* News Icon */}
             <button onClick={() => setShowUpdates(!showUpdates)} className="p-2 text-slate-400 hover:text-white transition-colors relative">
                 <Bell size={20} />
                 {gameState.updates.length > 0 && <div className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full"></div>}
             </button>

             {/* Mail Icon */}
             <button onClick={() => setShowInbox(!showInbox)} className="relative p-2 text-slate-400 hover:text-white transition-colors">
                 <Mail size={20} />
                 {unreadCount > 0 && (
                     <div className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce">
                         {unreadCount}
                     </div>
                 )}
             </button>

             {/* Level/XP */}
             <div className="hidden sm:flex flex-col items-end min-w-[80px]">
                <div className="text-xs font-bold text-slate-300">Lvl {gameState.level}</div>
                <div className="w-24 h-1.5 bg-slate-800 rounded-full mt-1 overflow-hidden">
                    <div 
                        className="h-full bg-blue-500 transition-all duration-500"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* Wallet */}
            <div className="flex items-center gap-2 bg-slate-950/50 px-4 py-1.5 rounded-full border border-slate-800">
                <div className="w-5 h-5 rounded-full bg-yellow-500 flex items-center justify-center text-[10px] font-bold text-yellow-900">
                    $
                </div>
                <span className="font-mono font-bold text-yellow-400">{formatNumber(gameState.balance)}</span>
            </div>

            {/* User Profile / Logout (Desktop) */}
            <div className="hidden md:flex items-center gap-2 border-l border-slate-800 pl-4 ml-2">
               <div className="flex flex-col items-end">
                  <span className={`text-xs font-bold flex items-center gap-1 ${gameState.isPremium ? (gameState.premiumLevel === 2 ? 'text-cyan-400' : 'text-orange-400') : 'text-slate-400'}`}>
                      {gameState.username} 
                      {gameState.isPremium && (
                          gameState.premiumLevel === 2 
                            ? <span className="bg-cyan-500 text-black text-[10px] px-1 rounded font-black tracking-tighter">ROOT</span> 
                            : '👑'
                      )}
                  </span>
                  <button onClick={onLogout} className="text-[10px] text-red-400 hover:text-red-300 flex items-center gap-1">
                    <LogOut size={10} /> Logout
                  </button>
               </div>
               <div className={`w-8 h-8 rounded-full flex items-center justify-center ${gameState.premiumLevel === 2 ? 'bg-cyan-500 text-black border-2 border-white shadow-[0_0_10px_rgba(6,182,212,0.8)]' : (gameState.isPremium ? 'bg-orange-500 text-white' : 'bg-slate-800 text-slate-400')}`}>
                  {gameState.premiumLevel === 2 ? <Terminal size={16} /> : <User size={16} />}
               </div>
            </div>

            {/* Mobile menu button */}
            <div className="xl:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-slate-400 hover:text-white p-2"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Updates Popup */}
      {showUpdates && (
          <div className="absolute right-16 top-16 w-96 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden z-50 animate-in slide-in-from-top-2">
              <div className="bg-slate-950 p-3 border-b border-slate-800 flex justify-between items-center">
                  <h3 className="font-bold text-white flex items-center gap-2"><Bell size={16} /> Patch Notes</h3>
                  <button onClick={() => setShowUpdates(false)}><X size={16} className="text-slate-400 hover:text-white" /></button>
              </div>
              <div className="max-h-96 overflow-y-auto p-4 space-y-4">
                  {gameState.updates.length === 0 ? (
                      <div className="text-slate-500 text-center">No updates yet.</div>
                  ) : (
                      gameState.updates.map(u => (
                          <div key={u.id} className="border-b border-slate-800 pb-4 last:border-0 last:pb-0">
                              <div className="flex justify-between items-center mb-1">
                                  <span className="font-bold text-blue-400">{u.version}</span>
                                  <span className="text-[10px] text-slate-600">{new Date(u.date).toLocaleDateString()}</span>
                              </div>
                              <h4 className="font-bold text-white mb-2">{u.title}</h4>
                              <p className="text-sm text-slate-400 whitespace-pre-wrap">{u.description}</p>
                          </div>
                      ))
                  )}
              </div>
          </div>
      )}

      {/* Inbox Popup */}
      {showInbox && (
          <div className="absolute right-4 top-16 w-80 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden z-50 animate-in slide-in-from-top-2">
              <div className="bg-slate-950 p-3 border-b border-slate-800 flex justify-between items-center">
                  <h3 className="font-bold text-white flex items-center gap-2"><Mail size={16} /> Inbox ({unreadCount})</h3>
                  <button onClick={() => setShowInbox(false)}><X size={16} className="text-slate-400 hover:text-white" /></button>
              </div>
              <div className="max-h-80 overflow-y-auto">
                  {gameState.inbox.length === 0 ? (
                      <div className="p-8 text-center text-slate-500 text-sm">No messages.</div>
                  ) : (
                      gameState.inbox.map(msg => (
                          <div key={msg.id} className={`p-3 border-b border-slate-800/50 hover:bg-slate-800 transition-colors ${!msg.read ? 'bg-slate-800/30' : ''}`}>
                              <div className="flex justify-between items-start mb-1">
                                  <span className={`font-bold text-sm ${!msg.read ? 'text-white' : 'text-slate-400'}`}>{msg.subject}</span>
                                  <span className="text-[10px] text-slate-600">{new Date(msg.timestamp).toLocaleDateString()}</span>
                              </div>
                              <p className="text-xs text-slate-400 line-clamp-2">{msg.body}</p>
                              <div className="mt-2 text-[10px] text-slate-500">From: {msg.from}</div>
                          </div>
                      ))
                  )}
              </div>
          </div>
      )}

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="xl:hidden bg-slate-900 border-b border-slate-800">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.filter(i => !i.disabled).map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setTab(item.id);
                  setIsMenuOpen(false);
                }}
                className={`w-full px-3 py-3 rounded-md text-base font-medium flex items-center gap-3
                  ${(item.active || currentTab === item.id) 
                    ? 'bg-slate-800 text-yellow-400' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
              >
                <item.icon size={20} />
                {item.label}
              </button>
            ))}
            <button
                onClick={() => { onLogout(); setIsMenuOpen(false); }}
                className="w-full px-3 py-3 rounded-md text-base font-medium flex items-center gap-3 text-red-400 hover:bg-slate-800"
            >
                <LogOut size={20} />
                Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};