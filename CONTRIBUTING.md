# Contributing

Thanks for considering it — this template gets better by being used to build
real products, and the rough edges you hit are exactly what belongs in an
issue or PR.

## Dev setup

You need [bun](https://bun.sh) and a Postgres (`bunx prisma dev` starts a local
one if you have none):

```sh
bun install
cp .env.example .env   # DATABASE_URL, BETTER_AUTH_SECRET, BETTER_AUTH_URL
bun run db:migrate
bun run db:seed        # sign in as owner@example.com / demo-password
bun run dev
```

## Before you open a PR

Run what CI runs:

```sh
bun run lint           # prettier + eslint (bun run format fixes most of it)
bun run check          # svelte-check
bun run test           # unit + browser component tests
bun run build && bun run test:integration   # HTTP tests against the real build
```

A few ground rules, in the order they usually matter:

- **Follow the existing patterns.** [AGENTS.md](AGENTS.md) is the condensed
  contract (it applies to humans too), [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
  the reasoning. New data paths are remote functions with a guard; new UI reuses
  the elements in `src/lib/components/elements/`.
- **Keep PRs focused.** One fix or one pattern per PR reviews quickly; a grab
  bag doesn't.
- **Schema changes ship as migrations** (`bun run db:migrate`), never as edits
  to committed migration files.
- **Add a test where it pays off** — a unit test for a helper, an integration
  test for anything touching auth or tenancy.
- All code, comments and identifiers are in English.

## Ideas that would make good contributions

- Another OAuth provider wired through `config.json`.
- A real billing integration (Stripe) replacing the demo plans.
- An S3-compatible target for `src/lib/server/upload.ts`.
- More list configs and `/crud`-style examples.
- Accessibility passes over the component library.
- Docs: anything you had to figure out the hard way.

Not sure whether something fits? Open an issue and ask — a short description of
what you ran into is enough.
