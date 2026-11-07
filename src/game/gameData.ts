import { Brain, Code2, Crosshair, Target, Zap } from "lucide-react";
import type {
  Attribute,
  Attributes,
  CustomQuest,
  Quest,
  QuestCadence,
  QuestKind,
  QuestPriority,
} from "../types/game";

export const defaultAttributes: Attributes = {
  strength: 1,
  intelligence: 1,
  vitality: 1,
  discipline: 1,
  creativity: 1,
  focus: 1,
  consistency: 1,
};

export const defaultCharacterProfile = {
  name: "SAM",
  hunterClass: "VANGUARD",
  specialization: "WARDEN",
} as const;

export const dailyQuests: Quest[] = [
  {
    id: "daily-movement",
    title: "Hunter Conditioning",
    description:
      "Move your body for 20 minutes. A walk, workout, or mobility session counts.",
    xp: 100,
    icon: Zap,
    attribute: "strength",
    cadence: "DAILY",
    priority: "NORMAL",
    kind: "STANDARD",
    goalCount: 1,
    currentCount: 0,
    type: "DAILY",
  },
  {
    id: "daily-focus",
    title: "Gate Study",
    description: "Give one meaningful task 25 minutes of focused attention.",
    xp: 100,
    icon: Brain,
    attribute: "intelligence",
    cadence: "DAILY",
    priority: "NORMAL",
    kind: "STANDARD",
    goalCount: 1,
    currentCount: 0,
    type: "DAILY",
  },
  {
    id: "daily-plan",
    title: "System Check",
    description: "Choose your top priority and define the next action.",
    xp: 50,
    icon: Target,
    attribute: "discipline",
    cadence: "DAILY",
    priority: "NORMAL",
    kind: "STANDARD",
    goalCount: 1,
    currentCount: 0,
    type: "DAILY",
  },
];

export function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getLocalWeekKey(date = new Date()) {
  const monday = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  return getLocalDateKey(monday);
}

export function addLocalDays(dateKey: string, days: number) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(year, month - 1, day, 12);
  date.setDate(date.getDate() + days);
  return getLocalDateKey(date);
}

export function getQuestPeriodKey(questId: string, cadence: QuestCadence, date = new Date()) {
  const period = cadence === "DAILY"
    ? getLocalDateKey(date)
    : cadence === "WEEKLY"
      ? getLocalWeekKey(date)
      : "once";
  return JSON.stringify([questId, cadence, period]);
}

export function getQuestIcon(type?: string): Quest["icon"] {
  switch (type) {
    case "FITNESS":
      return Zap;
    case "STUDY":
      return Brain;
    case "CODING":
      return Code2;
    case "PROJECT":
      return Crosshair;
    default:
      return Target;
  }
}

export function getDefaultAttribute(type?: string): Attribute {
  switch (type) {
    case "FITNESS":
      return "strength";
    case "STUDY":
      return "intelligence";
    case "CODING":
    case "PROJECT":
      return "creativity";
    case "DAILY":
      return "discipline";
    default:
      return "consistency";
  }
}

export function getRank(level: number): string {
  if (level >= 50) return "S";
  if (level >= 30) return "A";
  if (level >= 20) return "B";
  if (level >= 15) return "C";
  if (level >= 10) return "D";
  if (level >= 5) return "E+";
  return "E";
}

export function combineQuests(customQuests: CustomQuest[]): Quest[] {
  return [
    ...dailyQuests,
    ...customQuests.map((quest) => ({
      id: quest.id,
      title: quest.title,
      description: quest.description,
      xp: quest.xp,
      icon: getQuestIcon(quest.type),
      attribute: quest.attribute ?? getDefaultAttribute(quest.type),
      cadence: quest.cadence ?? (quest.type === "DAILY" ? "DAILY" : "ONCE"),
      priority: quest.priority ?? ("NORMAL" satisfies QuestPriority),
      kind: (quest.kind ?? "STANDARD") satisfies QuestKind,
      goalCount: quest.kind === "BOSS" ? Math.max(2, quest.goalCount ?? 2) : 1,
      currentCount: quest.kind === "BOSS"
        ? Math.min(Math.max(2, quest.goalCount ?? 2), quest.currentCount ?? 0)
        : 0,
      type: quest.type,
      deletable: true,
    })),
  ];
}
