import type { ElementType } from "react";

export type Attributes = {
  strength: number;
  intelligence: number;
  discipline: number;
  focus: number;
  consistency: number;
};

export type Attribute = keyof Attributes;
export type QuestCadence = "DAILY" | "WEEKLY" | "ONCE";
export type QuestPriority = "LOW" | "NORMAL" | "HIGH";
export type BuiltInQuestCategory =
  | "DAILY"
  | "FITNESS"
  | "STUDY"
  | "CODING"
  | "PROJECT"
  | "SIDE"
  | "PERSONAL";
export type QuestCategory = BuiltInQuestCategory | (string & {});
export type QuestKind = "STANDARD" | "BOSS";
export type SkillBranch = "BODY" | "MIND" | "WILL";
export type ActivityKind = "QUEST" | "FOCUS" | "BOSS_PROGRESS";

export type ActivityEvent = {
  id: string;
  kind: ActivityKind;
  occurredAt: string;
  activityDate: string;
  xp: number;
  questId?: string;
};

export type SkillXP = Record<SkillBranch, number>;

export type Quest = {
  id: string;
  title: string;
  description: string;
  xp: number;
  icon: ElementType;
  attribute: Attribute;
  cadence: QuestCadence;
  priority: QuestPriority;
  kind: QuestKind;
  goalCount: number;
  currentCount: number;
  type?: string;
  deletable?: boolean;
};

export type CustomQuest = {
  id: string;
  title: string;
  description: string;
  xp: number;
  type: string;
  attribute?: Attribute;
  cadence?: QuestCadence;
  priority?: QuestPriority;
  kind?: QuestKind;
  goalCount?: number;
  currentCount?: number;
}

export type NewQuest = Omit<CustomQuest, "id">;

export type FocusSession = {
  id: string;
  task: string;
  durationMinutes: number;
  xp: number;
  completedAt: string;
};
