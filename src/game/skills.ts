import type {
  Attribute,
  ProgressionClass,
  SkillLevels,
  SkillNodeId,
} from "../types/game";
import type { ProgressionState } from "./progression";

export type SkillNodeDefinition = {
  id: SkillNodeId;
  branch: ProgressionClass;
  name: string;
  description: string;
  effect: string;
  requiredLevel: number;
  requiredBranchXP: number;
  prerequisite?: SkillNodeId;
  maxLevel: number;
  xpBonus: number;
  attributes?: Attribute[];
  questTypes?: string[];
};

export const skillBranches: {
  id: ProgressionClass;
  title: string;
  description: string;
  linkedActivities: string;
}[] = [
  {
    id: "WARRIOR",
    title: "WARRIOR",
    description: "Strength, movement, and physical recovery.",
    linkedActivities: "STRENGTH · VITALITY",
  },
  {
    id: "SCHOLAR",
    title: "SCHOLAR",
    description: "Study, research, and analytical work.",
    linkedActivities: "INTELLIGENCE · STUDY",
  },
  {
    id: "SHADOW_HUNTER",
    title: "SHADOW HUNTER",
    description: "Coding, security, and technical practice.",
    linkedActivities: "CODING · TECHNICAL",
  },
  {
    id: "ARCHITECT",
    title: "ARCHITECT",
    description: "Creative work, planning, and project building.",
    linkedActivities: "CREATIVITY · PROJECTS",
  },
  {
    id: "PHANTOM",
    title: "PHANTOM",
    description: "Focused sessions, discipline, and consistency.",
    linkedActivities: "FOCUS · DISCIPLINE",
  },
];

export const skillNodes: SkillNodeDefinition[] = [
  {
    id: "WARRIOR_FOUNDATION",
    branch: "WARRIOR",
    name: "IRON RHYTHM",
    description: "Build a steady training cadence.",
    effect: "+5% XP from physical quests per rank.",
    requiredLevel: 1,
    requiredBranchXP: 0,
    maxLevel: 3,
    xpBonus: 0.05,
    attributes: ["strength", "vitality"],
  },
  {
    id: "WARRIOR_MASTERY",
    branch: "WARRIOR",
    name: "KINETIC MASTERY",
    description: "Convert consistent movement into stronger gains.",
    effect: "+5% physical quest XP per rank.",
    requiredLevel: 5,
    requiredBranchXP: 250,
    prerequisite: "WARRIOR_FOUNDATION",
    maxLevel: 3,
    xpBonus: 0.05,
    attributes: ["strength", "vitality"],
  },
  {
    id: "WARRIOR_ASCENDANT",
    branch: "WARRIOR",
    name: "AWAKENED FRAME",
    description: "A high-tier physical progression discipline.",
    effect: "+5% physical quest XP per rank.",
    requiredLevel: 10,
    requiredBranchXP: 750,
    prerequisite: "WARRIOR_MASTERY",
    maxLevel: 3,
    xpBonus: 0.05,
    attributes: ["strength", "vitality"],
  },
  {
    id: "SCHOLAR_FOUNDATION",
    branch: "SCHOLAR",
    name: "CLEAR THOUGHT",
    description: "Turn deliberate study into durable understanding.",
    effect: "+5% XP from study and intelligence quests per rank.",
    requiredLevel: 1,
    requiredBranchXP: 0,
    maxLevel: 3,
    xpBonus: 0.05,
    attributes: ["intelligence"],
  },
  {
    id: "SCHOLAR_MASTERY",
    branch: "SCHOLAR",
    name: "DEEP SYNCHRONY",
    description: "Strengthen long-form learning and analysis.",
    effect: "+5% study and intelligence quest XP per rank.",
    requiredLevel: 5,
    requiredBranchXP: 250,
    prerequisite: "SCHOLAR_FOUNDATION",
    maxLevel: 3,
    xpBonus: 0.05,
    attributes: ["intelligence"],
  },
  {
    id: "SCHOLAR_ASCENDANT",
    branch: "SCHOLAR",
    name: "GATE ANALYST",
    description: "Apply accumulated knowledge to difficult challenges.",
    effect: "+5% study and intelligence quest XP per rank.",
    requiredLevel: 10,
    requiredBranchXP: 750,
    prerequisite: "SCHOLAR_MASTERY",
    maxLevel: 3,
    xpBonus: 0.05,
    attributes: ["intelligence"],
  },
  {
    id: "SHADOW_FOUNDATION",
    branch: "SHADOW_HUNTER",
    name: "TRACE READER",
    description: "Improve through hands-on technical practice.",
    effect: "+5% XP from coding and technical quests per rank.",
    requiredLevel: 1,
    requiredBranchXP: 0,
    maxLevel: 3,
    xpBonus: 0.05,
    questTypes: ["CODING", "TECH", "CYBERSECURITY"],
  },
  {
    id: "SHADOW_MASTERY",
    branch: "SHADOW_HUNTER",
    name: "QUIET EXECUTION",
    description: "Develop reliable habits for complex technical work.",
    effect: "+5% coding and technical quest XP per rank.",
    requiredLevel: 5,
    requiredBranchXP: 250,
    prerequisite: "SHADOW_FOUNDATION",
    maxLevel: 3,
    xpBonus: 0.05,
    questTypes: ["CODING", "TECH", "CYBERSECURITY"],
  },
  {
    id: "SHADOW_ASCENDANT",
    branch: "SHADOW_HUNTER",
    name: "NIGHT PROTOCOL",
    description: "Apply focused technical skill to the hardest missions.",
    effect: "+5% coding and technical quest XP per rank.",
    requiredLevel: 10,
    requiredBranchXP: 750,
    prerequisite: "SHADOW_MASTERY",
    maxLevel: 3,
    xpBonus: 0.05,
    questTypes: ["CODING", "TECH", "CYBERSECURITY"],
  },
  {
    id: "ARCHITECT_FOUNDATION",
    branch: "ARCHITECT",
    name: "BLUEPRINT SENSE",
    description: "Give creative ideas a clear next step.",
    effect: "+5% XP from creative and project quests per rank.",
    requiredLevel: 1,
    requiredBranchXP: 0,
    maxLevel: 3,
    xpBonus: 0.05,
    attributes: ["creativity"],
  },
  {
    id: "ARCHITECT_MASTERY",
    branch: "ARCHITECT",
    name: "FORM & FUNCTION",
    description: "Bring ambitious projects to a finished state.",
    effect: "+5% creative and project quest XP per rank.",
    requiredLevel: 5,
    requiredBranchXP: 250,
    prerequisite: "ARCHITECT_FOUNDATION",
    maxLevel: 3,
    xpBonus: 0.05,
    attributes: ["creativity"],
  },
  {
    id: "ARCHITECT_ASCENDANT",
    branch: "ARCHITECT",
    name: "REALITY ENGINE",
    description: "Build complex systems from original ideas.",
    effect: "+5% creative and project quest XP per rank.",
    requiredLevel: 10,
    requiredBranchXP: 750,
    prerequisite: "ARCHITECT_MASTERY",
    maxLevel: 3,
    xpBonus: 0.05,
    attributes: ["creativity"],
  },
  {
    id: "PHANTOM_FOUNDATION",
    branch: "PHANTOM",
    name: "STILLPOINT",
    description: "Protect attention and keep promises to yourself.",
    effect: "+5% focus and discipline XP per rank.",
    requiredLevel: 1,
    requiredBranchXP: 0,
    maxLevel: 3,
    xpBonus: 0.05,
    attributes: ["discipline", "focus", "consistency"],
  },
  {
    id: "PHANTOM_MASTERY",
    branch: "PHANTOM",
    name: "FLOW STATE",
    description: "Make sustained concentration more rewarding.",
    effect: "+5% focus and discipline XP per rank.",
    requiredLevel: 5,
    requiredBranchXP: 250,
    prerequisite: "PHANTOM_FOUNDATION",
    maxLevel: 3,
    xpBonus: 0.05,
    attributes: ["discipline", "focus", "consistency"],
  },
  {
    id: "PHANTOM_ASCENDANT",
    branch: "PHANTOM",
    name: "TIMELESS WILL",
    description: "Master a durable rhythm of deliberate work.",
    effect: "+5% focus and discipline XP per rank.",
    requiredLevel: 10,
    requiredBranchXP: 750,
    prerequisite: "PHANTOM_MASTERY",
    maxLevel: 3,
    xpBonus: 0.05,
    attributes: ["discipline", "focus", "consistency"],
  },
];

export function createEmptySkillLevels(): SkillLevels {
  return Object.fromEntries(skillNodes.map((node) => [node.id, 0])) as SkillLevels;
}

export function getSkillUnlockReason(
  node: SkillNodeDefinition,
  skillLevels: SkillLevels,
  skillPoints: number,
  level: number,
  branchXP: number,
) {
  const currentLevel = skillLevels[node.id];
  if (currentLevel >= node.maxLevel) return "MAX RANK REACHED";
  if (level < node.requiredLevel) return `REQUIRES HUNTER LV. ${node.requiredLevel}`;
  if (branchXP < node.requiredBranchXP) return `REQUIRES ${node.requiredBranchXP} BRANCH XP`;
  if (node.prerequisite && skillLevels[node.prerequisite] < 1) {
    const prerequisite = skillNodes.find((item) => item.id === node.prerequisite);
    return `UNLOCK ${prerequisite?.name ?? "PREREQUISITE"} FIRST`;
  }
  if (skillPoints < currentLevel + 1) return `NEED ${currentLevel + 1} SKILL POINT`;
  return null;
}

export function unlockSkill(
  current: ProgressionState,
  nodeId: SkillNodeId,
): { state: ProgressionState; success: boolean; reason: string | null } {
  const node = skillNodes.find((item) => item.id === nodeId);
  if (!node) return { state: current, success: false, reason: "SKILL_NOT_FOUND" };
  const level = Math.floor(current.xp / 1000) + 1;
  const reason = getSkillUnlockReason(
    node,
    current.skillLevels,
    current.skillPoints,
    level,
    current.branchXP[node.branch],
  );
  if (reason) return { state: current, success: false, reason };
  const nextLevel = current.skillLevels[node.id] + 1;
  return {
    state: {
      ...current,
      skillPoints: current.skillPoints - nextLevel,
      skillLevels: { ...current.skillLevels, [node.id]: nextLevel },
    },
    success: true,
    reason: null,
  };
}

export function getSkillXPBonus(
  skillLevels: SkillLevels,
  input: {
    branch: ProgressionClass;
    attribute?: Attribute;
    questType?: string;
    focusSession?: boolean;
  },
) {
  return skillNodes.reduce((bonus, node) => {
    if (node.branch !== input.branch) return bonus;
    const matchesAttribute = input.attribute !== undefined
      && node.attributes?.includes(input.attribute);
    const matchesQuestType = input.questType !== undefined
      && node.questTypes?.includes(input.questType.toUpperCase());
    return matchesAttribute || matchesQuestType
      ? bonus + node.xpBonus * skillLevels[node.id]
      : bonus;
  }, 0);
}
