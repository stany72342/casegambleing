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

  // Passive Income Loop (Includes Mining Rig)
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
               
               // Mining Rig Removed from income logic per request
               const miningIncome = 0; 

               const totalPassive = Math.floor((basePassive * premiumMult * totalMult) + miningIncome);
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
  }, [loaded, gameState.username, gameState.premiumLevel, gameState.miningLevel]);

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
            isAdmin: effectiveRole === 'ADMIN' || effectiveRole === 'OWNER',
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

  const addXp = useCallback((a: number) => {
      const mults = getMultipliers();
      setGameState(p => {
          let newXp = p.xp + Math.floor(Math.max(0, a) * mults.xp);
          let currentLevel = p.level;
          let leveledUp = false;

          // While Loop for multi-level jumps
          while (true) {
              const xpForNext = Math.floor(XP_PER_LEVEL_BASE * Math.pow(XP_MULTIPLIER, currentLevel - 1));
              if (newXp >= xpForNext) {
                  newXp -= xpForNext;
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

          return { ...p, xp: newXp, level: currentLevel, showLevelUp: leveledUp || p.showLevelUp, userDatabase: newDB };
      });
  }, [getMultipliers]);
  
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
          if (['LEGENDARY', 'MYTHIC', 'CONTRABAND', 'GODLIKE'].includes(resultItem.rarity)) {
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
  }, [getMultipliers]);

  // Item Management
  const addItem = useCallback((tid: string) => setGameState(p => { 
      const t = p.items[tid];
      const newItem = { id: crypto.randomUUID(), templateId: tid, name: t.name, rarity: t.rarity, value: t.baseValue, icon: t.icon, type: t.type, obtainedAt: Date.now() };
      const newDB = { ...p.userDatabase };
      if (p.username && newDB[p.username]) {
           newDB[p.username].inventory = [newItem, ...(newDB[p.username].inventory || [])];
           newDB[p.username].inventoryCount = newDB[p.username].inventory!.length;
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

  const sellItem = useCallback((id: string) => {
      const mults = getMultipliers();
      setGameState(p => { 
          const i = p.inventory.find(x => x.id === id); 
          if (!i) return p;
          
          const sellVal = Math.floor(i.value * mults.value);
          const newDB = { ...p.userDatabase };
          if (p.username && newDB[p.username]) {
               newDB[p.username] = {
                   ...newDB[p.username],
                   balance: (newDB[p.username].balance || 0) + sellVal,
                   inventory: (newDB[p.username].inventory || []).filter(item => item.id !== id),
                   inventoryCount: (newDB[p.username].inventoryCount || 0) - 1
               }
          }

          return { 
              ...p, 
              balance: p.balance + sellVal, 
              inventory: p.inventory.filter(x => x.id !== id),
              userDatabase: newDB 
          }
      });
  }, [getMultipliers]);

  const sellItems = useCallback((ids: string[]) => {
      const mults = getMultipliers();
      setGameState(p => {
          let totalSellVal = 0;
          const itemsToSell = p.inventory.filter(i => ids.includes(i.id));
          itemsToSell.forEach(i => totalSellVal += Math.floor(i.value * mults.value));

          const newDB = { ...p.userDatabase };
          if(p.username && newDB[p.username]) {
               newDB[p.username].balance += totalSellVal;
               newDB[p.username].inventory = newDB[p.username].inventory!.filter(i => !ids.includes(i.id));
               newDB[p.username].inventoryCount = newDB[p.username].inventory!.length;
          }

          return { 
              ...p, 
              balance: p.balance + totalSellVal, 
              inventory: p.inventory.filter(i => !ids.includes(i.id)),
              userDatabase: newDB
          };
      });
  }, [getMultipliers]);

  // Auction & Trading
  const buyAuctionItem = useCallback((listingId: string) => {
      setGameState(p => {
          const listing = p.auctionListings.find(l => l.id === listingId);
          if (!listing || p.balance < listing.price) return p;

          const item: Item = {
              id: crypto.randomUUID(),
              templateId: listing.item.id,
              name: listing.item.name,
              rarity: listing.item.rarity,
              value: listing.item.baseValue,
              icon: listing.item.icon,
              type: listing.item.type,
              obtainedAt: Date.now()
          };

          // Handle Seller
          const newDB = { ...p.userDatabase };
          const seller = listing.seller;
          if (newDB[seller]) {
              newDB[seller].balance += listing.price;
          }
          if (p.username && newDB[p.username]) {
              newDB[p.username].balance -= listing.price;
              newDB[p.username].inventory = [item, ...(newDB[p.username].inventory || [])];
              newDB[p.username].inventoryCount = newDB[p.username].inventory!.length;
          }

          return {
              ...p,
              balance: p.balance - listing.price,
              inventory: [item, ...p.inventory],
              auctionListings: p.auctionListings.filter(l => l.id !== listingId),
              userDatabase: newDB
          };
      });
  }, []);

  const listUserItem = useCallback((itemId: string, price: number) => {
      // Anti-Exploit: Prevent negative listing price
      if (price <= 0) return;

      setGameState(p => {
          const item = p.inventory.find(i => i.id === itemId);
          if (!item) return p;

          const listing: AuctionListing = {
              id: crypto.randomUUID(),
              item: p.items[item.templateId],
              price,
              seller: p.username!,
              expiresAt: Date.now() + 86400000
          };

          const newDB = { ...p.userDatabase };
          if(p.username && newDB[p.username]) {
               newDB[p.username].inventory = newDB[p.username].inventory!.filter(i => i.id !== itemId);
               newDB[p.username].inventoryCount = newDB[p.username].inventory!.length;
          }

          return {
              ...p,
              inventory: p.inventory.filter(i => i.id !== itemId),
              auctionListings: [...p.auctionListings, listing],
              userListings: [...p.userListings, { id: listing.id, item, price, listedAt: Date.now() }],
              userDatabase: newDB
          };
      });
  }, []);

  const cancelUserListing = useCallback((listingId: string) => {
      setGameState(p => {
          const userListing = p.userListings.find(l => l.id === listingId);
          if (!userListing) return p;
          
          const newDB = { ...p.userDatabase };
          if(p.username && newDB[p.username]) {
               newDB[p.username].inventory = [userListing.item, ...(newDB[p.username].inventory || [])];
               newDB[p.username].inventoryCount = newDB[p.username].inventory!.length;
          }

          return {
              ...p,
              inventory: [userListing.item, ...p.inventory],
              auctionListings: p.auctionListings.filter(l => l.id !== listingId),
              userListings: p.userListings.filter(l => l.id !== listingId),
              userDatabase: newDB
          };
      });
  }, []);

  const createTradeListing = useCallback((itemId: string, requestRarity: Rarity) => {
      setGameState(p => {
          const item = p.inventory.find(i => i.id === itemId);
          if (!item) return p;

          const trade: TradeOffer = {
              id: crypto.randomUUID(),
              creator: p.username!,
              offeredItem: item,
              requestRarity,
              createdAt: Date.now(),
              status: 'ACTIVE'
          };
          
          const newDB = { ...p.userDatabase };
          if (p.username && newDB[p.username]) {
               newDB[p.username].inventory = newDB[p.username].inventory!.filter(i => i.id !== itemId);
               newDB[p.username].inventoryCount = newDB[p.username].inventory!.length;
          }

          return {
              ...p,
              activeTrades: [trade, ...p.activeTrades],
              inventory: p.inventory.filter(i => i.id !== itemId),
              userDatabase: newDB
          };
      });
  }, []);

  const fulfillTrade = useCallback((tradeId: string, offerItemId: string) => {
      setGameState(p => {
          const trade = p.activeTrades.find(t => t.id === tradeId);
          const myItem = p.inventory.find(i => i.id === offerItemId);
          if (!trade || !myItem) return p;
          if (myItem.rarity !== trade.requestRarity) return p;

          const creator = trade.creator;
          const fulfiller = p.username!;
          const newDB = { ...p.userDatabase };

          // Give creator my item
          if (newDB[creator]) {
              newDB[creator].inventory = [myItem, ...(newDB[creator].inventory || [])];
              newDB[creator].inventoryCount = (newDB[creator].inventoryCount || 0) + 1;
              newDB[creator].inbox.push({
                   id: crypto.randomUUID(),
                   subject: 'Trade Completed',
                   body: `${fulfiller} accepted your trade! You received ${myItem.name}.`,
                   from: 'System',
                   read: false,
                   timestamp: Date.now()
              });
          }

          // Give fulfiller (me) the trade item
          if (newDB[fulfiller]) {
               newDB[fulfiller].inventory = [trade.offeredItem, ...(newDB[fulfiller].inventory || []).filter(i => i.id !== offerItemId)];
               newDB[fulfiller].inventoryCount = newDB[fulfiller].inventory!.length;
          }

          return {
              ...p,
              activeTrades: p.activeTrades.filter(t => t.id !== tradeId),
              inventory: [trade.offeredItem, ...p.inventory.filter(i => i.id !== offerItemId)],
              userDatabase: newDB
          };
      });
  }, []);

  const cancelTrade = useCallback((tradeId: string) => {
      setGameState(p => {
          const trade = p.activeTrades.find(t => t.id === tradeId);
          if (!trade) return p;
          
          const newDB = { ...p.userDatabase };
          if(p.username && newDB[p.username]) {
              newDB[p.username].inventory = [trade.offeredItem, ...(newDB[p.username].inventory || [])];
              newDB[p.username].inventoryCount = newDB[p.username].inventory!.length;
          }

          return {
              ...p,
              activeTrades: p.activeTrades.filter(t => t.id !== tradeId),
              inventory: [trade.offeredItem, ...p.inventory],
              userDatabase: newDB
          };
      });
  }, []);

  // Other Actions
  const buyPremium = useCallback((level: number) => {
      setGameState(p => {
          const cost = level === 1 ? 499 : 1999; 
          // Note: In a real app this would be real money. Here we simulate with coins or assume logic handled externally.
          // For demo, we just set the level if they "buy" it (maybe cost high coins?)
          // Let's assume unlimited free for demo or high coin cost.
          return { ...p, premiumLevel: level, isPremium: true, userDatabase: { ...p.userDatabase, [p.username!]: { ...p.userDatabase[p.username!], premiumLevel: level } } };
      });
  }, []);

  const buyMiningUpgrade = useCallback(() => {
      setGameState(p => {
          const cost = Math.floor(2000 * Math.pow(1.5, p.miningLevel));
          if (p.balance < cost || p.miningLevel >= 50) return p;
          
          const newLevel = p.miningLevel + 1;
          const newDB = { ...p.userDatabase };
          if(p.username && newDB[p.username]) {
              newDB[p.username].balance -= cost;
              newDB[p.username].miningLevel = newLevel;
          }

          return { ...p, balance: p.balance - cost, miningLevel: newLevel, userDatabase: newDB };
      });
  }, []);

  const createPromoCode = useCallback((code: string, reward: number, maxUses: number) => {
      setGameState(p => ({
          ...p,
          promoCodes: [...p.promoCodes, { code, reward, maxUses, currentUses: 0 }]
      }));
  }, []);

  const deletePromoCode = useCallback((code: string) => {
      setGameState(p => ({
          ...p,
          promoCodes: p.promoCodes.filter(c => c.code !== code)
      }));
  }, []);

  const redeemPromoCode = useCallback((code: string) => {
      setGameState(p => {
          if (p.redeemedCodes.includes(code)) {
              alert("Already redeemed!");
              return p;
          }
          const promo = p.promoCodes.find(c => c.code === code);
          if (!promo) {
              alert("Invalid Code");
              return p;
          }
          if (promo.maxUses !== -1 && promo.currentUses >= promo.maxUses) {
              alert("Code fully claimed");
              return p;
          }
          
          const newDB = { ...p.userDatabase };
          if(p.username && newDB[p.username]) {
              newDB[p.username].balance += promo.reward;
          }

          return {
              ...p,
              balance: p.balance + promo.reward,
              redeemedCodes: [...p.redeemedCodes, code],
              promoCodes: p.promoCodes.map(c => c.code === code ? { ...c, currentUses: c.currentUses + 1 } : c),
              userDatabase: newDB
          };
      });
  }, []);

  // Admin / Helpers
  const adminAddCoins = useCallback((user: string, amount: number) => {
      setGameState(p => {
          const newDB = { ...p.userDatabase };
          if (newDB[user]) newDB[user].balance += amount;
          return { ...p, userDatabase: newDB, balance: user === p.username ? p.balance + amount : p.balance };
      });
  }, []);

  const adminGiveItem = useCallback((user: string, itemId: string) => {
      setGameState(p => {
          const newDB = { ...p.userDatabase };
          const itemTemplate = p.items[itemId];
          if (newDB[user] && itemTemplate) {
              const newItem: Item = {
                  id: crypto.randomUUID(),
                  templateId: itemTemplate.id,
                  name: itemTemplate.name,
                  rarity: itemTemplate.rarity,
                  value: itemTemplate.baseValue,
                  icon: itemTemplate.icon,
                  type: itemTemplate.type,
                  obtainedAt: Date.now()
              };
              newDB[user].inventory = [newItem, ...(newDB[user].inventory || [])];
              newDB[user].inventoryCount = newDB[user].inventory!.length;
          }
          // If giving to self, update local state
          if (user === p.username && itemTemplate) {
               // Handled by userDB sync usually, but strictly:
               return { ...p, userDatabase: newDB, inventory: user === p.username ? newDB[user].inventory! : p.inventory };
          }
          return { ...p, userDatabase: newDB };
      });
  }, []);

  const adminBanUser = useCallback((user: string) => {
      setGameState(p => {
          const newDB = { ...p.userDatabase };
          if (newDB[user]) newDB[user].banned = true;
          return { ...p, userDatabase: newDB };
      });
  }, []);
  
  const adminSetRole = useCallback((user: string, role: Role) => {
        setGameState(p => {
          const newDB = { ...p.userDatabase };
          if (newDB[user]) newDB[user].role = role;
          return { ...p, userDatabase: newDB };
      });
  }, []);

  // Placeholders / Stubs for requested functions
  const createTradeOffer = () => {}; // Used in component? mapped to createTradeListing
  const redeemTradeCode = () => {};
  const getNextRarity = (r: Rarity): Rarity | null => {
      const idx = RARITY_ORDER.indexOf(r);
      if (idx === -1 || idx === RARITY_ORDER.length - 1) return null;
      return RARITY_ORDER[idx + 1];
  };
  const getItemsByRarity = (r: Rarity) => Object.values(gameState.items).filter(i => i.rarity === r);
  const resetGame = () => { DatabaseService.wipe(); };
  const recordDropStats = () => {}; // Handled in openCase
  const consumeKey = (id: string) => removeItem(id);
  const setGlobalLuck = (n: number) => setGameState(p => ({ ...p, config: { ...p.config, globalLuckMultiplier: n } }));
  const triggerEvent = (e: string) => setGameState(p => ({ ...p, config: { ...p.config, activeEvent: e } }));
  const sendAdminEmail = () => {};
  const toggleMaintenance = () => setGameState(p => ({ ...p, config: { ...p.config, maintenanceMode: !p.config.maintenanceMode } }));
  const setMotd = (m: string | null) => setGameState(p => ({ ...p, motd: m }));
  const setTheme = (t: any) => setGameState(p => ({ ...p, theme: t }));
  const addLog = (l: LogEntry) => setGameState(p => ({ ...p, logs: [l, ...p.logs] }));
  const updateConfig = (c: Partial<GameConfig>) => setGameState(p => ({ ...p, config: { ...p.config, ...c } }));
  const createItem = (i: ItemTemplate) => setGameState(p => ({ ...p, items: { ...p.items, [i.id]: i } }));
  const createCase = (c: Case) => setGameState(p => ({ ...p, cases: [...p.cases, c] }));
  const injectFakeDrop = (msg: string) => {}; 
  const injectDrop = (u: string, i: string) => adminGiveItem(u, i);
  const setPlayerLuck = (u: string, m: number) => setGameState(p => ({ ...p, userDatabase: { ...p.userDatabase, [u]: { ...p.userDatabase[u], luckMultiplier: m } } }));
  const tagPlayer = (u: string, t: string) => {}; 
  const scheduleEvent = (e: ScheduledEvent) => setGameState(p => ({ ...p, scheduledEvents: [...p.scheduledEvents, e] }));
  const seasonReset = () => { if(confirm("Reset Season?")) { DatabaseService.wipe(); } };
  const consoleCommand = (cmd: string) => { return "Executed " + cmd; };
  const adminKickUser = (u: string) => setGameState(p => ({ ...p, userDatabase: { ...p.userDatabase, [u]: { ...p.userDatabase[u], kicked: true } } }));
  const adminWipeUser = (u: string) => { setGameState(p => { const newDB = {...p.userDatabase}; delete newDB[u]; return { ...p, userDatabase: newDB }; }) };
  const adminMuteUser = (u: string) => setGameState(p => ({ ...p, userDatabase: { ...p.userDatabase, [u]: { ...p.userDatabase[u], muted: !p.userDatabase[u].muted } } }));
  const adminRenameUser = () => {};
  const adminResetStats = () => {};
  const clearAuctions = () => setGameState(p => ({ ...p, auctionListings: [], userListings: [] }));
  const setMarketMultiplier = (n: number) => setGameState(p => ({ ...p, config: { ...p.config, sellValueMultiplier: n } }));
  const massGift = (amount: number) => setGameState(p => {
       const newDB = { ...p.userDatabase };
       Object.keys(newDB).forEach(k => newDB[k].balance += amount);
       return { ...p, userDatabase: newDB, balance: p.balance + amount };
  });
  const setGlobalAnnouncement = (a: Announcement | null) => setGameState(p => ({ ...p, config: { ...p.config, announcement: a } }));
  const deleteItem = (id: string) => setGameState(p => { const newItems = {...p.items}; delete newItems[id]; return { ...p, items: newItems } });
  const deleteCase = (id: string) => setGameState(p => ({ ...p, cases: p.cases.filter(c => c.id !== id) }));
  const importSave = (json: string) => DatabaseService.importData(json);
  const exportSave = () => DatabaseService.exportData();
  const addShopItem = (entry: ShopEntry) => setGameState(p => ({ ...p, config: { ...p.config, shopConfig: [...p.config.shopConfig, entry] } }));
  const removeShopItem = (id: string) => setGameState(p => ({ ...p, config: { ...p.config, shopConfig: p.config.shopConfig.filter(x => x.id !== id) } }));
  const createGiveaway = (tid: string, dur: number) => setGameState(p => ({ ...p, config: { ...p.config, activeGiveaway: { id: crypto.randomUUID(), prizeTemplateId: tid, endTime: Date.now() + (dur * 60000), entrants: [], winner: null } } }));
  const endGiveaway = () => setGameState(p => ({ ...p, config: { ...p.config, activeGiveaway: null } }));
  const joinGiveaway = () => setGameState(p => {
       if (!p.config.activeGiveaway || p.config.activeGiveaway.entrants.includes(p.username!)) return p;
       return { ...p, config: { ...p.config, activeGiveaway: { ...p.config.activeGiveaway, entrants: [...p.config.activeGiveaway.entrants, p.username!] } } };
  });
  const adminSendMail = (to: string, subj: string, body: string) => setGameState(p => {
       const newDB = { ...p.userDatabase };
       const msg: InboxMessage = { id: crypto.randomUUID(), subject: subj, body, from: 'Admin', read: false, timestamp: Date.now() };
       if (to === 'ALL') {
           Object.keys(newDB).forEach(u => newDB[u].inbox.push(msg));
       } else if (newDB[to]) {
           newDB[to].inbox.push(msg);
       }
       return { ...p, userDatabase: newDB, inbox: (to === p.username || to === 'ALL') ? [...p.inbox, msg] : p.inbox };
  });
  const adminRemoveItemFromUser = (u: string, iid: string) => {
       setGameState(p => {
           const newDB = { ...p.userDatabase };
           if (newDB[u]) {
               newDB[u].inventory = newDB[u].inventory!.filter(i => i.id !== iid);
               newDB[u].inventoryCount = newDB[u].inventory!.length;
           }
           return { ...p, userDatabase: newDB, inventory: u === p.username ? p.inventory.filter(i => i.id !== iid) : p.inventory };
       });
  };
  const createUpdate = (u: GameUpdate) => setGameState(p => ({ ...p, updates: [u, ...p.updates] }));
  const deleteUpdate = (id: string) => setGameState(p => ({ ...p, updates: p.updates.filter(u => u.id !== id) }));
  const updateGameSettings = (s: Partial<GameSettings>) => setGameState(p => ({ ...p, config: { ...p.config, gameSettings: { ...p.config.gameSettings, ...s } } }));
  const setAdminNotes = (u: string, n: string) => setGameState(p => ({ ...p, userDatabase: { ...p.userDatabase, [u]: { ...p.userDatabase[u], adminNotes: n } } }));
  const resolveReport = (id: string, s: 'RESOLVED' | 'DISMISSED') => setGameState(p => ({ ...p, reports: p.reports.map(r => r.id === id ? { ...r, status: s } : r) }));
  const adminUpdateUser = (u: string, d: Partial<UserAccount>) => setGameState(p => ({ ...p, userDatabase: { ...p.userDatabase, [u]: { ...p.userDatabase[u], ...d } } }));
  const sendChatMessage = (text: string) => {
       setGameState(p => {
            const msg: ChatMessage = { id: crypto.randomUUID(), username: p.username!, text, timestamp: Date.now(), role: p.role, vip: p.isPremium };
            return { ...p, chatHistory: [...p.chatHistory, msg].slice(-50) };
       });
  };
  const reportUser = (suspect: string, reason: UserReport['reason']) => {
       setGameState(p => {
           const r: UserReport = { id: crypto.randomUUID(), reporter: p.username!, suspect, reason, timestamp: Date.now(), status: 'PENDING' };
           return { ...p, reports: [...p.reports, r] };
       });
  };

  return {
    gameState,
    setGameState,
    login, logout,
    addBalance, removeBalance,
    addXp, setLevel,
    claimDailyReward,
    openCase,
    addItem, removeItem,
    sellItem, sellItems,
    buyAuctionItem, listUserItem, cancelUserListing, clearAuctions,
    createTradeOffer, redeemTradeCode, createTradeListing, fulfillTrade, cancelTrade,
    getNextRarity, getItemsByRarity,
    resetGame, buyPremium, buyMiningUpgrade,
    recordDropStats, consumeKey,
    setGlobalLuck, triggerEvent, scheduleEvent,
    sendAdminEmail, adminSendMail,
    createPromoCode, deletePromoCode, redeemPromoCode,
    toggleMaintenance, setMotd, setTheme,
    addLog, updateConfig, updateGameSettings,
    adminGiveItem, adminAddCoins, adminSetRole, adminBanUser, adminKickUser, adminWipeUser, adminMuteUser, adminRenameUser, adminResetStats, adminRemoveItemFromUser, adminUpdateUser,
    createItem, deleteItem,
    createCase, deleteCase,
    injectFakeDrop, injectDrop,
    setPlayerLuck, tagPlayer,
    seasonReset, consoleCommand,
    setMarketMultiplier, massGift, setGlobalAnnouncement,
    importSave, exportSave,
    addShopItem, removeShopItem,
    createGiveaway, endGiveaway, joinGiveaway,
    createUpdate, deleteUpdate,
    setAdminNotes, resolveReport,
    sendChatMessage, reportUser
  };
};