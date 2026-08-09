# Expense Tracker — Project Context (Phase 1: UI Only)

This file is the persistent context for AI coding assistants (Claude Code or similar) working on this repo. Read this fully before writing any code. Keep it updated as the project evolves — Phase 2 (backend/auth/data) and Phase 3 (collaborative features) will be appended later; **do not build toward them yet.**

---

## 1. Project Snapshot

- **What it is:** A personal expense tracker — track spending, see it broken down by category, stay within a monthly budget.
- **Who it's for:** One person tracking their own money. Solo use only in this phase — no multi-user, no sharing, no partner accounts.
- **Platform order:** React (Vite) web app first. A mobile app (React Native or a wrapped PWA — TBD) comes later, reusing this design system.
- **Roadmap (for context, not for building yet):**
  - **Phase 1 (this doc):** UI only, mock data, no backend.
  - **Phase 2:** Auth, database, real persistence, real receipt/voice capture.
  - **Phase 3:** Evaluate collaborative/shared-expense features — only after solo retention is validated. Don't scaffold for this yet.

## 2. Phase 1 Scope — Read This Twice

Build the **UI only**:
- ✅ All screens, components, navigation, and interactions below, fully responsive and polished.
- ✅ Local mock/fixture data (see §7) standing in for a real API.
- ✅ Client-side state only (React state/context). Edits (e.g. updating budget) can update local state — they don't need to persist across reloads yet.
- ❌ No backend calls, no auth, no real database, no real OCR/voice processing.
- ❌ Camera and mic capture are **visually present but non-functional** — see §6.1.

A reference screenshot of an existing app was used for structural inspiration only (layout and information hierarchy) — **do not copy its visual style**. This app has its own design system, defined below, and every screen should look like it belongs to this design system, not the reference.

## 3. Tech Stack

- **React** with **Vite**
- **React Router** for the three top-level routes (Home, Detailed View, Profile)
- **Plain CSS + CSS custom properties** — no Tailwind, no CSS-in-JS. Import `colors.css` (or `theme.css`) globally and use `var(--token-name)` everywhere. See §5.
- **Recharts** (or a comparably lightweight React chart lib) for the donut charts
- **Mobile-first** layout: design for a ~390px phone viewport first, then let it scale up. On wide/desktop viewports, don't stretch the UI edge to edge — center it as a constrained column (max-width ~480px) with the base background filling the rest of the page, the way Cash App or Mercury's web apps do. This app is headed toward a native shell later, so it should always read as "phone app," never as a generic responsive dashboard.

## 4. Design System

### 4.1 Design direction

Calm, confident, fintech-grade — dark by default, glanceable, numbers-first. One deliberate choice this app makes differently from typical trackers: **expense amounts are not colored red.** Debits and credits are both shown in the primary text color, distinguished only by a small directional arrow and icon — this keeps the everyday experience calm instead of feeling like a string of alarms, and reserves color for meaning (category identity, pace/status) rather than judgment about spending.

The app deliberately avoids the "generic dark fintech template" look: a single accent color repeated everywhere, and every surface rendered as an identical rounded box at the same elevation. Color is spread purposefully across five accents (not one), card treatment varies by role instead of repeating, and the ring is a real data visualization, not a decorative donut. See 4.2–4.5.

### 4.2 Color tokens (source of truth: `colors.css`)

| Token | Hex | Role |
|---|---|---|
| Ink | `#0B0B10` | Base background (dark mode) |
| Charcoal | `#15151C` | Card / surface background (dark mode) |
| Slate Mist | `#9497A6` | Secondary text, muted UI, icons |
| Paper | `#F5F5F7` | Primary text on dark; base background in light mode |
| Indigo | `#5271FF` | Primary brand accent — spent-so-far ring arc, links, primary actions |
| Coral | `#FF6B4A` | "Days left" numeral, the ring card's ambient background wash |
| Amber | `#FFB648` | Overpace warning — the ring arc past the pace marker, "Over pace" pill |
| Yellow | `#F2C94C` | The pace-marker tick on the ring (ideal even-spend point for today) |
| Emerald | `#2FBF87` | Credit transactions, "On track" positive state |

Every accent has an assigned job — none of them are decorative-only. Everything else (borders, shadows, muted/tint variants, the 8-color category palette, light-mode overrides, spacing, radius) lives in `colors.css` as CSS variables. **No component should hardcode a hex value or an inline color.** If a needed color doesn't exist yet, add it to `colors.css` first, then reference it.

### 4.3 Typography

Space Grotesk carries **identity** (who/what); Inter tabular numerals carry **money** (how much) and all structural UI. That split is the rule, applied consistently rather than "big number is bold":

- **Hero display** — Space Grotesk 700, 38px, tight tracking (`-0.02em`) — the spent amount inside the ring, sized to sit close to the ring's inner edge rather than safely centered with slack padding.
- **Display / headers** — Space Grotesk 600, 17–20px — screen headers, section titles, donut center total.
- **Display / identity rows** — Space Grotesk 600, 14–15px — transaction merchant names and category names, in list rows and the legend. This is the "real work" beyond the hero number: personality shows up in every row, not once at the top.
- **Body** — Inter 500, 13–15px — labels, buttons, form fields, list subtitles, chip text.
- **Eyebrow labels** — Inter 700, 10–11px, uppercase, wide tracking — BUDGET, DAYS LEFT, category legend percentages.
- **Numbers:** always tabular (`font-variant-numeric: tabular-nums`) so digits align in lists and don't jitter when values change. Amounts stay in Inter, semibold — money is always calm and numeric, never the display face, per 4.1's "no red" principle.

### 4.4 Shape & spacing

- Radius scale: `--radius-sm` (8px, chips/buttons), `--radius-md` (16px, list rows), `--radius-lg` (24px, cards), `--radius-full` (pills, avatar).
- Spacing scale: 4 / 8 / 12 / 16 / 24 / 32 / 48px, exposed as `--space-1` … `--space-7`.
- **Card treatment varies by role — not every surface is the same box.** Three distinct surface languages, used consistently:
  1. **Hero card** (the spending ring card): boxed, elevated (`--shadow-card`), ambient coral glow wash, the one card that dominates its screen.
  2. **Boxless shapes**: the category donut chart floats directly on the base background with no card wrapper — it's a bold free shape, not content inside a box.
  3. **Grouped lists** (`GroupedList` component): recent transactions, the category legend, and Profile's settings list are each **one card containing hairline `--border-subtle` dividers between rows**, not a stack of individually-boxed rows. Rows lean on the outer card's elevation; they don't each carry their own shadow.
- Light mode adds a `1px solid var(--border-subtle)` outline to every card-level surface (hero card, grouped lists, donut/legend containers) since it can't rely on Ink/Charcoal contrast the way dark mode does.

### 4.5 Signature element

**The ring — a pace gauge, not a decorative donut.** Indigo fills up to actual spend. A yellow tick marks the "ideal pace" point — where spend would be if it fell evenly across the days elapsed this month. Any amount spent past that tick renders in amber instead of indigo, so the ring visualizes *whether you're on pace*, not just *what percent you've used*. On Home, the ring sits anchored left in its card (not centered) with the oversized hero amount inside it and a warm coral ambient wash behind it — an asymmetric hero shot rather than a symmetric donut safely centered in a box. A miniature single-color version (no pace tick, `pacePercent` omitted) reuses the same `Ring` component next to "Monthly Budget" in Profile — one shape for "progress toward a limit," but only the Home ring tells the fuller pace story.

### 4.6 Icons

All icons are [lucide-react](https://lucide.dev), colored via `currentColor` — no emoji anywhere in the shipped UI. Size 20px in list rows and category chips, 24px in the bottom nav. Category identity icons are mapped by category id (`src/utils/categoryIcons.js`); custom user-added categories keep a typed-emoji field since there's no reasonable auto-mapping for arbitrary custom icons.

## 5. Using `colors.css`

- Import it once, globally (e.g. in `main.jsx` or `index.css`).
- Dark mode is the default and lives under `:root`. Light mode overrides live under `[data-theme="light"]`.
- Theme switching (Profile → dark/light toggle) works by setting `data-theme="light"` or removing it on `<html>` — implement with a small `ThemeContext`, default to dark, no persistence needed yet (fine to reset to dark on reload in Phase 1).
- Category colors are a fixed 8-color palette (`--category-1` … `--category-8`), assigned to categories in a stable order so a category's color never changes between screens.

## 6. Navigation

Bottom tab bar, always visible, 3 items:

```
🏠 Home     📊 Detailed View     👤 Profile
```

## 7. Screens

### 7.1 Home

```
┌───────────────────────────┐
│  📈  Hi {name}             │
├───────────────────────────┤
│                            │
│        ╭─────────╮        │
│       │  Spent in  │       │
│       │  {Month}   │       │
│       │  ₹14,206   │       │
│       │    49%     │       │  ← the ring (signature element)
│        ╰─────────╯        │
│                            │
│  Income    Budget   Safe   │
│  •••• 👁   ₹30,000  to spend│
│                    ₹509/day│
├───────────────────────────┤
│    (+)      (📷)     (🎤)   │  ← quick actions
├───────────────────────────┤
│  Recent transactions       │
│  🍽  Zomato        ₹220     │
│  🚕  Uber #office  ₹360     │
│      Shared trip · Split   │
│  🛒  Decathlon     ₹1,400   │
│      badminton shuttle box │
│  ❤️  1mg           ₹1,400   │
│  💳  axio        ↙ ₹45,000 │  ← credit: same text color, arrow shows direction
├───────────────────────────┤
│  🏠 Home  📊 Details 👤 Prof│
└───────────────────────────┘
```

**Components:** `HomeHeader`, `SpendingRingCard`, `QuickActionsRow`, `AddExpenseSheet`, `TransactionListItem`, `RecentTransactionsList`, `BottomNav`.

**Behavior notes:**
- Income is masked by default (`••••`) with an eye icon to reveal — this is a real, working toggle in Phase 1 (pure UI state, no backend needed).
- "Budget" and "Safe to spend/day" are tappable — tapping Budget jumps to the same budget editor used from Profile.
- Empty state (no transactions yet): friendly, actionable copy — "No expenses yet. Tap + to add your first one." — not a blank list.

#### 7.1.1 Quick actions row ("+", camera, mic)

- **`+` (writing/manual entry) — fully build this in Phase 1.** Tapping it opens a sheet/modal with three options:
  1. **Add expense** — a simple form (amount, category picker, note, date, defaulting to today) that appends to the mock transaction list on submit.
  2. **Update categories** — shortcut into the category manager (same screen Profile uses).
  3. **Update budget** — shortcut into the budget editor (same screen Profile uses).
- **Camera (📷)** and **mic (🎤)** — render them, give them a pressed/hover state, but tapping shows a lightweight "Coming soon" toast/tooltip. Don't build scanning or voice capture yet.

### 7.2 Detailed View

```
┌───────────────────────────┐
│  ←  Detailed View          │
├───────────────────────────┤
│ [This Month*][Last 3 Mo]   │
│ [This Year][Custom]        │
│  Start: __/__/__  End: __  │  ← only shown/enabled when "Custom" selected
├───────────────────────────┤
│         ╭───────╮          │
│        │ Total   │         │
│        │ ₹14,206 │         │  ← donut, category-colored slices
│         ╰───────╯          │
├───────────────────────────┤
│ ● Food        ₹3,200  23%  │
│ ● Transport   ₹2,800  20%  │
│ ● Shopping    ₹4,100  29%  │
│ ● Health      ₹1,400  10%  │
│ ● Other       ₹2,706  19%  │
├───────────────────────────┤
│  🏠 Home  📊 Details 👤 Prof│
└───────────────────────────┘
```

**Components:** `DateRangeSelector`, `CategoryDonutChart`, `CategoryLegendList`.

**Date range behavior:**
- Preset chips: **This Month** (default — the current calendar month, e.g. August), **Last 3 Months**, **This Year**, **Custom**.
- Selecting **Custom** reveals start-date / end-date pickers; selecting any preset hides them and recomputes the chart from mock data filtered to that range.
- Each legend row: color swatch (from the shared category palette — same color a category has everywhere else), category name, amount, percentage of total. Tapping a row can optionally highlight/emphasize that slice.

### 7.3 Profile

```
┌───────────────────────────┐
│         👤                 │
│      {Name}                │
│      Edit name  →          │
├───────────────────────────┤
│  Categories            →   │
│  Monthly Budget         →   │
│  Dark Mode        ◯──●     │
├───────────────────────────┤
│  🏠 Home  📊 Details 👤 Prof│
└───────────────────────────┘
```

**Components:** `ProfileHeader` (avatar + editable name), `SettingsList`, `ThemeToggle`, `CategoryManagerSheet` (add/edit/delete a category, assign it one of the 8 palette colors, add an icon/emoji), `BudgetEditorSheet` (set the monthly budget number).

These two editor sheets (`CategoryManagerSheet`, `BudgetEditorSheet`) should be the **same shared components** opened from the Home quick-actions sheet — build them once, open from both places.

## 8. Mock Data (Phase 1 fixtures)

Ship a `src/mock/` folder with fixture JSON the components read from. Suggested shape:

```json
// mock/categories.json
[
  { "id": "food", "name": "Food & Dining", "color": "var(--category-1)", "icon": "🍽" },
  { "id": "transport", "name": "Transport", "color": "var(--category-2)", "icon": "🚕" },
  { "id": "shopping", "name": "Shopping", "color": "var(--category-3)", "icon": "🛒" },
  { "id": "health", "name": "Health & Wellness", "color": "var(--category-4)", "icon": "❤️" },
  { "id": "bills", "name": "Bills & Utilities", "color": "var(--category-5)", "icon": "🧾" },
  { "id": "entertainment", "name": "Entertainment", "color": "var(--category-6)", "icon": "🎬" },
  { "id": "personal", "name": "Personal Care", "color": "var(--category-7)", "icon": "💇" },
  { "id": "other", "name": "Other", "color": "var(--category-8)", "icon": "•••" }
]
```

```json
// mock/transactions.json
[
  {
    "id": "t1",
    "categoryId": "food",
    "merchant": "Zomato",
    "note": null,
    "date": "2026-05-26",
    "amount": 220,
    "direction": "debit"
  },
  {
    "id": "t2",
    "categoryId": "transport",
    "merchant": "Uber",
    "note": "#office · Shared trip · Split",
    "date": "2026-05-19",
    "amount": 360,
    "direction": "debit"
  },
  {
    "id": "t3",
    "categoryId": "other",
    "merchant": "axio",
    "note": "Credit",
    "date": "2026-05-02",
    "amount": 45000,
    "direction": "credit"
  }
]
```

```json
// mock/budget.json
{ "monthlyBudget": 30000, "income": 120000, "incomeHidden": true }
```

```json
// mock/user.json
{ "name": "Nayak", "avatarUrl": null }
```

## 9. Suggested Folder Structure

```
src/
  components/
    home/         SpendingRingCard, QuickActionsRow, AddExpenseSheet, ...
    detailed/      CategoryDonutChart, DateRangeSelector, CategoryLegendList
    profile/       ProfileHeader, SettingsList, ThemeToggle, CategoryManagerSheet, BudgetEditorSheet
    shared/        BottomNav, Ring, ListRow, Chip, Modal/Sheet
  pages/           Home.jsx, DetailedView.jsx, Profile.jsx
  mock/            categories.json, transactions.json, budget.json, user.json
  context/         ThemeContext.jsx
  styles/          colors.css, base.css (resets, font-face, tabular-nums utility)
  App.jsx          Router setup
  main.jsx
```

## 10. Copy Guidelines

Keep all UI text plain, specific, and in the app's own voice — no filler:
- Buttons say exactly what they do: "Save budget," not "Submit."
- Empty states invite action rather than just stating absence: "No expenses yet. Tap + to add your first one," "No transactions in this range yet."
- Errors/validation (e.g. empty amount field) state the problem and the fix plainly: "Enter an amount to continue" — never vague.

## 11. Out of Scope for Phase 1

Backend/API integration · authentication · real database/persistence · real receipt OCR · real voice capture/transcription · push notifications · multi-user, sharing, or split-expense settlement logic · payment integrations.

## 12. Instructions to the AI Coding Assistant

1. Build the three pages and shared components listed in §7–§9, wired to the mock fixtures in §8.
2. Use only tokens from `colors.css` for color — never a raw hex in a component file.
3. Match the wireframe structure in §7, but express it through this app's own design system (§4), not the reference screenshot's visual style.
4. Camera/mic buttons and the roadmap items in §11 should be visually present where noted but non-functional ("Coming soon") — don't stub out backend calls for them.
5. Keep `CategoryManagerSheet` and `BudgetEditorSheet` as single shared components used from both Home's quick-actions sheet and Profile.
6. Default theme is dark; the toggle in Profile switches to light via `data-theme="light"`.
7. Ask before introducing a new dependency not listed in §3.
