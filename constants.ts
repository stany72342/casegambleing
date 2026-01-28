import { Case, ItemTemplate, Rarity, GameState } from './types';

// STATIC DEFAULTS (Loaded into state on first run)
export const DEFAULT_ITEMS: Record<string, ItemTemplate> = {
  // KEYS
  'starter_key': { id: 'starter_key', name: 'Starter Key', rarity: Rarity.COMMON, baseValue: 50, icon: 'Key', type: 'key', circulation: 999999 },
  'warrior_key': { id: 'warrior_key', name: 'Warrior Key', rarity: Rarity.UNCOMMON, baseValue: 200, icon: 'Key', type: 'key', circulation: 999999 },
  'hero_key': { id: 'hero_key', name: 'Hero Key', rarity: Rarity.RARE, baseValue: 500, icon: 'Key', type: 'key', circulation: 999999 },
  'royal_key': { id: 'royal_key', name: 'Royal Key', rarity: Rarity.EPIC, baseValue: 1000, icon: 'Key', type: 'key', circulation: 999999 },
  'black_market_key': { id: 'black_market_key', name: 'Black Market Key', rarity: Rarity.LEGENDARY, baseValue: 50000, icon: 'Key', type: 'key', circulation: 999999 },
  'cyber_key': { id: 'cyber_key', name: 'Cyber Key', rarity: Rarity.RARE, baseValue: 750, icon: 'Key', type: 'key', circulation: 999999 },
  'event_horizon_key': { id: 'event_horizon_key', name: 'Event Horizon Key', rarity: Rarity.DARK_MATTER, baseValue: 25000, icon: 'Key', type: 'key', circulation: 9999 },

  // Common
  'rusty_knife': { id: 'rusty_knife', name: 'Rusty Knife', rarity: Rarity.COMMON, baseValue: 5, icon: 'Knife', type: 'equipment', circulation: 1200000 },
  'old_boot': { id: 'old_boot', name: 'Old Boot', rarity: Rarity.COMMON, baseValue: 2, icon: 'Footprints', type: 'equipment', circulation: 1500000 },
  'broken_shield': { id: 'broken_shield', name: 'Broken Shield', rarity: Rarity.COMMON, baseValue: 4, icon: 'ShieldAlert', type: 'equipment', circulation: 900000 },
  'rock': { id: 'rock', name: 'Just a Rock', rarity: Rarity.COMMON, baseValue: 1, icon: 'CircleDot', type: 'equipment', circulation: 2000000 },
  
  // Uncommon
  'iron_sword': { id: 'iron_sword', name: 'Iron Sword', rarity: Rarity.UNCOMMON, baseValue: 15, icon: 'Sword', type: 'equipment', circulation: 450000 },
  'leather_armor': { id: 'leather_armor', name: 'Leather Armor', rarity: Rarity.UNCOMMON, baseValue: 20, icon: 'Shirt', type: 'equipment', circulation: 300000 },
  'healing_potion': { id: 'healing_potion', name: 'Healing Potion', rarity: Rarity.UNCOMMON, baseValue: 12, icon: 'FlaskConical', type: 'equipment', circulation: 600000 },
  'training_dummy': { id: 'training_dummy', name: 'Training Dummy', rarity: Rarity.UNCOMMON, baseValue: 18, icon: 'UserMinus', type: 'equipment', circulation: 400000 },

  // Rare
  'steel_dagger': { id: 'steel_dagger', name: 'Steel Dagger', rarity: Rarity.RARE, baseValue: 50, icon: 'MoveDiagonal', type: 'equipment', circulation: 80000 },
  'silver_ring': { id: 'silver_ring', name: 'Silver Ring', rarity: Rarity.RARE, baseValue: 65, icon: 'Circle', type: 'equipment', circulation: 65000 },
  'wizard_hat': { id: 'wizard_hat', name: 'Wizard Hat', rarity: Rarity.RARE, baseValue: 55, icon: 'HardHat', type: 'equipment', circulation: 75000 },
  'mercenary_jack': { id: 'mercenary_jack', name: 'Mercenary Jack', rarity: Rarity.RARE, baseValue: 80, icon: 'User', type: 'character', circulation: 50000 },
  'laser_pistol': { id: 'laser_pistol', name: 'Laser Pistol', rarity: Rarity.RARE, baseValue: 90, icon: 'Zap', type: 'equipment', circulation: 45000 },

  // Epic
  'golden_chalice': { id: 'golden_chalice', name: 'Golden Chalice', rarity: Rarity.EPIC, baseValue: 200, icon: 'CupSoda', type: 'equipment', circulation: 15000 },
  'emerald_gem': { id: 'emerald_gem', name: 'Emerald Gem', rarity: Rarity.EPIC, baseValue: 250, icon: 'Gem', type: 'equipment', circulation: 12000 },
  'shadow_cloak': { id: 'shadow_cloak', name: 'Shadow Cloak', rarity: Rarity.EPIC, baseValue: 180, icon: 'Ghost', type: 'equipment', circulation: 18000 },
  'cyber_ninja': { id: 'cyber_ninja', name: 'Cyber Ninja', rarity: Rarity.EPIC, baseValue: 300, icon: 'Bot', type: 'character', circulation: 8000 },
  'plasma_rifle': { id: 'plasma_rifle', name: 'Plasma Rifle', rarity: Rarity.EPIC, baseValue: 350, icon: 'Crosshair', type: 'equipment', circulation: 7000 },

  // Legendary
  'dragon_scale': { id: 'dragon_scale', name: 'Dragon Scale', rarity: Rarity.LEGENDARY, baseValue: 1000, icon: 'Flame', type: 'equipment', circulation: 2500 },
  'kings_crown': { id: 'kings_crown', name: 'King\'s Crown', rarity: Rarity.LEGENDARY, baseValue: 1500, icon: 'Crown', type: 'equipment', circulation: 1500 },
  'phoenix_feather': { id: 'phoenix_feather', name: 'Phoenix Feather', rarity: Rarity.LEGENDARY, baseValue: 1200, icon: 'Feather', type: 'equipment', circulation: 2000 },
  'space_marine': { id: 'space_marine', name: 'Space Marine', rarity: Rarity.LEGENDARY, baseValue: 2000, icon: 'Rocket', type: 'character', circulation: 1000 },
  'mech_suit': { id: 'mech_suit', name: 'Mech Suit', rarity: Rarity.LEGENDARY, baseValue: 2500, icon: 'Cpu', type: 'equipment', circulation: 800 },

  // Mythic
  'infinity_stone': { id: 'infinity_stone', name: 'Infinity Stone', rarity: Rarity.MYTHIC, baseValue: 10000, icon: 'Hexagon', type: 'equipment', circulation: 50 },
  'mjolnir': { id: 'mjolnir', name: 'Mjolnir', rarity: Rarity.MYTHIC, baseValue: 15000, icon: 'Hammer', type: 'equipment', circulation: 25 },
  'time_traveler': { id: 'time_traveler', name: 'Time Traveler', rarity: Rarity.MYTHIC, baseValue: 25000, icon: 'Hourglass', type: 'character', circulation: 10 },
  'ancient_dragon': { id: 'ancient_dragon', name: 'Ancient Dragon', rarity: Rarity.MYTHIC, baseValue: 30000, icon: 'Dragon', type: 'character', circulation: 15 },

  // Dark Matter
  'dark_matter_essence': { id: 'dark_matter_essence', name: 'Dark Matter Essence', rarity: Rarity.DARK_MATTER, baseValue: 45000, icon: 'Sparkles', type: 'artifact', circulation: 150 },
  'void_walker': { id: 'void_walker', name: 'Void Walker', rarity: Rarity.DARK_MATTER, baseValue: 60000, icon: 'Ghost', type: 'character', circulation: 100 },
  'singularity_cannon': { id: 'singularity_cannon', name: 'Singularity Cannon', rarity: Rarity.DARK_MATTER, baseValue: 75000, icon: 'Crosshair', type: 'equipment', circulation: 80 },

  // Contraband (One of a kind / Ultra Rare)
  'the_glitch': { id: 'the_glitch', name: 'The Glitch', rarity: Rarity.CONTRABAND, baseValue: 500000, icon: 'Bug', type: 'equipment', circulation: 1 },
  'developer_key': { id: 'developer_key', name: 'Developer Key', rarity: Rarity.CONTRABAND, baseValue: 250000, icon: 'Key', type: 'equipment', circulation: 3 },
  'golden_ticket': { id: 'golden_ticket', name: 'Golden Ticket', rarity: Rarity.CONTRABAND, baseValue: 100000, icon: 'Ticket', type: 'equipment', circulation: 5 },

  // GODLIKE
  'cc3': { id: 'cc3', name: 'CC3', rarity: Rarity.GODLIKE, baseValue: 9999999999, icon: 'Globe', type: 'artifact', circulation: 0 },
  // SECRET GLITCH ITEM
  'secret_glitch': { 
      id: 'secret_glitch', 
      name: 'ă̵̲̓͂̈́̓̾̀̔̀̔̐̉͑͝ḑ̴̛͈͎͍̞͍̣͍̺̋́̽̈́͑̌̀̚w̸̤̮̆̽͋͂̔͆͂̾͝͝q̸̳̙̜̑̅͛̈́̂͋͒͗̏̿̆͛̿̄ê̵͈̱͔̼̊͝', 
      rarity: Rarity.GODLIKE, 
      baseValue: 666666666, 
      icon: 'Eye', 
      type: 'artifact', 
      circulation: 0,
      hidden: true // Prevents showing in shop
  },
};

export const DEFAULT_CASES: Case[] = [
  {
    id: 'starter_case',
    name: 'Starter Case',
    price: 0,
    keyTemplateId: 'starter_key',
    levelRequired: 0,
    image: '📦',
    description: 'Requires Starter Key',
    contains: [
      { templateId: 'rusty_knife', weight: 35 },
      { templateId: 'old_boot', weight: 35 },
      { templateId: 'iron_sword', weight: 20 },
      { templateId: 'steel_dagger', weight: 8 },
      { templateId: 'dragon_scale', weight: 2 },
    ]
  },
  {
    id: 'warrior_case',
    name: 'Warrior Case',
    price: 0,
    keyTemplateId: 'warrior_key',
    levelRequired: 0,
    image: '⚔️',
    description: 'Requires Warrior Key',
    contains: [
      { templateId: 'iron_sword', weight: 35 },
      { templateId: 'leather_armor', weight: 30 },
      { templateId: 'steel_dagger', weight: 20 },
      { templateId: 'shadow_cloak', weight: 12 },
      { templateId: 'mjolnir', weight: 3 },
    ]
  },
  {
    id: 'hero_case',
    name: 'Hero Case',
    price: 0,
    keyTemplateId: 'hero_key',
    levelRequired: 0,
    image: '🦸',
    description: 'Requires Hero Key',
    contains: [
      { templateId: 'healing_potion', weight: 35 },
      { templateId: 'wizard_hat', weight: 30 },
      { templateId: 'mercenary_jack', weight: 25 },
      { templateId: 'cyber_ninja', weight: 8 },
      { templateId: 'space_marine', weight: 2 },
    ]
  },
  {
    id: 'royal_case',
    name: 'Royal Case',
    price: 0,
    keyTemplateId: 'royal_key',
    levelRequired: 0,
    image: '👑',
    description: 'Requires Royal Key',
    contains: [
      { templateId: 'silver_ring', weight: 35 },
      { templateId: 'golden_chalice', weight: 30 },
      { templateId: 'emerald_gem', weight: 20 },
      { templateId: 'kings_crown', weight: 12 },
      { templateId: 'time_traveler', weight: 3 },
    ]
  },
  {
    id: 'cyber_case',
    name: 'Cyber Case',
    price: 0,
    keyTemplateId: 'cyber_key',
    levelRequired: 0,
    image: '💾',
    description: 'Requires Cyber Key',
    contains: [
        { templateId: 'laser_pistol', weight: 35 },
        { templateId: 'cyber_ninja', weight: 30 },
        { templateId: 'plasma_rifle', weight: 20 },
        { templateId: 'mech_suit', weight: 12 },
        { templateId: 'the_glitch', weight: 3 }
    ]
  },
  {
    id: 'void_case',
    name: 'Void Case',
    price: 0,
    keyTemplateId: 'event_horizon_key',
    levelRequired: 10,
    image: '🌌',
    description: 'Requires Event Horizon Key',
    contains: [
      { templateId: 'shadow_cloak', weight: 40 },
      { templateId: 'dark_matter_essence', weight: 30 },
      { templateId: 'void_walker', weight: 20 },
      { templateId: 'singularity_cannon', weight: 9 },
      { templateId: 'the_glitch', weight: 1 }
    ]
  },
  {
    id: 'black_market_case',
    name: 'Black Market',
    price: 0,
    keyTemplateId: 'black_market_key',
    levelRequired: 0,
    image: '🏴‍☠️',
    description: 'Requires Black Market Key',
    contains: [
      { templateId: 'kings_crown', weight: 45 },
      { templateId: 'infinity_stone', weight: 30 },
      { templateId: 'golden_ticket', weight: 15 },
      { templateId: 'developer_key', weight: 6 },
      { templateId: 'the_glitch', weight: 3 },
      { templateId: 'cc3', weight: 0.5 }, 
      { templateId: 'secret_glitch', weight: 0.1 }, 
    ]
  }
];

export const XP_PER_LEVEL_BASE = 100;
export const XP_MULTIPLIER = 1.2;

export const BAD_WORDS = ['scam', 'hack', 'bot', 'cheat', 'fuck', 'shit', 'ass', 'nigger', 'faggot', 'retard', 'cunt', 'bitch', 'whore', 'dick', 'pussy'];

export const FAKE_MESSAGES = [
    "Anyone want to trade?",
    "Just pulled a Legendary! LETS GOOO",
    "Buying Keys 10k each",
    "This site is addictive lol",
    "Can someone give me free coins pls?",
    "RIP lost 100k on blackjack",
    "Selling Dark Matter Essence, trade me",
    "Is the Black Market case worth it?",
    "Admin pls ban the scammer",
    "gg",
    "ez",
    "Looking for a clan",
    "W drop",
    "L luck today",
    "Who wants to do a coinflip?",
    "Just upgraded to Mythic!!",
    "How do I get XP fast?",
    "Check my inventory"
];

export const INITIAL_STATE: GameState = {
  dbVersion: 1,
  username: null,
  role: 'USER',
  isAdmin: false, 
  isPremium: false,
  premiumLevel: 0,
  rememberMe: false,
  balance: 200,
  xp: 0,
  level: 1,
  inventory: [],
  inbox: [], 
  stats: {
    casesOpened: 0,
    itemsUpgraded: 0,
    jackpotsHit: 0,
    totalClicks: 0,
    totalMoneySpent: 0,
    totalItemValueObtained: 0,
    bestDropValue: 0,
    bestDropName: 'None',
    worstLossValue: 0,
    legendariesPulled: 0,
    mythicsPulled: 0,
    contrabandsPulled: 0,
  },
  lastDailyReward: 0,
  auctionListings: [],
  userListings: [],
  activeTrades: [],
  
  // Dynamic Data
  items: DEFAULT_ITEMS,
  cases: DEFAULT_CASES,
  config: {
      globalLuckMultiplier: 1,
      slotWinChance: 0.3, 
      upgradeBaseChanceMultiplier: 1,
      casePriceMultiplier: 1,
      sellValueMultiplier: 1,
      maintenanceMode: false,
      activeEvent: null,
      announcement: null,
      activeGiveaway: null,
      shopConfig: [],
      gameSettings: {
          blackjackPayout: 1.5,
          rouletteMultipliers: { red: 2, black: 2, green: 14 },
          minesHouseEdge: 0.05,
          slotRtp: 0.95
      },
      bannedIps: [],
      featureToggles: {
          slots: true,
          upgrader: true,
          trading: true,
          auction: true,
          shop: true,
          codes: true,
          blackjack: true,
          roulette: true,
          mines: true,
      }
  },
  
  circulationCounts: {},
  promoCodes: [],
  redeemedCodes: [],
  logs: [],
  chatHistory: [
      { id: 'sys1', username: 'SYSTEM', text: 'Welcome to Global Chat! Be respectful.', timestamp: Date.now(), role: 'ADMIN', isSystem: true },
      { id: 'sys2', username: 'NinjaSlayer99', text: 'Anyone wanna trade keys?', timestamp: Date.now() - 50000, role: 'USER' }
  ],
  liveFeed: [],
  motd: null,
  theme: 'default',
  season: 1,
  scheduledEvents: [],
  
  // Initial Updates
  updates: [
      { id: '1', version: 'v4.8.0', title: 'The Casino Update', description: 'Added Mines, Blackjack, and Roulette! Good luck.', date: Date.now(), author: 'System' }
  ],
  
  // Fake Reports
  reports: [
      { id: 'r1', reporter: 'NinjaSlayer99', suspect: 'KaiCenatFan', reason: 'TOXIC', timestamp: Date.now() - 100000, status: 'PENDING' },
      { id: 'r2', reporter: 'CaseOpenerPro', suspect: 'RandomUser123', reason: 'SCAM', timestamp: Date.now() - 500000, status: 'PENDING' },
  ],
  
  // Fake DB
  userDatabase: {
      'NinjaSlayer99': { username: 'NinjaSlayer99', role: 'USER', banned: false, balance: 15400000, level: 42, inventoryCount: 84, lastLogin: '2 mins ago', luckMultiplier: 1, tags: ['VIP', 'WHALE'], inbox: [], stats: { totalSpent: 500000, totalValue: 15400000, casesOpened: 1200, sessionStart: Date.now() } },
      'KaiCenatFan': { username: 'KaiCenatFan', role: 'USER', banned: false, balance: 12000000, level: 38, inventoryCount: 120, lastLogin: '5 hours ago', luckMultiplier: 0.8, tags: [], inbox: [], stats: { totalSpent: 200000, totalValue: 12000000, casesOpened: 800, sessionStart: Date.now() - 3600000 } },
      'CaseOpenerPro': { username: 'CaseOpenerPro', role: 'USER', banned: false, balance: 8500000, level: 35, inventoryCount: 200, lastLogin: '1 day ago', luckMultiplier: 1.2, tags: ['TESTER'], inbox: [], stats: { totalSpent: 1000000, totalValue: 8500000, casesOpened: 5000, sessionStart: Date.now() - 86400000 } },
      'LuckyStrike': { username: 'LuckyStrike', role: 'USER', banned: false, balance: 2100000, level: 20, inventoryCount: 45, lastLogin: 'Just now', luckMultiplier: 1.1, tags: [], inbox: [], stats: { totalSpent: 50000, totalValue: 2100000, casesOpened: 200, sessionStart: Date.now() } },
      'RNG_God': { username: 'RNG_God', role: 'MOD', banned: false, balance: 5000000, level: 29, inventoryCount: 60, lastLogin: '1 min ago', luckMultiplier: 1.5, tags: ['VIP'], inbox: [], stats: { totalSpent: 100000, totalValue: 5000000, casesOpened: 600, sessionStart: Date.now() } },
  }
};