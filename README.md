# AWAKEN

AWAKEN is a Solo Leveling-inspired hunter progression app. Complete daily or custom quests, earn XP, grow attributes, run focus sessions, and track milestones. Progress is stored in the browser's local storage.

## Run locally

```sh
npm install
npm run dev
```

## Validate

```sh
npm run build
npm run lint
npm test
```

## Architecture

- `src/App.tsx` owns the application shell, boot sequence, clock, and screen composition.
- `src/hooks/useAwakenGame.ts` owns progression state, quest actions, notifications, and local-storage persistence.
- `src/game/gameData.ts` contains the built-in quests and shared progression rules.
- `src/types/game.ts` defines the shared game-domain types.
- `src/components/` contains the navigation shell and focused screen components.
- `src/index.css` defines the responsive command-center interface and visual system.
- `src/game/storage.ts` validates versioned local saves and recovers legacy browser data.
- `src/game/progression.ts` contains idempotent quest/focus rewards, level rewards, class/skill/equipment XP bonuses, and level progress calculations.
- `src/game/character.ts` defines hunter classes, progression classes, specializations, class passives/evolutions, profile helpers, and earned title rules.
- `src/game/skills.ts` defines the five connected skill branches, rank requirements, point costs, and skill reward modifiers.
- `src/game/inventory.ts` defines the item catalog, validated gold purchases, ownership, equipment effects, and consumable transactions.
- `src/game/achievements.ts` derives achievement unlocks from recorded hunter level and quest completions.
- `src/game/analytics.ts` derives week-to-date performance from recorded activity and focus sessions.

The interface is contained within the browser viewport, with desktop side navigation and a compact mobile navigation bar. Detail-heavy screens use tabs and contextual panels; scrolling is limited to content lists and charts inside their own panels. Reduced-motion preferences are respected.

Character name, class, specialization, attributes, and progression are stored locally. Strength, intelligence, vitality, discipline, creativity, focus, and consistency increase only through quests targeting those attributes. Hunter titles are derived from recorded quest and level milestones.

Quest rewards are recorded by cadence period: daily quests refresh on the local calendar day, weekly quests on Monday, and one-time quests remain claimed. Focus sessions are rewarded once per session ID and the most recent 500 completions are retained locally.

Quest and focus rewards build BODY, MIND, and WILL legacy skill XP alongside branch XP for Warrior, Scholar, Shadow Hunter, Architect, and Phantom. Hunters receive one skill point per level gained; node ranks require the configured hunter level, branch XP, prerequisites, and skill points. Skill ranks increase XP from matching real-world activity. The selected class adds a matching activity bonus, class XP, and class evolutions while preserving existing progression when changed.

Quest and focus rewards grant gold once alongside XP. The inventory stores owned equipment, consumables, and collectibles; equipment modifies displayed attributes and matching activity rewards, and consumables apply their configured progression effect once. Purchases validate balance, hunter level, unique ownership, and transaction IDs. Equipment slots can be changed or cleared, and purchase/use transactions are retained in the local save.

Save format version 4 migrates version 1, 2, and 3 progress without discarding existing XP, attributes, profile, quest records, focus history, or categories. Existing hunters receive one skill point per already-earned level beyond level 1; newly introduced gold, inventory, and class-branch progression start with safe defaults.

Mission acceptance, dungeons, and story chapters remain outside this phase. AI quest generation and cloud synchronization are intentionally not enabled: this build has no configured server-side AI provider or authenticated cloud-save backend. Browser local storage remains the only persistence provider.
