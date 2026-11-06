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
- `src/game/progression.ts` contains idempotent quest/focus rewards and level progress calculations.
- `src/game/analytics.ts` derives week-to-date performance from recorded activity and focus sessions.

Quest rewards are recorded by cadence period: daily quests refresh on the local calendar day, weekly quests on Monday, and one-time quests remain claimed. Focus sessions are rewarded once per session ID and the most recent 500 completions are retained locally.

Quest and focus rewards build BODY, MIND, or WILL skill XP. Skill-tree milestones unlock automatically at their displayed XP thresholds without spending XP. Boss quests track multiple objectives and pay once on the final step. Custom categories are saved locally. Daily streaks count distinct active local dates; weekly streaks count consecutive weeks with activity. One recovery charge is earned for every seven active days and can restore one missed day when the gap is exactly one day. Weekly analytics compare the current week-to-date with the same elapsed days in the prior week and use recorded data only.

AI quest generation and cloud synchronization are intentionally not enabled: this build has no configured server-side AI provider or authenticated cloud-save backend. Browser local storage remains the only persistence provider.
