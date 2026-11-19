# HealthMate

HealthMate is an offline-first mobile app for tracking daily health activity: **steps**, **calories burned** and **water intake**. Users log daily records, browse and filter their history, and track progress against personal daily goals on a dashboard. All data is stored locally on the device in SQLite, so no account or network connection is needed.

Built with Expo (React Native) and TypeScript for Android and iOS.

---

## Table of contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [Getting started](#getting-started)
- [Available scripts](#available-scripts)
- [Project structure](#project-structure)
- [Architecture](#architecture)
- [Data model](#data-model)
- [Validation rules](#validation-rules)
- [Testing](#testing)
- [Code quality and Git workflow](#code-quality-and-git-workflow)
- [Troubleshooting](#troubleshooting)
- [License](#license)

---

## Features

### Dashboard

- Today's totals for steps, calories and water
- Progress towards each daily goal
- Bar chart of the last 7 days (days with no records show as zero)

### Records

- Add, edit and delete health records
- Records grouped by period (for example Today, This week, earlier weeks)
- Date filters: All, Today, Last 7 days, Last 30 days, or a custom range
- Swipe to delete, with a confirmation dialog and an **Undo** option
- Pull to refresh
- Empty states when there are no records or no matches for a filter

### Settings

- Set daily goals for steps, calories and water
- Choose a theme: **System**, **Light** or **Dark**
- Settings are saved to the device and restored on launch

### Other

- Sample data: a fresh install is filled with 21 days of random records, so the dashboard and list have something to show straight away
- Material Design 3 look with light and dark themes
- Form validation with clear, field-level error messages

---

## Tech stack

| Area             | Technology                                                                  |
| ---------------- | --------------------------------------------------------------------------- |
| Framework        | [Expo](https://expo.dev) SDK 58, React Native 0.88, React 19                |
| Language         | TypeScript                                                                  |
| Navigation       | [Expo Router](https://docs.expo.dev/router/introduction/) (file-based, typed routes) |
| Local database   | [expo-sqlite](https://docs.expo.dev/versions/latest/sdk/sqlite/)            |
| State management | [Zustand](https://zustand.docs.pmnd.rs/) (app settings)                     |
| UI components    | [React Native Paper](https://callstack.github.io/react-native-paper/) (Material Design 3) |
| Forms            | [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)   |
| Charts           | [react-native-gifted-charts](https://github.com/Abhinandan-Kushwaha/react-native-gifted-charts) |
| Dates            | [date-fns](https://date-fns.org/), `@react-native-community/datetimepicker` |
| Gestures         | react-native-gesture-handler, react-native-reanimated                       |
| Testing          | Jest (`jest-expo`), React Native Testing Library                            |
| Tooling          | ESLint, Husky, commitlint, pnpm                                             |

---

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org/) **22.13 or newer** (the tests use Node's built-in SQLite)
- [pnpm](https://pnpm.io/) **10** (the repo pins `pnpm@10.28.0` through the `packageManager` field; run `corepack enable` to use it automatically)
- One of:
  - [Android Studio](https://developer.android.com/studio) with an Android emulator
  - Xcode with an iOS simulator (macOS only)
  - A physical device

### Installation

```bash
git clone <repository-url>
cd healthmate-mobile
pnpm install
```

> The repo's `.npmrc` sets `node-linker=hoisted`, which React Native needs to resolve native modules.

### Running the app

Start the development server:

```bash
pnpm start
```

Then press `a` for Android or `i` for iOS in the terminal, or scan the QR code with a device.

To build and run a native development build:

```bash
pnpm android   # Android
pnpm ios       # iOS (macOS only)
```

---

## Available scripts

| Command           | Description                                          |
| ----------------- | ---------------------------------------------------- |
| `pnpm start`      | Start the Expo development server                    |
| `pnpm android`    | Build and run the app on Android                     |
| `pnpm ios`        | Build and run the app on iOS                         |
| `pnpm web`        | Start the app in a web browser                       |
| `pnpm test`       | Run the test suite                                   |
| `pnpm test:watch` | Run tests in watch mode                              |
| `pnpm typecheck`  | Type-check the project with TypeScript               |
| `pnpm lint`       | Lint the code with ESLint                            |

---

## Project structure

```text
healthmate-mobile/
├── app.json                 # Expo app configuration
├── assets/                  # App icons and splash images
├── src/
│   ├── app/                 # Screens (Expo Router, file-based routing)
│   │   ├── _layout.tsx      # Root layout: database, theme and navigation providers
│   │   ├── (tabs)/
│   │   │   ├── _layout.tsx  # Bottom tab navigator
│   │   │   ├── index.tsx    # Dashboard
│   │   │   ├── records.tsx  # Records list
│   │   │   └── settings.tsx # Settings
│   │   └── record/
│   │       └── [id].tsx     # Add / edit record (modal)
│   ├── components/          # Reusable UI components (forms, rows, chart, dialogs)
│   ├── db/                  # SQLite schema, queries and sample data
│   ├── hooks/               # Screen view models (useDashboard, useRecords, useRecordEditor)
│   ├── store/               # Zustand store for settings
│   ├── theme/               # Light and dark Material 3 themes
│   ├── utils/               # Date helpers, filtering and grouping
│   ├── test/                # Test helpers (in-memory SQLite database)
│   ├── types.ts             # Shared TypeScript types and default settings
│   └── validation.ts        # Zod schemas for the forms
├── jest.setup.ts            # Jest setup
├── commitlint.config.mjs    # Commit message rules
└── eslint.config.js         # ESLint configuration
```

Tests live next to the code they test, in `__tests__` folders.

---

## Architecture

The app follows a simple layered structure:

```text
Screens (src/app)  →  Hooks / Store  →  Database functions (src/db)  →  SQLite
```

- **Screens** only handle layout and user interaction.
- **Hooks** act as view models for each screen. They load data, hold screen state (loading, errors, filters, undo) and expose actions. Examples: `useDashboard`, `useRecords`, `useRecordEditor`.
- **Zustand store** (`settings-store.ts`) holds app-wide settings (goals and theme), so any screen can read them and changes appear immediately.
- **Database functions** (`src/db`) contain all SQL. They take the database as a parameter, which keeps them easy to test.

### App start-up

1. `SQLiteProvider` opens `healthmate.db` and runs `initDatabase`, which creates the tables and seeds sample data on first launch.
2. The settings store loads the saved goals and theme.
3. The app renders with the chosen theme. **System** follows the phone's dark mode setting.

---

## Data model

The database (`healthmate.db`) has two tables.

### `health_records`

| Column     | Type    | Notes                                   |
| ---------- | ------- | --------------------------------------- |
| `id`       | INTEGER | Primary key, auto-increment             |
| `date`     | TEXT    | `YYYY-MM-DD`, indexed                   |
| `steps`    | INTEGER | Steps taken, `>= 0`                     |
| `calories` | INTEGER | Calories burned (kcal), `>= 0`          |
| `water`    | INTEGER | Water intake (ml), `>= 0`               |

A day can have more than one record. The dashboard adds them together into daily totals.

### `settings`

A key-value table for user preferences.

| Key             | Default  |
| --------------- | -------- |
| `goal.steps`    | `10000`  |
| `goal.calories` | `500`    |
| `goal.water`    | `2000`   |
| `theme`         | `system` |

---

## Validation rules

Forms are validated with Zod (`src/validation.ts`) before anything is saved.

| Field    | Record form                             | Goals form                |
| -------- | --------------------------------------- | ------------------------- |
| Date     | Required, valid date, not in the future | —                         |
| Steps    | Whole number, 0–100,000                 | Whole number, 1–100,000   |
| Calories | Whole number, 0–10,000                  | Whole number, 1–10,000    |
| Water    | Whole number, 0–20,000 ml               | Whole number, 1–20,000 ml |

The database also has `CHECK` constraints as a second line of defence.

---

## Testing

Run the tests with:

```bash
pnpm test
```

The tests cover:

- **Validation:** form schemas and error messages
- **Database:** record and settings queries
- **Hooks:** the records view model
- **Components:** record form, confirm dialog and metric card

Database tests run the app's real SQL against an in-memory database built on Node's built-in `node:sqlite` module (see `src/test/test-db.ts`). This is why Node 22.13 or newer is required.

---

## Code quality and Git workflow

- **TypeScript** in strict mode, checked with `pnpm typecheck`
- **ESLint** with the Expo config, run with `pnpm lint`
- **Husky** Git hooks:
  - `pre-commit` runs the type check and the tests
  - `commit-msg` checks the commit message with commitlint

### Commit messages

Commits follow [Conventional Commits](https://www.conventionalcommits.org/):

```text
<type>(<scope>): <description>
```

Example: `feat(records): add date range filter`

Suggested scopes: `db`, `records`, `dashboard`, `settings`, `ui`, `theme`, `deps`, `config`, `release`.

---

## Troubleshooting

| Problem | Fix |
| ------- | --- |
| Tests fail with an error about `node:sqlite` | Upgrade to Node.js 22.13 or newer |
| Native module errors after installing packages | Delete `node_modules`, run `pnpm install`, then rebuild with `pnpm android` or `pnpm ios` |
| Stale data or odd Metro behaviour | Restart with a clear cache: `pnpm start --clear` |
| Want to reset the app data | Uninstall the app from the device or emulator; sample data is added again on the next launch |

---

## License

See [LICENSE](LICENSE).
