import { motion } from "framer-motion";
import {
  Award,
  Coins,
  FlaskConical,
  Gem,
  PackageOpen,
  Shield,
  ShoppingBag,
  Sword,
  Swords,
} from "lucide-react";
import type {
  Equipment,
  EquipmentSlot,
  GameTransaction,
  OwnedItem,
} from "../types/game";
import { useState } from "react";
import { getItem, getOwnedQuantity, itemCatalog } from "../game/inventory";

type InventoryPageProps = {
  level: number;
  gold: number;
  inventory: OwnedItem[];
  equipment: Equipment;
  transactions: GameTransaction[];
  onPurchase: (itemId: string) => void;
  onEquip: (itemId: string) => void;
  onUnequip: (slot: EquipmentSlot) => void;
  onUse: (itemId: string) => void;
};

const slots: EquipmentSlot[] = ["WEAPON", "ARMOUR", "ACCESSORY"];

function getOwnedTitle(itemId: string, quantity: number) {
  const item = getItem(itemId);
  return item ? `${item.name}${quantity > 1 ? ` ×${quantity}` : ""}` : "EMPTY";
}

export default function InventoryPage({
  level,
  gold,
  inventory,
  equipment,
  transactions,
  onPurchase,
  onEquip,
  onUnequip,
  onUse,
}: InventoryPageProps) {
  const [tab, setTab] = useState<"LOADOUT" | "EXCHANGE" | "HISTORY">("LOADOUT");
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const ownedCount = inventory.reduce((total, item) => total + item.quantity, 0);
  const selectedOwnedItem = inventory.find((entry) => entry.itemId === selectedItemId);
  const selectedItem = selectedOwnedItem ? getItem(selectedOwnedItem.itemId) : undefined;
  const itemIcons = {
    WEAPON: Sword,
    ARMOUR: Shield,
    ACCESSORY: Gem,
    CONSUMABLE: FlaskConical,
    COLLECTIBLE: Award,
  };

  return (
    <section className="panel inventory-page" aria-labelledby="inventory-title">
      <div className="panel-corner" />
      <header className="quest-heading">
        <div>
          <span className="system-label">SYSTEM / ARMORY & EXCHANGE</span>
          <h2 id="inventory-title">INVENTORY</h2>
        </div>
        <div className="inventory-wallet" aria-live="polite">
          <Coins size={18} aria-hidden="true" />
          <strong>{gold.toLocaleString()}</strong> GOLD
        </div>
      </header>

      <nav className="inventory-tabs" aria-label="Inventory sections">
        {(["LOADOUT", "EXCHANGE", "HISTORY"] as const).map((item) => (
          <button
            type="button"
            key={item}
            className={tab === item ? "active" : ""}
            aria-pressed={tab === item}
            onClick={() => setTab(item)}
          >
            {item === "LOADOUT" ? `LOADOUT · ${ownedCount}` : item === "EXCHANGE" ? "SYSTEM EXCHANGE" : "TRANSACTION LOG"}
          </button>
        ))}
      </nav>

      {tab === "LOADOUT" && (
        <div className="inventory-loadout-layout">
      <section className="equipment-loadout" aria-labelledby="equipment-title">
        <div className="inventory-section-heading">
          <Swords size={18} aria-hidden="true" />
          <h3 id="equipment-title">ACTIVE LOADOUT</h3>
        </div>
        <div className="equipment-silhouette" aria-hidden="true">
          <svg viewBox="0 0 160 220">
            <path d="M56 27c3-14 12-21 24-21s21 7 24 21l-5 31c-2 14-8 22-19 22s-17-8-19-22z" />
            <path d="m47 75 33 16 33-16 21 24-12 37-18-8 13 82H43l13-82-18 8-12-37z" />
            <path d="m64 79 16 15 16-15-6 28H70z" />
            <path d="m47 97-15 45m81-45 15 45" />
          </svg>
          <span>HUNTER LOADOUT</span>
        </div>
        <div className="equipment-slots">
          {slots.map((slot) => {
            const equippedId = equipment[slot];
            const equippedItem = equippedId ? getItem(equippedId) : undefined;
            const ItemIcon = equippedItem ? itemIcons[equippedItem.category] : undefined;
            return (
              <article className={`equipment-slot ${equippedItem ? "filled" : ""}`} key={slot}>
                {ItemIcon && <ItemIcon size={16} aria-hidden="true" />}
                <span>{slot}</span>
                <strong>{equippedItem?.name ?? "EMPTY SLOT"}</strong>
                {equippedItem && (
                  <>
                    <small>{equippedItem.description}</small>
                    {equippedItem.attributeBonus && (
                      <small className="item-effect">
                        {Object.entries(equippedItem.attributeBonus)
                          .map(([attribute, value]) => `+${value} ${attribute.toUpperCase()}`)
                          .join(" · ")}
                      </small>
                    )}
                    <button type="button" onClick={() => onUnequip(slot)}>UNEQUIP</button>
                  </>
                )}
              </article>
            );
          })}
        </div>
      </section>

      <section className="owned-inventory" aria-labelledby="owned-title">
        <div className="inventory-section-heading">
          <PackageOpen size={18} aria-hidden="true" />
          <h3 id="owned-title">HUNTER INVENTORY</h3>
          <span>{ownedCount} ITEM{ownedCount === 1 ? "" : "S"}</span>
        </div>
        {inventory.length === 0 ? (
          <div className="inventory-empty">
            <PackageOpen size={24} aria-hidden="true" />
            <strong>NO ITEMS REGISTERED</strong>
            <span>Acquire equipment, supplies, or collectibles from the exchange below.</span>
          </div>
        ) : (
          <div className="inventory-grid">
            {inventory.map(({ itemId, quantity }) => {
              const item = getItem(itemId);
              if (!item) return null;
              const equipped = Object.values(equipment).includes(item.id);
              return (
                <motion.article
                  className={`inventory-item unlocked rarity-${item.rarity.toLowerCase()}`}
                  key={item.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  layout
                >
                  <div className="inventory-item-top">
                    {(() => {
                      const ItemIcon = itemIcons[item.category];
                      return <ItemIcon size={16} aria-hidden="true" />;
                    })()}
                    <span>{item.rarity} · {item.category}</span>
                    {quantity > 1 && <strong>×{quantity}</strong>}
                  </div>
                  <button
                    type="button"
                    className="item-detail-select"
                    aria-pressed={selectedItemId === item.id}
                    onClick={() => setSelectedItemId(item.id)}
                  >
                    {item.name}
                  </button>
                  <p>{item.description}</p>
                  {item.attributeBonus && (
                    <small className="item-effect">
                      EQUIPMENT EFFECT · {Object.entries(item.attributeBonus)
                        .map(([attribute, value]) => `+${value} ${attribute.toUpperCase()}`)
                        .join(" · ")}
                      {item.xpBonus ? ` · +${Math.round(item.xpBonus * 100)}% REWARD XP` : ""}
                    </small>
                  )}
                  <div className="inventory-item-actions">
                    {item.slot && (
                      <button
                        type="button"
                        disabled={equipped}
                        onClick={() => onEquip(item.id)}
                      >
                        {equipped ? "EQUIPPED" : "EQUIP"}
                      </button>
                    )}
                    {item.category === "CONSUMABLE" && (
                      <button type="button" onClick={() => onUse(item.id)}>USE ITEM</button>
                    )}
                    {!item.slot && item.category !== "CONSUMABLE" && (
                      <span className="inventory-owned-status">COLLECTION REGISTERED</span>
                    )}
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}
        {selectedItem && selectedOwnedItem && (
          <aside className={`inventory-item-briefing rarity-${selectedItem.rarity.toLowerCase()}`} aria-live="polite">
            <div className="inventory-item-briefing-icon">
              {(() => {
                const ItemIcon = itemIcons[selectedItem.category];
                return <ItemIcon size={22} aria-hidden="true" />;
              })()}
            </div>
            <div>
              <span>{selectedItem.rarity} · {selectedItem.category}</span>
              <h4>{selectedItem.name}</h4>
              <p>{selectedItem.description}</p>
            </div>
            <strong>OWNED ×{selectedOwnedItem.quantity}</strong>
          </aside>
        )}
      </section>
        </div>
      )}

      {tab === "EXCHANGE" && (
      <section className="shop-section" aria-labelledby="shop-title">
        <div className="inventory-section-heading">
          <ShoppingBag size={18} aria-hidden="true" />
          <h3 id="shop-title">SYSTEM EXCHANGE</h3>
          <span>AVAILABLE FOR PURCHASE</span>
        </div>
        <div className="inventory-grid shop-grid">
          {itemCatalog.map((item) => {
            const owned = getOwnedQuantity(inventory, item.id);
            const alreadyOwned = !item.stackable && owned > 0;
            const levelLocked = level < item.requiredLevel;
            const affordable = gold >= item.price;
            const disabled = alreadyOwned || levelLocked || !affordable;
            const status = alreadyOwned
              ? "OWNED"
              : levelLocked
                ? `LEVEL ${item.requiredLevel} REQUIRED`
                : !affordable
                  ? `NEED ${item.price - gold} MORE GOLD`
                  : "PURCHASE";
            return (
              <motion.article
                className={`inventory-item shop-item rarity-${item.rarity.toLowerCase()}`}
                key={item.id}
                whileHover={disabled ? undefined : { y: -3 }}
              >
                <div className="inventory-item-top">
                  {(() => {
                    const ItemIcon = itemIcons[item.category];
                    return <ItemIcon size={16} aria-hidden="true" />;
                  })()}
                  <span>{item.rarity} · {item.category}</span>
                  {item.requiredLevel > 1 && <strong>LV. {item.requiredLevel}+</strong>}
                </div>
                <h4>{item.name}</h4>
                <p>{item.description}</p>
                {item.attributeBonus && (
                  <small className="item-effect">
                    {Object.entries(item.attributeBonus)
                      .map(([attribute, value]) => `+${value} ${attribute.toUpperCase()}`)
                      .join(" · ")}
                    {item.xpBonus
                      ? ` · +${Math.round(item.xpBonus * 100)}% ${
                        item.focusXPBonus
                          ? "FOCUS SESSION"
                          : item.xpBonusAttributes?.map((attribute) => attribute.toUpperCase()).join("/")
                      } XP`
                      : ""}
                  </small>
                )}
                <button
                  type="button"
                  className="shop-purchase-button"
                  disabled={disabled}
                  onClick={() => onPurchase(item.id)}
                  aria-label={`Purchase ${item.name} for ${item.price} gold`}
                >
                  {status} {alreadyOwned ? "" : `· ${item.price} GOLD`}
                </button>
              </motion.article>
            );
          })}
        </div>
      </section>
      )}

      {tab === "HISTORY" && (
      <section className="transaction-history" aria-labelledby="transactions-title">
        <div className="inventory-section-heading">
          <Coins size={18} aria-hidden="true" />
          <h3 id="transactions-title">TRANSACTION LOG</h3>
        </div>
        {transactions.length === 0 ? (
          <p className="transaction-empty">No purchases or item usage recorded.</p>
        ) : (
          <ol>
            {[...transactions].reverse().slice(0, 8).map((transaction) => (
              <li key={transaction.id}>
                <span>{transaction.type} · {getOwnedTitle(transaction.itemId, transaction.quantity)}</span>
                <strong>
                  {transaction.type === "PURCHASE" ? `-${transaction.gold}` : "USED"}{" "}
                  {transaction.type === "PURCHASE" ? "GOLD" : ""}
                </strong>
                <time dateTime={transaction.occurredAt}>
                  {new Date(transaction.occurredAt).toLocaleString()}
                </time>
              </li>
            ))}
          </ol>
        )}
      </section>
      )}
    </section>
  );
}
