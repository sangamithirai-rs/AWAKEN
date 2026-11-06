import { Activity, Clock3, Target, Zap } from "lucide-react";
import { getWeeklyAnalytics } from "../game/analytics";
import type { ActivityEvent, FocusSession } from "../types/game";

type AnalyticsPageProps = {
  activityLog: ActivityEvent[];
  focusSessions: FocusSession[];
};

function Metric({
  label,
  value,
  previous,
  icon: Icon,
  suffix = "",
}: {
  label: string;
  value: number;
  previous: number;
  icon: typeof Zap;
  suffix?: string;
}) {
  const difference = value - previous;

  return (
    <article className="analytics-metric">
      <div className="analytics-metric-icon"><Icon size={17} /></div>
      <span>{label}</span>
      <strong>{value.toLocaleString()}{suffix}</strong>
      <small>
        {difference > 0 ? "+" : ""}{difference.toLocaleString()}{suffix} vs prior week-to-date
      </small>
    </article>
  );
}

export default function AnalyticsPage({
  activityLog,
  focusSessions,
}: AnalyticsPageProps) {
  const week = getWeeklyAnalytics(activityLog, focusSessions);
  const maxXP = Math.max(1, ...week.days.map((day) => day.xp));
  const startLabel = new Date(`${week.startDate}T12:00:00`).toLocaleDateString([], {
    month: "short",
    day: "numeric",
  });
  const endLabel = new Date(`${week.endDate}T12:00:00`).toLocaleDateString([], {
    month: "short",
    day: "numeric",
  });

  return (
    <section className="panel analytics-page">
      <div className="panel-corner" />
      <div className="quest-heading">
        <div>
          <span className="system-label">SYSTEM / WEEKLY INTEL</span>
          <h2>PRODUCTIVITY ANALYTICS</h2>
        </div>
        <span>{startLabel} — {endLabel}</span>
      </div>

      <div className="analytics-metrics">
        <Metric label="LOGGED XP" value={week.xp} previous={week.previousWeek.xp} icon={Zap} />
        <Metric label="QUEST CLEARS" value={week.quests} previous={week.previousWeek.quests} icon={Target} />
        <Metric
          label="FOCUS TIME"
          value={week.focusMinutes}
          previous={week.previousWeek.focusMinutes}
          icon={Clock3}
          suffix="m"
        />
        <article className="analytics-metric">
          <div className="analytics-metric-icon"><Activity size={17} /></div>
          <span>ACTIVE DAYS</span>
          <strong>{week.activeDays}<small> / 7</small></strong>
          <small>days with recorded activity</small>
        </article>
      </div>

      <section className="analytics-chart" aria-labelledby="analytics-chart-title">
        <div className="analytics-chart-heading">
          <div>
            <span className="system-label">WEEKLY OUTPUT</span>
            <h3 id="analytics-chart-title">XP BY DAY</h3>
          </div>
          <span>{week.xp.toLocaleString()} XP TOTAL</span>
        </div>
        <div className="analytics-bars">
          {week.days.map((day) => (
            <div className="analytics-day" key={day.date}>
              <strong>{day.xp.toLocaleString()}</strong>
              <div
                className="analytics-bar-track"
                role="progressbar"
                aria-label={`${day.label}: ${day.xp} XP`}
                aria-valuemin={0}
                aria-valuemax={maxXP}
                aria-valuenow={day.xp}
              >
                <span style={{ height: `${Math.max(day.xp ? 8 : 0, (day.xp / maxXP) * 100)}%` }} />
              </div>
              <span>{day.label}</span>
              <small>{day.quests} {day.quests === 1 ? "clear" : "clears"} · {day.focusMinutes}m</small>
            </div>
          ))}
        </div>
      </section>

      <p className="analytics-note">
        XP includes only rewards logged after the progression update and saved focus-session XP.
        Older daily quest dates are recovered, but prior one-time/weekly dates and quest XP amounts
        were not stored by the earlier save format.
        Week-over-week compares the same elapsed days; no activity is estimated.
      </p>
    </section>
  );
}
