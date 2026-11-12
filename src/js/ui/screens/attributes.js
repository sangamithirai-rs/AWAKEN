/**
 * AWAKEN Attributes Screen (Phase 4)
 * Physical & Astral Stats Calibration & Point Distribution
 * Pure Vanilla JavaScript ES6 Module
 */

import { calculatePowerRating, calculateVitals } from "../../engine/progression.js";
import { getRankFromLevel } from "../../engine/constants.js";
import { actions, store } from "../../engine/state.js";
import { audio } from "../../engine/audio.js";

const ATTRIBUTE_DEFINITIONS = [
  {
    id: "strength",
    name: "STRENGTH",
    type: "PHYSICAL",
    icon: `<svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>`,
    color: "#ef4444",
    bg: "rgba(239, 68, 68, 0.15)",
    border: "rgba(239, 68, 68, 0.4)",
    desc: "Physical output, raw power, kinetic load capacity, and heavy physical training endurance.",
    benefit: "+15 Physical Strike Power · +20 Max Health per point",
  },
  {
    id: "intelligence",
    name: "INTELLIGENCE",
    type: "ASTRAL",
    icon: `<svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none"><path d="M12 2a7 7 0 0 0-7 7c0 2.38 1.19 4.47 3 5.74V17a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-2.26c1.81-1.27 3-3.36 3-5.74a7 7 0 0 0-7-7M9 21h6"></path></svg>`,
    color: "#3b82f6",
    bg: "rgba(59, 130, 246, 0.15)",
    border: "rgba(59, 130, 246, 0.4)",
    desc: "Astral mana reservoir, cognitive processing speed, deep study comprehension, and analytical skill.",
    benefit: "+80 Max Mana · +18 Astral Magic Power per point",
  },
  {
    id: "vitality",
    name: "VITALITY",
    type: "PHYSICAL",
    icon: `<svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path></svg>`,
    color: "#10b981",
    bg: "rgba(16, 185, 129, 0.15)",
    border: "rgba(16, 185, 129, 0.4)",
    desc: "Maximum health pool, metabolic recovery, sleep regeneration rate, and resilience under strain.",
    benefit: "+100 Max Health · +12 Physical Defense per point",
  },
  {
    id: "discipline",
    name: "DISCIPLINE",
    type: "MIND",
    icon: `<svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"></path></svg>`,
    color: "#f59e0b",
    bg: "rgba(245, 158, 11, 0.15)",
    border: "rgba(245, 158, 11, 0.4)",
    desc: "Execution willpower, habit adherence, resistance to distraction, and friction tolerance.",
    benefit: "+6 Defense · Habit Fortification & Daily Protocol Buffs",
  },
  {
    id: "creativity",
    name: "CREATIVITY",
    type: "MIND",
    icon: `<svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none"><path d="M15 14c.2-1 .7-1.7 1.5-2.5M9 14c-.2-1-.7-1.7-1.5-2.5M10 20h4M12 2v2"></path></svg>`,
    color: "#ec4899",
    bg: "rgba(236, 72, 153, 0.15)",
    border: "rgba(236, 72, 153, 0.4)",
    desc: "Divergent problem solving, architectural synthesis, design execution, and systemic vision.",
    benefit: "+8 Astral Magic · Project XP Generation Multiplier",
  },
  {
    id: "focus",
    name: "FOCUS",
    type: "MIND",
    icon: `<svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>`,
    color: "#8b5cf6",
    bg: "rgba(139, 92, 246, 0.15)",
    border: "rgba(139, 92, 246, 0.4)",
    desc: "Sustained attention depth, single-task immersion, flow state entry time, and deep work output.",
    benefit: "+40 Max Mana · +5% Focus Session Multiplier per point",
  },
  {
    id: "consistency",
    name: "CONSISTENCY",
    type: "MIND",
    icon: `<svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path></svg>`,
    color: "#f97316",
    bg: "rgba(249, 115, 22, 0.15)",
    border: "rgba(249, 115, 22, 0.4)",
    desc: "Long-term momentum preservation, streak recovery durability, and compound progression rate.",
    benefit: "+2% Compound XP Bonus · Streak Protection Recovery",
  },
];

export function renderAttributesScreen(container, state, navigate) {
  const rank = getRankFromLevel(state.level);
  const vitals = calculateVitals(state.attributes, state.level);
  const cp = calculatePowerRating(state.level, state.attributes, state.skills?.skillLevels || {});
  const availablePoints = state.skillPoints || 0;

  container.innerHTML = `
    <div class="attributes-screen-container" style="display: flex; flex-direction: column; gap: 24px; max-width: 1100px; margin: 0 auto;">
      
      <!-- Top Overview Bar: Power Rating & Available Points -->
      <section class="panel" style="padding: 24px; position: relative; background: rgba(11, 16, 28, 0.85); border: 1px solid rgba(138, 168, 220, 0.2);">
        <div class="panel-corner corner-tl"></div>
        <div class="panel-corner corner-br"></div>

        <div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 20px;">
          <div>
            <div class="system-label" style="letter-spacing: 0.15em; color: #60a5fa; margin-bottom: 6px;">
              SYSTEM PROTOCOL // STATS CALIBRATION
            </div>
            <h1 style="font-family: var(--font-display); font-size: 26px; color: #edf5ff; margin: 0; display: flex; align-items: center; gap: 12px;">
              ASTRAL & PHYSICAL STATS
              <span class="badge" data-rank="${rank}" style="font-size: 11px;">RANK ${rank}</span>
            </h1>
          </div>

          <div style="display: flex; align-items: center; gap: 18px; flex-wrap: wrap;">
            <!-- Combat Power (CP) -->
            <div style="background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(96, 165, 250, 0.3); padding: 10px 16px; border-radius: 4px; text-align: right;">
              <span style="display: block; font-family: var(--font-hud); font-size: 10px; color: #94a3b8; letter-spacing: 0.12em;">COMBAT RATING (CP)</span>
              <strong style="font-family: var(--font-mono); font-size: 22px; color: #60a5fa; text-shadow: 0 0 12px rgba(96, 165, 250, 0.4);">${cp.toLocaleString()} CP</strong>
            </div>

            <!-- Available Stat Points Banner -->
            <div style="background: ${availablePoints > 0 ? 'rgba(245, 158, 11, 0.18)' : 'rgba(30, 41, 59, 0.5)'}; border: 1px solid ${availablePoints > 0 ? '#f59e0b' : 'rgba(148, 163, 184, 0.2)'}; padding: 10px 18px; border-radius: 4px; display: flex; align-items: center; gap: 12px; box-shadow: ${availablePoints > 0 ? '0 0 20px rgba(245, 158, 11, 0.25)' : 'none'};">
              <div>
                <span style="display: block; font-family: var(--font-hud); font-size: 10px; color: ${availablePoints > 0 ? '#fde68a' : '#94a3b8'}; letter-spacing: 0.12em;">UNALLOCATED POINTS</span>
                <strong style="font-family: var(--font-mono); font-size: 22px; color: ${availablePoints > 0 ? '#fbbf24' : '#e2e8f0'};">${availablePoints} PT</strong>
              </div>
            </div>
          </div>
        </div>

        <!-- Derived Combat Vitals Grid -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; margin-top: 20px; padding-top: 20px; border-top: 1px solid rgba(138, 168, 220, 0.12);">
          <div style="background: rgba(8, 14, 26, 0.6); padding: 10px 12px; border-radius: 4px; border: 1px solid rgba(239, 68, 68, 0.2);">
            <span style="font-family: var(--font-hud); font-size: 10px; color: #f87171; display: block;">MAX HP</span>
            <strong style="font-family: var(--font-mono); font-size: 16px; color: #edf5ff;">${vitals.maxHP}</strong>
          </div>
          <div style="background: rgba(8, 14, 26, 0.6); padding: 10px 12px; border-radius: 4px; border: 1px solid rgba(56, 189, 248, 0.2);">
            <span style="font-family: var(--font-hud); font-size: 10px; color: #38bdf8; display: block;">MAX MP</span>
            <strong style="font-family: var(--font-mono); font-size: 16px; color: #edf5ff;">${vitals.maxMP}</strong>
          </div>
          <div style="background: rgba(8, 14, 26, 0.6); padding: 10px 12px; border-radius: 4px; border: 1px solid rgba(245, 158, 11, 0.2);">
            <span style="font-family: var(--font-hud); font-size: 10px; color: #fbbf24; display: block;">ATTACK POWER</span>
            <strong style="font-family: var(--font-mono); font-size: 16px; color: #edf5ff;">${vitals.attackPower}</strong>
          </div>
          <div style="background: rgba(8, 14, 26, 0.6); padding: 10px 12px; border-radius: 4px; border: 1px solid rgba(168, 85, 247, 0.2);">
            <span style="font-family: var(--font-hud); font-size: 10px; color: #c084fc; display: block;">ASTRAL MAGIC</span>
            <strong style="font-family: var(--font-mono); font-size: 16px; color: #edf5ff;">${vitals.magicPower}</strong>
          </div>
          <div style="background: rgba(8, 14, 26, 0.6); padding: 10px 12px; border-radius: 4px; border: 1px solid rgba(16, 185, 129, 0.2);">
            <span style="font-family: var(--font-hud); font-size: 10px; color: #34d399; display: block;">DEFENSE RESILIENCE</span>
            <strong style="font-family: var(--font-mono); font-size: 16px; color: #edf5ff;">${vitals.defense}</strong>
          </div>
          <div style="background: rgba(8, 14, 26, 0.6); padding: 10px 12px; border-radius: 4px; border: 1px solid rgba(249, 115, 22, 0.2);">
            <span style="font-family: var(--font-hud); font-size: 10px; color: #fb923c; display: block;">FOCUS MODIFIER</span>
            <strong style="font-family: var(--font-mono); font-size: 16px; color: #edf5ff;">${vitals.focusMultiplier}x</strong>
          </div>
        </div>
      </section>

      <!-- Attributes Grid -->
      <section style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px;">
        ${ATTRIBUTE_DEFINITIONS.map((attr) => {
          const val = state.attributes[attr.id] || 1;
          const percentage = Math.min(100, Math.round((val / 50) * 100));

          return `
            <div
              class="panel attribute-card"
              style="padding: 18px; position: relative; background: rgba(11, 16, 28, 0.85); border: 1px solid rgba(138, 168, 220, 0.16); display: flex; flex-direction: column; justify-content: space-between;"
            >
              <div>
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
                  <div style="display: flex; align-items: center; gap: 12px;">
                    <div style="width: 40px; height: 40px; border-radius: 6px; display: flex; align-items: center; justify-content: center; background: ${attr.bg}; border: 1px solid ${attr.border}; color: ${attr.color};">
                      ${attr.icon}
                    </div>
                    <div>
                      <span style="font-family: var(--font-hud); font-size: 9px; color: #94a3b8; letter-spacing: 0.15em;">${attr.type} ATTRIBUTE</span>
                      <h3 style="font-family: var(--font-display); font-size: 17px; color: #edf5ff; margin: 0;">${attr.name}</h3>
                    </div>
                  </div>

                  <div style="text-align: right;">
                    <span style="font-family: var(--font-mono); font-size: 26px; font-weight: 700; color: ${attr.color}; text-shadow: 0 0 10px ${attr.color}66;">
                      ${val}
                    </span>
                  </div>
                </div>

                <p style="font-size: 12px; color: #94a3b8; line-height: 1.5; margin: 0 0 10px;">
                  ${attr.desc}
                </p>

                <div style="background: rgba(8, 14, 26, 0.5); padding: 6px 10px; border-radius: 3px; font-family: var(--font-mono); font-size: 11px; color: #cbd5e1; margin-bottom: 14px; border-left: 2px solid ${attr.color};">
                  ${attr.benefit}
                </div>
              </div>

              <!-- Power Bar & Allocate Action -->
              <div>
                <div style="display: flex; justify-content: space-between; font-size: 10px; color: #64748b; font-family: var(--font-mono); margin-bottom: 4px;">
                  <span>CALIBRATION TIER</span>
                  <span>${val} / 50</span>
                </div>
                <div style="height: 6px; background: rgba(15, 23, 42, 0.9); border-radius: 3px; overflow: hidden; margin-bottom: 14px; border: 1px solid rgba(255, 255, 255, 0.05);">
                  <div style="width: ${percentage}%; height: 100%; background: ${attr.color}; box-shadow: 0 0 8px ${attr.color}88; transition: width 0.4s ease;"></div>
                </div>

                <button
                  type="button"
                  class="allocate-point-btn"
                  data-attribute="${attr.id}"
                  ${availablePoints <= 0 ? 'disabled' : ''}
                  style="width: 100%; padding: 8px 12px; background: ${availablePoints > 0 ? attr.bg : 'rgba(30, 41, 59, 0.3)'}; border: 1px solid ${availablePoints > 0 ? attr.border : 'rgba(148, 163, 184, 0.15)'}; color: ${availablePoints > 0 ? attr.color : '#64748b'}; font-family: var(--font-hud); font-weight: 700; font-size: 12px; border-radius: 4px; cursor: ${availablePoints > 0 ? 'pointer' : 'not-allowed'}; display: flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.2s ease;"
                >
                  <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2.5" fill="none"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                  <span>ALLOCATE STAT POINT</span>
                </button>
              </div>
            </div>
          `;
        }).join("")}
      </section>

      <!-- Return to Command -->
      <div style="text-align: center; margin-top: 10px;">
        <button
          type="button"
          id="btn-return-command"
          style="background: rgba(59, 130, 246, 0.12); border: 1px solid rgba(59, 130, 246, 0.35); color: #93c5fd; padding: 10px 24px; font-family: var(--font-hud); font-weight: 700; border-radius: 4px; cursor: pointer;"
        >
          RETURN TO HUNTER COMMAND
        </button>
      </div>

    </div>
  `;

  // Wire Event Listeners
  const returnBtn = container.querySelector("#btn-return-command");
  if (returnBtn) {
    returnBtn.addEventListener("click", () => {
      audio.playClick();
      navigate("SYSTEM");
    });
  }

  const allocateButtons = container.querySelectorAll(".allocate-point-btn");
  allocateButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const attributeId = e.currentTarget.getAttribute("data-attribute");
      if (!attributeId || state.skillPoints <= 0) return;

      audio.playStatPoint();
      store.dispatch(actions.allocateStatPoint(attributeId));
      store.dispatch(actions.setNotification(`ATTRIBUTE CALIBRATED // ${attributeId.toUpperCase()} +1`));
      
      // Re-render immediately with fresh state
      renderAttributesScreen(container, store.getState(), navigate);
    });
  });
}
