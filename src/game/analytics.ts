import { addLocalDays, getLocalDateKey, getLocalWeekKey } from "./gameData";
import type { ActivityEvent, FocusSession } from "../types/game";

export type AnalyticsDay = {
  date: string;
  label: string;
  xp: number;
  quests: number;
  focusMinutes: number;
  active: boolean;
};

export type WeeklyAnalytics = {
  startDate: string;
  endDate: string;
  xp: number;
  quests: number;
  focusMinutes: number;
  activeDays: number;
  days: AnalyticsDay[];
  previousWeek: {
    xp: number;
    quests: number;
    focusMinutes: number;
  };
};

function getLocalDateFromISO(value: string) {
  return getLocalDateKey(new Date(value));
}

function summarizeRange(
  startDate: string,
  events: ActivityEvent[],
  sessions: FocusSession[],
  includeThrough: string,
) {
  const endDate = addLocalDays(startDate, 6);
  const dates = Array.from({ length: 7 }, (_, index) => addLocalDays(startDate, index));
  const days = dates.map((date) => {
    const dayEvents = date <= includeThrough
      ? events.filter((event) => event.activityDate === date)
      : [];
    const daySessions = sessions.filter(
      (session) => date <= includeThrough && getLocalDateFromISO(session.completedAt) === date,
    );
    return {
      date,
      label: new Date(`${date}T12:00:00`).toLocaleDateString([], { weekday: "short" }),
      xp: dayEvents.reduce((total, event) => total + event.xp, 0),
      quests: dayEvents.filter((event) => event.kind === "QUEST").length,
      focusMinutes: daySessions.reduce((total, session) => total + session.durationMinutes, 0),
      active: date <= includeThrough && (dayEvents.length > 0 || daySessions.length > 0),
    };
  });
  return {
    startDate,
    endDate,
    xp: days.reduce((total, day) => total + day.xp, 0),
    quests: days.reduce((total, day) => total + day.quests, 0),
    focusMinutes: days.reduce((total, day) => total + day.focusMinutes, 0),
    activeDays: days.filter((day) => day.active).length,
    days,
  };
}

export function getWeeklyAnalytics(
  events: ActivityEvent[],
  sessions: FocusSession[],
  date = new Date(),
): WeeklyAnalytics {
  const today = getLocalDateKey(date);
  const startDate = getLocalWeekKey(date);
  const current = summarizeRange(startDate, events, sessions, today);
  const previousStart = addLocalDays(startDate, -7);
  const elapsedDays = Math.min(
    7,
    Math.floor(
      (Date.parse(`${today}T12:00:00Z`) - Date.parse(`${startDate}T12:00:00Z`))
      / 86_400_000,
    ) + 1,
  );
  const previous = summarizeRange(
    previousStart,
    events,
    sessions,
    addLocalDays(previousStart, elapsedDays - 1),
  );
  return {
    ...current,
    previousWeek: {
      xp: previous.xp,
      quests: previous.quests,
      focusMinutes: previous.focusMinutes,
    },
  };
}
