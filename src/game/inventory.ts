import type {
  Attributes,
  Equipment,
  EquipmentSlot,
  GameTransaction,
  ItemCategory,
  ItemRarity,
  OwnedItem,
} from "../types/game";
import type { ProgressionState } from "./progression";

export type ItemDefinition = {
  id: string;
  name: string;
  description: string;
  rarity: ItemRarity;
  category: ItemCategory;
  price: number;
  requiredLevel: number;
  stackable?: boolean;
  slot?: EquipmentSlot;
  attributeBonus?: Partial<Attributes>;
  xpBonus?: number;
  xpBonusAttributes?: (keyof Attributes)[];
  focusXPBonus?: boolean;
  consumableXP?: number;
};

export const itemCatalog: ItemDefinition[] = [
  {
    id: "training-blade",
    name: "TRAINING BLADE",
    description: "A balanced practice weapon. Physical quests earn 5% more XP while equipped.",
    rarity: "COMMON",
    category: "WEAPON",
    slot: "WEAPON",
    price: 180,
    requiredLevel: 1,
    attributeBonus: { strength: 1 },
    xpBonus: 0.05,
    xpBonusAttributes: ["strength", "vitality"],
  },
  {
    id: "field-weave",
    name: "FIELD WEAVE",
    description: "Lightweight hunter armour that improves vitality and recovery records.",
    rarity: "UNCOMMON",
    category: "ARMOUR",
    slot: "ARMOUR",
    price: 260,
    requiredLevel: 2,
    attributeBonus: { vitality: 2 },
    xpBonus: 0.03,
    xpBonusAttributes: ["strength", "vitality"],
  },
  {
    id: "focus-sigil",
    name: "FOCUS SIGIL",
    description: "A tuned accessory that strengthens focus-session rewards.",
    rarity: "RARE",
    category: "ACCESSORY",
    slot: "ACCESSORY",
    price: 320,
    requiredLevel: 3,
    attributeBonus: { focus: 2 },
    xpBonus: 0.08,
    focusXPBonus: true,
  },
  {
    id: "scholar-lens",
    name: "SCHOLAR'S LENS",
    description: "An analysis aid that improves intelligence and study quest rewards.",
    rarity: "UNCOMMON",
    category: "ACCESSORY",
    slot: "ACCESSORY",
    price: 240,
    requiredLevel: 2,
    attributeBonus: { intelligence: 1 },
    xpBonus: 0.05,
    xpBonusAttributes: ["intelligence"],
  },
  {
    id: "architect-compass",
    name: "ARCHITECT'S COMPASS",
    description: "A creative instrument that sharpens project and creativity rewards.",
    rarity: "RARE",
    category: "WEAPON",
    slot: "WEAPON",
    price: 360,
    requiredLevel: 4,
    attributeBonus: { creativity: 2 },
    xpBonus: 0.06,
    xpBonusAttributes: ["creativity"],
  },
  {
    id: "discipline-band",
    name: "DISCIPLINE BAND",
    description: "A reminder of the next action. Supports focus, discipline, and consistency.",
    rarity: "UNCOMMON",
    category: "ACCESSORY",
    slot: "ACCESSORY",
    price: 220,
    requiredLevel: 2,
    attributeBonus: { discipline: 1, consistency: 1 },
    xpBonus: 0.04,
    xpBonusAttributes: ["discipline", "focus", "consistency"],
  },
  {
    id: "clarity-tonic",
    name: "CLARITY TONIC",
    description: "A single-use restorative granting 100 XP and one focus attribute point.",
    rarity: "COMMON",
    category: "CONSUMABLE",
    price: 120,
    requiredLevel: 1,
    stackable: true,
    consumableXP: 100,
  },
  {
    id: "shadow-crystal",
    name: "SHADOW CRYSTAL",
    description: "A collectible record of a hunter's first technical breakthrough.",
    rarity: "RARE",
    category: "COLLECTIBLE",
    price: 150,
    requiredLevel: 1,
  },
  {
    id: "gate-token",
    name: "GATE TOKEN",
    description: "A rare keepsake issued to hunters who prepare for difficult objectives.",
    rarity: "EPIC",
    category: "COLLECTIBLE",
    price: 500,
    requiredLevel: 5,
  },
];

export function getItem(itemId: string) {
  return itemCatalog.find((item) => item.id === itemId);
}

export function createEmptyEquipment(): Equipment {
  return {};
}

export function getOwnedQuantity(items: OwnedItem[], itemId: string) {
  return items.find((item) => item.itemId === itemId)?.quantity ?? 0;
}

function updateOwnedItems(items: OwnedItem[], itemId: string, delta: number): OwnedItem[] {
  const quantity = getOwnedQuantity(items, itemId) + delta;
  return [
    ...items.filter((item) => item.itemId !== itemId),
    ...(quantity > 0 ? [{ itemId, quantity }] : []),
  ];
}

function addTransaction(
  transactions: GameTransaction[],
  transaction: GameTransaction,
): GameTransaction[] {
  return [...transactions, transaction].slice(-500);
}

export function purchaseItem(
  current: ProgressionState,
  itemId: string,
  transactionId: string,
  occurredAt = new Date(),
) {
  const item = getItem(itemId);
  if (!item) return { state: current, success: false, reason: "ITEM_NOT_FOUND" as const };
  if (current.transactions.some((entry) => entry.id === transactionId)) {
    return { state: current, success: false, reason: "DUPLICATE_TRANSACTION" as const };
  }
  if (Math.floor(current.xp / 1000) + 1 < item.requiredLevel) {
    return { state: current, success: false, reason: "LEVEL_REQUIRED" as const };
  }
  if (!item.stackable && getOwnedQuantity(current.inventory, item.id) > 0) {
    return { state: current, success: false, reason: "ALREADY_OWNED" as const };
  }
  if (current.gold < item.price) {
    return { state: current, success: false, reason: "INSUFFICIENT_GOLD" as const };
  }
  const transaction: GameTransaction = {
    id: transactionId,
    type: "PURCHASE",
    itemId: item.id,
    quantity: 1,
    gold: item.price,
    occurredAt: occurredAt.toISOString(),
  };
  return {
    state: {
      ...current,
      gold: current.gold - item.price,
      inventory: updateOwnedItems(current.inventory, item.id, 1),
      transactions: addTransaction(current.transactions, transaction),
    },
    success: true,
    reason: null,
  };
}

export function equipItem(current: ProgressionState, itemId: string) {
  const item = getItem(itemId);
  if (!item?.slot) return { state: current, success: false, reason: "NOT_EQUIPMENT" as const };
  if (Math.floor(current.xp / 1000) + 1 < item.requiredLevel) {
    return { state: current, success: false, reason: "LEVEL_REQUIRED" as const };
  }
  if (getOwnedQuantity(current.inventory, itemId) < 1) {
    return { state: current, success: false, reason: "NOT_OWNED" as const };
  }
  const equipment = { ...current.equipment, [item.slot]: item.id };
  return { state: { ...current, equipment }, success: true, reason: null };
}

export function unequipItem(current: ProgressionState, slot: EquipmentSlot) {
  if (!current.equipment[slot]) {
    return { state: current, success: false, reason: "SLOT_EMPTY" as const };
  }
  const equipment = { ...current.equipment };
  delete equipment[slot];
  return { state: { ...current, equipment }, success: true, reason: null };
}

export function getEquippedEffects(
  equipment: Equipment,
  input?: { attribute?: keyof Attributes; focusSession?: boolean },
) {
  const effects = {
    attributeBonus: {} as Partial<Attributes>,
    xpBonus: 0,
  };
  for (const itemId of Object.values(equipment)) {
    if (!itemId) continue;
    const item = getItem(itemId);
    if (!item) continue;
    for (const [attribute, bonus] of Object.entries(item.attributeBonus ?? {})) {
      const key = attribute as keyof Attributes;
      effects.attributeBonus[key] = (effects.attributeBonus[key] ?? 0) + (bonus ?? 0);
    }
    if (!input) {
      effects.xpBonus += item.xpBonus ?? 0;
    } else if (
      input.focusSession
        ? item.focusXPBonus
        : input.attribute !== undefined && item.xpBonusAttributes?.includes(input.attribute)
    ) {
      effects.xpBonus += item.xpBonus ?? 0;
    }
  }
  return effects;
}

export function getEffectiveAttributes(
  base: Attributes,
  equipment: Equipment,
): Attributes {
  const bonuses = getEquippedEffects(equipment).attributeBonus;
  return {
    strength: base.strength + (bonuses.strength ?? 0),
    intelligence: base.intelligence + (bonuses.intelligence ?? 0),
    vitality: base.vitality + (bonuses.vitality ?? 0),
    discipline: base.discipline + (bonuses.discipline ?? 0),
    creativity: base.creativity + (bonuses.creativity ?? 0),
    focus: base.focus + (bonuses.focus ?? 0),
    consistency: base.consistency + (bonuses.consistency ?? 0),
  };
}

export function consumeItem(
  current: ProgressionState,
  itemId: string,
  transactionId: string,
  occurredAt = new Date(),
) {
  const item = getItem(itemId);
  if (!item || item.category !== "CONSUMABLE" || !item.consumableXP) {
    return { state: current, success: false, reason: "NOT_USABLE" as const };
  }
  if (current.transactions.some((entry) => entry.id === transactionId)) {
    return { state: current, success: false, reason: "DUPLICATE_TRANSACTION" as const };
  }
  if (getOwnedQuantity(current.inventory, itemId) < 1) {
    return { state: current, success: false, reason: "NOT_OWNED" as const };
  }
  const transaction: GameTransaction = {
    id: transactionId,
    type: "USE",
    itemId,
    quantity: 1,
    gold: 0,
    occurredAt: occurredAt.toISOString(),
  };
  return {
    state: {
      ...current,
      inventory: updateOwnedItems(current.inventory, itemId, -1),
      transactions: addTransaction(current.transactions, transaction),
    },
    success: true,
    reason: null,
    xp: item.consumableXP,
  };
}
