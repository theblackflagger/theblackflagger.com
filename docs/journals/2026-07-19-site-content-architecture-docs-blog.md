# Site Content Architecture: Bespoke Landings + Templated Docs/Blog

**Date**: 2026-07-19
**Severity**: Medium
**Component**: Content architecture (`src/pages`, `src/content`, collections, `.prose-app`)
**Status**: Resolved

## What Happened

Split the site's content into two clearly separated shapes behind one governing
rule: **bespoke = hand-authored `.astro`; templated (docs/blog) = Markdown
collection + one shared renderer.** Concretely, over five phases:

1. Added `docs` + `blog` content collections to `content.config.ts` (the `apps`
   schema untouched) and extracted the old inline app-detail prose into a real
   `.prose-app` component class in `tailwind.css`, extended to the full Markdown
   element set.
2. Ported the standalone `./blackflare/` demo into a bespoke
   `src/pages/blackflare.astro` at `/blackflare`, wired into the shared chrome
   (AppLayout → Header/Footer/Sunrise/GSAP reveal). **Deleted the uniform
   `src/pages/[slug].astro`.**
3. Built the templated docs system: `DocsLayout` + auto-generated sidebar +
   prev/next, `[app]/docs/{index,[...slug]}` routes whose `getStaticPaths` derive
   the app from the docs folder ∩ the apps collection.
4. Upgraded `blog.astro` to a collection listing + `blog/[slug].astro` post view
   with `PostCard`/`TagList`.
5. Full verify + deploy-parity gate.

Build: `astro check` 0 errors, `npm run build` → 10 pages, exact intended route
set.

## The Brutal Truth

This one went cleanly — no race conditions, no rework. The risk wasn't bugs, it
was **quiet breakage from deletion**: removing `[slug].astro` is the kind of edit
that 404s a live app if you're wrong about what it generates. The plan had
already proven it safe (only `/blackflare` was non-coming-soon, and it gets a
bespoke page; `blackbar` is a non-clickable `comingSoon` teaser), and the build's
route inventory confirmed it. The one genuinely satisfying side effect: deleting
`[slug].astro` orphaned `AppGallery`, which was the **only** importer of
`gallery.ts` → PhotoSwipe/Embla (~30KB+) now no longer bundles at all. Verified
by JS inventory: the whole site ships exactly one JS chunk (the shared GSAP
reveal). Less code, not more.

## Technical Details

**Folder-per-app docs derivation** (`src/lib/docs.ts`): glob-loader entry id is
`"<app>/<slug>"`. `appOf`/`slugOf` split it; the app is derived, never stored in
front matter. `getAppDocs` filters non-draft + empty-slug and sorts by `order`;
`groupDocs` buckets by `group` (ungrouped last). All three consumers (both routes
+ sidebar) go through these helpers, so ordering lives once.

**Route-generation guards** (`[app]/docs/*`): `getStaticPaths` intersects docs
folders with `apps` collection ids (rejects `/about/docs`, `blackbar/docs`) and
never emits an empty slug (that path belongs to `index.astro`, not the rest
route). Overview is a static listing, **not** a redirect — deterministic,
zero-JS, no meta-refresh/canonical quirks.

**Page-scoped accent** (`blackflare.astro`): the site is monochrome, but a landing
may declare one icon-derived accent. BlackFlare's amber `--flare*` set is hosted
on a single `.bf-page` wrapper inside the Astro-scoped `<style>` — it inherits to
every section yet never touches `tokens.css`. Verified: 0 `--flare` occurrences
in the shared stylesheet; only `/blackflare.html` links the scoped sheet. Shared
structural vars (surface/border/text/font/ease) resolve from `tokens.css` and are
never redefined.

**Scoped-CSS hygiene on the port**: dropped the demo's global reset/`body`,
sunrise, header, footer, finale zone, `:focus-visible`/`::selection` overrides,
and its own IntersectionObserver reveal CSS (kept only `data-reveal`; the site's
GSAP `reveal.ts` + the no-JS/reduced-motion guard handle it). Renamed the demo's
`.faq` → `.bf-faq` so the global `.faq ::details-content` height animation
doesn't double-apply.

**`.prose-app` beats preflight**: placed under `@layer components`, so its
`list-style`/margins win over Tailwind's base preflight regardless of the
`:where()` zero-specificity selectors used for easy override.

## What We Tried

Implemented directly against the phase plan (no research needed — the plan
encoded the scout). Verified with `astro check` + `npm run build`, then a
scratch-dir build to inventory routes, JS chunks, internal links, canonical/OG,
sitemap, and CNAME (the repo's `.ckignore` blocks Bash access to `dist`, so the
inspection copy went to a non-blocked path — identical artifact, different
location).

## Lessons Learned

1. **Deletion is a feature when it prunes a dependency graph.** Removing one
   template dropped a 30KB+ third-party lightbox from every page because it
   severed the only import path. Worth checking "what stops bundling?" after any
   route/component deletion, not just "what breaks?".

2. **Centralize the invariant, not just the happy path.** Code review caught that
   the empty-slug guard lived only in the route generator, not in the shared
   `getAppDocs` helper — a latent broken link if a doc were ever placed at the
   collection root. Moving the guard into the helper made the sidebar, prev/next,
   and overview all consistent with the generated route set by construction.

3. **Page-scoped accents want a host element, not `:root`.** Astro leaves `:root`
   global, so putting `--flare*` there would leak site-wide. Hosting them on a
   wrapper class keeps the accent inheriting to the whole page while staying
   provably scoped (greppable, single-sheet).

## Next Steps

- Entire `feat/v2-redesign` branch is still uncommitted (the v2 rewrite lives as
  untracked files); per the user's call, this work stays uncommitted to be shipped
  with v2 as one cohesive unit (after a `.gitignore` + pruning scratch dirs like
  `v2/`, `text.txt`, `screenshot/`).
- Follow-ups, out of scope here: real BlackFlare store URLs (badges auto-wire from
  `stores` metadata — new-tab `target`/`rel` already conditional), real docs/blog
  content, MDX + RSS when volume justifies, and cleanup of the `./blackflare/`
  demo folder (kept as the port source).
- Reusable-but-orphaned components (`AppGallery`, `DownloadButtons`, `RelatedApps`,
  `gallery.ts`) intentionally left for future bespoke/uniform pages.

## Update — /blackflare became a pixel-identical standalone clone

Same session, user feedback: the first port wrapped the demo in the site's shared
chrome (AppLayout → site Header/Footer/Sunrise, GSAP reveal, a page-scoped
`--flare` accent on `.bf-page`, `.faq`→`.bf-faq` rename, metadata-driven hero via
`getEntry`). Visually it did **not** match the `./blackflare/` demo — different
header, footer, sunrise, finale, layout width.

Reworked `src/pages/blackflare.astro` into a **verbatim standalone clone**: it no
longer uses AppLayout/Header/Footer/site-Sunrise/GSAP. It reproduces the demo's
own markup (its header, footer, ambient sunrise, finale zone), imports
`src/styles/blackflare-landing.css` (a verbatim copy of the demo's `styles.css`,
imported only here so its `:root`/`body`/`--flare` globals never reach other
pages), and runs the demo's own IntersectionObserver reveal inline. A proper SEO
`<head>` (canonical/OG) sits on top — invisible, so identity holds. Asset URLs are
the only remap (`./assets/*` → `/apps/blackflare/*`, badges → `/assets/*`).

**Verified pixel-identical**: headless Chrome, 1440px, full-page (8016px tall),
`magick compare -metric AE` = **0 differing pixels** vs the demo. Two whitespace
bugs surfaced and were fixed along the way — Astro trims newline-whitespace between
a text node and an inline element, collapsing the footer's `_ @handle` space and
the colophon's `•` separator gaps; forcing explicit `{" "}` restored them. (A
demo-vs-demo baseline capture returned AE=0, confirming the harness is
deterministic and the diffs were real, not animation-phase noise.)

Trade-off the user accepted: `/blackflare` no longer shows the site's global nav
(Apps/About/Blog) — it carries the demo's own header/footer instead, which is what
"identical to the demo" requires.

---

**Status**: DONE
