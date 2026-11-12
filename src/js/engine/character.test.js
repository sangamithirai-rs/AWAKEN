import { describe, expect, it } from "vitest";
import {
  AVATAR_PRESETS,
  HUNTER_CLASSES,
  TITLES_CATALOG,
} from "./character.js";
import { getRankFromLevel, INITIAL_STATE } from "./constants.js";
import { gameReducer, ACTION_TYPES } from "./reducer.js";
import { actions } from "./state.js";

describe("Character System & Hunter Progression (Phase 2)", () => {
  it("defines comprehensive avatar presets with visual themes and SVG glyphs", () => {
    expect(AVATAR_PRESETS.length).toBeGreaterThanOrEqual(5);
    const shadowMonarch = AVATAR_PRESETS.find((a) => a.id === "avatar_shadow");
    expect(shadowMonarch).toBeDefined();
    expect(shadowMonarch.theme).toBe("#818cf8");
    expect(shadowMonarch.svgIcon).toContain("<svg");
  });

  it("defines all hunter classes with specializations, evolution tiers, and passives", () => {
    expect(HUNTER_CLASSES.length).toBe(5);

    const vanguard = HUNTER_CLASSES.find((c) => c.id === "VANGUARD");
    expect(vanguard).toBeDefined();
    expect(vanguard.primaryAttribute).toBe("strength");
    expect(vanguard.specializations.length).toBe(2);
    expect(vanguard.evolution.length).toBe(4);
    expect(vanguard.evolution[0].level).toBe(3);
    expect(vanguard.evolution[3].level).toBe(30);
  });

  it("calculates accurate hunter ranks from F through S", () => {
    expect(getRankFromLevel(1)).toBe("F");
    expect(getRankFromLevel(2)).toBe("E");
    expect(getRankFromLevel(3)).toBe("E+");
    expect(getRankFromLevel(4)).toBe("E+");
    expect(getRankFromLevel(5)).toBe("D");
    expect(getRankFromLevel(9)).toBe("D");
    expect(getRankFromLevel(10)).toBe("C");
    expect(getRankFromLevel(14)).toBe("C");
    expect(getRankFromLevel(15)).toBe("B");
    expect(getRankFromLevel(19)).toBe("B");
    expect(getRankFromLevel(20)).toBe("A");
    expect(getRankFromLevel(29)).toBe("A");
    expect(getRankFromLevel(30)).toBe("S");
    expect(getRankFromLevel(50)).toBe("S");
  });

  it("updates character profile immutably via UPDATE_PROFILE action", () => {
    const initialState = {
      ...INITIAL_STATE,
      profile: {
        name: "INITIAL HUNTER",
        hunterClass: "VANGUARD",
        specialization: "WARDEN",
        avatarId: "avatar_shadow",
        title: "NEWLY AWAKENED",
        isAwakened: false,
      },
    };

    const nextState = gameReducer(
      initialState,
      actions.updateProfile({
        name: "SUNG JIN-WOO",
        hunterClass: "SHADOW_HUNTER",
        specialization: "NIGHTSTALKER",
        avatarId: "avatar_vanguard",
        title: "SHADOW MONARCH",
        isAwakened: true,
      })
    );

    expect(nextState.profile.name).toBe("SUNG JIN-WOO");
    expect(nextState.profile.hunterClass).toBe("SHADOW_HUNTER");
    expect(nextState.profile.specialization).toBe("NIGHTSTALKER");
    expect(nextState.profile.avatarId).toBe("avatar_vanguard");
    expect(nextState.profile.title).toBe("SHADOW MONARCH");
    expect(nextState.profile.isAwakened).toBe(true);
    expect(initialState.profile.name).toBe("INITIAL HUNTER"); // Immutability preserved
  });

  it("contains unlocked titles catalog with tier requirements", () => {
    expect(TITLES_CATALOG.length).toBeGreaterThanOrEqual(6);
    const starterTitle = TITLES_CATALOG.find((t) => t.id === "NEWLY AWAKENED");
    expect(starterTitle.requiredLevel).toBe(1);

    const apexTitle = TITLES_CATALOG.find((t) => t.id === "SHADOW MONARCH");
    expect(apexTitle.requiredRank).toBe("S");
    expect(apexTitle.requiredLevel).toBe(30);
  });
});

