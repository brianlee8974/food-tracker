# Pantry — Food Tracker: Project Roadmap

> **READ THIS FIRST.** Before working on any instruction, understand the full project vision and which milestone the current task falls under. Do not deviate from the established architecture or skip milestones.

---

## Project Vision

A web/mobile app that tracks a user's food, ingredients, and grocery inventory. The app displays what food the user has, the quantity, and the status (e.g. expiration). The ultimate goal is to power a **recipe recommending app** using the user's pantry data.

---

## Milestones

### Milestone 1 — Prototype (✅ Complete)

Basic CRUD app with add/edit/delete item functionality.

**What was built:**
- Dark-themed single-page app (HTML/CSS/JS, no framework)
- Add items via floating action button with form fields: name, category, storage location, quantity, unit, expiry date, notes
- Edit items by clicking a card or the edit button
- Delete items with confirmation dialog
- Search items by name or notes
- Filter by category (dynamically populated)
- Sort by name, expiry date, or recently added
- Stats bar (total items, unique categories, expiring-soon count)
- 12 food categories with emoji icons
- 4 storage locations (Fridge, Freezer, Pantry, Counter)
- Expiry badges with color coding (fresh/warning/expired)
- All data persisted to `localStorage`

**Key files:**
- `index.html` — App structure and markup
- `styles.css` — Design system and all styles
- `app.js` — Application logic, CRUD, search, filtering, sorting

---

### Milestone 2 — Smart Food Tracking & Expiration Warnings

The app should **automatically keep track** of food amounts and their status. It should understand each ingredient well (e.g. typical shelf life, storage best practices).

**Planned features:**
- Built-in ingredient knowledge base (typical shelf life by category/item, storage recommendations)
- Auto-suggest expiry dates when adding items based on ingredient type and storage location
- Active expiration monitoring — items approaching expiry or already expired should be gathered into a dedicated **"Expiring Soon / Expired"** section displayed prominently
- Visual warnings (color-coded badges, notifications) for items expiring within a configurable threshold (e.g. 3 days)
- Quantity tracking — the user should be able to decrement/use portions of an item without deleting it

---

### Milestone 3 — LLM Integration for Adding Items

Users can describe their items in natural language and let an integrated LLM parse and add them automatically.

**Planned features:**
- Text input field where users describe items conversationally (e.g. "I just bought 2 lbs of chicken breast and a gallon of milk from Costco")
- LLM parses the description into structured item data (name, category, quantity, unit, estimated expiry, storage recommendation)
- User reviews the parsed items before confirming the addition
- Support for batch additions from a single description

---

### Milestone 4 — Receipt Scanning

Users can take a photo of a grocery receipt and have items automatically extracted and added to their pantry.

**Planned features:**
- Camera/photo upload integration
- OCR or vision model to extract line items from receipt images
- Map extracted text to structured item data (name, quantity, price)
- Auto-categorize and suggest storage/expiry based on item recognition
- User reviews and confirms before adding

---

### Milestone 5 — Recipe Recommendation Integration

The pantry data feeds into a recipe recommendation system.

**Planned features:**
- Analyze current pantry inventory to suggest recipes the user can make now
- Highlight recipes that use soon-to-expire ingredients (reduce waste)
- Show what additional ingredients are needed for suggested recipes
- Integration point / API for the separate recipe recommendation app

---

## Architecture Notes

- **Current stack:** Vanilla HTML + CSS + JavaScript (no framework)
- **Data persistence:** `localStorage` (may migrate to a backend/database in later milestones)
- **Design language:** Light theme (warm whites), purple accent gradients, clean card UI, micro-animations, no emojis, mobile-responsive
- **Font:** Inter (Google Fonts)

## Rules

- Always check which milestone the current task belongs to before starting work.
- Do not introduce features from future milestones unless explicitly instructed.
- Preserve the existing design language and CSS custom properties when adding new features.
- Keep the app functional as a static site for as long as possible; only introduce a backend when genuinely needed.
- All existing comments and docstrings unrelated to your changes must be preserved.
