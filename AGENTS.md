# AGENTS.md

Instructions for AI coding agents (and a fast on-ramp for humans). The template
is deliberately small and consistent — follow the patterns that are already
here rather than introducing new ones.

## Project

SvelteKit SaaS boilerplate: Svelte 5 (runes), SvelteKit remote functions,
Prisma 7 on Postgres, Better Auth (organizations plugin), Tailwind 4 +
daisyUI 5, bun as package manager and script runner. TypeScript everywhere.
All code, comments and identifiers are written in English.

Start with [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — it explains where
things live and why. This file is the condensed contract.

## Commands

```sh
bun install            # also runs prisma generate + svelte-kit sync
bun run dev            # dev server
bun run check          # svelte-check — run after every change
bun run lint           # prettier + eslint (bun run format fixes)
bun run test           # unit + browser component tests
bun run build && bun run test:integration   # HTTP tests, needs DATABASE_URL
bun run db:migrate     # create/apply a migration after schema changes
```

A change is not done until `bun run check`, `bun run lint` and `bun run test`
pass.

## Hard rules

1. **Data flows through remote functions only** (`src/lib/remotes/*.remote.ts`,
   `query`/`form`). No `+page.server.ts` load/actions, no ad-hoc `+server.ts`
   endpoints for app data.
2. **Every remote function starts with a guard** from `src/lib/server/guard.ts`
   — `requireUser()`, `requireOrg()` or `requirePermission()`. Nothing in
   `src/lib/remotes` touches `prisma` without one. `hooks.server.ts` is
   convenience, not security — never rely on it for authorization.
3. **Tenant scoping is non-negotiable**: the active organization id from
   `requireOrg()` goes into every `where` clause, including
   `updateMany`/`deleteMany`. A row id alone never identifies a row.
4. **Everything works without JavaScript.** Auth and mutations are
   progressively-enhanced forms (`<form {...myForm}>`); list state lives in the
   URL. Do not reach for the Better Auth client — call `auth.api.*` on the
   server.
5. **Secrets vs. decisions vs. public**: secrets are declared in `src/env.ts`
   and come from the environment; feature decisions (providers, session length,
   upload presets) live in `src/lib/server/config.json`; what the browser may
   see (app name, logo icon, navigation, marketing copy) lives in
   `src/lib/config.json` and is imported as `$config`. Never put a secret in
   the public one — it ships in the client bundle.
6. **Schema changes need a migration**: edit `prisma/schema.prisma`, then
   `bun run db:migrate` — never `db push` against a shared database, and never
   edit committed migrations.

## Conventions

- **Components**: reusable building blocks go in
  `src/lib/components/elements/`, page chrome in `src/lib/components/layout/`.
  Reuse `Button`, `Icon`, `Field`, `Modal`, `DataTable`, `Alert`, `EmptyState`
  and the daisyUI primitives instead of hand-rolling markup. `/components`
  shows every element and its props.
- **Icons** resolve through `src/lib/components/elements/icons.ts` — add a
  re-export line there before using a new icon name.
- **Page titles** go through `<PageTitle text="…" />`
  (`src/lib/components/layout/`), never a hand-written `<svelte:head><title>`.
  It appends the app name from `$config`, so the format lives in one place.
- **Settings are split by who a change affects**: everyone in the organization
  (`/settings` — name, address, billing, deleting the workspace) or one person
  (`/profile` — details, notifications, sign-in, theme). Put a new setting on
  the side it belongs to; the organization side is read-only for members.
- **Submit buttons show progress**: `loading={!!myForm.pending}` on every one,
  and on the instance from `form.for(id)` rather than the module when the form
  is repeated per row.
- **New listable model**: copy the `/crud` pattern — a list config next to
  `src/lib/helper/task.ts`, a remote query, a page composed of `PageHeader`,
  `Card`, `DataTable` and `EmptyState`. Filter state belongs in the URL.
- **Toasts** via `toast.success('…')` from
  `src/lib/components/elements/toast-state.svelte.ts`; there is one `<Toaster>`
  in the root layout.
- **Aliases**: `$components`, `$config`, `$server`, `$remotes`, `$helper`,
  `$assets`, `$css`, `$generated` (see `vite.config.ts`). Route ids include the
  group: `'/(app)/crud/[id]'`.
- **Demo content** that is still template filler lives in
  `src/lib/helper/demo.ts` — when replacing it with real data, delete the
  export and follow the type errors.
- **Tests**: colocate unit tests as `*.spec.ts`; component tests are
  `*.svelte.spec.ts` (browser mode); HTTP-level tests go in
  `tests/integration/`.
- **UI style**: confirm destructive actions; plain tones; no redundant
  buttons, links or explanatory filler text.

## Svelte 5, not Svelte 4

Runes mode is forced project-wide. Use `$state`, `$derived`, `$props`,
`$effect`, snippets and event attributes (`onclick`). Do not write `export let`,
`$:` reactive statements, stores-for-everything or `on:click`. When unsure
about a Svelte/SvelteKit API, consult the Svelte MCP server configured in
[.mcp.json](.mcp.json) (`list-sections` → `get-documentation`), and run
generated components through its `svelte-autofixer` tool.

## Gotchas

Each of these cost real debugging time — they look like framework bugs and are
not.

- `enhance` switches off the automatic form reset. A form that stays on the page
  after submitting has to clear its own fields, and only on success: check
  `fields.allIssues()` first, or a rejected submit throws away what was typed.
- A field prefilled with `as('text', value)` resets to the value it was
  _rendered_ with. After a successful submit the default invalidation lands a
  round trip too late, so the input shows the previous value while the rest of
  the page is already current. Refresh the backing query inside the handler
  (`void getWorkspace().refresh()`) to send fresh data back in the same flight.
- The same refresh is what a `form` needs whenever it changes something the app
  shell renders — creating, switching or joining an organization. Without it the
  client keeps the `getWorkspace()` it fetched before the change, and the page
  it redirects to comes up empty. Skip it when the redirect leads somewhere the
  query cannot answer (`/onboarding` after leaving your last organization): the
  refresh would throw its own redirect.
- `dark:` is bound to `data-theme` by an `@custom-variant` in
  `src/lib/css/main.css`. Tailwind's built-in variant keys off
  `prefers-color-scheme` and would follow the operating system instead of the
  theme the visitor picked.
- Cards and other boxes inside a grid or flex parent need `min-w-0`. Without it
  the item refuses to shrink below its content's min-content width, and a wide
  table pushes the whole page into a horizontal scroll instead of scrolling
  inside its own container.
- In a daisyUI `menu`, `li > *` becomes a grid with content-sized columns. The
  interactive element must be the `<li>`'s **direct** child, or only the part of
  the row covering its text reacts to clicks — wrap the form around the menu,
  not around the button, and reach it with `form="id"`.
- `src/generated/` (Prisma client) is gitignored — if imports from
  `$generated/prisma/client` fail, run `bun run db:generate`.
- Remote `query` results are cached by `(function, arguments)` — that is why
  `getTasks` takes the organization id as an argument even though the server
  ignores it. Keep such cache keys when copying the pattern.
- The `sveltekitCookies` plugin must stay **last** in the Better Auth plugin
  list.
- Without `RESEND_API_KEY`, emails print to the dev-server terminal — that is
  how you get the verification link locally.
- `UPLOAD_DIR` must sit outside the app directory; uploads are served by
  `src/routes/uploads/[...path]/+server.ts`, not as static files.
