import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { router } from "./router.js";
import { ROUTES } from "./constants.js";
import { store } from "./state.js";

describe("NativeRouter (Zero-Dependency Vanilla Screen Router)", () => {
  let mockContainer;
  let mockWindow;

  beforeEach(() => {
    mockContainer = {
      innerHTML: "",
      children: [],
      classList: {
        add: vi.fn(),
        remove: vi.fn(),
      },
    };

    mockWindow = {
      location: { hash: "" },
      addEventListener: vi.fn(),
    };

    vi.stubGlobal("window", mockWindow);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("registers routes and renders registered screens", async () => {
    let renderedScreen = null;

    router.register("TEST_ROUTE", (cont, state, nav) => {
      renderedScreen = "TEST_RENDERED";
      cont.innerHTML = "<div id='test-view'>TEST VIEW LOADED</div>";
    });

    router.init(mockContainer);
    router.navigate("TEST_ROUTE");

    // Wait for the smooth 80ms transition timeout in router
    await new Promise((r) => setTimeout(r, 120));

    expect(renderedScreen).toBe("TEST_RENDERED");
    expect(mockContainer.innerHTML).toContain("TEST VIEW LOADED");
    expect(store.getState().route).toBe("TEST_ROUTE");
  });

  it("handles unknown routes by displaying a graceful standby panel", async () => {
    router.init(mockContainer);
    router.renderRoute("NON_EXISTENT_ROUTE", store.getState());

    expect(mockContainer.innerHTML).toContain("SCREEN PROTOCOL STANDBY");
    expect(mockContainer.innerHTML).toContain("NON_EXISTENT_ROUTE");
  });
});
