import { Flame, ShieldCheck } from "lucide-react";

type StreakCardProps = {
  current: number;
  longest: number;
  weeklyCurrent: number;
  weeklyLongest: number;
  recoveryCredits: number;
  canRecoverYesterday: boolean;
  onRecoverYesterday: () => void;
};

export default function StreakCard({
  current,
  longest,
  weeklyCurrent,
  weeklyLongest,
  recoveryCredits,
  canRecoverYesterday,
  onRecoverYesterday,
}: StreakCardProps) {
  return (
    <section className="streak-card panel" aria-label="Activity streak">
      <div className="streak-card-heading">
        <div className="streak-icon"><Flame size={18} /></div>
        <div>
          <span className="system-label">HUNTER CONSISTENCY</span>
          <h3>ACTIVITY STREAK</h3>
        </div>
      </div>
      <div className="streak-readout">
        <strong>{current}</strong>
        <span>{current === 1 ? "DAY" : "DAYS"} CURRENT</span>
        <i />
        <span>BEST {longest}</span>
      </div>
      <div className="weekly-streak-readout">
        <span>WEEKLY RUN</span>
        <strong>{weeklyCurrent}</strong>
        <i />
        <span>BEST {weeklyLongest}</span>
      </div>
      <div className="recovery-status">
        <ShieldCheck size={15} />
        <span>{recoveryCredits} RECOVERY {recoveryCredits === 1 ? "CHARGE" : "CHARGES"}</span>
      </div>
      {canRecoverYesterday ? (
        <button type="button" className="recovery-button" onClick={onRecoverYesterday}>
          RESTORE YESTERDAY
        </button>
      ) : (
        <p>Earn one recovery charge for every 7 active days. Restore a single missed day.</p>
      )}
    </section>
  );
}
