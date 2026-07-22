# Codebase Summary

Where things live and how data flows. Conventions → [CLAUDE.md](../CLAUDE.md).
Visual system → [DESIGN.md](../DESIGN.md).

## Build configuration

Set in `astro.config.mjs`:

| Setting | Value | Why |
|---|---|---|
| `output` | `static` | Fully prerendered; `dist/` is portable across hosts |
| `site` | `https://theblackflagger.com` | Absolute canonical + OG URLs |
| `trailingSlash` | `never` | Canonical links stay consistent on both hosts |
| `build.format` | `file` | Extension-less URLs serve without a host-level redirect. Has a path-comparison consequence — see [CLAUDE.md](../CLAUDE.md#routing-gotcha) |
| `devToolbar` | disabled | — |
| integrations | `@astrojs/sitemap` | — |
| vite plugins | `@tailwindcss/vite` | Tailwind v4 runs as a Vite plugin |

## Module map

```
src/
  layouts/      BaseLayout · AppLayout
  components/   Header · Footer · Sunrise
                apps/   AppCard AppsGrid AppFilter
                        AppGallery DownloadButtons RelatedApps
                blog/   PostCard TagList
  pages/        routes (see table below)
  content/      apps/*.md · privacy/*.md · blog/*.md
  lib/          apps.ts
  scripts/      reveal.ts · gallery.ts · email-obfuscation.js
  styles/       tokens.css · tailwind.css
  content.config.ts
public/
  apps/<slug>/  icon.png + screenshotN.{jpg,png,webp}
  assets/       download-on-{app-store,setapp}-badge.svg
  CNAME · robots.txt · og-default.png
```

Everything under `components/apps/` renders again as of 2026-07-21: the restored
`[slug].astro` imports `AppGallery`, `DownloadButtons` and `RelatedApps`, which
also puts `scripts/gallery.ts` back on a real page.

### Layouts

Two tiers.

- **`BaseLayout`** — `<head>`, SEO, canonical + OG/Twitter, inline SVG favicon,
  the pre-paint reveal guard, `<Sunrise>`, and the `reveal.ts` import. Imports
  `tokens.css`. Everything that renders through Astro passes through here.
- **`AppLayout`** — chrome for content pages. Wraps `BaseLayout`, imports
  `tailwind.css`, adds shared `Header`/`Footer` and a `max-w-7xl` main column.
Every page in this repo goes through both. There is no page that bypasses the
chain — the one that did (`blackflare.astro`) left for its own repo.

## Routes

5 pages as of 2026-07-21 — the two `[slug]` routes generate nothing yet, because
the only two apps are BlackFlare (its own domain) and BlackBar (`comingSoon`).

| URL | Source | Generation |
|---|---|---|
| `/` | `pages/index.astro` | static |
| `/about` | `pages/about.astro` | static |
| `/apps` | `pages/apps/index.astro` | static |
| `/blog` | `pages/blog.astro` | static (collection listing) |
| `/blog/<slug>` | `pages/blog/[slug].astro` | `getStaticPaths` over `blog` |
| `/<slug>` | `pages/[slug].astro` | `getStaticPaths` over apps **without** `website`, non-draft, non-comingSoon |
| `/<slug>/privacy` | `pages/[slug]/privacy.astro` | `getStaticPaths` over `privacy` ∩ inline apps |

Removed 2026-07-21 with the BlackFlare split: `/docs`, `/blackflare`,
`/<app>/docs`, `/<app>/docs/<slug>`. Those URLs now 404 by decision — the site
was new and the traffic negligible.

## Content collections

Defined in `src/content.config.ts`, all loaded via `glob` from `src/content/`.

| Collection | Base | Entry id | Notes |
|---|---|---|---|
| `apps` | `src/content/apps` | `<slug>` | Images live outside the schema by convention. `website` decides hosted vs linked |
| `privacy` | `src/content/privacy` | `<slug>` | Pairs with an app of the same id → `/<slug>/privacy`. Empty today |
| `blog` | `src/content/blog` | `<slug>` | See [CLAUDE.md](../CLAUDE.md#adding-a-blog-post) |

## Data flow

```
Markdown front matter
  → content.config.ts  (Zod schema validates at build)
  → lib/ helper        (derive, sort, group, resolve from disk)
  → component          (AppCard, DownloadButtons, AppGallery, …)
  → page               (static or getStaticPaths)
```

Nothing runs at request time — every page is prerendered.

## `lib/`

**`apps.ts`** — everything about how an app is presented:
- `STORE_LABELS` / `STORE_FILTERS` — branded store names for cards, chips, and the
  gallery filter. `direct` is intentionally absent: it's a plain download, not a
  storefront, so it never renders as a tag or filter.
- `getDownloadOptions(stores, isPaid)` — resolves the `stores` array into ordered
  download widgets. The contract and how to extend it live in
  [CLAUDE.md](../CLAUDE.md#download-buttons).
- `getScreenshots(slug)` — reads `public/apps/<slug>/` at build and returns
  natural-sorted entries with intrinsic dimensions. Missing folder → empty;
  unreadable file → skipped. Never throws, so a bad image can't break the build.
  Naming convention in [CLAUDE.md](../CLAUDE.md#screenshots).

`docs.ts` was deleted 2026-07-21 — its docs system moved to blackflare.dev.

## `scripts/`

- **`reveal.ts`** — GSAP scroll reveal for `[data-reveal]`. Imported by `BaseLayout`.
- **`gallery.ts`** — screenshot gallery behavior, two progressive-enhancement
  layers over the static markup in `AppGallery.astro`: Embla upgrades the
  scroll-snap strip to a draggable carousel; PhotoSwipe is dynamically imported
  **only on first thumbnail click**, keeping the viewer off the initial load. If
  either fails, the strip degrades to a plain scroll container. Reachable only
  through `AppGallery`, which `[slug].astro` imports.
- **`email-obfuscation.js`** — assembles the contact address at runtime from
  base64, so the plaintext address never appears in served HTML. `atob` is a
  runtime call the bundler can't constant-fold, so it survives minification.

## `styles/`

Roles only — the visual meaning of each token is DESIGN.md's.

| File | Role |
|---|---|
| `tokens.css` | Source of truth: palette, fonts, motion. Imported by `BaseLayout` |
| `tailwind.css` | `@theme` mirror of tokens, base layer, `.btn-vibrancy`, `.prose-app` |

Two files, and `tokens.css` is the only place any token is declared. Both are
**copied** into each spun-out app repo, with this one canonical — see
[CLAUDE.md](../CLAUDE.md#spinning-an-app-out).

## Repository notes

`.gitignore` excludes `plans/` and `.claude/` — planning and brainstorm history is
**local-only and does not survive a clone**. `docs/` and the root Markdown files
are the durable record.
