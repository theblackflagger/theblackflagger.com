# The Black Flagger

[theblackflagger.com](https://theblackflagger.com)

Pirates don't fight for medals, they fight for freedom! 🏴‍☠️

A static site built with [Astro](https://astro.build), styled in a **macOS
Minimal Dark** design language — see [DESIGN.md](./DESIGN.md).

This is the studio hub: the brand pages plus the gallery of everything we ship.
Apps big enough to want their own marketing site get their own domain and repo
(the first is [blackflare.dev](https://blackflare.dev)); the hub links out to
them and hosts the smaller ones inline. The rule is in
[CLAUDE.md](./CLAUDE.md#the-hosted-vs-linked-law).

## Requirements

- Node.js **≥ 22**

## Commands

| Command           | Action                                   |
| ----------------- | ---------------------------------------- |
| `npm install`     | Install dependencies                     |
| `npm run dev`     | Start the dev server at `localhost:4321` |
| `npm run build`   | Build the production site to `./dist/`   |
| `npm run preview` | Preview the built site locally           |

## Documentation

| File | What's in it |
| ---- | ------------ |
| [CLAUDE.md](./CLAUDE.md) | Conventions — hosted vs linked apps, adding an app or a post, spinning an app out, routing rules, download-button contract |
| [DESIGN.md](./DESIGN.md) | Design language, tokens, typography, component patterns |
| [docs/codebase-summary.md](./docs/codebase-summary.md) | Module map, routes, data flow |
| [docs/deployment-guide.md](./docs/deployment-guide.md) | Cloudflare Pages + GitHub Pages deploy |
| [docs/journals/](./docs/journals/) | Session history |

## Deploy

`dist/` deploys to Cloudflare Pages (primary) and GitHub Pages (mirror) from the
same output — one host serves the domain at a time. Full details in the
[deployment guide](./docs/deployment-guide.md).
