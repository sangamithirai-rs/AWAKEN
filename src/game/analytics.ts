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

export type PeriodAnalytics = {
  startDate: string;
  endDate: string;
  xp: number;
  quests: number;
  focusMinutes: number;
  activeDays: number;
  days: AnalyticsDay[];
  previous: {
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
  durationDays = 7,
) {
  const endDate = addLocalDays(startDate, durationDays - 1);
  const dates = Array.from({ length: durationDays }, (_, index) => addLocalDays(startDate, index));
  const days = dates.map((date) => {
    const dayEvents = date <= includeThrough
      ? events.filter((event) => event.activityDate === date)
      : [];
    const productivityEvents = dayEvents.filter((event) => event.kind !== "SYSTEM_REWARD");
    const daySessions = sessions.filter(
      (session) => date <= includeThrough && getLocalDateFromISO(session.completedAt) === date,
    );
    return {
      date,
      label: new Date(`${date}T12:00:00`).toLocaleDateString([], { weekday: "short" }),
      xp: productivityEvents.reduce((total, event) => total + event.xp, 0),
      quests: productivityEvents.filter((event) => event.kind === "QUEST").length,
      focusMinutes: daySessions.reduce((total, session) => total + session.durationMinutes, 0),
      active: date <= includeThrough && (productivityEvents.length > 0 || daySessions.length > 0),
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

export function getPeriodAnalytics(
  events: ActivityEvent[],
  sessions: FocusSession[],
  period: "DAILY" | "MONTHLY",
  date = new Date(),
): PeriodAnalytics {
  const today = getLocalDateKey(date);
  const [year, month] = today.split("-").map(Number);
  const startDate = period === "DAILY"
    ? today
    : getLocalDateKey(new Date(year, month - 1, 1, 12));
  const elapsedDays = period === "DAILY"
    ? 1
    : Number(today.slice(-2));
  const previousDate = period === "DAILY"
    ? addLocalDays(today, -1)
    : getLocalDateKey(new Date(year, month - 2, 1, 12));
  const [previousYear, previousMonth] = previousDate.split("-").map(Number);
  const previousMonthDays = new Date(previousYear, previousMonth, 0).getDate();
  const previousEnd = period === "DAILY"
    ? previousDate
    : getLocalDateKey(new Date(
      previousYear,
      previousMonth - 1,
      Math.min(elapsedDays, previousMonthDays),
      12,
    ));
  const currentRange = summarizeRange(startDate, events, sessions, today, elapsedDays);
  const previousRange = summarizeRange(previousDate, events, sessions, previousEnd, elapsedDays);
  const days = period === "DAILY"
    ? currentRange.days.slice(0, 1)
    : currentRange.days.filter((day) => day.date <= today);
  return {
    startDate,
    endDate: today,
    xp: days.reduce((total, day) => total + day.xp, 0),
    quests: days.reduce((total, day) => total + day.quests, 0),
    focusMinutes: days.reduce((total, day) => total + day.focusMinutes, 0),
    activeDays: days.filter((day) => day.active).length,
    days,
    previous: {
      xp: previousRange.xp,
      quests: previousRange.quests,
      focusMinutes: previousRange.focusMinutes,
    },
  };
}
