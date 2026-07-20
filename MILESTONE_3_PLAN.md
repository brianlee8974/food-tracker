# Milestone 3 — Smart Food Tracking & Expiration Warnings

## Goal

Make Pantry proactive: it should suggest a sensible expiry date and storage
location while an item is being added, prominently surface food that needs
attention, and let a user record consumption by reducing an item's quantity.

This plan is intentionally limited to Milestone 3. Natural-language entry,
receipt scanning, and recipe recommendations remain out of scope.

## Delivery principles

- Keep the existing authenticated Item API as the system of record.
- Keep the ingredient knowledge base application-owned and versioned in code;
  no external food-data service is required for this milestone.
- A suggestion is never a forced edit. Users can always replace or clear it.
- Expiration status is calculated from the current date and an item's stored
  expiry date, rather than persisted as data that can become stale.
- Preserve the existing warm, responsive card-based design language.

## Phase 0 — Product rules and technical foundation

**Purpose:** Define shared behaviour before changing the UI or database.

**Work**

- Establish a single expiration-status utility: expired, today, within the
  warning threshold, upcoming, fresh, and no expiry date.
- Decide and document the default warning threshold (3 days), inclusive date
  boundary, and the treatment of items with no expiry date.
- Define quantity rules: a decrement must be positive, cannot reduce below
  zero, and a zero-quantity item remains visible until the user deletes it.
- Add a persistent per-user warning-threshold preference only if the threshold
  must be personalized. Otherwise, keep the default as an application setting.
- Add unit and API-level tests for the shared rules before the feature UI uses
  them.

**Exit criteria:** The app has one tested definition of "expiring soon" and
one agreed behaviour for quantity reaching zero.

## Phase 1 — Ingredient knowledge base

**Purpose:** Give the app useful, explainable defaults for common foods.

**Work**

- Create a typed/structured, version-controlled catalogue of common
  ingredients, with normalized names and aliases.
- For each entry, store a category, recommended storage location, and typical
  shelf-life days by storage location. Include category-level fallbacks for
  unfamiliar ingredients.
- Add lookup helpers that normalize input safely and return the best available
  match, a fallback, or no recommendation.
- Include a concise storage recommendation suitable for display in the add
  form.
- Cover exact-name, alias, category-fallback, unknown-item, and unsupported
  storage cases with tests.

**Exit criteria:** Given a recognized ingredient and storage location, the app
can deterministically return a category, storage recommendation, and expiry
duration; unknown items receive no invented precision.

## Phase 2 — Smart add/edit suggestions

**Purpose:** Put the knowledge base to work without removing user control.

**Work**

- Enhance the item form to look up an ingredient as the name is entered.
- Suggest category, storage, and expiry (today plus the matching shelf-life
  duration) for new items.
- Clearly label suggestions and show the reason/source, for example the
  selected storage location.
- Do not overwrite fields the user has manually changed; recompute an
  unaccepted expiry suggestion only while its inputs are still automatic.
- Keep all current form validation and allow a user to enter a different date,
  storage location, or no expiry date.

**Exit criteria:** Adding a known item produces a transparent, editable
recommendation, while editing existing items and adding unknown foods preserve
their current straightforward behaviour.

## Phase 3 — Expiration monitoring and prominent alerts

**Purpose:** Make time-sensitive inventory impossible to overlook.

**Work**

- Derive expired and expiring-soon lists from the loaded inventory and the
  shared expiration utility.
- Add a prominent dashboard section headed "Expiring Soon / Expired", ordered
  with expired items first and then nearest expiry date.
- Make each alert actionable: open the existing item editor, with the option
  to use quantity controls once Phase 4 lands.
- Align card badges, stats, and alert counts to the same configured threshold.
- Provide an intentional empty state when no items need attention; items
  without expiry dates are not included in alerts.
- Verify mobile layout, keyboard access, and visual contrast for every warning
  state.

**Exit criteria:** The alert section, item cards, and stats always agree on an
item's status and update immediately after an item is added or edited.

## Phase 4 — Quantity use/decrement flow

**Purpose:** Let users accurately record consumption without retyping item
details.

**Work**

- Add a compact, accessible "Use" action to an item card or its edit surface.
- Let users enter an amount to consume, defaulting to one appropriate unit of
  the existing item; show the resulting quantity before confirmation.
- Send the change through the existing authenticated update endpoint, with the
  same optimistic-update and rollback behaviour as other edits.
- Prevent invalid, non-numeric, negative, and over-available reductions on
  both client and server.
- Make zero quantity visible and understandable rather than silently deleting
  the record.

**Exit criteria:** Quantity adjustments are reliable under normal API failures,
never create negative inventory, and immediately refresh the dashboard and
alert views.

## Phase 5 — Hardening, migration, and release verification

**Purpose:** Finish Milestone 3 as a cohesive, backward-compatible release.

**Work**

- Add any required Prisma migration only after the Phase 0 preference decision;
  existing Item records must remain valid.
- Extend integration coverage for suggestion-independent CRUD, authorization,
  quantity updates, alert ordering, threshold boundaries, and user isolation.
- Run the existing integration suite, targeted unit tests, production build,
  and a responsive manual smoke test.
- Confirm legacy items with custom categories, no expiry, and quantities of
  zero display safely.
- Update the project roadmap when all exit criteria are met.

**Exit criteria:** The complete Milestone 3 flow passes automated checks and
works for both new and pre-existing pantry data.

## Recommended implementation order

`Phase 0 → Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5`

Phases 1 and 3 can share the expiration utility, but the user-facing suggestion
flow should follow the knowledge-base work. Quantity controls are deliberately
after alerts so the app first establishes a consistent status model.

## Decisions to confirm before implementation

1. Should the warning threshold be a per-user saved preference, or is a single
   app-wide default of three days sufficient for this milestone?
2. When an item reaches zero quantity, should it remain in the pantry (the
   recommended default), be hidden in a separate empty-items view, or prompt
   for deletion?
3. Is the initial knowledge base expected to cover a focused list of common
   household foods with category fallbacks, or a broad catalogue before release?
