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
  const [filter, setFilter] = useState<"DAILY" | "WEEKLY" | "MAIN" | "SIDE">("DAILY");
  const [category, setCategory] = useState("ALL");
  const [selectedQuestId, setSelectedQuestId] = useState<string | null>(null);

  const categories = useMemo(() => {
    const categories = quests
      .map((q) => q.type)
      .filter((type): type is string => Boolean(type));
    return ["ALL", ...Array.from(new Set(categories))];
  }, [quests]);

  const filteredQuests = useMemo(() => {
    const categoryQuests = quests.filter((quest) => {
      const inTab = filter === "DAILY"
        ? quest.cadence === "DAILY"
        : filter === "WEEKLY"
          ? quest.cadence === "WEEKLY"
          : filter === "MAIN"
            ? quest.kind === "BOSS"
            : quest.kind !== "BOSS" && quest.cadence === "ONCE";
      return inTab && (category === "ALL" || quest.type === category);
    });
    const priority = { HIGH: 0, NORMAL: 1, LOW: 2 };
    return categoryQuests
      .map((quest, index) => ({ quest, index }))
      .sort((a, b) => priority[a.quest.priority] - priority[b.quest.priority] || a.index - b.index)
      .map(({ quest }) => quest);
  }, [quests, filter, category]);

  const completedCount = filteredQuests.filter(
    (quest) => completedQuests.includes(quest.id)
  ).length;
  const selectedQuest = filteredQuests.find((quest) => quest.id === selectedQuestId)
    ?? filteredQuests[0];
  const selectedQuestCompleted = selectedQuest
    ? completedQuests.includes(selectedQuest.id)
    : false;

  return (
    <section className="panel quests">
      <div className="panel-corner" />

      <div className="quest-heading">
        <div>
          <span className="system-label">
            SYSTEM
          </span>

          <h2>
            {filter === "MAIN" ? "MAIN QUESTS" : `${filter} QUESTS`}
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

      <nav className="quest-cadence-tabs" aria-label="Quest cadence">
        {(["DAILY", "WEEKLY", "MAIN", "SIDE"] as const).map((item) => (
          <button
            key={item}
            type="button"
            className={filter === item ? "active" : ""}
            aria-pressed={filter === item}
            aria-controls="quest-list"
            onClick={() => {
              setFilter(item);
              setSelectedQuestId(null);
            }}
          >
            {item}
          </button>
        ))}
        {categories.length > 2 && (
          <label className="quest-category-select">
            CATEGORY
            <select
              value={category}
              onChange={(event) => {
                setCategory(event.target.value);
                setSelectedQuestId(null);
              }}
            >
              {categories.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
        )}
      </nav>

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
                } ${selectedQuest?.id === quest.id ? "selected" : ""}`}
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

                <button
                  type="button"
                  className="quest-select"
                  aria-pressed={selectedQuest?.id === quest.id}
                  onClick={() => setSelectedQuestId(quest.id)}
                >
                  <span className="quest-meta">
                    <span className="quest-type">
                      {quest.kind === "BOSS" ? "BOSS QUEST" : quest.type ?? "QUEST"}
                    </span>
                    <span className={`quest-priority priority-${quest.priority.toLowerCase()}`}>
                      {quest.priority}
                    </span>
                  </span>
                  <strong>{quest.title}</strong>
                  <span>{quest.description}</span>
                </button>

                <div className="quest-actions">
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

      {selectedQuest && (
        <aside className="quest-briefing" aria-live="polite">
          <div className="quest-briefing-top">
            <span className="system-label">
              {selectedQuest.kind === "BOSS" ? "BOSS CONTRACT" : `${selectedQuest.cadence} CONTRACT`}
            </span>
            <span className={`quest-briefing-status ${selectedQuestCompleted ? "completed" : ""}`}>
              {selectedQuestCompleted ? "CLEARED" : "ACTIVE"}
            </span>
          </div>
          <h3>{selectedQuest.title}</h3>
          <p>{selectedQuest.description}</p>
          <div className="quest-briefing-objective">
            <span>OBJECTIVE</span>
            <strong>
              {selectedQuest.kind === "BOSS"
                ? `${Math.min(selectedQuest.currentCount, selectedQuest.goalCount)} / ${selectedQuest.goalCount} COMPLETIONS`
                : `${selectedQuest.attribute.toUpperCase()} · ${selectedQuest.type ?? "HUNTER OBJECTIVE"}`}
            </strong>
            {selectedQuest.kind === "BOSS" && (
              <div
                role="progressbar"
                aria-label={`${selectedQuest.title} objective progress`}
                aria-valuemin={0}
                aria-valuemax={selectedQuest.goalCount}
                aria-valuenow={selectedQuest.currentCount}
              >
                <span style={{ width: `${Math.min(100, (selectedQuest.currentCount / selectedQuest.goalCount) * 100)}%` }} />
              </div>
            )}
          </div>
          <div className="quest-briefing-reward">
            <span>REWARD</span>
            <strong>+{selectedQuest.xp} XP</strong>
            <small>{selectedQuest.priority} PRIORITY · {selectedQuest.attribute.toUpperCase()}</small>
          </div>
          <button
            type="button"
            className="quest-briefing-action"
            onClick={() => onComplete(selectedQuest.id)}
            disabled={selectedQuestCompleted}
          >
            {selectedQuestCompleted
              ? <><Check size={16} /> CONTRACT CLEARED</>
              : selectedQuest.kind === "BOSS"
                ? <><Plus size={16} /> ADVANCE OBJECTIVE</>
                : <><Circle size={14} /> COMPLETE CONTRACT</>}
          </button>
        </aside>
      )}
    </section>
  );
}