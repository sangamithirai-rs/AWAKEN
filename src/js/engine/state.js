/**
 * AWAKEN Custom Reactive GameStore
 * Event-Driven State Management with Predictable Action Dispatching and Subscriptions
 * Pure Vanilla JavaScript ES6 Module
 */

import { ACTION_TYPES, gameReducer } from "./reducer.js";
import { storage } from "./storage.js";

export class GameStore {
  constructor(initialState) {
    this.state = initialState;
    this.listeners = new Set();
    this.isDispatching = false;
  }

  /**
   * Returns a reference to the current immutable state tree
   */
  getState() {
    return this.state;
  }

  /**
   * Dispatches an action and notifies registered listeners on state change
   */
  dispatch(action) {
    if (this.isDispatching) {
      throw new Error("GameStore: Reducers may not dispatch actions.");
    }

    try {
      this.isDispatching = true;
      const prevState = this.state;
      this.state = gameReducer(this.state, action);
      this.isDispatching = false;

      if (this.state !== prevState) {
        this.notify(prevState);
      }
      return action;
    } catch (error) {
      this.isDispatching = false;
      console.error("GameStore Dispatch Error:", error);
      throw error;
    }
  }

  /**
   * Subscribes a listener to receive state transitions
   * @param {Function} listener (currentState, prevState) => void
   * @returns {Function} Unsubscribe callback
   */
  subscribe(listener) {
    if (typeof listener !== "function") {
      throw new TypeError("GameStore: Expected listener to be a function.");
    }
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notifies all registered subscribers
   */
  notify(prevState) {
    for (const listener of this.listeners) {
      try {
        listener(this.state, prevState);
      } catch (err) {
        console.error("Error in GameStore subscriber:", err);
      }
    }
  }
}

// -------------------------------------------------------------
// Action Creators
// -------------------------------------------------------------
export const actions = {
  setRoute: (route) => ({ type: ACTION_TYPES.SET_ROUTE, payload: route }),
  loadState: (state) => ({ type: ACTION_TYPES.LOAD_STATE, payload: state }),
  resetState: () => ({ type: ACTION_TYPES.RESET_STATE }),
  setNotification: (text) => ({ type: ACTION_TYPES.SET_NOTIFICATION, payload: text }),
  toggleSound: (val) => ({ type: ACTION_TYPES.TOGGLE_SOUND, payload: val }),
  toggleReducedMotion: (val) => ({ type: ACTION_TYPES.TOGGLE_REDUCED_MOTION, payload: val }),
  updateProfile: (profile) => ({ type: ACTION_TYPES.UPDATE_PROFILE, payload: profile }),
  completeMission: (missionId, date) => ({ type: ACTION_TYPES.COMPLETE_MISSION, payload: { missionId, date } }),
  advanceBossMission: (missionId) => ({ type: ACTION_TYPES.ADVANCE_BOSS_MISSION, payload: { missionId } }),
  createMission: (mission) => ({ type: ACTION_TYPES.CREATE_MISSION, payload: mission }),
  updateMission: (missionId, updates) => ({ type: ACTION_TYPES.UPDATE_MISSION, payload: { missionId, updates } }),
  deleteMission: (missionId) => ({ type: ACTION_TYPES.DELETE_MISSION, payload: { missionId } }),
  acceptMission: (missionId) => ({ type: ACTION_TYPES.ACCEPT_MISSION, payload: { missionId } }),
  abandonMission: (missionId) => ({ type: ACTION_TYPES.ABANDON_MISSION, payload: { missionId } }),
  toggleSubtask: (missionId, subtaskId) => ({ type: ACTION_TYPES.TOGGLE_SUBTASK, payload: { missionId, subtaskId } }),
  equipItem: (slot, itemId) => ({ type: ACTION_TYPES.EQUIP_ITEM, payload: { slot, itemId } }),
  unequipItem: (slot) => ({ type: ACTION_TYPES.UNEQUIP_ITEM, payload: { slot } }),
  unlockSkill: (nodeId) => ({ type: ACTION_TYPES.UNLOCK_SKILL, payload: { nodeId } }),
  allocateStatPoint: (attribute) => ({ type: ACTION_TYPES.ALLOCATE_STAT_POINT, payload: { attribute } }),
};

// -------------------------------------------------------------
// Initialize Singleton Store with Storage Persistence
// -------------------------------------------------------------
const { state: initialLoadedState, warning } = storage.loadState();
export const store = new GameStore(initialLoadedState);

// Set initial warning if recovered from corrupted or legacy data
if (warning) {
  setTimeout(() => {
    store.dispatch(actions.setNotification(warning));
  }, 300);
}

// Auto-persist state changes to LocalStorage and IndexedDB
store.subscribe((nextState, prevState) => {
  // Avoid saving if only route changed to minimize disk writes
  const stateChanged =
    nextState.xp !== prevState.xp ||
    nextState.level !== prevState.level ||
    nextState.aetherCoins !== prevState.aetherCoins ||
    nextState.missions !== prevState.missions ||
    nextState.inventory !== prevState.inventory ||
    nextState.equipment !== prevState.equipment ||
    nextState.profile !== prevState.profile ||
    nextState.settings !== prevState.settings ||
    nextState.skills !== prevState.skills;

  if (stateChanged) {
    storage.saveState(nextState);
  }
});

