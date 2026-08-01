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
