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
  comparisonLabel,
  suffix = "",
}: {
  label: string;
  value: number;
  previous: number;
  icon: typeof Zap;
  comparisonLabel: string;
  suffix?: string;
}) {
  const difference = value - previous;

  return (
    <article className="analytics-metric">
      <div className="analytics-metric-icon"><Icon size={17} /></div>
      <span>{label}</span>
      <strong>{value.toLocaleString()}{suffix}</strong>
      <small>
        {difference > 0 ? "+" : ""}{difference.toLocaleString()}{suffix} vs {comparisonLabel}
      </small>
    </article>
  );
}

export default function AnalyticsPage({
  activityLog,
  focusSessions,
}: AnalyticsPageProps) {
  const [period, setPeriod] = useState<"DAILY" | "WEEKLY" | "MONTHLY">("WEEKLY");
  const [chartMetric, setChartMetric] = useState<"XP" | "QUESTS" | "FOCUS">("XP");
  const report = period === "WEEKLY"
    ? getWeeklyAnalytics(activityLog, focusSessions)
    : getPeriodAnalytics(activityLog, focusSessions, period);
  const previous = "previousWeek" in report ? report.previousWeek : report.previous;
  const chartValue = (day: typeof report.days[number]) => (
    chartMetric === "XP" ? day.xp : chartMetric === "QUESTS" ? day.quests : day.focusMinutes
  );
  const maxValue = Math.max(1, ...report.days.map(chartValue));
  const comparisonLabel = period === "DAILY"
    ? "prior day"
    : period === "WEEKLY"
      ? "prior week"
      : "prior month";
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
          <h2>WEEKLY INTEL</h2>
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
        <Metric label="LOGGED XP" value={report.xp} previous={previous.xp} icon={Zap} comparisonLabel={comparisonLabel} />
        <Metric label="QUEST CLEARS" value={report.quests} previous={previous.quests} icon={Target} comparisonLabel={comparisonLabel} />
        <Metric
          label="FOCUS TIME"
          value={report.focusMinutes}
          previous={previous.focusMinutes}
          icon={Clock3}
          comparisonLabel={comparisonLabel}
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
            <h3 id="analytics-chart-title">
              {chartMetric === "XP"
                ? period === "MONTHLY" ? "XP BY DATE" : "XP BY DAY"
                : chartMetric === "QUESTS" ? "QUEST CLEARS" : "FOCUS MINUTES"}
            </h3>
          </div>
          <span>
            {chartMetric === "XP"
              ? `${report.xp.toLocaleString()} XP TOTAL`
              : chartMetric === "QUESTS"
                ? `${report.quests} CLEARS TOTAL`
                : `${report.focusMinutes} FOCUS MINUTES`}
          </span>
        </div>
        <nav className="analytics-chart-tabs" aria-label="Activity chart metric">
          {(["XP", "QUESTS", "FOCUS"] as const).map((metric) => (
            <button
              type="button"
              key={metric}
              className={chartMetric === metric ? "active" : ""}
              aria-pressed={chartMetric === metric}
              onClick={() => setChartMetric(metric)}
            >
              {metric === "FOCUS" ? "FOCUS TIME" : metric}
            </button>
          ))}
        </nav>
        {hasRecordedActivity ? (
          <div className={`analytics-bars analytics-bars-${period.toLowerCase()}`}>
              {report.days.map((day) => (
              <div className="analytics-day" key={day.date}>
                <strong>{chartValue(day).toLocaleString()}</strong>
                <div
                  className="analytics-bar-track"
                  role="progressbar"
                  aria-label={`${day.label}: ${chartValue(day)} ${chartMetric === "XP" ? "XP" : chartMetric === "QUESTS" ? "quests" : "focus minutes"}`}
                  aria-valuemin={0}
                  aria-valuemax={maxValue}
                  aria-valuenow={chartValue(day)}
                >
                  <span style={{ height: `${Math.max(chartValue(day) ? 8 : 0, (chartValue(day) / maxValue) * 100)}%` }} />
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
