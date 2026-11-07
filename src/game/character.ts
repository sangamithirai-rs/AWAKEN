import type {
  CharacterProfile,
  HunterClass,
  HunterSpecialization,
  ProgressionClass,
} from "../types/game";

export const hunterClasses: {
  id: HunterClass;
  name: string;
  description: string;
  progressionClass: ProgressionClass;
  linkedAttributes: string;
  passive: string;
  evolution: { level: number; classXP: number; title: string }[];
  specializations: {
    id: HunterSpecialization;
    name: string;
  }[];
}[] = [
  {
    id: "VANGUARD",
    name: "Vanguard",
    description: "Front-line hunters built around physical resilience and decisive action.",
    progressionClass: "WARRIOR",
    linkedAttributes: "STRENGTH · VITALITY",
    passive: "+10% XP from physical quests.",
    evolution: [
      { level: 3, classXP: 250, title: "Iron Vanguard" },
      { level: 10, classXP: 1500, title: "Aegis Vanguard" },
      { level: 20, classXP: 4000, title: "Unbroken Vanguard" },
    ],
    specializations: [
      { id: "WARDEN", name: "Warden" },
      { id: "STRIKER", name: "Striker" },
    ],
  },
  {
    id: "TACTICIAN",
    name: "Tactician",
    description: "Analytical hunters who turn study and focus into deliberate progress.",
    progressionClass: "SCHOLAR",
    linkedAttributes: "INTELLIGENCE · STUDY",
    passive: "+10% XP from study and analysis quests.",
    evolution: [
      { level: 3, classXP: 250, title: "Field Analyst" },
      { level: 10, classXP: 1500, title: "Gate Savant" },
      { level: 20, classXP: 4000, title: "Grand Strategist" },
    ],
    specializations: [
      { id: "SEER", name: "Seer" },
      { id: "ARCHIVIST", name: "Archivist" },
    ],
  },
  {
    id: "ARTISAN",
    name: "Artisan",
    description: "Creative hunters who shape ideas into practical work and finished projects.",
    progressionClass: "ARCHITECT",
    linkedAttributes: "CREATIVITY · PROJECTS",
    passive: "+10% XP from creative and project quests.",
    evolution: [
      { level: 3, classXP: 250, title: "Patternwright" },
      { level: 10, classXP: 1500, title: "Rift Architect" },
      { level: 20, classXP: 4000, title: "World Shaper" },
    ],
    specializations: [
      { id: "FORGEMIND", name: "Forgemind" },
      { id: "ILLUSIONIST", name: "Illusionist" },
    ],
  },
  {
    id: "WARRIOR",
    name: "Warrior",
    description: "Build physical capacity through movement, strength, and recovery.",
    progressionClass: "WARRIOR",
    linkedAttributes: "STRENGTH · VITALITY",
    passive: "+10% XP from physical quests.",
    evolution: [
      { level: 3, classXP: 250, title: "Ironbound" },
      { level: 10, classXP: 1500, title: "Battleforged" },
      { level: 20, classXP: 4000, title: "Titan" },
    ],
    specializations: [
      { id: "IRONWALL", name: "Ironwall" },
      { id: "BERSERKER", name: "Berserker" },
    ],
  },
  {
    id: "SCHOLAR",
    name: "Scholar",
    description: "Turn study, research, and clear thinking into lasting mastery.",
    progressionClass: "SCHOLAR",
    linkedAttributes: "INTELLIGENCE · STUDY",
    passive: "+10% XP from study and analysis quests.",
    evolution: [
      { level: 3, classXP: 250, title: "Field Analyst" },
      { level: 10, classXP: 1500, title: "Gate Savant" },
      { level: 20, classXP: 4000, title: "Grand Strategist" },
    ],
    specializations: [
      { id: "ORACLE", name: "Oracle" },
      { id: "SAGE", name: "Sage" },
    ],
  },
  {
    id: "SHADOW_HUNTER",
    name: "Shadow Hunter",
    description: "Develop technical fluency through coding, security, and deliberate practice.",
    progressionClass: "SHADOW_HUNTER",
    linkedAttributes: "TECHNICAL · CODING",
    passive: "+10% XP from coding and technical quests.",
    evolution: [
      { level: 3, classXP: 250, title: "Signal Reader" },
      { level: 10, classXP: 1500, title: "Night Operator" },
      { level: 20, classXP: 4000, title: "Shadow Savant" },
    ],
    specializations: [
      { id: "NIGHTSTALKER", name: "Nightstalker" },
      { id: "BREAKER", name: "Breaker" },
    ],
  },
  {
    id: "ARCHITECT",
    name: "Architect",
    description: "Shape ideas into plans, systems, and finished creative work.",
    progressionClass: "ARCHITECT",
    linkedAttributes: "CREATIVITY · PROJECTS",
    passive: "+10% XP from creative and project quests.",
    evolution: [
      { level: 3, classXP: 250, title: "Patternwright" },
      { level: 10, classXP: 1500, title: "Rift Architect" },
      { level: 20, classXP: 4000, title: "World Shaper" },
    ],
    specializations: [
      { id: "INVENTOR", name: "Inventor" },
      { id: "VISIONARY", name: "Visionary" },
    ],
  },
  {
    id: "PHANTOM",
    name: "Phantom",
    description: "Master attention and consistency through focused, disciplined action.",
    progressionClass: "PHANTOM",
    linkedAttributes: "FOCUS · DISCIPLINE",
    passive: "+10% XP from focus sessions and discipline quests.",
    evolution: [
      { level: 3, classXP: 250, title: "Quiet Step" },
      { level: 10, classXP: 1500, title: "Stillpoint" },
      { level: 20, classXP: 4000, title: "Time Phantom" },
    ],
    specializations: [
      { id: "VEILWALKER", name: "Veilwalker" },
      { id: "TIMEKEEPER", name: "Timekeeper" },
    ],
  },
];

export function getProgressionClass(hunterClass: HunterClass): ProgressionClass {
  return hunterClasses.find((item) => item.id === hunterClass)?.progressionClass ?? "WARRIOR";
}

export function getHunterTitles(level: number, questCompletions: number): string[] {
  const titles = ["NEWLY AWAKENED"];
  if (questCompletions >= 1) titles.push("FIRST CONTRACT");
  if (questCompletions >= 10) titles.push("RELIABLE HUNTER");
  if (level >= 5) titles.push("RISING HUNTER");
  if (level >= 10) titles.push("GATE BREAKER");
  return titles;
}

export function getCharacterInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "H";
}

export function isSpecializationForClass(
  hunterClass: HunterClass,
  specialization: HunterSpecialization,
) {
  return hunterClasses
    .find((item) => item.id === hunterClass)
    ?.specializations.some((item) => item.id === specialization) ?? false;
}

export function normalizeCharacterProfile(
  profile: CharacterProfile,
): CharacterProfile | null {
  const name = profile.name.trim().replace(/\s+/g, " ").slice(0, 24);
  if (!name || !isSpecializationForClass(profile.hunterClass, profile.specialization)) {
    return null;
  }
  return { ...profile, name };
}
