import { Brain, Flame, Heart, Lightbulb, Shield, Target, Zap } from "lucide-react";
import { motion } from "framer-motion";
import type { Attributes } from "../types/game";

type PlayerStatusProps = {
  level: number;
  xp: number;
  currentLevelXP: number;
  xpPercentage: number;
  attributes: Attributes;
};

export default function PlayerStatus({
  level,
  xp,
  currentLevelXP,
  xpPercentage,
  attributes,
}: PlayerStatusProps) {
  const attributeData = [
    {
      label: "STRENGTH",
      value: attributes.strength,
      icon: Zap,
    },
    {
      label: "INTELLIGENCE",
      value: attributes.intelligence,
      icon: Brain,
    },
    {
      label: "VITALITY",
      value: attributes.vitality,
      icon: Heart,
    },
    {
      label: "DISCIPLINE",
      value: attributes.discipline,
      icon: Shield,
    },
    {
      label: "CREATIVITY",
      value: attributes.creativity,
      icon: Lightbulb,
    },
    {
      label: "FOCUS",
      value: attributes.focus,
      icon: Target,
    },
    {
      label: "CONSISTENCY",
      value: attributes.consistency,
      icon: Flame,
    },
  ];

  return (
    <section className="panel player-status">
      <div className="panel-corner" />

      <div className="player-core">
        <div className="player-emblem">
          <span>S</span>
        </div>

        <div>
          <div className="player-name">SAM</div>
          <div className="level-display">
            LEVEL {level}
          </div>
        </div>
      </div>

      <div className="xp-section">
        <div className="xp-label">
          <span>EXPERIENCE</span>
          <span>
            {currentLevelXP} / 1000 XP
          </span>
        </div>

        <div className="xp-bar">
          <motion.div
            className="xp-fill"
            initial={{ width: 0 }}
            animate={{ width: `${xpPercentage}%` }}
          />
        </div>

        <div className="xp-total">
          TOTAL XP: {xp}
        </div>
      </div>

      <div className="attributes">
        {attributeData.map(({ label, value, icon: Icon }) => (
          <div className="attribute" key={label}>
            <div className="attribute-info">
              <Icon size={14} />
              <span>{label}</span>
            </div>

            <div className="attribute-dots">
              {Array.from({
                length: Math.min(value, 10),
              }).map((_, index) => (
                <span className="filled" key={index} />
              ))}

              {Array.from({
                length: Math.max(0, 10 - value),
              }).map((_, index) => (
                <span key={`empty-${index}`} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}