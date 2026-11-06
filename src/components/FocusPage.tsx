import { useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw, Target } from "lucide-react";
import { sound } from "../utils/soundEffects";
import type { FocusSession } from "../types/game";

type FocusPageProps = {
  onSessionComplete: (session: FocusSession) => void;
  sessions: FocusSession[];
};

export default function FocusPage({
  onSessionComplete,
  sessions,
}: FocusPageProps) {
  const [minutes, setMinutes] = useState(25);
  const [remainingMs, setRemainingMs] = useState(25 * 60_000);
  const [running, setRunning] = useState(false);
  const [task, setTask] = useState("");
  const [hasActiveSession, setHasActiveSession] = useState(false);
  const deadlineRef = useRef<number | null>(null);
  const sessionIdRef = useRef<string | null>(null);

  const sessionXP = Math.round(minutes * 2);

  useEffect(() => {
    if (!running) return;

    const interval = setInterval(() => {
      const remaining = Math.max(0, (deadlineRef.current ?? Date.now()) - Date.now());
      setRemainingMs(remaining);

      if (remaining === 0) {
        setRunning(false);
        deadlineRef.current = null;
        const id = sessionIdRef.current;
        sessionIdRef.current = null;
        setHasActiveSession(false);
        if (id) {
          onSessionComplete({
            id,
            task: task.trim(),
            durationMinutes: minutes,
            xp: sessionXP,
            completedAt: new Date().toISOString(),
          });
        }
        return;
      }
    }, 250);

    return () => clearInterval(interval);
  }, [minutes, onSessionComplete, running, sessionXP, task]);

  const changeDuration = (duration: number) => {
    setMinutes(duration);
    setRemainingMs(duration * 60_000);
    sessionIdRef.current = null;
    setHasActiveSession(false);
  };

  const reset = () => {
    setRunning(false);
    deadlineRef.current = null;
    sessionIdRef.current = null;
    setHasActiveSession(false);
    setRemainingMs(minutes * 60_000);
    sound.playClick();
  };

  const toggleRunning = () => {
    if (running) {
      const remaining = Math.max(0, (deadlineRef.current ?? Date.now()) - Date.now());
      deadlineRef.current = null;
      setRemainingMs(remaining);
      setRunning(false);
      sound.playClick();
      return;
    }

    const remaining = remainingMs <= 0 ? minutes * 60_000 : remainingMs;
    setRemainingMs(remaining);
    if (!sessionIdRef.current) {
      sessionIdRef.current = crypto.randomUUID();
      setHasActiveSession(true);
    }
    deadlineRef.current = Date.now() + remaining;
    setRunning(true);
    sound.playFocusStart();
  };

  const secondsLeft = Math.ceil(remainingMs / 1000);
  const displayMinutes = Math.floor(secondsLeft / 60)
    .toString()
    .padStart(2, "0");

  const displaySeconds = (secondsLeft % 60)
    .toString()
    .padStart(2, "0");

  const progress = Math.min(100, Math.max(
    0,
    ((minutes * 60_000 - remainingMs) / (minutes * 60_000)) * 100,
  ));

  return (
    <section className="focus-page panel">
      <div className="panel-corner" />

      <div className="focus-header">
        <div>
          <span className="system-label">
            SYSTEM PROTOCOL
          </span>

          <h2>FOCUS MODE</h2>

          <p>
            Enter a focused state. Complete the
            session to receive XP.
          </p>
        </div>

        <Target size={22} />
      </div>

      <div className="focus-task">
        <label htmlFor="focus-objective">ACTIVE OBJECTIVE</label>

        <input
          id="focus-objective"
          value={task}
          onChange={(event) =>
            setTask(event.target.value)
          }
          placeholder="What are you working on?"
        />
      </div>

      <div className="focus-duration">
        {[15, 25, 45, 60].map((duration) => (
          <button
            key={duration}
            className={
              minutes === duration
                ? "active"
                : ""
            }
            aria-pressed={minutes === duration}
            disabled={running}
            onClick={() =>
              changeDuration(duration)
            }
          >
            {duration} MIN
          </button>
        ))}
      </div>

      <div className="focus-timer">
        <div
          className="focus-progress"
          role="progressbar"
          aria-label="Focus session progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress)}
          style={{
            background: `conic-gradient(
              rgba(177, 154, 255, 0.95) ${progress}%,
              rgba(70, 60, 100, 0.2) ${progress}%
            )`,
          }}
        >
          <div className="focus-timer-inner">
            <span>FOCUS</span>

            <strong role="timer" aria-live="off">
              {displayMinutes}:{displaySeconds}
            </strong>

            <small>
              +{sessionXP} XP
            </small>
          </div>
        </div>
      </div>

      <div className="focus-controls">
        <button
          className="focus-main-button"
          aria-pressed={running}
          onClick={toggleRunning}
        >
          {running ? (
            <Pause size={17} />
          ) : (
            <Play size={17} />
          )}

          {running ? "PAUSE" : hasActiveSession ? "RESUME FOCUS" : "START FOCUS"}
        </button>

        <button
          className="focus-reset"
          onClick={reset}
        >
          <RotateCcw size={15} />
          RESET
        </button>
      </div>

      <div className="focus-status">
        <span />
        {running
          ? "FOCUS PROTOCOL ACTIVE"
          : "SYSTEM READY"}
      </div>

      <section className="focus-history" aria-labelledby="focus-history-title">
        <div className="focus-history-heading">
          <span className="system-label">SESSION LOG</span>
          <h3 id="focus-history-title">RECENT CLEARS</h3>
        </div>
        {sessions.length === 0 ? (
          <p className="focus-history-empty">No completed focus sessions recorded yet.</p>
        ) : (
          <ol>
            {[...sessions].reverse().slice(0, 5).map((session) => (
              <li key={session.id}>
                <span>{session.task || "FOCUS SESSION"}</span>
                <time dateTime={session.completedAt}>
                  {new Date(session.completedAt).toLocaleString([], {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </time>
                <strong>{session.durationMinutes} MIN · +{session.xp} XP</strong>
              </li>
            ))}
          </ol>
        )}
      </section>
    </section>
  );
}