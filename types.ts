export enum Rarity {
  COMMON = 'COMMON',
  UNCOMMON = 'UNCOMMON',
  RARE = 'RARE',
  EPIC = 'EPIC',
  LEGENDARY = 'LEGENDARY',
  MYTHIC = 'MYTHIC',
  DARK_MATTER = 'DARK_MATTER',
  CONTRABAND = 'CONTRABAND',
  GODLIKE = 'GODLIKE'
}

export type ItemType = 'equipment' | 'character' | 'key' | 'artifact';
export type Role = 'USER' | 'MOD' | 'ADMIN' | 'OWNER';

export interface Item {
  id: string;
  templateId: string;
  name: string;
  rarity: Rarity;
  value: number;
  icon: string;
  type: ItemType;
  obtainedAt: number;
}

export interface ItemTemplate {
  id: string;
  name: string;
  rarity: Rarity;
  baseValue: number;
  icon: string;
  type: ItemType;
  circulation: number;
  hidden?: boolean;
}

export interface AuctionListing {
  id: string;
  item: ItemTemplate;
  price: number;
  seller: string;
  expiresAt: number;
}

export interface TradeOffer {
  id: string;
  creator: string;
  offeredItem: Item;
  requestRarity: Rarity; // The rarity they want in return
  createdAt: number;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
}

export interface Case {
  id: string;
  name: string;
  price: number;
  keyTemplateId?: string;
  image: string;
  levelRequired: number;
  description: string;
  contains: {
    templateId: string;
    weight: number;
  }[];
}

export interface PlayerStats {
  casesOpened: number;
  itemsUpgraded: number;
  jackpotsHit: number;
  totalClicks: number;
  totalMoneySpent: number;
  totalItemValueObtained: number;
  bestDropValue: number;
  bestDropName: string;
  worstLossValue: number;
  legendariesPulled: number;
  mythicsPulled: number;
  contrabandsPulled: number;
}

export interface PromoCode {
  code: string;
  reward: number;
  maxUses: number;
  currentUses: number;
}

export interface LogEntry {
    id: string;
    timestamp: number;
    message: string;
    type: 'DROP' | 'WIN' | 'ADMIN' | 'SYSTEM' | 'BAN' | 'EVENT' | 'SECURITY';
    user?: string;
}

export interface Announcement {
    id: string;
    message: string;
    color: 'red' | 'yellow' | 'blue' | 'green';
    active: boolean;
}

export interface ShopEntry {
    id: string;
    templateId: string;
    price: number;
    featured: boolean;
}

export interface ActiveGiveaway {
    id: string;
    prizeTemplateId: string;
    endTime: number;
    entrants: string[];
    winner: string | null;
}

export interface InboxMessage {
    id: string;
    subject: string;
    body: string;
    from: string;
    read: boolean;
    timestamp: number;
    claimed?: boolean;
    attachment?: { type: 'coins' | 'item'; value: string | number };
}

export interface GameUpdate {
    id: string;
    version: string;
    title: string;
    description: string;
    date: number;
    author: string;
}

export interface GameSettings {
    blackjackPayout: number;
    rouletteMultipliers: { red: number; black: number; green: number };
    minesHouseEdge: number; // Percentage (e.g., 0.05 for 5%)
    slotRtp: number; // Return to Player (0-1)
}

export interface UserReport {
    id: string;
    reporter: string;
    suspect: string;
    reason: 'SCAM' | 'TOXIC' | 'BOT' | 'EXPLOIT';
    timestamp: number;
    status: 'PENDING' | 'RESOLVED' | 'DISMISSED';
}

export interface ChatMessage {
    id: string;
    username: string;
    text: string;
    timestamp: number;
    role: Role;
    isSystem?: boolean;
    vip?: boolean;
}

export interface DropFeedEntry {
    id: string;
    username: string;
    item: ItemTemplate;
    timestamp: number;
}

export interface GameConfig {
    globalLuckMultiplier: number;
    slotWinChance: number;
    upgradeBaseChanceMultiplier: number;
    casePriceMultiplier: number;
    sellValueMultiplier: number;
    maintenanceMode: boolean;
    activeEvent: string | null;
    announcement: Announcement | null;
    activeGiveaway: ActiveGiveaway | null; 
    shopConfig: ShopEntry[]; 
    gameSettings: GameSettings; // New Tuner Settings
    bannedIps: string[]; // Database feature: IP Bans
    featureToggles: {
        slots: boolean;
        upgrader: boolean;
        trading: boolean;
        auction: boolean;
        shop: boolean;
        codes: boolean;
        blackjack: boolean;
        roulette: boolean;
        mines: boolean; // New
    };
}

export interface UserAccount {
    username: string;
    role: Role;
    banned: boolean;
    kicked?: boolean; 
    muted?: boolean; 
    balance: number;
    level: number;
    inventoryCount: number;
    lastLogin: string;
    inbox: InboxMessage[]; 
    // House Features
    luckMultiplier: number;
    tags: ('VIP' | 'WATCHLIST' | 'TESTER' | 'BOT' | 'WHALE')[];
    nextDropOverride?: string; // templateId to force next drop
    inventory?: Item[]; 
    adminNotes?: string; // New field for admin comments
    stats: {
        totalSpent: number;
        totalValue: number;
        casesOpened: number;
        sessionStart: number;
    };
}

export interface ScheduledEvent {
    id: string;
    name: string;
    startTime: number; // Unix timestamp
    durationMinutes: number;
    type: 'LUCK' | 'DISCOUNT' | 'XP';
    multiplier: number;
}

export interface GameState {
  dbVersion: number; // Database Version
  username: string | null;
  role: Role;
  isAdmin: boolean;
  isPremium: boolean;
  premiumLevel: number;
  rememberMe: boolean;
  balance: number;
  xp: number;
  level: number;
  inventory: Item[];
  stats: PlayerStats;
  lastDailyReward: number;
  
  items: Record<string, ItemTemplate>;
  cases: Case[];
  config: GameConfig;
  updates: GameUpdate[]; 
  reports: UserReport[]; 
  chatHistory: ChatMessage[]; 
  liveFeed: DropFeedEntry[]; // New Live Feed
  
  auctionListings: AuctionListing[];
  userListings: { id: string; item: Item; price: number; listedAt: number }[];
  activeTrades: TradeOffer[];
  circulationCounts: Record<string, number>;
  promoCodes: PromoCode[];
  redeemedCodes: string[];
  
  logs: LogEntry[];
  motd: string | null; 
  theme: 'default' | 'midnight' | 'hacker';
  
  userDatabase: Record<string, UserAccount>; 
  season: number;
  scheduledEvents: ScheduledEvent[];
  inbox: InboxMessage[]; 
}

export const RARITY_COLORS = {
  [Rarity.COMMON]: { text: 'text-slate-400', bg: 'bg-slate-500', border: 'border-slate-500', glow: 'shadow-slate-500/50' },
  [Rarity.UNCOMMON]: { text: 'text-green-400', bg: 'bg-green-500', border: 'border-green-500', glow: 'shadow-green-500/50' },
  [Rarity.RARE]: { text: 'text-blue-400', bg: 'bg-blue-500', border: 'border-blue-500', glow: 'shadow-blue-500/50' },
  [Rarity.EPIC]: { text: 'text-purple-400', bg: 'bg-purple-500', border: 'border-purple-500', glow: 'shadow-purple-500/50' },
  [Rarity.LEGENDARY]: { text: 'text-yellow-400', bg: 'bg-yellow-500', border: 'border-yellow-500', glow: 'shadow-yellow-500/50' },
  [Rarity.MYTHIC]: { text: 'text-red-500', bg: 'bg-red-600', border: 'border-red-600', glow: 'shadow-red-600/50' },
  [Rarity.DARK_MATTER]: { text: 'text-fuchsia-400', bg: 'bg-fuchsia-900', border: 'border-fuchsia-500', glow: 'shadow-fuchsia-500/80' },
  [Rarity.CONTRABAND]: { text: 'text-amber-600', bg: 'bg-amber-700', border: 'border-amber-600', glow: 'shadow-amber-600/50' },
  [Rarity.GODLIKE]: { text: 'text-cyan-400', bg: 'bg-cyan-900', border: 'border-cyan-500', glow: 'shadow-cyan-500/100' },
};

export const RARITY_ORDER = [
  Rarity.COMMON,
  Rarity.UNCOMMON,
  Rarity.RARE,
  Rarity.EPIC,
  Rarity.LEGENDARY,
  Rarity.MYTHIC,
  Rarity.DARK_MATTER,
  Rarity.CONTRABAND,
  Rarity.GODLIKE
];