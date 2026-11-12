/**
 * AWAKEN Settings & System Protocols Screen
 * Pure Vanilla JavaScript ES6 Module
 */

import { APP_VERSION, STORAGE_KEY } from "../../engine/constants.js";
import { actions, store } from "../../engine/state.js";
import { storage } from "../../engine/storage.js";
import { audio } from "../../engine/audio.js";

export function renderSettingsScreen(container, state, navigate) {
  const rawStateStr = localStorage.getItem(STORAGE_KEY) || "";
  const storageSizeKB = (new Blob([rawStateStr]).size / 1024).toFixed(2);

  container.innerHTML = `
    <div class="panel settings-page" style="padding: 24px; max-width: 900px; margin: 0 auto;">
      <div class="focus-header">
        <div>
          <span class="system-label">PROTOCOL CONTROL // CONFIGURATION</span>
          <h2>SYSTEM SETTINGS & STORAGE BACKUP</h2>
          <p>Manage local persistence, export Hunter records, or calibrate system feedback.</p>
        </div>
      </div>

      <div style="display: flex; flex-direction: column; gap: 24px; margin-top: 20px;">
        <!-- Data Backup & Portability Section -->
        <section class="panel" style="padding: 20px; background: rgba(8, 14, 26, 0.7); border: 1px solid rgba(138, 168, 220, 0.15);">
          <div class="section-label">
            <span>01</span>
            HUNTER DATA PERSISTENCE & BACKUP
          </div>

          <p style="font-size: 13px; color: #94a3b8; line-height: 1.6; margin-bottom: 16px;">
            All AWAKEN data resides strictly on this device. Create a portable JSON archive to restore your progression on another device or recover from browser clearance.
          </p>

          <div style="display: flex; gap: 12px; flex-wrap: wrap;">
            <button type="button" class="action-btn" id="export-json-btn" style="background: rgba(59, 130, 246, 0.2); border: 1px solid #3b82f6; color: #93c5fd; padding: 10px 18px; font-family: var(--font-hud); font-weight: 700; cursor: pointer; letter-spacing: 0.08em; border-radius: 4px;">
              EXPORT HUNTER ARCHIVE (.JSON)
            </button>

            <label class="action-btn" style="background: rgba(147, 51, 234, 0.2); border: 1px solid #a855f7; color: #d8b4fe; padding: 10px 18px; font-family: var(--font-hud); font-weight: 700; cursor: pointer; letter-spacing: 0.08em; border-radius: 4px; display: inline-flex; align-items: center;">
              IMPORT ARCHIVE (.JSON)
              <input type="file" id="import-json-input" accept=".json" style="display: none;" />
            </label>
          </div>

          <div id="import-status-msg" style="margin-top: 10px; font-size: 12px; font-family: var(--font-mono);"></div>
        </section>

        <!-- System Preferences Section -->
        <section class="panel" style="padding: 20px; background: rgba(8, 14, 26, 0.7); border: 1px solid rgba(138, 168, 220, 0.15);">
          <div class="section-label">
            <span>02</span>
            FEEDBACK & SENSORY PROTOCOLS
          </div>

          <div style="display: flex; flex-direction: column; gap: 16px;">
            <label style="display: flex; align-items: center; justify-content: space-between; cursor: pointer;">
              <div>
                <strong style="display: block; font-family: var(--font-hud); color: #edf5ff;">SYNTHESIZED AUDIO FEEDBACK (SFX)</strong>
                <span style="font-size: 12px; color: #94a3b8;">Web Audio API synthesized holographic interface sound effects</span>
              </div>
              <input type="checkbox" id="setting-sound-toggle" ${state.settings.soundEnabled ? 'checked' : ''} style="width: 20px; height: 20px; cursor: pointer;" />
            </label>

            <label style="display: flex; align-items: center; justify-content: space-between; cursor: pointer;">
              <div>
                <strong style="display: block; font-family: var(--font-hud); color: #edf5ff;">REDUCED MOTION PROTOCOL</strong>
                <span style="font-size: 12px; color: #94a3b8;">Disable ambient floating animations and high-energy HUD pulses</span>
              </div>
              <input type="checkbox" id="setting-motion-toggle" ${state.settings.reducedMotion ? 'checked' : ''} style="width: 20px; height: 20px; cursor: pointer;" />
            </label>
          </div>
        </section>

        <!-- Diagnostics & Factory Reset Section -->
        <section class="panel" style="padding: 20px; background: rgba(8, 14, 26, 0.7); border: 1px solid rgba(239, 68, 68, 0.25);">
          <div class="section-label" style="color: #f87171;">
            <span>03</span>
            EMERGENCY PROTOCOL & DIAGNOSTICS
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; margin-bottom: 18px; font-family: var(--font-mono); font-size: 11px;">
            <div style="background: rgba(15, 23, 42, 0.6); padding: 8px 12px; border-radius: 3px; border: 1px solid rgba(255,255,255,0.06);">
              <span style="color: #64748b;">SYSTEM BUILD</span><br/>
              <strong style="color: #cbd5e1;">AWAKEN v${APP_VERSION}</strong>
            </div>
            <div style="background: rgba(15, 23, 42, 0.6); padding: 8px 12px; border-radius: 3px; border: 1px solid rgba(255,255,255,0.06);">
              <span style="color: #64748b;">LOCAL STORAGE LOAD</span><br/>
              <strong style="color: #cbd5e1;">${storageSizeKB} KB</strong>
            </div>
            <div style="background: rgba(15, 23, 42, 0.6); padding: 8px 12px; border-radius: 3px; border: 1px solid rgba(255,255,255,0.06);">
              <span style="color: #64748b;">INDEXED_DB STATUS</span><br/>
              <strong style="color: #34d399;">ONLINE (AwakenDB)</strong>
            </div>
          </div>

          <button
            type="button"
            id="factory-reset-btn"
            style="background: rgba(220, 38, 38, 0.2); border: 1px solid #ef4444; color: #fca5a5; padding: 10px 18px; font-family: var(--font-hud); font-weight: 700; cursor: pointer; letter-spacing: 0.08em; border-radius: 4px;"
          >
            RESET HUNTER ARCHIVE (FACTORY RESET)
          </button>
        </section>
      </div>
    </div>
  `;

  // JSON Export Handler
  const exportBtn = container.querySelector("#export-json-btn");
  if (exportBtn) {
    exportBtn.addEventListener("click", () => {
      audio.playClick();
      const { url, filename } = storage.exportStateToJSON(state);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      store.dispatch(actions.setNotification("ARCHIVE EXPORT COMPLETED // JSON GENERATED"));
    });
  }

  // JSON Import Handler
  const importInput = container.querySelector("#import-json-input");
  const statusMsg = container.querySelector("#import-status-msg");
  if (importInput) {
    importInput.addEventListener("change", (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const contents = event.target?.result;
          const importedState = storage.validateAndParseImportJSON(contents);
          store.dispatch(actions.loadState(importedState));
          storage.saveState(importedState);
          audio.playLevelUp();
          if (statusMsg) {
            statusMsg.style.color = "#34d399";
            statusMsg.textContent = `SUCCESS // ARCHIVE RESTORED FOR HUNTER [${importedState.profile.name}] (LV. ${importedState.level})`;
          }
          store.dispatch(actions.setNotification("HUNTER ARCHIVE SUCCESSFULLY RESTORED"));
        } catch (err) {
          audio.playError();
          if (statusMsg) {
            statusMsg.style.color = "#f87171";
            statusMsg.textContent = `IMPORT FAILED // ${err.message}`;
          }
          store.dispatch(actions.setNotification(`IMPORT ERROR: ${err.message}`));
        }
      };
      reader.readAsText(file);
    });
  }

  // Preferences Toggles
  const soundToggle = container.querySelector("#setting-sound-toggle");
  if (soundToggle) {
    soundToggle.addEventListener("change", (e) => {
      const enabled = e.target.checked;
      audio.setEnabled(enabled);
      store.dispatch(actions.toggleSound(enabled));
      if (enabled) audio.playClick();
    });
  }

  const motionToggle = container.querySelector("#setting-motion-toggle");
  if (motionToggle) {
    motionToggle.addEventListener("change", (e) => {
      store.dispatch(actions.toggleReducedMotion(e.target.checked));
      audio.playClick();
    });
  }

  // Factory Reset with Safety Confirmation
  const resetBtn = container.querySelector("#factory-reset-btn");
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      const confirmReset = window.confirm(
        "WARNING // CRITICAL ACTION:\nAre you sure you want to completely erase all local hunter progress and factory reset AWAKEN?"
      );
      if (confirmReset) {
        audio.playClick();
        storage.resetGame();
        store.dispatch(actions.resetState());
        store.dispatch(actions.setNotification("SYSTEM INITIALIZED // ALL DATA RESET"));
        navigate("SYSTEM");
      }
    });
  }
}

