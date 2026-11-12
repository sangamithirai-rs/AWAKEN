/**
 * AWAKEN Missions & Custom Contract Console Screen
 * Pure Vanilla JavaScript ES6 Module
 */

import {
  MISSION_CATEGORIES,
  MISSION_DIFFICULTIES,
  evaluateDeadline,
  getMissionProgress,
} from "../../engine/missions.js";
import { actions, store } from "../../engine/state.js";
import { audio } from "../../engine/audio.js";
import {
  openMissionDetailModal,
  openMissionFormModal,
} from "../components/missionModal.js";

export function renderMissionsScreen(container, state, navigate) {
  let activeCategoryFilter = "ALL";
  let activeStatusFilter = "ALL";
  let activeSort = "DIFFICULTY";
  let searchQuery = "";

  function renderView() {
    const currentState = store.getState();
    const allMissions = currentState.missions || [];

    // Filter by Category
    let filtered = allMissions.filter((m) => {
      if (activeCategoryFilter !== "ALL" && m.category !== activeCategoryFilter) {
        return false;
      }
      // Filter by Status
      if (activeStatusFilter === "COMPLETED" && !m.completed) return false;
      if (activeStatusFilter === "ACTIVE" && (m.completed || m.status !== "ACTIVE")) return false;
      if (activeStatusFilter === "AVAILABLE" && (m.completed || m.status === "ACTIVE")) return false;

      // Filter by Search
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = m.title.toLowerCase().includes(query);
        const matchesDesc = (m.description || "").toLowerCase().includes(query);
        if (!matchesTitle && !matchesDesc) return false;
      }

      return true;
    });

    // Sort
    filtered.sort((a, b) => {
      if (activeSort === "REWARD") {
        return (b.xp || 0) - (a.xp || 0);
      }
      if (activeSort === "DIFFICULTY") {
        const order = { S: 6, A: 5, B: 4, C: 3, D: 2, E: 1 };
        return (order[b.difficulty] || 0) - (order[a.difficulty] || 0);
      }
      if (activeSort === "DEADLINE") {
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      }
      // NEWEST
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });

    const completedTotal = allMissions.filter((m) => m.completed).length;

    container.innerHTML = `
      <section class="panel quest-board-page" style="padding: 24px;">
        <!-- Header & Action Row -->
        <div class="quest-board-header" style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 16px; margin-bottom: 20px;">
          <div>
            <span class="system-label" style="letter-spacing: 0.15em; color: #60a5fa;">
              HUNTER OPERATIONS // CONTRACT CONSOLE
            </span>
            <h2 style="font-family: var(--font-display); font-size: 26px; color: #edf5ff; margin: 4px 0;">
              CLASSIFIED DIRECTIVES
            </h2>
            <small style="color: #94a3b8; font-family: var(--font-mono); font-size: 11px;">
              ${completedTotal} OF ${allMissions.length} CONTRACTS CLEARED
            </small>
          </div>

          <button
            type="button"
            id="open-create-contract-btn"
            style="background: linear-gradient(135deg, #2563eb, #7c3aed); border: 1px solid #818cf8; color: #ffffff; padding: 10px 22px; font-family: var(--font-hud); font-weight: 700; font-size: 12px; cursor: pointer; border-radius: 4px; box-shadow: 0 0 20px rgba(59, 130, 246, 0.4); letter-spacing: 0.08em;"
          >
            + INITIALIZE NEW CONTRACT
          </button>
        </div>

        <!-- Category Filter Tabs -->
        <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 16px; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 12px;">
          <button
            type="button"
            class="filter-tab ${activeCategoryFilter === 'ALL' ? 'active' : ''}"
            data-cat="ALL"
          >
            ALL CATEGORIES (${allMissions.length})
          </button>
          ${Object.values(MISSION_CATEGORIES).map((cat) => {
            const count = allMissions.filter((m) => m.category === cat.id).length;
            return `
              <button
                type="button"
                class="filter-tab ${activeCategoryFilter === cat.id ? 'active' : ''}"
                data-cat="${cat.id}"
                style="color: ${activeCategoryFilter === cat.id ? cat.color : '#94a3b8'};"
              >
                ${cat.symbol} ${cat.short} (${count})
              </button>
            `;
          }).join("")}
        </div>

        <!-- Search, Filter & Sort Controls -->
        <div style="display: flex; gap: 12px; flex-wrap: wrap; align-items: center; justify-content: space-between; margin-bottom: 20px;">
          <!-- Search input -->
          <div style="flex: 1; min-width: 220px;">
            <input
              type="text"
              id="mission-search-input"
              value="${searchQuery}"
              placeholder="Search contracts by keyword..."
              style="width: 100%; background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(138, 168, 220, 0.2); color: #edf5ff; padding: 8px 12px; border-radius: 3px; font-size: 13px;"
            />
          </div>

          <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
            <!-- Status Filter -->
            <select
              id="mission-status-filter"
              style="background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(138, 168, 220, 0.2); color: #edf5ff; padding: 7px 10px; border-radius: 3px; font-family: var(--font-hud); font-size: 11px;"
            >
              <option value="ALL" ${activeStatusFilter === 'ALL' ? 'selected' : ''}>STATUS: ALL</option>
              <option value="AVAILABLE" ${activeStatusFilter === 'AVAILABLE' ? 'selected' : ''}>STATUS: AVAILABLE</option>
              <option value="ACTIVE" ${activeStatusFilter === 'ACTIVE' ? 'selected' : ''}>STATUS: ACTIVE</option>
              <option value="COMPLETED" ${activeStatusFilter === 'COMPLETED' ? 'selected' : ''}>STATUS: CLEARED</option>
            </select>

            <!-- Sort By -->
            <select
              id="mission-sort-select"
              style="background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(138, 168, 220, 0.2); color: #edf5ff; padding: 7px 10px; border-radius: 3px; font-family: var(--font-hud); font-size: 11px;"
            >
              <option value="DIFFICULTY" ${activeSort === 'DIFFICULTY' ? 'selected' : ''}>SORT: THREAT (HIGH TO LOW)</option>
              <option value="REWARD" ${activeSort === 'REWARD' ? 'selected' : ''}>SORT: HIGHEST BOUNTY</option>
              <option value="DEADLINE" ${activeSort === 'DEADLINE' ? 'selected' : ''}>SORT: DEADLINE SOONEST</option>
              <option value="NEWEST" ${activeSort === 'NEWEST' ? 'selected' : ''}>SORT: NEWEST FIRST</option>
            </select>
          </div>
        </div>

        <!-- Mission Cards Grid -->
        <div class="quest-list" id="missions-grid-container" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px;">
          ${filtered.length === 0 ? `
            <div style="grid-column: 1 / -1; padding: 48px 16px; text-align: center; background: rgba(8, 14, 26, 0.5); border: 1px dashed rgba(255,255,255,0.1); border-radius: 4px;">
              <span class="system-label" style="color: #64748b;">NO MATCHING DIRECTIVES</span>
              <p style="color: #94a3b8; font-size: 13px; margin: 8px 0 16px;">
                No contracts match the current search filters or category parameters.
              </p>
              <button
                type="button"
                id="empty-create-btn"
                style="background: rgba(59, 130, 246, 0.2); border: 1px solid #3b82f6; color: #93c5fd; padding: 8px 16px; border-radius: 3px; font-family: var(--font-hud); font-size: 11px; cursor: pointer;"
              >
                + INITIALIZE NEW CONTRACT
              </button>
            </div>
          ` : filtered.map((m) => {
            const cat = MISSION_CATEGORIES[m.category] || MISSION_CATEGORIES.CUSTOM;
            const diff = MISSION_DIFFICULTIES[m.difficulty] || MISSION_DIFFICULTIES.D;
            const deadlineInfo = evaluateDeadline(m.deadline);
            const progress = getMissionProgress(m);

            return `
              <div
                class="quest-card ${m.completed ? 'completed' : ''}"
                data-id="${m.id}"
                style="background: rgba(8, 14, 26, 0.78); border: 1px solid ${m.completed ? 'rgba(52, 211, 153, 0.4)' : 'rgba(138, 168, 220, 0.18)'}; border-radius: 4px; padding: 16px; display: flex; flex-direction: column; justify-content: space-between; transition: all 0.2s;"
              >
                <div>
                  <!-- Card Top Badges -->
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <span class="badge" style="background: ${cat.bg}; border: 1px solid ${cat.border}; color: ${cat.color}; font-size: 10px;">
                      ${cat.symbol} ${cat.name}
                    </span>
                    <span class="badge" style="border: 1px solid ${diff.color}; color: ${diff.color}; font-size: 10px; font-family: var(--font-mono);">
                      ${diff.name}
                    </span>
                  </div>

                  <!-- Title -->
                  <h3 style="font-family: var(--font-display); font-size: 15px; color: ${m.completed ? '#94a3b8' : '#edf5ff'}; margin: 0 0 6px; line-height: 1.3;">
                    ${m.title}
                  </h3>

                  <!-- Description -->
                  <p style="font-size: 12px; color: #94a3b8; line-height: 1.5; margin: 0 0 12px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                    ${m.description || 'No specialized briefing.'}
                  </p>

                  <!-- Deadline Alert Tag (if applicable) -->
                  ${deadlineInfo ? `
                    <div style="display: inline-flex; align-items: center; gap: 4px; font-family: var(--font-hud); font-size: 10px; color: ${deadlineInfo.color}; margin-bottom: 10px;">
                      <span>⏳</span>
                      <strong>${deadlineInfo.text}</strong>
                    </div>
                  ` : ''}

                  <!-- Subtasks Progress Bar -->
                  ${m.subtasks && m.subtasks.length > 0 ? `
                    <div style="margin-bottom: 12px;">
                      <div style="display: flex; justify-content: space-between; font-size: 10px; font-family: var(--font-mono); color: #94a3b8; margin-bottom: 3px;">
                        <span>SUBTASKS</span>
                        <span>${progress}%</span>
                      </div>
                      <div style="height: 3px; background: rgba(15, 23, 42, 0.8); border-radius: 2px; overflow: hidden;">
                        <div style="height: 100%; width: ${progress}%; background: linear-gradient(90deg, #38bdf8, #818cf8);"></div>
                      </div>
                    </div>
                  ` : ''}
                </div>

                <!-- Footer & Action Buttons -->
                <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 12px; margin-top: 8px;">
                  <span style="font-family: var(--font-mono); font-size: 11px; font-weight: 700; color: #60a5fa;">
                    +${m.xp} XP · +${m.aetherCoins || m.gold} AC
                  </span>

                  <div style="display: flex; gap: 6px;">
                    <button
                      type="button"
                      class="inspect-mission-btn"
                      data-id="${m.id}"
                      style="background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(255,255,255,0.12); color: #cbd5e1; padding: 6px 10px; font-family: var(--font-hud); font-size: 10px; cursor: pointer; border-radius: 3px;"
                    >
                      INSPECT
                    </button>

                    <button
                      type="button"
                      class="clear-mission-btn ${m.completed ? 'completed' : ''}"
                      data-id="${m.id}"
                      ${m.completed ? 'disabled' : ''}
                      style="background: ${m.completed ? 'rgba(52, 211, 153, 0.2)' : 'linear-gradient(135deg, #2563eb, #1d4ed8)'}; border: 1px solid ${m.completed ? '#34d399' : '#3b82f6'}; color: ${m.completed ? '#34d399' : '#ffffff'}; padding: 6px 12px; font-family: var(--font-hud); font-size: 10px; font-weight: 700; cursor: ${m.completed ? 'default' : 'pointer'}; border-radius: 3px;"
                    >
                      ${m.completed ? 'CLEARED' : (m.kind === 'BOSS' ? `HIT (${m.currentCount || 0}/${m.goalCount})` : 'CLEAR')}
                    </button>
                  </div>
                </div>
              </div>
            `;
          }).join("")}
        </div>
      </section>
    `;

    // Bind Category Filter clicks
    container.querySelectorAll(".filter-tab").forEach((btn) => {
      btn.addEventListener("click", () => {
        audio.playClick();
        activeCategoryFilter = btn.getAttribute("data-cat");
        renderView();
      });
    });

    // Search input
    const searchInput = container.querySelector("#mission-search-input");
    searchInput?.addEventListener("input", (e) => {
      searchQuery = e.target.value.trim();
      renderView();
      // Keep focus on input after re-render
      const reInput = container.querySelector("#mission-search-input");
      if (reInput) {
        reInput.focus();
        reInput.selectionStart = reInput.selectionEnd = reInput.value.length;
      }
    });

    // Status filter
    const statusSelect = container.querySelector("#mission-status-filter");
    statusSelect?.addEventListener("change", (e) => {
      audio.playClick();
      activeStatusFilter = e.target.value;
      renderView();
    });

    // Sort select
    const sortSelect = container.querySelector("#mission-sort-select");
    sortSelect?.addEventListener("change", (e) => {
      audio.playClick();
      activeSort = e.target.value;
      renderView();
    });

    // Create contract button
    const openCreateBtn = container.querySelector("#open-create-contract-btn");
    const emptyCreateBtn = container.querySelector("#empty-create-btn");
    const handleOpenCreate = () => {
      openMissionFormModal(null, () => renderView());
    };
    openCreateBtn?.addEventListener("click", handleOpenCreate);
    emptyCreateBtn?.addEventListener("click", handleOpenCreate);

    // Inspect buttons
    container.querySelectorAll(".inspect-mission-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        const mission = store.getState().missions.find((m) => m.id === id);
        if (mission) {
          openMissionDetailModal(mission, () => renderView());
        }
      });
    });

    // Clear Contract buttons
    container.querySelectorAll(".clear-mission-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (btn.disabled) return;
        const id = btn.getAttribute("data-id");
        const mission = store.getState().missions.find((m) => m.id === id);
        if (mission) {
          audio.playMissionComplete();
          if (mission.kind === "BOSS") {
            store.dispatch(actions.advanceBossMission(id));
            store.dispatch(actions.setNotification(`BOSS HIT REGISTERED // [${mission.title}]`));
          } else {
            store.dispatch(actions.completeMission(id));
            store.dispatch(actions.setNotification(`CONTRACT CLEARED // +${mission.xp} XP · +${mission.aetherCoins || mission.gold} AC`));
          }
          renderView();
        }
      });
    });
  }

  renderView();
}

