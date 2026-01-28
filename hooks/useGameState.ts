import { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, Item, ItemTemplate, Rarity, RARITY_ORDER, AuctionListing, TradeOffer, PromoCode, LogEntry, Role, Case, GameConfig, ScheduledEvent, UserAccount, Announcement, ShopEntry, ActiveGiveaway, InboxMessage, GameUpdate, GameSettings, ChatMessage, UserReport, DropFeedEntry } from '../types';
import { DEFAULT_ITEMS, DEFAULT_CASES, INITIAL_STATE, XP_PER_LEVEL_BASE, XP_MULTIPLIER, BAD_WORDS, FAKE_MESSAGES } from '../constants';
import { DatabaseService } from '../services/DatabaseService';

export const useGameState = () => {
  const [gameState, setGameState] = useState<GameState>(INITIAL_STATE);
  const [loaded, setLoaded] = useState(false);
  
  // Track if state has changed since last save to debounce writes
  const stateRef = useRef(gameState);

  // Load from DB Service
  useEffect(() => {
    const data = DatabaseService.load();
    if (data.rememberMe === false) {
         data.username = null;
    }
    setGameState(data);
    stateRef.current = data;
    setLoaded(true);
  }, []);

  // Save to DB Service (Debounced)
  useEffect(() => {
    if (!loaded) return;
    
    stateRef.current = gameState;
    const handler = setTimeout(() => {
        DatabaseService.save(gameState);
    }, 1000); // Auto-save every 1 second if changes occur

    return () => clearTimeout(handler);
  }, [gameState, loaded]);

  // Force Save Function (for Admin Panel)
  const forceSave = () => DatabaseService.save(gameState);

  // --- HOUSE SYSTEMS ---

  // 1. Passive Income
  useEffect(() => {
      if (!loaded || !gameState.username) return;
      const interval = setInterval(() => {
          let multiplier = 1;
          if (gameState.premiumLevel === 1) multiplier = 2; 
          if (gameState.premiumLevel === 2) multiplier = 50; 
          setGameState(prev => ({ ...prev, balance: prev.balance + (100 * multiplier) }));
      }, 60000); 
      return () => clearInterval(interval);
  }, [loaded, gameState.username, gameState.premiumLevel]);

  // 2. Scheduler, Bots & Security Check & Simulation
  useEffect(() => {
      if (!loaded) return;
      const interval = setInterval(() => {
          const now = Date.now();
          
          setGameState(prev => {
              // SECURITY CHECK: If current user is kicked
              if (prev.username && prev.userDatabase[prev.username]?.kicked) {
                   const updatedUserDB = { ...prev.userDatabase };
                   updatedUserDB[prev.username] = { ...updatedUserDB[prev.username], kicked: false };
                   return {
                       ...prev,
                       username: null,
                       isAdmin: false,
                       role: 'USER',
                       userDatabase: updatedUserDB
                   };
              }

              let newState = { ...prev };
              let configChanged = false;

              // --- EVENT SCHEDULER ---
              const activeEvents = prev.scheduledEvents.filter(e => e.startTime <= now && (e.startTime + e.durationMinutes * 60000) > now);
              const currentEvent = activeEvents.length > 0 ? activeEvents[activeEvents.length - 1] : null;

              if (currentEvent && prev.config.activeEvent !== currentEvent.name) {
                  newState.config.activeEvent = currentEvent.name;
                  if (currentEvent.type === 'LUCK') newState.config.globalLuckMultiplier = currentEvent.multiplier;
                  configChanged = true;
              } else if (!currentEvent && prev.config.activeEvent && prev.scheduledEvents.some(e => e.name === prev.config.activeEvent)) {
                  newState.config.activeEvent = null;
                  newState.config.globalLuckMultiplier = 1; 
                  configChanged = true;
              }
              
              const validEvents = prev.scheduledEvents.filter(e => (e.startTime + e.durationMinutes * 60000) > now);
              if (validEvents.length !== prev.scheduledEvents.length) {
                  newState.scheduledEvents = validEvents;
                  configChanged = true;
              }

              // --- GIVEAWAY CHECKER ---
              if (prev.config.activeGiveaway && now >= prev.config.activeGiveaway.endTime && !prev.config.activeGiveaway.winner) {
                  const g = prev.config.activeGiveaway;
                  let winner = null;
                  if (g.entrants.length > 0) {
                      winner = g.entrants[Math.floor(Math.random() * g.entrants.length)];
                  }
                  newState.config.activeGiveaway = { ...g, winner: winner || 'No Entrants' };
                  configChanged = true;
              }

              return configChanged ? newState : prev;
          });
      }, 5000); 
      return () => clearInterval(interval);
  }, [loaded]);

  // --- BOT SIMULATION (CHAT & DROPS) ---
  useEffect(() => {
      if(!loaded) return;
      
      const bots = Object.keys(gameState.userDatabase).filter(u => u !== gameState.username);
      const items = Object.values(gameState.items) as ItemTemplate[];

      const simInterval = setInterval(() => {
          const rand = Math.random();
          
          setGameState(prev => {
              let newState = { ...prev };
              let updated = false;

              // 20% chance for a bot chat message
              if (rand < 0.2) {
                  const botName = bots[Math.floor(Math.random() * bots.length)];
                  const msgText = FAKE_MESSAGES[Math.floor(Math.random() * FAKE_MESSAGES.length)];
                  const botRole = prev.userDatabase[botName]?.role || 'USER';
                  
                  const msg: ChatMessage = {
                      id: crypto.randomUUID(),
                      username: botName,
                      text: msgText,
                      timestamp: Date.now(),
                      role: botRole
                  };
                  newState.chatHistory = [...prev.chatHistory, msg].slice(-50);
                  updated = true;
              }

              // 40% chance for a live feed drop (Bot opening case)
              if (rand > 0.6) {
                  const botName = bots[Math.floor(Math.random() * bots.length)];
                  // Pick a random item, weighted towards better items for excitement
                  const randomItem = items[Math.floor(Math.random() * items.length)];
                  // Only show Rare+ in feed
                  if (RARITY_ORDER.indexOf(randomItem.rarity) >= RARITY_ORDER.indexOf(Rarity.RARE)) {
                      const feedEntry: DropFeedEntry = {
                          id: crypto.randomUUID(),
                          username: botName,
                          item: randomItem,
                          timestamp: Date.now()
                      };
                      newState.liveFeed = [feedEntry, ...prev.liveFeed].slice(0, 10);
                      updated = true;
                  }
              }

              return updated ? newState : prev;
          });

      }, 3000); // Check every 3 seconds

      return () => clearInterval(simInterval);
  }, [loaded, gameState.username]);


  // --- CORE GAME ACTIONS ---

  const login = useCallback((username: string, password: string, rememberMe: boolean) => {
    let role: Role = 'USER';
    if (username === 'StashyM' && password === 'september') role = 'OWNER';

    setGameState(prev => {
        const existingUser = prev.userDatabase[username];
        if (existingUser && existingUser.banned) {
            alert("This account has been banned by the House.");
            return prev;
        }

        const effectiveRole = existingUser ? existingUser.role : role;
        const newUserData: UserAccount = existingUser || {
            username,
            role: effectiveRole,
            banned: false,
            balance: prev.balance,
            level: prev.level,
            inventoryCount: prev.inventory.length,
            lastLogin: new Date().toISOString(),
            luckMultiplier: 1,
            tags: [],
            inbox: [],
            stats: { totalSpent: 0, totalValue: 0, casesOpened: 0, sessionStart: Date.now() }
        };

        // Sync local inbox with DB inbox on login
        return { 
            ...prev, 
            username,
            role: effectiveRole,
            isAdmin: effectiveRole === 'ADMIN' || effectiveRole === 'OWNER',
            rememberMe,
            balance: (effectiveRole === 'OWNER' || effectiveRole === 'ADMIN') ? 999999999 : (existingUser ? existingUser.balance : prev.balance),
            userDatabase: { ...prev.userDatabase, [username]: newUserData },
            inbox: existingUser ? (existingUser.inbox || []) : []
        };
    });
  }, []);

  const logout = useCallback(() => {
     setGameState(prev => ({ ...prev, username: null, isAdmin: false, role: 'USER', inbox: [] }));
  }, []);

  const openCase = useCallback((caseId: string) => {
      let resultItem: ItemTemplate | null = null;
      let cost = 0;

      setGameState(prev => {
          const box = prev.cases.find(c => c.id === caseId);
          if (!box) return prev;

          // Check Key
          if (box.keyTemplateId) {
             const hasKey = prev.inventory.some(i => i.templateId === box.keyTemplateId);
             if (!hasKey) {
                 alert("Key required!");
                 return prev;
             }
          }

          cost = Math.floor(box.price * prev.config.casePriceMultiplier);
          if (prev.balance < cost) {
              alert("Insufficient funds!");
              return prev;
          }

          const userLuck = prev.userDatabase[prev.username!]?.luckMultiplier || 1;
          const globalLuck = prev.config.globalLuckMultiplier;
          const totalLuck = userLuck * globalLuck;

          const overrideId = prev.userDatabase[prev.username!]?.nextDropOverride;
          if (overrideId && prev.items[overrideId]) {
              resultItem = prev.items[overrideId];
          } else {
              const weightedItems = box.contains.map(c => {
                const item = prev.items[c.templateId];
                let weight = c.weight;
                if (item && (item.rarity === 'LEGENDARY' || item.rarity === 'MYTHIC' || item.rarity === 'CONTRABAND')) {
                    weight = weight * totalLuck;
                }
                return { ...c, calculatedWeight: weight };
            });

            const totalWeight = weightedItems.reduce((sum, item) => sum + item.calculatedWeight, 0);
            let random = Math.random() * totalWeight;
            let selectedTemplateId = weightedItems[0].templateId;
            
            for (const item of weightedItems) {
                if (random < item.calculatedWeight) {
                    selectedTemplateId = item.templateId;
                    break;
                }
                random -= item.calculatedWeight;
            }
            resultItem = prev.items[selectedTemplateId];
          }

          if (!resultItem) return prev;

          const newItem: Item = {
              id: crypto.randomUUID(),
              templateId: resultItem.id,
              name: resultItem.name,
              rarity: resultItem.rarity,
              value: resultItem.baseValue,
              icon: resultItem.icon,
              type: resultItem.type,
              obtainedAt: Date.now(),
          };

          let newInventory = [...prev.inventory];
          if (box.keyTemplateId) {
             const keyIdx = newInventory.findIndex(i => i.templateId === box.keyTemplateId);
             if (keyIdx !== -1) newInventory.splice(keyIdx, 1);
          }
          newInventory.unshift(newItem);

          const newStats = {
              ...prev.stats,
              casesOpened: prev.stats.casesOpened + 1,
              totalMoneySpent: prev.stats.totalMoneySpent + cost,
              totalItemValueObtained: prev.stats.totalItemValueObtained + resultItem.baseValue,
              bestDropValue: Math.max(prev.stats.bestDropValue, resultItem.baseValue),
              bestDropName: resultItem.baseValue > prev.stats.bestDropValue ? resultItem.name : prev.stats.bestDropName,
              legendariesPulled: resultItem.rarity === 'LEGENDARY' ? prev.stats.legendariesPulled + 1 : prev.stats.legendariesPulled,
          };
          
          const updatedUserDB = { ...prev.userDatabase };
          if (prev.username && updatedUserDB[prev.username]) {
              updatedUserDB[prev.username] = {
                  ...updatedUserDB[prev.username],
                  nextDropOverride: undefined,
                  balance: prev.balance - cost,
                  inventoryCount: newInventory.length,
                  stats: {
                      ...updatedUserDB[prev.username].stats,
                      casesOpened: updatedUserDB[prev.username].stats.casesOpened + 1,
                      totalSpent: updatedUserDB[prev.username].stats.totalSpent + cost,
                      totalValue: updatedUserDB[prev.username].stats.totalValue + resultItem.baseValue
                  }
              }
              updatedUserDB[prev.username].inventory = newInventory;
          }

          let newLogs = prev.logs;
          let newLiveFeed = prev.liveFeed;

          // Add to Live Feed if decent rarity
          if (RARITY_ORDER.indexOf(resultItem.rarity) >= RARITY_ORDER.indexOf(Rarity.RARE)) {
              const feedEntry: DropFeedEntry = {
                  id: crypto.randomUUID(),
                  username: prev.username!,
                  item: resultItem,
                  timestamp: Date.now()
              };
              newLiveFeed = [feedEntry, ...prev.liveFeed].slice(0, 10);
          }

          if (resultItem.rarity === 'LEGENDARY' || resultItem.rarity === 'MYTHIC' || resultItem.rarity === 'CONTRABAND') {
              const log: LogEntry = {
                  id: crypto.randomUUID(),
                  timestamp: Date.now(),
                  message: `${prev.username} found ${resultItem.name} (${resultItem.rarity})!`,
                  type: 'DROP',
                  user: prev.username!
              };
              newLogs = [log, ...prev.logs];
          }

          return {
              ...prev,
              balance: prev.balance - cost,
              inventory: newInventory,
              stats: newStats,
              userDatabase: updatedUserDB,
              logs: newLogs,
              liveFeed: newLiveFeed
          };
      });
      
      return resultItem;
  }, []);

  // --- MAIL & INSPECTION SYSTEM ---

  const adminSendMail = useCallback((to: string | 'ALL', subject: string, body: string) => {
      setGameState(prev => {
          const newDB = { ...prev.userDatabase };
          const msg: InboxMessage = {
              id: crypto.randomUUID(),
              subject,
              body,
              from: 'System Admin',
              read: false,
              timestamp: Date.now()
          };
          
          if (to === 'ALL') {
              Object.keys(newDB).forEach(u => {
                  newDB[u] = { ...newDB[u], inbox: [msg, ...newDB[u].inbox] };
              });
              const newInbox = prev.username ? [msg, ...prev.inbox] : prev.inbox;
              return { ...prev, userDatabase: newDB, inbox: newInbox };
          } else {
              if (newDB[to]) {
                  newDB[to] = { ...newDB[to], inbox: [msg, ...newDB[to].inbox] };
              }
              const newInbox = prev.username === to ? [msg, ...prev.inbox] : prev.inbox;
              return { ...prev, userDatabase: newDB, inbox: newInbox };
          }
      });
  }, []);

  const markMailRead = useCallback((id: string) => {
      setGameState(prev => ({
          ...prev,
          inbox: prev.inbox.map(m => m.id === id ? { ...m, read: true } : m),
          userDatabase: {
              ...prev.userDatabase,
              [prev.username!]: {
                  ...prev.userDatabase[prev.username!],
                  inbox: prev.userDatabase[prev.username!].inbox.map(m => m.id === id ? { ...m, read: true } : m)
              }
          }
      }));
  }, []);
  
  const deleteMail = useCallback((id: string) => {
       setGameState(prev => ({
          ...prev,
          inbox: prev.inbox.filter(m => m.id !== id),
          userDatabase: {
              ...prev.userDatabase,
              [prev.username!]: {
                  ...prev.userDatabase[prev.username!],
                  inbox: prev.userDatabase[prev.username!].inbox.filter(m => m.id !== id)
              }
          }
      }));
  }, []);

  const adminRemoveItemFromUser = useCallback((targetUser: string, itemId: string) => {
      setGameState(prev => {
          const newDB = { ...prev.userDatabase };
          const user = newDB[targetUser];
          if (user && user.inventory) {
              user.inventory = user.inventory.filter(i => i.id !== itemId);
              user.inventoryCount = user.inventory.length;
          }
          
          const newLiveInventory = prev.username === targetUser ? prev.inventory.filter(i => i.id !== itemId) : prev.inventory;

          return { ...prev, userDatabase: newDB, inventory: newLiveInventory };
      });
  }, []);

  // --- HOUSE / ADMIN EXPORTS ---

  const createUpdate = useCallback((update: GameUpdate) => {
      setGameState(prev => ({ ...prev, updates: [update, ...prev.updates] }));
  }, []);

  const deleteUpdate = useCallback((id: string) => {
      setGameState(prev => ({ ...prev, updates: prev.updates.filter(u => u.id !== id) }));
  }, []);

  const updateGameSettings = useCallback((settings: Partial<GameSettings>) => {
      setGameState(prev => ({ ...prev, config: { ...prev.config, gameSettings: { ...prev.config.gameSettings, ...settings } } }));
  }, []);

  const adminKickUser = useCallback((username: string) => {
      setGameState(prev => {
          if (!prev.userDatabase[username]) return prev;
          return {
              ...prev,
              userDatabase: {
                  ...prev.userDatabase,
                  [username]: { ...prev.userDatabase[username], kicked: true }
              }
          };
      });
  }, []);

  const adminWipeUser = useCallback((username: string) => {
      setGameState(prev => {
          if (!prev.userDatabase[username]) return prev;
          return {
              ...prev,
              userDatabase: {
                  ...prev.userDatabase,
                  [username]: { 
                      ...prev.userDatabase[username], 
                      balance: 0, 
                      inventoryCount: 0,
                      inventory: [],
                      stats: { totalSpent: 0, totalValue: 0, casesOpened: 0, sessionStart: Date.now() }
                  }
              }
          };
      });
  }, []);

  const adminMuteUser = useCallback((username: string) => {
      setGameState(prev => {
          if (!prev.userDatabase[username]) return prev;
          const u = prev.userDatabase[username];
          return { ...prev, userDatabase: { ...prev.userDatabase, [username]: { ...u, muted: !u.muted } } };
      });
  }, []);

  const adminRenameUser = useCallback((oldName: string, newName: string) => {
      setGameState(prev => {
          if (!prev.userDatabase[oldName]) return prev;
          const data = { ...prev.userDatabase[oldName], username: newName };
          const newDB = { ...prev.userDatabase };
          delete newDB[oldName];
          newDB[newName] = data;
          return { ...prev, userDatabase: newDB };
      });
  }, []);

  const adminResetStats = useCallback((username: string) => {
      setGameState(prev => {
          if (!prev.userDatabase[username]) return prev;
          return { ...prev, userDatabase: { ...prev.userDatabase, [username]: { ...prev.userDatabase[username], stats: { totalSpent: 0, totalValue: 0, casesOpened: 0, sessionStart: Date.now() } } } };
      });
  }, []);

  const setAdminNotes = useCallback((username: string, note: string) => {
      setGameState(prev => {
          if (!prev.userDatabase[username]) return prev;
          return {
              ...prev,
              userDatabase: {
                  ...prev.userDatabase,
                  [username]: { ...prev.userDatabase[username], adminNotes: note }
              }
          };
      });
  }, []);

  const resolveReport = useCallback((reportId: string, action: 'RESOLVED' | 'DISMISSED') => {
      setGameState(prev => ({
          ...prev,
          reports: prev.reports.map(r => r.id === reportId ? { ...r, status: action } : r)
      }));
  }, []);

  const adminUpdateUser = useCallback((username: string, updates: Partial<UserAccount>) => {
      setGameState(prev => {
          if (!prev.userDatabase[username]) return prev;
          return {
              ...prev,
              userDatabase: {
                  ...prev.userDatabase,
                  [username]: { ...prev.userDatabase[username], ...updates }
              }
          };
      });
  }, []);

  // --- CHAT SYSTEM ---
  const sendChatMessage = useCallback((text: string) => {
      setGameState(prev => {
          if (!prev.username) return prev;
          
          if (prev.userDatabase[prev.username]?.muted) {
              alert("You are muted and cannot send messages.");
              return prev;
          }

          let cleanText = text;
          BAD_WORDS.forEach(bad => {
              const reg = new RegExp(bad, 'gi');
              cleanText = cleanText.replace(reg, '*'.repeat(bad.length));
          });

          const msg: ChatMessage = {
              id: crypto.randomUUID(),
              username: prev.username,
              role: prev.role,
              text: cleanText,
              timestamp: Date.now(),
              vip: prev.isPremium
          };

          const newHistory = [...prev.chatHistory, msg].slice(-50);
          return { ...prev, chatHistory: newHistory };
      });
  }, []);

  const reportUser = useCallback((suspect: string, reason: UserReport['reason']) => {
      setGameState(prev => {
          if (prev.reports.some(r => r.reporter === prev.username && r.suspect === suspect && r.status === 'PENDING')) {
              alert("You have already reported this user.");
              return prev;
          }
          const report: UserReport = {
              id: crypto.randomUUID(),
              reporter: prev.username || 'Anonymous',
              suspect,
              reason,
              timestamp: Date.now(),
              status: 'PENDING'
          };
          return { ...prev, reports: [...prev.reports, report] };
      });
  }, []);

  // --- ECONOMY CONTROL ---
  const clearAuctions = useCallback(() => setGameState(p => ({ ...p, auctionListings: [], userListings: [] })), []);
  
  const setMarketMultiplier = useCallback((val: number) => {
      setGameState(p => ({ ...p, config: { ...p.config, sellValueMultiplier: val } }));
  }, []);

  const massGift = useCallback((amount: number) => {
      setGameState(prev => {
          const newDB = { ...prev.userDatabase };
          Object.keys(newDB).forEach(k => {
              newDB[k] = { ...newDB[k], balance: newDB[k].balance + amount };
          });
          return { ...prev, userDatabase: newDB };
      });
  }, []);

  // --- SHOP EDITOR ---
  const addShopItem = useCallback((item: ShopEntry) => {
      setGameState(prev => ({
          ...prev,
          config: { ...prev.config, shopConfig: [...prev.config.shopConfig, item] }
      }));
  }, []);

  const removeShopItem = useCallback((id: string) => {
      setGameState(prev => ({
          ...prev,
          config: { ...prev.config, shopConfig: prev.config.shopConfig.filter(i => i.id !== id) }
      }));
  }, []);

  // --- GIVEAWAY SYSTEM ---
  const createGiveaway = useCallback((templateId: string, durationMinutes: number) => {
      setGameState(prev => ({
          ...prev,
          config: {
              ...prev.config,
              activeGiveaway: {
                  id: crypto.randomUUID(),
                  prizeTemplateId: templateId,
                  endTime: Date.now() + (durationMinutes * 60000),
                  entrants: [],
                  winner: null
              }
          }
      }));
  }, []);

  const endGiveaway = useCallback(() => {
      setGameState(prev => ({ ...prev, config: { ...prev.config, activeGiveaway: null } }));
  }, []);

  const joinGiveaway = useCallback(() => {
      setGameState(prev => {
          if (!prev.config.activeGiveaway || prev.config.activeGiveaway.winner || prev.config.activeGiveaway.entrants.includes(prev.username!)) return prev;
          return {
              ...prev,
              config: {
                  ...prev.config,
                  activeGiveaway: {
                      ...prev.config.activeGiveaway,
                      entrants: [...prev.config.activeGiveaway.entrants, prev.username!]
                  }
              }
          };
      });
  }, []);

  // --- CONTENT CREATOR (EDITOR) ---
  const createItem = useCallback((item: ItemTemplate) => {
      setGameState(prev => ({ 
          ...prev, 
          items: { ...prev.items, [item.id]: item } 
      }));
  }, []);

  const deleteItem = useCallback((id: string) => {
      setGameState(prev => {
          const newItems = { ...prev.items };
          delete newItems[id];
          return { ...prev, items: newItems };
      });
  }, []);

  const createCase = useCallback((c: Case) => {
      setGameState(prev => ({ 
          ...prev, 
          cases: [...prev.cases, c] 
      }));
  }, []);

  const deleteCase = useCallback((id: string) => {
      setGameState(prev => ({ ...prev, cases: prev.cases.filter(c => c.id !== id) }));
  }, []);

  const setGlobalAnnouncement = useCallback((ann: Announcement | null) => {
      setGameState(prev => ({ ...prev, config: { ...prev.config, announcement: ann } }));
  }, []);

  // --- STANDARD ACTIONS ---
  const addLog = useCallback((msg: string, type: any = 'SYSTEM') => setGameState(prev => ({ ...prev, logs: [{ id: crypto.randomUUID(), timestamp: Date.now(), message: msg, type, user: 'Sys' }, ...prev.logs] })), []);
  const updateConfig = useCallback((cfg: Partial<GameConfig>) => setGameState(prev => ({ ...prev, config: { ...prev.config, ...cfg } })), []);
  const adminBanUser = useCallback((u: string) => setGameState(prev => ({ ...prev, userDatabase: { ...prev.userDatabase, [u]: { ...prev.userDatabase[u], banned: !prev.userDatabase[u].banned } } })), []);
  
  const addBalance = useCallback((a: number) => setGameState(p => ({ ...p, balance: p.balance + a })), []);
  const removeBalance = useCallback((a: number) => setGameState(p => ({ ...p, balance: p.balance - a })), []);
  const addItem = useCallback((tid: string) => setGameState(p => { 
      const t = p.items[tid];
      const newItem = { id: crypto.randomUUID(), templateId: tid, name: t.name, rarity: t.rarity, value: t.baseValue, icon: t.icon, type: t.type, obtainedAt: Date.now() };
      
      // Sync to DB immediately for inspector visibility
      const newDB = { ...p.userDatabase };
      if (p.username && newDB[p.username]) {
           newDB[p.username].inventory = [newItem, ...(newDB[p.username].inventory || [])];
           newDB[p.username].inventoryCount = newDB[p.username].inventory.length;
      }

      return { ...p, inventory: [newItem, ...p.inventory], userDatabase: newDB }
  }), []);

  const removeItem = useCallback((id: string) => setGameState(p => {
       const newDB = { ...p.userDatabase };
       if (p.username && newDB[p.username] && newDB[p.username].inventory) {
           newDB[p.username].inventory = newDB[p.username].inventory!.filter(i => i.id !== id);
           newDB[p.username].inventoryCount = newDB[p.username].inventory!.length;
       }
       return { ...p, inventory: p.inventory.filter(i => i.id !== id), userDatabase: newDB };
  }), []);

  const sellItem = useCallback((id: string) => setGameState(p => { 
      const i = p.inventory.find(x => x.id === id); 
      if (!i) return p;
      // Also update DB
      const newDB = { ...p.userDatabase };
      if (p.username && newDB[p.username] && newDB[p.username].inventory) {
          newDB[p.username].inventory = newDB[p.username].inventory!.filter(x => x.id !== id);
          newDB[p.username].inventoryCount = newDB[p.username].inventory!.length;
          newDB[p.username].balance += (i.value * p.config.sellValueMultiplier);
      }
      return { ...p, balance: p.balance + (i.value * p.config.sellValueMultiplier), inventory: p.inventory.filter(x => x.id !== id), userDatabase: newDB };
  }), []);

  const sellItems = useCallback((ids: string[]) => setGameState(p => {
       const toSell = p.inventory.filter(i => ids.includes(i.id));
       const val = toSell.reduce((a, b) => a + (b.value * p.config.sellValueMultiplier), 0);
       // DB Sync
       const newDB = { ...p.userDatabase };
       if (p.username && newDB[p.username] && newDB[p.username].inventory) {
           newDB[p.username].inventory = newDB[p.username].inventory!.filter(i => !ids.includes(i.id));
           newDB[p.username].inventoryCount = newDB[p.username].inventory!.length;
           newDB[p.username].balance += Math.floor(val);
       }
       return { ...p, balance: p.balance + Math.floor(val), inventory: p.inventory.filter(i => !ids.includes(i.id)), userDatabase: newDB };
  }), []);
  
  const injectDrop = useCallback((username: string, templateId: string) => {
      setGameState(prev => {
          if (!prev.userDatabase[username]) return prev;
          return {
              ...prev,
              userDatabase: { ...prev.userDatabase, [username]: { ...prev.userDatabase[username], nextDropOverride: templateId } },
          };
      });
  }, []);
  
  const createTradeListing = useCallback((itemId: string, requestRarity: Rarity) => {
      setGameState(prev => {
          const item = prev.inventory.find(i => i.id === itemId);
          if (!item) return prev;
          const trade: TradeOffer = { id: crypto.randomUUID(), creator: prev.username!, offeredItem: item, requestRarity, createdAt: Date.now(), status: 'ACTIVE' };
          
          // Remove from inventory
          const newDB = { ...prev.userDatabase };
          if (prev.username && newDB[prev.username].inventory) {
              newDB[prev.username].inventory = newDB[prev.username].inventory!.filter(i => i.id !== itemId);
          }

          return { ...prev, inventory: prev.inventory.filter(i => i.id !== itemId), activeTrades: [trade, ...prev.activeTrades], userDatabase: newDB };
      });
  }, []);

  const fulfillTrade = useCallback((tradeId: string, offerItemId: string) => {
      setGameState(prev => {
          const trade = prev.activeTrades.find(t => t.id === tradeId);
          const offerItem = prev.inventory.find(i => i.id === offerItemId);
          if (!trade || !offerItem) return prev;
          
          const receivedItem = { ...trade.offeredItem, id: crypto.randomUUID(), obtainedAt: Date.now() };
          
          const newDB = { ...prev.userDatabase };
          // Update me (fulfiller)
          if (prev.username && newDB[prev.username].inventory) {
              newDB[prev.username].inventory = [...newDB[prev.username].inventory!.filter(i => i.id !== offerItemId), receivedItem];
          }
          // Update Creator (async in real app, here direct DB)
          const creator = newDB[trade.creator];
          if (creator && creator.inventory) {
               // Give creator the offered item
               const creatorReceived = { ...offerItem, id: crypto.randomUUID(), obtainedAt: Date.now() };
               creator.inventory.push(creatorReceived);
          }

          return {
              ...prev,
              inventory: [...prev.inventory.filter(i => i.id !== offerItemId), receivedItem],
              activeTrades: prev.activeTrades.filter(t => t.id !== tradeId),
              userDatabase: newDB
          };
      });
  }, []);

  const cancelTrade = useCallback((tradeId: string) => {
      setGameState(prev => {
          const trade = prev.activeTrades.find(t => t.id === tradeId);
          if (!trade || trade.creator !== prev.username) return prev;
          
          const newDB = { ...prev.userDatabase };
          if (prev.username && newDB[prev.username].inventory) {
              newDB[prev.username].inventory = [trade.offeredItem, ...newDB[prev.username].inventory!];
          }

          return { ...prev, inventory: [trade.offeredItem, ...prev.inventory], activeTrades: prev.activeTrades.filter(t => t.id !== tradeId), userDatabase: newDB };
      });
  }, []);

  const addXp = useCallback((a: number) => setGameState(p => ({ ...p, xp: p.xp + a })), []);
  const setLevel = useCallback((l: number) => setGameState(p => ({ ...p, level: l })), []);
  const createPromoCode = useCallback((c: string, r: number, m: number) => setGameState(p => ({ ...p, promoCodes: [...p.promoCodes, { code: c, reward: r, maxUses: m, currentUses: 0 }] })), []);
  
  const deletePromoCode = useCallback((code: string) => {
      setGameState(prev => ({ ...prev, promoCodes: prev.promoCodes.filter(p => p.code !== code) }));
  }, []);

  const redeemPromoCode = useCallback((c: string) => { 
      setGameState(prev => {
          if (prev.redeemedCodes.includes(c)) return prev;
          const promo = prev.promoCodes.find(p => p.code === c);
          if (!promo) return prev;
          if (promo.maxUses !== -1 && promo.currentUses >= promo.maxUses) return prev;
          return {
              ...prev,
              balance: prev.balance + promo.reward,
              redeemedCodes: [...prev.redeemedCodes, c],
              promoCodes: prev.promoCodes.map(p => p.code === c ? { ...p, currentUses: p.currentUses + 1 } : p)
          };
      });
  }, []);
  
  const seasonReset = useCallback(() => {
      if (!confirm("DANGER: This will wipe ALL inventories and set Season + 1. Continue?")) return;
      setGameState(prev => {
          const newDB = { ...prev.userDatabase };
          Object.keys(newDB).forEach(key => {
              newDB[key] = { ...newDB[key], inventoryCount: 0, balance: 200, stats: { totalSpent: 0, totalValue: 0, casesOpened: 0, sessionStart: Date.now() } }
          });
          return { ...INITIAL_STATE, username: prev.username, role: prev.role, isAdmin: prev.isAdmin, season: prev.season + 1, userDatabase: newDB, items: prev.items, cases: prev.cases, config: prev.config };
      });
  }, []);

  const consoleCommand = useCallback((cmd: string) => {
      const parts = cmd.split(' ');
      return "Command executed.";
  }, []);

  return {
    gameState, login, logout, openCase, addBalance, removeBalance, addItem, removeItem, sellItem, sellItems,
    buyAuctionItem: () => {}, listUserItem: () => {}, cancelUserListing: () => {},
    createTradeOffer: () => "", redeemTradeCode: () => "",
    addXp, setLevel, claimDailyReward: () => {}, resetGame: () => setGameState(INITIAL_STATE),
    buyPremium: (l: number) => setGameState(p => ({ ...p, premiumLevel: l, isPremium: true })),
    getNextRarity: (r: Rarity) => RARITY_ORDER[RARITY_ORDER.indexOf(r) + 1] || null,
    getItemsByRarity: (r: Rarity) => (Object.values(gameState.items) as ItemTemplate[]).filter(i => i.rarity === r),
    consumeKey: () => true, hasKey: (tid: string) => gameState.inventory.some(i => i.templateId === tid),
    
    // EXPORTS
    addLog, updateConfig, adminGiveItem: injectDrop, 
    adminAddCoins: (u: string, a: number) => setGameState(p => ({ ...p, userDatabase: { ...p.userDatabase, [u]: { ...p.userDatabase[u], balance: p.userDatabase[u].balance + a } } })),
    adminSetRole: (u: string, r: Role) => setGameState(p => ({ ...p, userDatabase: { ...p.userDatabase, [u]: { ...p.userDatabase[u], role: r } } })),
    adminBanUser, adminKickUser, adminWipeUser, adminMuteUser, adminRenameUser, adminResetStats,
    createItem, createCase, deleteItem, deleteCase, injectFakeDrop: (msg: string) => addLog(msg, 'DROP'),
    injectDrop, setPlayerLuck: (u: string, m: number) => setGameState(p => ({ ...p, userDatabase: { ...p.userDatabase, [u]: { ...p.userDatabase[u], luckMultiplier: m } } })),
    tagPlayer: (u: string, t: string) => setGameState(p => ({ ...p, userDatabase: { ...p.userDatabase, [u]: { ...p.userDatabase[u], tags: [...p.userDatabase[u].tags, t as any] } } })),
    scheduleEvent: (e: ScheduledEvent) => setGameState(p => ({ ...p, scheduledEvents: [...p.scheduledEvents, e] })),
    seasonReset, consoleCommand, recordDropStats: () => {},
    setGlobalLuck: (val: number) => updateConfig({ globalLuckMultiplier: val }),
    triggerEvent: (name: string) => setGameState(p => ({ ...p, config: { ...p.config, activeEvent: name } })),
    sendAdminEmail: () => {}, createPromoCode, deletePromoCode, redeemPromoCode,
    toggleMaintenance: () => setGameState(p => ({ ...p, config: { ...p.config, maintenanceMode: !p.config.maintenanceMode } })),
    setMotd: (val: string | null) => setGameState(p => ({ ...p, motd: val })),
    setTheme: (val: 'default' | 'midnight' | 'hacker') => setGameState(p => ({ ...p, theme: val })),
    createTradeListing, fulfillTrade, cancelTrade,
    // NEW ECONOMY EXPORTS
    clearAuctions, setMarketMultiplier, massGift, setGlobalAnnouncement,
    // SAVE EXPORTS
    importSave: DatabaseService.importData,
    exportSave: DatabaseService.exportData,
    forceSave,
    // NEW FEATURES
    addShopItem, removeShopItem, createGiveaway, endGiveaway, joinGiveaway,
    adminSendMail, markMailRead, deleteMail, adminRemoveItemFromUser,
    createUpdate, deleteUpdate, updateGameSettings, setAdminNotes, resolveReport, adminUpdateUser,
    // CHAT
    sendChatMessage, reportUser
  };
};