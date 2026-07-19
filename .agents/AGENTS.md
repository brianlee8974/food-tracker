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

### Milestone 2 — Account Management + Data Layer (🔄 Next)

Establish user accounts and persistent database infrastructure before implementing LLM/OCR features.

**Why this milestone exists:** Features in Milestones 3+ require server-side authentication and persistent data storage. Building the data layer now prevents major refactoring later.

**Planned features:**
- **User Authentication**
  - User registration and login (email/password or OAuth)
  - Session management and JWT/secure cookies
  - Password reset workflow
  - User profile page (optional: preferences, notification settings)
  
- **Database Setup**
  - PostgreSQL or SQLite with **Prisma ORM**
  - Schema design for users, items, and future features
  - Database migrations workflow
  
- **Data Migration**
  - Refactor `useItems` hook to call API endpoints instead of localStorage
  - API routes in `src/app/api/items/` for CRUD operations
  - Backward compatibility: localStorage → database migration for existing users
  - Authenticate all API requests (only allow users to access their own data)

- **Backend API Structure** (ready for later milestones)
  - `GET /api/items` — List user's items
  - `POST /api/items` — Create item
  - `PUT /api/items/[id]` — Update item
  - `DELETE /api/items/[id]` — Delete item
  - `POST /api/auth/register` — User registration
  - `POST /api/auth/login` — User login
  - Stub endpoints for Milestones 3-5 (LLM parsing, OCR, recipe integration)

**Key files to create:**
- `prisma/schema.prisma` — Database schema
- `src/app/api/auth/` — Authentication endpoints
- `src/app/api/items/` — Item CRUD endpoints
- `src/lib/prisma.js` — Prisma client singleton
- `src/lib/auth.js` — Auth utilities and middleware
- `src/app/(auth)/login` and `src/app/(auth)/register` — Auth pages (optional)

**After this milestone:**
- Users have accounts and persistent data storage
- All item data is secure and tied to user accounts
- Ready to add LLM parsing (Milestone 3) without data layer concerns
- Ready to add OCR (Milestone 4) with authenticated uploads

---

### Milestone 3 — Smart Food Tracking & Expiration Warnings

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

- **Current stack:** Next.js (App Router) with React, server-side capable for future API routes
- **Build tools:** Turbopack (Next.js default), npm
- **Data persistence:** Currently `localStorage` (abstracted in `useItems` hook, will swap to Prisma + PostgreSQL in Milestone 1.5)
- **Design language:** Light theme (warm whites), purple accent gradients, clean card UI, micro-animations, no emojis, mobile-responsive
- **Font:** Inter (Google Fonts via `next/font/google`)
- **Key files (Milestone 1 - Post-Migration):**
  - `src/app/layout.js` — Root layout with Inter font and global styles
  - `src/app/page.js` — Main page, client component with app state and modal logic
  - `src/app/globals.css` — All design system and component styles (migrated from vanilla styles.css)
  - `src/app/api/` — Empty directory, will contain auth and item CRUD endpoints in Milestone 1.5+
  - `src/components/` — 7 React components (Header, StatsBar, Toolbar, ItemList, ItemCard, ItemFormModal, DeleteModal, Fab)
  - `src/hooks/useItems.js` — Custom hook encapsulating CRUD logic, localStorage persistence, filtering, sorting
  - `src/lib/constants.js` — Categories, storage locations, units, abbreviations
  - `src/lib/utils.js` — Utility functions (generateId, daysUntil, expiryBadge, formatDate)

## Rules

- Always check which milestone the current task belongs to before starting work.
- Do not introduce features from future milestones unless explicitly instructed.
- Preserve the existing design language and CSS custom properties when adding new features.
- Keep the app functional as a static site for as long as possible; only introduce a backend when genuinely needed.
- All existing comments and docstrings unrelated to your changes must be preserved.
