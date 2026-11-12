/**
 * AWAKEN Core Constants & Domain Definitions
 * Pure Vanilla JavaScript ES6 Module
 */

export const APP_VERSION = "5.0.0";
export const STORAGE_KEY = "awaken-save-v5";
export const LEGACY_STORAGE_KEY = "awaken-save";
export const DB_NAME = "AwakenIndexedDB";
export const DB_VERSION = 1;

export const ROUTES = {
  SYSTEM: "SYSTEM",
  MISSIONS: "MISSIONS",
  CHARACTER: "CHARACTER",
  ATTRIBUTES: "ATTRIBUTES",
  SKILLS: "SKILLS",
  EXPLORATION: "EXPLORATION",
  DUNGEONS: "DUNGEONS",
  INVENTORY: "INVENTORY",
  ACHIEVEMENTS: "ACHIEVEMENTS",
  SHOP: "SHOP",
  SETTINGS: "SETTINGS",
};

export const ROUTE_LABELS = {
  [ROUTES.SYSTEM]: { full: "SYSTEM", compact: "SYS", icon: "sparkles", title: "HUNTER COMMAND" },
  [ROUTES.MISSIONS]: { full: "MISSIONS", compact: "QUEST", icon: "target", title: "QUEST OPERATIONS" },
  [ROUTES.CHARACTER]: { full: "CHARACTER", compact: "HUNTER", icon: "user", title: "HUNTER DOSSIER" },
  [ROUTES.ATTRIBUTES]: { full: "ATTRIBUTES", compact: "STATS", icon: "activity", title: "PHYSICAL & ASTRAL STATS" },
  [ROUTES.SKILLS]: { full: "SKILL TREE", compact: "SKILL", icon: "zap", title: "HUNTER MILESTONES" },
  [ROUTES.EXPLORATION]: { full: "EXPLORATION", compact: "WORLD", icon: "compass", title: "DIMENSIONAL SECTORS" },
  [ROUTES.DUNGEONS]: { full: "DUNGEONS", compact: "RAID", icon: "shield", title: "GATE INSTANCES & BOSSES" },
  [ROUTES.INVENTORY]: { full: "INVENTORY", compact: "ITEMS", icon: "backpack", title: "EQUIPMENT & VAULT" },
  [ROUTES.ACHIEVEMENTS]: { full: "ACHIEVEMENTS", compact: "BADGE", icon: "award", title: "RECORD OF CONQUEST" },
  [ROUTES.SHOP]: { full: "ARMORY SHOP", compact: "SHOP", icon: "coins", title: "AETHER COIN EXCHANGE" },
  [ROUTES.SETTINGS]: { full: "SETTINGS", compact: "CONFIG", icon: "settings", title: "SYSTEM PROTOCOLS & BACKUP" },
};

export const HUNTER_RANKS = ["F", "E", "E+", "D", "C", "B", "A", "S"];

export function getRankFromLevel(level) {
  if (level >= 30) return "S";
  if (level >= 20) return "A";
  if (level >= 15) return "B";
  if (level >= 10) return "C";
  if (level >= 5) return "D";
  if (level >= 3) return "E+";
  if (level >= 2) return "E";
  return "F";
}

export const DEFAULT_ATTRIBUTES = {
  strength: 1,
  intelligence: 1,
  vitality: 1,
  discipline: 1,
  creativity: 1,
  focus: 1,
  consistency: 1,
};

export const DEFAULT_PROFILE = {
  name: "SUNG JIN-WOO",
  hunterClass: "VANGUARD",
  specialization: "WARDEN",
  title: "NEWLY AWAKENED",
  avatarId: "shadow-default",
  isAwakened: true,
};

export const INITIAL_STATE = {
  version: 5,
  route: ROUTES.SYSTEM,
  profile: { ...DEFAULT_PROFILE },
  level: 1,
  xp: 0,
  aetherCoins: 150,
  skillPoints: 1,
  attributes: { ...DEFAULT_ATTRIBUTES },
  missions: [
    {
      id: "daily-conditioning",
      title: "PHYSICAL CONDITIONING",
      description: "100 Push-ups, 100 Sit-ups, 100 Squats, and 10km Run (or 20 mins physical training).",
      cadence: "DAILY",
      category: "FITNESS",
      attribute: "strength",
      priority: "HIGH",
      kind: "STANDARD",
      xp: 120,
      gold: 25,
      completed: false,
      lastCompletedPeriod: null,
      deletable: false,
    },
    {
      id: "daily-focus",
      title: "DEEP GATE STUDY",
      description: "Dedicate 25 minutes of uninterrupted deep focus to critical skill acquisition.",
      cadence: "DAILY",
      category: "STUDY",
      attribute: "intelligence",
      priority: "HIGH",
      kind: "STANDARD",
      xp: 100,
      gold: 20,
      completed: false,
      lastCompletedPeriod: null,
      deletable: false,
    },
    {
      id: "daily-system-check",
      title: "SYSTEM AUDIT & DISCIPLINE",
      description: "Plan the day's priority objectives and review daily resource expenditures.",
      cadence: "DAILY",
      category: "DISCIPLINE",
      attribute: "discipline",
      priority: "NORMAL",
      kind: "STANDARD",
      xp: 60,
      gold: 15,
      completed: false,
      lastCompletedPeriod: null,
      deletable: false,
    },
    {
      id: "boss-first-gate",
      title: "CLEARING THE D-RANK INSTANT DUNGEON",
      description: "Defeat 5 trial encounters through deliberate real-world focus milestones.",
      cadence: "ONCE",
      category: "DUNGEON",
      attribute: "vitality",
      priority: "HIGH",
      kind: "BOSS",
      goalCount: 5,
      currentCount: 0,
      xp: 500,
      gold: 150,
      completed: false,
      lastCompletedPeriod: null,
      deletable: false,
    },
  ],
  customCategories: ["FITNESS", "STUDY", "CODING", "PROJECT", "SIDE", "PERSONAL"],
  completedQuestPeriods: [],
  questCompletions: 0,
  streaks: {
    current: 1,
    longest: 1,
    weeklyCurrent: 1,
    weeklyLongest: 1,
    activityDates: [new Date().toISOString().slice(0, 10)],
    recoveryDays: [],
  },
  skills: {
    skillPoints: 1,
    branchXP: {
      WARRIOR: 0,
      SCHOLAR: 0,
      SHADOW_HUNTER: 0,
      ARCHITECT: 0,
      PHANTOM: 0,
    },
    skillLevels: {
      WARRIOR_FOUNDATION: 0,
      WARRIOR_MASTERY: 0,
      WARRIOR_ASCENDANT: 0,
      SCHOLAR_FOUNDATION: 0,
      SCHOLAR_MASTERY: 0,
      SCHOLAR_ASCENDANT: 0,
      SHADOW_FOUNDATION: 0,
      SHADOW_MASTERY: 0,
      SHADOW_ASCENDANT: 0,
      ARCHITECT_FOUNDATION: 0,
      ARCHITECT_MASTERY: 0,
      ARCHITECT_ASCENDANT: 0,
      PHANTOM_FOUNDATION: 0,
      PHANTOM_MASTERY: 0,
      PHANTOM_ASCENDANT: 0,
    },
  },
  inventory: [
    { itemId: "training-blade", quantity: 1, slot: "WEAPON", equipped: true },
    { itemId: "field-weave", quantity: 1, slot: "ARMOUR", equipped: true },
    { itemId: "elixir-vitality", quantity: 2, slot: null, equipped: false },
  ],
  equipment: {
    WEAPON: "training-blade",
    ARMOUR: "field-weave",
    ACCESSORY: null,
  },
  dungeons: {
    unlockedRank: "E",
    activeRaid: null,
    clearedCount: 0,
  },
  achievements: [
    { id: "FIRST_AWAKENING", unlocked: true, unlockedAt: new Date().toISOString() },
  ],
  unlockedTitles: ["NEWLY AWAKENED"],
  activityLog: [],
  settings: {
    soundEnabled: true,
    reducedMotion: false,
  },
  notification: null,
};

