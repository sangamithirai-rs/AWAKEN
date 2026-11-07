import { motion } from "framer-motion";
import {
  Brain,
  Code2,
  Lightbulb,
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
  const unlockedNodes = Object.values(skillLevels).filter((rank) => rank > 0).length;

  return (
    <section className="skills-page panel">
      <div className="panel-corner" />
      <header className="quest-heading">
        <div>
          <span className="system-label">SYSTEM / SKILL TREES · HUNTER LV. {level}</span>
          <h2>SKILL PROGRESSION</h2>
        </div>
        <div className="skill-point-balance" aria-live="polite">
          <Sparkles size={16} aria-hidden="true" />
          <strong>{skillPoints}</strong> SKILL POINTS
        </div>
      </header>
      <p className="skill-tree-intro">
        Earn one skill point each time you gain a hunter level. Unlock and upgrade passives
        with branch XP and prerequisites. A branch's passives activate while its matching
        class is selected.
      </p>
      <div className="skill-tree-summary">
        <span>{unlockedNodes} / {skillNodes.length} SKILLS TRAINED</span>
        <span>BODY {skillXP.BODY.toLocaleString()} XP</span>
        <span>MIND {skillXP.MIND.toLocaleString()} XP</span>
        <span>WILL {skillXP.WILL.toLocaleString()} XP</span>
      </div>

      <div className="skill-trees-grid">
        {skillBranches.map((branch) => {
          const Icon = branchIcons[branch.id];
          const nodes = skillNodes.filter((node) => node.branch === branch.id);
          const points = branchXP[branch.id];
          return (
            <article className={`skill-tree skill-tree-${branch.id.toLowerCase()}`} key={branch.id}>
              <header className="skill-tree-header">
                <div className="skill-tree-icon"><Icon size={20} /></div>
                <div>
                  <span>{branch.linkedActivities}</span>
                  <h3>{branch.title}</h3>
                </div>
                <strong>{points.toLocaleString()} XP</strong>
              </header>
              <p>{branch.description}</p>
              <ol className="skill-tree-nodes">
                {nodes.map((node, index) => {
                  const rank = skillLevels[node.id];
                  const reason = getSkillUnlockReason(
                    node,
                    skillLevels,
                    skillPoints,
                    level,
                    points,
                  );
                  const previousThreshold = index === 0 ? 0 : nodes[index - 1].requiredBranchXP;
                  const progress = points >= node.requiredBranchXP
                    ? 100
                    : Math.min(100, Math.max(
                      0,
                      ((points - previousThreshold)
                        / Math.max(1, node.requiredBranchXP - previousThreshold)) * 100,
                    ));
                  return (
                    <li className={rank > 0 ? "unlocked" : ""} key={node.id}>
                      <motion.span
                        className="skill-node-marker"
                        animate={rank > 0 ? { scale: [1, 1.08, 1] } : undefined}
                        transition={{ duration: 0.35 }}
                      >
                        {rank > 0 ? <Sparkles size={13} /> : String(index + 1).padStart(2, "0")}
                      </motion.span>
                      <div className="skill-node-content">
                        <div className="skill-node-heading">
                          <strong>{node.name}</strong>
                          <span>{rank > 0 ? `RANK ${rank}/${node.maxLevel}` : "LOCKED"}</span>
                        </div>
                        <p>{node.description}</p>
                        <small>{node.effect}</small>
                        <div
                          className="skill-node-track"
                          role="progressbar"
                          aria-label={`${node.name} branch requirement`}
                          aria-valuemin={0}
                          aria-valuemax={node.requiredBranchXP || 1}
                          aria-valuenow={Math.min(points, node.requiredBranchXP)}
                        >
                          <span style={{ width: `${progress}%` }} />
                        </div>
                        <div className="skill-node-requirements">
                          <span>LV. {node.requiredLevel}</span>
                          <span>{node.requiredBranchXP} BRANCH XP</span>
                          <span>{rank >= node.maxLevel ? "MAXED" : `${rank + 1} SP`}</span>
                        </div>
                        <motion.button
                          type="button"
                          className="skill-unlock-button"
                          whileHover={reason ? undefined : { scale: 1.02 }}
                          whileTap={reason ? undefined : { scale: 0.98 }}
                          disabled={Boolean(reason)}
                          aria-label={rank > 0
                            ? `Upgrade ${node.name} to rank ${rank + 1}`
                            : `Unlock ${node.name}`}
                          onClick={() => onUnlock(node.id)}
                        >
                          {reason ? reason : rank ? "UPGRADE SKILL" : "UNLOCK SKILL"}
                        </motion.button>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </article>
          );
        })}
      </div>
    </section>
  );
}
