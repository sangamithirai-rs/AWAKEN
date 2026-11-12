import { describe, expect, it } from "vitest";
import { GameStore, actions } from "./state.js";
import { ACTION_TYPES, gameReducer } from "./reducer.js";
import { INITIAL_STATE, ROUTES } from "./constants.js";

describe("GameStore & gameReducer (Pure Vanilla ES6 State Engine)", () => {
  it("initializes with the provided state", () => {
    const store = new GameStore(INITIAL_STATE);
    expect(store.getState()).toBe(INITIAL_STATE);
    expect(store.getState().level).toBe(1);
    expect(store.getState().route).toBe(ROUTES.SYSTEM);
  });

  it("dispatches actions and updates state immutably", () => {
    const store = new GameStore(INITIAL_STATE);
    store.dispatch(actions.setRoute(ROUTES.MISSIONS));

    expect(store.getState().route).toBe(ROUTES.MISSIONS);
    expect(store.getState()).not.toBe(INITIAL_STATE);
  });

  it("subscribes and notifies listeners on state transitions", () => {
    const store = new GameStore(INITIAL_STATE);
    let callCount = 0;
    let receivedCurrent = null;
    let receivedPrev = null;

    const unsubscribe = store.subscribe((curr, prev) => {
      callCount++;
      receivedCurrent = curr;
      receivedPrev = prev;
    });

    store.dispatch(actions.setRoute(ROUTES.SETTINGS));
    expect(callCount).toBe(1);
    expect(receivedCurrent.route).toBe(ROUTES.SETTINGS);
    expect(receivedPrev.route).toBe(ROUTES.SYSTEM);

    unsubscribe();
    store.dispatch(actions.setRoute(ROUTES.DUNGEONS));
    expect(callCount).toBe(1); // No new notification after unsubscribe
  });

  it("correctly calculates XP, gold, and level progression upon mission completion", () => {
    const state = {
      ...INITIAL_STATE,
      xp: 900,
      level: 1,
      aetherCoins: 50,
      skillPoints: 0,
      missions: [
        {
          id: "m-test-1",
          title: "TEST QUEST",
          xp: 150,
          gold: 30,
          attribute: "strength",
          completed: false,
        },
      ],
      attributes: { ...INITIAL_STATE.attributes, strength: 1 },
      streaks: { activityDates: [] },
      activityLog: [],
    };

    const nextState = gameReducer(state, actions.completeMission("m-test-1"));

    expect(nextState.xp).toBe(1050);
    expect(nextState.level).toBe(2); // Leveled up from 1 to 2!
    expect(nextState.skillPoints).toBe(1); // Gained 1 skill point on level up
    expect(nextState.aetherCoins).toBe(80); // 50 + 30
    expect(nextState.attributes.strength).toBe(2); // Incremented from 1 to 2
    expect(nextState.missions[0].completed).toBe(true);
    expect(nextState.questCompletions).toBe(1);
    expect(nextState.activityLog.length).toBe(1);
  });

  it("toggles sound and reduced motion settings predictably", () => {
    let state = INITIAL_STATE;
    state = gameReducer(state, actions.toggleSound(false));
    expect(state.settings.soundEnabled).toBe(false);

    state = gameReducer(state, actions.toggleReducedMotion(true));
    expect(state.settings.reducedMotion).toBe(true);
  });
});

