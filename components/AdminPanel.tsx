import React, { useState } from 'react';
import { ShieldAlert, Zap, Mail, TrendingUp, Users, Settings, Terminal, Activity, DollarSign, Package, Lock, Play, Pause, AlertTriangle, Search, Tag, Eye, RefreshCw, BarChart, Clock, Layout, Gift, Trash2, LogOut, VolumeX, Edit, Plus, Save, Download, Upload, Copy, Megaphone, ShoppingCart, Ban, Database, Key, Ticket, Calendar, X, Check, FileText, Send, User, Gamepad2, FilePlus, Sliders, StickyNote, Flag, Globe, Radio } from 'lucide-react';
import { GameState, Role, ItemTemplate, Rarity, GameConfig, ScheduledEvent, UserAccount, RARITY_COLORS, Case, ItemType, ShopEntry, GameUpdate, GameSettings } from '../types';

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
  // onSendEmail removed as it was unused and caused type mismatch
  onSetLevel: (level: number) => void;
  onCreatePromo: (code: string, reward: number, maxUses: number) => void;
  deletePromoCode: (code: string) => void; // New
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

          <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><Zap className="text-yellow-400" /> Quick Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <button onClick={() => props.setMarketMultiplier(1.5)} className="p-4 bg-green-900/30 border border-green-500/50 rounded-lg text-green-400 font-bold hover:bg-green-900/50">Market BOOM (1.5x)</button>
                  <button onClick={() => props.setMarketMultiplier(0.5)} className="p-4 bg-red-900/30 border border-red-500/50 rounded-lg text-red-400 font-bold hover:bg-red-900/50">Market CRASH (0.5x)</button>
                  <button onClick={props.onToggleMaintenance} className={`p-4 border rounded-lg font-bold ${gameState.config.maintenanceMode ? 'bg-orange-500 text-white border-orange-600' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>Maintenance Mode</button>
                  <button onClick={props.clearAuctions} className="p-4 bg-slate-800 border border-slate-700 rounded-lg text-white font-bold hover:bg-slate-700">Clear Auctions</button>
              </div>
          </div>

          <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Gamepad2 className="text-purple-400" /> Game Mode Toggles (LTM)</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(gameState.config.featureToggles).map(([key, enabled]) => (
                      <button 
                        key={key} 
                        onClick={() => toggleFeature(key as any)}
                        className={`p-3 border rounded-lg font-bold uppercase text-xs flex justify-between items-center ${enabled ? 'bg-green-900/30 border-green-500/50 text-green-400' : 'bg-red-900/30 border-red-500/50 text-red-400'}`}
                      >
                          {key} <span>{enabled ? 'ON' : 'OFF'}</span>
                      </button>
                  ))}
              </div>
          </div>
      </div>
  );

  const renderEconomy = () => (
       <div className="space-y-6">
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                <h3 className="font-bold text-white mb-4 flex items-center gap-2"><Gift className="text-pink-400" /> Mass Actions</h3>
                <div className="flex gap-4">
                    <button onClick={() => props.massGift(10000)} className="px-4 py-2 bg-pink-600 hover:bg-pink-500 text-white rounded font-bold transition-colors">Gift All 10k Coins</button>
                </div>
            </div>

            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                <h3 className="font-bold text-white mb-4 flex items-center gap-2"><Ticket className="text-green-400" /> Promo Code Maker</h3>
                
                <div className="flex gap-4 mb-6">
                    <div className="flex-1">
                        <label className="text-xs text-slate-500 font-bold uppercase block mb-1">Code Name</label>
                        <input 
                            type="text" 
                            className="w-full bg-black border border-slate-700 rounded p-2 text-white uppercase font-mono" 
                            placeholder="SUMMER2025" 
                            value={promoCodeName}
                            onChange={e => setPromoCodeName(e.target.value.toUpperCase())}
                        />
                    </div>
                    <div className="w-32">
                        <label className="text-xs text-slate-500 font-bold uppercase block mb-1">Reward ($)</label>
                        <input 
                            type="number" 
                            className="w-full bg-black border border-slate-700 rounded p-2 text-white" 
                            value={promoReward}
                            onChange={e => setPromoReward(parseInt(e.target.value))}
                        />
                    </div>
                    <div className="w-24">
                        <label className="text-xs text-slate-500 font-bold uppercase block mb-1">Uses</label>
                        <input 
                            type="number" 
                            className="w-full bg-black border border-slate-700 rounded p-2 text-white" 
                            placeholder="-1 for inf"
                            value={promoUses}
                            onChange={e => setPromoUses(parseInt(e.target.value))}
                        />
                    </div>
                    <div className="flex items-end">
                        <button 
                            onClick={() => {
                                if(promoCodeName && promoReward > 0) {
                                    props.onCreatePromo(promoCodeName, promoReward, promoUses);
                                    setPromoCodeName('');
                                    alert(`Code ${promoCodeName} Created!`);
                                }
                            }}
                            className="bg-green-600 hover:bg-green-500 text-white font-bold px-6 py-2 rounded h-[42px]"
                        >
                            CREATE
                        </button>
                    </div>
                </div>

                <div className="bg-black/30 rounded-lg border border-slate-800 overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-800 text-slate-400 font-bold uppercase text-xs">
                            <tr>
                                <th className="p-3">Code</th>
                                <th className="p-3">Reward</th>
                                <th className="p-3">Uses</th>
                                <th className="p-3 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800 text-slate-300">
                            {gameState.promoCodes.map((code) => (
                                <tr key={code.code}>
                                    <td className="p-3 font-mono text-white">{code.code}</td>
                                    <td className="p-3 text-green-400">${code.reward.toLocaleString()}</td>
                                    <td className="p-3">{code.currentUses} / {code.maxUses === -1 ? '∞' : code.maxUses}</td>
                                    <td className="p-3 text-right">
                                        <button 
                                            onClick={() => props.deletePromoCode(code.code)}
                                            className="text-red-500 hover:text-red-400 hover:bg-red-900/30 p-2 rounded"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {gameState.promoCodes.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-slate-500 italic">No active promo codes.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
  );

  const renderItemEditor = () => (
      <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
          <h3 className="font-bold text-white mb-4">Quick Item Creator</h3>
          <input type="text" placeholder="ID" className="w-full mb-2 bg-black border border-slate-700 rounded p-2 text-white" value={newItem.id} onChange={e => setNewItem({...newItem, id: e.target.value})} />
          <input type="text" placeholder="Name" className="w-full mb-2 bg-black border border-slate-700 rounded p-2 text-white" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} />
          <button onClick={() => { if(newItem.id) props.onCreateItem(newItem as ItemTemplate); }} className="w-full bg-blue-600 text-white font-bold py-2 rounded">Create</button>
      </div>
  );
  
  const addCaseItem = () => {
      if (!caseItemToAdd) return;
      setNewCase(prev => ({
          ...prev,
          contains: [...(prev.contains || []), { templateId: caseItemToAdd, weight: caseItemWeight }]
      }));
  };

  const renderCaseEditor = () => (
      <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 space-y-6">
           <h3 className="font-bold text-white mb-4 text-xl flex items-center gap-2"><Package className="text-yellow-400" /> Case Factory</h3>
           
           {/* Basic Info */}
           <div className="grid grid-cols-2 gap-4">
               <div>
                   <label className="text-xs text-slate-500 font-bold uppercase">Case Name</label>
                   <input type="text" className="w-full bg-black border border-slate-700 rounded p-2 text-white" value={newCase.name} onChange={e => setNewCase({...newCase, name: e.target.value})} placeholder="e.g. Dragon Case" />
               </div>
               <div>
                   <label className="text-xs text-slate-500 font-bold uppercase">Icon (Emoji)</label>
                   <input type="text" className="w-full bg-black border border-slate-700 rounded p-2 text-white" value={newCase.image} onChange={e => setNewCase({...newCase, image: e.target.value})} placeholder="e.g. 🐉" />
               </div>
               <div>
                   <label className="text-xs text-slate-500 font-bold uppercase">Price</label>
                   <input type="number" className="w-full bg-black border border-slate-700 rounded p-2 text-white" value={newCase.price} onChange={e => setNewCase({...newCase, price: parseInt(e.target.value)})} />
               </div>
               <div>
                   <label className="text-xs text-slate-500 font-bold uppercase">Level Req</label>
                   <input type="number" className="w-full bg-black border border-slate-700 rounded p-2 text-white" value={newCase.levelRequired} onChange={e => setNewCase({...newCase, levelRequired: parseInt(e.target.value)})} />
               </div>
           </div>

           {/* Add Items */}
           <div className="bg-black/30 p-4 rounded-lg border border-slate-700">
               <h4 className="text-sm font-bold text-slate-400 mb-2">Add Content</h4>
               <div className="flex gap-2">
                   <select className="flex-1 bg-slate-900 border border-slate-700 rounded p-2 text-white" value={caseItemToAdd} onChange={e => setCaseItemToAdd(e.target.value)}>
                       <option value="">Select Item...</option>
                       {(Object.values(gameState.items) as ItemTemplate[]).map(i => <option key={i.id} value={i.id}>{i.name} ({i.rarity})</option>)}
                   </select>
                   <input type="number" className="w-24 bg-slate-900 border border-slate-700 rounded p-2 text-white" placeholder="Weight" value={caseItemWeight} onChange={e => setCaseItemWeight(parseInt(e.target.value))} />
                   <button onClick={addCaseItem} className="bg-blue-600 text-white px-4 rounded font-bold">ADD</button>
               </div>
           </div>

           {/* Preview */}
           <div>
               <h4 className="text-sm font-bold text-slate-400 mb-2">Contents Preview ({newCase.contains?.length || 0})</h4>
               <div className="space-y-1 max-h-40 overflow-y-auto">
                   {newCase.contains?.map((c, i) => (
                       <div key={i} className="flex justify-between text-sm bg-slate-800 p-2 rounded">
                           <span>{gameState.items[c.templateId]?.name}</span>
                           <span className="text-slate-400">Weight: {c.weight}</span>
                           <button onClick={() => setNewCase(prev => ({...prev, contains: prev.contains?.filter((_, idx) => idx !== i)}))} className="text-red-500">X</button>
                       </div>
                   ))}
               </div>
           </div>

           <button onClick={() => {
               if(newCase.name && newCase.contains?.length) {
                   props.onCreateCase({ ...newCase, id: newCase.name?.toLowerCase().replace(/\s/g, '_'), description: `Contains ${newCase.contains.length} items.` });
                   setNewCase({ name: '', price: 0, image: '', contains: [], levelRequired: 0 });
                   setCaseItemToAdd('');
                   alert('Case Created Successfully!');
               }
           }} className="w-full py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg shadow-lg">
               PUBLISH CASE
           </button>

           {/* Existing Cases List for Deletion */}
           <div className="mt-8 pt-8 border-t border-slate-800">
                <h4 className="text-sm font-bold text-red-400 mb-4">Manage Existing Cases</h4>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                    {gameState.cases.map(c => (
                        <div key={c.id} className="flex justify-between items-center bg-slate-950 p-2 rounded border border-slate-800">
                            <span className="text-xs font-bold text-white">{c.name}</span>
                            <button onClick={() => props.deleteCase(c.id)} className="text-red-500 hover:bg-red-900/50 p-1 rounded"><Trash2 size={12} /></button>
                        </div>
                    ))}
                </div>
           </div>
      </div>
  );

  const renderKeyMaker = () => (
      <div className="space-y-6">
          <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Key className="text-orange-400" /> Key Factory</h3>
              <div className="grid grid-cols-2 gap-4">
                  <input type="text" placeholder="Key Name" className="bg-black border border-slate-700 rounded p-2 text-white" value={keyName} onChange={e => setKeyName(e.target.value)} />
                  <select className="bg-black border border-slate-700 rounded p-2 text-white" value={keyRarity} onChange={e => setKeyRarity(e.target.value as Rarity)}>
                      {Object.keys(RARITY_COLORS).map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
              </div>
              <button onClick={() => {
                  const id = keyName.toLowerCase().replace(/\s+/g, '_') + '_key';
                  props.onCreateItem({ id, name: keyName, rarity: keyRarity, baseValue: 500, icon: 'Key', type: 'key', circulation: 0 });
                  alert(`Created ${keyName}`);
              }} className="w-full mt-4 py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-lg">FORGE KEY</button>
          </div>
      </div>
  );

  const renderShopEditor = () => (
      <div className="space-y-6">
          <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
              <h3 className="text-xl font-bold text-white mb-4"><ShoppingCart className="inline mr-2 text-green-400" /> Shop Editor</h3>
              <div className="flex gap-2 mb-4">
                   <select className="flex-1 bg-black border border-slate-700 rounded p-2 text-white" value={shopItemId} onChange={e => setShopItemId(e.target.value)}>
                        <option value="">Select Item...</option>
                        {(Object.values(gameState.items) as ItemTemplate[]).filter(i => !i.hidden).map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                   </select>
                   <input type="number" className="w-24 bg-black border border-slate-700 rounded p-2 text-white" placeholder="Price" value={shopItemPrice} onChange={e => setShopItemPrice(parseInt(e.target.value))} />
                   <button onClick={() => { if(shopItemId) props.addShopItem({ id: crypto.randomUUID(), templateId: shopItemId, price: shopItemPrice, featured: false }); }} className="bg-green-600 text-white px-4 rounded font-bold">ADD</button>
              </div>
              <div className="space-y-2">
                  {gameState.config.shopConfig.map(entry => (
                      <div key={entry.id} className="flex justify-between items-center bg-black/30 p-3 rounded border border-slate-700">
                          <span className="text-white">{gameState.items[entry.templateId]?.name} - ${entry.price}</span>
                          <button onClick={() => props.removeShopItem(entry.id)} className="text-red-500"><X size={16} /></button>
                      </div>
                  ))}
              </div>
          </div>
      </div>
  );

  const renderGiveaway = () => (
       <div className="space-y-6">
          <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
              <h3 className="text-xl font-bold text-white mb-4"><Gift className="inline mr-2 text-pink-400" /> Giveaway Channel</h3>
              {gameState.config.activeGiveaway ? (
                  <div className="bg-pink-900/20 border border-pink-500 p-4 rounded-xl text-center">
                      <h4 className="text-pink-400 font-bold">ACTIVE GIVEAWAY</h4>
                      <div className="text-white">{gameState.items[gameState.config.activeGiveaway.prizeTemplateId]?.name}</div>
                      <button onClick={props.endGiveaway} className="mt-4 bg-red-600 text-white px-6 py-2 rounded-lg font-bold">END</button>
                  </div>
              ) : (
                  <div className="space-y-4">
                      <select className="w-full bg-black border border-slate-700 rounded p-2 text-white" value={giveawayItem} onChange={e => setGiveawayItem(e.target.value)}>
                            <option value="">Select Prize...</option>
                            {(Object.values(gameState.items) as ItemTemplate[]).map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                       </select>
                       <input type="number" className="w-full bg-black border border-slate-700 rounded p-2 text-white" value={giveawayDuration} onChange={e => setGiveawayDuration(parseInt(e.target.value))} placeholder="Duration (mins)" />
                       <button onClick={() => props.createGiveaway(giveawayItem, giveawayDuration)} className="w-full bg-pink-600 hover:bg-pink-500 text-white font-bold py-3 rounded-lg">START</button>
                  </div>
              )}
          </div>
       </div>
  );

  const renderLTM = () => (
      <div className="space-y-6">
          <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
              <h3 className="text-xl font-bold text-white mb-4"><Calendar className="inline mr-2 text-purple-400" /> Event Scheduler (LTM)</h3>
              <div className="space-y-4">
                  <input type="text" className="w-full bg-black border border-slate-700 rounded p-2 text-white" placeholder="Event Name" value={ltmName} onChange={e => setLtmName(e.target.value)} />
                  <div className="flex gap-4">
                       <select className="flex-1 bg-black border border-slate-700 rounded p-2 text-white" value={ltmType} onChange={e => setLtmType(e.target.value as any)}>
                            <option value="LUCK">Luck Boost</option>
                            <option value="XP">XP Boost</option>
                            <option value="DISCOUNT">Discount</option>
                       </select>
                       <input type="number" className="w-24 bg-black border border-slate-700 rounded p-2 text-white" placeholder="Mult" value={ltmMult} onChange={e => setLtmMult(parseFloat(e.target.value))} />
                  </div>
                  <input type="number" className="w-full bg-black border border-slate-700 rounded p-2 text-white" placeholder="Duration (Minutes)" value={ltmDuration} onChange={e => setLtmDuration(parseInt(e.target.value))} />
                  
                  <button onClick={() => {
                      props.onScheduleEvent({
                          id: crypto.randomUUID(),
                          name: ltmName,
                          startTime: Date.now(),
                          durationMinutes: ltmDuration,
                          type: ltmType,
                          multiplier: ltmMult
                      });
                      alert('Event Scheduled!');
                  }} className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-lg">START EVENT NOW</button>
              </div>
          </div>
      </div>
  );

  const renderUpdatesEditor = () => (
      <div className="space-y-6">
          <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
              <h3 className="text-xl font-bold text-white mb-4"><FilePlus className="inline mr-2 text-blue-400" /> Push Update / Patch Notes</h3>
              <div className="space-y-4 mb-8">
                  <div className="flex gap-4">
                       <input type="text" className="w-32 bg-black border border-slate-700 rounded p-2 text-white" placeholder="v1.0.0" value={updateVersion} onChange={e => setUpdateVersion(e.target.value)} />
                       <input type="text" className="flex-1 bg-black border border-slate-700 rounded p-2 text-white" placeholder="Update Title" value={updateTitle} onChange={e => setUpdateTitle(e.target.value)} />
                  </div>
                  <textarea className="w-full h-32 bg-black border border-slate-700 rounded p-2 text-white" placeholder="Description / Patch Notes..." value={updateDesc} onChange={e => setUpdateDesc(e.target.value)} />
                  
                  <div className="flex items-center gap-2">
                      <input type="checkbox" checked={announceUpdate} onChange={e => setAnnounceUpdate(e.target.checked)} className="rounded bg-black border-slate-700" />
                      <label className="text-sm text-slate-400">Broadcast Global Announcement</label>
                  </div>

                  <button onClick={() => {
                      if(updateTitle && updateVersion) {
                          props.createUpdate({
                              id: crypto.randomUUID(),
                              version: updateVersion,
                              title: updateTitle,
                              description: updateDesc,
                              date: Date.now(),
                              author: 'Admin'
                          });
                          
                          if (announceUpdate) {
                              props.setGlobalAnnouncement({
                                  id: crypto.randomUUID(),
                                  message: `NEW UPDATE: ${updateTitle} (${updateVersion}) is live! Check patch notes.`,
                                  color: 'green',
                                  active: true
                              });
                          }

                          setUpdateTitle(''); setUpdateVersion(''); setUpdateDesc('');
                          alert('Update Published!');
                      }
                  }} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded">PUBLISH UPDATE</button>
              </div>

              <h4 className="font-bold text-white mb-2">History</h4>
              <div className="space-y-2">
                  {gameState.updates.map(u => (
                      <div key={u.id} className="bg-black/30 p-3 rounded border border-slate-700 flex justify-between items-start">
                          <div>
                              <div className="font-bold text-white">{u.version} - {u.title}</div>
                              <div className="text-xs text-slate-500">{new Date(u.date).toLocaleDateString()}</div>
                          </div>
                          <button onClick={() => props.deleteUpdate(u.id)} className="text-red-500 hover:text-red-400"><Trash2 size={16} /></button>
                      </div>
                  ))}
              </div>
          </div>
      </div>
  );

  const renderGameTuner = () => (
      <div className="space-y-6">
          <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
              <h3 className="text-xl font-bold text-white mb-4"><Sliders className="inline mr-2 text-yellow-400" /> Game Mechanics Tuner</h3>
              <div className="grid grid-cols-2 gap-6">
                  <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Blackjack Payout</label>
                      <input 
                        type="number" step="0.1" 
                        className="w-full bg-black border border-slate-700 rounded p-2 text-white" 
                        value={gameState.config.gameSettings.blackjackPayout} 
                        onChange={e => props.updateGameSettings({ blackjackPayout: parseFloat(e.target.value) })} 
                      />
                  </div>
                  <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Slot RTP (0-1)</label>
                      <input 
                        type="number" step="0.01" 
                        className="w-full bg-black border border-slate-700 rounded p-2 text-white" 
                        value={gameState.config.gameSettings.slotRtp} 
                        onChange={e => props.updateGameSettings({ slotRtp: parseFloat(e.target.value) })} 
                      />
                  </div>
                  <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Mines House Edge</label>
                      <input 
                        type="number" step="0.01" 
                        className="w-full bg-black border border-slate-700 rounded p-2 text-white" 
                        value={gameState.config.gameSettings.minesHouseEdge} 
                        onChange={e => props.updateGameSettings({ minesHouseEdge: parseFloat(e.target.value) })} 
                      />
                  </div>
                  <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Global Luck Multiplier</label>
                      <input 
                        type="number" step="0.1" 
                        className="w-full bg-black border border-slate-700 rounded p-2 text-white" 
                        value={gameState.config.globalLuckMultiplier} 
                        onChange={e => props.onSetLuck(parseFloat(e.target.value) )} 
                      />
                  </div>
              </div>
          </div>
      </div>
  );

  const renderDbViewer = () => {
      const getData = () => {
          switch(dbViewMode) {
              case 'users': return gameState.userDatabase;
              case 'cases': return gameState.cases;
              case 'items': return gameState.items;
              case 'config': return gameState.config;
              default: return gameState;
          }
      }

      return (
          <div className="h-full flex flex-col space-y-4">
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex justify-between items-center">
                  <div className="flex gap-2">
                      <button onClick={() => setDbViewMode('raw')} className={`px-4 py-2 rounded font-bold text-xs ${dbViewMode === 'raw' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}>FULL DUMP</button>
                      <button onClick={() => setDbViewMode('users')} className={`px-4 py-2 rounded font-bold text-xs ${dbViewMode === 'users' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}>USERS TABLE</button>
                      <button onClick={() => setDbViewMode('cases')} className={`px-4 py-2 rounded font-bold text-xs ${dbViewMode === 'cases' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}>CASES TABLE</button>
                      <button onClick={() => setDbViewMode('config')} className={`px-4 py-2 rounded font-bold text-xs ${dbViewMode === 'config' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}>CONFIG</button>
                  </div>
                  <div className="flex gap-2">
                      <button onClick={() => { if(confirm("Overwrite DB with this JSON?")) props.importSave(JSON.stringify(getData())); }} className="px-4 py-2 bg-yellow-600 hover:bg-yellow-500 text-white font-bold rounded text-xs">IMPORT JSON</button>
                      <button onClick={() => { navigator.clipboard.writeText(props.exportSave()); alert("Copied to clipboard!"); }} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded text-xs">COPY JSON</button>
                  </div>
              </div>

              <div className="flex-1 bg-black border border-slate-800 rounded-xl overflow-hidden relative">
                  <textarea 
                    className="w-full h-full bg-black text-green-400 font-mono text-xs p-4 resize-none focus:outline-none"
                    value={JSON.stringify(getData(), null, 2)}
                    readOnly
                  />
              </div>
              
              <div className="bg-red-900/20 border border-red-900 p-4 rounded-xl">
                  <h4 className="text-red-500 font-bold mb-2 flex items-center gap-2"><AlertTriangle size={16} /> Danger Zone</h4>
                  <div className="flex gap-4">
                      <button onClick={props.onSeasonReset} className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded text-xs">WIPE ALL USERS</button>
                      <button onClick={() => { if(confirm("Hard Reset?")) { localStorage.clear(); window.location.reload(); } }} className="px-4 py-2 bg-red-900 hover:bg-red-800 text-white font-bold rounded text-xs">HARD RESET (FACTORY)</button>
                  </div>
              </div>
          </div>
      );
  };

  const renderReports = () => (
      <div className="space-y-6">
          <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Flag className="text-red-500" /> Player Reports</h3>
              <div className="space-y-4">
                  {gameState.reports.filter(r => r.status === 'PENDING').length === 0 ? (
                      <div className="text-center p-8 text-slate-500 italic">No pending reports. Great job!</div>
                  ) : (
                      gameState.reports.filter(r => r.status === 'PENDING').map(report => (
                          <div key={report.id} className="bg-slate-950 border border-slate-700 p-4 rounded-lg flex justify-between items-center">
                              <div>
                                  <div className="flex items-center gap-2 mb-1">
                                      <span className="font-bold text-red-400">{report.suspect}</span>
                                      <span className="text-xs text-slate-500">reported by {report.reporter}</span>
                                  </div>
                                  <div className="text-sm text-white font-bold bg-slate-800 inline-block px-2 py-0.5 rounded mb-1">{report.reason}</div>
                                  <div className="text-xs text-slate-600">{new Date(report.timestamp).toLocaleString()}</div>
                              </div>
                              <div className="flex gap-2">
                                  <button onClick={() => props.resolveReport(report.id, 'DISMISSED')} className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded">DISMISS</button>
                                  <button onClick={() => { props.onAdminBan(report.suspect); props.resolveReport(report.id, 'RESOLVED'); }} className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded">BAN USER</button>
                              </div>
                          </div>
                      ))
                  )}
              </div>
          </div>
      </div>
  );

  const renderSecurity = () => (
      <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                  <h3 className="font-bold text-white mb-4 flex items-center gap-2"><Globe size={16} className="text-cyan-400" /> Active Sessions (Simulated)</h3>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                      {[...Object.keys(gameState.userDatabase).slice(0, 5), 'Guest_192', 'Guest_404'].map((user, i) => (
                          <div key={i} className="flex justify-between items-center text-sm border-b border-slate-800 pb-2">
                              <span className={user.startsWith('Guest') ? 'text-slate-500' : 'text-green-400 font-bold'}>{user}</span>
                              <span className="text-slate-600 font-mono">192.168.1.{100+i}</span>
                              <span className="text-xs bg-green-900 text-green-300 px-2 rounded">Online</span>
                          </div>
                      ))}
                  </div>
              </div>
              <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                  <h3 className="font-bold text-white mb-4 flex items-center gap-2"><ShieldAlert size={16} className="text-red-400" /> Suspicious Activity</h3>
                  <div className="space-y-2 text-xs font-mono">
                      <div className="text-red-400">[WARN] Rapid API calls detected from IP 10.0.0.5</div>
                      <div className="text-yellow-400">[FLAG] Trade value mismatch (Trade #9921)</div>
                      <div className="text-slate-400">[INFO] User 'NinjaSlayer99' logged in from new device</div>
                  </div>
              </div>
          </div>
      </div>
  );

  const renderUsers = () => {
      const filteredUsers = (Object.values(gameState.userDatabase) as UserAccount[]).filter(u => u.username.toLowerCase().includes(searchTerm.toLowerCase()));
      
      if (inspectingUser) {
          const user = gameState.userDatabase[inspectingUser];
          if (!user) return <div className="text-red-500">User not found</div>;
          const inventory = user.inventory || [];
          
          return (
              <div className="space-y-6">
                  <div className="flex items-center gap-4">
                      <button onClick={() => setInspectingUser(null)} className="px-4 py-2 bg-slate-800 rounded hover:bg-slate-700 text-white font-bold">Back to List</button>
                      <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                           <User /> {user.username} <span className="text-xs text-slate-500 bg-slate-900 px-2 py-1 rounded border border-slate-800">{user.role}</span>
                      </h3>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                       <div className="bg-slate-900 p-4 rounded border border-slate-800">
                           <div className="text-slate-500 text-xs font-bold uppercase">Balance</div>
                           <div className="text-2xl text-green-400 font-mono">${user.balance.toLocaleString()}</div>
                       </div>
                       <div className="bg-slate-900 p-4 rounded border border-slate-800">
                           <div className="text-slate-500 text-xs font-bold uppercase">Luck</div>
                           <div className="text-2xl text-yellow-400 font-mono">x{user.luckMultiplier}</div>
                       </div>
                       <div className="bg-slate-900 p-4 rounded border border-slate-800">
                           <div className="text-slate-500 text-xs font-bold uppercase">Inventory</div>
                           <div className="text-2xl text-blue-400 font-mono">{user.inventoryCount}</div>
                       </div>
                  </div>

                  {/* Advanced Editor */}
                  <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                      <h4 className="font-bold text-white mb-4 flex items-center gap-2"><Edit size={16} /> Advanced Editor</h4>
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="text-xs text-slate-500 font-bold uppercase">Set Level</label>
                              <div className="flex gap-2">
                                  <input type="number" className="bg-black border border-slate-700 rounded p-2 text-white w-full" placeholder={user.level.toString()} onChange={e => setEditLevel(parseInt(e.target.value))} />
                                  <button onClick={() => { if(editLevel) props.adminUpdateUser(user.username, { level: editLevel }); alert('Level Updated'); }} className="bg-blue-600 text-white px-3 rounded text-xs font-bold">SET</button>
                              </div>
                          </div>
                          <div>
                              <label className="text-xs text-slate-500 font-bold uppercase">Premium Status (0-2)</label>
                              <div className="flex gap-2">
                                  <input type="number" max="2" min="0" className="bg-black border border-slate-700 rounded p-2 text-white w-full" placeholder={gameState.premiumLevel.toString()} onChange={e => setEditPremium(parseInt(e.target.value))} />
                                  <button onClick={() => { if(editPremium !== null) props.adminUpdateUser(user.username, { }); /* Note: Premium is global in this sim, but usually per user. Let's fix global hook to respect user DB if we want individual premium. For now, this is visual or requires deeper refactor. */ alert('Feature requires deeper DB refactor, use global logic for now.'); }} className="bg-slate-700 text-slate-500 px-3 rounded text-xs font-bold cursor-not-allowed">SET</button>
                              </div>
                          </div>
                      </div>
                  </div>

                  <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                      <h4 className="font-bold text-white mb-4 flex items-center gap-2"><StickyNote size={16} /> Admin Notes</h4>
                      <div className="flex gap-2">
                          <input 
                            type="text" 
                            className="flex-1 bg-black border border-slate-700 rounded p-2 text-white" 
                            placeholder="Add a note about this user..." 
                            defaultValue={user.adminNotes || ''}
                            onChange={(e) => setAdminNoteInput(e.target.value)}
                          />
                          <button 
                            onClick={() => props.setAdminNotes(user.username, adminNoteInput)}
                            className="bg-blue-600 text-white px-4 rounded font-bold"
                          >
                              SAVE
                          </button>
                      </div>
                  </div>

                  <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                      <h4 className="font-bold text-white mb-4">Inventory Inspector ({inventory.length} Items)</h4>
                      <div className="grid grid-cols-6 gap-2 max-h-[400px] overflow-y-auto p-2">
                          {inventory.map((item) => (
                              <div key={item.id} className={`bg-slate-950 border border-slate-800 p-2 rounded flex flex-col items-center relative group`}>
                                   <div className={`text-[10px] ${RARITY_COLORS[item.rarity].text} font-bold mb-1 truncate w-full text-center`}>{item.name}</div>
                                   <div className="text-[10px] text-slate-500 font-mono">${item.value}</div>
                                   <button 
                                      onClick={() => props.adminRemoveItemFromUser(user.username, item.id)}
                                      className="absolute top-1 right-1 text-red-500 opacity-0 group-hover:opacity-100 bg-black/80 rounded p-1 hover:bg-red-900"
                                   >
                                       <Trash2 size={10} />
                                   </button>
                              </div>
                          ))}
                      </div>
                  </div>
              </div>
          )
      }

      return (
          <div className="h-full flex flex-col">
              <input 
                  type="text" 
                  placeholder="Search Users..." 
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-white mb-4"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="flex-1 overflow-y-auto space-y-2">
                  {filteredUsers.map(user => (
                      <div key={user.username} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between group">
                          <div>
                              <div className="flex items-center gap-2">
                                  <span className="font-bold text-white cursor-pointer hover:underline" onClick={() => setInspectingUser(user.username)}>{user.username}</span>
                                  {user.banned && <span className="bg-red-500 text-white text-[10px] px-1 rounded">BANNED</span>}
                                  {user.muted && <span className="bg-orange-500 text-white text-[10px] px-1 rounded">MUTED</span>}
                              </div>
                              <div className="text-xs text-slate-500">${user.balance.toLocaleString()} • Lvl {user.level}</div>
                          </div>
                          <div className="flex gap-1 opacity-50 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => setInspectingUser(user.username)} className="p-2 bg-slate-800 hover:bg-blue-600 rounded text-slate-400 hover:text-white" title="Inspect"><Eye size={14}/></button>
                              <button onClick={() => props.adminMuteUser(user.username)} className="p-2 bg-slate-800 hover:bg-orange-500 rounded text-slate-400 hover:text-white" title="Mute"><VolumeX size={14}/></button>
                              <button onClick={() => props.adminKickUser(user.username)} className="p-2 bg-slate-800 hover:bg-red-500 rounded text-slate-400 hover:text-white" title="Kick"><LogOut size={14}/></button>
                              <button onClick={() => props.adminWipeUser(user.username)} className="p-2 bg-slate-800 hover:bg-red-900 rounded text-slate-400 hover:text-white" title="Wipe"><Trash2 size={14}/></button>
                              <button onClick={() => props.onAdminBan(user.username)} className="p-2 bg-slate-800 hover:bg-red-600 rounded text-slate-400 hover:text-white" title="Ban"><Ban size={14}/></button>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      );
  };

  const renderBannedList = () => {
      const bannedUsers = (Object.values(gameState.userDatabase) as UserAccount[]).filter(u => u.banned);
      return (
          <div className="space-y-4">
              <h3 className="text-xl font-bold text-red-500 mb-4 flex items-center gap-2"><Ban size={20} /> Banned Players ({bannedUsers.length})</h3>
              {bannedUsers.length === 0 ? (
                  <div className="text-slate-500 italic">No banned players.</div>
              ) : (
                  bannedUsers.map(user => (
                      <div key={user.username} className="bg-red-900/10 border border-red-500/30 p-4 rounded flex justify-between items-center">
                          <span className="font-bold text-red-200">{user.username}</span>
                          <button onClick={() => props.onAdminBan(user.username)} className="bg-green-600 text-white px-4 py-1 rounded text-xs font-bold hover:bg-green-500">UNBAN</button>
                      </div>
                  ))
              )}
          </div>
      );
  };

  const renderMail = () => (
      <div className="space-y-6">
          <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
               <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Mail className="text-blue-400" /> Mail Center</h3>
               <div className="space-y-4">
                   <div>
                       <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Recipient</label>
                       <div className="flex gap-2">
                           <input 
                                type="text" 
                                placeholder="Username or 'ALL'" 
                                className="flex-1 bg-black border border-slate-700 rounded p-2 text-white" 
                                value={mailTo} 
                                onChange={e => setMailTo(e.target.value)} 
                           />
                           <button onClick={() => setMailTo('ALL')} className="px-3 bg-slate-800 text-xs font-bold rounded">ALL</button>
                       </div>
                   </div>
                   <div>
                       <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Subject</label>
                       <input 
                            type="text" 
                            className="w-full bg-black border border-slate-700 rounded p-2 text-white" 
                            value={mailSubject} 
                            onChange={e => setMailSubject(e.target.value)} 
                       />
                   </div>
                   <div>
                       <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Body</label>
                       <textarea 
                            className="w-full bg-black border border-slate-700 rounded p-2 text-white h-32" 
                            value={mailBody} 
                            onChange={e => setMailBody(e.target.value)} 
                       />
                   </div>
                   <button 
                        onClick={() => {
                            if(mailTo && mailSubject && mailBody) {
                                props.adminSendMail(mailTo, mailSubject, mailBody);
                                alert("Message Sent!");
                                setMailTo(''); setMailSubject(''); setMailBody('');
                            }
                        }}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded flex items-center justify-center gap-2"
                   >
                       <Send size={16} /> SEND MESSAGE
                   </button>
               </div>
          </div>
      </div>
  );

  const renderLogs = () => (
      <div className="h-full flex flex-col bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
               <h3 className="font-bold text-white flex items-center gap-2"><FileText size={16} /> System Logs</h3>
               <span className="text-xs text-slate-500">{gameState.logs.length} entries</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-1 font-mono text-xs">
              {gameState.logs.map(log => (
                  <div key={log.id} className="flex gap-2 text-slate-300 border-b border-slate-800/50 pb-1">
                      <span className="text-slate-500 w-24 flex-shrink-0">{new Date(log.timestamp).toLocaleTimeString()}</span>
                      <span className={`font-bold w-16 flex-shrink-0 ${log.type === 'BAN' ? 'text-red-500' : log.type === 'DROP' ? 'text-yellow-500' : 'text-blue-500'}`}>[{log.type}]</span>
                      <span>{log.message}</span>
                  </div>
              ))}
          </div>
      </div>
  );

  const CATEGORIES = [
      {
          name: "Core",
          items: [
              { id: 'dashboard', label: 'Dashboard', icon: Activity },
              { id: 'users', label: 'User Manager', icon: Users },
              { id: 'reports', label: 'Reports', icon: Flag }, // New
              { id: 'bans', label: 'Banned Players', icon: Ban }, 
              { id: 'security', label: 'Security Monitor', icon: ShieldAlert }, // New
              { id: 'mail', label: 'Mail Center', icon: Mail }, 
              { id: 'logs', label: 'System Logs', icon: FileText }, 
              { id: 'console', label: 'System Console', icon: Terminal },
              { id: 'test_panel', label: 'Test / DB', icon: Database }, // NEW TAB
          ]
      },
      {
          name: "Content",
          items: [
              { id: 'items', label: 'Item Editor', icon: Edit },
              { id: 'cases', label: 'Case Factory', icon: Package },
              { id: 'keymaker', label: 'Key Maker', icon: Key },
              { id: 'updates', label: 'Updates Editor', icon: FilePlus },
          ]
      },
      {
          name: "Economy",
          items: [
              { id: 'economy', label: 'Economy Control', icon: DollarSign },
              { id: 'shop_editor', label: 'Shop Editor', icon: ShoppingCart },
              { id: 'tuner', label: 'Game Tuner', icon: Sliders },
          ]
      },
      {
          name: "Events",
          items: [
              { id: 'giveaway', label: 'Giveaway Channel', icon: Gift },
              { id: 'ltm', label: 'LTM Studio', icon: Calendar },
          ]
      }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="w-full max-w-7xl bg-slate-950 border-2 border-red-900 rounded-2xl overflow-hidden shadow-[0_0_100px_rgba(220,38,38,0.2)] h-[90vh] flex">
        
        {/* GUI Organizer Sidebar */}
        <div className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col">
            <div className="p-6 border-b border-slate-800">
                 <h2 className="text-2xl font-black text-red-500 flex items-center gap-2"><ShieldAlert /> ADMIN</h2>
                 <p className="text-slate-500 text-xs mt-1">v5.1.0 // ROOT ACCESS</p>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {CATEGORIES.map(cat => (
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
            {activeTab === 'users' && renderUsers()}
            {activeTab === 'reports' && renderReports()}
            {activeTab === 'security' && renderSecurity()}
            {activeTab === 'bans' && renderBannedList()}
            {activeTab === 'mail' && renderMail()}
            {activeTab === 'logs' && renderLogs()}
            {activeTab === 'items' && renderItemEditor()}
            {activeTab === 'cases' && renderCaseEditor()}
            {activeTab === 'economy' && renderEconomy()}
            {activeTab === 'keymaker' && renderKeyMaker()}
            {activeTab === 'shop_editor' && renderShopEditor()}
            {activeTab === 'giveaway' && renderGiveaway()}
            {activeTab === 'ltm' && renderLTM()}
            
            {/* New Tabs */}
            {activeTab === 'updates' && renderUpdatesEditor()}
            {activeTab === 'tuner' && renderGameTuner()}
            {activeTab === 'test_panel' && renderDbViewer()}
            
            {activeTab === 'console' && (
                  <div className="flex flex-col h-full bg-black rounded-xl border border-slate-800 font-mono text-sm">
                      <div className="flex-1 p-4 overflow-y-auto space-y-1 text-green-400">
                          {consoleOutput.map((line, i) => <div key={i}>{line}</div>)}
                      </div>
                      <form onSubmit={handleCommand} className="p-2 border-t border-slate-800 flex">
                          <span className="text-green-500 mr-2">{'>'}</span>
                          <input 
                              type="text" 
                              value={consoleInput}
                              onChange={(e) => setConsoleInput(e.target.value)}
                              className="flex-1 bg-transparent outline-none text-white"
                              autoFocus
                              placeholder="Enter command..."
                          />
                      </form>
                  </div>
            )}
        </div>
      </div>
    </div>
  );
};