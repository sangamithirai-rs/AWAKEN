import { describe, expect, it } from "vitest";
import type { ProgressionState } from "./progression";
import { defaultAttributes } from "./gameData";
import {
  equipItem,
  createEmptyEquipment,
  getEffectiveAttributes,
  getEquippedEffects,
  purchaseItem,
  unequipItem,
} from "./inventory";
import { createEmptySkillLevels } from "./skills";

const initialState: ProgressionState = {
  profile: {
    name: "SAM",
    hunterClass: "VANGUARD",
    specialization: "WARDEN",
  },
  xp: 0,
  attributes: { ...defaultAttributes },
  questCompletions: 0,
  rewardedQuestPeriods: [],
  focusSessions: [],
  activityLog: [],
  activityDates: [],
  skillXP: { BODY: 0, MIND: 0, WILL: 0 },
  skillPoints: 0,
  skillLevels: createEmptySkillLevels(),
  branchXP: {
    WARRIOR: 0,
    SCHOLAR: 0,
    SHADOW_HUNTER: 0,
    ARCHITECT: 0,
    PHANTOM: 0,
  },
  classXP: {
    WARRIOR: 0,
    SCHOLAR: 0,
    SHADOW_HUNTER: 0,
    ARCHITECT: 0,
    PHANTOM: 0,
  },
  gold: 500,
  inventory: [],
  equipment: createEmptyEquipment(),
  transactions: [],
  recoveryDays: [],
};

describe("inventory and economy", () => {
  it("rejects purchases without enough gold and leaves state unchanged", () => {
    const result = purchaseItem(
      { ...initialState, gold: 10 },
      "training-blade",
      "purchase:poor",
    );
    expect(result.success).toBe(false);
    expect(result.reason).toBe("INSUFFICIENT_GOLD");
    expect(result.state.gold).toBe(10);
    expect(result.state.inventory).toEqual([]);
  });

  it("deducts gold, grants ownership, and rejects duplicate purchases", () => {
    const purchased = purchaseItem(initialState, "training-blade", "purchase:blade");
    const duplicate = purchaseItem(purchased.state, "training-blade", "purchase:blade-2");
    expect(purchased.success).toBe(true);
    expect(purchased.state.gold).toBe(320);
    expect(purchased.state.inventory).toEqual([
      { itemId: "training-blade", quantity: 1 },
    ]);
    expect(duplicate.success).toBe(false);
    expect(duplicate.reason).toBe("ALREADY_OWNED");
    expect(duplicate.state.gold).toBe(320);
  });

  it("validates level and ownership before equipping, and restores effects on removal", () => {
    const noOwnership = equipItem(initialState, "training-blade");
    expect(noOwnership.reason).toBe("NOT_OWNED");

    const purchased = purchaseItem(initialState, "training-blade", "purchase:blade");
    const equipped = equipItem(purchased.state, "training-blade");
    expect(equipped.success).toBe(true);
    expect(getEffectiveAttributes(defaultAttributes, equipped.state.equipment).strength).toBe(2);
    expect(getEquippedEffects(equipped.state.equipment, { attribute: "strength" }).xpBonus)
      .toBe(0.05);

    const removed = unequipItem(equipped.state, "WEAPON");
    expect(removed.success).toBe(true);
    expect(removed.state.equipment.WEAPON).toBeUndefined();
    expect(getEffectiveAttributes(defaultAttributes, removed.state.equipment).strength).toBe(1);
  });

  it("enforces item level requirements before purchase and equipment", () => {
    const locked = purchaseItem(initialState, "field-weave", "purchase:armour");
    expect(locked.success).toBe(false);
    expect(locked.reason).toBe("LEVEL_REQUIRED");
    expect(locked.state.gold).toBe(initialState.gold);

    const unlockedState = { ...initialState, xp: 1000 };
    const purchased = purchaseItem(unlockedState, "field-weave", "purchase:armour");
    expect(purchased.success).toBe(true);
    expect(equipItem(purchased.state, "field-weave").success).toBe(true);
  });

  it("supports repeatable consumable purchases with separate transactions", () => {
    const first = purchaseItem(initialState, "clarity-tonic", "purchase:tonic-1");
    const duplicate = purchaseItem(first.state, "clarity-tonic", "purchase:tonic-1");
    const second = purchaseItem(first.state, "clarity-tonic", "purchase:tonic-2");
    expect(duplicate.success).toBe(false);
    expect(duplicate.reason).toBe("DUPLICATE_TRANSACTION");
    expect(second.success).toBe(true);
    expect(second.state.inventory).toEqual([
      { itemId: "clarity-tonic", quantity: 2 },
    ]);
    expect(second.state.transactions).toHaveLength(2);
  });
});
