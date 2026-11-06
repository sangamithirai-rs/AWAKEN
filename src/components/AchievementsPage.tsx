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
      unlocked: questCompletions >= 1,
    },
    {
      title: "DISCIPLINED",
      description: "Complete 3 quests.",
      icon: Shield,
      unlocked: questCompletions >= 3,
    },
    {
      title: "KNOWLEDGE SEEKER",
      description: "Complete 5 quests.",
      icon: Brain,
      unlocked: questCompletions >= 5,
    },
    {
      title: "FOCUS PROTOCOL",
      description: "Reach Level 2.",
      icon: Target,
      unlocked: level >= 2,
    },
    {
      title: "RISING HUNTER",
      description: "Reach Level 5.",
      icon: Flame,
      unlocked: level >= 5,
    },
    {
      title: "SHADOW MONARCH",
      description: "Reach Level 10.",
      icon: Zap,
      unlocked: level >= 10,
    },
  ];

  const unlockedCount = achievements.filter(
    (achievement) => achievement.unlocked
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
                  {achievement.unlocked ? "UNLOCKED" : "LOCKED"}
                </span>

                <h3>{achievement.title}</h3>

                <p>{achievement.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}