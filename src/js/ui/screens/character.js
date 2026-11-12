/**
 * AWAKEN Character Profile & Hunter Dossier Screen
 * Pure Vanilla JavaScript ES6 Module
 */

import {
  AVATAR_PRESETS,
  HUNTER_CLASSES,
  TITLES_CATALOG,
} from "../../engine/character.js";
import { getRankFromLevel } from "../../engine/constants.js";
import { actions, store } from "../../engine/state.js";
import { audio } from "../../engine/audio.js";
import { AwakeningCeremony } from "../components/awakeningCeremony.js";

export function renderCharacterScreen(container, state, navigate) {
  const rank = getRankFromLevel(state.level);
  const avatar =
    AVATAR_PRESETS.find((a) => a.id === state.profile.avatarId) ||
    AVATAR_PRESETS[0];
  const hunterClass =
    HUNTER_CLASSES.find((c) => c.id === state.profile.hunterClass) ||
    HUNTER_CLASSES[0];

  const currentLevelXP = state.xp % 1000;
  const xpPercentage = Math.round((currentLevelXP / 1000) * 100);

  container.innerHTML = `
    <div class="main-grid page-grid page-grid-character" style="gap: 24px;">
      <!-- Left Column: Holographic Hunter Dossier Card -->
      <section class="panel hunter-dossier-card" data-rank="${rank}" style="padding: 24px; position: relative;">
        <div class="panel-corner corner-tl"></div>
        <div class="panel-corner corner-br"></div>

        <div class="section-label">
          <span>DOSSIER // 01</span>
          HUNTER IDENTIFICATION LICENSE
        </div>

        <div style="display: flex; gap: 20px; align-items: center; margin: 20px 0;">
          <div
            id="dossier-avatar-container"
            style="width: 88px; height: 88px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: rgba(8, 14, 26, 0.9); border: 2px solid ${avatar.theme}; box-shadow: 0 0 25px ${avatar.accent}; color: ${avatar.theme}; flex-shrink: 0;"
          >
            <div style="width: 52px; height: 52px;">
              ${avatar.svgIcon}
            </div>
          </div>

          <div style="flex: 1; min-width: 0;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
              <span class="badge" style="background: rgba(147, 51, 234, 0.2); border: 1px solid #a855f7; color: #d8b4fe; font-size: 10px; letter-spacing: 0.1em;">
                ${state.profile.title || 'NEWLY AWAKENED'}
              </span>
              <span class="badge" data-rank="${rank}" style="font-size: 10px;">
                RANK ${rank}
              </span>
            </div>

            <h2 id="dossier-name" style="font-family: var(--font-display); font-size: 26px; color: #edf5ff; margin: 0 0 4px; word-break: break-word;">
              ${state.profile.name}
            </h2>

            <div style="font-family: var(--font-hud); font-size: 12px; color: #93c5fd; letter-spacing: 0.08em;">
              CLASS: ${hunterClass.name.toUpperCase()} // ${state.profile.specialization}
            </div>
          </div>
        </div>

        <div class="level-display" style="margin-bottom: 18px;">
          <div>
            <span>CURRENT LEVEL</span>
            <strong>LV. ${String(state.level).padStart(2, "0")}</strong>
          </div>
          <div class="rank-display" data-rank="${rank}">
            <span>SYSTEM RANK</span>
            <strong>${rank}</strong>
          </div>
        </div>

        <div class="xp-section" style="margin-bottom: 20px;">
          <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 6px;">
            <span style="color: #94a3b8; font-family: var(--font-hud);">NEXT RANK MILESTONE</span>
            <strong style="color: #edf5ff; font-family: var(--font-mono);">${currentLevelXP} / 1000 XP</strong>
          </div>
          <div class="xp-bar">
            <div style="width: ${xpPercentage}%;"></div>
          </div>
        </div>

        <div style="background: rgba(8, 14, 26, 0.65); border: 1px solid rgba(138, 168, 220, 0.15); border-radius: 4px; padding: 14px; margin-bottom: 20px;">
          <strong style="color: #38bdf8; font-family: var(--font-hud); font-size: 12px; display: block; margin-bottom: 4px;">
            CLASS PASSIVE PERK
          </strong>
          <p style="font-size: 12px; color: #cbd5e1; margin: 0 0 6px;">
            ${hunterClass.passive}
          </p>
          <small style="color: #94a3b8; font-family: var(--font-mono); font-size: 10px;">
            AFFINITY: ${hunterClass.linkedAttributes}
          </small>
        </div>

        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
          <button
            type="button"
            id="open-edit-profile-btn"
            style="flex: 1; background: rgba(59, 130, 246, 0.2); border: 1px solid #3b82f6; color: #93c5fd; padding: 10px; font-family: var(--font-hud); font-size: 11px; font-weight: 700; cursor: pointer; border-radius: 3px; letter-spacing: 0.08em;"
          >
            EDIT DOSSIER IDENTITY
          </button>

          <button
            type="button"
            id="re-awaken-btn"
            style="flex: 1; background: rgba(147, 51, 234, 0.2); border: 1px solid #a855f7; color: #d8b4fe; padding: 10px; font-family: var(--font-hud); font-size: 11px; font-weight: 700; cursor: pointer; border-radius: 3px; letter-spacing: 0.08em;"
          >
            RE-RUN AWAKENING RITUAL
          </button>
        </div>
      </section>

      <!-- Right Column: Titles & Class Evolution -->
      <div style="display: flex; flex-direction: column; gap: 24px;">
        <!-- Equippable Titles Gallery -->
        <section class="panel" style="padding: 20px;">
          <div class="section-label">
            <span>TITLES // 02</span>
            EQUIPPABLE HUNTER TITLES
          </div>

          <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 14px;">
            ${TITLES_CATALOG.map((title) => {
              const isEquipped = state.profile.title === title.name;
              const isUnlocked = state.level >= title.requiredLevel;

              return `
                <div
                  class="title-badge-row"
                  style="display: flex; align-items: center; justify-content: space-between; padding: 12px 14px; background: rgba(8, 14, 26, 0.7); border: 1px solid ${isEquipped ? '#818cf8' : 'rgba(255,255,255,0.08)'}; border-radius: 4px;"
                >
                  <div>
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <strong style="color: ${isEquipped ? '#c084fc' : '#edf5ff'}; font-family: var(--font-hud); font-size: 13px;">
                        ${title.name}
                      </strong>
                      ${isEquipped ? '<span style="font-size: 10px; color: #34d399; font-family: var(--font-mono);">[ACTIVE]</span>' : ''}
                    </div>
                    <p style="font-size: 11px; color: #94a3b8; margin: 3px 0 0;">
                      ${title.description} · <span style="color: #60a5fa;">${title.passiveBonus}</span>
                    </p>
                  </div>

                  <div>
                    ${
                      isEquipped
                        ? `<button type="button" disabled style="background: rgba(52, 211, 153, 0.2); border: 1px solid #34d399; color: #34d399; padding: 4px 10px; font-family: var(--font-hud); font-size: 10px; border-radius: 3px;">EQUIPPED</button>`
                        : isUnlocked
                        ? `<button type="button" class="equip-title-btn" data-title="${title.name}" style="background: rgba(59, 130, 246, 0.25); border: 1px solid #3b82f6; color: #93c5fd; padding: 4px 12px; font-family: var(--font-hud); font-size: 10px; cursor: pointer; border-radius: 3px;">EQUIP</button>`
                        : `<span style="font-family: var(--font-mono); font-size: 10px; color: #64748b;">REQ. LV.${title.requiredLevel}</span>`
                    }
                  </div>
                </div>
              `;
            }).join("")}
          </div>
        </section>

        <!-- Hunter Class Evolution Tier List -->
        <section class="panel" style="padding: 20px;">
          <div class="section-label">
            <span>EVOLUTION // 03</span>
            CLASS ASCENSION LADDER
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 10px; margin-top: 14px;">
            ${hunterClass.evolution.map((evo) => {
              const reached = state.level >= evo.level;
              return `
                <div style="background: rgba(8, 14, 26, 0.7); border: 1px solid ${reached ? '#38bdf8' : 'rgba(255,255,255,0.06)'}; border-radius: 4px; padding: 12px; text-align: center;">
                  <span style="font-family: var(--font-mono); font-size: 10px; color: ${reached ? '#38bdf8' : '#64748b'};">
                    TIER LV. ${evo.level}
                  </span>
                  <strong style="display: block; font-family: var(--font-hud); font-size: 12px; color: ${reached ? '#edf5ff' : '#64748b'}; margin-top: 4px;">
                    ${evo.title}
                  </strong>
                  <span style="font-size: 10px; color: ${reached ? '#34d399' : '#475569'}; font-family: var(--font-mono);">
                    ${reached ? 'UNLOCKED' : 'LOCKED'}
                  </span>
                </div>
              `;
            }).join("")}
          </div>
        </section>
      </div>
    </div>
  `;

  // Attach Event Listeners
  // 1. Equip Title Handler
  container.querySelectorAll(".equip-title-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      audio.playClick();
      const titleName = btn.getAttribute("data-title");
      if (titleName) {
        store.dispatch(actions.updateProfile({ title: titleName }));
        store.dispatch(actions.setNotification(`TITLE EQUIPPED // [${titleName}] ACTIVE`));
      }
    });
  });

  // 2. Re-run Awakening Ceremony
  const reAwakenBtn = container.querySelector("#re-awaken-btn");
  reAwakenBtn?.addEventListener("click", () => {
    audio.playClick();
    const ceremony = new AwakeningCeremony(() => {
      renderCharacterScreen(container, store.getState(), navigate);
    });
    ceremony.start();
  });

  // 3. Edit Profile Modal
  const editProfileBtn = container.querySelector("#open-edit-profile-btn");
  editProfileBtn?.addEventListener("click", () => {
    openEditProfileModal(state, () => {
      renderCharacterScreen(container, store.getState(), navigate);
    });
  });
}

/**
 * Lightweight native modal to edit player profile directly
 */
function openEditProfileModal(state, onSaved) {
  audio.playClick();
  const modal = document.createElement("div");
  modal.className = "awakening-overlay";
  modal.innerHTML = `
    <div class="awakening-content panel" style="max-width: 500px; width: 90%;">
      <div class="system-label" style="color: #60a5fa;">
        HUNTER DOSSIER CALIBRATION
      </div>
      <h2 style="font-family: var(--font-display); font-size: 20px; color: #edf5ff; margin: 8px 0 16px;">
        UPDATE IDENTITY RECORDS
      </h2>

      <div style="margin-bottom: 14px;">
        <label for="edit-name-field" style="display: block; font-family: var(--font-hud); font-size: 11px; color: #94a3b8; margin-bottom: 6px;">
          CALLSIGN / NAME
        </label>
        <input
          type="text"
          id="edit-name-field"
          value="${state.profile.name}"
          maxlength="24"
          style="width: 100%; background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(138, 168, 220, 0.25); color: #edf5ff; padding: 10px; border-radius: 3px; font-family: var(--font-display); font-size: 15px;"
        />
      </div>

      <div style="margin-bottom: 14px;">
        <label style="display: block; font-family: var(--font-hud); font-size: 11px; color: #94a3b8; margin-bottom: 6px;">
          SELECT AVATAR
        </label>
        <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px;" id="edit-avatar-list">
          ${AVATAR_PRESETS.map((av) => `
            <button
              type="button"
              class="avatar-tile ${av.id === state.profile.avatarId ? 'active' : ''}"
              data-id="${av.id}"
              style="padding: 8px 4px; background: rgba(15, 23, 42, 0.7); border: 2px solid ${av.id === state.profile.avatarId ? av.theme : 'rgba(255,255,255,0.08)'}; border-radius: 4px; cursor: pointer; color: ${av.theme};"
            >
              <div style="width: 24px; height: 24px; margin: 0 auto;">${av.svgIcon}</div>
            </button>
          `).join("")}
        </div>
      </div>

      <div style="margin-bottom: 20px;">
        <label for="edit-class-field" style="display: block; font-family: var(--font-hud); font-size: 11px; color: #94a3b8; margin-bottom: 6px;">
          HUNTER CLASS
        </label>
        <select
          id="edit-class-field"
          style="width: 100%; background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(138, 168, 220, 0.25); color: #edf5ff; padding: 10px; border-radius: 3px; font-family: var(--font-hud); font-size: 13px;"
        >
          ${HUNTER_CLASSES.map((cls) => `
            <option value="${cls.id}" ${cls.id === state.profile.hunterClass ? 'selected' : ''}>
              ${cls.name.toUpperCase()} (${cls.role})
            </option>
          `).join("")}
        </select>
      </div>

      <div style="display: flex; justify-content: flex-end; gap: 10px;">
        <button
          type="button"
          id="cancel-edit-btn"
          style="background: transparent; border: 1px solid rgba(255,255,255,0.1); color: #94a3b8; padding: 8px 16px; border-radius: 3px; cursor: pointer; font-family: var(--font-hud);"
        >
          CANCEL
        </button>
        <button
          type="button"
          id="save-edit-btn"
          style="background: rgba(59, 130, 246, 0.3); border: 1px solid #3b82f6; color: #ffffff; padding: 8px 20px; border-radius: 3px; cursor: pointer; font-family: var(--font-hud); font-weight: 700;"
        >
          SAVE RECORDS
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  let selectedAvatarId = state.profile.avatarId;
  modal.querySelectorAll(".avatar-tile").forEach((tile) => {
    tile.addEventListener("click", () => {
      audio.playClick();
      selectedAvatarId = tile.getAttribute("data-id");
      modal.querySelectorAll(".avatar-tile").forEach((t) => {
        t.style.borderColor = "rgba(255,255,255,0.08)";
      });
      tile.style.borderColor = "#38bdf8";
    });
  });

  const cancelBtn = modal.querySelector("#cancel-edit-btn");
  cancelBtn?.addEventListener("click", () => {
    audio.playClick();
    document.body.removeChild(modal);
  });

  const saveBtn = modal.querySelector("#save-edit-btn");
  saveBtn?.addEventListener("click", () => {
    audio.playMissionComplete();
    const nameField = modal.querySelector("#edit-name-field");
    const classField = modal.querySelector("#edit-class-field");

    const newName = nameField?.value?.trim().toUpperCase() || state.profile.name;
    const newClass = classField?.value || state.profile.hunterClass;
    const clsObj = HUNTER_CLASSES.find((c) => c.id === newClass);

    store.dispatch(
      actions.updateProfile({
        name: newName,
        hunterClass: newClass,
        specialization: clsObj?.specializations[0]?.id || state.profile.specialization,
        avatarId: selectedAvatarId,
      })
    );

    store.dispatch(actions.setNotification("DOSSIER RECORDS UPDATED SUCCESSFULLY"));
    document.body.removeChild(modal);
    onSaved();
  });
}

