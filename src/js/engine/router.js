/**
 * AWAKEN Native Screen Router
 * Zero-Dependency URL Hash & Route State Synchronizer
 * Pure Vanilla JavaScript ES6 Module
 */

import { actions, store } from "./state.js";
import { ROUTES } from "./constants.js";
import { audio } from "./audio.js";

class NativeRouter {
  constructor() {
    this.routes = new Map();
    this.container = null;
    this.currentRoute = null;
    this.isTransitioning = false;
  }

  /**
   * Registers a screen renderer for a given route
   * @param {string} route
   * @param {Function} renderer (container, state, navigate) => void
   */
  register(route, renderer) {
    this.routes.set(route, renderer);
  }

  /**
   * Initializes the router and binds window hash listeners
   * @param {HTMLElement} containerElement
   */
  init(containerElement) {
    this.container = containerElement;

    // Listen to store route changes
    store.subscribe((state, prevState) => {
      if (state.route !== prevState.route) {
        this.renderRoute(state.route, state);
      }
    });

    // Listen to browser back/forward or hash changes
    window.addEventListener("hashchange", () => {
      const hashRoute = window.location.hash.replace("#", "").toUpperCase();
      if (ROUTES[hashRoute] && hashRoute !== store.getState().route) {
        store.dispatch(actions.setRoute(ROUTES[hashRoute]));
      }
    });

    // Initial route sync
    const initialHash = window.location.hash.replace("#", "").toUpperCase();
    const targetRoute = ROUTES[initialHash] || store.getState().route || ROUTES.SYSTEM;

    store.dispatch(actions.setRoute(targetRoute));
    this.renderRoute(targetRoute, store.getState());
  }

  /**
   * Programmatic navigation
   * @param {string} route
   */
  navigate(route) {
    if (!this.routes.has(route) && !ROUTES[route]) {
      console.warn(`Unknown route requested: ${route}`);
      return;
    }
    audio.playClick();
    window.location.hash = route.toLowerCase();
    store.dispatch(actions.setRoute(route));
  }

  /**
   * Renders the active route with smooth DOM transition
   * @param {string} route
   * @param {object} state
   */
  renderRoute(route, state) {
    if (!this.container) return;
    if (this.currentRoute === route && this.container.children.length > 0) return;

    this.currentRoute = route;
    const renderer = this.routes.get(route);

    if (!renderer) {
      this.container.innerHTML = `
        <div class="system-empty-state panel">
          <div class="system-label">ROUTE CALIBRATION // 404</div>
          <h2>SCREEN PROTOCOL STANDBY</h2>
          <p>The interface module [${route}] is undergoing dimensional alignment.</p>
          <button type="button" class="action-btn" data-action="go-home">RETURN TO COMMAND</button>
        </div>
      `;
      return;
    }

    // Smooth transition
    this.container.classList.add("screen-fade-out");
    setTimeout(() => {
      this.container.innerHTML = "";
      renderer(this.container, state, (target) => this.navigate(target));
      this.container.classList.remove("screen-fade-out");
      this.container.classList.add("screen-fade-in");
      setTimeout(() => {
        this.container.classList.remove("screen-fade-in");
      }, 250);
    }, 80);
  }
}

export const router = new NativeRouter();
