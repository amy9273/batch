# Sole Surgeon — Production Control System (PCS) PWA

A mobile-first Progressive Web App (PWA) built for **Sole Surgeon's Production Control System (PCS)**, allowing workshop restoration technicians to view assigned batches, start batches, and complete tasks in real time with live Airtable database integration.

---

## Environment & Tech Stack

* **Node.js Version:** `v24.11.1` (compatible with Node.js 20+)
* **Package Manager:** `npm` (`11.6.2`)
* **Framework:** Next.js 16 (App Router, Turbopack, React 19, TypeScript 5)
* **Styling & UI:** Tailwind CSS v4, Lucide Icons (`lucide-react`)
* **Design Standards:** Follows `anthropics/skills@frontend-design` for workshop-grounded craftsmanship, intentional typography, high-contrast readability, and non-templated UI.
* **Database:** Airtable REST API (Tables: `Batches`, `Tasks`, `Items`)
* **PWA:** Web App Manifest (`manifest.json`), Service Worker (`sw.js`), 192x192 & 512x512 app icons, Chrome installable window mode.
* **Testing:** Node.js native test runner via `tsx --test` (mock data only, 0 live Airtable mutations during tests).
* **Software Architecture:** Object-Oriented Service Layer (SOLID principles, Dependency Inversion, Domain Error hierarchy, pure Rule Engine validators, and custom React hooks eliminating component bloat).

---

## Quick Start & Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Ensure your `.env.local` contains:
```env
# Airtable Connection
AIRTABLE_API_KEY=patYourPersonalAccessToken
AIRTABLE_BASE_ID=appYourBaseId

# Defaults for Sole Surgeon PCS
DEFAULT_WORKER=Ana
DEFAULT_BUSINESS_DATE=2026-10-22
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in Google Chrome.

### 4. Run Automated Tests
```bash
npm test
```

### 5. Production Build
```bash
npm run build
npm start
```

---

## Core Features & Workflow

### 1. Batch List (`/`)
* Automatically queries and displays batches assigned to **Ana** for target date **October 22, 2026**.
* Displays batch name (e.g., `ANA-20261022-A`), total tasks, completed tasks, and started state badge.
* Includes dynamic progress indicators and high-level workshop metric summaries.
* Tap any batch card to inspect its tasks.

### 2. Batch Details (`/batch/[id]`)
* Displays all assigned tasks ordered sequentially by `Sequence` ascending.
* Resolves and highlights item names (e.g. `Puma Slipstream`, `Nike AM90`, `Coach Bag`) alongside the task operation (e.g. `Deep Cleaning`, `Repainting`, `Dismantling and Prep`).
* Displays each task's `Status` and Airtable-computed `Task State` (`LOCKED`, `READY / IN PROGRESS`, `DONE`).
* Quick filter controls (`All`, `Ready`, `Locked`, `Done`) for technicians on the shop floor.

### 3. Start a Batch
* Unstarted batches present a prominent **Start batch** action.
* Clicking **Start batch** saves the actual current system timestamp into `Started At` in Airtable.
* **Backend Invariant Check:** If a batch already has a `Started At` timestamp, the backend rejects the request with HTTP `400 Bad Request`. Buttons are also locked in the UI to prevent double-submissions.

### 4. Complete a Task
* Technicians can mark eligible tasks as **Done**.
* **Backend Invariant Check:** A task whose `Task State` is `LOCKED` is strictly blocked by the backend (returns HTTP `400 Bad Request`). In the UI, locked tasks are disabled with a lock icon.
* Upon Airtable confirmation, the app immediately re-fetches fresh computed rollup values (`Done Count`, unlocked `Task State` updates on subsequent dependent steps).

### 5. Progressive Web App (PWA)
* Configured with `public/manifest.json`, `public/sw.js`, and compliant icons.
* Desktop Chrome on `localhost` detects the manifest and displays the "Install app" icon in the URL bar, as well as via the integrated header button.
* Opens in its own standalone, distraction-free app window.
* Mobile viewport configuration ensures responsive, thumb-friendly tap targets (minimum 44x44px).

---

## Automated Tests (Mock Data)

The automated test suite runs via `npm test` (`tsx --test test/**/*.test.ts`) using isolated mock data:

1. **`test/backend-invariants.test.ts` (Rule Invariant Verification):**
   * Verifies that the backend blocks starting an already-started batch (returns `valid: false` with descriptive error).
   * Verifies that the backend permits starting an unstarted batch.
   * Verifies that the backend strictly blocks marking a task as `Done` when `Task State === 'LOCKED'`.
   * Verifies that the backend permits completing an unlocked task (`READY` or `IN PROGRESS`).

2. **`test/batch-calculations.test.ts` (Filtering & Calculation Logic):**
   * Verifies that batch filtering strictly isolates batches matching Worker `"Ana"` and Target Date `"2026-10-22"`, excluding other workers or dates.
   * Verifies calculation of total tasks, completed tasks, and completion percentage across partially and fully completed batches.

---

## Assumptions, Known Issues & Unfinished Features

### Assumptions
1. **Business Date vs. Start Timestamp:**
   * Business date (`2026-10-22`) is used exclusively for batch discovery and filtering.
   * `Started At` records the real-time system ISO timestamp when the technician taps "Start batch", preserving the actual execution time.
2. **Airtable Calculated Fields:**
   * `Task State` (`DONE`, `IN PROGRESS`, `LOCKED`, `READY`), `Done Count`, and `Item Level` are calculated fields managed entirely by Airtable formulas. The application never attempts to mutate calculated fields directly; it only writes `{ Status: 'Done' }` and allows Airtable to compute state transitions.
3. **Airtable Date Formula Formatting:**
   * Airtable date comparison formulas require `DATETIME_FORMAT({Target Date}, 'YYYY-MM-DD') = '2026-10-22'` to reliably evaluate date fields against ISO strings.
4. **Item Name & Workshop Care Notes:**
   * Descriptive items (e.g., `ITEM-008 Jordan 1 with worn contrasting panels...`) are cleanly separated into the item title (`Jordan 1`) and a distinct workshop `Care Note` with progressive disclosure to preserve vertical screen space on mobile devices.

### Known Issues & Unfinished Features
* **None.** All core requirements from the exam specification are fully implemented, verified, and passing:
  - Batch list with Ana's assigned batches on October 22, 2026.
  - Batch details with item name, task name, sequence, Status, and Task State.
  - Start batch with real-time timestamp and Rule 1 backend invariant enforcement.
  - Complete task with Rule 2 backend invariant enforcement.
  - Basic PWA installation with manifest, icons, and standalone app window mode.
  - 8/8 automated unit tests with mock data.
  - Mobile-responsive ergonomics with 44px+ touch targets.

---

## What Could Be Improved With More Time

1. **Optimistic UI Updates with Rollback:** Apply task state transitions and counter increments immediately in local state for zero-latency feedback, rolling back if the network or Airtable returns an error.
2. **IndexedDB Offline Mutation Queue:** Queue task completions and batch starts in IndexedDB when offline, automatically syncing via Background Sync API once connectivity is restored.
3. **Barcode / QR Tag Scanning:** Allow technicians to scan physical shoe or bag tags using the device camera to jump directly to an item's active task.
4. **Real-time Webhook Invalidation:** Implement Airtable webhook triggers or Server-Sent Events to refresh states across multiple workshop devices simultaneously without manual refresh.
5. **Multi-Technician Handoff:** Support multi-worker handoffs between specialized restoration stages (e.g., cleaner to stitcher to painter).

---

## AI Assistance Disclosure

AI tools (**Google Antigravity** with Anthropic's **`frontend-design`** skill) were utilized during the development of this project for:
- Architecture planning and domain modeling (Clean Architecture, OOP service layer, pure Rule Engine validators).
- Next.js 16 App Router route handlers, TypeScript interface definitions, and Airtable API cursor-based pagination.
- UI/UX implementation conforming to workshop ergonomics (dark teal palette, high-contrast badges, non-interactive completed states, 44px+ touch targets).
- Scaffolding the automated unit test suite with mock data (`test/backend-invariants.test.ts` and `test/batch-calculations.test.ts`).
- Debugging hydration edge-cases and CSS line-clamp progressive disclosure.
