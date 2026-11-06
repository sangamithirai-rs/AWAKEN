import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { sound } from "../utils/soundEffects";
import {
  combineQuests,
  defaultAttributes,
  getLocalDateKey,
} from "../game/gameData";
import type { Attributes, CustomQuest, NewQuest, Quest } from "../types/game";

function readCustomQuests(): CustomQuest[] {
  const saved = localStorage.getItem("awaken-custom-quests");
  return saved ? JSON.parse(saved) as CustomQuest[] : [];
}

function readCompletedQuests(): string[] {
  const saved = localStorage.getItem("awaken-completed-quests");
  const savedDate = localStorage.getItem("awaken-completion-date");
  const today = getLocalDateKey();

  if (savedDate !== today) {
    localStorage.setItem("awaken-completion-date", today);
    const customIds = readCustomQuests().map((quest) => quest.id);
    const previousCompleted = saved ? JSON.parse(saved) as string[] : [];
    const remaining = previousCompleted.filter((id) => customIds.includes(id));
    localStorage.setItem("awaken-completed-quests", JSON.stringify(remaining));
    return remaining;
  }

  return saved ? JSON.parse(saved) as string[] : [];
}

function readQuestCompletions(): number {
  const saved = localStorage.getItem("awaken-quest-completions");
  const previous = localStorage.getItem("awaken-completed-quests");
  const previousCount = previous ? (JSON.parse(previous) as string[]).length : 0;
  return Math.max(Number(saved) || 0, previousCount);
}

export function useAwakenGame() {
  const [completedQuests, setCompletedQuests] = useState(readCompletedQuests);
  const [customQuests, setCustomQuests] = useState(readCustomQuests);
  const [xp, setXp] = useState(() => Number(localStorage.getItem("awaken-xp")) || 0);
  const [attributes, setAttributes] = useState<Attributes>(() => {
    const saved = localStorage.getItem("awaken-attributes");
    return saved ? JSON.parse(saved) as Attributes : defaultAttributes;
  });
  const [questCompletions, setQuestCompletions] = useState(readQuestCompletions);
  const [notification, setNotification] = useState<string | null>(null);
  const [levelUp, setLevelUp] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(() => sound.isEnabled());
  const notificationTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const levelUpTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showNotification = useCallback((message: string) => {
    if (notificationTimeout.current) clearTimeout(notificationTimeout.current);
    setNotification(message);
    notificationTimeout.current = setTimeout(() => {
      setNotification(null);
      notificationTimeout.current = null;
    }, 3000);
  }, []);

  useEffect(() => {
    const checkForNewDay = () => {
      const today = getLocalDateKey();
      if (localStorage.getItem("awaken-completion-date") === today) return;

      const customIds = new Set(customQuests.map((quest) => quest.id));
      setCompletedQuests((current) => current.filter((id) => customIds.has(id)));
      localStorage.setItem("awaken-completion-date", today);
      showNotification("NEW DAY // DAILY QUESTS REFRESHED");
    };

    const interval = setInterval(checkForNewDay, 30_000);
    return () => clearInterval(interval);
  }, [customQuests, showNotification]);

  useEffect(() => {
    localStorage.setItem("awaken-completed-quests", JSON.stringify(completedQuests));
  }, [completedQuests]);

  useEffect(() => {
    localStorage.setItem("awaken-custom-quests", JSON.stringify(customQuests));
  }, [customQuests]);

  useEffect(() => {
    localStorage.setItem("awaken-xp", String(xp));
  }, [xp]);

  useEffect(() => {
    localStorage.setItem("awaken-attributes", JSON.stringify(attributes));
  }, [attributes]);

  useEffect(() => {
    localStorage.setItem("awaken-quest-completions", String(questCompletions));
  }, [questCompletions]);

  useEffect(() => () => {
    if (notificationTimeout.current) clearTimeout(notificationTimeout.current);
    if (levelUpTimeout.current) clearTimeout(levelUpTimeout.current);
  }, []);

  const applyXP = useCallback((amount: number) => {
    const oldLevel = Math.floor(xp / 1000) + 1;
    const nextLevel = Math.floor((xp + amount) / 1000) + 1;
    setXp((current) => current + amount);

    if (nextLevel > oldLevel) {
      setLevelUp(true);
      sound.playLevelUp();
      if (levelUpTimeout.current) clearTimeout(levelUpTimeout.current);
      levelUpTimeout.current = setTimeout(() => {
        setLevelUp(false);
        levelUpTimeout.current = null;
      }, 4500);
      return true;
    }

    return false;
  }, [xp]);

  const completeQuest = useCallback((quest: Quest) => {
    if (completedQuests.includes(quest.id)) return;

    setCompletedQuests((current) => [...current, quest.id]);
    setQuestCompletions((current) => current + 1);
    const leveledUp = applyXP(quest.xp);
    sound.playQuestComplete();
    setAttributes((current) => ({
      ...current,
      [quest.attribute]: current[quest.attribute] + 1,
    }));
    sound.playStatPoint();

    if (!leveledUp) showNotification(`QUEST COMPLETE  //  +${quest.xp} XP`);
  }, [applyXP, completedQuests, showNotification]);

  const completeFocusSession = useCallback((sessionXP: number, task?: string) => {
    applyXP(sessionXP);
    sound.playQuestComplete();
    showNotification(
      `${task ? `${task.toUpperCase()} // ` : ""}FOCUS SESSION COMPLETE // +${sessionXP} XP`,
    );
  }, [applyXP, showNotification]);

  const resetQuests = useCallback(() => {
    setCompletedQuests([]);
    showNotification("QUEST PROTOCOL RESET // ALL QUESTS ACTIVE");
  }, [showNotification]);

  const deleteQuest = useCallback((questId: string) => {
    setCustomQuests((current) => current.filter((quest) => quest.id !== questId));
    setCompletedQuests((current) => current.filter((id) => id !== questId));
    sound.playDelete();
    showNotification("QUEST REMOVED FROM DATABASE");
  }, [showNotification]);

  const createQuest = useCallback((quest: NewQuest) => {
    const newQuest: CustomQuest = { id: `custom-${Date.now()}`, ...quest };
    setCustomQuests((current) => [...current, newQuest]);
    sound.playClick();
    showNotification(`QUEST CREATED  //  ${quest.title.toUpperCase()}`);
  }, [showNotification]);

  const allQuests = useMemo(() => combineQuests(customQuests), [customQuests]);
  const completedQuestCount = allQuests.filter((quest) =>
    completedQuests.includes(quest.id)
  ).length;
  const pendingQuests = allQuests.filter((quest) =>
    !completedQuests.includes(quest.id)
  );
  const level = Math.floor(xp / 1000) + 1;
  const currentLevelXP = xp % 1000;
  const xpPercentage = currentLevelXP / 10;

  return {
    allQuests,
    attributes,
    completeFocusSession,
    completeQuest,
    completedQuestCount,
    completedQuests,
    createQuest,
    currentLevelXP,
    customQuests,
    deleteQuest,
    level,
    levelUp,
    notification,
    pendingQuests,
    questCompletions,
    resetQuests,
    setNotification,
    setSoundEnabled,
    showNotification,
    soundEnabled,
    xp,
    xpPercentage,
  };
}
