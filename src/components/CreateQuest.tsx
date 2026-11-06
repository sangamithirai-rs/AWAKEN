import { useState } from "react";
import { Plus, X } from "lucide-react";
import type {
  Attribute,
  NewQuest,
  QuestCadence,
  QuestCategory,
  QuestKind,
  QuestPriority,
} from "../types/game";

type Difficulty = "EASY" | "NORMAL" | "HARD";

function isDifficulty(value: string): value is Difficulty {
  return value === "EASY" || value === "NORMAL" || value === "HARD";
}

type CreateQuestProps = {
  onCreate: (quest: NewQuest) => void;
  categories: string[];
  onAddCategory: (category: string) => string | null;
};

const builtInCategories = ["DAILY", "FITNESS", "STUDY", "CODING", "PROJECT", "SIDE", "PERSONAL"];

export default function CreateQuest({
  onCreate,
  categories,
  onAddCategory,
}: CreateQuestProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<QuestCategory>("DAILY");
  const [cadence, setCadence] = useState<QuestCadence>("DAILY");
  const [priority, setPriority] = useState<QuestPriority>("NORMAL");
  const [kind, setKind] = useState<QuestKind>("STANDARD");
  const [goalCount, setGoalCount] = useState(3);
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [categoryDraft, setCategoryDraft] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("NORMAL");
  const [attribute, setAttribute] = useState<Attribute>("discipline");

  const xpByDifficulty: Record<Difficulty, number> = {
    EASY: 50,
    NORMAL: 100,
    HARD: 150,
  };

  const defaultAttributeForType = (questType: QuestCategory): Attribute => {
    switch (questType) {
      case "FITNESS":
        return "strength";
      case "STUDY":
      case "CODING":
        return "intelligence";
      case "DAILY":
        return "discipline";
      case "PROJECT":
        return "focus";
      default:
        return "consistency";
    }
  };

  const handleTypeChange = (newType: QuestCategory) => {
    setType(newType);
    setAttribute(defaultAttributeForType(newType));
  };

  const handleAddCategory = () => {
    const category = onAddCategory(categoryDraft);
    if (!category) return;
    setType(category);
    setAttribute(defaultAttributeForType(category));
    setCategoryDraft("");
    setCreatingCategory(false);
  };

  const handleCreate = () => {
    if (!title.trim()) return;

    onCreate({
      title: title.trim(),
      description: description.trim() || "Custom System quest",
      xp: xpByDifficulty[difficulty] * (kind === "BOSS" ? goalCount : 1),
      type,
      attribute,
      cadence: kind === "BOSS" ? "ONCE" : cadence,
      priority,
      kind,
      goalCount: kind === "BOSS" ? goalCount : 1,
      currentCount: 0,
    });

    setTitle("");
    setDescription("");
    setType("DAILY");
    setCadence("DAILY");
    setPriority("NORMAL");
    setDifficulty("NORMAL");
    setAttribute("discipline");
    setKind("STANDARD");
    setGoalCount(3);
    setCreatingCategory(false);
    setCategoryDraft("");
    setOpen(false);
  };

  if (!open) {
    return (
      <button
        type="button"
        className="create-quest-button"
        onClick={() => setOpen(true)}
        aria-expanded={open}
      >
        <Plus size={16} />
        NEW QUEST
      </button>
    );
  }

  return (
    <div className="create-quest panel">
      <div className="create-quest-header">
        <div>
          <span className="system-label">SYSTEM</span>
          <h2>CREATE QUEST</h2>
        </div>

        <button
          type="button"
          className="close-quest"
          onClick={() => setOpen(false)}
          aria-label="Close"
        >
          <X size={16} />
        </button>
      </div>

      <form
        className="quest-form"
        onSubmit={(event) => {
          event.preventDefault();
          handleCreate();
        }}
      >
        <label htmlFor="quest-title">
          QUEST TITLE
          <input
            id="quest-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Enter objective (e.g. 100 Push-ups, 45m Coding)..."
            maxLength={70}
            required
            autoFocus
          />
        </label>

        <label htmlFor="quest-description">
          DESCRIPTION
          <textarea
            id="quest-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="What needs to be completed?"
            maxLength={200}
            rows={2}
          />
        </label>

        <div className="form-row">
          <label htmlFor="quest-category">
            CATEGORY
            <select
              id="quest-category"
              value={creatingCategory ? "__new_category__" : type}
              onChange={(event) => {
                if (event.target.value === "__new_category__") {
                  setCreatingCategory(true);
                  return;
                }
                setCreatingCategory(false);
                handleTypeChange(event.target.value);
              }}
            >
              {[...new Set([...builtInCategories, ...categories])].map((category) => (
                <option value={category} key={category}>{category}</option>
              ))}
              <option value="__new_category__">+ CREATE CATEGORY</option>
            </select>
          </label>

          <label htmlFor="quest-difficulty">
            DIFFICULTY
            <select
              id="quest-difficulty"
              value={difficulty}
              onChange={(event) => {
                if (isDifficulty(event.target.value)) {
                  setDifficulty(event.target.value);
                }
              }}
            >
              <option value="EASY">EASY (+50 XP)</option>
              <option value="NORMAL">NORMAL (+100 XP)</option>
              <option value="HARD">HARD (+150 XP)</option>
            </select>
          </label>
        </div>

        {creatingCategory && (
          <div className="custom-category-row">
            <label htmlFor="quest-new-category">
              NEW CATEGORY
              <input
                id="quest-new-category"
                value={categoryDraft}
                onChange={(event) => setCategoryDraft(event.target.value)}
                maxLength={24}
                placeholder="e.g. HEALTH"
              />
            </label>
            <button type="button" onClick={handleAddCategory} disabled={!categoryDraft.trim()}>
              ADD CATEGORY
            </button>
          </div>
        )}

        <div className="form-row">
          <label htmlFor="quest-kind">
            QUEST TYPE
            <select
              id="quest-kind"
              value={kind}
              onChange={(event) => {
                const nextKind = event.target.value as QuestKind;
                setKind(nextKind);
                if (nextKind === "BOSS") setCadence("ONCE");
              }}
            >
              <option value="STANDARD">STANDARD QUEST</option>
              <option value="BOSS">BOSS QUEST</option>
            </select>
          </label>

          {kind === "BOSS" ? (
            <label htmlFor="quest-goal-count">
              OBJECTIVE STEPS
              <input
                id="quest-goal-count"
                type="number"
                min={2}
                max={20}
                step={1}
                value={goalCount}
                onChange={(event) => {
                  const value = Number(event.target.value);
                  if (Number.isInteger(value) && value >= 2 && value <= 20) {
                    setGoalCount(value);
                  }
                }}
              />
            </label>
          ) : (
            <div className="quest-preview">
              <span>QUEST FLOW</span>
              <strong>ONE CLEAR // ONE REWARD</strong>
            </div>
          )}
        </div>

        <div className="form-row">
          <label htmlFor="quest-cadence">
            REPEAT
            <select
              id="quest-cadence"
              value={cadence}
              onChange={(event) => setCadence(event.target.value as QuestCadence)}
              disabled={kind === "BOSS"}
            >
              <option value="DAILY">DAILY</option>
              <option value="WEEKLY">WEEKLY</option>
              <option value="ONCE">ONE-TIME</option>
            </select>
          </label>

          <label htmlFor="quest-priority">
            PRIORITY
            <select
              id="quest-priority"
              value={priority}
              onChange={(event) => setPriority(event.target.value as QuestPriority)}
            >
              <option value="LOW">LOW</option>
              <option value="NORMAL">NORMAL</option>
              <option value="HIGH">HIGH</option>
            </select>
          </label>
        </div>

        <div className="form-row">
          <label htmlFor="quest-attribute">
            TARGET ATTRIBUTE
            <select
              id="quest-attribute"
              value={attribute}
              onChange={(event) => setAttribute(event.target.value as Attribute)}
            >
              <option value="strength">STRENGTH</option>
              <option value="intelligence">INTELLIGENCE</option>
              <option value="discipline">DISCIPLINE</option>
              <option value="focus">FOCUS</option>
              <option value="consistency">CONSISTENCY</option>
            </select>
          </label>

          <div className="quest-preview">
            <span>REWARD</span>
            <strong>
              +{xpByDifficulty[difficulty] * (kind === "BOSS" ? goalCount : 1)} XP // +1{" "}
              {attribute.toUpperCase()}
            </strong>
          </div>
        </div>

        <button
          type="submit"
          className="confirm-quest"
          disabled={!title.trim()}
        >
          <Plus size={15} />
          CREATE QUEST
        </button>
      </form>
    </div>
  );
}