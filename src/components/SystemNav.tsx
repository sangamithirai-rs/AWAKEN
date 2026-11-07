import {
  Activity,
  Award,
  Backpack,
  ChartNoAxesColumnIncreasing,
  Clock3,
  Sparkles,
  Target,
  UserRound,
} from "lucide-react";

export type Page =
  | "SYSTEM"
  | "CHARACTER"
  | "QUESTS"
  | "FOCUS"
  | "ANALYTICS"
  | "SKILLS"
  | "ACHIEVEMENTS"
  | "INVENTORY";

type SystemNavProps = {
  activePage: Page;
  setActivePage: (page: Page) => void;
};

import { sound } from "../utils/soundEffects";

const compactLabels: Record<Page, string> = {
  SYSTEM: "SYS",
  CHARACTER: "HUNTER",
  QUESTS: "QUEST",
  FOCUS: "FOCUS",
  ANALYTICS: "INTEL",
  SKILLS: "SKILL",
  ACHIEVEMENTS: "BADGE",
  INVENTORY: "ITEMS",
};

export default function SystemNav({
  activePage,
  setActivePage,
}: SystemNavProps) {
  const items: { label: Page; icon: typeof Sparkles }[] = [
    { label: "SYSTEM", icon: Sparkles },
    { label: "CHARACTER", icon: UserRound },
    { label: "QUESTS", icon: Target },
    { label: "FOCUS", icon: Clock3 },
    { label: "ANALYTICS", icon: ChartNoAxesColumnIncreasing },
    { label: "SKILLS", icon: Activity },
    { label: "ACHIEVEMENTS", icon: Award },
    { label: "INVENTORY", icon: Backpack },
  ];

  const handlePageSelect = (page: Page) => {
    sound.playClick();
    setActivePage(page);
  };

  return (
    <nav className="system-nav" aria-label="Primary navigation">
      {items.map(({ label, icon: Icon }) => (
        <button
          type="button"
          key={label}
          onClick={() => handlePageSelect(label)}
          className={activePage === label ? "active" : ""}
          aria-label={label}
          aria-current={activePage === label ? "page" : undefined}
          aria-pressed={activePage === label}
        >
          <Icon size={15} />
          <span className="nav-label-full">{label}</span>
          <span className="nav-label-compact" aria-hidden="true">
            {compactLabels[label]}
          </span>
        </button>
      ))}
    </nav>
  );
}