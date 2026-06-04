# Expo Boilerplate Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first Expo React Native boilerplate for MeerQuest with route shells, theme, mascot component, quest progression utilities, and basic verification.

**Architecture:** Use Expo Router at the app root with stack routes for the splash/profile/home flow, quest map, quest play, reward, and guardian dashboard. Keep reusable UI in `src/components`, static product data in `src/content`, and pure quest progression logic in `src/features/quests` so it can be tested without React Native runtime.

**Tech Stack:** Expo SDK 56, React 19, React Native 0.85, TypeScript, Expo Router, Vitest for pure TypeScript domain tests.

---

### Task 1: Scaffold Expo App

**Files:**
- Create: `package.json`
- Create: `app.json`
- Create: `tsconfig.json`
- Create: `.gitignore`
- Create: `assets/images/*`
- Create: `assets/fonts/SpaceMono-Regular.ttf`

- [ ] **Step 1: Generate Expo Router scaffold**

Run: `npx create-expo-app@latest /tmp/meerquest-scaffold --template tabs --no-install --no-agents-md`

Expected: template files are created in `/tmp/meerquest-scaffold`.

- [ ] **Step 2: Copy scaffold into repo**

Copy generated Expo files into the repo root, excluding `.git`, `README.md`, and `LICENSE`.

- [ ] **Step 3: Customize app metadata**

Set `package.json` name to `meerquest`, app name to `MeerQuest`, slug/scheme to `meerquest`, `ios.supportsTablet` to true, and splash background to a warm MeerQuest color.

### Task 2: Add Domain Test First

**Files:**
- Create: `src/features/quests/questProgress.test.ts`
- Create: `src/features/quests/questProgress.ts`

- [ ] **Step 1: Write failing tests**

Create tests for:
- first quest in a category is unlocked by default
- completing a quest unlocks the next quest
- highest completed level is calculated from progress
- repeated attempts create a review recommendation

- [ ] **Step 2: Run tests and verify red**

Run: `npm test -- src/features/quests/questProgress.test.ts`

Expected: tests fail because `questProgress.ts` exports are not implemented.

- [ ] **Step 3: Implement minimal quest progression utilities**

Implement:
- `getUnlockedQuests`
- `getNextQuest`
- `getHighestCompletedLevel`
- `getReviewRecommendation`

- [ ] **Step 4: Run tests and verify green**

Run: `npm test -- src/features/quests/questProgress.test.ts`

Expected: all quest progression tests pass.

### Task 3: Add MeerQuest UI Boilerplate

**Files:**
- Create: `src/theme/colors.ts`
- Create: `src/content/categories.ts`
- Create: `src/content/quests.ts`
- Create: `src/components/MeerkatMascot.tsx`
- Create: `src/components/QuestCategoryCard.tsx`
- Modify: `app/_layout.tsx`
- Modify: `app/index.tsx`
- Create: `app/quest-map.tsx`
- Create: `app/quest-play.tsx`
- Create: `app/reward.tsx`
- Create: `app/guardian.tsx`
- Create: `app/+not-found.tsx`

- [ ] **Step 1: Add theme and content fixtures**

Create warm, child-friendly color tokens and initial math/language/social/safety category data.

- [ ] **Step 2: Add mascot component**

Create a lightweight React Native meerkat mascot component with visual states for greeting, hint, thinking, clap, and celebrate.

- [ ] **Step 3: Replace template screens**

Replace template tab screens with MeerQuest route shells for home, quest map, quest play, reward, and guardian dashboard.

- [ ] **Step 4: Verify TypeScript**

Run: `npm run typecheck`

Expected: TypeScript exits with code 0.

### Task 4: Install and Verify

**Files:**
- Create: `package-lock.json`
- Modify: `package.json`

- [ ] **Step 1: Install dependencies**

Run: `npm install`

Expected: dependencies install and `package-lock.json` is created.

- [ ] **Step 2: Run full verification**

Run: `npm test`

Expected: Vitest exits with all tests passing.

Run: `npm run typecheck`

Expected: TypeScript exits with code 0.

Run: `npx expo export --platform web`

Expected: Expo exports a web bundle without build errors.

### Task 5: Commit

**Files:**
- Stage all boilerplate files.

- [ ] **Step 1: Check staged diff**

Run: `git diff --cached --check`

Expected: no output.

- [ ] **Step 2: Commit**

Run: `git commit -m "feat: Expo 앱 보일러플레이트 구성"`

Expected: commit is created on `develop/v0.0.1`.
