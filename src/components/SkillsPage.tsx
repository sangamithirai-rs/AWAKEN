import { useState } from "react";
import { motion } from "framer-motion";
import {
  Brain,
  Code2,
  Lightbulb,
  LockKeyhole,
  Shield,
  Sparkles,
  Target,
} from "lucide-react";
import type {
  ProgressionClass,
  SkillLevels,
  SkillNodeId,
  SkillXP,
} from "../types/game";
import {
  getSkillUnlockReason,
  skillBranches,
  skillNodes,
} from "../game/skills";

type SkillsPageProps = {
  level: number;
  skillXP: SkillXP;
  skillPoints: number;
  branchXP: Record<ProgressionClass, number>;
  skillLevels: SkillLevels;
  onUnlock: (nodeId: SkillNodeId) => void;
};

const branchIcons: Record<ProgressionClass, typeof Shield> = {
  WARRIOR: Shield,
  SCHOLAR: Brain,
  SHADOW_HUNTER: Code2,
  ARCHITECT: Lightbulb,
  PHANTOM: Target,
};

export default function SkillsPage({
  level,
  skillXP,
  skillPoints,
  branchXP,
  skillLevels,
  onUnlock,
}: SkillsPageProps) {
  const [selectedBranch, setSelectedBranch] = useState<ProgressionClass>("WARRIOR");
  const [selectedNodeId, setSelectedNodeId] = useState<SkillNodeId>("WARRIOR_FOUNDATION");
  const trainedCount = Object.values(skillLevels).filter((rank) => rank > 0).length;
  const branch = skillBranches.find((item) => item.id === selectedBranch) ?? skillBranches[0];
  const nodes = skillNodes.filter((node) => node.branch === selectedBranch);
  const selectedNode = nodes.find((node) => node.id === selectedNodeId) ?? nodes[0];
  const selectedRank = skillLevels[selectedNode.id];
  const unlockReason = getSkillUnlockReason(
    selectedNode,
    skillLevels,
    skillPoints,
    level,
    branchXP[selectedBranch],
  );
  const Icon = branchIcons[selectedBranch];

  const selectBranch = (nextBranch: ProgressionClass) => {
    setSelectedBranch(nextBranch);
    const firstNode = skillNodes.find((node) => node.branch === nextBranch);
    if (firstNode) setSelectedNodeId(firstNode.id);
  };

  return (
    <section className={`skills-page panel skill-archive branch-${selectedBranch.toLowerCase()}`}>
      <div className="panel-corner" />
      <header className="quest-heading">
        <div>
          <span className="system-label">HUNTER MILESTONES / LEVEL {level}</span>
          <h2>SKILL PROGRESSION</h2>
        </div>
        <div className="skill-point-balance" aria-live="polite">
          <Sparkles size={16} aria-hidden="true" />
          <strong>{skillPoints}</strong> SKILL POINTS
        </div>
      </header>

      <nav className="skill-branch-tabs" aria-label="Skill branches">
        {skillBranches.map((item) => {
          const BranchIcon = branchIcons[item.id];
          const trained = skillNodes
            .filter((node) => node.branch === item.id)
            .filter((node) => skillLevels[node.id] > 0).length;
          return (
            <button
              type="button"
              key={item.id}
              className={selectedBranch === item.id ? "active" : ""}
              aria-pressed={selectedBranch === item.id}
              onClick={() => selectBranch(item.id)}
            >
              <BranchIcon size={16} aria-hidden="true" />
              <span>{item.title}</span>
              <small>{trained}/3</small>
            </button>
          );
        })}
      </nav>

      <div className="skill-branch-overview">
        <div className="skill-branch-emblem"><Icon size={27} aria-hidden="true" /></div>
        <div>
          <span>{branch.linkedActivities}</span>
          <h3>{branch.title}</h3>
          <p>{branch.description}</p>
        </div>
        <div className="skill-branch-progress">
          <span>BRANCH EXPERIENCE</span>
          <strong>{branchXP[selectedBranch].toLocaleString()} XP</strong>
          <small>{trainedCount}/{skillNodes.length} MILESTONES TRAINED</small>
          <div className="skill-domain-xp">
            <span>BODY {skillXP.BODY.toLocaleString()}</span>
            <span>MIND {skillXP.MIND.toLocaleString()}</span>
            <span>WILL {skillXP.WILL.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="skill-branch-workspace">
        <div className="skill-path" aria-label={`${branch.title} skill path`}>
          {nodes.map((node, index) => {
            const rank = skillLevels[node.id];
            const isSelected = selectedNode.id === node.id;
            const isUnlocked = rank > 0;
            return (
              <div className="skill-path-step" key={node.id}>
                {index > 0 && <span className="skill-path-link" aria-hidden="true" />}
                <button
                  type="button"
                  className={`skill-path-node ${isUnlocked ? "unlocked" : "locked"} ${isSelected ? "selected" : ""}`}
                  aria-pressed={isSelected}
                  aria-label={`${node.name}, ${isUnlocked ? `rank ${rank} of ${node.maxLevel}` : "locked"}`}
                  onClick={() => setSelectedNodeId(node.id)}
                >
                  <span className="skill-path-number">
                    {isUnlocked ? <Sparkles size={15} aria-hidden="true" /> : <LockKeyhole size={13} aria-hidden="true" />}
                    <small>{String(index + 1).padStart(2, "0")}</small>
                  </span>
                  <strong>{node.name}</strong>
                  <span>{isUnlocked ? `RANK ${rank}/${node.maxLevel}` : `LV. ${node.requiredLevel} REQUIRED`}</span>
                </button>
              </div>
            );
          })}
        </div>

        <motion.aside
          key={selectedNode.id}
          className="skill-node-briefing"
          initial={{ opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.18 }}
          aria-live="polite"
        >
          <span className="system-label">MILESTONE {nodes.findIndex((node) => node.id === selectedNode.id) + 1}</span>
          <h3>{selectedNode.name}</h3>
          <p>{selectedNode.description}</p>
          <div className="skill-node-effect">
            <span>PASSIVE EFFECT</span>
            <strong>{selectedNode.effect}</strong>
          </div>
          <dl>
            <div><dt>HUNTER LEVEL</dt><dd>{level} / {selectedNode.requiredLevel}</dd></div>
            <div><dt>BRANCH XP</dt><dd>{branchXP[selectedBranch].toLocaleString()} / {selectedNode.requiredBranchXP.toLocaleString()}</dd></div>
            <div><dt>SKILL RANK</dt><dd>{selectedRank} / {selectedNode.maxLevel}</dd></div>
            {selectedNode.prerequisite && (
              <div>
                <dt>PREREQUISITE</dt>
                <dd>{skillNodes.find((node) => node.id === selectedNode.prerequisite)?.name}</dd>
              </div>
            )}
          </dl>
          <motion.button
            type="button"
            className="skill-unlock-button"
            whileHover={unlockReason ? undefined : { scale: 1.02 }}
            whileTap={unlockReason ? undefined : { scale: 0.98 }}
            disabled={Boolean(unlockReason)}
            onClick={() => onUnlock(selectedNode.id)}
          >
            {unlockReason ?? (selectedRank ? "UPGRADE MILESTONE" : "UNLOCK MILESTONE")}
            {!unlockReason && <span> · {selectedRank + 1} SP</span>}
          </motion.button>
        </motion.aside>
      </div>
    </section>
  );
}
