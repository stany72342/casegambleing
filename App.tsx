import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { CaseOpener } from './components/CaseOpener';
import { Inventory } from './components/Inventory';
import { Upgrader } from './components/Upgrader';
import { Slots } from './components/Slots';
import { Blackjack } from './components/Blackjack';
import { Roulette } from './components/Roulette';
import { Mines } from './components/Mines';
import { Shop } from './components/Shop';
import { Login } from './components/Login';
import { AdminPanel } from './components/AdminPanel';
import { Stats } from './components/Stats';
import { Catalog } from './components/Catalog';
import { CasinoHub } from './components/CasinoHub'; 
import { SplashPage } from './components/SplashPage';
import { useGameState } from './hooks/useGameState';
import * as Icons from 'lucide-react';
import { ItemTemplate, Rarity } from './types';

const App = () => {
  const [currentTab, setTab] = useState('cases');
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showSplash, setShowSplash] = useState(() => {
      // Check if user has already accepted rules
      return localStorage.getItem('age_verified') !== 'true';
  });
  
  const { 
    gameState, 
    login,
    logout,
    openCase, 
    addBalance, 
    removeBalance, 
    addItem, 
    removeItem, 
    sellItem, 
    sellItems,
    buyAuctionItem,
    listUserItem,
    cancelUserListing,
    createTradeOffer, 
    redeemTradeCode, 
    addXp, 
    setLevel,
    claimDailyReward,
    getNextRarity,
    getItemsByRarity,
    resetGame,
    buyPremium,
    recordDropStats,
    consumeKey,
    // Admin functions
    setGlobalLuck,
    triggerEvent,
    sendAdminEmail,
    createPromoCode,
    deletePromoCode, // NEW
    redeemPromoCode,
    toggleMaintenance,
    setMotd,
    setTheme,
    // House Functions
    addLog,
    updateConfig,
    adminGiveItem,
    adminAddCoins,
    adminSetRole,
    adminBanUser,
    createItem,
    createCase,
    injectFakeDrop,
    // Advanced House
    injectDrop,
    setPlayerLuck,
    tagPlayer,
    scheduleEvent,
    seasonReset,
    consoleCommand,
    // Trading 2.0
    createTradeListing,
    fulfillTrade,
    cancelTrade,
    // Admin Plus V2
    adminKickUser,
    adminWipeUser,
    adminMuteUser,
    adminRenameUser,
    adminResetStats,
    clearAuctions,
    setMarketMultiplier,
    massGift,
    setGlobalAnnouncement,
    deleteItem,
    deleteCase,
    importSave,
    exportSave,
    // Admin Plus V3
    addShopItem,
    removeShopItem,
    createGiveaway,
    endGiveaway,
    joinGiveaway,
    // Admin Plus V4
    adminSendMail,
    adminRemoveItemFromUser,
    // Admin Plus V5
    createUpdate,
    deleteUpdate,
    updateGameSettings,
    setAdminNotes,
    resolveReport,
    adminUpdateUser,
    // Chat
    sendChatMessage,
    reportUser
  } = useGameState();

  const handleCaseOpen = (caseId: string) => {
    const item = openCase(caseId); 
    return item;
  };

  const handleWinItem = (templateId: string) => {
      addXp(10);
  };

  const handleUpgradeAttempt = (itemId: string, targetTemplateId: string, chance: number) => {
      const finalChance = Math.min(95, chance * gameState.config.upgradeBaseChanceMultiplier);
      const roll = Math.random() * 100;
      const success = roll < finalChance;
      removeItem(itemId); 
      if (success) {
          addItem(targetTemplateId);
          addXp(50);
          return true;
      }
      return false;
  };

  const handleBuyItem = (template: ItemTemplate, price: number) => {
      if (gameState.balance >= price) {
          removeBalance(price);
          addItem(template.id);
          addXp(5);
          alert(`You bought ${template.name}!`);
      }
  };

  const handleAcceptSplash = () => {
      localStorage.setItem('age_verified', 'true');
      setShowSplash(false);
  };

  const getThemeClasses = () => {
      switch(gameState.theme) {
          case 'midnight': return 'bg-slate-950 selection:bg-purple-500 selection:text-white';
          case 'hacker': return 'bg-black selection:bg-green-500 selection:text-black';
          default: return 'bg-slate-950 selection:bg-yellow-500 selection:text-black';
      }
  };

  // If splash is showing, we render it over everything (or exclusively)
  // Rendering it inside the main layout allows backgrounds to load, but we can also just block.
  // Using overlay style inside the div.

  if (!gameState.username && !showSplash) {
      return <Login onLogin={login} />;
  }

  if (gameState.config.maintenanceMode && !gameState.isAdmin && !showSplash) {
      return (
          <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
              <div className="text-center p-8 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-w-lg">
                  <div className="w-24 h-24 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                      <Icons.Construction size={48} className="text-yellow-500" />
                  </div>
                  <h1 className="text-4xl font-black text-white mb-2">MAINTENANCE</h1>
                  <p className="text-slate-400 mb-6">
                      The house is reshuffling the deck.
                  </p>
                  <div className="text-xs text-slate-500 font-mono">Estimated time: 1 Hour</div>
              </div>
          </div>
      );
  }

  // Feature Toggles Check
  const isTabEnabled = (tab: string) => {
      const toggles = gameState.config.featureToggles;
      if (tab === 'upgrader' && !toggles.upgrader) return false;
      if (tab === 'slots' && !toggles.slots) return false;
      if (tab === 'blackjack' && !toggles.blackjack) return false;
      if (tab === 'roulette' && !toggles.roulette) return false;
      if (tab === 'mines' && !toggles.mines) return false;
      if (tab === 'shop' && !toggles.shop) return false;
      return true;
  };

  if (!isTabEnabled(currentTab) && currentTab !== 'cases' && currentTab !== 'casino') {
      setTab('cases');
  }

  return (
    <div className={`min-h-screen text-white font-sans pb-20 relative transition-colors duration-500 ${getThemeClasses()}`}>
      
      {showSplash && <SplashPage onAccept={handleAcceptSplash} />}

      {!showSplash && !gameState.username && (
          // Should not happen due to guard clause above, but safe fallback
          <Login onLogin={login} />
      )}
      
      {/* Main App Content - Only visible if logged in and splash accepted */}
      {!showSplash && gameState.username && (
          <>
            <Navbar currentTab={currentTab} setTab={setTab} gameState={gameState} onLogout={logout} />
            
            {gameState.isAdmin && (
                <button 
                    onClick={() => setShowAdminPanel(true)}
                    className="fixed bottom-4 right-4 z-50 bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-full font-bold shadow-lg shadow-red-900/50 animate-pulse border-2 border-red-400"
                >
                    <Icons.ShieldAlert className="inline-block mr-2" size={16} />
                    HOUSE CONTROL
                </button>
            )}

            {showAdminPanel && (
                <AdminPanel 
                    gameState={gameState} 
                    onClose={() => setShowAdminPanel(false)} 
                    onSetLuck={setGlobalLuck}
                    onTriggerEvent={triggerEvent}
                    onSetLevel={setLevel}
                    onCreatePromo={createPromoCode}
                    deletePromoCode={deletePromoCode} 
                    onToggleMaintenance={toggleMaintenance}
                    onSetMotd={setMotd}
                    onSetTheme={setTheme}
                    onUpdateConfig={updateConfig}
                    onAdminGiveItem={adminGiveItem}
                    onAdminAddCoins={adminAddCoins}
                    onAdminSetRole={adminSetRole}
                    onAdminBan={adminBanUser}
                    onCreateItem={createItem}
                    onCreateCase={createCase}
                    onInjectFakeDrop={injectFakeDrop}
                    onInjectDrop={injectDrop}
                    onSetPlayerLuck={setPlayerLuck}
                    onTagPlayer={tagPlayer}
                    onScheduleEvent={scheduleEvent}
                    onSeasonReset={seasonReset}
                    onConsoleCommand={consoleCommand}
                    adminKickUser={adminKickUser}
                    adminWipeUser={adminWipeUser}
                    // V2 Props
                    adminMuteUser={adminMuteUser}
                    adminRenameUser={adminRenameUser}
                    adminResetStats={adminResetStats}
                    clearAuctions={clearAuctions}
                    setMarketMultiplier={setMarketMultiplier}
                    massGift={massGift}
                    setGlobalAnnouncement={setGlobalAnnouncement}
                    deleteItem={deleteItem}
                    deleteCase={deleteCase}
                    importSave={importSave}
                    exportSave={exportSave}
                    // V3 Props
                    addShopItem={addShopItem}
                    removeShopItem={removeShopItem}
                    createGiveaway={createGiveaway}
                    endGiveaway={endGiveaway}
                    joinGiveaway={joinGiveaway}
                    // V4 Props
                    adminSendMail={adminSendMail}
                    adminRemoveItemFromUser={adminRemoveItemFromUser}
                    // V5 Props
                    createUpdate={createUpdate}
                    deleteUpdate={deleteUpdate}
                    updateGameSettings={updateGameSettings}
                    setAdminNotes={setAdminNotes}
                    resolveReport={resolveReport}
                    adminUpdateUser={adminUpdateUser}
                />
            )}

            {/* MOTD Banner */}
            {gameState.motd && (
                <div className="bg-purple-900/90 text-white font-bold text-center py-2 px-4 shadow-lg flex items-center justify-center gap-2 relative z-40 border-b border-purple-500 animate-in slide-in-from-top">
                    <Icons.Info size={16} className="animate-pulse text-purple-300" />
                    <span className="uppercase tracking-wide">{gameState.motd}</span>
                </div>
            )}

            {/* Global Announcement Popup */}
            {gameState.config.announcement && gameState.config.announcement.active && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in zoom-in duration-300">
                    <div className="bg-slate-900 border-2 border-blue-500 rounded-2xl p-8 max-w-lg text-center shadow-[0_0_50px_rgba(59,130,246,0.3)]">
                        <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Icons.Megaphone size={32} className="text-blue-400" />
                        </div>
                        <h2 className="text-3xl font-black text-white mb-4">ANNOUNCEMENT</h2>
                        <p className="text-xl text-slate-300 mb-8">{gameState.config.announcement.message}</p>
                        <button 
                            onClick={() => setGlobalAnnouncement(null)}
                            className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg"
                        >
                            ACKNOWLEDGE
                        </button>
                    </div>
                </div>
            )}

            {/* Active Giveaway Popup */}
            {gameState.config.activeGiveaway && !gameState.config.activeGiveaway.winner && (
                <div className="fixed bottom-4 left-4 z-40 animate-in slide-in-from-left duration-500">
                    <div className="bg-pink-900/90 border border-pink-500 rounded-xl p-4 shadow-[0_0_20px_rgba(236,72,153,0.3)] max-w-xs">
                        <div className="flex items-center gap-2 mb-2">
                            <Icons.Gift className="text-pink-400 animate-bounce" size={20} />
                            <h4 className="font-bold text-white">LIVE GIVEAWAY</h4>
                        </div>
                        <div className="text-sm text-pink-200 mb-3">
                            Win a <span className="font-bold text-white">{gameState.items[gameState.config.activeGiveaway.prizeTemplateId]?.name}</span>!
                        </div>
                        <div className="text-xs text-slate-400 mb-3">
                            Entrants: {gameState.config.activeGiveaway.entrants.length}
                        </div>
                        {!gameState.config.activeGiveaway.entrants.includes(gameState.username!) ? (
                            <button 
                                onClick={joinGiveaway}
                                className="w-full py-2 bg-pink-600 hover:bg-pink-500 text-white font-bold rounded text-xs transition-colors"
                            >
                                JOIN NOW
                            </button>
                        ) : (
                            <div className="text-center text-xs font-bold text-green-400 bg-green-900/30 p-2 rounded">
                                ENTERED ✓
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Giveaway Winner Popup */}
            {gameState.config.activeGiveaway && gameState.config.activeGiveaway.winner && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in zoom-in duration-300">
                    <div className="bg-slate-900 border-2 border-pink-500 rounded-2xl p-8 max-w-lg text-center shadow-[0_0_50px_rgba(236,72,153,0.3)] relative overflow-hidden">
                        <div className="absolute inset-0 bg-pink-500/10 animate-pulse"></div>
                        <div className="relative z-10">
                            <h2 className="text-4xl font-black text-white mb-2">GIVEAWAY ENDED</h2>
                            <div className="text-xl text-pink-400 font-bold mb-6">Winner: {gameState.config.activeGiveaway.winner}</div>
                            <div className="w-32 h-32 mx-auto bg-slate-800 rounded-xl flex items-center justify-center mb-6 border border-slate-600">
                                <Icons.Gift size={48} className="text-pink-500" />
                            </div>
                            <button 
                                onClick={endGiveaway} // Admin can close, or user can dismiss local view (here we assume admin or global reset)
                                className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg"
                            >
                                CLOSE
                            </button>
                        </div>
                    </div>
                </div>
            )}


            {/* Active Event Banner */}
            {gameState.config.activeEvent && (
                <div className="bg-gradient-to-r from-yellow-600 to-orange-600 text-white font-bold text-center py-2 px-4 shadow-lg animate-pulse flex items-center justify-center gap-2 relative z-40">
                    <Icons.Zap size={16} />
                    EVENT ACTIVE: {gameState.config.activeEvent}
                    <Icons.Zap size={16} />
                </div>
            )}

            <main className="container mx-auto px-4 mt-8 animate-in fade-in duration-500">
                {currentTab === 'cases' && (
                    <>
                        <div className="text-center mb-10">
                            <h1 className="text-4xl md:text-5xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-500">
                                OPEN CASES. GET RICH.
                            </h1>
                            <p className="text-slate-400 max-w-lg mx-auto">
                                Test your luck, collect legendary items, and climb the leaderboards. 
                                Daily reward available every 24h.
                            </p>
                            <div className="mt-6 flex justify-center gap-4">
                                <button 
                                    onClick={claimDailyReward}
                                    className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-bold transition-colors border border-slate-700"
                                >
                                    <Icons.Calendar size={16} /> Daily Reward
                                </button>
                            </div>
                        </div>
                        <CaseOpener 
                            gameState={gameState} 
                            onOpen={handleCaseOpen} 
                            onWin={handleWinItem} 
                            removeBalance={removeBalance}
                        />
                    </>
                )}
                
                {currentTab === 'inventory' && (
                    <Inventory gameState={gameState} onSell={sellItem} onSellBulk={sellItems} />
                )}

                {currentTab === 'shop' && (
                    <Shop gameState={gameState} addBalance={addBalance} onBuyItem={handleBuyItem} />
                )}

                {/* Casino Routing */}
                {currentTab === 'casino' && (
                    <CasinoHub onSelectGame={setTab} />
                )}

                {currentTab === 'blackjack' && (
                    <div className="space-y-4">
                        <button onClick={() => setTab('casino')} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                            <Icons.ArrowLeft size={20} /> Back to Casino
                        </button>
                        <Blackjack 
                            gameState={gameState}
                            onGameEnd={(amount) => {
                                addBalance(amount);
                                addXp(15);
                            }}
                            removeBalance={removeBalance}
                        />
                    </div>
                )}

                {currentTab === 'roulette' && (
                    <div className="space-y-4">
                        <button onClick={() => setTab('casino')} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                            <Icons.ArrowLeft size={20} /> Back to Casino
                        </button>
                        <Roulette
                            gameState={gameState}
                            onWin={(amount) => {
                                addBalance(amount);
                                addXp(20);
                            }}
                            removeBalance={removeBalance}
                        />
                    </div>
                )}

                {currentTab === 'mines' && (
                    <div className="space-y-4">
                        <button onClick={() => setTab('casino')} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                            <Icons.ArrowLeft size={20} /> Back to Casino
                        </button>
                        <Mines
                            gameState={gameState}
                            onGameEnd={(amount) => {
                                addBalance(amount);
                                addXp(25);
                            }}
                            removeBalance={removeBalance}
                        />
                    </div>
                )}

                {currentTab === 'slots' && (
                    <div className="space-y-4">
                        <button onClick={() => setTab('casino')} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                            <Icons.ArrowLeft size={20} /> Back to Casino
                        </button>
                        <Slots 
                            gameState={gameState}
                            onSpinResult={(amount) => {
                                addBalance(amount);
                                addXp(5);
                            }}
                            removeBalance={removeBalance}
                        />
                    </div>
                )}

                {currentTab === 'stats' && (
                    <Stats gameState={gameState} onRedeemCode={redeemPromoCode} />
                )}

                {currentTab === 'catalog' && (
                    <Catalog />
                )}
                
                {currentTab === 'upgrader' && (
                    <Upgrader 
                        gameState={gameState} 
                        onUpgradeAttempt={handleUpgradeAttempt} 
                        getNextRarity={getNextRarity}
                        getItemsByRarity={getItemsByRarity}
                    />
                )}
            </main>

            {/* FOOTER */}
            <footer className="py-12 text-center space-y-2">
                <div className="text-xs text-slate-600 font-bold uppercase tracking-widest">
                    Made By Prosoft Network
                </div>
                <div className="text-[10px] text-slate-700 font-bold uppercase flex items-center justify-center gap-2">
                    <span className="text-red-900/60">18+ ONLY</span>
                    <span className="w-1 h-1 bg-slate-800 rounded-full"></span>
                    <span className="text-slate-700">You must be over 18 to play</span>
                </div>
            </footer>
          </>
      )}
    </div>
  );
};

export default App;