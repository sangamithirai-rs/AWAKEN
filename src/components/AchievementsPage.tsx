import { Award, Brain, Flame, Shield, Target, Zap } from "lucide-react";

type AchievementsPageProps = {
  level: number;
  questCompletions: number;
};

export default function AchievementsPage({
  level,
  questCompletions,
}: AchievementsPageProps) {
  const achievements = [
    {
      title: "FIRST AWAKENING",
      description: "Complete your first System quest.",
      icon: Award,
      progress: questCompletions,
      target: 1,
    },
    {
      title: "DISCIPLINED",
      description: "Complete 3 quests.",
      icon: Shield,
      progress: questCompletions,
      target: 3,
    },
    {
      title: "KNOWLEDGE SEEKER",
      description: "Complete 5 quests.",
      icon: Brain,
      progress: questCompletions,
      target: 5,
    },
    {
      title: "FOCUS PROTOCOL",
      description: "Reach Level 2.",
      icon: Target,
      progress: level,
      target: 2,
    },
    {
      title: "RISING HUNTER",
      description: "Reach Level 5.",
      icon: Flame,
      progress: level,
      target: 5,
    },
    {
      title: "SHADOW MONARCH",
      description: "Reach Level 10.",
      icon: Zap,
      progress: level,
      target: 10,
    },
  ];

  const unlockedCount = achievements.filter(
    (achievement) => achievement.progress >= achievement.target
  ).length;

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

      <div className="achievements-grid">
        {achievements.map((achievement) => {
          const Icon = achievement.icon;
          const unlocked = achievement.progress >= achievement.target;
          const progress = Math.min(achievement.progress, achievement.target);

          return (
            <div
              className={`achievement-card ${
                unlocked ? "unlocked" : "locked"
              }`}
              key={achievement.title}
            >
              <div className="achievement-icon">
                <Icon size={24} />
              </div>

              <div>
                <span className="achievement-status">
                  {unlocked ? "UNLOCKED" : "IN PROGRESS"}
                </span>

                <h3>{achievement.title}</h3>

                <p>{achievement.description}</p>
                <div
                  className="achievement-progress"
                  role="progressbar"
                  aria-label={`${achievement.title} progress`}
                  aria-valuemin={0}
                  aria-valuemax={achievement.target}
                  aria-valuenow={progress}
                >
                  <span style={{ width: `${(progress / achievement.target) * 100}%` }} />
                </div>
                <span className="achievement-progress-label">
                  {progress}/{achievement.target}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}