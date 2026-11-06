import { Brain, Shield, Sparkles, Zap } from "lucide-react";
import type { SkillBranch, SkillXP } from "../types/game";

type SkillsPageProps = {
  level: number;
  skillXP: SkillXP;
};

const trees: {
  branch: SkillBranch;
  title: string;
  description: string;
  icon: typeof Shield;
  linkedStats: string;
  nodes: { name: string; description: string; threshold: number }[];
}[] = [
  {
    branch: "BODY",
    title: "IRON BODY",
    description: "Physical objectives feed this progression path.",
    icon: Shield,
    linkedStats: "STRENGTH",
    nodes: [
      { name: "CONDITIONING I", description: "First body-path milestone.", threshold: 100 },
      { name: "HUNTER'S FRAME", description: "Sustained physical progression.", threshold: 500 },
      { name: "AWAKENED VITALITY", description: "Advanced body-path milestone.", threshold: 1500 },
    ],
  },
  {
    branch: "MIND",
    title: "FOCUS ENGINE",
    description: "Study, intelligence, focus, and completed focus sessions advance this path.",
    icon: Brain,
    linkedStats: "INTELLIGENCE · FOCUS",
    nodes: [
      { name: "CLEAR THOUGHT", description: "First mind-path milestone.", threshold: 100 },
      { name: "DEEP SYNCHRONY", description: "Sustained focused progression.", threshold: 500 },
      { name: "GATE ANALYST", description: "Advanced mind-path milestone.", threshold: 1500 },
    ],
  },
  {
    branch: "WILL",
    title: "UNBROKEN WILL",
    description: "Discipline and consistency objectives advance this path.",
    icon: Zap,
    linkedStats: "DISCIPLINE · CONSISTENCY",
    nodes: [
      { name: "FIRST RESOLVE", description: "First will-path milestone.", threshold: 100 },
      { name: "STEADY PULSE", description: "Sustained consistency progression.", threshold: 500 },
      { name: "MONARCH'S GRIT", description: "Advanced will-path milestone.", threshold: 1500 },
    ],
  },
];

export default function SkillsPage({ level, skillXP }: SkillsPageProps) {
  const unlockedNodes = trees.reduce(
    (total, tree) => total + tree.nodes.filter((node) => skillXP[tree.branch] >= node.threshold).length,
    0,
  );
  const totalNodes = trees.reduce((total, tree) => total + tree.nodes.length, 0);

  return (
    <section className="skills-page panel">
      <div className="panel-corner" />
      <div className="quest-heading">
        <div>
          <span className="system-label">SYSTEM / SKILL TREES · HUNTER LV. {level}</span>
          <h2>SKILL PROGRESSION</h2>
        </div>
        <span>{unlockedNodes}/{totalNodes} NODES</span>
      </div>
      <p className="skill-tree-intro">
        Quest rewards advance the branch linked to their target attribute. Focus-session rewards advance Mind.
        Nodes unlock automatically at their displayed XP thresholds; no XP is spent. Branch XP starts tracking
        after this progression update because older saves stored only total XP, not per-skill rewards.
      </p>

      <div className="skill-trees-grid">
        {trees.map((tree) => {
          const Icon = tree.icon;
          const points = skillXP[tree.branch];
          return (
            <article className="skill-tree" key={tree.branch}>
              <header className="skill-tree-header">
                <div className="skill-tree-icon"><Icon size={20} /></div>
                <div>
                  <span>{tree.branch} PATH · {tree.linkedStats}</span>
                  <h3>{tree.title}</h3>
                </div>
                <strong>{points.toLocaleString()} XP</strong>
              </header>
              <p>{tree.description}</p>
              <ol className="skill-tree-nodes">
                {tree.nodes.map((node, index) => {
                  const unlocked = points >= node.threshold;
                  const previousThreshold = index === 0 ? 0 : tree.nodes[index - 1].threshold;
                  const progress = unlocked
                    ? 100
                    : Math.min(100, Math.max(
                      0,
                      ((points - previousThreshold) / (node.threshold - previousThreshold)) * 100,
                    ));
                  return (
                    <li className={unlocked ? "unlocked" : ""} key={node.name}>
                      <span className="skill-node-marker">
                        {unlocked ? <Sparkles size={13} /> : String(index + 1).padStart(2, "0")}
                      </span>
                      <div className="skill-node-content">
                        <div className="skill-node-heading">
                          <strong>{node.name}</strong>
                          <span>{unlocked ? "REGISTERED" : `${node.threshold} XP`}</span>
                        </div>
                        <p>{node.description}</p>
                        <div
                          className="skill-node-track"
                          role="progressbar"
                          aria-label={`${node.name} progress`}
                          aria-valuemin={0}
                          aria-valuemax={node.threshold - previousThreshold}
                          aria-valuenow={unlocked
                            ? node.threshold - previousThreshold
                            : Math.max(0, points - previousThreshold)}
                        >
                          <span style={{ width: `${progress}%` }} />
                        </div>
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
