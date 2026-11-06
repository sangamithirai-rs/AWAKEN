import { useEffect, useState } from "react";
import { Pause, Play, RotateCcw, Target } from "lucide-react";
import { sound } from "../utils/soundEffects";

type FocusPageProps = {
  onSessionComplete: (xp: number, task?: string) => void;
};

export default function FocusPage({
  onSessionComplete,
}: FocusPageProps) {
  const [minutes, setMinutes] = useState(25);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [task, setTask] = useState("");

  const sessionXP = Math.round(minutes * 2);

  useEffect(() => {
    if (!running) return;

    const interval = setInterval(() => {
      if (secondsLeft <= 1) {
        setRunning(false);
        setSecondsLeft(minutes * 60);
        onSessionComplete(sessionXP, task.trim());
        return;
      }

      setSecondsLeft(secondsLeft - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [minutes, onSessionComplete, running, secondsLeft, sessionXP, task]);

  const changeDuration = (duration: number) => {
    setMinutes(duration);
    setSecondsLeft(duration * 60);
  };

  const reset = () => {
    setRunning(false);
    setSecondsLeft(minutes * 60);
    sound.playClick();
  };

  const displayMinutes = Math.floor(
    secondsLeft / 60
  )
    .toString()
    .padStart(2, "0");

  const displaySeconds = (secondsLeft % 60)
    .toString()
    .padStart(2, "0");

  const progress =
    ((minutes * 60 - secondsLeft) /
      (minutes * 60)) *
    100;

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
          onClick={() => {
            if (running) {
              sound.playClick();
              setRunning(false);
            } else {
              sound.playFocusStart();
              setRunning(true);
            }
          }}
        >
          {running ? (
            <Pause size={17} />
          ) : (
            <Play size={17} />
          )}

          {running ? "PAUSE" : "START FOCUS"}
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
    </section>
  );
}