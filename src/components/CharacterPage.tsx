import { useState, type FormEvent } from "react";
import {
  Brain,
  Heart,
  Lightbulb,
  Shield,
  Sparkles,
  Target,
  Zap,
} from "lucide-react";
import type {
  Attributes,
  ClassXP,
  CharacterProfile,
  HunterClass,
  HunterSpecialization,
  SkillLevels,
} from "../types/game";
import {
  getHunterTitles,
  getProgressionClass,
  hunterClasses,
} from "../game/character";
import { skillNodes } from "../game/skills";

type CharacterPageProps = {
  profile: CharacterProfile;
  attributes: Attributes;
  level: number;
  rank: string;
  xp: number;
  currentLevelXP: number;
  xpPercentage: number;
  questCompletions: number;
  classXP: ClassXP;
  skillLevels: SkillLevels;
  equipmentNames: Partial<Record<"WEAPON" | "ARMOUR" | "ACCESSORY", string>>;
  onSave: (profile: CharacterProfile) => void;
};

const statDefinitions: {
  key: keyof Attributes;
  label: string;
  activity: string;
  icon: typeof Zap;
}[] = [
  { key: "strength", label: "STRENGTH", activity: "Physical quests", icon: Zap },
  { key: "intelligence", label: "INTELLIGENCE", activity: "Study and analysis quests", icon: Brain },
  { key: "vitality", label: "VITALITY", activity: "Health and recovery quests", icon: Heart },
  { key: "discipline", label: "DISCIPLINE", activity: "Routine and discipline quests", icon: Shield },
  { key: "creativity", label: "CREATIVITY", activity: "Creative and project quests", icon: Lightbulb },
  { key: "focus", label: "FOCUS", activity: "Focus quests and sessions", icon: Target },
  { key: "consistency", label: "CONSISTENCY", activity: "Consistency quests", icon: Sparkles },
];

type CharacterTab = "DOSSIER" | "ATTRIBUTES" | "CLASS";

export default function CharacterPage({
  profile,
  attributes,
  level,
  rank,
  xp,
  currentLevelXP,
  xpPercentage,
  questCompletions,
  classXP,
  skillLevels,
  equipmentNames,
  onSave,
}: CharacterPageProps) {
  const [name, setName] = useState(profile.name);
  const [hunterClass, setHunterClass] = useState<HunterClass>(profile.hunterClass);
  const [specialization, setSpecialization] = useState<HunterSpecialization>(
    profile.specialization,
  );
  const [tab, setTab] = useState<CharacterTab>("DOSSIER");
  const selectedClass = hunterClasses.find((item) => item.id === hunterClass) ?? hunterClasses[0];
  const progressionClass = getProgressionClass(selectedClass.id);
  const classPoints = classXP[progressionClass];
  const activeEvolution = selectedClass.evolution.find(
    (evolution) => level < evolution.level || classPoints < evolution.classXP,
  );
  const classSkills = skillNodes.filter((node) => node.branch === progressionClass);
  const trainedClassSkills = classSkills.filter((node) => skillLevels[node.id] > 0).length;
  const titles = getHunterTitles(level, questCompletions);

  const handleClassChange = (nextClass: HunterClass) => {
    const newClass = hunterClasses.find((item) => item.id === nextClass);
    if (!newClass) return;
    setHunterClass(nextClass);
    setSpecialization(newClass.specializations[0].id);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSave({ name, hunterClass, specialization });
  };

  return (
    <section className="character-page panel" aria-labelledby="character-title">
      <div className="panel-corner" />
      <header className="character-page-heading">
        <div>
          <span className="system-label">HUNTER DOSSIER / AWAKENING RECORD</span>
          <h2 id="character-title">CHARACTER PROFILE</h2>
        </div>
        <span className="character-rank">RANK {rank}</span>
      </header>

      <nav className="character-tabs" aria-label="Character details">
        {(["DOSSIER", "ATTRIBUTES", "CLASS"] as const).map((item) => (
          <button
            type="button"
            key={item}
            className={tab === item ? "active" : ""}
            aria-pressed={tab === item}
            onClick={() => setTab(item)}
          >
            {item === "CLASS" ? "CLASS & REGISTRY" : item}
          </button>
        ))}
      </nav>

      {tab === "DOSSIER" && (
        <div className="character-dossier-layout">
          <section className="character-portrait-panel">
            <svg
              className="hunter-portrait-art"
              viewBox="0 0 360 440"
              role="img"
              aria-label="Original illustrated hunter in a luminous blue cloak"
            >
              <defs>
                <linearGradient id="hunter-cloak" x1="0" x2="1" y1="0" y2="1">
                  <stop offset="0" stopColor="#284f78" />
                  <stop offset=".48" stopColor="#111d31" />
                  <stop offset="1" stopColor="#080d18" />
                </linearGradient>
                <linearGradient id="hunter-face" x1="0" x2=".8" y1="0" y2="1">
                  <stop offset="0" stopColor="#f1d8d0" />
                  <stop offset="1" stopColor="#a97875" />
                </linearGradient>
                <linearGradient id="hunter-hair" x1="0" x2="1" y1="0" y2="1">
                  <stop offset="0" stopColor="#e9f4ff" />
                  <stop offset=".42" stopColor="#91bde5" />
                  <stop offset="1" stopColor="#385e88" />
                </linearGradient>
                <radialGradient id="hunter-aura">
                  <stop stopColor="#57caff" stopOpacity=".4" />
                  <stop offset="1" stopColor="#57caff" stopOpacity="0" />
                </radialGradient>
              </defs>
              <ellipse cx="180" cy="213" fill="url(#hunter-aura)" rx="158" ry="190" />
              <path d="M66 409c8-96 35-139 84-159h60c50 20 78 64 84 159v31H66z" fill="url(#hunter-cloak)" stroke="#77caff" strokeOpacity=".52" strokeWidth="2" />
              <path d="m138 251 42 39 42-39 21 21-33 159h-60l-33-159z" fill="#111a2b" stroke="#7199c2" strokeOpacity=".5" strokeWidth="2" />
              <path d="m137 267 43 35 43-35-16 51-27-15-27 15z" fill="#73d9ff" fillOpacity=".8" />
              <path d="M126 107c3-51 26-75 58-75s57 24 59 75l-8 92c-6 39-27 61-51 61s-45-22-51-61z" fill="url(#hunter-face)" stroke="#f1d9e3" strokeOpacity=".45" strokeWidth="2" />
              <path d="M112 154c-19-78 14-132 69-132 64 0 88 53 67 131l-18-33-6-44-31 31-20-35-31 36-10-25-4 55z" fill="url(#hunter-hair)" stroke="#c3e5ff" strokeOpacity=".6" strokeWidth="2" />
              <path d="m132 141 31-6m35 0 31 6" fill="none" stroke="#28445e" strokeWidth="5" strokeLinecap="round" />
              <path d="m139 153 23 3m40 0 22-3" fill="none" stroke="#56d8ff" strokeWidth="4" strokeLinecap="round" />
              <path d="m170 191 10 5 10-5" fill="none" stroke="#805d62" strokeWidth="2" strokeLinecap="round" />
              <path d="M98 283 65 323l-9-66 39-55m167 81 33 40 9-66-39-55" fill="#17283c" stroke="#69c8f2" strokeOpacity=".62" strokeWidth="3" />
              <path d="M75 366h31m148 0h31" stroke="#5ddaff" strokeOpacity=".55" strokeWidth="2" />
              <path d="M92 404h47m82 0h47" stroke="#c1e9ff" strokeOpacity=".36" strokeWidth="2" />
            </svg>
            <div className="character-portrait-copy">
              <span className="system-label">RANK {rank} HUNTER · LEVEL {String(level).padStart(2, "0")}</span>
              <h3>{profile.name}</h3>
              <p>{selectedClass.name} · {selectedClass.specializations.find(
                (item) => item.id === profile.specialization,
              )?.name}</p>
              <div className="character-featured-title">{titles[0] ?? "AWAKENED HUNTER"}</div>
            </div>
            <div
              className="character-xp-track"
              role="progressbar"
              aria-label="Progress to next level"
              aria-valuemin={0}
              aria-valuemax={1000}
              aria-valuenow={currentLevelXP}
            >
              <span style={{ width: `${xpPercentage}%` }} />
            </div>
            <strong>{currentLevelXP} / 1000 XP TO NEXT LEVEL</strong>
            <small>{xp.toLocaleString()} TOTAL XP</small>
          </section>

          <section className="character-dossier-side">
            <div className="character-mini-stats">
              {[
                ["STRENGTH", attributes.strength],
                ["INTELLIGENCE", attributes.intelligence],
                ["VITALITY", attributes.vitality],
                ["DISCIPLINE", attributes.discipline],
                ["CREATIVITY", attributes.creativity],
                ["FOCUS", attributes.focus],
                ["CONSISTENCY", attributes.consistency],
              ].map(([label, value]) => (
                <div key={label}>
                  <span>{label}</span>
                  <strong>{value}</strong>
                </div>
              ))}
            </div>
            <div className="character-equipment-summary">
              <span className="system-label">ACTIVE EQUIPMENT</span>
              {(["WEAPON", "ARMOUR", "ACCESSORY"] as const).map((slot) => (
                <div key={slot}>
                  <span>{slot}</span>
                  <strong>{equipmentNames[slot] ?? "EMPTY"}</strong>
                </div>
              ))}
            </div>
            <div className="character-title-strip">
              <span className="system-label">EARNED TITLES</span>
              <div>{titles.map((title) => <span key={title}>{title}</span>)}</div>
            </div>
          </section>
        </div>
      )}

      {tab === "ATTRIBUTES" && (
        <section className="character-stats character-tab-panel" aria-labelledby="character-stats-heading">
          <div className="character-section-heading">
            <span className="system-label">FIELD ATTRIBUTES · EQUIPMENT BONUSES INCLUDED</span>
            <h3 id="character-stats-heading">STAT RECORD</h3>
          </div>
          <div className="character-stat-grid">
            {statDefinitions.map(({ key, label, activity, icon: Icon }) => {
              const value = attributes[key];
              return (
                <article className="character-stat" key={key}>
                  <header>
                    <Icon size={16} aria-hidden="true" />
                    <span>{label}</span>
                    <strong>{value}</strong>
                  </header>
                  <div
                    className="character-stat-track"
                    role="progressbar"
                    aria-label={`${label} progression`}
                    aria-valuemin={0}
                    aria-valuemax={Math.max(10, value)}
                    aria-valuenow={value}
                  >
                    <span style={{ width: `${Math.min(100, value * 10)}%` }} />
                  </div>
                  <p>{activity}</p>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {tab === "CLASS" && (
        <div className="character-class-tab character-tab-panel">
          <section className="character-class-record" aria-labelledby="character-class-heading">
            <div className="character-section-heading">
              <span className="system-label">CLASS PATH / {selectedClass.linkedAttributes}</span>
              <h3 id="character-class-heading">{selectedClass.name.toUpperCase()} PROGRESSION</h3>
            </div>
            <div className="class-progression-summary">
              <article><span>CLASS PASSIVE</span><strong>{selectedClass.passive}</strong></article>
              <article><span>CLASS EXPERIENCE</span><strong>{classPoints.toLocaleString()} XP</strong></article>
              <article><span>CLASS SKILLS</span><strong>{trainedClassSkills}/{classSkills.length} TRAINED</strong></article>
            </div>
            <ol className="class-evolution-list">
              {selectedClass.evolution.map((evolution) => {
                const unlocked = level >= evolution.level && classPoints >= evolution.classXP;
                return (
                  <li className={unlocked ? "unlocked" : ""} key={evolution.title}>
                    <span>{evolution.title}</span>
                    <strong>
                      {unlocked
                        ? "EVOLVED"
                        : `LV. ${evolution.level} · ${evolution.classXP.toLocaleString()} CLASS XP`}
                    </strong>
                  </li>
                );
              })}
            </ol>
            {activeEvolution && (
              <p className="class-evolution-next">
                NEXT: {activeEvolution.title} · LEVEL {activeEvolution.level} AND{" "}
                {activeEvolution.classXP.toLocaleString()} CLASS XP
              </p>
            )}
          </section>

          <form className="character-edit" onSubmit={handleSubmit}>
            <div className="character-section-heading">
              <span className="system-label">HUNTER REGISTRY</span>
              <h3>IDENTITY & CLASS</h3>
            </div>
            <div className="character-edit-fields">
              <label>
                HUNTER NAME
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  maxLength={24}
                  minLength={1}
                  required
                  autoComplete="nickname"
                />
              </label>
              <label>
                CLASS
                <select
                  value={hunterClass}
                  onChange={(event) => handleClassChange(event.target.value as HunterClass)}
                >
                  {hunterClasses.map((item) => (
                    <option key={item.id} value={item.id}>{item.name}</option>
                  ))}
                </select>
              </label>
              <label>
                SPECIALIZATION
                <select
                  value={specialization}
                  onChange={(event) => setSpecialization(
                    event.target.value as HunterSpecialization,
                  )}
                >
                  {selectedClass.specializations.map((item) => (
                    <option key={item.id} value={item.id}>{item.name}</option>
                  ))}
                </select>
              </label>
            </div>
            <p className="character-class-description">{selectedClass.description} {selectedClass.passive}</p>
            <p className="character-class-preservation">
              Changing class preserves XP, stats, skills, gold, inventory, and equipment.
            </p>
            <button type="submit" className="character-save-button">SAVE HUNTER PROFILE</button>
          </form>
        </div>
      )}
    </section>
  );
}
