/**
 * AWAKEN Application Shell
 * Pure HTML5 Structure & Responsive HUD Layout
 * Pure Vanilla JavaScript ES6 Module
 */

import { ROUTE_LABELS, ROUTES, getRankFromLevel } from "../engine/constants.js";
import { actions, store } from "../engine/state.js";
import { audio } from "../engine/audio.js";
import { router } from "../engine/router.js";

export function createShellHTML(state) {
  const rank = getRankFromLevel(state.level);
  const activeLabel = ROUTE_LABELS[state.route] || ROUTE_LABELS[ROUTES.SYSTEM];
  const currentDate = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const currentTime = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const completedQuestsCount = state.missions.filter((m) => m.completed).length;
  const currentLevelXP = state.xp % 1000;

  return `
    <div class="awaken ${state.settings.reducedMotion ? 'reduced-motion' : ''}">
      <!-- Ambient Visuals -->
      <div class="scanlines" aria-hidden="true"></div>
      <div class="noise" aria-hidden="true"></div>
      <div class="ambient ambient-one" aria-hidden="true"></div>
      <div class="ambient ambient-two" aria-hidden="true"></div>
      <div class="holo-grid" aria-hidden="true"></div>

      <!-- Orientation Overlay for Mobile Portrait -->
      <div class="orientation-overlay" role="status" aria-live="polite">
        <div class="orientation-energy" aria-hidden="true"></div>
        <div class="orientation-device" aria-hidden="true">
          <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2">
            <rect width="14" height="20" x="5" y="2" rx="2" ry="2"/>
            <path d="M12 18h.01"/>
          </svg>
        </div>
        <span class="orientation-label">AWAKEN SYSTEM // DISPLAY PROTOCOL</span>
        <h1>ROTATE YOUR DEVICE</h1>
        <p>AWAKEN IS DESIGNED FOR LANDSCAPE ORIENTATION</p>
      </div>

      <!-- System Notification Toast -->
      <div id="system-notification-container"></div>

      <!-- Main Application Container -->
      <main class="system-container">
        <!-- Sidebar Navigation -->
        <aside class="system-sidebar">
          <button class="sidebar-brand" type="button" data-route="${ROUTES.SYSTEM}">
            <span class="sidebar-brand-mark">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
              </svg>
            </span>
            <span>
              <strong>AWAKEN</strong>
              <small>HUNTER SYSTEM</small>
            </span>
          </button>

          <div class="sidebar-section-label">OPERATIONS</div>

          <nav class="system-nav" aria-label="Primary navigation">
            ${Object.values(ROUTES).map((routeKey) => {
              const info = ROUTE_LABELS[routeKey];
              const isActive = state.route === routeKey;
              return `
                <button
                  type="button"
                  class="nav-item ${isActive ? 'active' : ''}"
                  data-route="${routeKey}"
                  aria-label="${info.full}"
                  aria-current="${isActive ? 'page' : 'false'}"
                >
                  <span class="nav-label-full">${info.full}</span>
                  <span class="nav-label-compact" aria-hidden="true">${info.compact}</span>
                </button>
              `;
            }).join("")}
          </nav>

          <div class="sidebar-hunter-card" data-rank="${rank}">
            <span class="sidebar-player-label">ACTIVE HUNTER</span>
            <strong id="sidebar-hunter-name">${state.profile.name}</strong>
            <div>
              <span id="sidebar-hunter-level">LV. ${String(state.level).padStart(2, "0")}</span>
              <span id="sidebar-hunter-rank">RANK ${rank}</span>
            </div>
          </div>
        </aside>

        <!-- Main Content Area -->
        <div class="system-main">
          <!-- Top Header -->
          <header class="system-header">
            <div class="header-context">
              <div class="system-status">
                <span></span>
                SYSTEM ONLINE
                <strong>${currentDate} // <span id="header-time">${currentTime}</span></strong>
              </div>
              <h1 id="header-screen-title">${activeLabel.title}</h1>
            </div>

            <div class="header-metrics" aria-label="Hunter summary statistics">
              <div class="metric-card" data-rank="${rank}">
                <span>HUNTER RANK</span>
                <strong id="metric-rank">${rank}</strong>
              </div>
              <div class="metric-card">
                <span>QUEST CLEARANCE</span>
                <strong id="metric-clearance">${completedQuestsCount}/${state.missions.length}</strong>
              </div>
              <div class="metric-card">
                <span>EXPERIENCE</span>
                <strong id="metric-xp">${state.xp.toLocaleString()} XP</strong>
              </div>
              <div class="metric-card header-level">
                <span>LEVEL</span>
                <strong id="metric-level">${String(state.level).padStart(2, "0")}</strong>
              </div>
            </div>

            <button
              class="sound-toggle"
              type="button"
              id="sound-toggle-btn"
              aria-label="${state.settings.soundEnabled ? 'Mute system audio' : 'Enable system audio'}"
              title="${state.settings.soundEnabled ? 'Mute sound' : 'Enable sound'}"
            >
              <span>${state.settings.soundEnabled ? 'SFX ON' : 'SFX OFF'}</span>
            </button>
          </header>

          <!-- Dynamic Screen Host -->
          <div id="screen-container" class="system-content system-content-${state.route.toLowerCase()}"></div>

          <!-- Bottom Status Terminal -->
          <div class="system-terminal">
            <span class="terminal-prefix">&gt;</span>
            <span>SYSTEM STATUS:</span>
            <strong>ALL SYSTEMS OPERATIONAL // PROTOCOL 5.0 READY</strong>
            <span class="terminal-cursor">_</span>
          </div>

          <!-- Footer -->
          <footer>
            AWAKEN SYSTEM // PLAYER EVOLUTION PROTOCOL // CLIENT-SIDE CORE
          </footer>
        </div>
      </main>
    </div>
  `;
}

/**
 * Initializes and binds shell event listeners (Header, Nav, Notifications)
 */
export function initShell(rootElement) {
  rootElement.innerHTML = createShellHTML(store.getState());

  const screenContainer = rootElement.querySelector("#screen-container");
  router.init(screenContainer);

  // Global Event Delegation for clicks
  rootElement.addEventListener("click", (event) => {
    // Route clicks
    const routeTarget = event.target.closest("[data-route]");
    if (routeTarget) {
      const targetRoute = routeTarget.getAttribute("data-route");
      if (targetRoute && targetRoute !== store.getState().route) {
        router.navigate(targetRoute);
      }
      return;
    }

    // Sound toggle
    const soundToggle = event.target.closest("#sound-toggle-btn");
    if (soundToggle) {
      const current = store.getState().settings.soundEnabled;
      const next = !current;
      audio.setEnabled(next);
      store.dispatch(actions.toggleSound(next));
      if (next) audio.playClick();
      return;
    }

    // Dismiss notification
    const dismissNotify = event.target.closest("[data-action='dismiss-notification']");
    if (dismissNotify) {
      store.dispatch(actions.setNotification(null));
      return;
    }
  });

  // Clock Ticker
  setInterval(() => {
    const timeElem = document.getElementById("header-time");
    if (timeElem) {
      timeElem.textContent = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  }, 1000);

  // Subscribe shell header and notification updates
  store.subscribe((state, prevState) => {
    updateShellHUD(state, prevState);
  });
}

/**
 * Updates dynamic header and notification elements without re-rendering entire shell
 */
function updateShellHUD(state, prevState) {
  const rank = getRankFromLevel(state.level);
  const activeLabel = ROUTE_LABELS[state.route] || ROUTE_LABELS[ROUTES.SYSTEM];

  // Update Route Title
  const titleElem = document.getElementById("header-screen-title");
  if (titleElem) titleElem.textContent = activeLabel.title;

  // Update Nav Items active classes
  document.querySelectorAll(".nav-item").forEach((btn) => {
    const btnRoute = btn.getAttribute("data-route");
    const isActive = btnRoute === state.route;
    btn.classList.toggle("active", isActive);
    btn.setAttribute("aria-current", isActive ? "page" : "false");
  });

  // Update Hunter Dossier & Metrics
  const levelText = `LV. ${String(state.level).padStart(2, "0")}`;
  const hunterName = document.getElementById("sidebar-hunter-name");
  if (hunterName) hunterName.textContent = state.profile.name;

  const hunterLevel = document.getElementById("sidebar-hunter-level");
  if (hunterLevel) hunterLevel.textContent = levelText;

  const hunterRank = document.getElementById("sidebar-hunter-rank");
  if (hunterRank) hunterRank.textContent = `RANK ${rank}`;

  const metricRank = document.getElementById("metric-rank");
  if (metricRank) metricRank.textContent = rank;

  const metricLevel = document.getElementById("metric-level");
  if (metricLevel) metricLevel.textContent = String(state.level).padStart(2, "0");

  const metricXP = document.getElementById("metric-xp");
  if (metricXP) metricXP.textContent = `${state.xp.toLocaleString()} XP`;

  const metricClearance = document.getElementById("metric-clearance");
  if (metricClearance) {
    const completed = state.missions.filter((m) => m.completed).length;
    metricClearance.textContent = `${completed}/${state.missions.length}`;
  }

  // Sound toggle button text
  const soundBtn = document.getElementById("sound-toggle-btn");
  if (soundBtn) {
    soundBtn.querySelector("span").textContent = state.settings.soundEnabled ? "SFX ON" : "SFX OFF";
  }

  // Notification Toast handling
  const notificationContainer = document.getElementById("system-notification-container");
  if (notificationContainer) {
    if (state.notification && state.notification !== prevState?.notification) {
      audio.playNotify();
      notificationContainer.innerHTML = `
        <div class="system-notification" role="status" aria-live="polite">
          <div class="notification-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <div>
            <p>SYSTEM DIRECTIVE</p>
            <strong>${state.notification}</strong>
          </div>
          <button type="button" data-action="dismiss-notification" aria-label="Dismiss system notification">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      `;
    } else if (!state.notification) {
      notificationContainer.innerHTML = "";
    }
  }
}

