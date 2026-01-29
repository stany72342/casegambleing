import { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, Item, ItemTemplate, Rarity, RARITY_ORDER, AuctionListing, TradeOffer, PromoCode, LogEntry, Role, Case, GameConfig, ScheduledEvent, UserAccount, Announcement, ShopEntry, ActiveGiveaway, InboxMessage, GameUpdate, GameSettings, ChatMessage, UserReport, DropFeedEntry } from '../types';
import { DEFAULT_ITEMS, DEFAULT_CASES, INITIAL_STATE, XP_PER_LEVEL_BASE, XP_MULTIPLIER, BAD_WORDS, FAKE_MESSAGES } from '../constants';
import { DatabaseService } from '../services/DatabaseService';

export const useGameState = () => {
  const [gameState, setGameState] = useState<GameState>(INITIAL_STATE);
  const [loaded, setLoaded] = useState(false);
  
  const stateRef = useRef(gameState);

  // Load from DB
  useEffect(() => {
    const data = DatabaseService.load();
    if (data.rememberMe === false) {
         data.username = null;
    }
    setGameState(data);
    stateRef.current = data;
    setLoaded(true);
  }, []);

  // Auto-Save
  useEffect(() => {
    if (!loaded) return;
    stateRef.current = gameState;
    const handler = setTimeout(() => {
        DatabaseService.save(gameState);
    }, 1000); 
    return () => clearTimeout(handler);
  }, [gameState, loaded]);

  // Passive Income
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

  // Scheduler & Security
  useEffect(() => {
      if (!loaded) return;
      const interval = setInterval(() => {
          const now = Date.now();
          
          setGameState(prev => {
              if (prev.username && prev.userDatabase[prev.username]?.kicked) {
                   const updatedUserDB = { ...prev.userDatabase };
                   updatedUserDB[prev.username] = { ...updatedUserDB[prev.username], kicked: false };
                   return { ...prev, username: null, isAdmin: false, role: 'USER', userDatabase: updatedUserDB };
              }

              let newState = { ...prev };
              let configChanged = false;

              // Events
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
              
              // Giveaways
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

  // Login/Logout
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

  const logout = useCallback(() => setGameState(prev => ({ ...prev, username: null, isAdmin: false, role: 'USER', inbox: [] })), []);

  // Core Actions
  const addBalance = useCallback((a: number) => setGameState(p => {
      const safeAmount = isNaN(a) ? 0 : a;
      return { ...p, balance: p.balance + safeAmount };
  }), []);

  const removeBalance = useCallback((a: number) => setGameState(p => {
       const safeAmount = isNaN(a) ? 0 : a;
       if (p.balance < safeAmount) return p;
       return { ...p, balance: p.balance - safeAmount };
  }), []);

  const addXp = useCallback((a: number) => setGameState(p => ({ ...p, xp: p.xp + a })), []);
  
  const setLevel = useCallback((l: number) => setGameState(p => ({ ...p, level: l })), []);

  const claimDailyReward = useCallback(() => {
    setGameState(prev => {
      const now = Date.now();
      if (now - prev.lastDailyReward < 86400000) {
        alert("Daily reward not ready yet! Come back later.");
        return prev;
      }
      const reward = 500 * prev.level;
      return {
        ...prev,
        balance: prev.balance + reward,
        lastDailyReward: now,
        xp: prev.xp + 100
      };
    });
  }, []);

  const openCase = useCallback((caseId: string) => {
      let resultItem: ItemTemplate | null = null;
      let cost = 0;
      setGameState(prev => {
          const box = prev.cases.find(c => c.id === caseId);
          if (!box) return prev;
          cost = Math.floor(box.price * prev.config.casePriceMultiplier);
          if (prev.balance < cost) return prev;

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
                if (item && ['LEGENDARY', 'MYTHIC', 'CONTRABAND'].includes(item.rarity)) {
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

          const updatedUserDB = { ...prev.userDatabase };
          if (prev.username && updatedUserDB[prev.username]) {
              updatedUserDB[prev.username] = {
                  ...updatedUserDB[prev.username],
                  nextDropOverride: undefined,
                  balance: prev.balance - cost,
                  inventoryCount: newInventory.length,
                  inventory: newInventory
              }
          }

          // Logs & Feed
          let newLogs = prev.logs;
          let newLiveFeed = prev.liveFeed;
          if (RARITY_ORDER.indexOf(resultItem.rarity) >= RARITY_ORDER.indexOf(Rarity.RARE)) {
              newLiveFeed = [{ id: crypto.randomUUID(), username: prev.username!, item: resultItem, timestamp: Date.now() }, ...prev.liveFeed].slice(0, 10);
          }
          if (['LEGENDARY', 'MYTHIC', 'CONTRABAND'].includes(resultItem.rarity)) {
               newLogs = [{ id: crypto.randomUUID(), timestamp: Date.now(), message: `${prev.username} found ${resultItem.name}!`, type: 'DROP', user: prev.username! }, ...prev.logs];
          }

          return {
              ...prev,
              balance: prev.balance - cost,
              inventory: newInventory,
              userDatabase: updatedUserDB,
              logs: newLogs,
              liveFeed: newLiveFeed,
              stats: {
                  ...prev.stats,
                  casesOpened: prev.stats.casesOpened + 1,
                  totalMoneySpent: prev.stats.totalMoneySpent + cost,
                  totalItemValueObtained: prev.stats.totalItemValueObtained + resultItem.baseValue,
                  bestDropValue: Math.max(prev.stats.bestDropValue, resultItem.baseValue),
                  bestDropName: resultItem.baseValue > prev.stats.bestDropValue ? resultItem.name : prev.stats.bestDropName,
                  legendariesPulled: resultItem.rarity === 'LEGENDARY' ? prev.stats.legendariesPulled + 1 : prev.stats.legendariesPulled,
                  mythicsPulled: resultItem.rarity === 'MYTHIC' ? prev.stats.mythicsPulled + 1 : prev.stats.mythicsPulled,
                  contrabandsPulled: resultItem.rarity === 'CONTRABAND' ? prev.stats.contrabandsPulled + 1 : prev.stats.contrabandsPulled,
              }
          };
      });
      return resultItem;
  }, []);

  // Item Management
  const addItem = useCallback((tid: string) => setGameState(p => { 
      const t = p.items[tid];
      const newItem = { id: crypto.randomUUID(), templateId: tid, name: t.name, rarity: t.rarity, value: t.baseValue, icon: t.icon, type: t.type, obtainedAt: Date.now() };
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
       const newDB = { ...p.userDatabase };
       if (p.username && newDB[p.username] && newDB[p.username].inventory) {
           newDB[p.username].inventory = newDB[p.username].inventory!.filter(i => !ids.includes(i.id));
           newDB[p.username].inventoryCount = newDB[p.username].inventory!.length;
           newDB[p.username].balance += Math.floor(val);
       }
       return { ...p, balance: p.balance + Math.floor(val), inventory: p.inventory.filter(i => !ids.includes(i.id)), userDatabase: newDB };
  }), []);

  const getNextRarity = useCallback((current: Rarity) => {
      const idx = RARITY_ORDER.indexOf(current);
      return idx >= 0 && idx < RARITY_ORDER.length - 1 ? RARITY_ORDER[idx + 1] : null;
  }, []);

  const getItemsByRarity = useCallback((rarity: Rarity) => {
      return (Object.values(gameState.items) as ItemTemplate[]).filter(i => i.rarity === rarity && !i.hidden);
  }, [gameState.items]);

  const resetGame = useCallback(() => {
      localStorage.removeItem('case_clicker_db_v2');
      window.location.reload();
  }, []);

  const buyPremium = useCallback((level: number) => {
      setGameState(prev => {
           if (prev.isPremium && prev.premiumLevel >= level) return prev;
           return { ...prev, isPremium: true, premiumLevel: level };
      });
      alert("Upgrade Successful! Welcome to the elite.");
  }, []);

  const recordDropStats = useCallback(() => {}, []); // Placeholder
  const consumeKey = useCallback(() => {}, []); // Placeholder, handled in openCase

  // Admin & House Functions
  const setGlobalLuck = useCallback((v: number) => setGameState(p => ({ ...p, config: { ...p.config, globalLuckMultiplier: v } })), []);
  const triggerEvent = useCallback((n: string) => setGameState(p => ({ ...p, config: { ...p.config, activeEvent: n } })), []);
  const sendAdminEmail = useCallback(() => {}, []); // Deprecated in favor of adminSendMail
  const createPromoCode = useCallback((c: string, r: number, m: number) => setGameState(p => ({ ...p, promoCodes: [...p.promoCodes, { code: c, reward: r, maxUses: m, currentUses: 0 }] })), []);
  const deletePromoCode = useCallback((c: string) => setGameState(p => ({ ...p, promoCodes: p.promoCodes.filter(pc => pc.code !== c) })), []);
  
  const redeemPromoCode = useCallback((code: string) => {
      setGameState(prev => {
          if (prev.redeemedCodes.includes(code)) { alert("Already redeemed!"); return prev; }
          const promo = prev.promoCodes.find(p => p.code === code);
          if (!promo) { alert("Invalid code."); return prev; }
          if (promo.maxUses !== -1 && promo.currentUses >= promo.maxUses) { alert("Code fully claimed."); return prev; }

          return {
              ...prev,
              balance: prev.balance + promo.reward,
              redeemedCodes: [...prev.redeemedCodes, code],
              promoCodes: prev.promoCodes.map(p => p.code === code ? { ...p, currentUses: p.currentUses + 1 } : p)
          };
      });
  }, []);

  const toggleMaintenance = useCallback(() => setGameState(p => ({ ...p, config: { ...p.config, maintenanceMode: !p.config.maintenanceMode } })), []);
  const setMotd = useCallback((m: string | null) => setGameState(p => ({ ...p, motd: m })), []);
  const setTheme = useCallback((t: any) => setGameState(p => ({ ...p, theme: t })), []);
  
  const addLog = useCallback((m: string, t: any) => setGameState(p => ({ ...p, logs: [{ id: crypto.randomUUID(), message: m, type: t, timestamp: Date.now() }, ...p.logs] })), []);
  const updateConfig = useCallback((c: Partial<GameConfig>) => setGameState(p => ({ ...p, config: { ...p.config, ...c } })), []);
  const adminGiveItem = useCallback((u: string, i: string) => {
      setGameState(prev => {
          const t = prev.items[i];
          if (!t || !prev.userDatabase[u]) return prev;
          const newItem = { id: crypto.randomUUID(), templateId: i, name: t.name, rarity: t.rarity, value: t.baseValue, icon: t.icon, type: t.type, obtainedAt: Date.now() };
          const newDB = { ...prev.userDatabase };
          newDB[u].inventory = [newItem, ...(newDB[u].inventory || [])];
          newDB[u].inventoryCount = newDB[u].inventory.length;
          return { ...prev, userDatabase: newDB, inventory: prev.username === u ? [newItem, ...prev.inventory] : prev.inventory };
      });
  }, []);

  const adminAddCoins = useCallback((u: string, a: number) => {
      setGameState(prev => {
          const newDB = { ...prev.userDatabase };
          if (newDB[u]) newDB[u].balance += a;
          return { ...prev, userDatabase: newDB, balance: prev.username === u ? prev.balance + a : prev.balance };
      });
  }, []);

  const adminSetRole = useCallback((u: string, r: Role) => {
      setGameState(prev => {
           const newDB = { ...prev.userDatabase };
           if (newDB[u]) newDB[u].role = r;
           return { ...prev, userDatabase: newDB, role: prev.username === u ? r : prev.role, isAdmin: prev.username === u ? (r === 'ADMIN' || r === 'OWNER') : prev.isAdmin };
      });
  }, []);

  const adminBanUser = useCallback((u: string) => setGameState(p => ({ ...p, userDatabase: { ...p.userDatabase, [u]: { ...p.userDatabase[u], banned: !p.userDatabase[u].banned } } })), []);
  const createItem = useCallback((i: ItemTemplate) => setGameState(p => ({ ...p, items: { ...p.items, [i.id]: i } })), []);
  const createCase = useCallback((c: Case) => setGameState(p => ({ ...p, cases: [...p.cases, c] })), []);
  const injectFakeDrop = useCallback((msg: string) => {}, []); 

  // Advanced House
  const injectDrop = useCallback((u: string, i: string) => setGameState(p => ({ ...p, userDatabase: { ...p.userDatabase, [u]: { ...p.userDatabase[u], nextDropOverride: i } } })), []);
  const setPlayerLuck = useCallback((u: string, m: number) => setGameState(p => ({ ...p, userDatabase: { ...p.userDatabase, [u]: { ...p.userDatabase[u], luckMultiplier: m } } })), []);
  const tagPlayer = useCallback((u: string, t: string) => {}, []);
  const scheduleEvent = useCallback((e: ScheduledEvent) => setGameState(p => ({ ...p, scheduledEvents: [...p.scheduledEvents, e] })), []);
  const seasonReset = useCallback(() => setGameState(p => ({ ...p, userDatabase: {}, season: p.season + 1 })), []);
  const consoleCommand = useCallback((c: string) => "Executed.", []);

  // Trading
  const createTradeListing = useCallback((itemId: string, req: Rarity) => {
      setGameState(prev => {
          const item = prev.inventory.find(i => i.id === itemId);
          if (!item) return prev;
          const trade: TradeOffer = { id: crypto.randomUUID(), creator: prev.username!, offeredItem: item, requestRarity: req, createdAt: Date.now(), status: 'ACTIVE' };
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
          if (prev.username && newDB[prev.username].inventory) {
              newDB[prev.username].inventory = [...newDB[prev.username].inventory!.filter(i => i.id !== offerItemId), receivedItem];
          }
          const creator = newDB[trade.creator];
          if (creator && creator.inventory) {
               const creatorReceived = { ...offerItem, id: crypto.randomUUID(), obtainedAt: Date.now() };
               creator.inventory = [...creator.inventory, creatorReceived];
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

  // Admin V2+
  const adminKickUser = useCallback((u: string) => setGameState(p => ({ ...p, userDatabase: { ...p.userDatabase, [u]: { ...p.userDatabase[u], kicked: true } } })), []);
  const adminWipeUser = useCallback((u: string) => setGameState(p => ({ ...p, userDatabase: { ...p.userDatabase, [u]: { ...p.userDatabase[u], balance: 0, inventory: [], inventoryCount: 0 } } })), []);
  const adminMuteUser = useCallback((u: string) => setGameState(p => ({ ...p, userDatabase: { ...p.userDatabase, [u]: { ...p.userDatabase[u], muted: !p.userDatabase[u].muted } } })), []);
  const adminRenameUser = useCallback((o: string, n: string) => {}, []);
  const adminResetStats = useCallback((u: string) => {}, []);
  const clearAuctions = useCallback(() => setGameState(p => ({ ...p, auctionListings: [], userListings: [] })), []);
  const setMarketMultiplier = useCallback((v: number) => setGameState(p => ({ ...p, config: { ...p.config, sellValueMultiplier: v } })), []);
  const massGift = useCallback((a: number) => setGameState(p => {
      const newDB = { ...p.userDatabase };
      Object.keys(newDB).forEach(k => newDB[k].balance += a);
      return { ...p, userDatabase: newDB };
  }), []);
  const setGlobalAnnouncement = useCallback((a: Announcement | null) => setGameState(p => ({ ...p, config: { ...p.config, announcement: a } })), []);
  const deleteItem = useCallback((id: string) => setGameState(p => { const i = { ...p.items }; delete i[id]; return { ...p, items: i } }), []);
  const deleteCase = useCallback((id: string) => setGameState(p => ({ ...p, cases: p.cases.filter(c => c.id !== id) })), []);
  const importSave = useCallback((j: string) => DatabaseService.importData(j), []);
  const exportSave = useCallback(() => DatabaseService.exportData(), []);
  
  // V3+
  const addShopItem = useCallback((i: ShopEntry) => setGameState(p => ({ ...p, config: { ...p.config, shopConfig: [...p.config.shopConfig, i] } })), []);
  const removeShopItem = useCallback((id: string) => setGameState(p => ({ ...p, config: { ...p.config, shopConfig: p.config.shopConfig.filter(x => x.id !== id) } })), []);
  const createGiveaway = useCallback((id: string, d: number) => setGameState(p => ({ ...p, config: { ...p.config, activeGiveaway: { id: crypto.randomUUID(), prizeTemplateId: id, endTime: Date.now() + d*60000, entrants: [], winner: null } } })), []);
  const endGiveaway = useCallback(() => setGameState(p => ({ ...p, config: { ...p.config, activeGiveaway: null } })), []);
  const joinGiveaway = useCallback(() => setGameState(p => {
       if (!p.config.activeGiveaway || p.config.activeGiveaway.entrants.includes(p.username!)) return p;
       return { ...p, config: { ...p.config, activeGiveaway: { ...p.config.activeGiveaway, entrants: [...p.config.activeGiveaway.entrants, p.username!] } } };
  }), []);

  // V4+
  const adminSendMail = useCallback((to: string, sub: string, body: string) => {
      setGameState(prev => {
          const msg: InboxMessage = { id: crypto.randomUUID(), subject: sub, body, from: 'Admin', read: false, timestamp: Date.now() };
          const newDB = { ...prev.userDatabase };
          if (to === 'ALL') {
              Object.keys(newDB).forEach(u => newDB[u].inbox = [msg, ...(newDB[u].inbox || [])]);
              return { ...prev, userDatabase: newDB, inbox: [msg, ...prev.inbox] };
          }
          if (newDB[to]) newDB[to].inbox = [msg, ...(newDB[to].inbox || [])];
          return { ...prev, userDatabase: newDB, inbox: prev.username === to ? [msg, ...prev.inbox] : prev.inbox };
      });
  }, []);
  
  const adminRemoveItemFromUser = useCallback((u: string, id: string) => {
       setGameState(p => {
           const newDB = { ...p.userDatabase };
           if (newDB[u]) {
               newDB[u].inventory = newDB[u].inventory?.filter(i => i.id !== id) || [];
               newDB[u].inventoryCount = newDB[u].inventory.length;
           }
           return { ...p, userDatabase: newDB, inventory: p.username === u ? p.inventory.filter(i => i.id !== id) : p.inventory };
       });
  }, []);

  // V5+
  const createUpdate = useCallback((u: GameUpdate) => setGameState(p => ({ ...p, updates: [u, ...p.updates] })), []);
  const deleteUpdate = useCallback((id: string) => setGameState(p => ({ ...p, updates: p.updates.filter(u => u.id !== id) })), []);
  const updateGameSettings = useCallback((s: Partial<GameSettings>) => setGameState(p => ({ ...p, config: { ...p.config, gameSettings: { ...p.config.gameSettings, ...s } } })), []);
  const setAdminNotes = useCallback((u: string, n: string) => setGameState(p => ({ ...p, userDatabase: { ...p.userDatabase, [u]: { ...p.userDatabase[u], adminNotes: n } } })), []);
  const resolveReport = useCallback((id: string, s: 'RESOLVED' | 'DISMISSED') => setGameState(p => ({ ...p, reports: p.reports.map(r => r.id === id ? { ...r, status: s } : r) })), []);
  const adminUpdateUser = useCallback((u: string, updates: Partial<UserAccount>) => setGameState(p => ({ ...p, userDatabase: { ...p.userDatabase, [u]: { ...p.userDatabase[u], ...updates } } })), []);

  // Chat
  const sendChatMessage = useCallback((t: string) => {
      setGameState(p => {
           if (p.userDatabase[p.username!]?.muted) return p;
           return { ...p, chatHistory: [...p.chatHistory, { id: crypto.randomUUID(), username: p.username!, text: t, timestamp: Date.now(), role: p.role, vip: p.isPremium }].slice(-50) };
      });
  }, []);
  
  const reportUser = useCallback((s: string, r: UserReport['reason']) => setGameState(p => ({ ...p, reports: [...p.reports, { id: crypto.randomUUID(), reporter: p.username!, suspect: s, reason: r, timestamp: Date.now(), status: 'PENDING' }] })), []);
  
  // Auction
  const listUserItem = useCallback(() => {}, []);
  const cancelUserListing = useCallback(() => {}, []);
  const buyAuctionItem = useCallback(() => {}, []);
  const redeemTradeCode = useCallback(() => {}, []);
  const createTradeOffer = useCallback(() => {}, []);

  return {
    gameState,
    login, logout, openCase, addBalance, removeBalance, addItem, removeItem, sellItem, sellItems,
    buyAuctionItem, listUserItem, cancelUserListing, createTradeOffer, redeemTradeCode,
    addXp, setLevel, claimDailyReward, getNextRarity, getItemsByRarity, resetGame, buyPremium, recordDropStats, consumeKey,
    setGlobalLuck, triggerEvent, sendAdminEmail, createPromoCode, deletePromoCode, redeemPromoCode, toggleMaintenance, setMotd, setTheme,
    addLog, updateConfig, adminGiveItem, adminAddCoins, adminSetRole, adminBanUser, createItem, createCase, injectFakeDrop,
    injectDrop, setPlayerLuck, tagPlayer, scheduleEvent, seasonReset, consoleCommand,
    createTradeListing, fulfillTrade, cancelTrade,
    adminKickUser, adminWipeUser, adminMuteUser, adminRenameUser, adminResetStats, clearAuctions, setMarketMultiplier, massGift, setGlobalAnnouncement, deleteItem, deleteCase, importSave, exportSave,
    addShopItem, removeShopItem, createGiveaway, endGiveaway, joinGiveaway,
    adminSendMail, adminRemoveItemFromUser,
    createUpdate, deleteUpdate, updateGameSettings, setAdminNotes, resolveReport, adminUpdateUser,
    sendChatMessage, reportUser
  };
};