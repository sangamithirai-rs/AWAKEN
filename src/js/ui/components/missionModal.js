/**
 * AWAKEN Custom Contract Console Modals
 * Pure Vanilla JavaScript ES6 Module
 */

import {
  MISSION_CATEGORIES,
  MISSION_DIFFICULTIES,
  calculateMissionRewards,
  evaluateDeadline,
  getMissionProgress,
} from "../../engine/missions.js";
import { actions, store } from "../../engine/state.js";
import { audio } from "../../engine/audio.js";

/**
 * Opens Mission Creation or Edit Modal
 * @param {object|null} existingMission - null for create, object for edit
 * @param {Function} onSaved - callback after save
 */
export function openMissionFormModal(existingMission = null, onSaved = () => {}) {
  audio.playClick();
  const isEditing = Boolean(existingMission);

  let tempSubtasks = isEditing && Array.isArray(existingMission.subtasks)
    ? [...existingMission.subtasks.map((st) => ({ ...st }))]
    : [];

  const modal = document.createElement("div");
  modal.className = "awakening-overlay";
  modal.id = "mission-form-modal";

  const defaultCategory = existingMission?.category || "CUSTOM";
  const defaultDifficulty = existingMission?.difficulty || "D";
  const defaultAttribute = existingMission?.attribute || "discipline";

  function getCalculatedRewards(diff, cat, subCount) {
    return calculateMissionRewards(diff, cat, subCount);
  }

  let initialRewards = getCalculatedRewards(defaultDifficulty, defaultCategory, tempSubtasks.length);

  modal.innerHTML = `
    <div class="awakening-content panel" style="max-width: 680px; width: 94%; max-height: 90vh; overflow-y: auto;">
      <div class="system-label" style="color: #60a5fa;">
        CONTRACT PROTOCOL // ${isEditing ? 'MODIFY DIRECTIVE' : 'FORGE NEW CONTRACT'}
      </div>

      <h2 style="font-family: var(--font-display); font-size: 20px; color: #edf5ff; margin: 6px 0 16px;">
        ${isEditing ? 'RECALIBRATE MISSION' : 'INITIALIZE CONTRACT'}
      </h2>

      <form id="mission-editor-form">
        <!-- Title -->
        <div style="margin-bottom: 12px;">
          <label for="mission-title-input" style="display: block; font-family: var(--font-hud); font-size: 11px; color: #94a3b8; margin-bottom: 4px;">
            CONTRACT DIRECTIVE TITLE *
          </label>
          <input
            type="text"
            id="mission-title-input"
            required
            maxlength="80"
            value="${existingMission?.title || ''}"
            placeholder="e.g. Master React Engine Architecture"
            style="width: 100%; background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(138, 168, 220, 0.25); color: #edf5ff; padding: 10px 12px; border-radius: 3px; font-family: var(--font-display); font-size: 14px;"
          />
        </div>

        <!-- Description -->
        <div style="margin-bottom: 12px;">
          <label for="mission-desc-input" style="display: block; font-family: var(--font-hud); font-size: 11px; color: #94a3b8; margin-bottom: 4px;">
            OBJECTIVE BRIEFING / MISSION DETAILS
          </label>
          <textarea
            id="mission-desc-input"
            rows="3"
            placeholder="Define the exact conditions and requirements for clearing this objective."
            style="width: 100%; background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(138, 168, 220, 0.25); color: #edf5ff; padding: 8px 12px; border-radius: 3px; font-family: var(--font-body); font-size: 13px;"
          >${existingMission?.description || ''}</textarea>
        </div>

        <!-- Category & Difficulty Row -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; margin-bottom: 12px;">
          <div>
            <label for="mission-category-select" style="display: block; font-family: var(--font-hud); font-size: 11px; color: #94a3b8; margin-bottom: 4px;">
              CATEGORY
            </label>
            <select
              id="mission-category-select"
              style="width: 100%; background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(138, 168, 220, 0.25); color: #edf5ff; padding: 8px 10px; border-radius: 3px; font-family: var(--font-hud); font-size: 12px;"
            >
              ${Object.values(MISSION_CATEGORIES).map((cat) => `
                <option value="${cat.id}" ${cat.id === defaultCategory ? 'selected' : ''}>
                  ${cat.symbol} ${cat.name}
                </option>
              `).join("")}
            </select>
          </div>

          <div>
            <label for="mission-difficulty-select" style="display: block; font-family: var(--font-hud); font-size: 11px; color: #94a3b8; margin-bottom: 4px;">
              THREAT / DIFFICULTY
            </label>
            <select
              id="mission-difficulty-select"
              style="width: 100%; background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(138, 168, 220, 0.25); color: #edf5ff; padding: 8px 10px; border-radius: 3px; font-family: var(--font-hud); font-size: 12px;"
            >
              ${Object.values(MISSION_DIFFICULTIES).map((diff) => `
                <option value="${diff.rank}" ${diff.rank === defaultDifficulty ? 'selected' : ''}>
                  ${diff.name}
                </option>
              `).join("")}
            </select>
          </div>

          <div>
            <label for="mission-attribute-select" style="display: block; font-family: var(--font-hud); font-size: 11px; color: #94a3b8; margin-bottom: 4px;">
              TARGET ATTRIBUTE
            </label>
            <select
              id="mission-attribute-select"
              style="width: 100%; background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(138, 168, 220, 0.25); color: #edf5ff; padding: 8px 10px; border-radius: 3px; font-family: var(--font-hud); font-size: 12px;"
            >
              <option value="strength" ${defaultAttribute === 'strength' ? 'selected' : ''}>STRENGTH (Physical)</option>
              <option value="intelligence" ${defaultAttribute === 'intelligence' ? 'selected' : ''}>INTELLIGENCE (Intellect)</option>
              <option value="vitality" ${defaultAttribute === 'vitality' ? 'selected' : ''}>VITALITY (Endurance)</option>
              <option value="discipline" ${defaultAttribute === 'discipline' ? 'selected' : ''}>DISCIPLINE (Routine)</option>
              <option value="creativity" ${defaultAttribute === 'creativity' ? 'selected' : ''}>CREATIVITY (Projects)</option>
              <option value="focus" ${defaultAttribute === 'focus' ? 'selected' : ''}>FOCUS (Deep Work)</option>
              <option value="consistency" ${defaultAttribute === 'consistency' ? 'selected' : ''}>CONSISTENCY (Habits)</option>
            </select>
          </div>
        </div>

        <!-- Duration & Deadline Row -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; margin-bottom: 16px;">
          <div>
            <label for="mission-duration-input" style="display: block; font-family: var(--font-hud); font-size: 11px; color: #94a3b8; margin-bottom: 4px;">
              ESTIMATED DURATION
            </label>
            <input
              type="text"
              id="mission-duration-input"
              value="${existingMission?.estimatedDuration || '30 MIN'}"
              placeholder="e.g. 45 MIN"
              style="width: 100%; background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(138, 168, 220, 0.25); color: #edf5ff; padding: 8px 10px; border-radius: 3px; font-family: var(--font-mono); font-size: 12px;"
            />
          </div>

          <div>
            <label for="mission-deadline-input" style="display: block; font-family: var(--font-hud); font-size: 11px; color: #94a3b8; margin-bottom: 4px;">
              OPTIONAL DEADLINE
            </label>
            <input
              type="date"
              id="mission-deadline-input"
              value="${existingMission?.deadline || ''}"
              style="width: 100%; background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(138, 168, 220, 0.25); color: #edf5ff; padding: 8px 10px; border-radius: 3px; font-family: var(--font-mono); font-size: 12px;"
            />
          </div>
        </div>

        <!-- Subtasks Builder -->
        <div style="background: rgba(8, 14, 26, 0.65); border: 1px solid rgba(138, 168, 220, 0.15); border-radius: 4px; padding: 14px; margin-bottom: 18px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <span style="font-family: var(--font-hud); font-size: 11px; color: #93c5fd; letter-spacing: 0.1em;">
              CONTRACT SUBTASKS (MILESTONES)
            </span>
            <small style="color: #94a3b8; font-family: var(--font-mono); font-size: 10px;" id="subtask-count-indicator">
              ${tempSubtasks.length} SUBTASKS
            </small>
          </div>

          <div style="display: flex; gap: 8px; margin-bottom: 10px;">
            <input
              type="text"
              id="new-subtask-input"
              placeholder="Add actionable subtask step..."
              style="flex: 1; background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(255,255,255,0.1); color: #edf5ff; padding: 7px 10px; border-radius: 3px; font-size: 12px;"
            />
            <button
              type="button"
              id="add-subtask-btn"
              style="background: rgba(59, 130, 246, 0.25); border: 1px solid #3b82f6; color: #93c5fd; padding: 7px 14px; border-radius: 3px; font-family: var(--font-hud); font-size: 11px; cursor: pointer;"
            >
              + ADD
            </button>
          </div>

          <div id="subtasks-list-container" style="display: flex; flex-direction: column; gap: 6px; max-height: 160px; overflow-y: auto;">
            <!-- Rendered subtask rows -->
          </div>
        </div>

        <!-- Live Reward Calculation Preview -->
        <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 4px; padding: 12px 14px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
          <span style="font-family: var(--font-hud); font-size: 11px; color: #94a3b8;">
            COMPLETION BOUNTY
          </span>
          <div style="font-family: var(--font-mono); font-size: 13px; font-weight: 700; color: #60a5fa;" id="reward-preview-calc">
            +${initialRewards.xp} XP · +${initialRewards.aetherCoins} AETHER COINS
          </div>
        </div>

        <!-- Action Buttons -->
        <div style="display: flex; justify-content: flex-end; gap: 10px;">
          <button
            type="button"
            id="cancel-modal-btn"
            style="background: transparent; border: 1px solid rgba(255,255,255,0.1); color: #94a3b8; padding: 9px 18px; border-radius: 3px; font-family: var(--font-hud); cursor: pointer;"
          >
            DISMISS
          </button>
          <button
            type="submit"
            id="save-mission-submit"
            style="background: linear-gradient(135deg, #2563eb, #7c3aed); border: 1px solid #818cf8; color: #ffffff; padding: 9px 24px; border-radius: 3px; font-family: var(--font-hud); font-weight: 700; cursor: pointer; letter-spacing: 0.08em;"
          >
            ${isEditing ? 'COMMIT EDITS' : 'INITIALIZE CONTRACT'}
          </button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(modal);

  // Subtasks List Renderer
  function renderSubtasksList() {
    const list = modal.querySelector("#subtasks-list-container");
    const countIndicator = modal.querySelector("#subtask-count-indicator");
    const rewardCalc = modal.querySelector("#reward-preview-calc");

    if (countIndicator) countIndicator.textContent = `${tempSubtasks.length} SUBTASKS`;

    const cat = modal.querySelector("#mission-category-select")?.value || defaultCategory;
    const diff = modal.querySelector("#mission-difficulty-select")?.value || defaultDifficulty;
    const rewards = getCalculatedRewards(diff, cat, tempSubtasks.length);

    if (rewardCalc) {
      rewardCalc.textContent = `+${rewards.xp} XP · +${rewards.aetherCoins} AETHER COINS`;
    }

    if (!list) return;
    if (tempSubtasks.length === 0) {
      list.innerHTML = `<span style="font-size: 11px; color: #64748b; font-style: italic;">No subtasks added yet. Single-step completion.</span>`;
      return;
    }

    list.innerHTML = tempSubtasks.map((st, idx) => `
      <div style="display: flex; align-items: center; justify-content: space-between; background: rgba(15, 23, 42, 0.9); padding: 6px 10px; border-radius: 3px; border: 1px solid rgba(255,255,255,0.06);">
        <span style="font-size: 12px; color: #cbd5e1;">${idx + 1}. ${st.text}</span>
        <button
          type="button"
          class="delete-subtask-btn"
          data-index="${idx}"
          style="background: transparent; border: none; color: #f87171; cursor: pointer; font-size: 14px; line-height: 1;"
        >
          &times;
        </button>
      </div>
    `).join("");

    list.querySelectorAll(".delete-subtask-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const idx = parseInt(btn.getAttribute("data-index"), 10);
        tempSubtasks.splice(idx, 1);
        renderSubtasksList();
      });
    });
  }

  renderSubtasksList();

  // Add Subtask Handler
  const addSubtaskBtn = modal.querySelector("#add-subtask-btn");
  const subtaskInput = modal.querySelector("#new-subtask-input");
  addSubtaskBtn?.addEventListener("click", () => {
    const text = subtaskInput?.value.trim();
    if (text) {
      audio.playClick();
      tempSubtasks.push({
        id: `st_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
        text,
        completed: false,
      });
      subtaskInput.value = "";
      renderSubtasksList();
    }
  });

  // Re-calculate rewards on Difficulty or Category change
  modal.querySelector("#mission-difficulty-select")?.addEventListener("change", renderSubtasksList);
  modal.querySelector("#mission-category-select")?.addEventListener("change", renderSubtasksList);

  // Close modal handler
  modal.querySelector("#cancel-modal-btn")?.addEventListener("click", () => {
    audio.playClick();
    document.body.removeChild(modal);
  });

  // Form Submission
  const form = modal.querySelector("#mission-editor-form");
  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    const title = modal.querySelector("#mission-title-input")?.value.trim();
    if (!title) return;

    audio.playMissionComplete();
    const desc = modal.querySelector("#mission-desc-input")?.value.trim() || "";
    const cat = modal.querySelector("#mission-category-select")?.value || "CUSTOM";
    const diff = modal.querySelector("#mission-difficulty-select")?.value || "D";
    const attr = modal.querySelector("#mission-attribute-select")?.value || "discipline";
    const duration = modal.querySelector("#mission-duration-input")?.value.trim() || "30 MIN";
    const deadline = modal.querySelector("#mission-deadline-input")?.value || null;

    const rewards = getCalculatedRewards(diff, cat, tempSubtasks.length);

    if (isEditing) {
      store.dispatch(
        actions.updateMission(existingMission.id, {
          title,
          description: desc,
          category: cat,
          difficulty: diff,
          attribute: attr,
          estimatedDuration: duration,
          deadline,
          subtasks: tempSubtasks,
          xp: rewards.xp,
          aetherCoins: rewards.aetherCoins,
        })
      );
      store.dispatch(actions.setNotification(`CONTRACT UPDATED // [${title}]`));
    } else {
      store.dispatch(
        actions.createMission({
          title,
          description: desc,
          category: cat,
          difficulty: diff,
          attribute: attr,
          estimatedDuration: duration,
          deadline,
          subtasks: tempSubtasks,
          xp: rewards.xp,
          aetherCoins: rewards.aetherCoins,
          status: "AVAILABLE",
        })
      );
      store.dispatch(actions.setNotification(`NEW DIRECTIVE INITIALIZED // [${title}]`));
    }

    document.body.removeChild(modal);
    onSaved();
  });
}

/**
 * Opens Mission Detail Inspector Modal
 * @param {object} mission
 * @param {Function} onUpdated
 */
export function openMissionDetailModal(mission, onUpdated = () => {}) {
  audio.playClick();
  const modal = document.createElement("div");
  modal.className = "awakening-overlay";
  modal.id = "mission-detail-modal";

  const cat = MISSION_CATEGORIES[mission.category] || MISSION_CATEGORIES.CUSTOM;
  const diff = MISSION_DIFFICULTIES[mission.difficulty] || MISSION_DIFFICULTIES.D;
  const deadlineInfo = evaluateDeadline(mission.deadline);
  const progress = getMissionProgress(mission);

  modal.innerHTML = `
    <div class="awakening-content panel" style="max-width: 620px; width: 92%; max-height: 88vh; overflow-y: auto;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
        <span class="badge" style="background: ${cat.bg}; border: 1px solid ${cat.border}; color: ${cat.color}; font-size: 11px;">
          ${cat.symbol} ${cat.name}
        </span>
        <span class="badge" style="background: rgba(255,255,255,0.06); border: 1px solid ${diff.color}; color: ${diff.color}; font-size: 11px;">
          ${diff.name}
        </span>
      </div>

      <h2 style="font-family: var(--font-display); font-size: 22px; color: #edf5ff; margin: 4px 0 10px;">
        ${mission.title}
      </h2>

      <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6; margin-bottom: 16px;">
        ${mission.description || 'No specialized briefing recorded for this contract.'}
      </p>

      <!-- Mission Vitals Meta -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 8px; margin-bottom: 16px; font-family: var(--font-mono); font-size: 11px;">
        <div style="background: rgba(15, 23, 42, 0.7); padding: 8px 10px; border-radius: 3px; border: 1px solid rgba(255,255,255,0.06);">
          <span style="color: #64748b;">TARGET ATTRIBUTE</span><br/>
          <strong style="color: #93c5fd;">${(mission.attribute || 'discipline').toUpperCase()}</strong>
        </div>
        <div style="background: rgba(15, 23, 42, 0.7); padding: 8px 10px; border-radius: 3px; border: 1px solid rgba(255,255,255,0.06);">
          <span style="color: #64748b;">EST. DURATION</span><br/>
          <strong style="color: #cbd5e1;">${mission.estimatedDuration || '30 MIN'}</strong>
        </div>
        <div style="background: rgba(15, 23, 42, 0.7); padding: 8px 10px; border-radius: 3px; border: 1px solid rgba(255,255,255,0.06);">
          <span style="color: #64748b;">STATUS</span><br/>
          <strong style="color: ${mission.completed ? '#34d399' : '#38bdf8'};">${mission.completed ? 'CLEARED' : (mission.status || 'AVAILABLE')}</strong>
        </div>
      </div>

      <!-- Deadline Alert Bar (if present) -->
      ${deadlineInfo ? `
        <div style="background: rgba(15, 23, 42, 0.8); border: 1px solid ${deadlineInfo.color}; padding: 8px 12px; border-radius: 3px; margin-bottom: 16px; display: flex; align-items: center; justify-content: space-between; font-family: var(--font-hud); font-size: 11px;">
          <span style="color: #94a3b8;">CONTRACT EXPIRATION DEADLINE:</span>
          <strong style="color: ${deadlineInfo.color};">${deadlineInfo.text}</strong>
        </div>
      ` : ''}

      <!-- Subtasks Checklist Section -->
      ${mission.subtasks && mission.subtasks.length > 0 ? `
        <div style="background: rgba(8, 14, 26, 0.75); border: 1px solid rgba(138, 168, 220, 0.2); border-radius: 4px; padding: 14px; margin-bottom: 18px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <span style="font-family: var(--font-hud); font-size: 11px; color: #93c5fd; letter-spacing: 0.08em;">
              MILESTONE SUBTASKS (${progress}% PROGRESS)
            </span>
            <small style="color: #94a3b8; font-family: var(--font-mono); font-size: 11px;">
              ${mission.subtasks.filter((s) => s.completed).length} OF ${mission.subtasks.length} CLEARED
            </small>
          </div>

          <div style="height: 4px; background: rgba(15, 23, 42, 0.8); border-radius: 2px; overflow: hidden; margin-bottom: 12px;">
            <div style="height: 100%; width: ${progress}%; background: linear-gradient(90deg, #3b82f6, #8b5cf6); transition: width 0.3s;"></div>
          </div>

          <div style="display: flex; flex-direction: column; gap: 6px;">
            ${mission.subtasks.map((st) => `
              <label style="display: flex; align-items: center; gap: 10px; background: rgba(15, 23, 42, 0.7); padding: 8px 12px; border-radius: 3px; cursor: ${mission.completed ? 'default' : 'pointer'}; border: 1px solid rgba(255,255,255,0.06);">
                <input
                  type="checkbox"
                  class="detail-subtask-check"
                  data-subtask-id="${st.id}"
                  ${st.completed ? 'checked' : ''}
                  ${mission.completed ? 'disabled' : ''}
                  style="width: 16px; height: 16px; cursor: pointer;"
                />
                <span style="font-size: 13px; color: ${st.completed ? '#94a3b8' : '#e2e8f0'}; text-decoration: ${st.completed ? 'line-through' : 'none'};">
                  ${st.text}
                </span>
              </label>
            `).join("")}
          </div>
        </div>
      ` : ''}

      <!-- Bounty Rewards -->
      <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 4px; padding: 12px 16px; margin-bottom: 20px;">
        <span style="font-family: var(--font-hud); font-size: 11px; color: #94a3b8;">
          CONTRACT BOUNTY
        </span>
        <strong style="color: #60a5fa; font-family: var(--font-mono); font-size: 14px;">
          +${mission.xp} XP · +${mission.aetherCoins || mission.gold} AETHER COINS
        </strong>
      </div>

      <!-- Action Footer -->
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
        <div style="display: flex; gap: 8px;">
          ${mission.deletable !== false && !mission.completed ? `
            <button type="button" id="detail-edit-btn" style="background: rgba(59, 130, 246, 0.2); border: 1px solid #3b82f6; color: #93c5fd; padding: 7px 12px; border-radius: 3px; font-family: var(--font-hud); font-size: 11px; cursor: pointer;">
              EDIT
            </button>
            <button type="button" id="detail-delete-btn" style="background: rgba(239, 68, 68, 0.2); border: 1px solid #ef4444; color: #fca5a5; padding: 7px 12px; border-radius: 3px; font-family: var(--font-hud); font-size: 11px; cursor: pointer;">
              DELETE
            </button>
          ` : ''}

          ${!mission.completed && mission.status === 'ACTIVE' ? `
            <button type="button" id="detail-abandon-btn" style="background: rgba(100, 116, 139, 0.2); border: 1px solid #64748b; color: #cbd5e1; padding: 7px 12px; border-radius: 3px; font-family: var(--font-hud); font-size: 11px; cursor: pointer;">
              PAUSE CONTRACT
            </button>
          ` : ''}
        </div>

        <div style="display: flex; gap: 8px;">
          <button type="button" id="detail-close-btn" style="background: transparent; border: 1px solid rgba(255,255,255,0.1); color: #94a3b8; padding: 8px 16px; border-radius: 3px; font-family: var(--font-hud); cursor: pointer;">
            CLOSE
          </button>

          ${!mission.completed ? `
            <button
              type="button"
              id="detail-complete-btn"
              style="background: linear-gradient(135deg, #10b981, #059669); border: 1px solid #34d399; color: #ffffff; padding: 8px 22px; border-radius: 3px; font-family: var(--font-hud); font-weight: 700; cursor: pointer;"
            >
              CLEAR DIRECTIVE &gt;
            </button>
          ` : ''}
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Bind Subtask Checkbox toggles
  modal.querySelectorAll(".detail-subtask-check").forEach((box) => {
    box.addEventListener("change", () => {
      audio.playClick();
      const stId = box.getAttribute("data-subtask-id");
      store.dispatch(actions.toggleSubtask(mission.id, stId));
      onUpdated();
      // Re-read updated mission to update DOM
      const updated = store.getState().missions.find((m) => m.id === mission.id);
      if (updated) {
        document.body.removeChild(modal);
        openMissionDetailModal(updated, onUpdated);
      }
    });
  });

  // Edit Action
  modal.querySelector("#detail-edit-btn")?.addEventListener("click", () => {
    document.body.removeChild(modal);
    openMissionFormModal(mission, onUpdated);
  });

  // Delete Action
  modal.querySelector("#detail-delete-btn")?.addEventListener("click", () => {
    const confirmDelete = window.confirm(`Permanently terminate contract "${mission.title}"?`);
    if (confirmDelete) {
      audio.playClick();
      store.dispatch(actions.deleteMission(mission.id));
      store.dispatch(actions.setNotification("CONTRACT REMOVED FROM SYSTEM RECORDS"));
      document.body.removeChild(modal);
      onUpdated();
    }
  });

  // Abandon / Pause Action
  modal.querySelector("#detail-abandon-btn")?.addEventListener("click", () => {
    audio.playClick();
    store.dispatch(actions.abandonMission(mission.id));
    store.dispatch(actions.setNotification("CONTRACT PAUSED // RETURNED TO STANDBY"));
    document.body.removeChild(modal);
    onUpdated();
  });

  // Clear / Complete Action
  modal.querySelector("#detail-complete-btn")?.addEventListener("click", () => {
    audio.playMissionComplete();
    store.dispatch(actions.completeMission(mission.id));
    store.dispatch(actions.setNotification(`CONTRACT CLEARED // +${mission.xp} XP GAINED`));
    document.body.removeChild(modal);
    onUpdated();
  });

  // Close Action
  modal.querySelector("#detail-close-btn")?.addEventListener("click", () => {
    audio.playClick();
    document.body.removeChild(modal);
  });
}

