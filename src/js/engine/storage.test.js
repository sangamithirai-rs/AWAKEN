import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { storage } from "./storage.js";
import { INITIAL_STATE, STORAGE_KEY } from "./constants.js";

function setupMockStorage(initial = {}) {
  const store = new Map(Object.entries(initial));
  const mock = {
    getItem: vi.fn((key) => store.get(key) ?? null),
    setItem: vi.fn((key, val) => store.set(key, String(val))),
    removeItem: vi.fn((key) => store.delete(key)),
    clear: vi.fn(() => store.clear()),
  };
  vi.stubGlobal("localStorage", mock);
  return { mock, store };
}

describe("StorageAdapter (Dual-Persistence & Safe JSON Portability)", () => {
  let mockEnv;

  beforeEach(() => {
    mockEnv = setupMockStorage();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("returns default initial state when storage is empty", () => {
    const { state, warning } = storage.loadState();
    expect(state.level).toBe(1);
    expect(state.xp).toBe(0);
    expect(warning).toBeNull();
  });

  it("persists and reloads state synchronously via LocalStorage", () => {
    const modifiedState = {
      ...INITIAL_STATE,
      xp: 2500,
      level: 3,
      aetherCoins: 420,
      profile: { ...INITIAL_STATE.profile, name: "CHA HAE-IN" },
    };

    const saved = storage.saveState(modifiedState);
    expect(saved).toBe(true);

    const { state } = storage.loadState();
    expect(state.xp).toBe(2500);
    expect(state.level).toBe(3);
    expect(state.aetherCoins).toBe(420);
    expect(state.profile.name).toBe("CHA HAE-IN");
  });

  it("handles corrupted storage content gracefully with fallback and warning", () => {
    mockEnv.store.set(STORAGE_KEY, "{ corrupted non-json content }}}");

    const { state, warning } = storage.loadState();
    expect(state.level).toBe(1);
    expect(warning).toContain("CORRUPTED DATA DETECTED");
  });

  it("migrates legacy v1-v4 schema saves to v5 protocol", () => {
    const legacySave = {
      version: 4,
      xp: 1250,
      gold: 95,
      skillPoints: 2,
      questCompletions: 4,
      profile: {
        name: "LEGACY HUNTER",
        hunterClass: "TACTICIAN",
        specialization: "ARCHIVIST",
      },
      attributes: {
        strength: 3,
        intelligence: 5,
      },
    };

    mockEnv.store.set("awaken-save", JSON.stringify(legacySave));

    const { state, warning } = storage.loadState();
    expect(state.xp).toBe(1250);
    expect(state.level).toBe(2);
    expect(state.aetherCoins).toBe(95);
    expect(state.profile.name).toBe("LEGACY HUNTER");
    expect(state.attributes.intelligence).toBe(5);
    expect(warning).toContain("LEGACY DATA CONVERTED");
  });

  it("generates a valid timestamped JSON export bundle", () => {
    const state = {
      ...INITIAL_STATE,
      level: 5,
      xp: 4500,
      profile: { ...INITIAL_STATE.profile, name: "SHADOW MONARCH" },
    };

    const { filename, jsonString } = storage.exportStateToJSON(state);
    expect(filename).toContain("SHADOW_MONARCH");
    expect(filename).toContain(".json");

    const parsed = JSON.parse(jsonString);
    expect(parsed.meta.game).toBe("AWAKEN");
    expect(parsed.meta.hunterLevel).toBe(5);
    expect(parsed.data.xp).toBe(4500);
  });

  it("validates and restores an imported JSON archive", () => {
    const exportBundle = {
      meta: { game: "AWAKEN", version: "5.0.0" },
      data: {
        ...INITIAL_STATE,
        level: 7,
        xp: 6200,
        profile: { ...INITIAL_STATE.profile, name: "RESTORED HUNTER" },
      },
    };

    const validatedState = storage.validateAndParseImportJSON(JSON.stringify(exportBundle));
    expect(validatedState.level).toBe(7);
    expect(validatedState.xp).toBe(6200);
    expect(validatedState.profile.name).toBe("RESTORED HUNTER");
  });

  it("rejects invalid or malformed import files with descriptive errors", () => {
    expect(() => storage.validateAndParseImportJSON("")).toThrow("Empty or invalid file content");
    expect(() => storage.validateAndParseImportJSON("not json")).toThrow("File is not valid JSON");
    expect(() => storage.validateAndParseImportJSON(JSON.stringify({ someRandomField: 123 }))).toThrow(
      "JSON file does not match AWAKEN player profile format"
    );
  });

  it("performs factory reset cleanly", () => {
    mockEnv.store.set(STORAGE_KEY, JSON.stringify({ xp: 9999 }));
    const reset = storage.resetGame();

    expect(reset.xp).toBe(0);
    expect(mockEnv.mock.removeItem).toHaveBeenCalledWith(STORAGE_KEY);
  });
});
