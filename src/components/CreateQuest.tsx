import { useState } from "react";
import { Plus, X } from "lucide-react";

export type AttributeType =
  | "strength"
  | "intelligence"
  | "discipline"
  | "focus"
  | "consistency";

type Difficulty = "EASY" | "NORMAL" | "HARD";

function isDifficulty(value: string): value is Difficulty {
  return value === "EASY" || value === "NORMAL" || value === "HARD";
}

type CreateQuestProps = {
  onCreate: (quest: {
    title: string;
    description: string;
    xp: number;
    type: string;
    attribute: AttributeType;
  }) => void;
};

export default function CreateQuest({ onCreate }: CreateQuestProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("DAILY");
  const [difficulty, setDifficulty] = useState<Difficulty>("NORMAL");
  const [attribute, setAttribute] = useState<AttributeType>("discipline");

  const xpByDifficulty: Record<Difficulty, number> = {
    EASY: 50,
    NORMAL: 100,
    HARD: 150,
  };

  const defaultAttributeForType = (questType: string): AttributeType => {
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

  const handleTypeChange = (newType: string) => {
    setType(newType);
    setAttribute(defaultAttributeForType(newType));
  };

  const handleCreate = () => {
    if (!title.trim()) return;

    onCreate({
      title: title.trim(),
      description: description.trim() || "Custom System quest",
      xp: xpByDifficulty[difficulty as keyof typeof xpByDifficulty],
      type,
      attribute,
    });

    setTitle("");
    setDescription("");
    setType("DAILY");
    setDifficulty("NORMAL");
    setAttribute("discipline");
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
              value={type}
              onChange={(event) => handleTypeChange(event.target.value)}
            >
              <option value="DAILY">DAILY</option>
              <option value="FITNESS">FITNESS</option>
              <option value="STUDY">STUDY</option>
              <option value="CODING">CODING</option>
              <option value="PROJECT">PROJECT</option>
              <option value="SIDE">SIDE</option>
              <option value="PERSONAL">PERSONAL</option>
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

        <div className="form-row">
          <label htmlFor="quest-attribute">
            TARGET ATTRIBUTE
            <select
              id="quest-attribute"
              value={attribute}
              onChange={(event) =>
                setAttribute(event.target.value as AttributeType)
              }
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
              +{xpByDifficulty[difficulty as keyof typeof xpByDifficulty]} XP // +1{" "}
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