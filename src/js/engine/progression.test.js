import { describe, expect, it } from "vitest";
import {
  calculatePowerRating,
  calculateVitals,
  getLevelProgress,
  getStreakProgress,
} from "./progression.js";

describe("Progression Engine & Math Calculations", () => {
  it("computes level progression and rank thresholds accurately", () => {
    const l1 = getLevelProgress(0);
    expect(l1.level).toBe(1);
    expect(l1.currentXP).toBe(0);
    expect(l1.percentage).toBe(0);
    expect(l1.rank).toBe("F");

    const l5 = getLevelProgress(4500);
    expect(l5.level).toBe(5);
    expect(l5.currentXP).toBe(500);
    expect(l5.percentage).toBe(50);
    expect(l5.rank).toBe("D");

    const l30 = getLevelProgress(29999);
    expect(l30.level).toBe(30);
    expect(l30.rank).toBe("S");
  });

  it("calculates dynamic hunter vitals based on attributes and level", () => {
    const attrs = {
      strength: 10,
      intelligence: 8,
      vitality: 12,
      discipline: 6,
      creativity: 4,
      focus: 7,
      consistency: 5,
    };

    const vitals = calculateVitals(attrs, 5);
    // maxHP: 12*100 + 10*20 + 5*50 = 1200 + 200 + 250 = 1650
    expect(vitals.maxHP).toBe(1650);
    // maxMP: 8*80 + 7*40 + 5*30 = 640 + 280 + 150 = 1070
    expect(vitals.maxMP).toBe(1070);
    expect(vitals.attackPower).toBeGreaterThan(0);
    expect(vitals.defense).toBeGreaterThan(0);
    expect(vitals.focusMultiplier).toBeGreaterThan(1.0);
  });

  it("calculates combat power rating dynamically", () => {
    const cp = calculatePowerRating(5, { strength: 10, vitality: 10 }, { WARRIOR_FOUNDATION: 2 });
    expect(cp).toBeGreaterThan(1000);
  });

  it("computes daily streaks accurately including gap detection", () => {
    const dates = ["2026-11-01", "2026-11-02", "2026-11-03", "2026-11-05"];
    const streak = getStreakProgress(dates, [], new Date("2026-11-05T12:00:00"));
    expect(streak.longest).toBe(3);
    expect(streak.current).toBe(1);
  });
});
