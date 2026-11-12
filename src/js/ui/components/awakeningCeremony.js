/**
 * AWAKEN Awakening Ceremony & Character Creation
 * Anime-Inspired Cinematic Onboarding & Identity Configuration
 * Pure Vanilla JavaScript ES6 Module
 */

import {
  APTITUDE_ASSESSMENT,
  AVATAR_PRESETS,
  HUNTER_CLASSES,
} from "../../engine/character.js";
import { actions, store } from "../../engine/state.js";
import { audio } from "../../engine/audio.js";

export class AwakeningCeremony {
  constructor(onComplete = null) {
    this.onComplete = onComplete;
    this.overlay = null;
    this.step = 1; // 1: Breach, 2: Assessment, 3: Identity & Avatar, 4: Surge

    // Working creation state
    this.selectedClassId = "VANGUARD";
    this.selectedSpecId = "WARDEN";
    this.selectedAvatarId = "avatar_shadow";
    this.hunterName = store.getState().profile.name || "SUNG JIN-WOO";
    this.assessmentAnswers = [];
  }

  start() {
    this.overlay = document.createElement("div");
    this.overlay.className = "awakening-overlay";
    this.overlay.id = "awakening-ceremony-modal";
    document.body.appendChild(this.overlay);

    audio.playNotify();
    this.renderCurrentStep();
  }

  close() {
    if (this.overlay && this.overlay.parentNode) {
      this.overlay.classList.add("fade-out");
      setTimeout(() => {
        if (this.overlay && this.overlay.parentNode) {
          this.overlay.parentNode.removeChild(this.overlay);
        }
        if (typeof this.onComplete === "function") {
          this.onComplete();
        }
      }, 400);
    }
  }

  renderCurrentStep() {
    if (!this.overlay) return;

    if (this.step === 1) {
      this.renderBreach();
    } else if (this.step === 2) {
      this.renderAssessment();
    } else if (this.step === 3) {
      this.renderIdentity();
    } else if (this.step === 4) {
      this.renderSurge();
    }
  }

  // -------------------------------------------------------------
  // STAGE 1: THE DIMENSIONAL BREACH
  // -------------------------------------------------------------
  renderBreach() {
    this.overlay.innerHTML = `
      <div class="awakening-stage awakening-breach">
        <div class="rift-energy-line" aria-hidden="true"></div>
        <div class="rift-pulse-glow" aria-hidden="true"></div>

        <div class="awakening-content panel" style="text-align: center; max-width: 650px;">
          <div class="system-label" style="letter-spacing: 0.25em; color: #818cf8; animation: pulse 2s infinite;">
            [SYSTEM PROTOCOL // DIMENSIONAL FREQUENCY DETECTED]
          </div>

          <h1 style="font-family: var(--font-display); font-size: clamp(26px, 4vw, 38px); letter-spacing: 0.08em; color: #edf5ff; margin: 18px 0;">
            THE AWAKENING DIRECTIVE
          </h1>

          <p style="color: #94a3b8; font-size: 15px; line-height: 1.8; margin-bottom: 28px;">
            A dimensional rift has expanded across your reality. The System has pinpointed your mortal biological frequency and detected dormant Hunter potential.
            <br/><br/>
            <strong style="color: #60a5fa; font-family: var(--font-hud); letter-spacing: 0.05em;">
              WILL YOU ACCEPT THE CONTRACT AND AWAKEN AS A HUNTER?
            </strong>
          </p>

          <button
            type="button"
            class="action-btn-large"
            id="commence-awakening-btn"
            style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.4), rgba(147, 51, 234, 0.4)); border: 1px solid #818cf8; color: #ffffff; padding: 14px 32px; font-family: var(--font-display); font-weight: 800; letter-spacing: 0.1em; cursor: pointer; border-radius: 4px; box-shadow: 0 0 25px rgba(129, 140, 248, 0.45);"
          >
            ACCEPT SYSTEM PROTOCOL
          </button>
        </div>
      </div>
    `;

    const btn = this.overlay.querySelector("#commence-awakening-btn");
    btn?.addEventListener("click", () => {
      audio.playClick();
      this.step = 2;
      this.renderCurrentStep();
    });
  }

  // -------------------------------------------------------------
  // STAGE 2: APTITUDE ASSESSMENT
  // -------------------------------------------------------------
  renderAssessment() {
    this.overlay.innerHTML = `
      <div class="awakening-stage awakening-assessment">
        <div class="awakening-content panel" style="max-width: 720px; width: 90%;">
          <div class="system-label" style="color: #60a5fa;">
            SYSTEM ASSESSMENT // STAGE 01 // APTITUDE CALIBRATION
          </div>

          <h2 style="font-family: var(--font-display); font-size: 22px; color: #edf5ff; margin: 12px 0 20px;">
            CALIBRATING HUNTER FREQUENCY
          </h2>

          <div style="display: flex; flex-direction: column; gap: 24px;">
            ${APTITUDE_ASSESSMENT.map((q, qIndex) => `
              <div class="assessment-question-block" style="background: rgba(8, 14, 26, 0.65); padding: 16px; border-radius: 4px; border: 1px solid rgba(138, 168, 220, 0.15);">
                <span style="font-family: var(--font-hud); font-size: 11px; color: #93c5fd; letter-spacing: 0.1em;">
                  QUERY ${qIndex + 1} OF 2
                </span>
                <p style="color: #e2e8f0; font-weight: 600; margin: 6px 0 12px;">
                  ${q.question}
                </p>

                <div style="display: flex; flex-direction: column; gap: 8px;">
                  ${q.options.map((opt, optIndex) => `
                    <button
                      type="button"
                      class="assessment-choice-btn"
                      data-qindex="${qIndex}"
                      data-affinity="${opt.classAffinity}"
                      style="text-align: left; background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(255,255,255,0.08); color: #cbd5e1; padding: 10px 14px; border-radius: 3px; font-family: var(--font-body); font-size: 13px; cursor: pointer; transition: all 0.2s;"
                    >
                      ${opt.text}
                    </button>
                  `).join("")}
                </div>
              </div>
            `).join("")}
          </div>

          <div style="margin-top: 24px; display: flex; justify-content: flex-end;">
            <button
              type="button"
              id="confirm-assessment-btn"
              disabled
              style="background: rgba(59, 130, 246, 0.2); border: 1px solid #3b82f6; color: #94a3b8; padding: 10px 24px; font-family: var(--font-hud); font-weight: 700; cursor: not-allowed; border-radius: 4px;"
            >
              PROCEED TO IDENTITY REGISTRATION &gt;
            </button>
          </div>
        </div>
      </div>
    `;

    const choiceBtns = this.overlay.querySelectorAll(".assessment-choice-btn");
    const confirmBtn = this.overlay.querySelector("#confirm-assessment-btn");

    choiceBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        audio.playClick();
        const qIndex = parseInt(btn.getAttribute("data-qindex"), 10);
        const affinity = btn.getAttribute("data-affinity");

        // Unhighlight sibling buttons in same question
        this.overlay
          .querySelectorAll(`.assessment-choice-btn[data-qindex="${qIndex}"]`)
          .forEach((b) => {
            b.style.borderColor = "rgba(255,255,255,0.08)";
            b.style.background = "rgba(15, 23, 42, 0.7)";
            b.style.color = "#cbd5e1";
          });

        btn.style.borderColor = "#60a5fa";
        btn.style.background = "rgba(59, 130, 246, 0.25)";
        btn.style.color = "#ffffff";

        this.assessmentAnswers[qIndex] = affinity;

        if (this.assessmentAnswers[0] && this.assessmentAnswers[1]) {
          confirmBtn.disabled = false;
          confirmBtn.style.cursor = "pointer";
          confirmBtn.style.color = "#93c5fd";
          confirmBtn.style.borderColor = "#60a5fa";
          confirmBtn.style.boxShadow = "0 0 15px rgba(59, 130, 246, 0.35)";

          // Pre-select recommended class from affinity
          const recommended = this.assessmentAnswers[0] || this.assessmentAnswers[1];
          if (HUNTER_CLASSES.some((c) => c.id === recommended)) {
            this.selectedClassId = recommended;
            const cls = HUNTER_CLASSES.find((c) => c.id === recommended);
            this.selectedSpecId = cls?.specializations[0]?.id || "WARDEN";
          }
        }
      });
    });

    confirmBtn?.addEventListener("click", () => {
      if (confirmBtn.disabled) return;
      audio.playClick();
      this.step = 3;
      this.renderCurrentStep();
    });
  }

  // -------------------------------------------------------------
  // STAGE 3: IDENTITY & AVATAR SELECTION
  // -------------------------------------------------------------
  renderIdentity() {
    const selectedClass = HUNTER_CLASSES.find((c) => c.id === this.selectedClassId) || HUNTER_CLASSES[0];

    this.overlay.innerHTML = `
      <div class="awakening-stage awakening-identity">
        <div class="awakening-content panel" style="max-width: 820px; width: 92%; max-height: 88vh; overflow-y: auto;">
          <div class="system-label" style="color: #a855f7;">
            HUNTER REGISTRATION // STAGE 02 // DOSSIER INITIALIZATION
          </div>

          <h2 style="font-family: var(--font-display); font-size: 22px; color: #edf5ff; margin: 8px 0 18px;">
            FORGE YOUR HUNTER IDENTITY
          </h2>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px;">
            <!-- Left: Name & Avatar -->
            <div>
              <div style="margin-bottom: 16px;">
                <label for="hunter-name-input" style="display: block; font-family: var(--font-hud); font-size: 11px; color: #94a3b8; margin-bottom: 6px; letter-spacing: 0.1em;">
                  HUNTER CALLSIGN / REAL NAME
                </label>
                <input
                  type="text"
                  id="hunter-name-input"
                  maxlength="24"
                  value="${this.hunterName}"
                  placeholder="ENTER HUNTER NAME"
                  style="width: 100%; background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(138, 168, 220, 0.25); color: #edf5ff; padding: 10px 14px; border-radius: 3px; font-family: var(--font-display); font-size: 16px;"
                />
              </div>

              <div>
                <span style="display: block; font-family: var(--font-hud); font-size: 11px; color: #94a3b8; margin-bottom: 8px; letter-spacing: 0.1em;">
                  SELECT ASTRAL AVATAR
                </span>

                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(80px, 1fr)); gap: 10px;">
                  ${AVATAR_PRESETS.map((av) => `
                    <button
                      type="button"
                      class="avatar-select-card ${av.id === this.selectedAvatarId ? 'selected' : ''}"
                      data-avatar-id="${av.id}"
                      style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 12px 6px; background: rgba(15, 23, 42, 0.7); border: 2px solid ${av.id === this.selectedAvatarId ? av.theme : 'rgba(255,255,255,0.08)'}; border-radius: 4px; cursor: pointer; transition: all 0.2s;"
                    >
                      <div style="width: 32px; height: 32px; color: ${av.theme}; margin-bottom: 4px;">
                        ${av.svgIcon}
                      </div>
                      <span style="font-family: var(--font-hud); font-size: 9px; color: #cbd5e1; text-align: center;">
                        ${av.name}
                      </span>
                    </button>
                  `).join("")}
                </div>
              </div>
            </div>

            <!-- Right: Class & Specialization -->
            <div>
              <div style="margin-bottom: 16px;">
                <label for="hunter-class-select" style="display: block; font-family: var(--font-hud); font-size: 11px; color: #94a3b8; margin-bottom: 6px; letter-spacing: 0.1em;">
                  PRIMARY HUNTER CLASS
                </label>
                <select
                  id="hunter-class-select"
                  style="width: 100%; background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(138, 168, 220, 0.25); color: #edf5ff; padding: 10px 14px; border-radius: 3px; font-family: var(--font-hud); font-size: 14px;"
                >
                  ${HUNTER_CLASSES.map((cls) => `
                    <option value="${cls.id}" ${cls.id === this.selectedClassId ? 'selected' : ''}>
                      ${cls.name.toUpperCase()} — ${cls.role}
                    </option>
                  `).join("")}
                </select>
              </div>

              <div id="class-details-box" style="background: rgba(8, 14, 26, 0.75); border: 1px solid rgba(138, 168, 220, 0.2); border-radius: 4px; padding: 14px; margin-bottom: 16px;">
                <strong style="color: #38bdf8; font-family: var(--font-display); font-size: 14px;">
                  ${selectedClass.name} PASSIVE
                </strong>
                <p style="font-size: 12px; color: #cbd5e1; margin: 4px 0 8px;">
                  ${selectedClass.passive}
                </p>
                <span style="font-family: var(--font-mono); font-size: 11px; color: #94a3b8;">
                  LINKED ATTRIBUTES: ${selectedClass.linkedAttributes}
                </span>
              </div>

              <div>
                <label for="hunter-spec-select" style="display: block; font-family: var(--font-hud); font-size: 11px; color: #94a3b8; margin-bottom: 6px; letter-spacing: 0.1em;">
                  INITIAL SPECIALIZATION
                </label>
                <select
                  id="hunter-spec-select"
                  style="width: 100%; background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(138, 168, 220, 0.25); color: #edf5ff; padding: 10px 14px; border-radius: 3px; font-family: var(--font-hud); font-size: 14px;"
                >
                  ${selectedClass.specializations.map((spec) => `
                    <option value="${spec.id}" ${spec.id === this.selectedSpecId ? 'selected' : ''}>
                      ${spec.name} (${spec.desc})
                    </option>
                  `).join("")}
                </select>
              </div>
            </div>
          </div>

          <div style="margin-top: 24px; display: flex; justify-content: space-between; align-items: center;">
            <button
              type="button"
              id="back-to-assessment-btn"
              style="background: transparent; border: none; color: #94a3b8; font-family: var(--font-hud); cursor: pointer;"
            >
              &lt; BACK TO ASSESSMENT
            </button>

            <button
              type="button"
              id="trigger-surge-btn"
              style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.5), rgba(168, 85, 247, 0.5)); border: 1px solid #c084fc; color: #ffffff; padding: 12px 28px; font-family: var(--font-display); font-weight: 800; cursor: pointer; border-radius: 4px; box-shadow: 0 0 20px rgba(192, 132, 252, 0.4);"
            >
              COMMENCE AWAKENING SURGE &gt;
            </button>
          </div>
        </div>
      </div>
    `;

    // Bind Name Input
    const nameInput = this.overlay.querySelector("#hunter-name-input");
    nameInput?.addEventListener("input", (e) => {
      this.hunterName = e.target.value.trim().toUpperCase() || "SUNG JIN-WOO";
    });

    // Bind Avatar cards
    const avatarCards = this.overlay.querySelectorAll(".avatar-select-card");
    avatarCards.forEach((card) => {
      card.addEventListener("click", () => {
        audio.playClick();
        const avatarId = card.getAttribute("data-avatar-id");
        this.selectedAvatarId = avatarId;
        const av = AVATAR_PRESETS.find((a) => a.id === avatarId);

        avatarCards.forEach((c) => {
          c.classList.remove("selected");
          c.style.borderColor = "rgba(255,255,255,0.08)";
        });
        card.classList.add("selected");
        if (av) card.style.borderColor = av.theme;
      });
    });

    // Bind Class selector
    const classSelect = this.overlay.querySelector("#hunter-class-select");
    const specSelect = this.overlay.querySelector("#hunter-spec-select");
    const detailsBox = this.overlay.querySelector("#class-details-box");

    classSelect?.addEventListener("change", (e) => {
      audio.playClick();
      this.selectedClassId = e.target.value;
      const newCls = HUNTER_CLASSES.find((c) => c.id === this.selectedClassId);
      if (newCls) {
        this.selectedSpecId = newCls.specializations[0].id;
        if (specSelect) {
          specSelect.innerHTML = newCls.specializations.map((spec) => `
            <option value="${spec.id}" ${spec.id === this.selectedSpecId ? 'selected' : ''}>
              ${spec.name} (${spec.desc})
            </option>
          `).join("");
        }
        if (detailsBox) {
          detailsBox.innerHTML = `
            <strong style="color: #38bdf8; font-family: var(--font-display); font-size: 14px;">
              ${newCls.name} PASSIVE
            </strong>
            <p style="font-size: 12px; color: #cbd5e1; margin: 4px 0 8px;">
              ${newCls.passive}
            </p>
            <span style="font-family: var(--font-mono); font-size: 11px; color: #94a3b8;">
              LINKED ATTRIBUTES: ${newCls.linkedAttributes}
            </span>
          `;
        }
      }
    });

    specSelect?.addEventListener("change", (e) => {
      this.selectedSpecId = e.target.value;
    });

    // Navigation buttons
    const backBtn = this.overlay.querySelector("#back-to-assessment-btn");
    backBtn?.addEventListener("click", () => {
      audio.playClick();
      this.step = 2;
      this.renderCurrentStep();
    });

    const surgeBtn = this.overlay.querySelector("#trigger-surge-btn");
    surgeBtn?.addEventListener("click", () => {
      if (!this.hunterName || this.hunterName.length < 2) {
        alert("Please enter a valid Hunter name (at least 2 characters).");
        return;
      }
      this.step = 4;
      this.renderCurrentStep();
    });
  }

  // -------------------------------------------------------------
  // STAGE 4: THE AWAKENING SURGE (ANIME CINEMATIC)
  // -------------------------------------------------------------
  renderSurge() {
    audio.playLevelUp();
    const avatar = AVATAR_PRESETS.find((a) => a.id === this.selectedAvatarId) || AVATAR_PRESETS[0];
    const hunterClass = HUNTER_CLASSES.find((c) => c.id === this.selectedClassId) || HUNTER_CLASSES[0];

    this.overlay.innerHTML = `
      <div class="awakening-stage awakening-surge">
        <div class="surge-burst-flare" aria-hidden="true"></div>

        <div class="awakening-content panel surge-card" style="text-align: center; max-width: 580px; width: 92%;">
          <div class="system-label" style="color: #34d399; letter-spacing: 0.2em;">
            [AWAKENING COMPLETE // LICENSE ISSUED]
          </div>

          <div class="surge-emblem" style="width: 80px; height: 80px; margin: 18px auto; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: rgba(8, 14, 26, 0.9); border: 2px solid ${avatar.theme}; box-shadow: 0 0 35px ${avatar.accent}; color: ${avatar.theme};">
            <div style="width: 48px; height: 48px;">
              ${avatar.svgIcon}
            </div>
          </div>

          <span style="font-family: var(--font-hud); color: #94a3b8; font-size: 11px; letter-spacing: 0.15em;">
            HUNTER LICENSE // PROTOCOL 5.0
          </span>

          <h1 style="font-family: var(--font-display); font-size: 28px; color: #edf5ff; margin: 6px 0;">
            ${this.hunterName}
          </h1>

          <div style="display: flex; justify-content: center; gap: 8px; margin-bottom: 20px;">
            <span style="background: rgba(148, 163, 184, 0.2); border: 1px solid #94a3b8; color: #cbd5e1; font-family: var(--font-hud); font-size: 11px; padding: 3px 10px; border-radius: 3px;">
              RANK F // UNTESTED
            </span>
            <span style="background: rgba(59, 130, 246, 0.2); border: 1px solid #3b82f6; color: #93c5fd; font-family: var(--font-hud); font-size: 11px; padding: 3px 10px; border-radius: 3px;">
              ${hunterClass.name.toUpperCase()}
            </span>
            <span style="background: rgba(168, 85, 247, 0.2); border: 1px solid #a855f7; color: #d8b4fe; font-family: var(--font-hud); font-size: 11px; padding: 3px 10px; border-radius: 3px;">
              ${this.selectedSpecId}
            </span>
          </div>

          <div style="background: rgba(8, 14, 26, 0.7); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 4px; padding: 12px; margin-bottom: 24px; font-family: var(--font-mono); font-size: 12px; color: #94a3b8; text-align: left;">
            <div>&gt; BASELINE ATTRIBUTES CALIBRATED</div>
            <div>&gt; CLASS PASSIVE REGISTERED: ${hunterClass.passive}</div>
            <div>&gt; TITLE UNLOCKED: "NEWLY AWAKENED"</div>
            <div>&gt; ACCESS TO DIMENSIONAL MISSIONS GRANTED</div>
          </div>

          <button
            type="button"
            class="action-btn-large"
            id="enter-system-btn"
            style="background: linear-gradient(135deg, #2563eb, #7c3aed); border: 1px solid #a855f7; color: #ffffff; padding: 14px 36px; font-family: var(--font-display); font-weight: 800; letter-spacing: 0.1em; cursor: pointer; border-radius: 4px; box-shadow: 0 0 30px rgba(124, 58, 237, 0.5);"
          >
            ENTER SYSTEM INTERFACE
          </button>
        </div>
      </div>
    `;

    const enterBtn = this.overlay.querySelector("#enter-system-btn");
    enterBtn?.addEventListener("click", () => {
      audio.playMissionComplete();

      // Attribute calibration based on chosen class
      const currentAttributes = { ...store.getState().attributes };
      const primary = hunterClass.primaryAttribute;
      currentAttributes[primary] = (currentAttributes[primary] || 1) + 2;

      // Commit profile and mark awakened
      store.dispatch(
        actions.updateProfile({
          name: this.hunterName,
          hunterClass: this.selectedClassId,
          specialization: this.selectedSpecId,
          avatarId: this.selectedAvatarId,
          title: "NEWLY AWAKENED",
          isAwakened: true,
        })
      );

      store.dispatch(
        actions.setNotification(`HUNTER AWAKENED // WELCOME TO THE SYSTEM, ${this.hunterName}`)
      );

      this.close();
    });
  }
}

