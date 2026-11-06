import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { sound } from "../utils/soundEffects";
import {
  combineQuests,
  getLocalDateKey,
  getQuestPeriodKey,
} from "../game/gameData";
import {
  advanceBossQuest,
  grantFocusSessionReward,
  grantQuestReward,
  getLevelProgress,
  getRecoveryStatus,
  getStreakProgress,
  getWeeklyStreakProgress,
  type ProgressionState,
} from "../game/progression";
import type { CustomQuest, FocusSession, NewQuest, Quest } from "../types/game";
import { loadGameSave, saveGame } from "../game/storage";

export function useAwakenGame() {
  const [initialSave] = useState(loadGameSave);
  const [progression, setProgression] = useState<ProgressionState>(initialSave.save);
  const progressionRef = useRef(progression);
  const [customQuests, setCustomQuests] = useState(initialSave.save.customQuests);
  const customQuestsRef = useRef(customQuests);
  const [customCategories, setCustomCategories] = useState(initialSave.save.customCategories);
  const customCategoriesRef = useRef(customCategories);
  const { xp, attributes, questCompletions, rewardedQuestPeriods, focusSessions } = progression;
  const [currentDateKey, setCurrentDateKey] = useState(getLocalDateKey);
  const [storageWarning, setStorageWarning] = useState(initialSave.warning);
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

  const persistGame = useCallback((
    nextProgression: ProgressionState,
    nextCustomQuests: CustomQuest[],
    nextCustomCategories: string[],
  ) => {
    const warning = saveGame({
      version: 2,
      ...nextProgression,
      customQuests: nextCustomQuests,
      customCategories: nextCustomCategories,
    });
    if (warning) setStorageWarning(warning);
  }, []);

  useEffect(() => {
    const checkForNewDay = () => {
      const today = getLocalDateKey();
      if (currentDateKey === today) return;
      setCurrentDateKey(today);
      showNotification("NEW PERIOD // RECURRING QUESTS REFRESHED");
    };

    const interval = setInterval(checkForNewDay, 30_000);
    return () => clearInterval(interval);
  }, [currentDateKey, showNotification]);

  useEffect(() => () => {
    if (notificationTimeout.current) clearTimeout(notificationTimeout.current);
    if (levelUpTimeout.current) clearTimeout(levelUpTimeout.current);
  }, []);

  const triggerLevelUp = useCallback(() => {
    setLevelUp(true);
    sound.playLevelUp();
    if (levelUpTimeout.current) clearTimeout(levelUpTimeout.current);
    levelUpTimeout.current = setTimeout(() => {
      setLevelUp(false);
      levelUpTimeout.current = null;
    }, 4500);
  }, []);

  const completeQuest = useCallback((quest: Quest) => {
    const storedQuest = customQuestsRef.current.find((item) => item.id === quest.id);
    if (storedQuest?.kind === "BOSS") {
      const currentCount = storedQuest.currentCount ?? 0;
      const goalCount = Math.max(2, storedQuest.goalCount ?? 2);
      const bossResult = advanceBossQuest(progressionRef.current, {
        ...quest,
        kind: "BOSS",
        cadence: "ONCE",
        goalCount,
        currentCount,
      });
      const nextCustomQuests: CustomQuest[] = customQuestsRef.current.map((item) =>
        item.id === storedQuest.id
          ? {
            ...item,
            goalCount,
            cadence: "ONCE" as const,
            currentCount: bossResult.currentCount,
          }
          : item,
      );

      if (!bossResult.granted && !bossResult.completed) {
        persistGame(bossResult.state, nextCustomQuests, customCategoriesRef.current);
        progressionRef.current = bossResult.state;
        customQuestsRef.current = nextCustomQuests;
        setProgression(bossResult.state);
        setCustomQuests(nextCustomQuests);
        sound.playClick();
        showNotification(`BOSS OBJECTIVE ADVANCED // ${bossResult.currentCount}/${goalCount}`);
        return;
      }

      if (!bossResult.granted) return;
      persistGame(bossResult.state, nextCustomQuests, customCategoriesRef.current);
      customQuestsRef.current = nextCustomQuests;
      setCustomQuests(nextCustomQuests);
      progressionRef.current = bossResult.state;
      setProgression(bossResult.state);
      if (bossResult.leveledUp) triggerLevelUp();
      sound.playQuestComplete();
      sound.playStatPoint();
      showNotification(`BOSS DEFEATED // +${quest.xp} XP`);
      return;
    }

    const result = grantQuestReward(progressionRef.current, quest);
    if (!result.granted) return;
    persistGame(result.state, customQuestsRef.current, customCategoriesRef.current);
    progressionRef.current = result.state;
    setProgression(result.state);
    if (result.leveledUp) triggerLevelUp();
    sound.playQuestComplete();
    sound.playStatPoint();

    if (!result.leveledUp) showNotification(`QUEST COMPLETE  //  +${quest.xp} XP`);
  }, [persistGame, showNotification, triggerLevelUp]);

  const completeFocusSession = useCallback((session: FocusSession) => {
    const result = grantFocusSessionReward(progressionRef.current, session);
    if (!result.granted) return;
    persistGame(result.state, customQuestsRef.current, customCategoriesRef.current);
    progressionRef.current = result.state;
    setProgression(result.state);
    if (result.leveledUp) triggerLevelUp();
    sound.playQuestComplete();
    showNotification(
      `${session.task ? `${session.task.toUpperCase()} // ` : ""}FOCUS SESSION COMPLETE // +${session.xp} XP`,
    );
  }, [persistGame, showNotification, triggerLevelUp]);

  const toggleSound = useCallback(() => {
    const enabled = !sound.isEnabled();
    const warning = sound.setEnabled(enabled);
    setSoundEnabled(enabled);
    if (warning) setStorageWarning(warning);
    if (enabled) sound.playClick();
  }, []);

  const deleteQuest = useCallback((questId: string) => {
    const nextCustomQuests = customQuestsRef.current.filter((quest) => quest.id !== questId);
    persistGame(progressionRef.current, nextCustomQuests, customCategoriesRef.current);
    customQuestsRef.current = nextCustomQuests;
    setCustomQuests(nextCustomQuests);
    sound.playDelete();
    showNotification("QUEST REMOVED FROM DATABASE");
  }, [persistGame, showNotification]);

  const createQuest = useCallback((quest: NewQuest) => {
    const newQuest: CustomQuest = { id: `custom-${crypto.randomUUID()}`, ...quest };
    const nextCustomQuests = [...customQuestsRef.current, newQuest];
    persistGame(progressionRef.current, nextCustomQuests, customCategoriesRef.current);
    customQuestsRef.current = nextCustomQuests;
    setCustomQuests(nextCustomQuests);
    sound.playClick();
    showNotification(`QUEST CREATED  //  ${quest.title.toUpperCase()}`);
  }, [persistGame, showNotification]);

  const addCustomCategory = useCallback((rawCategory: string) => {
    const category = rawCategory.trim().replace(/\s+/g, " ").toUpperCase();
    if (!category || category.length > 24) return null;
    const existing = customCategoriesRef.current.find(
      (item) => item.toLowerCase() === category.toLowerCase(),
    );
    if (existing) return existing;
    const nextCategories = [...customCategoriesRef.current, category];
    persistGame(progressionRef.current, customQuestsRef.current, nextCategories);
    customCategoriesRef.current = nextCategories;
    setCustomCategories(nextCategories);
    showNotification(`CATEGORY REGISTERED // ${category}`);
    return category;
  }, [persistGame, showNotification]);

  const recoverYesterday = useCallback(() => {
    const current = progressionRef.current;
    const recovery = getRecoveryStatus(
      current.activityDates,
      current.recoveryDays,
      new Date(`${currentDateKey}T12:00:00`),
    );
    if (!recovery.canRecoverYesterday) return;
    const nextProgression = {
      ...current,
      recoveryDays: [...current.recoveryDays, recovery.yesterday],
    };
    persistGame(nextProgression, customQuestsRef.current, customCategoriesRef.current);
    progressionRef.current = nextProgression;
    setProgression(nextProgression);
    showNotification("STREAK RECOVERED // YESTERDAY RESTORED");
  }, [currentDateKey, persistGame, showNotification]);

  const allQuests = useMemo(() => combineQuests(customQuests), [customQuests]);
  const completedQuests = useMemo(
    () => allQuests
      .filter((quest) =>
        rewardedQuestPeriods.includes(
          getQuestPeriodKey(quest.id, quest.cadence, new Date(`${currentDateKey}T12:00:00`)),
        )
      )
      .map((quest) => quest.id),
    [allQuests, currentDateKey, rewardedQuestPeriods],
  );
  const completedQuestCount = allQuests.filter((quest) =>
    completedQuests.includes(quest.id)
  ).length;
  const pendingQuests = allQuests.filter((quest) =>
    !completedQuests.includes(quest.id)
  );
  const { level, currentXP: currentLevelXP, percentage: xpPercentage } = getLevelProgress(xp);
  const streak = getStreakProgress(
    progression.activityDates,
    progression.recoveryDays,
    new Date(`${currentDateKey}T12:00:00`),
  );
  const recovery = getRecoveryStatus(
    progression.activityDates,
    progression.recoveryDays,
    new Date(`${currentDateKey}T12:00:00`),
  );
  const weeklyStreak = getWeeklyStreakProgress(
    progression.activityDates,
    progression.recoveryDays,
    new Date(`${currentDateKey}T12:00:00`),
  );

  return {
    activityLog: progression.activityLog,
    addCustomCategory,
    allQuests,
    attributes,
    completeFocusSession,
    completeQuest,
    completedQuestCount,
    completedQuests,
    createQuest,
    currentLevelXP,
    customCategories,
    customQuests,
    deleteQuest,
    focusSessions,
    level,
    levelUp,
    notification,
    pendingQuests,
    questCompletions,
    recoverYesterday,
    recoveryCredits: recovery.credits,
    canRecoverYesterday: recovery.canRecoverYesterday,
    currentStreak: streak.current,
    longestStreak: streak.longest,
    currentWeeklyStreak: weeklyStreak.current,
    longestWeeklyStreak: weeklyStreak.longest,
    setNotification,
    setSoundEnabled,
    showNotification,
    soundEnabled,
    storageWarning,
    skillXP: progression.skillXP,
    toggleSound,
    xp,
    xpPercentage,
  };
}
