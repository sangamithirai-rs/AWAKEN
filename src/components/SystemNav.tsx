import {
  Activity,
  Award,
  Backpack,
  Clock3,
  Sparkles,
  Target,
} from "lucide-react";

export type Page =
  | "SYSTEM"
  | "QUESTS"
  | "FOCUS"
  | "SKILLS"
  | "ACHIEVEMENTS"
  | "INVENTORY";

type SystemNavProps = {
  activePage: Page;
  setActivePage: (page: Page) => void;
};

import { sound } from "../utils/soundEffects";

export default function SystemNav({
  activePage,
  setActivePage,
}: SystemNavProps) {
  const items: { label: Page; icon: typeof Sparkles }[] = [
    { label: "SYSTEM", icon: Sparkles },
    { label: "QUESTS", icon: Target },
    { label: "FOCUS", icon: Clock3 },
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
          aria-current={activePage === label ? "page" : undefined}
          aria-pressed={activePage === label}
        >
          <Icon size={15} />
          {label}
        </button>
      ))}
    </nav>
  );
}