/**
 * AWAKEN Progression Engine & Math Utilities
 * Pure Vanilla JavaScript ES6 Module
 */

import { getRankFromLevel } from "./constants.js";

/**
 * Returns YYYY-MM-DD in local time
 * @param {Date} date
 * @returns {string}
 */
export function toLocalDateKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Calculates current hunter level and progress towards next level
 * @param {number} xp Total accumulated experience
 * @returns {{ level: number, currentXP: number, requiredXP: number, percentage: number, rank: string }}
 */
export function getLevelProgress(xp = 0) {
  const safeXP = Math.max(0, Number(xp) || 0);
  const level = Math.floor(safeXP / 1000) + 1;
  const currentXP = safeXP % 1000;
  const requiredXP = 1000;
  const percentage = Math.round((currentXP / requiredXP) * 100);
  const rank = getRankFromLevel(level);

  return {
    level,
    currentXP,
    requiredXP,
    percentage,
    rank,
  };
}

/**
 * Calculates dynamic vitals and combat metrics from hunter attributes and level
 * @param {Record<string, number>} attributes
 * @param {number} level
 * @returns {{ maxHP: number, currentHP: number, maxMP: number, currentMP: number, attackPower: number, magicPower: number, defense: number, focusMultiplier: number }}
 */
export function calculateVitals(attributes = {}, level = 1) {
  const strength = attributes.strength || 1;
  const intelligence = attributes.intelligence || 1;
  const vitality = attributes.vitality || 1;
  const discipline = attributes.discipline || 1;
  const creativity = attributes.creativity || 1;
  const focus = attributes.focus || 1;
  const consistency = attributes.consistency || 1;

  const maxHP = (vitality * 100) + (strength * 20) + (level * 50);
  const maxMP = (intelligence * 80) + (focus * 40) + (level * 30);
  const attackPower = (strength * 15) + (discipline * 6) + (level * 10);
  const magicPower = (intelligence * 18) + (creativity * 8) + (level * 12);
  const defense = (vitality * 12) + (consistency * 6) + (level * 8);
  const focusMultiplier = Number((1 + (focus * 0.05) + (consistency * 0.02)).toFixed(2));

  return {
    maxHP,
    currentHP: maxHP,
    maxMP,
    currentMP: maxMP,
    attackPower,
    magicPower,
    defense,
    focusMultiplier,
  };
}

/**
 * Calculates overall Combat Power Rating (CP)
 * @param {number} level
 * @param {Record<string, number>} attributes
 * @param {Record<string, number>} skillLevels
 * @returns {number}
 */
export function calculatePowerRating(level = 1, attributes = {}, skillLevels = {}) {
  const vitals = calculateVitals(attributes, level);
  const attrSum = Object.values(attributes).reduce((acc, v) => acc + (v || 0), 0);
  const skillsSum = Object.values(skillLevels).reduce((acc, v) => acc + (v || 0), 0);

  return Math.round(
    (level * 150) +
    (attrSum * 25) +
    (skillsSum * 80) +
    (vitals.attackPower * 0.8) +
    (vitals.magicPower * 0.8) +
    (vitals.defense * 0.6)
  );
}

/**
 * Calculates consecutive day streak count
 * @param {string[]} activityDates ISO date strings ['YYYY-MM-DD']
 * @param {string[]} recoveryDays Recovered date strings
 * @param {Date} [referenceDate]
 * @returns {{ current: number, longest: number }}
 */
export function getStreakProgress(activityDates = [], recoveryDays = [], referenceDate = new Date()) {
  const allActiveDays = new Set([...activityDates, ...recoveryDays]);
  if (!allActiveDays.size) {
    return { current: 0, longest: 0 };
  }

  const sorted = Array.from(allActiveDays).sort();
  let longest = 0;
  let tempStreak = 0;
  let prevDate = null;

  for (const dateStr of sorted) {
    const [y, m, d] = dateStr.split("-").map(Number);
    const cur = new Date(y, m - 1, d);
    if (prevDate) {
      const diffDays = Math.round((cur - prevDate) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        tempStreak++;
      } else {
        tempStreak = 1;
      }
    } else {
      tempStreak = 1;
    }
    if (tempStreak > longest) longest = tempStreak;
    prevDate = cur;
  }

  // Calculate current streak backwards from referenceDate
  let current = 0;
  const cursor = new Date(referenceDate);

  const todayKey = toLocalDateKey(cursor);
  if (!allActiveDays.has(todayKey)) {
    cursor.setDate(cursor.getDate() - 1);
  }

  while (true) {
    const key = toLocalDateKey(cursor);
    if (allActiveDays.has(key)) {
      current++;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }

  return {
    current,
    longest: Math.max(longest, current),
  };
}
