/**
 * AWAKEN Skills Screen (Phase 4)
 * Interactive 5-Branch Hunter Skill Tree
 * Pure Vanilla JavaScript ES6 Module
 */

import { getRankFromLevel } from "../../engine/constants.js";
import { actions, store } from "../../engine/state.js";
import { audio } from "../../engine/audio.js";

const SKILL_BRANCHES = [
  {
    id: "WARRIOR",
    name: "WARRIOR",
    tagline: "KINETIC POWER & METABOLIC ENDURANCE",
    accent: "#ef4444",
    bg: "rgba(239, 68, 68, 0.12)",
    border: "rgba(239, 68, 68, 0.4)",
    icon: `<svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" stroke-width="2" fill="none"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>`,
    nodes: [
      {
        id: "WARRIOR_FOUNDATION",
        name: "IRON WILL",
        tier: "FOUNDATION",
        requiredLevel: 1,
        maxLevel: 3,
        desc: "Hardens physical conditioning through consistent repetitive training.",
        buff: "+8% XP from all physical & fitness directives per rank.",
      },
      {
        id: "WARRIOR_MASTERY",
        name: "HEAVY STRIKE",
        tier: "MASTERY",
        requiredLevel: 5,
        prerequisite: "WARRIOR_FOUNDATION",
        maxLevel: 3,
        desc: "Converts intense effort into massive kinetic output and stamina buffs.",
        buff: "+25 Physical Attack Power · +50 Max HP per rank.",
      },
      {
        id: "WARRIOR_ASCENDANT",
        name: "MONARCH'S COLOSSUS",
        tier: "ASCENDANT",
        requiredLevel: 15,
        prerequisite: "WARRIOR_MASTERY",
        maxLevel: 3,
        desc: "Radiates an intimidating sovereign aura that eliminates workout friction.",
        buff: "+20% Total Physical Stats · Immunity to streak fatigue decay.",
      },
    ],
  },
  {
    id: "SCHOLAR",
    name: "SCHOLAR",
    tagline: "COGNITIVE SPEED & ASTRAL ANALYSIS",
    accent: "#3b82f6",
    bg: "rgba(59, 130, 246, 0.12)",
    border: "rgba(59, 130, 246, 0.4)",
    icon: `<svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" stroke-width="2" fill="none"><path d="M12 2a7 7 0 0 0-7 7c0 2.38 1.19 4.47 3 5.74V17a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-2.26c1.81-1.27 3-3.36 3-5.74a7 7 0 0 0-7-7M9 21h6"></path></svg>`,
    nodes: [
      {
        id: "SCHOLAR_FOUNDATION",
        name: "RAPID COMPREHENSION",
        tier: "FOUNDATION",
        requiredLevel: 1,
        maxLevel: 3,
        desc: "Accelerates reading absorption rate and conceptual retention.",
        buff: "+8% XP from study, research, and documentation directives.",
      },
      {
        id: "SCHOLAR_MASTERY",
        name: "MIND FORTRESS",
        tier: "MASTERY",
        requiredLevel: 5,
        prerequisite: "SCHOLAR_FOUNDATION",
        maxLevel: 3,
        desc: "Shields cognitive faculties from information overload and mental exhaustion.",
        buff: "+60 Max Mana · +15 Astral Magic Power per rank.",
      },
      {
        id: "SCHOLAR_ASCENDANT",
        name: "OMNISCIENT GAZE",
        tier: "ASCENDANT",
        requiredLevel: 15,
        prerequisite: "SCHOLAR_MASTERY",
        maxLevel: 3,
        desc: "Unlocks instant pattern recognition across multidimensional problems.",
        buff: "+25% Study Milestone Rewards · Unlocks Dimensional Archives.",
      },
    ],
  },
  {
    id: "SHADOW_HUNTER",
    name: "SHADOW HUNTER",
    tagline: "TECHNICAL CODING & PRECISION EXECUTION",
    accent: "#a855f7",
    bg: "rgba(168, 85, 247, 0.12)",
    border: "rgba(168, 85, 247, 0.4)",
    icon: `<svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" stroke-width="2" fill="none"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>`,
    nodes: [
      {
        id: "SHADOW_FOUNDATION",
        name: "ALGORITHMIC INSTINCT",
        tier: "FOUNDATION",
        requiredLevel: 1,
        maxLevel: 3,
        desc: "Enhances logical intuition when building software and fixing complex bugs.",
        buff: "+10% XP from all technical & coding directives per rank.",
      },
      {
        id: "SHADOW_MASTERY",
        name: "SHADOW EXTRACTION",
        tier: "MASTERY",
        requiredLevel: 5,
        prerequisite: "SHADOW_FOUNDATION",
        maxLevel: 3,
        desc: "Extracts completed tasks into autonomous background momentum soldiers.",
        buff: "+35 Aether Coins bonus on every completed technical directive.",
      },
      {
        id: "SHADOW_ASCENDANT",
        name: "MONARCH OVERDRIVE",
        tier: "ASCENDANT",
        requiredLevel: 15,
        prerequisite: "SHADOW_MASTERY",
        maxLevel: 3,
        desc: "Commands the full army of your cumulative software engineering achievements.",
        buff: "+30% All Rewards · Unlocks classified S-Rank coding campaigns.",
      },
    ],
  },
  {
    id: "ARCHITECT",
    name: "ARCHITECT",
    tagline: "PROJECT SYNTHESIS & SYSTEM DESIGN",
    accent: "#ec4899",
    bg: "rgba(236, 72, 153, 0.12)",
    border: "rgba(236, 72, 153, 0.4)",
    icon: `<svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" stroke-width="2" fill="none"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>`,
    nodes: [
      {
        id: "ARCHITECT_FOUNDATION",
        name: "BLUEPRINT MASTERY",
        tier: "FOUNDATION",
        requiredLevel: 1,
        maxLevel: 3,
        desc: "Structures multi-phase endeavors into actionable execution roadmaps.",
        buff: "+8% XP on long-term project and portfolio directives.",
      },
      {
        id: "ARCHITECT_MASTERY",
        name: "MATRIX CONSTRUCTOR",
        tier: "MASTERY",
        requiredLevel: 5,
        prerequisite: "ARCHITECT_FOUNDATION",
        maxLevel: 3,
        desc: "Generates optimal workflows that eliminate cognitive architectural drag.",
        buff: "+20% Project Milestone Gold · +15 Creativity rating.",
      },
      {
        id: "ARCHITECT_ASCENDANT",
        name: "REALITY BLUEPRINT",
        tier: "ASCENDANT",
        requiredLevel: 15,
        prerequisite: "ARCHITECT_MASTERY",
        maxLevel: 3,
        desc: "Bends external environment constraints into compliant development engines.",
        buff: "+30% Project Speed · Unlocks Custom Boss Instance creator.",
      },
    ],
  },
  {
    id: "PHANTOM",
    name: "PHANTOM",
    tagline: "DEEP FOCUS IMMERSION & DISCIPLINE",
    accent: "#f59e0b",
    bg: "rgba(245, 158, 11, 0.12)",
    border: "rgba(245, 158, 11, 0.4)",
    icon: `<svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" stroke-width="2" fill="none"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`,
    nodes: [
      {
        id: "PHANTOM_FOUNDATION",
        name: "TEMPORAL HYPERFOCUS",
        tier: "FOUNDATION",
        requiredLevel: 1,
        maxLevel: 3,
        desc: "Locks attention into uninterrupted focus sessions with zero tab switching.",
        buff: "+10% Focus session XP and stamina multiplier per rank.",
      },
      {
        id: "PHANTOM_MASTERY",
        name: "DISCIPLINE ANCHOR",
        tier: "MASTERY",
        requiredLevel: 5,
        prerequisite: "PHANTOM_FOUNDATION",
        maxLevel: 3,
        desc: "Anchors streak momentum against mood fluctuations and tiredness.",
        buff: "+1 Free Streak Recovery Credit earned every Monday.",
      },
      {
        id: "PHANTOM_ASCENDANT",
        name: "TIME DILATION DOMAIN",
        tier: "ASCENDANT",
        requiredLevel: 15,
        prerequisite: "PHANTOM_MASTERY",
        maxLevel: 3,
        desc: "Perceives subjective hours inside objective 25-minute Pomodoro sprints.",
        buff: "+50% Focus Output · Full Fatigue Resistance in focus sessions.",
      },
    ],
  },
];

let selectedBranchId = "WARRIOR";

export function renderSkillsScreen(container, state, navigate) {
  const rank = getRankFromLevel(state.level);
  const skillPoints = state.skillPoints || 0;
  const skillLevels = state.skills?.skillLevels || {};

  const currentBranch = SKILL_BRANCHES.find((b) => b.id === selectedBranchId) || SKILL_BRANCHES[0];

  container.innerHTML = `
    <div class="skills-screen-container" style="display: flex; flex-direction: column; gap: 24px; max-width: 1100px; margin: 0 auto;">
      
      <!-- Top Skills Overview -->
      <section class="panel" style="padding: 24px; position: relative; background: rgba(11, 16, 28, 0.85); border: 1px solid rgba(138, 168, 220, 0.2);">
        <div class="panel-corner corner-tl"></div>
        <div class="panel-corner corner-br"></div>

        <div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 20px;">
          <div>
            <div class="system-label" style="letter-spacing: 0.15em; color: #a855f7; margin-bottom: 6px;">
              SYSTEM TREE // HUNTER SKILL ASCENSION
            </div>
            <h1 style="font-family: var(--font-display); font-size: 26px; color: #edf5ff; margin: 0; display: flex; align-items: center; gap: 12px;">
              5-BRANCH ASCENDANT MATRIX
              <span class="badge" data-rank="${rank}" style="font-size: 11px;">RANK ${rank}</span>
            </h1>
          </div>

          <div style="display: flex; align-items: center; gap: 16px;">
            <div style="background: ${skillPoints > 0 ? 'rgba(168, 85, 247, 0.18)' : 'rgba(30, 41, 59, 0.5)'}; border: 1px solid ${skillPoints > 0 ? '#a855f7' : 'rgba(148, 163, 184, 0.2)'}; padding: 10px 18px; border-radius: 4px; display: flex; align-items: center; gap: 12px; box-shadow: ${skillPoints > 0 ? '0 0 20px rgba(168, 85, 247, 0.25)' : 'none'};">
              <div>
                <span style="display: block; font-family: var(--font-hud); font-size: 10px; color: ${skillPoints > 0 ? '#e9d5ff' : '#94a3b8'}; letter-spacing: 0.12em;">AVAILABLE SKILL POINTS</span>
                <strong style="font-family: var(--font-mono); font-size: 22px; color: ${skillPoints > 0 ? '#c084fc' : '#e2e8f0'};">${skillPoints} SP</strong>
              </div>
            </div>
          </div>
        </div>

        <!-- Branch Selector Tabs -->
        <div style="display: flex; gap: 10px; margin-top: 22px; overflow-x: auto; padding-bottom: 4px;">
          ${SKILL_BRANCHES.map((b) => {
            const isSelected = b.id === selectedBranchId;
            return `
              <button
                type="button"
                class="branch-tab-btn"
                data-branch="${b.id}"
                style="display: flex; align-items: center; gap: 10px; padding: 10px 16px; border-radius: 4px; border: 1px solid ${isSelected ? b.accent : 'rgba(138, 168, 220, 0.16)'}; background: ${isSelected ? b.bg : 'rgba(8, 14, 26, 0.5)'}; color: ${isSelected ? b.accent : '#94a3b8'}; font-family: var(--font-hud); font-weight: 700; cursor: pointer; white-space: nowrap; transition: all 0.2s ease;"
              >
                ${b.icon}
                <span>${b.name}</span>
              </button>
            `;
          }).join("")}
        </div>
      </section>

      <!-- Active Branch Tree Display -->
      <section class="panel" style="padding: 24px; position: relative; background: rgba(11, 16, 28, 0.85); border: 1px solid ${currentBranch.border}; box-shadow: 0 0 30px ${currentBranch.accent}15;">
        <div class="panel-corner corner-tl"></div>
        <div class="panel-corner corner-br"></div>

        <div style="margin-bottom: 24px; border-bottom: 1px solid rgba(138, 168, 220, 0.12); padding-bottom: 16px;">
          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 6px;">
            <div style="color: ${currentBranch.accent};">${currentBranch.icon}</div>
            <h2 style="font-family: var(--font-display); font-size: 20px; color: #edf5ff; margin: 0;">${currentBranch.name} ASCENSION</h2>
          </div>
          <span style="font-family: var(--font-hud); font-size: 11px; color: ${currentBranch.accent}; letter-spacing: 0.15em;">
            ${currentBranch.tagline}
          </span>
        </div>

        <!-- 3 Tier Nodes Cascade -->
        <div style="display: flex; flex-direction: column; gap: 18px;">
          ${currentBranch.nodes.map((node, index) => {
            const currentLevel = skillLevels[node.id] || 0;
            const isUnlocked = currentLevel > 0;
            const isMaxed = currentLevel >= node.maxLevel;
            const meetsLevelReq = state.level >= node.requiredLevel;
            const meetsPrereq = !node.prerequisite || (skillLevels[node.prerequisite] || 0) > 0;
            const canUnlock = meetsLevelReq && meetsPrereq && !isMaxed && skillPoints > 0;

            let statusLabel = "";
            let statusColor = "#64748b";

            if (isMaxed) {
              statusLabel = "RANK MAXED";
              statusColor = "#10b981";
            } else if (isUnlocked) {
              statusLabel = `RANK ${currentLevel}/${node.maxLevel} ACTIVE`;
              statusColor = currentBranch.accent;
            } else if (!meetsLevelReq) {
              statusLabel = `LOCKED // REQUIRES LV. ${node.requiredLevel}`;
              statusColor = "#ef4444";
            } else if (!meetsPrereq) {
              statusLabel = `LOCKED // REQUIRES PREREQUISITE`;
              statusColor = "#f59e0b";
            } else {
              statusLabel = "AVAILABLE TO UNLOCK";
              statusColor = "#93c5fd";
            }

            return `
              <div
                class="skill-node-card"
                style="display: flex; flex-direction: column; gap: 12px; padding: 18px; border-radius: 4px; background: rgba(8, 14, 26, 0.7); border: 1px solid ${isUnlocked ? currentBranch.accent : 'rgba(138, 168, 220, 0.14)'}; box-shadow: ${isUnlocked ? `0 0 15px ${currentBranch.accent}25` : 'none'};"
              >
                <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; flex-wrap: wrap;">
                  <div>
                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 4px;">
                      <span class="badge" style="font-size: 9px; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); color: #94a3b8;">
                        TIER 0${index + 1} // ${node.tier}
                      </span>
                      <span style="font-family: var(--font-hud); font-size: 10px; font-weight: 700; color: ${statusColor}; letter-spacing: 0.1em;">
                        ${statusLabel}
                      </span>
                    </div>
                    <h3 style="font-family: var(--font-display); font-size: 18px; color: ${isUnlocked ? '#edf5ff' : '#94a3b8'}; margin: 0 0 6px;">
                      ${node.name}
                    </h3>
                    <p style="font-size: 13px; color: #94a3b8; margin: 0; max-width: 650px; line-height: 1.5;">
                      ${node.desc}
                    </p>
                  </div>

                  <!-- Rank Pip Gauge & Unlock Button -->
                  <div style="display: flex; align-items: center; gap: 14px;">
                    <!-- Rank pips -->
                    <div style="display: flex; gap: 4px;">
                      ${Array.from({ length: node.maxLevel }).map((_, i) => `
                        <div style="width: 12px; height: 12px; border-radius: 2px; border: 1px solid ${currentBranch.accent}; background: ${i < currentLevel ? currentBranch.accent : 'transparent'}; box-shadow: ${i < currentLevel ? `0 0 8px ${currentBranch.accent}` : 'none'};"></div>
                      `).join("")}
                    </div>

                    <button
                      type="button"
                      class="unlock-node-btn"
                      data-node-id="${node.id}"
                      ${!canUnlock ? 'disabled' : ''}
                      style="padding: 8px 16px; background: ${canUnlock ? currentBranch.accent : 'rgba(30, 41, 59, 0.3)'}; border: 1px solid ${canUnlock ? currentBranch.accent : 'rgba(148, 163, 184, 0.2)'}; color: ${canUnlock ? '#05070d' : '#64748b'}; font-family: var(--font-hud); font-weight: 700; font-size: 11px; border-radius: 4px; cursor: ${canUnlock ? 'pointer' : 'not-allowed'}; display: flex; align-items: center; gap: 6px;"
                    >
                      <span>${isMaxed ? 'MAX RANK' : (isUnlocked ? 'UPGRADE (1 SP)' : 'UNLOCK (1 SP)')}</span>
                    </button>
                  </div>
                </div>

                <div style="background: rgba(15, 23, 42, 0.6); padding: 6px 12px; border-radius: 3px; font-family: var(--font-mono); font-size: 11px; color: ${currentBranch.accent}; border-left: 2px solid ${currentBranch.accent};">
                  ${node.buff}
                </div>
              </div>
            `;
          }).join("")}
        </div>
      </section>

      <!-- Return to Command -->
      <div style="text-align: center;">
        <button
          type="button"
          id="btn-skills-return"
          style="background: rgba(59, 130, 246, 0.12); border: 1px solid rgba(59, 130, 246, 0.35); color: #93c5fd; padding: 10px 24px; font-family: var(--font-hud); font-weight: 700; border-radius: 4px; cursor: pointer;"
        >
          RETURN TO HUNTER COMMAND
        </button>
      </div>

    </div>
  `;

  // Wire Tab Switches
  const branchTabs = container.querySelectorAll(".branch-tab-btn");
  branchTabs.forEach((tab) => {
    tab.addEventListener("click", (e) => {
      const bId = e.currentTarget.getAttribute("data-branch");
      if (!bId || bId === selectedBranchId) return;
      audio.playClick();
      selectedBranchId = bId;
      renderSkillsScreen(container, store.getState(), navigate);
    });
  });

  // Wire Unlock Buttons
  const unlockBtns = container.querySelectorAll(".unlock-node-btn");
  unlockBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const nodeId = e.currentTarget.getAttribute("data-node-id");
      if (!nodeId || state.skillPoints <= 0) return;

      audio.playStatPoint();
      store.dispatch(actions.unlockSkill(nodeId));
      store.dispatch(actions.setNotification(`SKILL RANK ADVANCED // ${nodeId.replaceAll("_", " ")}`));

      renderSkillsScreen(container, store.getState(), navigate);
    });
  });

  const returnBtn = container.querySelector("#btn-skills-return");
  if (returnBtn) {
    returnBtn.addEventListener("click", () => {
      audio.playClick();
      navigate("SYSTEM");
    });
  }
}
