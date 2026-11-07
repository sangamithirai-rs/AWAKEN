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
            onClick={() => setFilter(item)}
          >
            {item === "IN_PROGRESS" ? "IN PROGRESS" : item}
          </button>
        ))}
      </nav>

      <div className="achievements-grid">
        {visibleAchievements.map((achievement) => {
          const Icon = icons[achievement.id];

          return (
            <div
              className={`achievement-card ${
                achievement.unlocked ? "unlocked" : "locked"
              }`}
              key={achievement.title}
            >
              <div className="achievement-icon">
                <Icon size={24} />
              </div>

              <div>
                <span className="achievement-status">
                  {achievement.unlocked ? "UNLOCKED" : "IN PROGRESS"}
                </span>

                <h3>{achievement.title}</h3>

                <p>{achievement.description}</p>
                <div
                  className="achievement-progress"
                  role="progressbar"
                  aria-label={`${achievement.title} progress`}
                  aria-valuemin={0}
                  aria-valuemax={achievement.target}
                  aria-valuenow={achievement.progress}
                >
                  <span style={{ width: `${(achievement.progress / achievement.target) * 100}%` }} />
                </div>
                <span className="achievement-progress-label">
                  {achievement.progress}/{achievement.target}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}