import type { ElementType } from "react";

export type Attributes = {
  strength: number;
  intelligence: number;
  vitality: number;
  discipline: number;
  creativity: number;
  focus: number;
  consistency: number;
};

export type Attribute = keyof Attributes;
export type ProgressionClass =
  | "WARRIOR"
  | "SCHOLAR"
  | "SHADOW_HUNTER"
  | "ARCHITECT"
  | "PHANTOM";
export type HunterClass =
  | "VANGUARD"
  | "TACTICIAN"
  | "ARTISAN"
  | ProgressionClass;
export type HunterSpecialization =
  | "WARDEN"
  | "STRIKER"
  | "SEER"
  | "ARCHIVIST"
  | "FORGEMIND"
  | "ILLUSIONIST"
  | "IRONWALL"
  | "BERSERKER"
  | "ORACLE"
  | "SAGE"
  | "NIGHTSTALKER"
  | "BREAKER"
  | "INVENTOR"
  | "VISIONARY"
  | "VEILWALKER"
  | "TIMEKEEPER";

export type CharacterProfile = {
  name: string;
  hunterClass: HunterClass;
  specialization: HunterSpecialization;
};

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
export type SkillTreeBranch = ProgressionClass;
export type SkillNodeId =
  | "WARRIOR_FOUNDATION"
  | "WARRIOR_MASTERY"
  | "WARRIOR_ASCENDANT"
  | "SCHOLAR_FOUNDATION"
  | "SCHOLAR_MASTERY"
  | "SCHOLAR_ASCENDANT"
  | "SHADOW_FOUNDATION"
  | "SHADOW_MASTERY"
  | "SHADOW_ASCENDANT"
  | "ARCHITECT_FOUNDATION"
  | "ARCHITECT_MASTERY"
  | "ARCHITECT_ASCENDANT"
  | "PHANTOM_FOUNDATION"
  | "PHANTOM_MASTERY"
  | "PHANTOM_ASCENDANT";
export type ActivityKind = "QUEST" | "FOCUS" | "BOSS_PROGRESS" | "SYSTEM_REWARD";
export type EquipmentSlot = "WEAPON" | "ARMOUR" | "ACCESSORY";
export type ItemCategory =
  | EquipmentSlot
  | "CONSUMABLE"
  | "COLLECTIBLE";
export type ItemRarity = "COMMON" | "UNCOMMON" | "RARE" | "EPIC" | "LEGENDARY";

export type OwnedItem = {
  itemId: string;
  quantity: number;
};

export type GameTransaction = {
  id: string;
  type: "PURCHASE" | "USE";
  itemId: string;
  quantity: number;
  gold: number;
  occurredAt: string;
};

export type ActivityEvent = {
  id: string;
  kind: ActivityKind;
  occurredAt: string;
  activityDate: string;
  xp: number;
  questId?: string;
};

export type SkillXP = Record<SkillBranch, number>;
export type SkillLevels = Record<SkillNodeId, number>;
export type ClassXP = Record<ProgressionClass, number>;
export type Equipment = Partial<Record<EquipmentSlot, string>>;

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
