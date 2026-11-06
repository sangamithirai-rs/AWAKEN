import type { ElementType } from "react";

export type Attributes = {
  strength: number;
  intelligence: number;
  discipline: number;
  focus: number;
  consistency: number;
};

export type Attribute = keyof Attributes;

export type Quest = {
  id: string;
  title: string;
  description: string;
  xp: number;
  icon: ElementType;
  attribute: Attribute;
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
};

export type NewQuest = Omit<CustomQuest, "id">;
