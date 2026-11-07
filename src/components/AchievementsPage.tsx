import { useState } from "react";
import { Award, Brain, Flame, Shield, Target, Zap } from "lucide-react";
import { getAchievementProgress, type AchievementId } from "../game/achievements";

type AchievementsPageProps = {
  level: number;
  questCompletions: number;
};

export default function AchievementsPage({
  level,
  questCompletions,
}: AchievementsPageProps) {
  const [filter, setFilter] = useState<"ALL" | "UNLOCKED" | "IN_PROGRESS">("ALL");
  const [selectedId, setSelectedId] = useState<AchievementId | null>(null);
  const icons: Record<AchievementId, typeof Award> = {
    FIRST_AWAKENING: Award,
    DISCIPLINED: Shield,
    KNOWLEDGE_SEEKER: Brain,
    FOCUS_PROTOCOL: Target,
    RISING_HUNTER: Flame,
    SHADOW_MONARCH: Zap,
  };
  const achievements = getAchievementProgress(level, questCompletions);

  const unlockedCount = achievements.filter(
    (achievement) => achievement.unlocked
  ).length;
  const visibleAchievements = achievements.filter((achievement) =>
    filter === "ALL"
      || (filter === "UNLOCKED" ? achievement.unlocked : !achievement.unlocked)
  );
  const selectedAchievement = visibleAchievements.find((item) => item.id === selectedId)
    ?? visibleAchievements.find((item) => item.unlocked)
    ?? visibleAchievements[0];

  return (
    <section className="panel achievements-page">
      <div className="panel-corner" />

      <div className="quest-heading">
        <div>
          <span>SYSTEM / ACHIEVEMENTS</span>
          <h2>ACHIEVEMENTS</h2>
        </div>

        <span>
          {unlockedCount}/{achievements.length}
        </span>
      </div>

      <nav className="achievement-filters" aria-label="Achievement filter">
        {(["ALL", "UNLOCKED", "IN_PROGRESS"] as const).map((item) => (
          <button
            type="button"
            key={item}
            className={filter === item ? "active" : ""}
            aria-pressed={filter === item}
            onClick={() => {
              setFilter(item);
              setSelectedId(null);
            }}
          >
            {item === "IN_PROGRESS" ? "IN PROGRESS" : item}
          </button>
        ))}
      </nav>

      <div className="achievement-record-layout">
        <div className="achievements-grid">
          {visibleAchievements.map((achievement) => {
            const Icon = icons[achievement.id];
            const isSelected = selectedAchievement?.id === achievement.id;
            return (
              <button
                type="button"
                className={`achievement-card ${achievement.unlocked ? "unlocked" : "locked"} ${isSelected ? "selected" : ""}`}
                key={achievement.title}
                aria-pressed={isSelected}
                onClick={() => setSelectedId(achievement.id)}
              >
                <span className="achievement-icon">
                  <Icon size={24} aria-hidden="true" />
                </span>
                <span className="achievement-card-copy">
                  <span className="achievement-status">
                    {achievement.unlocked ? "UNLOCKED" : "IN PROGRESS"}
                  </span>
                  <strong>{achievement.title}</strong>
                  <span className="achievement-card-progress">
                    <span style={{ width: `${(achievement.progress / achievement.target) * 100}%` }} />
                  </span>
                  <small>{achievement.progress}/{achievement.target}</small>
                </span>
              </button>
            );
          })}
        </div>
        {selectedAchievement && (
          <aside className={`achievement-feature ${selectedAchievement.unlocked ? "unlocked" : "locked"}`} aria-live="polite">
            {(() => {
              const Icon = icons[selectedAchievement.id];
              return <div className="achievement-feature-art"><Icon size={38} aria-hidden="true" /></div>;
            })()}
            <span className="system-label">{selectedAchievement.unlocked ? "CONQUEST RECORDED" : "NEXT MILESTONE"}</span>
            <h3>{selectedAchievement.title}</h3>
            <p>{selectedAchievement.description}</p>
            <div
              className="achievement-progress"
              role="progressbar"
              aria-label={`${selectedAchievement.title} progress`}
              aria-valuemin={0}
              aria-valuemax={selectedAchievement.target}
              aria-valuenow={selectedAchievement.progress}
            >
              <span style={{ width: `${(selectedAchievement.progress / selectedAchievement.target) * 100}%` }} />
            </div>
            <strong>{selectedAchievement.progress} / {selectedAchievement.target}</strong>
            <small>{selectedAchievement.unlocked ? "ACHIEVEMENT UNLOCKED" : "KEEP PROGRESSING TO UNLOCK"}</small>
          </aside>
        )}
      </div>
    </section>
  );
}