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
```

## Architecture

- `src/App.tsx` owns the application shell, boot sequence, clock, and screen composition.
- `src/hooks/useAwakenGame.ts` owns progression state, quest actions, notifications, and local-storage persistence.
- `src/game/gameData.ts` contains the built-in quests and shared progression rules.
- `src/types/game.ts` defines the shared game-domain types.
- `src/components/` contains the navigation shell and focused screen components.
- `src/index.css` defines the responsive command-center interface and visual system.
