# Pantry — Food Tracker: Project Roadmap

> **READ THIS FIRST.** Before working on any instruction, understand the full project vision and which milestone the current task falls under. Do not deviate from the established architecture or skip milestones.

---

## Project Vision

A web/mobile app that tracks a user's food, ingredients, and grocery inventory. The app displays what food the user has, the quantity, and the status (e.g. expiration). The ultimate goal is to power a **recipe recommending app** using the user's pantry data.

---

## Milestones

### Milestone 1 — Prototype (✅ Complete)

Basic CRUD app with add/edit/delete item functionality, migrated to Next.js.

**What was built:**
- Single-page app built with **Next.js 16.2.9 (App Router)** and React
- Add items via floating action button with form fields: name, category, storage location, quantity, unit, expiry date, notes
- Edit items by clicking a card or the edit button
- Delete items with confirmation dialog
- Search items by name or notes
- Filter by category (dynamically populated)
- Sort by name, expiry date, or recently added
- Stats bar (total items, unique categories, expiring-soon count)
- 12 food categories
- 4 storage locations (Fridge, Freezer, Pantry, Counter)
- Expiry badges with color coding (fresh/warning/expired)
- All data persisted to `localStorage`
- Responsive design with Inter font via Google Fonts
- Full component-based architecture

**Key files:**
- `src/app/page.js` — Main client component with app state
- `src/app/layout.js` — Root layout with Inter font and metadata
- `src/app/globals.css` — Design system and all styles
- `src/components/` — 7 React components (Header, StatsBar, Toolbar, ItemList, ItemCard, ItemFormModal, DeleteModal, Fab)
- `src/hooks/useItems.js` — Custom hook for CRUD and localStorage persistence
- `src/lib/constants.js` & `src/lib/utils.js` — Shared utilities

---

### Milestone 2 — Account Management + Data Layer (✅ Complete)

User accounts, persistent database, authenticated API, and frontend migration from localStorage to API.

**What was built:**
- **Database** — Prisma 7 ORM with SQLite (`better-sqlite3` adapter), schema for User and Item models, 2 migrations
- **Authentication** — NextAuth v5 (Beta) with Credentials provider, JWT sessions, login/register/forgot-password/reset-password pages
- **Route Protection** — Next.js 16 `proxy.js` convention (Node.js runtime) redirects unauthenticated users to `/auth/login`
- **API Routes** — Full CRUD for items with auth guard (`requireAuth`), strict validation on create, lenient on update
- **Frontend Migration** — `useItems` hook rewritten from localStorage to API `fetch` calls with optimistic updates and rollback
- **Header** — Displays user email and Sign Out button via `useSession()`
- **Error Handling** — Dismissible error banner on API failures
- **Legacy Cleanup** — localStorage data cleared on mount (no migration, test data only)
- **Integration Tests** — 44 tests across 5 suites (auth, unauthenticated access, CRUD, data isolation, validation), run via `npm test`

**Key files:**
- `prisma/schema.prisma` — User and Item models with relations and indexes
- `src/auth.js` — NextAuth config with Credentials provider, JWT callbacks
- `src/proxy.js` — Route protection (Next.js 16 proxy convention, replaces middleware)
- `src/app/api/items/route.js` — GET (list) and POST (create) endpoints
- `src/app/api/items/[id]/route.js` — GET (detail), PUT (update), DELETE endpoints
- `src/app/api/auth/register/route.js` — User registration with bcrypt hashing
- `src/app/api/auth/forgot-password/route.js` & `reset-password/route.js` — Password reset flow
- `src/lib/prisma.js` — Prisma client singleton (dev hot-reload safe)
- `src/lib/auth-guard.js` — `requireAuth()` helper for route handlers
- `src/lib/validation.js` — `validateItemData()` with strict/lenient modes
- `src/components/Providers.jsx` — `SessionProvider` wrapper
- `src/hooks/useItems.js` — API-backed CRUD hook with optimistic updates
- `src/app/auth/login/page.js`, `register/page.js`, `forgot-password/page.js`, `reset-password/page.js` — Auth pages
- `tests/test-integration.mjs` — 44 integration tests (auto-resets DB, starts/stops dev server)

---

### Milestone 3 — Smart Food Tracking & Expiration Warnings (🔄 Next)

The app should **automatically keep track** of food amounts and their status. It should understand each ingredient well (e.g. typical shelf life, storage best practices).

**Planned features:**
- Built-in ingredient knowledge base (typical shelf life by category/item, storage recommendations)
- Auto-suggest expiry dates when adding items based on ingredient type and storage location
- Active expiration monitoring — items approaching expiry or already expired should be gathered into a dedicated **"Expiring Soon / Expired"** section displayed prominently
- Visual warnings (color-coded badges, notifications) for items expiring within a configurable threshold (e.g. 3 days)
- Quantity tracking — the user should be able to decrement/use portions of an item without deleting it

---

### Milestone 4 — LLM Integration for Adding Items

Users can describe their items in natural language and let an integrated LLM parse and add them automatically.

**Planned features:**
- Text input field where users describe items conversationally (e.g. "I just bought 2 lbs of chicken breast and a gallon of milk from Costco")
- LLM parses the description into structured item data (name, category, quantity, unit, estimated expiry, storage recommendation)
- User reviews the parsed items before confirming the addition
- Support for batch additions from a single description

---

### Milestone 5 — Receipt Scanning

Users can take a photo of a grocery receipt and have items automatically extracted and added to their pantry.

**Planned features:**
- Camera/photo upload integration
- OCR or vision model to extract line items from receipt images
- Map extracted text to structured item data (name, quantity, price)
- Auto-categorize and suggest storage/expiry based on item recognition
- User reviews and confirms before adding

---

### Milestone 6 — Recipe Recommendation Integration

The pantry data feeds into a recipe recommendation system.

**Planned features:**
- Analyze current pantry inventory to suggest recipes the user can make now
- Highlight recipes that use soon-to-expire ingredients (reduce waste)
- Show what additional ingredients are needed for suggested recipes
- Integration point / API for the separate recipe recommendation app

---

## Architecture Notes

- **Current stack:** Next.js 16.2.9 (App Router) with React 19, Prisma 7 + SQLite, NextAuth v5 (Beta)
- **Build tools:** Turbopack (Next.js default), npm
- **Data persistence:** Prisma ORM with SQLite (`better-sqlite3` adapter), database at `prisma/dev.db`
- **Authentication:** NextAuth v5 with Credentials provider, JWT session strategy (30-day expiry)
- **Route protection:** `src/proxy.js` (Next.js 16 convention, Node.js runtime) — redirects unauthenticated users
- **Design language:** Light theme (warm whites), purple accent gradients, clean card UI, micro-animations, no emojis, mobile-responsive
- **Font:** Inter (Google Fonts via `next/font/google`)
- **Testing:** 44 integration tests via `npm test` (auto-resets DB, starts/stops dev server)
- **Key files:**
  - `src/app/layout.js` — Root layout with Inter font, wrapped in `<Providers>` (SessionProvider)
  - `src/app/page.js` — Main page, client component with app state and modal logic
  - `src/app/globals.css` — All design system and component styles
  - `src/auth.js` — NextAuth config (Credentials provider, JWT callbacks)
  - `src/proxy.js` — Route protection proxy (Node.js runtime, replaces Edge middleware)
  - `src/app/api/items/` — Item CRUD endpoints (GET, POST, PUT, DELETE)
  - `src/app/api/auth/` — Auth endpoints (register, forgot-password, reset-password, NextAuth catch-all)
  - `src/components/` — 8 React components (Header, StatsBar, Toolbar, ItemList, ItemCard, ItemFormModal, DeleteModal, Fab, Providers)
  - `src/hooks/useItems.js` — Custom hook for API-backed CRUD with optimistic updates
  - `src/lib/prisma.js` — Prisma client singleton
  - `src/lib/auth-guard.js` — `requireAuth()` for route handlers
  - `src/lib/validation.js` — Item validation (strict on create, lenient on update)
  - `src/lib/constants.js` — Categories, storage locations, units, abbreviations
  - `src/lib/utils.js` — Utility functions (generateId, daysUntil, expiryBadge, formatDate)
  - `tests/test-integration.mjs` — Integration test suite

## Rules

- Always check which milestone the current task belongs to before starting work.
- Do not introduce features from future milestones unless explicitly instructed.
- Preserve the existing design language and CSS custom properties when adding new features.
- The app requires the dev server (`npm run dev`) for API routes and authentication. It is no longer a static site.
introduce a backend when genuinely needed.
