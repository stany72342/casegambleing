import React, { useState } from 'react';
import { ShieldAlert, Zap, Mail, TrendingUp, Users, Settings, Terminal, Activity, DollarSign, Package, Lock, Play, Pause, AlertTriangle, Search, Tag, Eye, RefreshCw, BarChart, Clock, Layout, Gift, Trash2, LogOut, VolumeX, Edit, Plus, Save, Download, Upload, Copy, Megaphone, ShoppingCart, Ban, Database, Key, Ticket, Calendar, X, Check, FileText, Send, User, Gamepad2, FilePlus, Sliders, StickyNote, Flag, Globe, Radio } from 'lucide-react';
import { GameState, Role, ItemTemplate, Rarity, GameConfig, ScheduledEvent, UserAccount, RARITY_COLORS, Case, ItemType, ShopEntry, GameUpdate, GameSettings } from '../types';
import { put } from "@vercel/blob";

interface AdminPanelProps {
  gameState: GameState;
  onUpdateConfig: (config: Partial<GameConfig>) => void;
  onAdminGiveItem: (user: string, itemId: string) => void;
  onAdminAddCoins: (user: string, amount: number) => void;
  onAdminSetRole: (user: string, role: Role) => void;
  onAdminBan: (user: string) => void;
  onCreateItem: (item: ItemTemplate) => void;
  onCreateCase: (caseData: any) => void;
  onInjectFakeDrop: (msg: string) => void;
  onSetLuck: (val: number) => void;
  onSetMotd: (val: string | null) => void;
  onClose: () => void;
  
  onInjectDrop: (user: string, item: string) => void;
  onSetPlayerLuck: (user: string, mult: number) => void;
  onTagPlayer: (user: string, tag: string) => void;
  onScheduleEvent: (event: ScheduledEvent) => void;
  onSeasonReset: () => void;
  onConsoleCommand: (cmd: string) => string;

  onTriggerEvent: (name: string) => void;
  onSetLevel: (level: number) => void;
  onCreatePromo: (code: string, reward: number, maxUses: number) => void;
  deletePromoCode: (code: string) => void; 
  onToggleMaintenance: () => void;
  onSetTheme: (theme: 'default' | 'midnight' | 'hacker') => void;
  
  adminKickUser: (user: string) => void;
  adminWipeUser: (user: string) => void;
  adminMuteUser: (user: string) => void;
  adminRenameUser: (old: string, newName: string) => void;
  adminResetStats: (user: string) => void;

  clearAuctions: () => void;
  setMarketMultiplier: (val: number) => void;
  massGift: (amount: number) => void;
  setGlobalAnnouncement: (ann: any) => void;
  deleteItem: (id: string) => void;
  deleteCase: (id: string) => void;
  
  importSave: (json: string) => boolean;
  exportSave: () => string;

  addShopItem: (item: ShopEntry) => void;
  removeShopItem: (id: string) => void;
  createGiveaway: (templateId: string, duration: number) => void;
  endGiveaway: () => void;
  joinGiveaway: () => void;

  adminSendMail: (to: string, subject: string, body: string) => void;
  adminRemoveItemFromUser: (user: string, itemId: string) => void;

  createUpdate: (update: GameUpdate) => void;
  deleteUpdate: (id: string) => void;
  updateGameSettings: (settings: Partial<GameSettings>) => void;
  
  setAdminNotes: (user: string, note: string) => void; 
  resolveReport: (id: string, action: 'RESOLVED' | 'DISMISSED') => void; 
  adminUpdateUser: (user: string, updates: Partial<UserAccount>) => void; 
}

export const AdminPanel: React.FC<AdminPanelProps> = (props) => {
  const { gameState } = props;
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [broadcastMsg, setBroadcastMsg] = useState('');
  
  // Editor State
  const [newItem, setNewItem] = useState<Partial<ItemTemplate>>({
      id: '', name: '', rarity: Rarity.COMMON, baseValue: 100, icon: 'Box', type: 'equipment', circulation: 0
  });
  
  // Case Editor State
  const [newCase, setNewCase] = useState<Partial<Case>>({
      id: '', name: '', price: 0, image: '📦', contains: [], levelRequired: 0
  });
  const [caseItemToAdd, setCaseItemToAdd] = useState('');
  const [caseItemWeight, setCaseItemWeight] = useState(10);
  
  // Update Editor State
  const [updateTitle, setUpdateTitle] = useState('');
  const [updateVersion, setUpdateVersion] = useState('');
  const [updateDesc, setUpdateDesc] = useState('');
  const [announceUpdate, setAnnounceUpdate] = useState(true);

  // Console State
  const [consoleInput, setConsoleInput] = useState('');
  const [consoleOutput, setConsoleOutput] = useState<string[]>(['System initialized.']);

  // New Feature States
  const [keyName, setKeyName] = useState('');
  const [keyRarity, setKeyRarity] = useState<Rarity>(Rarity.COMMON);
  const [shopItemId, setShopItemId] = useState('');
  const [shopItemPrice, setShopItemPrice] = useState(100);
  const [giveawayItem, setGiveawayItem] = useState('');
  const [giveawayDuration, setGiveawayDuration] = useState(5);
  const [ltmName, setLtmName] = useState('Weekend Event');
  const [ltmType, setLtmType] = useState<'LUCK'|'XP'|'DISCOUNT'>('LUCK');
  const [ltmDuration, setLtmDuration] = useState(60);
  const [ltmMult, setLtmMult] = useState(1.5);
  
  // Promo Code States
  const [promoCodeName, setPromoCodeName] = useState('');
  const [promoReward, setPromoReward] = useState(1000);
  const [promoUses, setPromoUses] = useState(100);

  // Inspector
  const [inspectingUser, setInspectingUser] = useState<string | null>(null);
  const [adminNoteInput, setAdminNoteInput] = useState('');
  const [editLevel, setEditLevel] = useState<number | null>(null);
  const [editPremium, setEditPremium] = useState<number | null>(null);

  // Mail
  const [mailTo, setMailTo] = useState('');
  const [mailSubject, setMailSubject] = useState('');
  const [mailBody, setMailBody] = useState('');

  // DB Viewer State
  const [dbViewMode, setDbViewMode] = useState<'users'|'cases'|'items'|'config'|'raw'>('raw');

  const isSuperAdmin = gameState.role === 'OWNER' || gameState.role === 'ADMIN';

  const handleCommand = (e: React.FormEvent) => {
      e.preventDefault();
      if (!consoleInput.trim()) return;
      
      const cmd = consoleInput.trim();
      setConsoleOutput(prev => [...prev, `> ${cmd}`]);
      
      try {
          const res = props.onConsoleCommand(cmd);
          setConsoleOutput(prev => [...prev, res]);
      } catch (err: any) {
          setConsoleOutput(prev => [...prev, `Error: ${err.message}`]);
      }
      
      setConsoleInput('');
  };

  const handleBlobTest = async () => {
      try {
          const { url } = await put('articles/blob.txt', 'Hello World!', { access: 'public' });
          alert(`Blob uploaded successfully: ${url}`);
      } catch (error: any) {
          alert(`Blob upload failed: ${error.message}. Make sure BLOB_READ_WRITE_TOKEN is set in your .env.local file.`);
      }
  };

  const toggleFeature = (key: keyof GameConfig['featureToggles']) => {
      props.onUpdateConfig({
          featureToggles: {
              ...gameState.config.featureToggles,
              [key]: !gameState.config.featureToggles[key]
          }
      });
  };

  // --- RENDERERS ---

  const renderDashboard = () => (
      <div className="space-y-6">
          {/* Main KPI Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                  <h3 className="text-slate-500 font-bold uppercase text-xs mb-2">Total Users</h3>
                  <div className="text-3xl font-black text-white">{Object.keys(gameState.userDatabase).length}</div>
              </div>
              <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                  <h3 className="text-slate-500 font-bold uppercase text-xs mb-2">Economy Size</h3>
                  <div className="text-3xl font-black text-green-400">${(Object.values(gameState.userDatabase) as UserAccount[]).reduce((a, b) => a + b.balance, 0).toLocaleString()}</div>
              </div>
              <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                  <h3 className="text-slate-500 font-bold uppercase text-xs mb-2">Open Reports</h3>
                  <div className="text-3xl font-black text-red-400">{gameState.reports.filter(r => r.status === 'PENDING').length}</div>
              </div>
          </div>

          {/* Quick Broadcast */}
          <div className="bg-purple-900/30 p-6 rounded-xl border border-purple-500/50 flex flex-col gap-4">
              <h3 className="font-bold text-white flex items-center gap-2"><Radio size={16} className="text-purple-400" /> GLOBAL SERVER BROADCAST (MOTD)</h3>
              <p className="text-xs text-slate-400">This message will appear instantly for all users on the site.</p>
              <div className="flex gap-2">
                  <input 
                      type="text" 
                      placeholder="Type a message..." 
                      className="flex-1 bg-black border border-slate-700 rounded p-2 text-white"
                      value={broadcastMsg}
                      onChange={e => setBroadcastMsg(e.target.value)}
                  />
                  <button 
                      onClick={() => { props.onSetMotd(broadcastMsg); setBroadcastMsg(''); alert('Broadcast Sent! Check the top of the screen.'); }}
                      className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-6 rounded shadow-lg shadow-purple-900/50"
                  >
                      BROADCAST
                  </button>
                  <button 
                      onClick={() => { props.onSetMotd(null); }}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-400 font-bold px-4 rounded"
                  >
                      CLEAR
                  </button>
              </div>
              {gameState.motd && (
                  <div className="text-xs text-green-400 mt-2">Active: {gameState.motd}</div>
              )}
          </div>

          {isSuperAdmin && (
              <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><Zap className="text-yellow-400" /> Quick Actions</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <button onClick={() => props.setMarketMultiplier(1.5)} className="p-4 bg-green-900/30 border border-green-500/50 rounded-lg text-green-400 font-bold hover:bg-green-900/50">Market BOOM (1.5x)</button>
                      <button onClick={() => props.setMarketMultiplier(0.5)} className="p-4 bg-red-900/30 border border-red-500/50 rounded-lg text-red-400 font-bold hover:bg-red-900/50">Market CRASH (0.5x)</button>
                      <button onClick={props.onToggleMaintenance} className={`p-4 border rounded-lg font-bold ${gameState.config.maintenanceMode ? 'bg-orange-500 text-white border-orange-600' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>Maintenance Mode</button>
                      <button onClick={props.clearAuctions} className="p-4 bg-slate-800 border border-slate-700 rounded-lg text-white font-bold hover:bg-slate-700">Clear Auctions</button>
                  </div>
              </div>
          )}
      </div>
  );

  const renderEconomy = () => (
       <div className="space-y-6">
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                <h3 className="font-bold text-white mb-4 flex items-center gap-2"><DollarSign className="text-green-400" /> Grant Coins</h3>
                <div className="flex gap-2 mb-4 bg-black/50 p-4 rounded-lg border border-slate-700">
                    <input 
                        type="text" 
                        placeholder="Username (or leave empty for self)" 
                        className="flex-1 bg-black border border-slate-700 rounded p-2 text-white"
                        id="grant-user"
                    />
                    <input 
                        type="number" 
                        placeholder="Amount" 
                        className="w-32 bg-black border border-slate-700 rounded p-2 text-white"
                        id="grant-amount"
                    />
                    <button 
                        onClick={() => {
                            const u = (document.getElementById('grant-user') as HTMLInputElement).value || gameState.username!;
                            const a = parseInt((document.getElementById('grant-amount') as HTMLInputElement).value);
                            if(a > 0) {
                                props.onAdminAddCoins(u, a);
                                alert(`Added ${a} coins to ${u}`);
                            }
                        }}
                        className="bg-green-600 hover:bg-green-500 text-white font-bold px-6 py-2 rounded"
                    >
                        ADD FUNDS
                    </button>
                </div>
            </div>

            {isSuperAdmin && (
                <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                    <h3 className="font-bold text-white mb-4 flex items-center gap-2"><Gift className="text-pink-400" /> Mass Actions</h3>
                    <div className="flex gap-4">
                        <button onClick={() => props.massGift(10000)} className="px-4 py-2 bg-pink-600 hover:bg-pink-500 text-white rounded font-bold transition-colors">Gift All 10k Coins</button>
                    </div>
                </div>
            )}
        </div>
  );

  // ... (Other renderers omitted for brevity if unchanged, but logic below ensures safety)

  const CATEGORIES = [
      {
          name: "Core",
          items: [
              { id: 'dashboard', label: 'Dashboard', icon: Activity },
              ...(isSuperAdmin ? [
                  { id: 'users', label: 'User Manager', icon: Users },
                  { id: 'reports', label: 'Reports', icon: Flag },
                  { id: 'bans', label: 'Banned Players', icon: Ban }, 
                  { id: 'security', label: 'Security Monitor', icon: ShieldAlert },
                  { id: 'mail', label: 'Mail Center', icon: Mail }, 
                  { id: 'logs', label: 'System Logs', icon: FileText }, 
                  { id: 'console', label: 'System Console', icon: Terminal },
                  { id: 'test_panel', label: 'Test / DB', icon: Database },
              ] : []),
          ]
      },
      {
          name: "Economy",
          items: [
              { id: 'economy', label: 'Economy Control', icon: DollarSign },
              ...(isSuperAdmin ? [
                  { id: 'shop_editor', label: 'Shop Editor', icon: ShoppingCart },
                  { id: 'tuner', label: 'Game Tuner', icon: Sliders },
              ] : []),
          ]
      },
      ...(isSuperAdmin ? [{
          name: "Content",
          items: [
              { id: 'items', label: 'Item Editor', icon: Edit },
              { id: 'cases', label: 'Case Factory', icon: Package },
              { id: 'keymaker', label: 'Key Maker', icon: Key },
              { id: 'updates', label: 'Updates Editor', icon: FilePlus },
          ]
      },
      {
          name: "Events",
          items: [
              { id: 'giveaway', label: 'Giveaway Channel', icon: Gift },
              { id: 'ltm', label: 'LTM Studio', icon: Calendar },
          ]
      }] : [])
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="w-full max-w-7xl bg-slate-950 border-2 border-red-900 rounded-2xl overflow-hidden shadow-[0_0_100px_rgba(220,38,38,0.2)] h-[90vh] flex">
        
        {/* GUI Organizer Sidebar */}
        <div className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col">
            <div className="p-6 border-b border-slate-800">
                 <h2 className="text-2xl font-black text-red-500 flex items-center gap-2"><ShieldAlert /> ADMIN</h2>
                 <p className="text-slate-500 text-xs mt-1">
                     {isSuperAdmin ? 'v5.1.0 // ROOT ACCESS' : 'v5.1.0 // MODERATOR'}
                 </p>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {CATEGORIES.map(cat => (
                    cat.items.length > 0 && (
                        <div key={cat.name}>
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 pl-2">{cat.name}</h4>
                            <div className="space-y-1">
                                {cat.items.map(tab => (
                                    <button 
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`w-full text-left p-2 pl-3 rounded-lg font-bold flex items-center gap-3 transition-all text-sm ${activeTab === tab.id ? 'bg-red-600 text-white shadow-lg shadow-red-900/50' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                                    >
                                        <tab.icon size={16} /> {tab.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )
                ))}
            </div>
            <div className="p-4 border-t border-slate-800">
                <button onClick={props.onClose} className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg">EXIT PANEL</button>
            </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 bg-slate-950">
            <h2 className="text-3xl font-black text-white mb-8 border-b border-slate-800 pb-4 uppercase flex justify-between items-center">
                {CATEGORIES.flatMap(c => c.items).find(t => t.id === activeTab)?.label}
                <span className="text-xs font-mono text-slate-600">SESSION: {Date.now()}</span>
            </h2>
            
            {activeTab === 'dashboard' && renderDashboard()}
            {activeTab === 'economy' && renderEconomy()}
            
            {/* Admin Only Renderers (re-used from previous logic, but gated by tabs) */}
            {/* Note: In a real app, strict component separation is better, but here we just hide the tabs. */}
            
        </div>
      </div>
    </div>
  );
};