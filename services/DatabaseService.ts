import { GameState, UserAccount, Case, ItemTemplate, GameConfig, LogEntry } from '../types';
import { INITIAL_STATE, DEFAULT_ITEMS, DEFAULT_CASES } from '../constants';

const DB_KEY = 'case_clicker_db_v2';

export const DatabaseService = {
    // --- CORE I/O ---
    load: (): GameState => {
        const data = localStorage.getItem(DB_KEY);
        if (!data) return INITIAL_STATE;
        try {
            const parsed = JSON.parse(data);
            
            // VERSION MIGRATION LOGIC (WIPE SEASON)
            if (parsed.dbVersion < INITIAL_STATE.dbVersion) {
                // PRESERVE ACCOUNTS BUT WIPE PROGRESS
                const migratedUserDB: Record<string, UserAccount> = {};
                
                // 1. Process existing users from the save
                if (parsed.userDatabase) {
                    Object.entries(parsed.userDatabase).forEach(([username, user]: [string, any]) => {
                        migratedUserDB[username] = {
                            ...user, // Keep static info
                            balance: 200, // RESET BALANCE
                            level: 1,     // RESET LEVEL
                            xp: 0,
                            premiumLevel: 0, // Reset Premium for fairness/season logic
                            miningLevel: 0,
                            inventory: [], // WIPE INVENTORY
                            inventoryCount: 0,
                            stats: {
                                totalSpent: 0,
                                totalValue: 0,
                                casesOpened: 0,
                                sessionStart: Date.now()
                            },
                            // Preserve Identity
                            username: username,
                            role: user.role || 'USER',
                            banned: user.banned || false,
                            ip: user.ip,
                            inbox: [{
                                id: 'wipe_msg',
                                subject: 'Season Reset',
                                body: 'Welcome to the new season! Your stats have been reset to give everyone a fair start. Good luck!',
                                from: 'System',
                                read: false,
                                timestamp: Date.now()
                            }]
                        };
                    });
                }

                // 2. Merge with INITIAL_STATE users (Bots/Defaults)
                // We overwrite initial bots with migrated real users if names collide, or just mix them.
                const combinedDB = { ...INITIAL_STATE.userDatabase, ...migratedUserDB };

                return {
                    ...INITIAL_STATE,
                    // Preserve Auth for current session if they were logged in
                    username: parsed.username,
                    role: parsed.role || 'USER',
                    userDatabase: combinedDB,
                    // Force balance reset for the active session state too
                    balance: 200,
                    inventory: [],
                    level: 1,
                    xp: 0
                };
            }

            // Normal Load
            return {
                ...INITIAL_STATE,
                ...parsed,
                config: { ...INITIAL_STATE.config, ...parsed.config },
                items: { ...DEFAULT_ITEMS, ...(parsed.items || {}) },
                cases: (parsed.cases && parsed.cases.length) ? parsed.cases : DEFAULT_CASES,
                userDatabase: { ...INITIAL_STATE.userDatabase, ...(parsed.userDatabase || {}) },
                dbVersion: parsed.dbVersion || INITIAL_STATE.dbVersion
            };
        } catch (e) {
            console.error("DB Load Error", e);
            return INITIAL_STATE;
        }
    },

    save: (state: GameState) => {
        try {
            const serialized = JSON.stringify(state);
            localStorage.setItem(DB_KEY, serialized);
        } catch (e) {
            console.error("DB Save Error (Storage Full?)", e);
        }
    },

    // --- UTILITIES FOR ADMIN PANEL ---
    wipe: () => {
        localStorage.removeItem(DB_KEY);
        window.location.reload();
    },
    
    exportData: () => localStorage.getItem(DB_KEY) || '',
    
    importData: (json: string) => {
        try {
            const parsed = JSON.parse(json);
            if (!parsed.config || !parsed.userDatabase) throw new Error("Invalid DB format");
            localStorage.setItem(DB_KEY, json);
            return true;
        } catch(e) {
            console.error(e);
            return false;
        }
    },

    getCollection: (collection: 'users' | 'cases' | 'items' | 'config' | 'logs') => {
        const state = DatabaseService.load();
        switch(collection) {
            case 'users': return state.userDatabase;
            case 'cases': return state.cases;
            case 'items': return state.items;
            case 'config': return state.config;
            case 'logs': return state.logs;
            default: return null;
        }
    }
};