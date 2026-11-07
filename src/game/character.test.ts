import { describe, expect, it } from "vitest";
import {
  getCharacterInitials,
  getHunterTitles,
  isSpecializationForClass,
  normalizeCharacterProfile,
} from "./character";

describe("character progression", () => {
  it("derives identity and earned titles from saved hunter data", () => {
    expect(getCharacterInitials("Sam Hunter")).toBe("SH");
    expect(getCharacterInitials("  sam  ")).toBe("S");
    expect(getHunterTitles(1, 0)).toEqual(["NEWLY AWAKENED"]);
    expect(getHunterTitles(5, 10)).toEqual([
      "NEWLY AWAKENED",
      "FIRST CONTRACT",
      "RELIABLE HUNTER",
      "RISING HUNTER",
    ]);
  });

  it("only accepts specializations belonging to the selected class", () => {
    expect(isSpecializationForClass("VANGUARD", "WARDEN")).toBe(true);
    expect(isSpecializationForClass("ARTISAN", "WARDEN")).toBe(false);
    expect(normalizeCharacterProfile({
      name: "  Sam   Hunter ",
      hunterClass: "ARTISAN",
      specialization: "FORGEMIND",
    })).toEqual({
      name: "Sam Hunter",
      hunterClass: "ARTISAN",
      specialization: "FORGEMIND",
    });
    expect(normalizeCharacterProfile({
      name: " ",
      hunterClass: "VANGUARD",
      specialization: "SEER",
    })).toBeNull();
  });
});
