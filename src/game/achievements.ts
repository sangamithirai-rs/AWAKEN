export type AchievementId =
  | "FIRST_AWAKENING"
  | "DISCIPLINED"
  | "KNOWLEDGE_SEEKER"
  | "FOCUS_PROTOCOL"
  | "RISING_HUNTER"
  | "SHADOW_MONARCH";

type AchievementDefinition = {
  id: AchievementId;
  title: string;
  description: string;
  requirement: "QUESTS" | "LEVEL";
  target: number;
};

export const achievementDefinitions: AchievementDefinition[] = [
  {
    id: "FIRST_AWAKENING",
    title: "FIRST AWAKENING",
    description: "Complete your first System quest.",
    requirement: "QUESTS",
    target: 1,
  },
  {
    id: "DISCIPLINED",
    title: "DISCIPLINED",
    description: "Complete 3 quests.",
    requirement: "QUESTS",
    target: 3,
  },
  {
    id: "KNOWLEDGE_SEEKER",
    title: "KNOWLEDGE SEEKER",
    description: "Complete 5 quests.",
    requirement: "QUESTS",
    target: 5,
  },
  {
    id: "FOCUS_PROTOCOL",
    title: "FOCUS PROTOCOL",
    description: "Reach Level 2.",
    requirement: "LEVEL",
    target: 2,
  },
  {
    id: "RISING_HUNTER",
    title: "RISING HUNTER",
    description: "Reach Level 5.",
    requirement: "LEVEL",
    target: 5,
  },
  {
    id: "SHADOW_MONARCH",
    title: "SHADOW MONARCH",
    description: "Reach Level 10.",
    requirement: "LEVEL",
    target: 10,
  },
];

export function getAchievementProgress(level: number, questCompletions: number) {
  return achievementDefinitions.map((achievement) => {
    const current = achievement.requirement === "LEVEL" ? level : questCompletions;
    return {
      ...achievement,
      progress: Math.min(current, achievement.target),
      unlocked: current >= achievement.target,
    };
  });
}
