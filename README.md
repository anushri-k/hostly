# Hostly — Restaurant Administration Dashboard

The back-of-house companion to the **Plato** guest app. Owners, managers,
cashiers and kitchen supervisors run daily operations here — orders, menu,
payments, tables, staff and analytics.

Built from the *Hostly Dashboard* design (Claude Design handoff).

## Stack

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS** with CSS-variable design tokens (light + dark)
- **shadcn/ui-style** primitives on Radix UI
- **TanStack Query** (data) + **TanStack Table** (grids)
- **Zustand** (auth session, UI prefs) with `persist`
- **React Hook Form** + **Zod** (forms & validation)
- **Recharts** (interactive charts) · **Framer Motion** (subtle motion)
- **Sonner** (toasts) · **Lucide** (icons) · **date-fns**

> Requires **Node ≥ 18.17** (this repo is pinned to Node 20 via `.nvmrc`).

## Run it

```bash
nvm use            # Node 20
npm install        # also runs `prisma generate` (postinstall)
npm run db:push    # create the SQLite schema (prisma/dev.db)
npm run db:seed    # seed the restaurant + users
npm run dev        # http://localhost:3000
npm run build      # production build
```

`npm run db:reset` wipes and reseeds. The marketing **homepage** is at `/`;
the dashboard lives behind sign-in.

**Demo login:** pick any role on the sign-in screen — it fills working
credentials. Password for every account is `plato2026`. Each role sees a
different subset of the navigation (see Permissions below).

## Database

Users and the restaurant they belong to live in a real database — **Prisma +
SQLite** (`prisma/schema.prisma`):

- `Restaurant` → `Branch[]` and `User[]`
- `User` has a bcrypt `passwordHash`, a `role`, and a `restaurantId`

Sign-in posts to the `POST /api/auth/login` route handler, which verifies the
password with `bcrypt` against the DB and returns the user, their restaurant,
and its branches — the header's branch selector and the role switcher are all
DB-driven. To move to Postgres/MySQL, change the `datasource` provider and
`DATABASE_URL`; the queries are unchanged.

> Operational data (orders, menu, payments, …) still runs on the in-memory mock
> service layer — only **users + restaurant info** are persisted, as requested.
> Those services share the same async boundary, so they can be migrated to the
> database the same way.

## What's implemented

| Area | Highlights |
| --- | --- |
| **Auth** | Login (role-based), forgot/reset password, session persistence, route protection, unauthorized screen |
| **Shell** | Collapsible + persisted sidebar (role-filtered), sticky header with search, notifications, branch selector, profile menu, theme toggle |
| **Dashboard** | 6 KPI cards, date-range selector, revenue area chart, orders-by-hour bars, status & payment donuts, popular items, channel mix, activity feed |
| **Point of Sale** | Staff register — item catalog (categories, search, **plate-size variants**), live ticket with qty steppers, dine-in/takeaway, table + customer, discount, tax/service math; charge dialog with tips + method. Checkout creates a live order **and** payment, marks the table occupied, and flows into Orders/Payments. Gated to Owner/Manager/Cashier |
| **Orders** | TanStack table — tabs, channel filter, search, sorting, pagination, column visibility, saved filters, bulk actions; detail drawer with items, bill, timeline; **optimistic** status transitions, cancel, convert-to-takeaway, assign staff, print |
| **Menu** | Grid/list toggle, search, category + sort filters, availability switch (optimistic), create/edit/duplicate/archive/delete; RHF+Zod editor with live preview, dietary tags, add-on modifiers, ingredient mapping |
| **Categories** | Drag-and-drop reordering, visibility toggle, CRUD |
| **Ingredients** | Inventory with stock bars, low-stock alerts, linked items, CRUD |
| **Payments** | KPI summary, method donut, transactions table, detail drawer with tax breakdown & timeline, refund (confirm), reprint, invoice, CSV export |
| **Tables & QR** | Floor + list views, status legend, detail drawer with QR, regenerate (confirm), download/print, status control, CRUD |
| **Customers** | Tier filter, search, table, detail drawer with order history, favourites, notes |
| **Staff & Roles** | Team list with suspend/reactivate/delete, invite dialog, **permission matrix** (modules × roles) with Owner locked |
| **Reports** | Interactive revenue/peak/method charts, best sellers, slow movers, staff performance, CSV + print/PDF export, date ranges |
| **Settings** | General, Taxes, Payments, Ordering, Notifications, Security, Audit log |

UX: loading skeletons, empty states, confirmation dialogs, toasts, keyboard-
accessible Radix primitives, responsive layouts, light/dark theming.

## Architecture

```
src/
  app/
    (dashboard)/            Protected routes (one folder per module)
    login, forgot-password, reset-password, unauthorized
    layout.tsx, providers.tsx
  components/
    ui/                     shadcn-style primitives (button, dialog, sheet, …)
    data-table.tsx          Reusable TanStack table
    confirm-dialog.tsx      Imperative global confirm (useConfirm)
  features/
    auth/                   Permissions model, session store, login shell
    shell/                  Sidebar, header, nav config, UI/search stores
    dashboard/ orders/ menu/  Feature-local widgets, hooks, drawers
  lib/
    queries.ts              Central React Query keys + read hooks
    domain-styles.ts        Status/channel/tag/tier colour maps
    format.ts, utils.ts
  server/
    seed.ts                 Realistic seed data (from the design)
    store.ts                In-memory DB (globalThis singleton, survives HMR)
    services.ts             Async service layer — the ONLY backend boundary
  types/                    Domain types
```

### Migrating to a real backend

Every read and write goes through [`src/server/services.ts`](src/server/services.ts).
Each method is `async` and returns plain data; today it reads/writes the
in-memory store in [`store.ts`](src/server/store.ts). To go live, replace each
method body with a `fetch()` to your API — **no component, hook, or query key
changes required**. UI talks only to TanStack Query hooks
([`lib/queries.ts`](src/lib/queries.ts)) and the feature mutation hooks, never
to mock data directly.

### Permissions

Roles collapse to four permission groups (Owner / Manager / Cashier / Kitchen).
[`features/auth/permissions.ts`](src/features/auth/permissions.ts) maps each
route to a permission key; the sidebar and the route guard both consult it, so
navigation and direct URL access are restricted consistently. The Staff page
edits this matrix live.

## Design system

| Token | Value |
| --- | --- |
| Graphite (sidebar, text) | `#1D1F24` |
| Emerald (primary, success) | `#0EA76B` / dark `#0B7A4F` |
| Amber (attention) | `#F59E0B` |
| Surface / Card / Canvas | `#FAFAF9` / `#FFFFFF` / `#E9E8E4` |
| Type | Inter (UI), Newsreader italic (brand) |
| Radius | cards 18px, controls 14px, pills 999px |
