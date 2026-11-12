/**
 * AWAKEN System Home Screen
 * Pure Vanilla JavaScript ES6 Module
 */

import { getRankFromLevel, ROUTES } from "../../engine/constants.js";
import { actions, store } from "../../engine/state.js";
import { audio } from "../../engine/audio.js";

export function renderHomeScreen(container, state, navigate) {
  const rank = getRankFromLevel(state.level);
  const currentLevelXP = state.xp % 1000;
  const xpPercentage = Math.round((currentLevelXP / 1000) * 100);
  const featuredMission = state.missions.find((m) => !m.completed) || state.missions[0];
  const completedCount = state.missions.filter((m) => m.completed).length;
  const clearanceRate = state.missions.length
    ? Math.round((completedCount / state.missions.length) * 100)
    : 0;

  // Dynamic Vitals calculation
  const maxHP = (state.attributes.vitality || 1) * 100 + (state.attributes.strength || 1) * 20 + state.level * 50;
  const maxMP = (state.attributes.intelligence || 1) * 80 + (state.attributes.focus || 1) * 40 + state.level * 30;
  const fatigue = Math.min(100, completedCount * 8);

  container.innerHTML = `
    <section class="main-grid system-dashboard">
      <div class="dashboard-primary-column">
        <!-- System Directive / Active Contract Console -->
        <section class="mission-console panel">
          <div class="mission-console-top">
            <div class="mission-alert">
              <span></span>
              SYSTEM DIRECTIVE // ACTIVE CONTRACT
            </div>
            <span class="mission-date">CLEARANCE: ${clearanceRate}%</span>
          </div>

          <div class="mission-console-body">
            <div class="mission-contract">
              <div class="mission-contract-label">
                ${featuredMission ? `CONTRACT // ${featuredMission.cadence} // ${featuredMission.category}` : "NO ACTIVE CONTRACT"}
              </div>
              <h2>${featuredMission ? featuredMission.title : "ALL CONTRACTS CLEARED"}</h2>
              <p>
                ${featuredMission
                  ? featuredMission.description
                  : "All current directives have been cleared. Access the operations console to initialize new contracts."}
              </p>
              <div class="mission-contract-footer">
                <span>
                  ${featuredMission ? `REWARD: +${featuredMission.xp} XP · +${featuredMission.gold} AETHER` : "HUNTER STATUS: STANDBY"}
                </span>
                <button
                  type="button"
                  class="mission-open-button"
                  id="featured-mission-action"
                  data-mission-id="${featuredMission?.id || ''}"
                >
                  ${featuredMission && !featuredMission.completed
                    ? (featuredMission.kind === 'BOSS' ? 'ADVANCE OBJECTIVE' : 'CLEAR CONTRACT')
                    : 'ACCESS QUEST OPERATIONS'}
                </button>
              </div>
            </div>

            <!-- Clearance Gauge -->
            <div class="mission-clearance">
              <div class="clearance-heading">
                <span>DAILY CLEARANCE</span>
                <strong>${String(clearanceRate).padStart(2, "0")}%</strong>
              </div>
              <div class="clearance-track" role="progressbar" aria-valuenow="${clearanceRate}" aria-valuemin="0" aria-valuemax="100">
                <div style="width: ${clearanceRate}%;"></div>
              </div>
              <div class="clearance-count">
                <strong>${String(completedCount).padStart(2, "0")}</strong>
                <span> CLEARED</span>
                <i></i>
                <strong>${String(state.missions.length - completedCount).padStart(2, "0")}</strong>
                <span> REMAINING</span>
              </div>

              <!-- Next Level Progression -->
              <div class="mission-xp">
                <span>NEXT RANK CAP</span>
                <strong>${currentLevelXP} / 1000 XP</strong>
                <div class="mission-xp-track">
                  <div style="width: ${xpPercentage}%;"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Player Core Status Panel -->
        <section class="player-status panel">
          <div class="panel-corner corner-tl"></div>
          <div class="panel-corner corner-br"></div>

          <div class="section-label">
            <span>01</span>
            HUNTER VITALS & STATUS
          </div>

          <div class="player-core">
            <div class="player-emblem" data-rank="${rank}">
              ${state.profile.name.slice(0, 2).toUpperCase()}
            </div>
            <div class="player-name">
              <span>HUNTER IDENTITY</span>
              <h2>${state.profile.name}</h2>
              <small style="color: #93c5fd; font-family: var(--font-hud); letter-spacing: 0.1em;">
                ${state.profile.hunterClass} // ${state.profile.specialization}
              </small>
            </div>
          </div>

          <div class="level-display">
            <div>
              <span>LEVEL</span>
              <strong>${String(state.level).padStart(2, "0")}</strong>
            </div>
            <div class="rank-display" data-rank="${rank}">
              <span>RANK</span>
              <strong>${rank}</strong>
            </div>
          </div>

          <!-- Dynamic Resource Gauges (HP, MP, Fatigue) -->
          <div class="player-vitals">
            <div class="vital-gauge vital-hp">
              <div class="vital-header">
                <span>HP [HEALTH POOL]</span>
                <strong>${maxHP} / ${maxHP}</strong>
              </div>
              <div class="vital-track">
                <div class="vital-fill vital-fill-hp" style="width: 100%;"></div>
              </div>
            </div>

            <div class="vital-gauge vital-mp">
              <div class="vital-header">
                <span>MP [MANA CAPACITY]</span>
                <strong>${maxMP} / ${maxMP}</strong>
              </div>
              <div class="vital-track">
                <div class="vital-fill vital-fill-mp" style="width: 100%;"></div>
              </div>
            </div>

            <div class="vital-gauge vital-fatigue">
              <div class="vital-header">
                <span>FATIGUE [EXERTION]</span>
                <strong>${fatigue}%</strong>
              </div>
              <div class="vital-track">
                <div class="vital-fill vital-fill-fatigue" style="width: ${fatigue}%;"></div>
              </div>
            </div>
          </div>

          <!-- Attributes Breakdown -->
          <div class="attributes">
            <div class="section-label">
              <span>02</span>
              CORE ATTRIBUTES
            </div>

            ${Object.entries(state.attributes).map(([attr, val]) => `
              <div class="attribute">
                <span>${attr.toUpperCase()}</span>
                <div class="attribute-dots">
                  ${Array.from({ length: 10 }).map((_, i) => `
                    <i class="${i < val ? 'active' : ''}"></i>
                  `).join("")}
                </div>
                <strong>${val}</strong>
              </div>
            `).join("")}
          </div>
        </section>
      </div>

      <div class="dashboard-secondary-column">
        <!-- Quick Missions Preview -->
        <section class="panel quest-board">
          <div class="quest-board-header">
            <div>
              <span class="system-label">ACTIVE CONTRACTS</span>
              <h2>DIRECTIVES</h2>
            </div>
            <button type="button" class="filter-tab active" data-action="go-missions">ALL MISSIONS</button>
          </div>

          <div class="quest-list">
            ${state.missions.slice(0, 4).map((m) => `
              <div class="quest-card ${m.completed ? 'completed' : ''}" data-mission-id="${m.id}">
                <div class="quest-card-top">
                  <span class="category-tag">${m.category || 'QUEST'}</span>
                  <span class="badge" style="font-size: 10px;">${m.priority}</span>
                </div>
                <h3>${m.title}</h3>
                <p>${m.description}</p>
                <div class="quest-card-footer">
                  <span style="font-family: var(--font-mono); font-size: 11px; color: #60a5fa;">
                    +${m.xp} XP · +${m.gold} AETHER
                  </span>
                  <button
                    type="button"
                    class="quest-complete-button ${m.completed ? 'completed' : ''}"
                    data-action="complete-mission"
                    data-mission-id="${m.id}"
                    ${m.completed ? 'disabled' : ''}
                  >
                    ${m.completed ? 'CLEARED' : (m.kind === 'BOSS' ? `HIT (${m.currentCount || 0}/${m.goalCount})` : 'CLEAR')}
                  </button>
                </div>
              </div>
            `).join("")}
          </div>
        </section>
      </div>
    </section>
  `;

  // Attach event handlers
  const actionBtn = container.querySelector("#featured-mission-action");
  if (actionBtn) {
    actionBtn.addEventListener("click", () => {
      if (featuredMission && !featuredMission.completed) {
        audio.playMissionComplete();
        if (featuredMission.kind === "BOSS") {
          store.dispatch(actions.advanceBossMission(featuredMission.id));
        } else {
          store.dispatch(actions.completeMission(featuredMission.id));
        }
        store.dispatch(actions.setNotification(`CONTRACT CLEARED // +${featuredMission.xp} XP`));
      } else {
        navigate(ROUTES.MISSIONS);
      }
    });
  }

  container.addEventListener("click", (e) => {
    const completeBtn = e.target.closest("[data-action='complete-mission']");
    if (completeBtn && !completeBtn.disabled) {
      const missionId = completeBtn.getAttribute("data-mission-id");
      const mission = state.missions.find((m) => m.id === missionId);
      if (mission) {
        audio.playMissionComplete();
        if (mission.kind === "BOSS") {
          store.dispatch(actions.advanceBossMission(missionId));
        } else {
          store.dispatch(actions.completeMission(missionId));
        }
        store.dispatch(actions.setNotification(`DIRECTIVE CLEARED // +${mission.xp} XP`));
      }
      return;
    }

    const goMissions = e.target.closest("[data-action='go-missions']");
    if (goMissions) {
      navigate(ROUTES.MISSIONS);
    }
  });
}

