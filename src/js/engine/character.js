/**
 * AWAKEN Character & Hunter Domain Engine
 * Pure Vanilla JavaScript ES6 Module
 */

export const AVATAR_PRESETS = [
  {
    id: "avatar_shadow",
    name: "SHADOW MONARCH",
    subtitle: "Ruler of the Monarch Realm",
    theme: "#818cf8",
    accent: "rgba(129, 140, 248, 0.4)",
    symbol: "👑",
    svgIcon: `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
        <path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14v2H5z"/>
      </svg>
    `,
  },
  {
    id: "avatar_vanguard",
    name: "AZURE BLADE",
    subtitle: "Unbroken Frontline Vanguard",
    theme: "#38bdf8",
    accent: "rgba(56, 189, 248, 0.4)",
    symbol: "⚔️",
    svgIcon: `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
        <polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5"/>
        <line x1="13" x2="19" y1="19" y2="13"/>
        <line x1="16" x2="20" y1="16" y2="20"/>
        <line x1="19" x2="21" y1="21" y2="19"/>
      </svg>
    `,
  },
  {
    id: "avatar_phantom",
    name: "VEILWALKER",
    subtitle: "Silent Temporal Infiltrator",
    theme: "#c084fc",
    accent: "rgba(192, 132, 252, 0.4)",
    symbol: "👁️",
    svgIcon: `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
        <circle cx="12" cy="12" r="3"/>
        <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z"/>
      </svg>
    `,
  },
  {
    id: "avatar_scholar",
    name: "ASTRAL ARCHIVIST",
    subtitle: "Seeker of System Lore",
    theme: "#34d399",
    accent: "rgba(52, 211, 153, 0.4)",
    symbol: "📜",
    svgIcon: `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
        <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/>
        <path d="M6 6h10"/>
        <path d="M6 10h10"/>
      </svg>
    `,
  },
  {
    id: "avatar_architect",
    name: "RIFT FORGER",
    subtitle: "Creator of Structures & Worlds",
    theme: "#fbbf24",
    accent: "rgba(251, 191, 36, 0.4)",
    symbol: "🔮",
    svgIcon: `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
        <polygon points="12 2 2 7 12 12 22 7 12 2"/>
        <polyline points="2 17 12 22 22 17"/>
        <polyline points="2 12 12 17 22 12"/>
      </svg>
    `,
  },
];

export const HUNTER_CLASSES = [
  {
    id: "VANGUARD",
    name: "Vanguard",
    role: "Frontline Combatant",
    description: "Built for physical resilience, discipline, and relentless physical conditioning.",
    primaryAttribute: "strength",
    linkedAttributes: "STRENGTH · VITALITY",
    passive: "+15% XP from Fitness & Physical missions.",
    specializations: [
      { id: "WARDEN", name: "Warden", desc: "Defensive bastion with maximum vitality." },
      { id: "STRIKER", name: "Striker", desc: "High-impact offensive prowess." },
    ],
    evolution: [
      { level: 3, title: "Iron Vanguard" },
      { level: 10, title: "Aegis Vanguard" },
      { level: 20, title: "Unbroken Vanguard" },
      { level: 30, title: "Immortal Colossus" },
    ],
  },
  {
    id: "TACTICIAN",
    name: "Tactician",
    role: "Strategic Analyst",
    description: "Transforms intense study, research, and analysis into calculated mastery.",
    primaryAttribute: "intelligence",
    linkedAttributes: "INTELLIGENCE · FOCUS",
    passive: "+15% XP from Study, Research & Knowledge missions.",
    specializations: [
      { id: "SEER", name: "Seer", desc: "Long-range forecasting and analytical foresight." },
      { id: "ARCHIVIST", name: "Archivist", desc: "Master of records and systematic memory." },
    ],
    evolution: [
      { level: 3, title: "Field Analyst" },
      { level: 10, title: "Gate Savant" },
      { level: 20, title: "Grand Strategist" },
      { level: 30, title: "Omniscient Mind" },
    ],
  },
  {
    id: "ARTISAN",
    name: "Artisan",
    role: "Creative World-Shaper",
    description: "Channels imaginative thinking into tangible code, architecture, and projects.",
    primaryAttribute: "creativity",
    linkedAttributes: "CREATIVITY · DISCIPLINE",
    passive: "+15% XP from Creative, Art & Engineering projects.",
    specializations: [
      { id: "FORGEMIND", name: "Forgemind", desc: "Constructs complex creative systems." },
      { id: "ILLUSIONIST", name: "Illusionist", desc: "Weaves intricate aesthetic experiences." },
    ],
    evolution: [
      { level: 3, title: "Patternwright" },
      { level: 10, title: "Rift Architect" },
      { level: 20, title: "World Shaper" },
      { level: 30, title: "Genesis Creator" },
    ],
  },
  {
    id: "SHADOW_HUNTER",
    name: "Shadow Hunter",
    role: "Technical Specialist",
    description: "Masters deliberate practice in coding, cybersecurity, and deep systems.",
    primaryAttribute: "focus",
    linkedAttributes: "FOCUS · CONSISTENCY",
    passive: "+15% XP from Coding, Software & Technical milestones.",
    specializations: [
      { id: "NIGHTSTALKER", name: "Nightstalker", desc: "Rapid stealth execution." },
      { id: "BREAKER", name: "Breaker", desc: "Dismantles complex technical barriers." },
    ],
    evolution: [
      { level: 3, title: "Signal Reader" },
      { level: 10, title: "Night Operator" },
      { level: 20, title: "Shadow Savant" },
      { level: 30, title: "Shadow Monarch" },
    ],
  },
  {
    id: "PHANTOM",
    name: "Phantom",
    role: "Discipline & Timekeeper",
    description: "Harnesses unwavering focus and ritualistic daily habits to transcend limits.",
    primaryAttribute: "discipline",
    linkedAttributes: "DISCIPLINE · CONSISTENCY",
    passive: "+15% XP from Focus timers & Consistency habits.",
    specializations: [
      { id: "VEILWALKER", name: "Veilwalker", desc: "Seamless flow state immersion." },
      { id: "TIMEKEEPER", name: "Timekeeper", desc: "Unflinching punctuality and execution." },
    ],
    evolution: [
      { level: 3, title: "Quiet Step" },
      { level: 10, title: "Stillpoint" },
      { level: 20, title: "Time Phantom" },
      { level: 30, title: "Temporal Sovereign" },
    ],
  },
];

export const TITLES_CATALOG = [
  {
    id: "NEWLY AWAKENED",
    name: "NEWLY AWAKENED",
    description: "Bestowed upon individuals who have crossed the threshold into the System.",
    requiredRank: "F",
    requiredLevel: 1,
    passiveBonus: "Base Awakening bonus",
  },
  {
    id: "IRON WILL",
    name: "IRON WILL",
    description: "Awarded to hunters maintaining an unbroken 3-day active streak.",
    requiredRank: "E",
    requiredLevel: 2,
    passiveBonus: "+1 Vitality",
  },
  {
    id: "RELIABLE HUNTER",
    name: "RELIABLE HUNTER",
    description: "Awarded for clearing at least 5 classified contracts.",
    requiredRank: "D",
    requiredLevel: 5,
    passiveBonus: "+1 Discipline",
  },
  {
    id: "GATE BREAKER",
    name: "GATE BREAKER",
    description: "Assigned upon conquering a high-threat Boss objective.",
    requiredRank: "C",
    requiredLevel: 10,
    passiveBonus: "+2 Strength",
  },
  {
    id: "GRAND STRATEGIST",
    name: "GRAND STRATEGIST",
    description: "Unlocked by achieving Rank B status through extensive knowledge.",
    requiredRank: "B",
    requiredLevel: 15,
    passiveBonus: "+2 Intelligence",
  },
  {
    id: "SHADOW MONARCH",
    name: "SHADOW MONARCH",
    description: "Supreme rank title reserved for hunters ascending to the absolute pinnacle.",
    requiredRank: "S",
    requiredLevel: 30,
    passiveBonus: "+3 All Attributes",
  },
];

export const APTITUDE_ASSESSMENT = [
  {
    id: "q1",
    question: "A catastrophic dimensional rift tears open before you. What is your immediate instinct?",
    options: [
      { text: "Charge the breach directly to anchor the perimeter.", classAffinity: "VANGUARD" },
      { text: "Analyze the rift's energy wavelength and formulate a containment strategy.", classAffinity: "TACTICIAN" },
      { text: "Slip into the blind spots to map enemy weaknesses.", classAffinity: "SHADOW_HUNTER" },
      { text: "Construct defensive barriers and craft specialized counter-tools.", classAffinity: "ARTISAN" },
    ],
  },
  {
    id: "q2",
    question: "What form of personal growth drives you most powerfully?",
    options: [
      { text: "Raw physical strength, endurance, and bodily resilience.", classAffinity: "VANGUARD" },
      { text: "Deep intellectual comprehension and analytical mastery.", classAffinity: "TACTICIAN" },
      { text: "Technical engineering, coding, and solving complex problems.", classAffinity: "SHADOW_HUNTER" },
      { text: "Unbreakable focus, quiet discipline, and daily consistency.", classAffinity: "PHANTOM" },
    ],
  },
];

