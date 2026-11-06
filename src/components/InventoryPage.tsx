import {
  FlaskConical,
  KeyRound,
  ShieldAlert,
  Sparkles,
  Terminal,
} from "lucide-react";

type InventoryPageProps = {
  level: number;
};

export default function InventoryPage({
  level,
}: InventoryPageProps) {
  const items = [
    {
      name: "FATIGUE RECOVERY ELIXIR",
      type: "SUPPLY",
      description: "A sealed field elixir recorded in the Hunter's archive.",
      icon: FlaskConical,
      requiredLevel: 1,
    },
    {
      name: "HUNTER REGISTRATION BADGE",
      type: "ARTIFACT",
      description: "Proof of Awakening, filed in the System archive.",
      icon: ShieldAlert,
      requiredLevel: 1,
    },
    {
      name: "SHADOW ESSENCE CRYSTAL",
      type: "MATERIAL",
      description: "A crystallized shadow remnant entered in the archive at Level 2.",
      icon: Sparkles,
      requiredLevel: 2,
    },
    {
      name: "DIMENSIONAL SYSTEM KEY",
      type: "EQUIPMENT",
      description: "A gate relic added to the archive when you reach Level 3.",
      icon: KeyRound,
      requiredLevel: 3,
    },
    {
      name: "MONARCH'S SYSTEM TERMINAL",
      type: "RELIC",
      description: "A sealed relic recorded for hunters who reach Level 5.",
      icon: Terminal,
      requiredLevel: 5,
    },
  ];

  const unlockedCount = items.filter(
    (item) => level >= item.requiredLevel
  ).length;

  return (
    <section className="panel inventory-page">
      <div className="panel-corner" />

      <div className="quest-heading">
        <div>
          <span>SYSTEM / INVENTORY</span>
          <h2>INVENTORY</h2>
        </div>

        <span>
          {unlockedCount}/{items.length}
        </span>
      </div>

      <div className="inventory-grid">
        {items.map((item) => {
          const Icon = item.icon;
          const unlocked = level >= item.requiredLevel;

          return (
            <div
              className={`inventory-item ${unlocked ? "unlocked" : "locked"}`}
              key={item.name}
            >
              <div className="inventory-icon">
                <Icon size={22} />
              </div>

              <div className="inventory-info">
                <span>{item.type}</span>
                <h3>{item.name}</h3>
                <p>{item.description}</p>
              </div>

              <div className="inventory-status">
                {unlocked ? "ARCHIVED" : `LV. ${item.requiredLevel} REQUIRED`}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}