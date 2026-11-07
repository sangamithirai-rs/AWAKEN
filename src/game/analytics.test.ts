import { describe, expect, it } from "vitest";
import { getPeriodAnalytics, getWeeklyAnalytics } from "./analytics";
import type { ActivityEvent, FocusSession } from "../types/game";

function event(
  id: string,
  date: string,
  kind: ActivityEvent["kind"],
  xp: number,
): ActivityEvent {
  return {
    id,
    kind,
    xp,
    activityDate: date,
    occurredAt: `${date}T12:00:00.000Z`,
  };
}

function session(id: string, localDate: Date, minutes: number): FocusSession {
  return {
    id,
    task: "Study",
    durationMinutes: minutes,
    xp: minutes * 2,
    completedAt: localDate.toISOString(),
  };
}

describe("weekly analytics", () => {
  it("aggregates the current week and compares the same elapsed days", () => {
    const events = [
      event("current-mon", "2026-04-06", "QUEST", 100),
      event("current-tue", "2026-04-07", "QUEST", 50),
      event("current-wed", "2026-04-08", "FOCUS", 50),
      event("current-sun-future", "2026-04-12", "QUEST", 300),
      event("previous-mon", "2026-03-30", "QUEST", 100),
      event("previous-tue", "2026-03-31", "QUEST", 100),
      event("previous-wed", "2026-04-01", "FOCUS", 20),
      event("previous-thu", "2026-04-02", "QUEST", 500),
    ];
    const sessions = [
      session("current-session", new Date(2026, 3, 7, 12), 25),
      session("previous-session", new Date(2026, 2, 31, 12), 10),
    ];

    const analytics = getWeeklyAnalytics(
      events,
      sessions,
      new Date(2026, 3, 8, 12),
    );

    expect(analytics.startDate).toBe("2026-04-06");
    expect(analytics.endDate).toBe("2026-04-12");
    expect(analytics.xp).toBe(200);
    expect(analytics.quests).toBe(2);
    expect(analytics.focusMinutes).toBe(25);
    expect(analytics.activeDays).toBe(3);
    expect(analytics.previousWeek).toEqual({
      xp: 220,
      quests: 2,
      focusMinutes: 10,
    });
    expect(analytics.days[6].xp).toBe(0);
  });

  it("returns zeros for a week with no recorded activity", () => {
    const analytics = getWeeklyAnalytics([], [], new Date(2026, 3, 8, 12));
    expect(analytics.xp).toBe(0);
    expect(analytics.quests).toBe(0);
    expect(analytics.focusMinutes).toBe(0);
    expect(analytics.activeDays).toBe(0);
  });

  it("excludes item-use rewards from real-world productivity analytics", () => {
    const analytics = getWeeklyAnalytics(
      [
        event("tonic-reward", "2026-04-08", "SYSTEM_REWARD", 100),
        event("quest", "2026-04-08", "QUEST", 50),
      ],
      [],
      new Date(2026, 3, 8, 12),
    );
    expect(analytics.xp).toBe(50);
    expect(analytics.quests).toBe(1);
    expect(analytics.activeDays).toBe(1);
  });

  it("builds daily and monthly reports from recorded data only", () => {
    const events = [
      event("month-start", "2026-04-01", "QUEST", 100),
      event("month-today", "2026-04-08", "QUEST", 50),
      event("last-month", "2026-03-08", "QUEST", 25),
    ];
    const daily = getPeriodAnalytics(events, [], "DAILY", new Date(2026, 3, 8, 12));
    const monthly = getPeriodAnalytics(events, [], "MONTHLY", new Date(2026, 3, 8, 12));
    expect(daily.xp).toBe(50);
    expect(daily.days).toHaveLength(1);
    expect(monthly.xp).toBe(150);
    expect(monthly.days).toHaveLength(8);
    expect(monthly.previous.xp).toBe(25);
  });
});
