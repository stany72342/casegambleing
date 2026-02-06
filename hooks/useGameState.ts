import { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, Item, ItemTemplate, Rarity, RARITY_ORDER, AuctionListing, TradeOffer, PromoCode, LogEntry, Role, Case, GameConfig, ScheduledEvent, UserAccount, Announcement, ShopEntry, ActiveGiveaway, InboxMessage, GameUpdate, GameSettings, ChatMessage, UserReport, DropFeedEntry, RARITY_COLORS } from '../types';
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
    // Init totalGamesPlayed if missing (migration)
    if (!data.stats.totalGamesPlayed) {
        data.stats.totalGamesPlayed = 0;
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

  // Passive Income Loop
  useEffect(() => {
      if (!loaded || !gameState.username) return;
      const interval = setInterval(() => {
          setGameState(prev => {
               // Calculate Multipliers for Passive Income
               let levelMult = 1 + (prev.level * 0.05); // 5% per level
               
               let premiumMult = 1;
               if (prev.premiumLevel === 1) premiumMult = 2; 
               if (prev.premiumLevel === 2) premiumMult = 50; 
               
               const totalMult = levelMult;
               const basePassive = 100;
               
               const totalPassive = Math.floor(basePassive * premiumMult * totalMult);
               const newBalance = prev.balance + totalPassive;
               
               // Sync Balance to DB immediately for consistency
               let newUserDB = { ...prev.userDatabase };
               if (prev.username && newUserDB[prev.username]) {
                   // Sync balance
                   newUserDB[prev.username] = { ...newUserDB[prev.username], balance: newBalance };
               }

               return { ...prev, balance: newBalance, userDatabase: newUserDB };
          });
      }, 60000); 
      return () => clearInterval(interval);
  }, [loaded, gameState.username, gameState.premiumLevel]);

  // Helper to calculate current active multipliers
  const getMultipliers = useCallback(() => {
      const state = stateRef.current;
      let xpMult = 1;
      let luckMult = 1;
      let valMult = 1;

      // 1. Level Bonus (Value only)
      valMult += (state.level * 0.05); 

      // 2. Premium
      if (state.premiumLevel >= 1) xpMult *= 2;
      if (state.premiumLevel >= 2) xpMult *= 5;

      // 3. Global Config
      luckMult *= state.config.globalLuckMultiplier;
      valMult *= state.config.sellValueMultiplier;

      return { xp: xpMult, luck: luckMult, value: valMult };
  }, []);

  // Scheduler & Security
  useEffect(() => {
      if (!loaded) return;
      const interval = setInterval(() => {
          const now = Date.now();
          const dateObj = new Date();
          const currentHour = dateObj.getHours();
          const currentMinute = dateObj.getMinutes();
          
          setGameState(prev => {
              if (prev.username && prev.userDatabase[prev.username]?.kicked) {
                   const updatedUserDB = { ...prev.userDatabase };
                   updatedUserDB[prev.username] = { ...updatedUserDB[prev.username], kicked: false };
                   return { ...prev, username: null, isAdmin: false, role: 'USER', userDatabase: updatedUserDB };
              }

              let newState = { ...prev };
              let configChanged = false;

              // 1. Daily Luck Event (16:00 - 16:30)
              // Overrides other events for simplicity in this demo
              const isHappyHour = currentHour === 16 && currentMinute >= 0 && currentMinute < 30;
              
              if (isHappyHour) {
                  if (prev.config.activeEvent !== 'LUCKY HAPPY HOUR') {
                      newState.config.activeEvent = 'LUCKY HAPPY HOUR';
                      newState.config.globalLuckMultiplier = 2.0; // 2x Luck
                      configChanged = true;
                  }
              } else if (prev.config.activeEvent === 'LUCKY HAPPY HOUR') {
                  // Event ended
                  newState.config.activeEvent = null;
                  newState.config.globalLuckMultiplier = 1.0;
                  configChanged = true;
              } else {
                  // 2. Scheduled Custom Events (Only if not Happy Hour)
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
    if (username === 'admacc2' && password === '123kebab/5') role = 'MOD';

    // Simulate IP (since we don't have a backend to get real IP)
    const fakeIp = `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;

    setGameState(prev => {
        const existingUser = prev.userDatabase[username];
        if (existingUser && existingUser.banned) {
            alert("This account has been banned by the House.");
            return prev;
        }
        const effectiveRole = existingUser ? existingUser.role : role;
        
        const newUserData: UserAccount = existingUser ? {
            ...existingUser,
            ip: fakeIp, // Update IP on login
            lastLogin: new Date().toISOString()
        } : {
            username,
            role: effectiveRole,
            banned: false,
            ip: fakeIp, // Set IP for new user
            balance: prev.balance,
            level: prev.level,
            xp: prev.xp,
            premiumLevel: 0,
            miningLevel: 0,
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
            isAdmin: effectiveRole === 'ADMIN' || effectiveRole === 'OWNER' || effectiveRole === 'MOD',
            rememberMe,
            balance: (effectiveRole === 'OWNER' || effectiveRole === 'ADMIN') ? 999999999 : (existingUser ? existingUser.balance : prev.balance),
            
            // Restore persistent states
            level: existingUser ? existingUser.level : prev.level,
            xp: existingUser ? (existingUser.xp || 0) : prev.xp,
            isPremium: existingUser ? (existingUser.premiumLevel > 0) : false,
            premiumLevel: existingUser ? (existingUser.premiumLevel || 0) : 0,
            miningLevel: existingUser ? (existingUser.miningLevel || 0) : 0,

            userDatabase: { ...prev.userDatabase, [username]: newUserData },
            inbox: existingUser ? (existingUser.inbox || []) : []
        };
    });
  }, []);

  const logout = useCallback(() => setGameState(prev => ({ ...prev, username: null, isAdmin: false, role: 'USER', inbox: [] })), []);

  // Core Actions
  const addBalance = useCallback((a: number) => setGameState(p => {
      const safeAmount = Math.max(0, isNaN(a) ? 0 : a); // Ensure positive
      return { ...p, balance: p.balance + safeAmount };
  }), []);

  const removeBalance = useCallback((a: number) => setGameState(p => {
       const safeAmount = Math.max(0, isNaN(a) ? 0 : a); // Anti-exploit: Ensure positive
       if (safeAmount <= 0) return p; 
       if (p.balance < safeAmount) return p;
       return { ...p, balance: p.balance - safeAmount };
  }), []);

  const addXp = useCallback((amount: number) => {
      // In the new system, 'amount' is treated as 'number of plays'
      setGameState(p => {
          const playsToAdd = Math.max(0, amount);
          let newXp = p.xp + playsToAdd; // 'xp' field used as current plays progress towards next level
          let currentLevel = p.level;
          let leveledUp = false;
          let totalGamesPlayed = (p.stats.totalGamesPlayed || 0) + playsToAdd;

          // Loop for multi-level jumps based on Play Count Thresholds
          while (true) {
              const playsForNext = Math.floor(XP_PER_LEVEL_BASE * Math.pow(XP_MULTIPLIER, currentLevel - 1));
              if (newXp >= playsForNext) {
                  newXp -= playsForNext;
                  currentLevel++;
                  leveledUp = true;
              } else {
                  break;
              }
          }

          // SYNC TO DB
          const newDB = { ...p.userDatabase };
          if (p.username && newDB[p.username]) {
              newDB[p.username] = {
                  ...newDB[p.username],
                  level: currentLevel,
                  xp: newXp
              };
          }

          return { 
              ...p, 
              xp: newXp, 
              level: currentLevel, 
              showLevelUp: leveledUp || p.showLevelUp, 
              userDatabase: newDB,
              stats: {
                  ...p.stats,
                  totalGamesPlayed: totalGamesPlayed
              }
          };
      });
  }, []);
  
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
        // No XP/Play count for daily reward
      };
    });
  }, []);

  const openCase = useCallback((caseId: string) => {
      let resultItem: ItemTemplate | null = null;
      let cost = 0;
      
      const mults = getMultipliers();

      setGameState(prev => {
          const box = prev.cases.find(c => c.id === caseId);
          if (!box) return prev;
          cost = Math.floor(box.price * prev.config.casePriceMultiplier);
          if (prev.balance < cost) return prev;
          
          const totalLuck = mults.luck;
          
          const overrideId = prev.userDatabase[prev.username!]?.nextDropOverride;
          if (overrideId && prev.items[overrideId]) {
              resultItem = prev.items[overrideId];
          } else {
              const weightedItems = box.contains.map(c => {
                const item = prev.items[c.templateId];
                let weight = c.weight;
                if (item && ['LEGENDARY', 'MYTHIC', 'CONTRABAND', 'GODLIKE'].includes(item.rarity)) {
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

          let newInventory = [newItem, ...prev.inventory];
          const updatedUserDB = { ...prev.userDatabase };
          if (prev.username && updatedUserDB[prev.username]) {
              updatedUserDB[prev.username] = { 
                  ...updatedUserDB[prev.username], 
                  inventoryCount: newInventory.length,
                  stats: {
                      ...updatedUserDB[prev.username].stats,
                      casesOpened: updatedUserDB[prev.username].stats.casesOpened + 1
                  }
              };
              if (overrideId) {
                 delete updatedUserDB[prev.username].nextDropOverride;
              }
          }
          
          const dropEntry: DropFeedEntry = {
              id: crypto.randomUUID(),
              username: prev.username || 'Guest',
              item: resultItem,
              timestamp: Date.now()
          };

          return {
              ...prev,
              balance: prev.balance - cost,
              inventory: newInventory,
              userDatabase: updatedUserDB,
              liveFeed: [dropEntry, ...prev.liveFeed].slice(0, 10),
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
                  // totalGamesPlayed is handled via addXp call in App.tsx
              }
          };
      });
      return resultItem;
  }, [getMultipliers]);

  const addItem = useCallback((templateId: string) => {
      setGameState(prev => {
          const tmpl = prev.items[templateId];
          if(!tmpl) return prev;
          const newItem: Item = {
            id: crypto.randomUUID(),
            templateId: tmpl.id,
            name: tmpl.name,
            rarity: tmpl.rarity,
            value: tmpl.baseValue,
            icon: tmpl.icon,
            type: tmpl.type,
            obtainedAt: Date.now(),
          };
          return { ...prev, inventory: [newItem, ...prev.inventory] };
      });
  }, []);

  const removeItem = useCallback((itemId: string) => {
      setGameState(prev => ({ ...prev, inventory: prev.inventory.filter(i => i.id !== itemId) }));
  }, []);

  const sellItem = useCallback((itemId: string) => {
      setGameState(prev => {
          const item = prev.inventory.find(i => i.id === itemId);
          if (!item) return prev;
          const sellVal = Math.floor(item.value * prev.config.sellValueMultiplier);
          return {
              ...prev,
              balance: prev.balance + sellVal,
              inventory: prev.inventory.filter(i => i.id !== itemId)
          };
      });
  }, []);

  const sellItems = useCallback((itemIds: string[]) => {
      setGameState(prev => {
          let totalSell = 0;
          const newInv = prev.inventory.filter(i => {
              if (itemIds.includes(i.id)) {
                  totalSell += Math.floor(i.value * prev.config.sellValueMultiplier);
                  return false;
              }
              return true;
          });
          return { ...prev, balance: prev.balance + totalSell, inventory: newInv };
      });
  }, []);

  // --- STUBS FOR MISSING FUNCTIONS ---

  const buyAuctionItem = useCallback((listingId: string) => {}, []);
  const listUserItem = useCallback((itemId: string, price: number) => {}, []);
  const cancelUserListing = useCallback((listingId: string) => {}, []);
  const createTradeOffer = useCallback(() => {}, []);
  const redeemTradeCode = useCallback(() => {}, []);
  
  const getNextRarity = useCallback((rarity: Rarity): Rarity | null => {
      const idx = RARITY_ORDER.indexOf(rarity);
      if (idx !== -1 && idx < RARITY_ORDER.length - 1) return RARITY_ORDER[idx + 1];
      return null;
  }, []);

  const getItemsByRarity = useCallback((rarity: Rarity): ItemTemplate[] => {
      return (Object.values(stateRef.current.items) as ItemTemplate[]).filter(i => i.rarity === rarity);
  }, []);

  const resetGame = useCallback(() => {
      localStorage.removeItem('case_clicker_db_v2');
      window.location.reload();
  }, []);
  
  const buyPremium = useCallback((level: number) => {
      setGameState(prev => ({ ...prev, isPremium: true, premiumLevel: level }));
  }, []);

  const recordDropStats = useCallback(() => {}, []);
  const consumeKey = useCallback(() => {}, []);
  const setGlobalLuck = useCallback((val: number) => setGameState(p => ({...p, config: {...p.config, globalLuckMultiplier: val}})), []);
  const triggerEvent = useCallback((name: string) => setGameState(p => ({...p, config: {...p.config, activeEvent: name}})), []);
  const sendAdminEmail = useCallback(() => {}, []); // Unused/Stub
  const createPromoCode = useCallback((code: string, reward: number, maxUses: number) => {
      setGameState(p => ({ ...p, promoCodes: [...p.promoCodes, { code, reward, maxUses, currentUses: 0 }]}));
  }, []);
  const deletePromoCode = useCallback((code: string) => {
      setGameState(p => ({...p, promoCodes: p.promoCodes.filter(c => c.code !== code)}));
  }, []);
  const redeemPromoCode = useCallback((code: string) => {
      setGameState(prev => {
          const promo = prev.promoCodes.find(p => p.code === code);
          if (!promo) { alert("Invalid Code"); return prev; }
          if (promo.maxUses !== -1 && promo.currentUses >= promo.maxUses) { alert("Code fully redeemed"); return prev; }
          if (prev.redeemedCodes.includes(code)) { alert("Already redeemed"); return prev; }
          
          // Apply
          return {
              ...prev,
              balance: prev.balance + promo.reward,
              redeemedCodes: [...prev.redeemedCodes, code],
              promoCodes: prev.promoCodes.map(p => p.code === code ? {...p, currentUses: p.currentUses + 1} : p)
          };
      });
  }, []);
  
  const toggleMaintenance = useCallback(() => setGameState(p => ({...p, config: {...p.config, maintenanceMode: !p.config.maintenanceMode}})), []);
  const setMotd = useCallback((msg: string | null) => setGameState(p => ({...p, motd: msg})), []);
  const setTheme = useCallback((t: 'default' | 'midnight' | 'hacker') => setGameState(p => ({...p, theme: t})), []);
  const addLog = useCallback(() => {}, []);
  const updateConfig = useCallback((cfg: Partial<GameConfig>) => setGameState(p => ({...p, config: {...p.config, ...cfg}})), []);
  const adminGiveItem = useCallback((user: string, itemId: string) => {
      alert(`Gave ${itemId} to ${user} (Stub)`);
  }, []);
  const adminAddCoins = useCallback((user: string, amount: number) => {
       setGameState(p => {
           const newDB = {...p.userDatabase};
           if (newDB[user]) newDB[user] = {...newDB[user], balance: newDB[user].balance + amount};
           return {...p, userDatabase: newDB};
       });
  }, []);
  const adminSetRole = useCallback((user: string, role: Role) => {
      setGameState(p => {
           const newDB = {...p.userDatabase};
           if (newDB[user]) newDB[user] = {...newDB[user], role};
           return {...p, userDatabase: newDB};
       });
  }, []);
  const adminBanUser = useCallback((user: string) => {
      setGameState(p => {
           const newDB = {...p.userDatabase};
           if (newDB[user]) newDB[user] = {...newDB[user], banned: true};
           return {...p, userDatabase: newDB};
       });
  }, []);
  const createItem = useCallback((item: ItemTemplate) => {
      setGameState(p => ({...p, items: {...p.items, [item.id]: item}}));
  }, []);
  const createCase = useCallback((c: Case) => {
      setGameState(p => ({...p, cases: [...p.cases, c]}));
  }, []);
  const injectFakeDrop = useCallback(() => {}, []);
  const injectDrop = useCallback(() => {}, []);
  const setPlayerLuck = useCallback((user: string, mult: number) => {}, []);
  const tagPlayer = useCallback(() => {}, []);
  const scheduleEvent = useCallback((e: ScheduledEvent) => setGameState(p => ({...p, scheduledEvents: [...p.scheduledEvents, e]})), []);
  const seasonReset = useCallback(() => {
      setGameState(prev => {
          const wipedDB: Record<string, UserAccount> = {};
          Object.entries(prev.userDatabase).forEach(([u, acc]) => {
              wipedDB[u] = { ...acc, balance: 200, inventory: [], inventoryCount: 0, level: 1, xp: 0 };
          });
          return { ...prev, userDatabase: wipedDB, balance: 200, inventory: [], level: 1, xp: 0 };
      });
  }, []);
  const consoleCommand = useCallback((cmd: string) => { return "Executed " + cmd; }, []);
  const createTradeListing = useCallback(() => {}, []);
  const fulfillTrade = useCallback(() => {}, []);
  const cancelTrade = useCallback(() => {}, []);
  const adminKickUser = useCallback((user: string) => {
       setGameState(p => {
           const newDB = {...p.userDatabase};
           if (newDB[user]) newDB[user] = {...newDB[user], kicked: true};
           return {...p, userDatabase: newDB};
       });
  }, []);
  const adminWipeUser = useCallback((user: string) => {
      setGameState(p => {
           const newDB = {...p.userDatabase};
           if (newDB[user]) newDB[user] = {...newDB[user], balance: 0, inventory: [], inventoryCount: 0};
           return {...p, userDatabase: newDB};
       });
  }, []);
  const adminMuteUser = useCallback((user: string) => {
       setGameState(p => {
           const newDB = {...p.userDatabase};
           if (newDB[user]) newDB[user] = {...newDB[user], muted: true};
           return {...p, userDatabase: newDB};
       });
  }, []);
  const adminRenameUser = useCallback(() => {}, []);
  const adminResetStats = useCallback(() => {}, []);
  const clearAuctions = useCallback(() => setGameState(p => ({...p, auctionListings: []})), []);
  const setMarketMultiplier = useCallback((val: number) => setGameState(p => ({...p, config: {...p.config, sellValueMultiplier: val}})), []);
  const massGift = useCallback((amount: number) => {
      setGameState(p => {
          const newDB = {...p.userDatabase};
          Object.keys(newDB).forEach(u => newDB[u].balance += amount);
          return {...p, userDatabase: newDB, balance: p.balance + amount};
      });
  }, []);
  const setGlobalAnnouncement = useCallback((ann: Announcement | null) => setGameState(p => ({...p, config: {...p.config, announcement: ann}})), []);
  const deleteItem = useCallback((id: string) => {
      setGameState(p => {
          const newItems = {...p.items};
          delete newItems[id];
          return {...p, items: newItems};
      });
  }, []);
  const deleteCase = useCallback((id: string) => setGameState(p => ({...p, cases: p.cases.filter(c => c.id !== id)})), []);
  const importSave = useCallback((json: string) => DatabaseService.importData(json), []);
  const exportSave = useCallback(() => DatabaseService.exportData(), []);
  const addShopItem = useCallback((item: ShopEntry) => setGameState(p => ({...p, config: {...p.config, shopConfig: [...p.config.shopConfig, item]}})), []);
  const removeShopItem = useCallback((id: string) => setGameState(p => ({...p, config: {...p.config, shopConfig: p.config.shopConfig.filter(s => s.id !== id)}})), []);
  const createGiveaway = useCallback((templateId: string, duration: number) => {
      setGameState(p => ({...p, config: {...p.config, activeGiveaway: { id: crypto.randomUUID(), prizeTemplateId: templateId, endTime: Date.now() + duration * 60000, entrants: [], winner: null }}}));
  }, []);
  const endGiveaway = useCallback(() => setGameState(p => ({...p, config: {...p.config, activeGiveaway: null}})), []);
  const joinGiveaway = useCallback(() => {
      setGameState(p => {
          if (!p.config.activeGiveaway || !p.username) return p;
          if (p.config.activeGiveaway.entrants.includes(p.username)) return p;
          return { ...p, config: { ...p.config, activeGiveaway: { ...p.config.activeGiveaway, entrants: [...p.config.activeGiveaway.entrants, p.username] } } };
      });
  }, []);
  const adminSendMail = useCallback((to: string, sub: string, body: string) => {
      setGameState(p => ({...p, inbox: [...p.inbox, { id: crypto.randomUUID(), subject: sub, body, from: 'Admin', read: false, timestamp: Date.now() }] }));
  }, []);
  const adminRemoveItemFromUser = useCallback((user: string, itemId: string) => {
      setGameState(p => {
           const newDB = {...p.userDatabase};
           if (newDB[user] && newDB[user].inventory) {
                newDB[user].inventory = newDB[user].inventory!.filter(i => i.id !== itemId);
           }
           if (user === p.username) {
               return {...p, userDatabase: newDB, inventory: p.inventory.filter(i => i.id !== itemId)};
           }
           return {...p, userDatabase: newDB};
       });
  }, []);
  const createUpdate = useCallback((u: GameUpdate) => setGameState(p => ({...p, updates: [u, ...p.updates]})), []);
  const deleteUpdate = useCallback((id: string) => setGameState(p => ({...p, updates: p.updates.filter(u => u.id !== id)})), []);
  const updateGameSettings = useCallback((s: Partial<GameSettings>) => setGameState(p => ({...p, config: {...p.config, gameSettings: {...p.config.gameSettings, ...s}}})), []);
  const setAdminNotes = useCallback((user: string, note: string) => {
       setGameState(p => {
           const newDB = {...p.userDatabase};
           if (newDB[user]) newDB[user] = {...newDB[user], adminNotes: note};
           return {...p, userDatabase: newDB};
       });
  }, []);
  const resolveReport = useCallback((id: string, status: 'RESOLVED' | 'DISMISSED') => {
      setGameState(p => ({...p, reports: p.reports.map(r => r.id === id ? {...r, status} : r)}));
  }, []);
  const adminUpdateUser = useCallback((user: string, updates: Partial<UserAccount>) => {
       setGameState(p => {
           const newDB = {...p.userDatabase};
           const currentUserData = newDB[user];
           
           if (currentUserData) {
               newDB[user] = { ...currentUserData, ...updates };
           }

           if (user === p.username) {
               // We manually sync fields to avoid type collision with 'stats' and pollution with 'ip', 'adminNotes'
               const newState = { ...p, userDatabase: newDB };
               
               if (updates.balance !== undefined) newState.balance = updates.balance;
               if (updates.level !== undefined) newState.level = updates.level;
               if (updates.xp !== undefined) newState.xp = updates.xp;
               if (updates.role !== undefined) newState.role = updates.role;
               if (updates.inventory !== undefined) newState.inventory = updates.inventory;
               if (updates.inventoryCount !== undefined) newState.inventoryCount = updates.inventoryCount;
               
               if (updates.premiumLevel !== undefined) {
                   newState.premiumLevel = updates.premiumLevel;
                   newState.isPremium = updates.premiumLevel > 0;
               }
               if (updates.miningLevel !== undefined) newState.miningLevel = updates.miningLevel;
               
               return newState;
           }
           
           return {...p, userDatabase: newDB};
       });
  }, []);
  const sendChatMessage = useCallback((text: string) => {
      setGameState(p => ({
          ...p, 
          chatHistory: [...p.chatHistory, {
              id: crypto.randomUUID(),
              username: p.username || 'Guest',
              text,
              timestamp: Date.now(),
              role: p.role,
              vip: p.isPremium
          }].slice(-50)
      }));
  }, []);
  const reportUser = useCallback((suspect: string, reason: UserReport['reason']) => {
      setGameState(p => ({
          ...p,
          reports: [...p.reports, {
              id: crypto.randomUUID(),
              reporter: p.username || 'Anonymous',
              suspect,
              reason,
              timestamp: Date.now(),
              status: 'PENDING'
          }]
      }));
  }, []);

  return { 
      gameState, 
      setGameState,
      login, 
      logout, 
      addBalance, 
      removeBalance, 
      addXp, 
      setLevel,
      claimDailyReward,
      openCase,
      addItem,
      removeItem,
      sellItem,
      sellItems,
      buyAuctionItem,
      listUserItem,
      cancelUserListing,
      createTradeOffer,
      redeemTradeCode,
      getNextRarity,
      getItemsByRarity,
      resetGame,
      buyPremium,
      recordDropStats,
      consumeKey,
      setGlobalLuck,
      triggerEvent,
      sendAdminEmail,
      createPromoCode,
      deletePromoCode,
      redeemPromoCode,
      toggleMaintenance,
      setMotd,
      setTheme,
      addLog,
      updateConfig,
      adminGiveItem,
      adminAddCoins,
      adminSetRole,
      adminBanUser,
      createItem,
      createCase,
      injectFakeDrop,
      injectDrop,
      setPlayerLuck,
      tagPlayer,
      scheduleEvent,
      seasonReset,
      consoleCommand,
      createTradeListing,
      fulfillTrade,
      cancelTrade,
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
      addShopItem,
      removeShopItem,
      createGiveaway,
      endGiveaway,
      joinGiveaway,
      adminSendMail,
      adminRemoveItemFromUser,
      createUpdate,
      deleteUpdate,
      updateGameSettings,
      setAdminNotes,
      resolveReport,
      adminUpdateUser,
      sendChatMessage,
      reportUser
  };
};