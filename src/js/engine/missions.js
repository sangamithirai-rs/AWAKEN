/**
 * AWAKEN Mission Domain Engine & Reward Calculator
 * Pure Vanilla JavaScript ES6 Module
 */

export const MISSION_CATEGORIES = {
  MAIN: {
    id: "MAIN",
    name: "MAIN CAMPAIGN",
    short: "MAIN",
    color: "#fbbf24",
    bg: "rgba(245, 158, 11, 0.15)",
    border: "rgba(245, 158, 11, 0.4)",
    symbol: "👑",
    desc: "Critical Hunter evolution milestones and story contracts.",
  },
  DAILY: {
    id: "DAILY",
    name: "DAILY RECURRENCE",
    short: "DAILY",
    color: "#38bdf8",
    bg: "rgba(56, 189, 248, 0.15)",
    border: "rgba(56, 189, 248, 0.4)",
    symbol: "⚡",
    desc: "Routine daily conditioning and ritualistic discipline.",
  },
  WEEKLY: {
    id: "WEEKLY",
    name: "WEEKLY DIRECTIVE",
    short: "WEEKLY",
    color: "#a855f7",
    bg: "rgba(168, 85, 247, 0.15)",
    border: "rgba(168, 85, 247, 0.4)",
    symbol: "📅",
    desc: "Extended multi-day operations demanding sustained execution.",
  },
  SIDE: {
    id: "SIDE",
    name: "SIDE CONTRACT",
    short: "SIDE",
    color: "#34d399",
    bg: "rgba(52, 211, 153, 0.15)",
    border: "rgba(52, 211, 153, 0.4)",
    symbol: "🎯",
    desc: "Secondary bounties, errands, and quick lifestyle tasks.",
  },
  CUSTOM: {
    id: "CUSTOM",
    name: "CUSTOM COVENANT",
    short: "CUSTOM",
    color: "#818cf8",
    bg: "rgba(129, 140, 248, 0.15)",
    border: "rgba(129, 140, 248, 0.4)",
    symbol: "✍️",
    desc: "Hunter-forged custom contracts tailored to real-world goals.",
  },
  DUNGEON: {
    id: "DUNGEON",
    name: "DUNGEON RAID",
    short: "DUNGEON",
    color: "#f87171",
    bg: "rgba(239, 68, 68, 0.15)",
    border: "rgba(239, 68, 68, 0.4)",
    symbol: "⚔️",
    desc: "High-threat gate breaches and multi-phase boss trials.",
  },
};

export const MISSION_DIFFICULTIES = {
  E: { rank: "E", name: "E-RANK // EASY", xpBase: 60, goldBase: 15, color: "#94a3b8" },
  D: { rank: "D", name: "D-RANK // NORMAL", xpBase: 120, goldBase: 25, color: "#34d399" },
  C: { rank: "C", name: "C-RANK // HARD", xpBase: 240, goldBase: 50, color: "#38bdf8" },
  B: { rank: "B", name: "B-RANK // VETERAN", xpBase: 400, goldBase: 85, color: "#60a5fa" },
  A: { rank: "A", name: "A-RANK // ELITE", xpBase: 650, goldBase: 140, color: "#c084fc" },
  S: { rank: "S", name: "S-RANK // MONARCH", xpBase: 1000, goldBase: 250, color: "#fbbf24" },
};

/**
 * Deterministically calculates mission rewards based on difficulty, category, and subtask count
 */
export function calculateMissionRewards(difficulty = "D", category = "DAILY", subtasksCount = 0) {
  const diff = MISSION_DIFFICULTIES[difficulty] || MISSION_DIFFICULTIES.D;
  let multiplier = 1.0;

  if (category === "MAIN") multiplier = 2.0;
  else if (category === "WEEKLY") multiplier = 1.8;
  else if (category === "DUNGEON") multiplier = 2.5;
  else if (category === "SIDE") multiplier = 0.8;

  // Modest subtask scale: +10% per subtask up to +50%
  const subtaskBonus = 1 + Math.min(0.5, subtasksCount * 0.1);

  const xp = Math.round(diff.xpBase * multiplier * subtaskBonus);
  const aetherCoins = Math.round(diff.goldBase * multiplier * subtaskBonus);

  return { xp, aetherCoins };
}

/**
 * Calculates current progress percentage from mission subtasks or overall status
 */
export function getMissionProgress(mission) {
  if (mission.status === "COMPLETED" || mission.completed) return 100;
  if (!mission.subtasks || !Array.isArray(mission.subtasks) || mission.subtasks.length === 0) {
    if (mission.kind === "BOSS" && mission.goalCount) {
      return Math.min(100, Math.round(((mission.currentCount || 0) / mission.goalCount) * 100));
    }
    return 0;
  }
  const completedCount = mission.subtasks.filter((st) => st.completed).length;
  return Math.round((completedCount / mission.subtasks.length) * 100);
}

/**
 * Generates recurrence period key to prevent duplicate completions within the same period
 */
export function getMissionPeriodKey(missionId, category, date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const dayKey = `${year}-${month}-${day}`;

  if (category === "DAILY") {
    return `${missionId}_DAILY_${dayKey}`;
  }

  if (category === "WEEKLY") {
    // ISO week key
    const target = new Date(date.valueOf());
    const dayNr = (date.getDay() + 6) % 7;
    target.setDate(target.getDate() - dayNr + 3);
    const firstThursday = target.valueOf();
    target.setMonth(0, 1);
    if (target.getDay() !== 4) {
      target.setMonth(0, 1 + ((4 - target.getDay() + 7) % 7));
    }
    const weekNr = 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
    return `${missionId}_WEEKLY_${year}-W${String(weekNr).padStart(2, "0")}`;
  }

  return `${missionId}_ONCE`;
}

/**
 * Checks deadline status
 * Returns: { isOverdue: boolean, isToday: boolean, text: string, color: string }
 */
export function evaluateDeadline(deadlineStr) {
  if (!deadlineStr) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const due = new Date(deadlineStr);
  due.setHours(0, 0, 0, 0);

  const diffDays = Math.round((due.getTime() - today.getTime()) / 86400000);

  if (diffDays < 0) {
    return {
      isOverdue: true,
      isToday: false,
      text: `OVERDUE (${Math.abs(diffDays)} DAYS)`,
      color: "#f87171",
    };
  }

  if (diffDays === 0) {
    return {
      isOverdue: false,
      isToday: true,
      text: "DUE TODAY // HIGH ALERT",
      color: "#fbbf24",
    };
  }

  if (diffDays === 1) {
    return {
      isOverdue: false,
      isToday: false,
      text: "DUE TOMORROW",
      color: "#fcd34d",
    };
  }

  return {
    isOverdue: false,
    isToday: false,
    text: `DUE IN ${diffDays} DAYS`,
    color: "#94a3b8",
  };
}

