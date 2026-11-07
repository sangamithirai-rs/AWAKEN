import { useState } from "react";
import { Activity, Clock3, Target, Zap } from "lucide-react";
import { getPeriodAnalytics, getWeeklyAnalytics } from "../game/analytics";
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
  const [period, setPeriod] = useState<"DAILY" | "WEEKLY" | "MONTHLY">("WEEKLY");
  const report = period === "WEEKLY"
    ? getWeeklyAnalytics(activityLog, focusSessions)
    : getPeriodAnalytics(activityLog, focusSessions, period);
  const previous = "previousWeek" in report ? report.previousWeek : report.previous;
  const maxXP = Math.max(1, ...report.days.map((day) => day.xp));
  const startLabel = new Date(`${report.startDate}T12:00:00`).toLocaleDateString([], {
    month: "short",
    day: "numeric",
  });
  const endLabel = new Date(`${report.endDate}T12:00:00`).toLocaleDateString([], {
    month: "short",
    day: "numeric",
  });
  const hasRecordedActivity =
    report.xp > 0 || report.quests > 0 || report.focusMinutes > 0 || report.activeDays > 0;
  const hasLegacyXPGap = report.quests > 0 && report.xp === 0;

  return (
    <section className="panel analytics-page">
      <div className="panel-corner" />
      <div className="quest-heading">
        <div>
          <span className="system-label">SYSTEM / {period} INTEL</span>
          <h2>PRODUCTIVITY ANALYTICS</h2>
        </div>
        <span>{startLabel}{period === "DAILY" ? "" : ` — ${endLabel}`}</span>
      </div>

      <nav className="analytics-period-tabs" aria-label="Analytics period">
        {(["DAILY", "WEEKLY", "MONTHLY"] as const).map((item) => (
          <button
            type="button"
            key={item}
            className={period === item ? "active" : ""}
            aria-pressed={period === item}
            onClick={() => setPeriod(item)}
          >
            {item}
          </button>
        ))}
      </nav>

      <div className="analytics-metrics">
        <Metric label="LOGGED XP" value={report.xp} previous={previous.xp} icon={Zap} />
        <Metric label="QUEST CLEARS" value={report.quests} previous={previous.quests} icon={Target} />
        <Metric
          label="FOCUS TIME"
          value={report.focusMinutes}
          previous={previous.focusMinutes}
          icon={Clock3}
          suffix="m"
        />
        <article className="analytics-metric">
          <div className="analytics-metric-icon"><Activity size={17} /></div>
          <span>ACTIVE DAYS</span>
          <strong>{report.activeDays}<small> / {period === "DAILY" ? 1 : period === "WEEKLY" ? 7 : new Date().getDate()}</small></strong>
          <small>days with recorded activity</small>
        </article>
      </div>

      {hasLegacyXPGap && (
        <aside className="analytics-data-notice" role="status">
          <strong>LEGACY RECORD DETECTED</strong>
          <p>
            {report.quests} quest {report.quests === 1 ? "clear is" : "clears are"} recorded,
            but this save does not contain their XP amounts. The chart shows recorded XP only;
            no rewards are estimated.
          </p>
        </aside>
      )}

      <section className="analytics-chart" aria-labelledby="analytics-chart-title">
        <div className="analytics-chart-heading">
          <div>
            <span className="system-label">{period} OUTPUT</span>
            <h3 id="analytics-chart-title">{period === "MONTHLY" ? "XP BY DATE" : "XP BY DAY"}</h3>
          </div>
            <span>{report.xp.toLocaleString()} XP TOTAL</span>
        </div>
        {hasRecordedActivity ? (
          <div className={`analytics-bars analytics-bars-${period.toLowerCase()}`}>
              {report.days.map((day) => (
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
                <span>{period === "MONTHLY" ? Number(day.date.slice(-2)) : day.label}</span>
                <small>{day.quests} {day.quests === 1 ? "clear" : "clears"} · {day.focusMinutes}m</small>
              </div>
            ))}
          </div>
        ) : (
          <div className="analytics-empty">
            <strong>NO ACTIVITY RECORDED THIS WEEK</strong>
            <p>Complete a quest or focus session to start building your weekly record.</p>
          </div>
        )}
      </section>

      <p className="analytics-note">
        Compared with the same elapsed period. Older saves may not include dates or XP amounts
        for some quest types, so only recorded activity is shown.
      </p>
    </section>
  );
}
