# Design System

The visual standard for theblackflagger.com. **This document is prescriptive** —
where the codebase disagrees with it, the codebase is wrong and the gap is logged
under [Known deviations](#known-deviations).

Conventions and routing rules live in [CLAUDE.md](./CLAUDE.md). Where code lives
is [docs/codebase-summary.md](./docs/codebase-summary.md).

## Design language

**macOS Minimal Dark.** Monochrome — black, white, gray — on a dark canvas. Flat
surfaces, hairline borders, generous space. Type is the OS system stack (SF Pro /
SF Mono on Apple, graceful fallback elsewhere), so **no font files ship**.

Restraint is the point. Color is reserved for a single per-app accent; everything
else earns attention through spacing and contrast.

## The one-token-source rule

**Every color, font, and motion value derives from `src/styles/tokens.css`.**

Tokens reach the page two ways:

1. As plain CSS custom properties — `tokens.css` is imported globally in
   `BaseLayout.astro`.
2. Mirrored into Tailwind's theme via `@theme` in `src/styles/tailwind.css`, so
   utilities (`bg-surface`, `text-secondary`, `border-border`, `font-mono`)
   resolve from the same palette.

**The mirror is hand-maintained. Changing a token means editing both blocks.**
There is no build step that keeps them in sync — a value changed in one place and
not the other is a silent bug.

**No page may declare its own base palette.** A page that needs a new color adds
an *accent*, it does not redefine `--bg`, `--surface`, `--text`, or the border and
text ramps.

## Tokens

Values are authoritative as of 2026-07-20; source is `src/styles/tokens.css`.

### Surfaces

| Token | Value | Use |
|---|---|---|
| `--bg` | `#0a0a0a` | Page canvas |
| `--surface` | `#151515` | Cards, code blocks, raised panes |
| `--surface-hover` | `#1d1d1d` | Hover state for surfaces |

### Borders

| Token | Value | Use |
|---|---|---|
| `--border` | `rgba(255,255,255,0.08)` | Default hairline |
| `--border-strong` | `rgba(255,255,255,0.16)` | Emphasis, blockquote rule, hover |

### Text ramp

| Token | Value | Use |
|---|---|---|
| `--text` | `#f5f5f5` | Primary |
| `--text-secondary` | `#a3a3a3` | Body copy, nav at rest |
| `--text-tertiary` | `#7d7d7d` | Small mono labels, list markers |
| `--accent` | `#ffffff` | Buttons, active pills, links in prose, focus ring (site default) |

`--text-tertiary` contrast, measured 2026-07-20:

| Background | Ratio | WCAG AA (4.5:1) |
|---|---|---|
| `--bg` `#0a0a0a` | 4.81:1 | pass |
| `--surface` `#151515` | 4.44:1 | **marginal fail** |
| `--surface-hover` `#1d1d1d` | 4.10:1 | **fail** |

It is used at 10–12px, which is normal text — the large-text exemption does not
apply. **It passes on the page canvas only; every card surface is marginally
under AA.** Reaching 4.5:1 on `#1d1d1d` needs roughly `#848484`.

This is recorded, not silently tolerated — see [Known deviations](#known-deviations).
The source comment at `src/styles/tokens.css:24-25` still asserts the old
"~4.5:1 against both" claim and is wrong.

**Do not darken it** further to make labels recede — reduce size or spacing instead.

### Flare — the app accent

The one chromatic note in an otherwise monochrome system. A warm amber, originally
lifted from the BlackFlare app icon and **now the shared accent for every app
landing page.**

| Token | Value | Use |
|---|---|---|
| `--flare` | `#ff9d2e` | The accent. Emphasized words, active indicators, icon fills |
| `--flare-bright` | `#ffcf8a` | Highlight above the base — gradient tops, hover lift |
| `--flare-deep` | `#f47a1a` | Shadow below the base — gradient bottoms, pressed states |
| `--flare-glow` | `rgba(255,157,46,0.22)` | Ambient bloom behind an element. Never for text |

Contrast, measured 2026-07-20 — all three solid tones clear AA on every surface,
with room to spare:

| Token | on `--bg` | on `--surface` | on `--surface-hover` |
|---|---|---|---|
| `--flare` | 9.54:1 | 8.80:1 | 8.12:1 |
| `--flare-bright` | 13.71:1 | 12.65:1 | 11.68:1 |
| `--flare-deep` | 7.21:1 | 6.65:1 | 6.14:1 |

#### Where the accent is allowed

Amber marks **emphasis, never structure.** It carries meaning about *what to look
at*, so spending it on decoration devalues it.

**Every page except the home page** uses the accent. Home stays deliberately
monochrome — it is the one surface where the palette is the whole statement.

Sanctioned uses:

- A highlighted phrase inside a headline (`.flare-text`)
- Inline `em` / `strong` — the emphasis markers themselves
- Links in rendered prose (docs + blog), underline included
- List markers and the blockquote rule
- Icon fills, chips, and status indicators
- Active and hover state: filter chips, docs sidebar entry, disclosure `summary`,
  card title on hover, directional glyphs
- Focus ring on app landings (see [Focus](#focus))
- `--flare-glow` bloom behind a hero or feature element

**Not allowed:** body copy, headings, borders as a general default, backgrounds of
large areas, or anything on the home page.

#### Where these live

Defined in `src/styles/tokens.css` and mirrored into `@theme` in
`src/styles/tailwind.css`, which yields `text-flare`, `bg-flare`, and
`border-flare` utilities. `--flare-glow` is CSS-only (no utility) since it is
never a text colour.

`tokens.css` is the only declaration of this ramp in this repo. Spun-out app
sites carry a **copy** of `tokens.css`, so a change to `--flare*` has to be made
in each of them too — see [CLAUDE.md](./CLAUDE.md#spinning-an-app-out).

### Type

| Token | Value |
|---|---|
| `--font-sans` | `ui-sans-serif, -apple-system, system-ui, "Segoe UI", sans-serif` |
| `--font-mono` | `ui-monospace, "SF Mono", SFMono-Regular, Menlo, monospace` |

Mono is reserved for **actual code and small metadata labels** — not for body copy
or headings.

### Motion

| Token | Value |
|---|---|
| `--ease` | `cubic-bezier(0.32, 0.72, 0, 1)` |

A macOS-flavored ease-out. Use it for every micro-interaction so hover and reveal
timing feel like one system.

## Typography — `.prose-app`

`.prose-app` (defined in `tailwind.css`) is the **single Markdown typography
primitive**. Docs pages and blog posts both render through it, so every prose
surface on the site reads identically. Do not write per-page prose styles.

- Measure caps at `42rem`; base size `1.125rem`, line-height `1.75`
- Headings use `--font-sans` at weight 600 with `-0.02em` tracking
- A first heading has its top margin removed so it doesn't push a gap
- Inline `code` gets a `--surface` chip; `pre code` explicitly un-does that so
  fenced blocks aren't double-styled

Element selectors are wrapped in `:where()` so they contribute no specificity of
their own — each rule stays at 0-1-0, the `.prose-app` class alone. Note that a
Tailwind utility is *also* 0-1-0, so specificity is equal, not lower.

**Overriding works because of layer order, not specificity:** Tailwind's
`utilities` layer sorts after `components`, and layer order outranks specificity
outright. That same mechanism is what wins over preflight.

## Component patterns

### `.btn-vibrancy`

The macOS "vibrancy" hover: a frosted, translucent-white pane that blurs and
saturates whatever sits behind the control (sunrise glow, page background). Shared
by pills and buttons across the Tailwind-rendered pages, so hover feels
consistent. Elements keep their own `transition` utility, which already animates
`backdrop-filter`.

Two exceptions worth knowing: the primary nav uses a subtler 5% white fill to
match the app-landing header treatment, and `/blackflare` uses its own
`.badge-link` classes (it never loads `tailwind.css`).

### `.card-vibrancy`

The same material at rest instead of on hover — a frosted pane for cards. A
55%-opacity `--surface` fill over `blur(20px) saturate(180%)`, an inset top
hairline for the specular edge, and a soft drop shadow to lift it off the page.
Hover deepens all three and strengthens the border.

Two things it depends on:

- **Something behind it to blur.** `backdrop-filter` reveals what it can see
  through, so the fill must stay translucent and the ambient `<Sunrise>` at
  `z-index: -1` is what actually shows up in it. On a flat background it reads as
  a plain tint.
- **No `bg-surface` alongside it.** Tailwind's `utilities` layer sorts after
  `components`, so that utility would win and turn the pane opaque again.

- **Nothing darker than the pane inside it.** A child painted with `bg-surface`
  sits *below* its own container in value and reads as a hole; use `bg-white/10`
  for a selected row and `bg-white/5` for hover instead.

**Do not add `transition-colors` to a `.card-vibrancy` element.** The utility
replaces the class's own `transition`, dropping the shadow and fill from the
animation and leaving only the border moving.

Radius, border, and padding stay on the element's own utilities; this class only
swaps the material. Where `backdrop-filter` is unsupported it falls back to the
opaque `--surface`.

`PostCard` — a copied component, shared with blackflare.dev — uses it, so **this
repo's `/blog` renders frosted cards too.** Beyond that it is unused here;
`/apps` gallery cards are still opaque `bg-surface`.

### Focus

`:focus-visible` draws a 2px outline at 2px offset. **The colour follows the page:**

| Surface | Ring | Mechanism |
|---|---|---|
| Home (`/`) | `--accent` white | base layer default |
| Every other page | `--flare` amber | `.app-shell :focus-visible` overrides `outline-color` |
| `/blackflare` | `--flare` amber, 3px offset | its own stylesheet |

`AppLayout` puts `.app-shell` on its wrapper, so every page rendered through it
picks up the amber ring automatically. Home renders the same wrapper markup
*without* that class, which is the only thing keeping it monochrome — **if you
ever refactor home onto `AppLayout`, it inherits the amber ring.**

Amber clears contrast comfortably for a focus indicator (9.54:1 on `--bg`, well
past the 3:1 non-text minimum).

**Never remove or thin the ring.** The override sets `outline-color` only, so
width and offset can't be lost by accident. Restyle the colour if it clashes.

### `[hidden]`

`tailwind.css` forces `[hidden] { display: none !important }`. This is load-bearing:
the apps filter hides cards by setting `el.hidden = true`, and without the
`!important` an author `display:flex` utility outranks the UA `[hidden]` rule and
the card stays visible.

## Motion behavior

- Scroll reveals are GSAP-driven, targeting `[data-reveal]` (`src/scripts/reveal.ts`)
- Elements start hidden **only** when JS and motion are both active: a
  synchronous `<head>` script adds `.reveal-js` before paint. Without it —
  reduced-motion or no-JS — content stays visible, so there is no flash and
  nothing can get stuck invisible
- A global `prefers-reduced-motion: reduce` block collapses all animation and
  transition durations

Any new entrance animation must degrade the same way: **visible by default, hidden
only once motion is confirmed available.**

## App landings live elsewhere

There are no bespoke landings in this repo. An app that wants one gets its own
domain and its own repo; this hub renders the gallery card and, for small apps,
one shared inline template at `/<slug>`. The rule is in
[CLAUDE.md](./CLAUDE.md#the-hosted-vs-linked-law); the bespoke-vs-templated rule
that used to live here moved with the first landing, to
[blackflare.dev](https://blackflare.dev).

What still binds a spun-out site: **the palette**. Base tokens and the flare ramp
are shared across the family and are not chosen per app. An app whose icon is
blue or green still gets amber. That is the deliberate trade — brand consistency
across every property over per-app colour matching. If it becomes wrong for a
future app, change this rule deliberately rather than letting one site quietly
diverge.

Layout and components are each site's own business. The palette is not.

## Known deviations

Live violations of the rules above. A prescriptive document stays honest by
recording its exceptions with a date and a remediation, not by quietly tolerating
them.

| Logged | File | Deviation | Remediation |
|---|---|---|---|
| ~~2026-07-20~~ | ~~`src/styles/blackflare-landing.css:13-41`~~ | ~~Redeclares 9 of the 12 base tokens in its own `:root`; `--surface-2: #1c1c1c` had already diverged from `--surface-hover: #1d1d1d`.~~ **Resolved 2026-07-21** — the file moved to the blackflare.dev repo, where it now imports `tokens.css` and the two grays were reconciled to `#1d1d1d`. Nothing on this hub redeclares tokens. | — |
| ~~2026-07-20~~ | ~~`src/styles/blackflare-landing.css:29-33` (`--flare*`)~~ | ~~Declares its own copy of the flare ramp because the page never imports `tokens.css`.~~ **Resolved 2026-07-21** — moved out with the file above; `tokens.css` is the only declaration in each repo. | — |
| ~~2026-07-20~~ | ~~`src/pages/blackflare.astro:67-71,78-107,639-664`~~ | ~~Re-implements Sunrise, Header and Footer in local markup instead of reusing the shared components.~~ **Resolved 2026-07-21** — the page left this repo. On blackflare.dev it renders through `BaseLayout` with the shared `Header`/`Footer`; only the sunrise stays local, deliberately (the two implementations differ structurally — see that repo's `DESIGN.md`). | — |
| ~~2026-07-20~~ | ~~`src/styles/blackflare-landing.css:84-87`~~ | ~~Overrides the site focus ring with amber.~~ **Resolved 2026-07-20** — ruled intentional branding. The [Focus](#focus) rule now permits an accent-coloured ring within stated constraints; the override is compliant, not a deviation. | — |
| 2026-07-20 | `src/styles/tokens.css:20` (`--text-tertiary`) | Fails WCAG AA on every card surface (4.44:1 on `--surface`, 4.10:1 on `--surface-hover`) while the source comment claims ~4.5:1 on both. See [Text ramp](#text-ramp). | Either lighten toward `#848484` or accept and correct the comment. Token value is a deliberate design choice, so **this needs a call, not a unilateral fix.** |

Bespoke app landings no longer live in this repo. An app large enough to want one
gets its own domain and its own repo (see [CLAUDE.md](./CLAUDE.md), the
hosted-vs-linked rule); the hub renders only the gallery card, the templated
inline app page, and its own brand pages. The design language above still governs
both — a spun-out site inherits `tokens.css` as a copy, with this repo canonical.

When a deviation is resolved, strike the row and note the date.
