# Migrate Pantry to Next.js

Migrate the current vanilla HTML/CSS/JS food tracker prototype to a **Next.js** (App Router) project using React components. The goal is to preserve the exact same UI and behavior while establishing an architecture that supports all 5 milestones.

## Why Next.js

- **API Routes** — Milestone 3 (LLM) and Milestone 4 (Receipt OCR) need server-side endpoints to securely call external APIs. Next.js provides this out of the box with `app/api/` routes.
- **React components** — The UI will grow significantly (expiring-soon sections, LLM input, camera upload, recipe recommendations). Component-based architecture keeps this manageable.
- **Data layer flexibility** — Can start with `localStorage` and swap to a database (via Prisma or similar) without rewriting the UI.
- **Deployment** — Easy deployment to Vercel, or self-hostable via `next start`.

## Open Questions

> [!IMPORTANT]
> **Database setup**: The plan keeps `localStorage` for now (matching the current prototype). Should I also set up Prisma + SQLite now so the data layer is ready for Milestone 3+, or defer that to when it's actually needed?

> Answer : Create a new milestone for account management + data layer before implementing LLM

## Proposed Changes

### Overview

The vanilla `index.html`, `styles.css`, and `app.js` will be replaced by a Next.js project. The old files will be removed after migration.

```
food-tracker/
├── src/
│   ├── app/
│   │   ├── layout.js          # Root layout (Inter font, metadata)
│   │   ├── page.js            # Main page (assembles all components)
│   │   ├── globals.css        # Migrated from styles.css
│   │   └── api/               # API route directory (empty, ready for M3-M5)
│   ├── components/
│   │   ├── Header.jsx         # Logo + tagline
│   │   ├── StatsBar.jsx       # 3 stat cards
│   │   ├── Toolbar.jsx        # Search input + category/sort filters
│   │   ├── ItemList.jsx       # List container + empty state
│   │   ├── ItemCard.jsx       # Individual item card
│   │   ├── ItemFormModal.jsx  # Add/Edit modal with form
│   │   ├── DeleteModal.jsx    # Delete confirmation modal
│   │   └── Fab.jsx            # Floating action button
│   ├── hooks/
│   │   └── useItems.js        # Custom hook: CRUD ops, localStorage persistence
│   └── lib/
│       ├── constants.js       # Categories, storage locations, units, abbreviations
│       └── utils.js           # daysUntil, expiryBadge, generateId, etc.
├── package.json
├── next.config.mjs
└── .agents/AGENTS.md          # Preserved — project roadmap
```

---

### Shared Library (`src/lib/`)

#### [NEW] [constants.js](file:///c:/Users/Admin/Desktop/Programs/food-tracker/food-tracker/src/lib/constants.js)
- `CATEGORIES` — array of 12 category strings
- `CATEGORY_ABBREV` — category → abbreviation map (migrated from `app.js`)
- `STORAGE_LOCATIONS` — array of 4 storage options
- `UNITS` — array of 15 unit options

#### [NEW] [utils.js](file:///c:/Users/Admin/Desktop/Programs/food-tracker/food-tracker/src/lib/utils.js)
- `generateId()` — migrated from `app.js`
- `daysUntil(dateStr)` — migrated from `app.js`
- `expiryBadge(dateStr)` — migrated from `app.js` (with `badge-hard-warning` class from user's edits)
- `formatDate(dateStr)` — migrated from `app.js`

---

### Custom Hook (`src/hooks/`)

#### [NEW] [useItems.js](file:///c:/Users/Admin/Desktop/Programs/food-tracker/food-tracker/src/hooks/useItems.js)
- React hook encapsulating all item state and CRUD logic
- `items` state, `addItem()`, `updateItem()`, `deleteItem()`
- `getFilteredSortedItems(query, category, sortBy)` — filtering/sorting logic
- `stats` computed property (total, categories, expiring count)
- localStorage read/write with `useEffect`
- This abstraction makes it trivial to swap localStorage → database API calls later

---

### React Components (`src/components/`)

#### [NEW] [Header.jsx](file:///c:/Users/Admin/Desktop/Programs/food-tracker/food-tracker/src/components/Header.jsx)
- Renders `<header>` with "Place Holder" title and tagline
- Pure presentational component

#### [NEW] [StatsBar.jsx](file:///c:/Users/Admin/Desktop/Programs/food-tracker/food-tracker/src/components/StatsBar.jsx)
- Receives `stats` prop from `useItems` hook
- Renders 3 stat cards (Total Items, Categories, Expiring Soon)

#### [NEW] [Toolbar.jsx](file:///c:/Users/Admin/Desktop/Programs/food-tracker/food-tracker/src/components/Toolbar.jsx)
- Search input with `onChange` callback
- Category filter `<select>` (dynamically populated from items)
- Sort `<select>` with 5 sort options
- Controlled inputs with parent state

#### [NEW] [ItemList.jsx](file:///c:/Users/Admin/Desktop/Programs/food-tracker/food-tracker/src/components/ItemList.jsx)
- Maps filtered items to `ItemCard` components
- Shows `EmptyState` when no items
- Handles staggered animation delays

#### [NEW] [ItemCard.jsx](file:///c:/Users/Admin/Desktop/Programs/food-tracker/food-tracker/src/components/ItemCard.jsx)
- Displays item icon (abbreviation), name, quantity, storage, expiry badge
- Edit button (✎) → opens edit modal
- Delete button (×) → opens delete confirmation
- Click card body → opens edit modal

#### [NEW] [ItemFormModal.jsx](file:///c:/Users/Admin/Desktop/Programs/food-tracker/food-tracker/src/components/ItemFormModal.jsx)
- Dual-purpose Add/Edit modal
- Controlled form with all fields (name, category, storage, quantity, unit, expiry, notes)
- `onSave` callback, `onClose` callback
- Pre-populates when editing, resets when adding
- Escape key and overlay click to close

#### [NEW] [DeleteModal.jsx](file:///c:/Users/Admin/Desktop/Programs/food-tracker/food-tracker/src/components/DeleteModal.jsx)
- Confirmation dialog with item name
- `onConfirm` and `onClose` callbacks

#### [NEW] [Fab.jsx](file:///c:/Users/Admin/Desktop/Programs/food-tracker/food-tracker/src/components/Fab.jsx)
- Floating "+" button, `onClick` callback

---

### App Shell (`src/app/`)

#### [NEW] [layout.js](file:///c:/Users/Admin/Desktop/Programs/food-tracker/food-tracker/src/app/layout.js)
- Root layout with Inter font via `next/font/google`
- HTML metadata (title, description)
- Imports `globals.css`

#### [NEW] [page.js](file:///c:/Users/Admin/Desktop/Programs/food-tracker/food-tracker/src/app/page.js)
- `'use client'` — client component (needs state, localStorage)
- Assembles all components
- Owns the `useItems` hook and modal open/close state
- Passes data and callbacks down to children

#### [NEW] [globals.css](file:///c:/Users/Admin/Desktop/Programs/food-tracker/food-tracker/src/app/globals.css)
- Direct migration of `styles.css`
- Replace `#app` with `.app` (class-based instead of ID)
- Replace ID selectors with class selectors where needed for reusability
- Keep all CSS custom properties, animations, and responsive breakpoints identical

---

### Cleanup

#### [DELETE] [index.html](file:///c:/Users/Admin/Desktop/Programs/food-tracker/food-tracker/index.html)
#### [DELETE] [styles.css](file:///c:/Users/Admin/Desktop/Programs/food-tracker/food-tracker/styles.css)
#### [DELETE] [app.js](file:///c:/Users/Admin/Desktop/Programs/food-tracker/food-tracker/app.js)

---

### Configuration

#### [NEW] package.json
- Next.js, React, React DOM dependencies
- `dev`, `build`, `start` scripts

#### [NEW] next.config.mjs
- Minimal config

#### [MODIFY] [AGENTS.md](file:///c:/Users/Admin/Desktop/Programs/food-tracker/food-tracker/.agents/AGENTS.md)
- Update "Architecture Notes" to reflect Next.js stack
- Update Milestone 1 key files list

---

## Verification Plan

### Automated Tests
```bash
npm run build
```
A successful build confirms all imports resolve, components compile, and the app can be served.

### Manual Verification
- `npm run dev` → open http://localhost:3000
- Verify all existing features work identically:
  - Add an item via FAB → fill form → save → card appears
  - Click card → edit modal opens → modify → save
  - Delete button → confirmation → item removed
  - Search, category filter, sort all work
  - Stats bar updates correctly
  - Empty state shows when no items
  - Data persists across page refresh (localStorage)
- Verify responsive layout on mobile viewport
