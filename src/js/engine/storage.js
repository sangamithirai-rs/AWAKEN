/**
 * AWAKEN Storage Adapter
 * Pure Client-Side Dual Persistence (LocalStorage + IndexedDB) with Safe JSON Export/Import
 */

import {
  APP_VERSION,
  DB_NAME,
  DB_VERSION,
  INITIAL_STATE,
  LEGACY_STORAGE_KEY,
  STORAGE_KEY,
} from "./constants.js";

class StorageAdapter {
  constructor() {
    this.db = null;
    this.dbReadyPromise = this.initIndexedDB();
  }

  // -------------------------------------------------------------
  // IndexedDB Setup & Initialization
  // -------------------------------------------------------------
  async initIndexedDB() {
    if (typeof window === "undefined" || !window.indexedDB) {
      return null;
    }

    return new Promise((resolve) => {
      try {
        const request = window.indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
          const db = event.target.result;
          if (!db.objectStoreNames.contains("snapshots")) {
            db.createObjectStore("snapshots", { keyPath: "timestamp" });
          }
          if (!db.objectStoreNames.contains("history")) {
            db.createObjectStore("history", { keyPath: "id" });
          }
          if (!db.objectStoreNames.contains("logs")) {
            db.createObjectStore("logs", { autoIncrement: true });
          }
        };

        request.onsuccess = (event) => {
          this.db = event.target.result;
          resolve(this.db);
        };

        request.onerror = () => {
          console.warn("AWAKEN IndexedDB access error. LocalStorage will continue to handle core state.");
          resolve(null);
        };
      } catch (err) {
        console.warn("IndexedDB initialization fallback:", err);
        resolve(null);
      }
    });
  }

  // -------------------------------------------------------------
  // LocalStorage Core Synchronous Operations
  // -------------------------------------------------------------
  loadState() {
    if (typeof localStorage === "undefined") {
      return { state: { ...INITIAL_STATE }, warning: null };
    }

    try {
      // 1. Try V5 state
      const rawV5 = localStorage.getItem(STORAGE_KEY);
      if (rawV5) {
        const parsed = JSON.parse(rawV5);
        if (parsed && typeof parsed === "object") {
          return { state: this.sanitizeState(parsed), warning: null };
        }
      }

      // 2. Try legacy migration (v1-v4)
      const rawLegacy = localStorage.getItem(LEGACY_STORAGE_KEY);
      if (rawLegacy) {
        const parsedLegacy = JSON.parse(rawLegacy);
        if (parsedLegacy && typeof parsedLegacy === "object") {
          const migrated = this.migrateLegacyState(parsedLegacy);
          this.saveState(migrated);
          return {
            state: migrated,
            warning: "LEGACY DATA CONVERTED TO SYSTEM V5 PROTOCOL",
          };
        }
      }
    } catch (err) {
      console.error("Corrupted state detected in storage:", err);
      return {
        state: { ...INITIAL_STATE },
        warning: "CORRUPTED DATA DETECTED // DEFAULT PROTOCOL INITIALIZED",
      };
    }

    return { state: { ...INITIAL_STATE }, warning: null };
  }

  saveState(state) {
    if (typeof localStorage === "undefined") return false;
    try {
      const sanitized = this.sanitizeState(state);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));

      // Asynchronously backup snapshot to IndexedDB
      this.backupToIndexedDB(sanitized).catch(() => {});
      return true;
    } catch (err) {
      console.error("Failed to write state to localStorage:", err);
      return false;
    }
  }

  // -------------------------------------------------------------
  // IndexedDB Snapshot Operations
  // -------------------------------------------------------------
  async backupToIndexedDB(state) {
    if (!this.db) {
      await this.dbReadyPromise;
    }
    if (!this.db) return;

    return new Promise((resolve) => {
      try {
        const tx = this.db.transaction("snapshots", "readwrite");
        const store = tx.objectStore("snapshots");
        store.put({
          timestamp: new Date().toISOString(),
          state: state,
        });
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => resolve(false);
      } catch {
        resolve(false);
      }
    });
  }

  // -------------------------------------------------------------
  // Legacy Migration (V1 - V4 -> V5)
  // -------------------------------------------------------------
  migrateLegacyState(legacy) {
    const base = { ...INITIAL_STATE };
    const xp = Number(legacy.xp) || 0;
    const level = Math.floor(xp / 1000) + 1;

    return {
      ...base,
      xp,
      level,
      aetherCoins: Number(legacy.gold) || base.aetherCoins,
      skillPoints: Number(legacy.skillPoints) || base.skillPoints,
      questCompletions: Number(legacy.questCompletions) || 0,
      profile: {
        ...base.profile,
        name: legacy.profile?.name || base.profile.name,
        hunterClass: legacy.profile?.hunterClass || base.profile.hunterClass,
        specialization: legacy.profile?.specialization || base.profile.specialization,
      },
      attributes: {
        ...base.attributes,
        ...(legacy.attributes || {}),
      },
      completedQuestPeriods: Array.isArray(legacy.rewardedQuestPeriods)
        ? legacy.rewardedQuestPeriods
        : base.completedQuestPeriods,
      inventory: Array.isArray(legacy.inventory) ? legacy.inventory : base.inventory,
      equipment: legacy.equipment ? { ...base.equipment, ...legacy.equipment } : base.equipment,
    };
  }

  // -------------------------------------------------------------
  // State Sanitization & Safety
  // -------------------------------------------------------------
  sanitizeState(state) {
    if (!state || typeof state !== "object") return { ...INITIAL_STATE };

    return {
      version: 5,
      route: typeof state.route === "string" ? state.route : INITIAL_STATE.route,
      profile: {
        ...INITIAL_STATE.profile,
        ...(state.profile || {}),
      },
      level: Number(state.level) || 1,
      xp: Math.max(0, Number(state.xp) || 0),
      aetherCoins: Math.max(0, Number(state.aetherCoins ?? state.gold ?? 0)),
      skillPoints: Math.max(0, Number(state.skillPoints) || 0),
      attributes: {
        ...INITIAL_STATE.attributes,
        ...(state.attributes || {}),
      },
      missions: Array.isArray(state.missions) ? state.missions : INITIAL_STATE.missions,
      customCategories: Array.isArray(state.customCategories)
        ? state.customCategories
        : INITIAL_STATE.customCategories,
      completedQuestPeriods: Array.isArray(state.completedQuestPeriods)
        ? state.completedQuestPeriods
        : [],
      questCompletions: Number(state.questCompletions) || 0,
      streaks: {
        ...INITIAL_STATE.streaks,
        ...(state.streaks || {}),
      },
      skills: {
        ...INITIAL_STATE.skills,
        ...(state.skills || {}),
      },
      inventory: Array.isArray(state.inventory) ? state.inventory : INITIAL_STATE.inventory,
      equipment: {
        ...INITIAL_STATE.equipment,
        ...(state.equipment || {}),
      },
      dungeons: {
        ...INITIAL_STATE.dungeons,
        ...(state.dungeons || {}),
      },
      achievements: Array.isArray(state.achievements)
        ? state.achievements
        : INITIAL_STATE.achievements,
      unlockedTitles: Array.isArray(state.unlockedTitles)
        ? state.unlockedTitles
        : INITIAL_STATE.unlockedTitles,
      activityLog: Array.isArray(state.activityLog)
        ? state.activityLog.slice(-1000)
        : [],
      settings: {
        ...INITIAL_STATE.settings,
        ...(state.settings || {}),
      },
      notification: null,
    };
  }

  // -------------------------------------------------------------
  // JSON Export Architecture
  // -------------------------------------------------------------
  exportStateToJSON(state) {
    const cleanState = this.sanitizeState(state);
    const exportPayload = {
      meta: {
        game: "AWAKEN",
        version: APP_VERSION,
        exportedAt: new Date().toISOString(),
        hunterName: cleanState.profile.name,
        hunterLevel: cleanState.level,
      },
      data: cleanState,
    };

    const jsonString = JSON.stringify(exportPayload, null, 2);
    let url = "";
    if (typeof URL !== "undefined" && typeof URL.createObjectURL === "function" && typeof Blob !== "undefined") {
      const blob = new Blob([jsonString], { type: "application/json" });
      url = URL.createObjectURL(blob);
    }
    const filename = `AWAKEN_HUNTER_${cleanState.profile.name.replace(/[^a-zA-Z0-9]/g, "_")}_LV${cleanState.level}_${Date.now()}.json`;

    return { url, filename, jsonString };
  }

  // -------------------------------------------------------------
  // JSON Import Architecture with Validation
  // -------------------------------------------------------------
  validateAndParseImportJSON(jsonString) {
    if (!jsonString || typeof jsonString !== "string") {
      throw new Error("Empty or invalid file content.");
    }

    let parsed;
    try {
      parsed = JSON.parse(jsonString);
    } catch {
      throw new Error("File is not valid JSON.");
    }

    // Check payload structure (supports wrapped export or raw state)
    const rawState = parsed.data || parsed;
    if (!rawState || typeof rawState !== "object") {
      throw new Error("Missing valid AWAKEN state structure.");
    }

    if (typeof rawState.xp !== "number" && typeof rawState.level !== "number" && !rawState.profile) {
      throw new Error("JSON file does not match AWAKEN player profile format.");
    }

    return this.sanitizeState(rawState);
  }

  // -------------------------------------------------------------
  // Factory Reset
  // -------------------------------------------------------------
  resetGame() {
    if (typeof localStorage !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(LEGACY_STORAGE_KEY);
      localStorage.removeItem("awaken-sfx-enabled");
    }
    return { ...INITIAL_STATE };
  }
}

export const storage = new StorageAdapter();
