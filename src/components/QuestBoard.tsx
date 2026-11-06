import { useMemo, useState } from "react";
import type { ElementType } from "react";
import { Check, Circle, RotateCcw, Trash2 } from "lucide-react";

type Quest = {
  id: string;
  title: string;
  description: string;
  xp: number;
  icon: ElementType;
  type?: string;
  deletable?: boolean;
};

type QuestBoardProps = {
  quests: Quest[];
  completedQuests: string[];
  onComplete: (questId: string) => void;
  onReset?: () => void;
  onDelete?: (questId: string) => void;
};

export default function QuestBoard({
  quests,
  completedQuests,
  onComplete,
  onReset,
  onDelete,
}: QuestBoardProps) {
  const [filter, setFilter] = useState("ALL");

  const filters = useMemo(() => {
    const categories = quests
      .map((q) => q.type)
      .filter((type): type is string => Boolean(type));
    return ["ALL", ...Array.from(new Set(categories))];
  }, [quests]);

  const filteredQuests = useMemo(() => {
    if (filter === "ALL") {
      return quests;
    }

    return quests.filter(
      (quest) => quest.type === filter
    );
  }, [quests, filter]);

  const completedCount = filteredQuests.filter(
    (quest) => completedQuests.includes(quest.id)
  ).length;

  return (
    <section className="panel quests">
      <div className="panel-corner" />

      <div className="quest-heading">
        <div>
          <span className="system-label">
            SYSTEM
          </span>

          <h2>
            {filter === "ALL"
              ? "QUEST BOARD"
              : `${filter} QUESTS`}
          </h2>
        </div>

        <div className="quest-heading-right">
          {onReset && (
            <button
              className="quest-reset-btn"
              onClick={onReset}
              disabled={completedCount === 0}
              title="Reset quest completions"
            >
              <RotateCcw size={12} />
              <span>RESET</span>
            </button>
          )}

          <span
            className="quest-count"
            aria-label={`${completedCount} of ${filteredQuests.length} quests complete`}
          >
            {completedCount}/{filteredQuests.length}
          </span>
        </div>
      </div>

      <div className="quest-filters">
        {filters.map((item) => (
          <button
            key={item}
            className={
              filter === item ? "active" : ""
            }
            aria-pressed={filter === item}
            aria-controls="quest-list"
            onClick={() => setFilter(item)}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="quest-list" id="quest-list">
        {filteredQuests.length === 0 ? (
          <div className="quest-empty">
            <span>NO QUESTS DETECTED</span>
            <p>
              Create a new quest to populate
              this category.
            </p>
          </div>
        ) : (
          filteredQuests.map((quest, index) => {
            const completed =
              completedQuests.includes(
                quest.id
              );

            const Icon = quest.icon;

            return (
              <article
                className={`quest-card ${
                  completed ? "completed" : ""
                }`}
                key={quest.id}
                aria-label={`${quest.title}, ${completed ? "completed" : `reward ${quest.xp} experience`}`}
              >
                <div className="quest-number">
                  {String(index + 1).padStart(
                    2,
                    "0"
                  )}
                </div>

                <div className="quest-icon">
                  <Icon size={18} />
                </div>

                <div className="quest-info">
                  <div className="quest-meta">
                    <span className="quest-type">
                      {quest.type ?? "QUEST"}
                    </span>
                  </div>

                  <h3>{quest.title}</h3>

                  <p>
                    {quest.description}
                  </p>
                </div>

                <div className="quest-reward">
                  +{quest.xp} XP
                </div>

                <div className="quest-actions">
                  <button
                    type="button"
                    className="quest-check"
                    onClick={() =>
                      onComplete(quest.id)
                    }
                    disabled={completed}
                    aria-label={
                      completed
                        ? "Quest completed"
                        : `Complete ${quest.title} for ${quest.xp} XP`
                    }
                    aria-pressed={completed}
                    title={completed ? "Quest complete" : `Clear quest • +${quest.xp} XP`}
                  >
                    {completed ? (
                      <Check size={16} />
                    ) : (
                      <Circle size={14} />
                    )}
                  </button>

                  {onDelete && quest.deletable && (
                    <button
                      type="button"
                      className="quest-delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(quest.id);
                      }}
                      title={`Delete ${quest.title}`}
                      aria-label="Delete quest"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}