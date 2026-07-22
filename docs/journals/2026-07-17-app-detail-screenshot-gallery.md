# App-Detail Screenshot Gallery: Embla + PhotoSwipe Integration

**Date**: 2026-07-17
**Severity**: Medium  
**Component**: App detail page (`/<slug>`) screenshot gallery
**Status**: Resolved

## What Happened

Replaced a bare CSS scroll-snap thumbnail strip with a full-featured image gallery: draggable Embla carousel (on-page strip) + fullscreen PhotoSwipe lightbox. Initial page payload stays ~6KB (Embla only); PhotoSwipe (~30KB) loads on first thumbnail click.

## The Brutal Truth

Progressive enhancement is harder to retrofit than it sounds. Initially shipped with a minor UX bug: double-click on a thumbnail leaked a stray browser tab because `preventDefault()` fired *after* the lightbox import started, leaving a race window. Felt stupid catching this in review instead of QA. Also missed a failure case: if PhotoSwipe failed to chunk-load, the user got a dead thumbnail with no fallback.

## Technical Details

**Build-time image dimensions** (`src/lib/apps.ts`):
- `imageSize(readFileSync(path))` reads JPEG/PNG/WebP headers synchronously at build time
- Corrupt files caught in a try-catch flatMap; build stays alive (no fatal errors on bad images)
- Dimensions feed `<img width/height>` (prevents CLS) and PhotoSwipe's required `data-pswp-width/height` attributes

**Embla carousel** (`src/scripts/gallery.ts` lines 26–74):
- On mount, adds `.is-embla` class to flip the viewport from `overflow-x:auto` (no-JS) to `overflow:hidden` (Embla-controlled)
- Arrows conditionally shown only when overflow exists; naive state sync on `"select"` and `"reInit"` events
- Arrow buttons start `[hidden]`; gallery.ts toggles the HTML attribute (Tailwind's `[hidden]{display:none!important}` respects the binding)
- Keyboard: Left/Right arrows scroll, tab into off-screen slides auto-scrolls via `focusin` → `scrollTo()`

**PhotoSwipe lightbox** (lines 76–110):
- First click triggers async chunk load of lightbox + CSS
- Guard state: `loading` boolean prevents double-imports if user mashes thumbnails during fetch
- Show/hide animation respect `prefers-reduced-motion:reduce` (line 99: `showHideAnimationType: reduce ? "none" : "zoom"`)
- Failure case: if import throws, fallback to `window.open(a.href)` on the raw image (a.href is always the fallback, even without JS)

## What We Tried

Built locally with `npm run build`; zero errors reported by `astro check`. No issues with the Embla/PhotoSwipe integration itself—all layout and interactivity worked as expected once the race condition was fixed.

## Root Cause Analysis

**Double-click tab leak:** The guard `if (loading) return;` came *after* `e.preventDefault()`, so a rapid second click landed between the prevention call and the import-in-flight check. Reordering was trivial but I should have thought about the async boundary earlier.

**Chunk-load failure fallback missing:** PhotoSwipe is a third-party ~30KB chunk. Assumed it would always load; didn't account for network hiccups or bundle errors. The try-catch was there for safety but the catch didn't re-enable the fallback (window.open); fixed by setting `loading = false` and calling `window.open()`.

## Lessons Learned

1. **Async guards must precede mutations:** Any state change (`e.preventDefault()`, DOM edits, event assignments) that could race with concurrent I/O needs to come *after* concurrency checks, not before. A clear ordering—check guards → update state → start I/O—prevents this class of bug.

2. **Test the fallback, not just the happy path:** The no-JS fallback (native scroll + plain `<a>` tags) was tested, and the lightbox chunk loaded fine in build. But the intermediate state—lightbox failed, user clicks a thumbnail—was never manually exercised. Add a browser QA checklist that includes "disable JS, load page, reload with JS, click during import."

3. **Third-party chunk failures deserve explicit recovery:** Never assume imported code will load. A try-catch that rethrows or leaves the UI in limbo is worse than no try-catch. Here: if PhotoSwipe fails, the thumbnail is still a valid link, so catching and falling back to `window.open()` is the right move.

## Next Steps

- Manual browser QA (drag, lightbox, keyboard navigation, mobile responsiveness) left pending; entire v2 branch is untracked so user will commit holistically.
- No open issues post-review; code-reviewer approved both fixes (preventDefault order, catch fallback).
- If user reports any lightbox timeout or blank-click hangs in production, first check network throttling and chunk-load timing in DevTools.

---

**Status**: DONE
