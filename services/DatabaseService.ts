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
            
            // VERSION MIGRATION LOGIC
            // If the code version (INITIAL_STATE.dbVersion) is higher than the saved version,
            // we force an update of the 'config' object to ensure users get new settings (like maintenance mode).
            if (parsed.dbVersion < INITIAL_STATE.dbVersion) {
                console.log(`Migrating DB from v${parsed.dbVersion} to v${INITIAL_STATE.dbVersion}`);
                return {
                    ...INITIAL_STATE,
                    // Preserve User Data
                    username: parsed.username,
                    balance: parsed.balance ?? INITIAL_STATE.balance,
                    xp: parsed.xp ?? INITIAL_STATE.xp,
                    level: parsed.level ?? INITIAL_STATE.level,
                    inventory: parsed.inventory ?? [],
                    stats: parsed.stats ?? INITIAL_STATE.stats,
                    userDatabase: parsed.userDatabase ?? INITIAL_STATE.userDatabase,
                    // Force Config Update from Code (This fixes the "Friend didn't see maintenance" issue)
                    config: INITIAL_STATE.config,
                    // Update Version
                    dbVersion: INITIAL_STATE.dbVersion
                };
            }

            // Normal Load
            return {
                ...INITIAL_STATE,
                ...parsed,
                // We merge config to allow local admin toggles to persist, 
                // but strictly speaking, in a static app, you might want INITIAL_STATE.config to always win.
                // For now, we allow local overrides unless version changed.
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

    // --- MOCK DATABASE OPERATIONS (For Test Panel) ---
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