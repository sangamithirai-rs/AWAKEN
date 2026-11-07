import { useEffect, useState } from "react";
import { AnimatePresence, motion, MotionConfig } from "framer-motion";
import {
  Activity,
  Check,
  Sparkles,
  Target,
  X,
} from "lucide-react";

import type { Page } from "./components/SystemNav";
import SystemHeader from "./components/SystemHeader";
import SystemSidebar from "./components/SystemSidebar";
import CharacterPage from "./components/CharacterPage";
import QuestBoard from "./components/QuestBoard";
import SkillsPage from "./components/SkillsPage";
import AchievementsPage from "./components/AchievementsPage";
import InventoryPage from "./components/InventoryPage";
import CreateQuest from "./components/CreateQuest";
import FocusPage from "./components/FocusPage";
import AnalyticsPage from "./components/AnalyticsPage";
import StreakCard from "./components/StreakCard";
import { useAwakenGame } from "./hooks/useAwakenGame";
import { getRank } from "./game/gameData";
import { getCharacterInitials } from "./game/character";

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
  const game = useAwakenGame();
  const {
    activityLog,
    addCustomCategory,
    allQuests,
    characterProfile,
    completeFocusSession,
    completeQuest,
    customCategories,
    completedQuestCount,
    completedQuests,
    createQuest,
    currentLevelXP,
    deleteQuest,
    level,
    levelUp,
    notification,
    pendingQuests,
    questCompletions,
    recoverYesterday,
    recoveryCredits,
    canRecoverYesterday,
    currentStreak,
    longestStreak,
    currentWeeklyStreak,
    longestWeeklyStreak,
    setNotification,
    showNotification,
    soundEnabled,
    storageWarning,
    toggleSound,
    updateCharacterProfile,
    xp,
    xpPercentage,
  } = game;

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

  useEffect(() => {
    if (storageWarning) showNotification(storageWarning);
  }, [showNotification, storageWarning]);

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
                {String(levelUp.from).padStart(2, "0")}

                <span>→</span>

                {String(levelUp.to).padStart(2, "0")}
              </div>

              <p>
                NEW POTENTIAL DETECTED
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="system-container">
        <SystemSidebar
          activePage={activePage}
          level={level}
          rank={getRank(level)}
          hunterName={characterProfile.name}
          setActivePage={setActivePage}
        />

        <div className="system-main">
          <SystemHeader
            activePage={activePage}
            completed={completedQuestCount}
            date={systemDate}
            level={level}
            rank={getRank(level)}
            soundEnabled={soundEnabled}
            toggleSound={toggleSound}
            totalQuests={allQuests.length}
            totalXP={xp}
            time={systemTime}
          />

        <div className={`system-content system-content-${activePage.toLowerCase()}`}>

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
              <section className="main-grid system-dashboard">
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
                        {featuredQuest
                          ? featuredQuest.kind === "BOSS"
                            ? "ACTIVE CONTRACT // BOSS"
                            : `ACTIVE CONTRACT // ${featuredQuest.type ?? "QUEST"}`
                          : "NO ACTIVE CONTRACT"}
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
                          {featuredQuest
                            ? featuredQuest.kind === "BOSS"
                              ? "ADVANCE BOSS OBJECTIVE"
                              : "CLEAR CONTRACT"
                            : "ACCESS QUEST BOARD"}
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

                <StreakCard
                  current={currentStreak}
                  longest={longestStreak}
                  weeklyCurrent={currentWeeklyStreak}
                  weeklyLongest={longestWeeklyStreak}
                  recoveryCredits={recoveryCredits}
                  canRecoverYesterday={canRecoverYesterday}
                  onRecoverYesterday={recoverYesterday}
                />

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
                      {getCharacterInitials(characterProfile.name)}
                    </motion.div>

                    <div className="player-name">
                      <span>PLAYER</span>
                      <h2>                      {characterProfile.name}</h2>
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
                      value={game.effectiveAttributes.strength}
                    />

                    <Attribute
                      name="INTELLIGENCE"
                      value={
                        game.effectiveAttributes.intelligence
                      }
                    />

                    <Attribute
                      name="VITALITY"
                      value={game.effectiveAttributes.vitality}
                    />

                    <Attribute
                      name="DISCIPLINE"
                      value={
                        game.effectiveAttributes.discipline
                      }
                    />

                    <Attribute
                      name="CREATIVITY"
                      value={game.effectiveAttributes.creativity}
                    />

                    <Attribute
                      name="FOCUS"
                      value={game.effectiveAttributes.focus}
                    />

                    <Attribute
                      name="CONSISTENCY"
                      value={
                        game.effectiveAttributes.consistency
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

          {activePage === "CHARACTER" && (
            <motion.div
              key="character"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              <div className="main-grid page-grid page-grid-character">
                <CharacterPage
                  profile={characterProfile}
                  attributes={game.effectiveAttributes}
                  level={level}
                  rank={getRank(level)}
                  xp={xp}
                  currentLevelXP={currentLevelXP}
                  xpPercentage={xpPercentage}
                  questCompletions={questCompletions}
                  classXP={game.classXP}
                  skillLevels={game.skillLevels}
                  equipmentNames={Object.fromEntries(
                    Object.entries(game.equipment).map(([slot, itemId]) => [
                      slot,
                      game.inventory.find((item) => item.itemId === itemId)
                        ? itemId?.replaceAll("-", " ").toUpperCase()
                        : undefined,
                    ]),
                  )}
                  onSave={updateCharacterProfile}
                />
              </div>
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
              <div className="main-grid page-grid page-grid-quests">
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
                  onCreate={createQuest}
                  categories={customCategories}
                  onAddCategory={addCustomCategory}
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
                  onDelete={deleteQuest}
                />

              </div>
            </motion.div>
          )}

          {/* FOCUS */}

          {activePage === "ANALYTICS" && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              <div className="main-grid page-grid page-grid-analytics">
                <AnalyticsPage
                  activityLog={activityLog}
                  focusSessions={game.focusSessions}
                />
              </div>
            </motion.div>
          )}

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
              <div className="main-grid page-grid page-grid-skills">
                <SkillsPage
                  level={level}
                  skillXP={game.skillXP}
                  skillPoints={game.skillPoints}
                  branchXP={game.branchXP}
                  skillLevels={game.skillLevels}
                  onUnlock={game.unlockSkill}
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
              <div className="main-grid page-grid page-grid-achievements">

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
              <div className="main-grid page-grid page-grid-inventory">

                <InventoryPage
                  level={level}
                  gold={game.gold}
                  inventory={game.inventory}
                  equipment={game.equipment}
                  transactions={game.transactions}
                  onPurchase={game.purchaseInventoryItem}
                  onEquip={game.equipItem}
                  onUnequip={game.unequipItem}
                  onUse={game.useInventoryItem}
                />

              </div>
            </motion.div>
          )}

        </AnimatePresence>

        <div
          className="main-grid page-grid page-grid-focus focus-page-shell"
          hidden={activePage !== "FOCUS"}
        >
          <FocusPage
            onSessionComplete={completeFocusSession}
            sessions={game.focusSessions}
          />
        </div>

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
        </div>
        </div>
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