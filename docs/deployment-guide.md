# Deployment Guide

`dist/` is a portable static bundle. The same output deploys to two hosts from
this one repo.

Build settings live in [docs/codebase-summary.md](./codebase-summary.md).

## Dual-host model

### Cloudflare Pages — primary

Connected through the Cloudflare dashboard, not a config file in this repo.

| Setting | Value |
|---|---|
| Build command | `npm run build` |
| Output directory | `dist` |
| Node version | 22 |

Preview deploys are created per pull request. The root domain
`theblackflagger.com` points here.

### GitHub Pages — mirror

`.github/workflows/deploy.yml` builds and deploys on push to `main`, plus
`workflow_dispatch` for manual runs. Build is `withastro/action@v3` at Node 22;
deploy is `actions/deploy-pages@v4`.

- Permissions are least-privilege: `contents: read`, `pages: write`, `id-token: write`
- Concurrency group `pages` with `cancel-in-progress: false` — one deploy at a
  time, and an in-flight deploy is never killed by a newer push
- `public/CNAME` carries the custom domain into the built output

## Only one host serves the domain at a time

DNS currently points the root domain at **Cloudflare Pages**. The GitHub Pages
workflow still runs on every push to `main`, which keeps the mirror warm and
build-ready — it just isn't the one answering for the domain.

**To switch hosts:** repoint DNS at the GitHub Pages target. The `CNAME` file and
the workflow are already in place, so **no code change is required.** Switching
back is the same operation in reverse.

## Before you deploy

Run locally, in order:

```bash
npx astro check   # expect 0 errors (hints/warnings are known — see CLAUDE.md)
npm run build     # expect the route set in docs/codebase-summary.md
npm run preview   # serve dist/ and click through
```

`npm run preview` matters more than usual here: the flat-file build format (see
[CLAUDE.md](../CLAUDE.md#routing-gotcha)) means dev and production resolve URLs
differently, so a link that works under `npm run dev` can still 404 in the built
output. Preview exercises the real thing.

## Multi-domain model

Each site is its own repo, its own Cloudflare Pages project, and its own domain.
They share a deploy shape, not infrastructure:

| Repo | Domain | Deploy |
|---|---|---|
| `theblackflagger.com` | theblackflagger.com | Cloudflare Pages (primary), GitHub Pages (mirror) |
| `blackflare.dev` | blackflare.dev | same setup, seeded from this repo |

A new app site is configured exactly like this one — build `npm run build`,
output `dist`, Node 22, `public/CNAME` set to its own domain, and
`public/robots.txt` pointing at its own sitemap. Nothing in this repo needs to
change when one is added except the app's `website:` front matter.

Each domain serves its own sitemap; there is no combined index, and none is
wanted — they are separate properties as far as search engines are concerned.
