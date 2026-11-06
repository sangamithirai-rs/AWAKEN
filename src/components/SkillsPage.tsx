import { Brain, Shield, Target, Zap } from "lucide-react";

type SkillsPageProps = {
  level: number;
};

export default function SkillsPage({ level }: SkillsPageProps) {
  const skills = [
    {
      name: "IRON WILL",
      type: "STARTER MILESTONE",
      description: "Your starting System record. Quest clears grow the attribute linked to each objective.",
      icon: Shield,
      requiredLevel: 1,
    },
    {
      name: "DEEP FOCUS",
      type: "FOCUS MILESTONE",
      description: "Complete a timed Focus session to earn XP. Reach Level 2 to register this milestone.",
      icon: Target,
      requiredLevel: 2,
    },
    {
      name: "RAPID COMPREHENSION",
      type: "HUNTER MILESTONE",
      description: "Reach Level 3 to register this milestone. Quest clears continue to grow their linked attributes.",
      icon: Brain,
      requiredLevel: 3,
    },
    {
      name: "MONARCH OVERDRIVE",
      type: "RANK MILESTONE",
      description: "Reach Level 5 to advance to Rank E+ and register this System milestone.",
      icon: Zap,
      requiredLevel: 5,
    },
  ];

  const unlockedCount = skills.filter(
    (skill) => level >= skill.requiredLevel
  ).length;

  return (
    <section className="skills-page">
      <div className="panel-corner" />

      <div className="quest-heading">
        <div>
          <span>SYSTEM / HUNTER MILESTONES</span>
          <h2>SKILLS</h2>
        </div>

        <span>{unlockedCount}/{skills.length}</span>
      </div>

      <div className="skills-grid">
        {skills.map((skill) => {
          const Icon = skill.icon;
          const unlocked = level >= skill.requiredLevel;

          return (
            <div
              className={`skill-card ${unlocked ? "unlocked" : "locked"}`}
              key={skill.name}
            >
              <div className="skill-icon">
                <Icon size={22} />
              </div>

              <div className="skill-content">
                <span className="skill-type">{skill.type}</span>
                <h3>{skill.name}</h3>
                <p>{skill.description}</p>
              </div>

              <div className="skill-status">
                {unlocked
                  ? "MILESTONE REACHED"
                  : `LV. ${skill.requiredLevel} REQUIRED`}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}