import { useMemo, useState } from "react";
import { Check, Circle, Plus, Trash2 } from "lucide-react";
import type { Quest } from "../types/game";

type QuestBoardProps = {
  quests: Quest[];
  completedQuests: string[];
  onComplete: (questId: string) => void;
  onDelete?: (questId: string) => void;
};

export default function QuestBoard({
  quests,
  completedQuests,
  onComplete,
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
    const categoryQuests = filter === "ALL"
      ? quests
      : quests.filter((quest) => quest.type === filter);
    const priority = { HIGH: 0, NORMAL: 1, LOW: 2 };
    return categoryQuests
      .map((quest, index) => ({ quest, index }))
      .sort((a, b) => priority[a.quest.priority] - priority[b.quest.priority] || a.index - b.index)
      .map(({ quest }) => quest);
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
                      {quest.kind === "BOSS" ? "BOSS QUEST" : quest.type ?? "QUEST"}
                    </span>
                    <span className="quest-cadence">{quest.cadence}</span>
                    <span className={`quest-priority priority-${quest.priority.toLowerCase()}`}>
                      {quest.priority}
                    </span>
                  </div>

                  <h3>{quest.title}</h3>

                  <p>
                    {quest.description}
                  </p>
                  {quest.kind === "BOSS" && (
                    <div className="boss-progress">
                      <div
                        role="progressbar"
                        aria-label={`${quest.title} objective progress`}
                        aria-valuemin={0}
                        aria-valuemax={quest.goalCount}
                        aria-valuenow={quest.currentCount}
                      >
                        <span
                          style={{
                            width: `${Math.min(100, (quest.currentCount / quest.goalCount) * 100)}%`,
                          }}
                        />
                      </div>
                      <small>OBJECTIVES {quest.currentCount}/{quest.goalCount}</small>
                    </div>
                  )}
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
                        : quest.kind === "BOSS"
                          ? `Advance ${quest.title} objective ${quest.currentCount + 1} of ${quest.goalCount}`
                          : `Complete ${quest.title} for ${quest.xp} XP`
                    }
                    aria-pressed={completed}
                    title={
                      completed
                        ? "Quest complete"
                        : quest.kind === "BOSS"
                          ? `Advance objective ${quest.currentCount + 1} of ${quest.goalCount}`
                          : `Clear quest • +${quest.xp} XP`
                    }
                  >
                    {completed ? (
                      <Check size={16} />
                    ) : quest.kind === "BOSS" ? (
                      <Plus size={16} />
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