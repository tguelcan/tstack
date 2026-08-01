# Architecture

How tstack is put together, and why. Read this before adding a feature — the
patterns below are the ones the rest of the code already follows.

## Layout

- **`src/lib/remotes/*.remote.ts`** — [remote functions](https://svelte.dev/docs/kit/remote-functions) (`query`/`form`), the only client↔server data path. Everything works without JavaScript and is progressively enhanced.
- **`src/lib/server/`** — server-only modules: the Better Auth instance (`auth.ts`), authorization for remote functions (`guard.ts`), Prisma client (`db.ts`), list→Prisma translation (`list.ts`), transactional email (`mail.ts`), image processing (`upload.ts`), and the parsed `config.json` (`config.ts`).
- **`src/lib/helper/`** — shared, pure helpers: URL-driven list state (`list.ts`), per-model list configs (`task.ts`), form utilities (`form.ts`), formatters and `slugify`/`describeUserAgent` (`format.ts`), placeholder content for the pages that are still a template (`demo.ts`). Unit-tested via colocated `*.spec.ts`.
- **`src/lib/components/elements/`** — reusable UI building blocks (`Button`, `Badge`, `Card`, `DataTable`, `StatCard`, `Alert`, `EmptyState`, `Field`, `Switch`, `Tabs`, `Modal`, `Toaster`, `Icon`, `Avatar`, list widgets). New elements go here.
- **`src/lib/components/layout/`** — page chrome: `AppShell`, `Sidebar`, `Topbar`, `UserMenu`, `PageHeader`, `PageTitle`, `BrandPanel`, `Footer`, `Logo`, `ThemeToggle`, plus the navigation config and the two state modules.
- **`src/generated/`** — Prisma client output; gitignored, recreated by `db:generate`.
- **`src/hooks.server.ts`** — puts the session on `locals` and redirects page navigations. Explicitly _not_ the authorization boundary; see [Auth](#auth) below.
- **`src/env.ts`** — explicit [environment variable](https://svelte.dev/docs/kit/environment-variables) declarations. Secrets only; what is a decision rather than a secret lives in `src/lib/server/config.json`.

## Routes

The SaaS scaffolding is split into [route groups](https://svelte.dev/docs/kit/advanced-routing#Advanced-layouts), so each area brings its own layout without showing up in the URL:

| Group          | Routes                                                                        | Layout                                                |
| -------------- | ----------------------------------------------------------------------------- | ----------------------------------------------------- |
| `(auth)`       | `/login`, `/register`, `/verify-email`, `/forgot-password`, `/reset-password` | Form and footer on the left, brand panel from `lg` up |
| `(onboarding)` | `/onboarding`, `/accept-invitation/[id]`                                      | A single centred column                               |
| `(app)`        | `/dashboard`, `/crud/*`, `/members`, `/profile`, `/settings/*`                | `AppShell`: collapsible sidebar + topbar              |
| `(public)`     | `/`, `/components`, and `(content)` nested inside                             | Shared header and footer for the site                 |
| `(content)`    | `/privacy`, `/terms`, `/imprint` — written as `+page.md`                      | Prose column inside `(public)`                        |
| —              | `/api/auth/*`, `/uploads/*`                                                   | None                                                  |

Everything under `(auth)`, `(onboarding)` and `(app)` reads real data. What is left of the
template is the dashboard's figures and the billing plans, which still come from
`src/lib/helper/demo.ts` — delete an export from there and follow the type errors.

`(onboarding)` exists because a signed-in user without an organization has nowhere to be: every
page in `(app)` is scoped to one. That group has its own layout for the same reason — the brand
panel of `(auth)` would read as a step backwards, and the shell's sidebar would be a menu of
pages that all bounce straight back.

Note that a group is part of the route id, so `resolve()` and `RouteParams<…>` take `'/(app)/crud/[id]'`, not `'/crud/[id]'` — the URL stays `/crud/…` either way.

## Auth

[Better Auth](https://better-auth.com) with the organization plugin, configured in
`src/lib/server/auth.ts`. Email and password are on by default; Google and GitHub are switched on
in `src/lib/server/config.json` and read their credentials from the environment. An address has to
be confirmed before the first sign-in.

The Better Auth **client is not used**. Every flow is a remote `form` calling `auth.api.*` on the
server, which is what keeps sign-in, sign-up, "Continue with Google" and sign-out working without
JavaScript — the same rule the rest of the app follows. The `sveltekitCookies` plugin writes the
cookies back through `event.cookies`, and it has to stay last in the plugin list.

### Where authorization actually lives

`src/hooks.server.ts` is convenience, not security. It hands remote requests straight to `resolve`,
for two reasons that are easy to miss:

- a remote `query` sends no `x-sveltekit-pathname` header, so SvelteKit never resolves a route and
  `event.route.id` is `null`;
- for the other kinds that header comes from the client, so a `curl` with
  `x-sveltekit-pathname: /login` would walk past any guard that branches on it.

So **every remote function starts with a call from `src/lib/server/guard.ts`** — `requireUser()`,
`requireOrg()` or `requirePermission()` — and nothing in `src/lib/remotes` touches `prisma` without
one. What is left in the hook is the part that makes the app pleasant: a signed-out visitor lands on
the login form and comes back to the page they wanted.

### Multi-tenancy

Tasks belong to an organization, never to a user. `requireOrg()` returns the active organization and
its id goes into every `where` clause, including the ones on `updateMany`/`deleteMany` — a task id on
its own never identifies a row, so a foreign id reads as "this no longer exists" instead of writing
to somebody else's data.

One subtlety: `getTasks` takes the organization id as an _argument_ even though the server ignores it.
A remote query is cached by `(function, arguments)`, so without it the list would answer out of the
previous organization's cache after a switch. It is a cache key, not an authorization argument.

### Images

`src/lib/server/upload.ts` runs every upload through [sharp](https://sharp.pixelplumbing.com) and
writes a WebP in exactly the size its preset prescribes — so an avatar is 256×256 whether it arrived
as a phone photo or a screenshot. The presets live in `config.json`, and `PresetName` makes a typo a
type error rather than a 500.

Files go to `UPLOAD_DIR`, which has to sit **outside** the app directory or a deployment wipes it; on
Railway that means a mounted volume, e.g. `/data/uploads`. They are served by
`src/routes/uploads/[...path]/+server.ts` rather than as static assets, which is also where the
path-traversal check and the session gate (`uploads.requireSession`) live.

### Email

`src/lib/server/mail.ts` wraps [Resend](https://resend.com). Every message is the same shape — a
heading, a line or two, and one button — so the call sites stay two lines and no message drifts away
from the others. Without `RESEND_API_KEY` the message is printed to the terminal instead.

### Configuration

Three files, and the split matters:

| File                         | Holds                                                                                | Reaches the browser |
| ---------------------------- | ------------------------------------------------------------------------------------ | ------------------- |
| `src/lib/config.json`        | What the app is called and says: name, logo icon, navigation, marketing copy         | Yes                 |
| `src/lib/server/config.json` | Decisions: which providers are on, how long a session lasts, what an avatar measures | No                  |
| `src/env.ts`                 | Secrets, read from the environment                                                   | No                  |

The public half is imported as `$config` by components — the logo, the footer, the sidebar and
`PageTitle` all read it, so renaming the app is one line in one file. Put nothing in there that
should stay on the server; it ships in the client bundle.

The server half only says _whether_ a feature is on; `auth.ts` checks at startup that the matching
credentials actually exist and names the missing variable if they do not. It re-exports the public
`app` section, so server code reads `config.app.name` without caring which file it came from.

Both are parsed with zod at import, so a typo stops the app rather than surfacing as an empty
heading in production.

## Theming

Two daisyUI themes (`light`, `dark`) live in `src/lib/css/main.css`. `dark` is built from neutral greys rather than an inverted copy of `light` — a tinted dark surface makes everything on top of it look muddy. The active theme and the sidebar width are attributes on `<html>` (`data-theme`, `data-sidebar`), restored by an inline script in `app.html` before the first paint — a Svelte class would only land after hydration and flash the wrong theme. `theme-state.svelte.ts` and `sidebar-state.svelte.ts` own those attributes at runtime.

One asymmetry is deliberate: `neutral` is a _dark_ tone in `light` and a _light_ one in `dark`, so `btn-neutral` keeps contrasting against the surface instead of dissolving into it.

## Lists

Every list goes through `DataTable` — the dashboard activity log, the members, the invoices and the task list. It owns the chrome (scrolling, header row, sort links, row hover, anchor targets); the page supplies the cells through a `row` snippet and the fallback through `empty`. Filtering follows one rule everywhere: the state lives in the URL, so a filtered view is shareable and survives a reload. `/crud` reads it back out of the database, `/members` filters a page-sized array in the browser — same contract, different source.

## Toasts

`toast.success('…')` from anywhere; the single `<Toaster />` in the root layout renders the stack through `Alert`, so a toast and an inline message never drift apart. See `src/lib/components/elements/toast-state.svelte.ts`.

## The `/crud` demo

Task list with search, filters, sorting and "load more" — the entire list state lives in the URL, so every view is shareable and works without JavaScript. It is the worked example of how a real feature sits in the app shell: `PageHeader` for the heading and its action, a `Card` around toolbar, table and pager, and `EmptyState` for both "nothing yet" and "nothing matches these filters". The pattern is reusable: a new listable model needs one config file next to `src/lib/helper/task.ts` and a remote query.

Icons resolve against `src/lib/components/elements/icons.ts` — add a re-export line there before using a new icon name.

`/components` shows every element with the props that produce each variant, and links to where each layout component can be seen in place.

## Testing

- **Unit tests** live next to what they test (`src/lib/helper/list.spec.ts` and friends) and run in
  the `server` Vitest project.
- **Component tests** are `*.svelte.spec.ts` files and run in real Chromium through the `client`
  Vitest project (browser mode).
- **Integration tests** live in `tests/integration/` with their own config
  (`vitest.integration.config.ts`). The global setup migrates and seeds a real Postgres, boots the
  production build on a random port, and the tests speak plain HTTP — covering the auth wall, the
  seeded workspace and the sign-up/verification gate end to end.
