/**
 * AWAKEN Standby Screen Modules (Scheduled for Subsequent Phases)
 * Pure Vanilla JavaScript ES6 Module
 */

import { ROUTE_LABELS } from "../../engine/constants.js";

function createStandbyScreen(routeKey, phaseNumber, summary) {
  return function renderScreen(container, state, navigate) {
    const info = ROUTE_LABELS[routeKey] || { title: routeKey, full: routeKey };

    container.innerHTML = `
      <section class="panel" style="padding: 32px; max-width: 850px; margin: 0 auto; text-align: center;">
        <div class="system-label" style="letter-spacing: 0.15em; color: #60a5fa; margin-bottom: 8px;">
          SYSTEM OPERATIONS // ${info.full}
        </div>
        <h2 style="font-family: var(--font-display); font-size: 24px; color: #edf5ff; margin-bottom: 12px;">
          ${info.title}
        </h2>
        <p style="color: #94a3b8; font-size: 14px; max-width: 580px; margin: 0 auto 24px; line-height: 1.6;">
          ${summary}
        </p>

        <div style="display: inline-flex; align-items: center; gap: 8px; background: rgba(59, 130, 246, 0.12); border: 1px solid rgba(59, 130, 246, 0.35); padding: 6px 14px; border-radius: 4px; font-family: var(--font-mono); font-size: 11px; color: #93c5fd; margin-bottom: 24px;">
          <span>STATUS:</span>
          <strong>SCHEDULED FOR PHASE ${phaseNumber} DEPLOYMENT</strong>
        </div>

        <div>
          <button type="button" class="action-btn" data-action="return-home" style="background: rgba(59, 130, 246, 0.2); border: 1px solid #3b82f6; color: #93c5fd; padding: 10px 20px; font-family: var(--font-hud); font-weight: 700; cursor: pointer; border-radius: 4px;">
            RETURN TO COMMAND
          </button>
        </div>
      </section>
    `;

    const returnBtn = container.querySelector("[data-action='return-home']");
    if (returnBtn) {
      returnBtn.addEventListener("click", () => navigate("SYSTEM"));
    }
  };
}

export const renderMissionsScreen = createStandbyScreen(
  "MISSIONS",
  3,
  "Full classified mission matrix: Main Story Campaigns, Daily Conditioning, Weekly Directives, and Custom Contract Creator."
);

export const renderCharacterScreen = createStandbyScreen(
  "CHARACTER",
  2,
  "Hunter Identity Dossier: Awakening Ceremony, Avatar customizer, Hunter Class evolutions, and equippable cosmetic titles."
);

export const renderExplorationScreen = createStandbyScreen(
  "EXPLORATION",
  5,
  "Dimensional Gate Radar & Sector Map: Real-world territory discovery, rift alerts, and exploration milestones."
);

export const renderDungeonsScreen = createStandbyScreen(
  "DUNGEONS",
  5,
  "Gate Instances & Raid Encounters: E-Rank to S-Rank dimensional dungeons, turn-based boss battles, and phase clearance bounties."
);

export const renderInventoryScreen = createStandbyScreen(
  "INVENTORY",
  6,
  "Armory Vault: Weapons, protective hunter armour, relic accessories, consumable elixirs, and cosmetic collectibles."
);

export const renderAchievementsScreen = createStandbyScreen(
  "ACHIEVEMENTS",
  6,
  "Record of Conquest: Tiered hunter milestones, secret dimensional badges, and prestigious Hunter titles."
);

export const renderShopScreen = createStandbyScreen(
  "SHOP",
  6,
  "Aether Coin Exchange: Purchase equipment upgrades, stamina elixirs, and unlockable hunter gear."
);

