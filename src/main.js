/**
 * AWAKEN — Main Application Bootstrap
 * Pure Vanilla JavaScript ES6 Module (No React, No JSX, 100% Client-Side)
 */

import "./index.css";
import { router } from "./js/engine/router.js";
import { ROUTES } from "./js/engine/constants.js";
import { store } from "./js/engine/state.js";
import { initShell } from "./js/ui/shell.js";
import { renderHomeScreen } from "./js/ui/screens/home.js";
import { renderSettingsScreen } from "./js/ui/screens/settings.js";
import { renderCharacterScreen } from "./js/ui/screens/character.js";
import { renderMissionsScreen } from "./js/ui/screens/missions.js";
import { renderAttributesScreen } from "./js/ui/screens/attributes.js";
import { renderSkillsScreen } from "./js/ui/screens/skills.js";
import { AwakeningCeremony } from "./js/ui/components/awakeningCeremony.js";
import {
  renderAchievementsScreen,
  renderDungeonsScreen,
  renderExplorationScreen,
  renderInventoryScreen,
  renderShopScreen,
} from "./js/ui/screens/placeholders.js";

// Register all 11 Screens in the Native Router
router.register(ROUTES.SYSTEM, renderHomeScreen);
router.register(ROUTES.MISSIONS, renderMissionsScreen);
router.register(ROUTES.CHARACTER, renderCharacterScreen);
router.register(ROUTES.ATTRIBUTES, renderAttributesScreen);
router.register(ROUTES.SKILLS, renderSkillsScreen);
router.register(ROUTES.EXPLORATION, renderExplorationScreen);
router.register(ROUTES.DUNGEONS, renderDungeonsScreen);
router.register(ROUTES.INVENTORY, renderInventoryScreen);
router.register(ROUTES.ACHIEVEMENTS, renderAchievementsScreen);
router.register(ROUTES.SHOP, renderShopScreen);
router.register(ROUTES.SETTINGS, renderSettingsScreen);

// Initialize Application Shell & Check Awakening Onboarding
document.addEventListener("DOMContentLoaded", () => {
  const mountPoint = document.getElementById("root") || document.body;
  initShell(mountPoint);

  // If first-time user hasn't completed the Awakening ceremony, launch it
  const isAwakened = store.getState().profile?.isAwakened;
  if (!isAwakened) {
    setTimeout(() => {
      const ceremony = new AwakeningCeremony();
      ceremony.start();
    }, 450);
  }
});
