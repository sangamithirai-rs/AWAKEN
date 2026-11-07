import { Sparkles } from "lucide-react";
import SystemNav, { type Page } from "./SystemNav";

type SystemSidebarProps = {
  activePage: Page;
  level: number;
  rank: string;
  hunterName: string;
  setActivePage: (page: Page) => void;
};

export default function SystemSidebar({
  activePage,
  level,
  rank,
  hunterName,
  setActivePage,
}: SystemSidebarProps) {
  return (
    <aside className="system-sidebar">
      <button
        className="sidebar-brand"
        type="button"
        onClick={() => setActivePage("SYSTEM")}
        aria-label="AWAKEN system home"
      >
        <span className="sidebar-brand-mark">
          <Sparkles size={20} />
        </span>
        <span>
          <strong>AWAKEN</strong>
          <small>HUNTER SYSTEM</small>
        </span>
      </button>

      <div className="sidebar-section-label">OPERATIONS</div>
      <SystemNav activePage={activePage} setActivePage={setActivePage} />

      <div className="sidebar-hunter-card">
        <span className="sidebar-player-label">ACTIVE HUNTER</span>
        <strong>{hunterName}</strong>
        <div>
          <span>LV. {String(level).padStart(2, "0")}</span>
          <span>RANK {rank}</span>
        </div>
      </div>
    </aside>
  );
}
