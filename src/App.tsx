import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, MotionConfig } from "framer-motion";
import {
  Activity,
  Brain,
  Check,
  Code2,
  Crosshair,
  RotateCcw,
  Sparkles,
  Target,
  X,
  Volume2,
  VolumeX,
  Zap,
} from "lucide-react";

import SystemNav, { type Page } from "./components/SystemNav";
import QuestBoard from "./components/QuestBoard";
import SkillsPage from "./components/SkillsPage";
import AchievementsPage from "./components/AchievementsPage";
import InventoryPage from "./components/InventoryPage";
import CreateQuest from "./components/CreateQuest";
import FocusPage from "./components/FocusPage";
import { sound } from "./utils/soundEffects";

type Attributes = {
  strength: number;
  intelligence: number;
  discipline: number;
  focus: number;
  consistency: number;
};

type Quest = {
  id: string;
  title: string;
  description: string;
  xp: number;
  icon: typeof Target;
  attribute: keyof Attributes;
  type?: string;
  deletable?: boolean;
};

type CustomQuest = {
  id: string;
  title: string;
  description: string;
  xp: number;
  type: string;
  attribute?: keyof Attributes;
};

const quests: Quest[] = [
  {
    id: "daily-movement",
    title: "Hunter Conditioning",
    description: "Move your body for 20 minutes. A walk, workout, or mobility session counts.",
    xp: 100,
    icon: Zap,
    attribute: "strength",
    type: "DAILY",
  },
  {
    id: "daily-focus",
    title: "Gate Study",
    description: "Give one meaningful task 25 minutes of focused attention.",
    xp: 100,
    icon: Brain,
    attribute: "intelligence",
    type: "DAILY",
  },
  {
    id: "daily-plan",
    title: "System Check",
    description: "Choose your top priority and define the next action.",
    xp: 50,
    icon: Target,
    attribute: "discipline",
    type: "DAILY",
  },
];

function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const defaultAttributes: Attributes = {
  strength: 1,
  intelligence: 1,
  discipline: 1,
  focus: 1,
  consistency: 1,
};

const bootMessages = [
  "ESTABLISHING SYSTEM CONNECTION...",
  "IDENTIFYING PLAYER...",
  "SYNCHRONIZING PROGRESSION...",
  "LOADING QUEST DATABASE...",
  "CALIBRATING ATTRIBUTES...",
  "SYSTEM ONLINE",
];

function App() {
  const [booting, setBooting] = useState(true);
  const [bootMessage, setBootMessage] = useState(bootMessages[0]);

  const [activePage, setActivePage] = useState<Page>("SYSTEM");

 const [completedQuests, setCompletedQuests] = useState<string[]>(() => {
  const saved = localStorage.getItem("awaken-completed-quests");
  const savedDate = localStorage.getItem("awaken-completion-date");

  const today = getLocalDateKey();

  if (savedDate !== today) {
    localStorage.setItem("awaken-completion-date", today);

    // Reset built-in daily quests.
    // Custom quests remain completed.
    const customSaved = localStorage.getItem(
      "awaken-custom-quests"
    );

    const customQuestIds: string[] = customSaved
      ? JSON.parse(customSaved).map(
          (quest: CustomQuest) => quest.id
        )
      : [];

    const previousCompleted: string[] = saved
      ? JSON.parse(saved)
      : [];

    const remainingCompleted =
      previousCompleted.filter((id) =>
        customQuestIds.includes(id)
      );

    localStorage.setItem(
      "awaken-completed-quests",
      JSON.stringify(remainingCompleted)
    );

    return remainingCompleted;
  }

  return saved ? JSON.parse(saved) : [];
});

  const [customQuests, setCustomQuests] = useState<CustomQuest[]>(() => {
    const saved = localStorage.getItem("awaken-custom-quests");
    return saved ? JSON.parse(saved) : [];
  });

  const [xp, setXp] = useState<number>(() => {
    return Number(localStorage.getItem("awaken-xp")) || 0;
  });

  const [attributes, setAttributes] = useState<Attributes>(() => {
    const saved = localStorage.getItem("awaken-attributes");
    return saved ? JSON.parse(saved) : defaultAttributes;
  });
  const [questCompletions, setQuestCompletions] = useState<number>(() => {
    const saved = localStorage.getItem("awaken-quest-completions");
    const previousCompletions = localStorage.getItem("awaken-completed-quests");
    const previousCount = previousCompletions
      ? (JSON.parse(previousCompletions) as string[]).length
      : 0;
    return Math.max(Number(saved) || 0, previousCount);
  });

  const [notification, setNotification] = useState<string | null>(null);
  const [levelUp, setLevelUp] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(() => sound.isEnabled());
  const notificationTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showNotification = useCallback((message: string) => {
    if (notificationTimeout.current) {
      clearTimeout(notificationTimeout.current);
    }

    setNotification(message);
    notificationTimeout.current = setTimeout(() => {
      setNotification(null);
      notificationTimeout.current = null;
    }, 3000);
  }, []);

  const [systemTime, setSystemTime] = useState(
    new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  );

  const [systemDate, setSystemDate] = useState(
    new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  );

  const level = Math.floor(xp / 1000) + 1;
  const currentLevelXP = xp % 1000;
  const xpPercentage = (currentLevelXP / 1000) * 100;

  /* --------------------------------
     SYSTEM CLOCK
  -------------------------------- */

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();

      setSystemTime(
        now.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );

      setSystemDate(
        now.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const checkForNewDay = () => {
      const today = getLocalDateKey();
      if (localStorage.getItem("awaken-completion-date") === today) return;

      const customQuestIds = new Set(customQuests.map((quest) => quest.id));
      setCompletedQuests((current) =>
        current.filter((id) => customQuestIds.has(id))
      );
      localStorage.setItem("awaken-completion-date", today);
      showNotification("NEW DAY // DAILY QUESTS REFRESHED");
    };

    const interval = setInterval(checkForNewDay, 30_000);
    return () => clearInterval(interval);
  }, [customQuests, showNotification]);

  /* --------------------------------
     SYSTEM BOOT
  -------------------------------- */

  useEffect(() => {
    let index = 0;
    let finishTimeout: ReturnType<typeof setTimeout> | undefined;

    const interval = setInterval(() => {
      index++;

      if (index < bootMessages.length) {
        setBootMessage(bootMessages[index]);
      }

      if (index === bootMessages.length - 1) {
        finishTimeout = setTimeout(() => {
          setBooting(false);
        }, 450);
      }
    }, 330);

    return () => {
      clearInterval(interval);
      clearTimeout(finishTimeout);
    };
  }, []);

  /* --------------------------------
     LOCAL STORAGE
  -------------------------------- */

  useEffect(() => {
    localStorage.setItem(
      "awaken-completed-quests",
      JSON.stringify(completedQuests)
    );
  }, [completedQuests]);

  useEffect(() => {
    localStorage.setItem(
      "awaken-custom-quests",
      JSON.stringify(customQuests)
    );
  }, [customQuests]);

  useEffect(() => {
    localStorage.setItem("awaken-xp", String(xp));
  }, [xp]);

  useEffect(() => {
    localStorage.setItem(
      "awaken-attributes",
      JSON.stringify(attributes)
    );
  }, [attributes]);

  useEffect(() => {
    localStorage.setItem("awaken-quest-completions", String(questCompletions));
  }, [questCompletions]);

  useEffect(() => () => {
    if (notificationTimeout.current) {
      clearTimeout(notificationTimeout.current);
    }
  }, []);

  /* --------------------------------
     COMPLETE QUEST
  -------------------------------- */

  function completeQuest(quest: Quest) {
    if (completedQuests.includes(quest.id)) {
      return;
    }

    const previousLevel = Math.floor(xp / 1000) + 1;

    const newXP = xp + quest.xp;

    const newLevel = Math.floor(newXP / 1000) + 1;

    setCompletedQuests((prev) => [
      ...prev,
      quest.id,
    ]);

    setQuestCompletions((current) => current + 1);
    setXp(newXP);
    sound.playQuestComplete();

    setAttributes((prev) => ({
      ...prev,
      [quest.attribute]: prev[quest.attribute] + 1,
    }));
    sound.playStatPoint();

    if (newLevel > previousLevel) {
      setLevelUp(true);
      sound.playLevelUp();

      setTimeout(() => {
        setLevelUp(false);
      }, 4500);

      return;
    }

    showNotification(`QUEST COMPLETE  //  +${quest.xp} XP`);
  }

  /* --------------------------------
     RESET QUESTS
  -------------------------------- */

  const resetQuests = () => {
    setCompletedQuests([]);
    showNotification("QUEST PROTOCOL RESET // ALL QUESTS ACTIVE");
  };

  /* --------------------------------
     DELETE QUEST
  -------------------------------- */

  const deleteQuest = (questId: string) => {
    setCustomQuests((current) =>
      current.filter((quest) => quest.id !== questId)
    );
    setCompletedQuests((current) =>
      current.filter((id) => id !== questId)
    );
    sound.playDelete();
    showNotification("QUEST REMOVED FROM DATABASE");
  };

  /* --------------------------------
     CREATE CUSTOM QUEST
  -------------------------------- */

  const createCustomQuest = (quest: {
    title: string;
    description: string;
    xp: number;
    type: string;
    attribute?: keyof Attributes;
  }) => {
    const newQuest: CustomQuest = {
      id: `custom-${Date.now()}`,
      ...quest,
    };

    setCustomQuests((current) => [
      ...current,
      newQuest,
    ]);

    sound.playClick();
    showNotification(`QUEST CREATED  //  ${quest.title.toUpperCase()}`);
  };

  const completeFocusSession = useCallback((sessionXP: number, task?: string) => {
    const previousLevel = Math.floor(xp / 1000) + 1;
    const newLevel = Math.floor((xp + sessionXP) / 1000) + 1;
    setXp((current) => current + sessionXP);
    sound.playQuestComplete();

    if (newLevel > previousLevel) {
      setLevelUp(true);
      sound.playLevelUp();
      setTimeout(() => setLevelUp(false), 4500);
    }

    showNotification(
      `${task ? `${task.toUpperCase()} // ` : ""}FOCUS SESSION COMPLETE // +${sessionXP} XP`
    );
  }, [showNotification, xp]);

  /* --------------------------------
     COMBINE BUILT-IN + CUSTOM QUESTS
  -------------------------------- */

  function getQuestIcon(type?: string): typeof Target {
    switch (type) {
      case "FITNESS":
        return Zap;
      case "STUDY":
        return Brain;
      case "CODING":
        return Code2;
      case "PROJECT":
        return Crosshair;
      default:
        return Target;
    }
  }

  function getDefaultAttribute(type?: string): keyof Attributes {
    switch (type) {
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
  }

  function getRank(lvl: number): string {
    if (lvl >= 50) return "S";
    if (lvl >= 30) return "A";
    if (lvl >= 20) return "B";
    if (lvl >= 15) return "C";
    if (lvl >= 10) return "D";
    if (lvl >= 5) return "E+";
    return "E";
  }

  const allQuests: Quest[] = [
    ...quests,
    ...customQuests.map((quest) => ({
      id: quest.id,
      title: quest.title,
      description: quest.description,
      xp: quest.xp,
      icon: getQuestIcon(quest.type),
      attribute: quest.attribute ?? getDefaultAttribute(quest.type),
      type: quest.type,
      deletable: true,
    })),
  ];
  const completedQuestCount = allQuests.filter((quest) =>
    completedQuests.includes(quest.id)
  ).length;
  const pendingQuests = allQuests.filter(
    (quest) => !completedQuests.includes(quest.id)
  );
  const featuredQuest = pendingQuests[0];
  const questClearance = allQuests.length
    ? Math.round((completedQuestCount / allQuests.length) * 100)
    : 0;

  /* --------------------------------
     BOOT SCREEN
  -------------------------------- */

  if (booting) {
    return (
      <MotionConfig reducedMotion="user">
        <div className="system-boot">
          <div className="boot-grid" />

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="boot-content"
          >
            <div className="boot-symbol">
              <Sparkles size={32} />
            </div>

            <p className="boot-label">
              AWAKEN SYSTEM
            </p>

            <h1 className="boot-title">
              INITIALIZING
            </h1>

            <div className="boot-line">
              <motion.div
                animate={{
                  width: ["0%", "100%"],
                }}
                transition={{
                  duration: 1.8,
                }}
              />
            </div>

            <motion.p
              key={bootMessage}
              initial={{
                opacity: 0,
                x: -10,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              className="boot-message"
            >
              {">"} {bootMessage}
            </motion.p>
          </motion.div>
        </div>
      </MotionConfig>
    );
  }

  return (
    <MotionConfig reducedMotion="user">
    <div className="awaken">
      <div className="scanlines" />
      <div className="noise" />

      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <div className="holo-grid" />

      {/* SYSTEM NOTIFICATION */}

      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.8,
              y: -50,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              scale: 0.8,
              y: -50,
            }}
            className="system-notification"
            role="status"
            aria-live="polite"
          >
            <div className="notification-icon">
              <Check size={18} />
            </div>

            <div>
              <p>SYSTEM MESSAGE</p>

              <strong>
                {notification}
              </strong>
            </div>

            <button
              type="button"
              aria-label="Dismiss system message"
              onClick={() =>
                setNotification(null)
              }
            >
              <X size={15} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LEVEL UP */}

      <AnimatePresence>
        {levelUp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="level-overlay"
          >
            <motion.div
              initial={{
                scale: 0.5,
                opacity: 0,
              }}
              animate={{
                scale: 1,
                opacity: 1,
              }}
              transition={{
                duration: 0.8,
                type: "spring",
              }}
              className="level-window"
            >
              <Sparkles size={30} />

              <span>SYSTEM</span>

              <h2>LEVEL UP</h2>

              <div className="level-number">
                {String(level - 1).padStart(2, "0")}

                <span>→</span>

                {String(level).padStart(2, "0")}
              </div>

              <p>
                NEW POTENTIAL DETECTED
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="system-container">

        {/* SYSTEM HEADER */}

        <header className="system-header">
          <div className="header-brand">
            <div className="system-status">
              <span />
              SYSTEM ONLINE

              <strong>
                {systemDate} // {systemTime}
              </strong>
            </div>

            <h1>AWAKEN</h1>
            <div className="system-subtitle">SHADOW MONARCH INTERFACE</div>
          </div>

          <div className="header-metrics" aria-label="Player summary stats">
            <div className="metric-card">
              <span>RANK</span>
              <strong>{getRank(level)}</strong>
            </div>

            <div className="metric-card">
              <span>QUESTS</span>
              <strong>
                {completedQuestCount}/{allQuests.length}
              </strong>
            </div>

            <div className="metric-card">
              <span>TOTAL XP</span>
              <strong>{xp.toLocaleString()}</strong>
            </div>
          </div>

          <div className="player-mini">

            <div>
              <span>PLAYER</span>
              <strong>SAM</strong>
            </div>

            <div className="player-orb">
              <Sparkles size={18} />
            </div>

          </div>

          <div className="header-actions">
            <button
              className="sound-toggle"
              type="button"
              aria-label={soundEnabled ? "Mute system sounds" : "Enable system sounds"}
              aria-pressed={soundEnabled}
              title={soundEnabled ? "Mute system sounds" : "Enable system sounds"}
              onClick={() => {
                const enabled = sound.toggle();
                setSoundEnabled(enabled);
                if (enabled) sound.playClick();
              }}
            >
              {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
              <span>SFX</span>
            </button>
          </div>
        </header>

        {/* PAGE CONTENT */}

        <AnimatePresence mode="wait">

          {/* SYSTEM */}

          {activePage === "SYSTEM" && (
            <motion.div
              key="system"
              initial={{
                opacity: 0,
                y: 12,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: -12,
              }}
              transition={{
                duration: 0.25,
              }}
            >
              <section className="main-grid">
                <motion.section
                  className="mission-console panel"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35 }}
                >
                  <div className="mission-console-top">
                    <div className="mission-alert">
                      <span />
                      SYSTEM DIRECTIVE
                    </div>
                    <span className="mission-date">{systemDate} // {systemTime}</span>
                  </div>

                  <div className="mission-console-body">
                    <div className="mission-contract">
                      <div className="mission-contract-label">
                        {featuredQuest ? `ACTIVE CONTRACT // ${featuredQuest.type ?? "QUEST"}` : "NO ACTIVE CONTRACT"}
                      </div>
                      <h2>{featuredQuest?.title ?? "QUESTS REQUIRED"}</h2>
                      <p>
                        {featuredQuest?.description ??
                          "Open the quest board to create a contract and begin earning experience."}
                      </p>
                      <div className="mission-contract-footer">
                        <span>
                          {featuredQuest ? `BOUNTY  +${featuredQuest.xp} XP` : "HUNTER STATUS  READY"}
                        </span>
                        <button
                          className="mission-open-button"
                          onClick={() => {
                            if (featuredQuest) {
                              completeQuest(featuredQuest);
                            } else {
                              setActivePage("QUESTS");
                            }
                          }}
                        >
                          {featuredQuest ? <Check size={14} /> : <Target size={14} />}
                          {featuredQuest ? "CLEAR CONTRACT" : "ACCESS QUEST BOARD"}
                        </button>
                      </div>
                    </div>

                    <div className="mission-clearance">
                      <div className="clearance-heading">
                        <span>QUEST CLEARANCE</span>
                        <strong>{String(questClearance).padStart(2, "0")}%</strong>
                      </div>
                      <div
                        className="clearance-track"
                        role="progressbar"
                        aria-label="Quest completion"
                        aria-valuemin={0}
                        aria-valuemax={allQuests.length || 1}
                        aria-valuenow={completedQuestCount}
                      >
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${questClearance}%` }}
                          transition={{ duration: 0.7 }}
                        />
                      </div>
                      <div className="clearance-count">
                        <strong>{String(completedQuestCount).padStart(2, "0")}</strong>
                        <span> CLEARED</span>
                        <i />
                        <strong>{String(pendingQuests.length).padStart(2, "0")}</strong>
                        <span> REMAINING</span>
                      </div>

                      <div className="mission-xp">
                        <span>NEXT LEVEL</span>
                        <strong>{currentLevelXP} / 1000 XP</strong>
                        <div className="mission-xp-track">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${xpPercentage}%` }}
                            transition={{ duration: 0.7, delay: 0.1 }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.section>

                {/* PLAYER STATUS */}

                <motion.section
                  initial={{
                    opacity: 0,
                    x: -30,
                  }}
                  animate={{
                    opacity: 1,
                    x: 0,
                  }}
                  className="player-status panel"
                >
                  <div className="panel-corner corner-tl" />
                  <div className="panel-corner corner-br" />

                  <div className="section-label">
                    <span>01</span>
                    PLAYER STATUS
                  </div>

                  <div className="player-core">

                    <motion.div
                      animate={{
                        boxShadow: [
                          "0 0 20px rgba(59,130,246,.15)",
                          "0 0 55px rgba(59,130,246,.45)",
                          "0 0 20px rgba(59,130,246,.15)",
                        ],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                      }}
                      className="player-emblem"
                    >
                      S
                    </motion.div>

                    <div className="player-name">
                      <span>PLAYER</span>
                      <h2>SAM</h2>
                    </div>

                  </div>

                  <div className="level-display">

                    <div>
                      <span>LEVEL</span>

                      <strong>
                        {String(level).padStart(2, "0")}
                      </strong>
                    </div>

                    <div className="rank-display">
                      <span>RANK</span>

                      <strong>
                        {getRank(level)}
                      </strong>
                    </div>

                  </div>

                  <div className="xp-section">

                    <div>
                      <span>EXPERIENCE</span>

                      <strong>
                        {currentLevelXP} / 1000
                      </strong>
                    </div>

                    <div className="xp-bar">

                      <motion.div
                        animate={{
                          width: `${xpPercentage}%`,
                        }}
                        transition={{
                          duration: 0.8,
                        }}
                      />

                    </div>

                  </div>

                  <div className="attributes">

                    <div className="section-label">
                      <span>02</span>
                      ATTRIBUTES
                    </div>

                    <Attribute
                      name="STRENGTH"
                      value={attributes.strength}
                    />

                    <Attribute
                      name="INTELLIGENCE"
                      value={
                        attributes.intelligence
                      }
                    />

                    <Attribute
                      name="DISCIPLINE"
                      value={
                        attributes.discipline
                      }
                    />

                    <Attribute
                      name="FOCUS"
                      value={attributes.focus}
                    />

                    <Attribute
                      name="CONSISTENCY"
                      value={
                        attributes.consistency
                      }
                    />

                  </div>

                </motion.section>

                {/* QUESTS */}

                <QuestBoard
                  quests={allQuests}
                  completedQuests={
                    completedQuests
                  }
                  onComplete={(questId) => {

                    const quest =
                      allQuests.find(
                        (item) =>
                          item.id === questId
                      );

                    if (quest) {
                      completeQuest(quest);
                    }

                  }}
                  onReset={resetQuests}
                  onDelete={deleteQuest}
                />

                {/* OBJECTIVES */}

                <motion.section
                  initial={{
                    opacity: 0,
                    x: 30,
                  }}
                  animate={{
                    opacity: 1,
                    x: 0,
                  }}
                  transition={{
                    delay: 0.25,
                  }}
                  className="objectives panel"
                >

                  <div className="section-label">
                    <span>03</span>
                    CURRENT OBJECTIVES
                  </div>

                  {allQuests.length > 0 ? (
                    allQuests.slice(0, 4).map((quest) => {
                      const isDone = completedQuests.includes(quest.id);
                      return (
                        <Objective
                          key={quest.id}
                          name={quest.title.toUpperCase()}
                          value={isDone ? "COMPLETE" : `+${quest.xp} XP`}
                          progress={isDone ? 100 : 0}
                        />
                      );
                    })
                  ) : (
                    <>
                      <Objective
                        name="LEVEL PROGRESSION"
                        value={`${currentLevelXP} / 1000 XP`}
                        progress={Math.round(xpPercentage)}
                      />
                      <Objective
                        name="QUEST PROTOCOL"
                        value="INITIALIZE NEW QUEST"
                        progress={0}
                      />
                      <Objective
                        name="RANK ADVANCEMENT"
                        value={
                          level < 5
                            ? `LV. 05 REQUIRED (${5 - level} TO GO)`
                            : `RANK ${getRank(level)} ACTIVE`
                        }
                        progress={Math.min(100, Math.round((level / 5) * 100))}
                      />
                      <Objective
                        name="FOCUS PROTOCOL"
                        value="ENTER FOCUS MODE"
                        progress={0}
                      />
                    </>
                  )}

                  <div className="system-tip">

                    <Activity size={15} />

                    <div>
                      <span>SYSTEM TIP</span>

                      <p>
                        Complete quests to
                        increase your
                        attributes and
                        unlock higher ranks.
                      </p>
                    </div>

                  </div>

                </motion.section>

              </section>
            </motion.div>
          )}

          {/* QUESTS */}

          {activePage === "QUESTS" && (
            <motion.div
              key="quests"
              initial={{
                opacity: 0,
                y: 12,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: -12,
              }}
              transition={{
                duration: 0.25,
              }}
            >
              <div className="main-grid">
<div className="daily-system-header">
  <div>
    <span className="system-label">
      DAILY PROTOCOL
    </span>

    <h2>
      {new Date().toLocaleDateString("en-GB", {
        weekday: "long",
        day: "2-digit",
        month: "short",
      }).toUpperCase()}
    </h2>
  </div>

  <div className="daily-header-right">
    <button
      className="quest-reset-btn"
      onClick={resetQuests}
      disabled={completedQuests.length === 0}
      title="Reset quest completions"
    >
      <RotateCcw size={12} />
      <span>RESET PROTOCOL</span>
    </button>

    <div className="daily-progress">
      <strong>
        {completedQuestCount}
        /{allQuests.length}
      </strong>

      <span>COMPLETE</span>
    </div>
  </div>
</div>
                <CreateQuest
                  onCreate={createCustomQuest}
                />

                <QuestBoard
                  quests={allQuests}
                  completedQuests={
                    completedQuests
                  }
                  onComplete={(questId) => {

                    const quest =
                      allQuests.find(
                        (item) =>
                          item.id === questId
                      );

                    if (quest) {
                      completeQuest(quest);
                    }

                  }}
                  onReset={resetQuests}
                  onDelete={deleteQuest}
                />

              </div>
            </motion.div>
          )}

          {/* FOCUS */}

          {/* SKILLS */}

          {activePage === "SKILLS" && (
            <motion.div
              key="skills"
              initial={{
                opacity: 0,
                y: 12,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: -12,
              }}
              transition={{
                duration: 0.25,
              }}
            >
              <div className="main-grid">
                <SkillsPage
                  level={level}
                />
              </div>
            </motion.div>
          )}

          {/* ACHIEVEMENTS */}

          {activePage === "ACHIEVEMENTS" && (
            <motion.div
              key="achievements"
              initial={{
                opacity: 0,
                y: 12,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: -12,
              }}
              transition={{
                duration: 0.25,
              }}
            >
              <div className="main-grid">

                <AchievementsPage
                  level={level}
                  questCompletions={questCompletions}
                />

              </div>
            </motion.div>
          )}

          {/* INVENTORY */}

          {activePage === "INVENTORY" && (
            <motion.div
              key="inventory"
              initial={{
                opacity: 0,
                y: 12,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: -12,
              }}
              transition={{
                duration: 0.25,
              }}
            >
              <div className="main-grid">

                <InventoryPage
                  level={level}
                />

              </div>
            </motion.div>
          )}

        </AnimatePresence>

        <div
          className="main-grid focus-page-shell"
          hidden={activePage !== "FOCUS"}
        >
          <FocusPage onSessionComplete={completeFocusSession} />
        </div>

        {/* NAVIGATION */}

        <SystemNav
          activePage={activePage}
          setActivePage={setActivePage}
        />

        {/* TERMINAL STATUS */}

        <div className="system-terminal">
          <span className="terminal-prefix">
            &gt;
          </span>

          <span>
            SYSTEM STATUS:
          </span>

          <strong>
            ALL SYSTEMS OPERATIONAL
          </strong>

          <span className="terminal-cursor">
            _
          </span>
        </div>

        {/* FOOTER */}

        <footer>
          AWAKEN SYSTEM // PLAYER DEVELOPMENT
          PROTOCOL
        </footer>

      </main>
    </div>
    </MotionConfig>
  );
}

/* --------------------------------
   ATTRIBUTE
-------------------------------- */

function Attribute({
  name,
  value,
}: {
  name: string;
  value: number;
}) {
  const maxDots = Math.max(5, Math.min(value, 10));

  return (
    <div className="attribute">
      <span>{name}</span>

      <div className="attribute-dots">
        {Array.from({
          length: maxDots,
        }).map((_, i) => (
          <i
            key={i}
            className={
              i < value
                ? "active"
                : ""
            }
          />
        ))}
      </div>

      <strong>{value}</strong>
    </div>
  );
}

/* --------------------------------
   OBJECTIVE
-------------------------------- */

function Objective({
  name,
  value,
  progress,
}: {
  name: string;
  value: string;
  progress: number;
}) {
  return (
    <div className="objective">

      <div>
        <span>{name}</span>
        <strong>{value}</strong>
      </div>

      <div className="objective-bar">

        <motion.div
          animate={{
            width: `${progress}%`,
          }}
          transition={{
            duration: 1,
          }}
        />

      </div>

    </div>
  );
}

export default App;