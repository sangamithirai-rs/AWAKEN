import { Volume2, VolumeX } from "lucide-react";
import type { Page } from "./SystemNav";

type SystemHeaderProps = {
  activePage: Page;
  completed: number;
  date: string;
  level: number;
  rank: string;
  soundEnabled: boolean;
  toggleSound: () => void;
  totalQuests: number;
  totalXP: number;
  time: string;
};

const pageTitles: Record<Page, string> = {
  SYSTEM: "HUNTER COMMAND",
  QUESTS: "QUEST OPERATIONS",
  FOCUS: "FOCUS PROTOCOL",
  ANALYTICS: "WEEKLY INTEL",
  SKILLS: "HUNTER MILESTONES",
  ACHIEVEMENTS: "RECORD OF CONQUEST",
  INVENTORY: "SYSTEM ARCHIVE",
};

export default function SystemHeader({
  activePage,
  completed,
  date,
  level,
  rank,
  soundEnabled,
  toggleSound,
  totalQuests,
  totalXP,
  time,
}: SystemHeaderProps) {
  return (
    <header className="system-header">
      <div className="header-context">
        <div className="system-status">
          <span />
          SYSTEM ONLINE
          <strong>{date} // {time}</strong>
        </div>
        <h1>{pageTitles[activePage]}</h1>
      </div>

      <div className="header-metrics" aria-label="Player summary stats">
        <div className="metric-card">
          <span>HUNTER RANK</span>
          <strong>{rank}</strong>
        </div>
        <div className="metric-card">
          <span>QUEST CLEARANCE</span>
          <strong>{completed}/{totalQuests}</strong>
        </div>
        <div className="metric-card">
          <span>EXPERIENCE</span>
          <strong>{totalXP.toLocaleString()} XP</strong>
        </div>
        <div className="metric-card header-level">
          <span>LEVEL</span>
          <strong>{String(level).padStart(2, "0")}</strong>
        </div>
      </div>

      <button
        className="sound-toggle"
        type="button"
        aria-label={soundEnabled ? "Mute system sounds" : "Enable system sounds"}
        aria-pressed={soundEnabled}
        title={soundEnabled ? "Mute system sounds" : "Enable system sounds"}
        onClick={toggleSound}
      >
        {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
        <span>SFX</span>
      </button>
    </header>
  );
}
