# Deployment

The app builds with [`@sveltejs/adapter-node`](https://svelte.dev/docs/kit/adapter-node): `bun run build` produces `build/`, and `node build/index.js` (or `bun ./build/index.js`) serves it. Any platform that runs a Node server and offers Postgres works; Railway is the documented path.

## Railway

[![Deploy on Railway](https://railway.com/button.svg)](https://railway.com/new/template?template=https%3A%2F%2Fgithub.com%2Ftguelcan%2Ftstack)

[`railway.json`](../railway.json) is config-as-code for the service: it builds with
`bun run build`, runs `bunx prisma migrate deploy` as the pre-deploy step (so every deployment
applies pending migrations before it starts) and serves with `bun ./build/index.js`, health-checked
on `/`.

### Step by step

1. Create a project from this repo (button above, or **New → GitHub repo** on your fork).
2. Add a **Postgres** database to the project.
3. Set the service variables:

   | Variable             | Value                                                                                   |
   | -------------------- | --------------------------------------------------------------------------------------- |
   | `DATABASE_URL`       | `${{Postgres.DATABASE_URL}}`                                                            |
   | `BETTER_AUTH_SECRET` | output of `openssl rand -base64 32`                                                     |
   | `BETTER_AUTH_URL`    | `https://${{RAILWAY_PUBLIC_DOMAIN}}` — email links are built from it                    |
   | `ORIGIN`             | same value, for `adapter-node`'s CSRF check                                             |
   | `UPLOAD_DIR`         | the volume mount path, e.g. `/data/uploads`                                             |
   | `RESEND_API_KEY`     | your [Resend](https://resend.com) key — without it no verification email leaves the box |

4. **Attach a volume** to the service and mount it at `/data`. Anything written inside the app
   directory is gone on the next deployment, along with every avatar and logo — `UPLOAD_DIR` must
   point at the volume.
5. Deploy. The pre-deploy step runs the migrations; the seed is **not** run in production.

### Notes

- **`sharp`** is a runtime dependency, not a dev one — `adapter-node` resolves it from
  `node_modules` at runtime, and it ships prebuilt binaries as platform-filtered optional
  dependencies. If a deployment ever reports
  `Could not load the "sharp" module using the linux-x64 runtime`, the lockfile was written on a
  machine that never saw the Linux entries; installing without `--frozen-lockfile` on the build
  machine fixes it.
- **Migrations, not `db push`** — production only ever runs `prisma migrate deploy`
  (`bun run db:deploy`), which applies the committed migration files and nothing else.
- **OAuth callbacks** — when enabling Google/GitHub in `src/lib/server/config.json`, register
  `<origin>/api/auth/callback/google` and `…/callback/github` with the providers and set the
  credentials as environment variables.

## Other platforms

Nothing here is Railway-specific: provide the same environment variables, run
`bunx prisma migrate deploy` as a release step, keep `UPLOAD_DIR` on persistent storage, and serve
`build/index.js`. For serverless targets you would swap `adapter-node` for the matching adapter
and move uploads to object storage — the upload module (`src/lib/server/upload.ts`) is the single
place that writes to disk.
