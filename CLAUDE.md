# CLAUDE.md

Project conventions for theblackflagger.com. Read this before adding anything.

Visual system → [DESIGN.md](./DESIGN.md). Module map → [docs/codebase-summary.md](./docs/codebase-summary.md).
Deploy → [docs/deployment-guide.md](./docs/deployment-guide.md).

## Stack

Astro 7, static output. Tailwind CSS v4 running as a Vite plugin — **there is no
`tailwind.config.js`**; the theme lives in `src/styles/tailwind.css`. Node ≥ 22.

## What this repo is

**The hub.** It carries the studio brand — home, `/apps` gallery, `/about`,
`/blog` — and it hosts the small apps. It is not where a flagship app's marketing
site lives; that gets its own domain and its own repo. BlackFlare left for
[blackflare.dev](https://blackflare.dev) on 2026-07-21 and is the reference case.

## The hosted-vs-linked law

This is the governing architectural rule. Every app is one of two shapes:

| | App with its own domain | Small app, inline |
|---|---|---|
| Marker | `website` in its front matter | no `website` |
| This hub renders | the gallery card, nothing else | card + `/<slug>` + `/<slug>/privacy` |
| Card links to | that domain | `/<slug>` |
| Docs, blog, contact, privacy | on its own site | no docs; privacy at `/<slug>/privacy` |
| Adding one | new repo, seeded from this one | drop a `.md` in `content/apps/` |

**An app with `website` gets no inline page here.** `getStaticPaths` in both
`[slug].astro` and `[slug]/privacy.astro` filters on `!app.data.website`. That is
deliberate: two pages describing one app compete with each other in search, and
the one on the app's own domain should win.

**There are no bespoke landings in this repo.** `/<slug>` is one shared template
for every inline app. If an app has outgrown that template, it has outgrown this
repo — spin it out (see below), don't hand-write a page here.

### Spinning an app out

1. Copy this repo's working tree into a sibling directory (not a clone — much of
   the tree may be uncommitted) and `git init` it.
2. Strip the hub-only parts: the `apps` and `privacy` collections,
   `src/components/apps/`, `src/lib/apps.ts`, `/apps`, `/about`, `[slug]*`.
3. Add `src/lib/site.ts` for the identity the `apps` collection used to supply.
4. Point `site` in `astro.config.mjs`, `public/CNAME`, and `public/robots.txt` at
   the new domain.
5. Back here: add `website:` to the app's front matter and delete anything of its
   that remains beyond `public/apps/<slug>/icon.png`.

`tokens.css`, `tailwind.css`, `BaseLayout.astro`, `Sunrise.astro`, `reveal.ts`
and `email-obfuscation.js` are **copied, not shared** — this repo is canonical
and the copies are synced by hand. Two consumers do not justify a package. At a
third, extract one.

## Adding an app

**Small app, hosted here:**

1. Create `src/content/apps/<slug>.md` with the front matter from
   `src/content.config.ts` — including `support`, which is what makes the App
   Store's required Support URL exist.
2. Drop `public/apps/<slug>/icon.png` (gallery card) and any
   `public/apps/<slug>/screenshotN.png` (gallery on the detail page).
3. Optionally add `src/content/privacy/<slug>.md` → `/<slug>/privacy`. The App
   Store requires a Privacy URL, so anything you submit needs this file. The
   Support block links it only when it exists.

That is all. `/<slug>` generates itself.

**App with its own domain:** add `website:` and stop. Do not create a privacy
file, do not add screenshots — that content belongs on its site.

Visibility flags:

| Flag | Effect |
|---|---|
| `draft: true` | Excluded from the gallery **and** from route generation — no `/<slug>`, no `/<slug>/privacy`. Genuinely unpublished. |
| `isUnlisted` / `isArchived` | Hidden from the gallery only; the page still builds |
| `comingSoon: true` | Gallery card becomes a non-clickable teaser (monogram placeholder, no icon or detail page needed) |

**No page yet → `comingSoon: true`.** That is what prevents a dangling link.

## Adding a blog post

Drop `src/content/blog/<slug>.md` → served at `/blog/<slug>`. Filename is the URL
slug. Requires `title`, `pubDate`, `description`; `tags` and `heroImage` optional.

The blog here is the **studio's** voice — what we're building and why. An app's
release notes belong on that app's own site.

## Download buttons

Distribution is described by each app's `stores` array — `{ type, url }` entries
in front matter. `DownloadButtons` + `getDownloadOptions()` (`src/lib/apps.ts`)
resolve them into the right widget on `/<slug>`.

```yaml
isPaid: true
stores:
  - type: app-store   # official "Download on the App Store" badge
    url: https://apps.apple.com/app/id1234567890
  - type: setapp      # official "Download on Setapp" badge
    url: https://go.setapp.com/...
  - type: gumroad     # button: "Buy on Gumroad" (paid) / "Download on Gumroad" (free)
    url: https://gum.co/xyz
  - type: direct      # button: "Download" (paid) / "Download for Free" (free)
    url: https://.../MyApp.zip
```

- List as many as apply — **badges render before buttons** (stable sort), so Apple
  and Setapp lead as those programs expect.
- `isPaid` decides the wording of button-style stores only.
- `links` is for **secondary** links only (Source, Docs, Changelog), shown under
  the download row. It is not for download actions.
- An app with a `website` never renders these — its own site owns the download.

**Adding a channel takes three edits:**

1. the `z.enum` in `src/content.config.ts`
2. the `StoreType` union in `src/lib/apps.ts` — it is hand-written and **not**
   derived from the Zod enum, so widening one does not widen the other
3. a case in `getDownloadOptions`

The `never` exhaustiveness guard only fires once step 2 is done. And it surfaces
under **`npx astro check`, not `astro build`** — Astro transpiles TypeScript with
esbuild and does not typecheck, so a miss builds clean. Run check before pushing.

## Screenshots

Convention: `public/apps/<slug>/screenshotN.{jpg,png,webp}`, consumed by
`AppGallery` on `/<slug>`. Numbering is positional and need not start at 1 —
they are natural-sorted.

Resolved from disk at build time by `getScreenshots()`, so they stay out of the
schema. Intrinsic dimensions are read via `image-size` so `<img>` gets explicit
width/height (no layout shift) and PhotoSwipe gets the `data-pswp-width/height`
it requires.

## Contact addresses

Never write an email address as plaintext in a template. `src/scripts/email-obfuscation.js`
assembles it in the browser from a base64 string, filling `#secure-contact` /
`#secure-text`. `[slug].astro`'s Support block is the pattern to copy. A build
that ships the address in the HTML has defeated the point — grep `dist/` if
you're unsure.

## Routing gotcha

`build.format: "file"` emits flat files (`/apps.html`, `/<slug>.html`,
`/<slug>/privacy.html`) so URLs without a trailing slash serve directly on both
hosts. `/<slug>.html` and `/<slug>/privacy.html` are siblings and never collide.

**Consequence:** at build time `Astro.url.pathname` ends in `.html`, and the home
page is `/index.html`. Anything that compares paths must normalize first — see the
canonical/OG logic in `BaseLayout.astro` and the active-nav check in
`Header.astro`. Forgetting this produces a nav where nothing is ever marked active.

`[slug].astro` can only ever claim slugs that exist in the `apps` collection, so
it will never shadow `/about` or `/apps`.

## Doc-update triggers

Docs rot when nobody knows they went stale. When you do the thing on the left,
update the thing on the right **in the same change**:

| When you… | Update |
|---|---|
| change a value in `src/styles/tokens.css` | the `@theme` mirror in `tailwind.css`, the token table in `DESIGN.md`, **and the copy in every spun-out app repo** |
| spin an app out to its own domain | its front matter `website:`, this file's reference case, `docs/codebase-summary.md`, and `DESIGN.md`'s deviation table |
| add, rename, or remove a route/page | `docs/codebase-summary.md` route table |
| add or remove a top-level dir under `src/` | `docs/codebase-summary.md` module map |
| add a `StoreType` | the `z.enum` in `content.config.ts`, the `StoreType` union in `lib/apps.ts`, a case in `getDownloadOptions`, and the Download buttons section above — then run `npx astro check` |
| change deploy host, workflow, or DNS | `docs/deployment-guide.md` |
| resolve a row in DESIGN.md's Known deviations | strike the row, note the date |
| change a script in `package.json` | the commands table in `README.md` |

## Known issues

Flagged, deliberately not fixed. Don't "discover" these again:

- **`z` from `astro:content` is deprecated** in Astro 7 (`astro check` → ts(6385),
  emitted as hints not errors). Prefer importing `zod` directly next time
  `src/content.config.ts` is touched.
- **`src/content/privacy/` holds no policies yet.** The collection, the route and
  the Support-block link all work — verified with a temporary fixture — but the
  only two apps here are BlackFlare and PowerMode (each on its own domain, with
  its own policy). Write the first real one when the first small app
  ships; do not write one speculatively for an app whose behaviour isn't final.
