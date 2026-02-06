import { Case, ItemTemplate, Rarity, GameState } from './types';

// STATIC DEFAULTS (Loaded into state on first run)
export const DEFAULT_ITEMS: Record<string, ItemTemplate> = {
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
  'neon_shades': { id: 'neon_shades', name: 'Neon Shades', rarity: Rarity.EPIC, baseValue: 400, icon: 'Glasses', type: 'equipment', circulation: 9000 },

  // Legendary
  'dragon_scale': { id: 'dragon_scale', name: 'Dragon Scale', rarity: Rarity.LEGENDARY, baseValue: 1000, icon: 'Flame', type: 'equipment', circulation: 2500 },
  'kings_crown': { id: 'kings_crown', name: 'King\'s Crown', rarity: Rarity.LEGENDARY, baseValue: 1500, icon: 'Crown', type: 'equipment', circulation: 1500 },
  'phoenix_feather': { id: 'phoenix_feather', name: 'Phoenix Feather', rarity: Rarity.LEGENDARY, baseValue: 1200, icon: 'Feather', type: 'equipment', circulation: 2000 },
  'space_marine': { id: 'space_marine', name: 'Space Marine', rarity: Rarity.LEGENDARY, baseValue: 2000, icon: 'Rocket', type: 'character', circulation: 1000 },
  'mech_suit': { id: 'mech_suit', name: 'Mech Suit', rarity: Rarity.LEGENDARY, baseValue: 2500, icon: 'Cpu', type: 'equipment', circulation: 800 },
  'cyber_katana': { id: 'cyber_katana', name: 'Cyber Katana', rarity: Rarity.LEGENDARY, baseValue: 3000, icon: 'Sword', type: 'equipment', circulation: 600 },

  // Mythic
  'infinity_stone': { id: 'infinity_stone', name: 'Infinity Stone', rarity: Rarity.MYTHIC, baseValue: 10000, icon: 'Hexagon', type: 'equipment', circulation: 50 },
  'mjolnir': { id: 'mjolnir', name: 'Mjolnir', rarity: Rarity.MYTHIC, baseValue: 15000, icon: 'Hammer', type: 'equipment', circulation: 25 },
  'time_traveler': { id: 'time_traveler', name: 'Time Traveler', rarity: Rarity.MYTHIC, baseValue: 25000, icon: 'Hourglass', type: 'character', circulation: 10 },
  'ancient_dragon': { id: 'ancient_dragon', name: 'Ancient Dragon', rarity: Rarity.MYTHIC, baseValue: 30000, icon: 'Dragon', type: 'character', circulation: 15 },
  'omega_core': { id: 'omega_core', name: 'Omega Core', rarity: Rarity.MYTHIC, baseValue: 40000, icon: 'Atom', type: 'artifact', circulation: 20 },

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
    price: 50,
    levelRequired: 0,
    image: '📦',
    description: 'Beginner Friendly',
    contains: [
      { templateId: 'rusty_knife', weight: 40 },
      { templateId: 'old_boot', weight: 35 },
      { templateId: 'rock', weight: 15 }, 
      { templateId: 'iron_sword', weight: 9.9 },
      { templateId: 'kings_crown', weight: 0.1 }, // Added Rare Chance
    ]
  },
  {
    id: 'warrior_case',
    name: 'Warrior Case',
    price: 250,
    levelRequired: 0,
    image: '⚔️',
    description: 'For the brave',
    contains: [
      { templateId: 'iron_sword', weight: 40 },
      { templateId: 'leather_armor', weight: 30 },
      { templateId: 'steel_dagger', weight: 20 },
      { templateId: 'shadow_cloak', weight: 9 },
      { templateId: 'mjolnir', weight: 1 },
    ]
  },
  {
    id: 'hero_case',
    name: 'Hero Case',
    price: 600,
    levelRequired: 0,
    image: '🦸',
    description: 'Become a legend',
    contains: [
      { templateId: 'healing_potion', weight: 40 },
      { templateId: 'wizard_hat', weight: 30 },
      { templateId: 'mercenary_jack', weight: 20 },
      { templateId: 'cyber_ninja', weight: 9 },
      { templateId: 'laser_pistol', weight: 1 }, 
    ]
  },
  {
    id: 'neon_case',
    name: 'Neon Case',
    price: 1500,
    levelRequired: 0,
    image: '🌆',
    description: 'Cyberpunk Aesthetics',
    contains: [
        { templateId: 'laser_pistol', weight: 45 },
        { templateId: 'neon_shades', weight: 35 },
        { templateId: 'plasma_rifle', weight: 15 },
        { templateId: 'cyber_katana', weight: 4 },
        { templateId: 'the_glitch', weight: 1 }
    ]
  },
  {
    id: 'royal_case',
    name: 'Royal Case',
    price: 2500,
    levelRequired: 0,
    image: '👑',
    description: 'Fit for a King',
    contains: [
      { templateId: 'silver_ring', weight: 40 },
      { templateId: 'golden_chalice', weight: 30 },
      { templateId: 'emerald_gem', weight: 20 },
      { templateId: 'kings_crown', weight: 9 },
      { templateId: 'infinity_stone', weight: 1 }, 
    ]
  },
  {
    id: 'cyber_case',
    name: 'Cyber Case',
    price: 5000,
    levelRequired: 0,
    image: '💾',
    description: 'High Tech Gear',
    contains: [
        { templateId: 'laser_pistol', weight: 40 },
        { templateId: 'cyber_ninja', weight: 30 },
        { templateId: 'plasma_rifle', weight: 20 },
        { templateId: 'mech_suit', weight: 9 },
        { templateId: 'the_glitch', weight: 1 }
    ]
  },
  {
    id: 'omega_case',
    name: 'Omega Case',
    price: 10000,
    levelRequired: 0,
    image: '🧬',
    description: 'The Ultimate Collection',
    contains: [
        { templateId: 'kings_crown', weight: 40 },
        { templateId: 'cyber_katana', weight: 30 },
        { templateId: 'omega_core', weight: 20 },
        { templateId: 'ancient_dragon', weight: 9 },
        { templateId: 'dark_matter_essence', weight: 1 }, 
    ]
  },
  {
    id: 'void_case',
    name: 'Void Case',
    price: 25000,
    levelRequired: 0,
    image: '🌌',
    description: 'Enter the darkness',
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
    price: 50000,
    levelRequired: 0,
    image: '🏴‍☠️',
    description: 'Illegal Goods',
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

// RECONFIGURED FOR PLAY COUNT LEVELING (1 Play = 1 XP)
export const XP_PER_LEVEL_BASE = 25; // First level needs 25 plays
export const XP_MULTIPLIER = 1.1; // 10% increase per level

export const BAD_WORDS = ['scam', 'hack', 'bot', 'cheat', 'fuck', 'shit', 'ass', 'nigger', 'faggot', 'retard', 'cunt', 'bitch', 'whore', 'dick', 'pussy'];

export const FAKE_MESSAGES = [
    "Anyone want to trade?",
    "Just pulled a Legendary! LETS GOOO",
    "Buying Potions 500g",
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
  dbVersion: 16, 
  username: null,
  role: 'USER',
  isAdmin: false, 
  isPremium: false,
  premiumLevel: 0,
  rememberMe: false,
  balance: 200,
  xp: 0, // Now represents 'Plays towards level'
  level: 1,
  miningLevel: 0,
  showLevelUp: false, 
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
    totalGamesPlayed: 0, // Initialize
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
  promoCodes: [
      // Standard Permanent Codes
      { code: 'WELCOME', reward: 5000, maxUses: -1, currentUses: 0 },
      { code: 'FREECOINS', reward: 1000, maxUses: -1, currentUses: 0 },
      
      // 30 Generated 10k Codes (Single Use)
      { code: 'GOLD-8X2A', reward: 10000, maxUses: 1, currentUses: 0 },
      { code: 'GOLD-9B1C', reward: 10000, maxUses: 1, currentUses: 0 },
      { code: 'GOLD-3D4F', reward: 10000, maxUses: 1, currentUses: 0 },
      { code: 'GOLD-7H8J', reward: 10000, maxUses: 1, currentUses: 0 },
      { code: 'GOLD-2K9L', reward: 10000, maxUses: 1, currentUses: 0 },
      { code: 'RICH-1M2N', reward: 10000, maxUses: 1, currentUses: 0 },
      { code: 'RICH-5P6Q', reward: 10000, maxUses: 1, currentUses: 0 },
      { code: 'RICH-8R9S', reward: 10000, maxUses: 1, currentUses: 0 },
      { code: 'RICH-4T3V', reward: 10000, maxUses: 1, currentUses: 0 },
      { code: 'RICH-6W7X', reward: 10000, maxUses: 1, currentUses: 0 },
      { code: 'EPIC-9Y8Z', reward: 10000, maxUses: 1, currentUses: 0 },
      { code: 'EPIC-2A1B', reward: 10000, maxUses: 1, currentUses: 0 },
      { code: 'EPIC-5C3D', reward: 10000, maxUses: 1, currentUses: 0 },
      { code: 'EPIC-8E7F', reward: 10000, maxUses: 1, currentUses: 0 },
      { code: 'EPIC-4G6H', reward: 10000, maxUses: 1, currentUses: 0 },
      { code: 'MEGA-1J2K', reward: 10000, maxUses: 1, currentUses: 0 },
      { code: 'MEGA-9L8M', reward: 10000, maxUses: 1, currentUses: 0 },
      { code: 'MEGA-3N4P', reward: 10000, maxUses: 1, currentUses: 0 },
      { code: 'MEGA-7Q6R', reward: 10000, maxUses: 1, currentUses: 0 },
      { code: 'MEGA-2S1T', reward: 10000, maxUses: 1, currentUses: 0 },
      { code: 'LUCK-8V9W', reward: 10000, maxUses: 1, currentUses: 0 },
      { code: 'LUCK-4X3Y', reward: 10000, maxUses: 1, currentUses: 0 },
      { code: 'LUCK-6Z5A', reward: 10000, maxUses: 1, currentUses: 0 },
      { code: 'LUCK-1B2C', reward: 10000, maxUses: 1, currentUses: 0 },
      { code: 'LUCK-9D8E', reward: 10000, maxUses: 1, currentUses: 0 },
      { code: 'WIN-3F4G', reward: 10000, maxUses: 1, currentUses: 0 },
      { code: 'WIN-7H6J', reward: 10000, maxUses: 1, currentUses: 0 },
      { code: 'WIN-2K1L', reward: 10000, maxUses: 1, currentUses: 0 },
      { code: 'WIN-5M9N', reward: 10000, maxUses: 1, currentUses: 0 },
      { code: 'WIN-8P3Q', reward: 10000, maxUses: 1, currentUses: 0 },

      // 30 Generated 1k Codes (5 Uses)
      { code: 'BOOST-1A2B', reward: 1000, maxUses: 5, currentUses: 0 },
      { code: 'BOOST-3C4D', reward: 1000, maxUses: 5, currentUses: 0 },
      { code: 'BOOST-5E6F', reward: 1000, maxUses: 5, currentUses: 0 },
      { code: 'BOOST-7G8H', reward: 1000, maxUses: 5, currentUses: 0 },
      { code: 'BOOST-9I0J', reward: 1000, maxUses: 5, currentUses: 0 },
      { code: 'STAR-2K3L', reward: 1000, maxUses: 5, currentUses: 0 },
      { code: 'STAR-4M5N', reward: 1000, maxUses: 5, currentUses: 0 },
      { code: 'STAR-6O7P', reward: 1000, maxUses: 5, currentUses: 0 },
      { code: 'STAR-8Q9R', reward: 1000, maxUses: 5, currentUses: 0 },
      { code: 'STAR-0S1T', reward: 1000, maxUses: 5, currentUses: 0 },
      { code: 'COIN-1U2V', reward: 1000, maxUses: 5, currentUses: 0 },
      { code: 'COIN-3W4X', reward: 1000, maxUses: 5, currentUses: 0 },
      { code: 'COIN-5Y6Z', reward: 1000, maxUses: 5, currentUses: 0 },
      { code: 'COIN-7A8B', reward: 1000, maxUses: 5, currentUses: 0 },
      { code: 'COIN-9C0D', reward: 1000, maxUses: 5, currentUses: 0 },
      { code: 'CASH-2E3F', reward: 1000, maxUses: 5, currentUses: 0 },
      { code: 'CASH-4G5H', reward: 1000, maxUses: 5, currentUses: 0 },
      { code: 'CASH-6I7J', reward: 1000, maxUses: 5, currentUses: 0 },
      { code: 'CASH-8K9L', reward: 1000, maxUses: 5, currentUses: 0 },
      { code: 'CASH-0M1N', reward: 1000, maxUses: 5, currentUses: 0 },
      { code: 'DROP-1O2P', reward: 1000, maxUses: 5, currentUses: 0 },
      { code: 'DROP-3Q4R', reward: 1000, maxUses: 5, currentUses: 0 },
      { code: 'DROP-5S6T', reward: 1000, maxUses: 5, currentUses: 0 },
      { code: 'DROP-7U8V', reward: 1000, maxUses: 5, currentUses: 0 },
      { code: 'DROP-9W0X', reward: 1000, maxUses: 5, currentUses: 0 },
      { code: 'SEED-2Y3Z', reward: 1000, maxUses: 5, currentUses: 0 },
      { code: 'SEED-4A5B', reward: 1000, maxUses: 5, currentUses: 0 },
      { code: 'SEED-6C7D', reward: 1000, maxUses: 5, currentUses: 0 },
      { code: 'SEED-8E9F', reward: 1000, maxUses: 5, currentUses: 0 },
      { code: 'SEED-0G1H', reward: 1000, maxUses: 5, currentUses: 0 },
  ],
  redeemedCodes: [],
  logs: [],
  chatHistory: [
      { id: 'sys1', username: 'SYSTEM', text: 'Welcome to Global Chat! Be respectful.', timestamp: Date.now(), role: 'ADMIN', isSystem: true },
  ],
  liveFeed: [],
  motd: 'SEASON 2: NEW LEVELING SYSTEM. PLAY GAMES TO LEVEL UP!',
  theme: 'default',
  season: 2,
  scheduledEvents: [],
  
  // Initial Updates
  updates: [
      { id: '6', version: 'v7.1.0', title: 'System Update', description: 'Leveling system reworked: Levels are now based on games played. Mines and Plinko excluded from XP gain. Bots removed.', date: Date.now(), author: 'System' },
      { id: '5', version: 'v7.0.0', title: 'Season 2 Wipe', description: 'All accounts have been reset to give everyone a fair start. Good luck!', date: Date.now() - 3600000, author: 'System' },
  ],
  
  // Fake Reports
  reports: [],
  
  // Real DB - Empty now (No Bots)
  userDatabase: {}
};