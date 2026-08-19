---
title: "Agentic Coding Has a Babysitting Problem"
pubDate: 2026-08-06
description: "AI coding agents promised hands-off work, then turned us into babysitters. What hovering over Claude Code taught us, and the app we built to stop."
tags: ["blackflare", "voyage"]
heroImage: "/assets/blog/claude-pings-lock-screen.webp"
---

The pitch for AI coding agents is delegation: describe the work, walk away,
come back to a finished job. We bought that pitch. We use Claude Code and
Codex every day at this studio, and they genuinely do the work.

What nobody mentions is that you never actually walk away.

## The agent works. You hover.

Here's the loop we caught ourselves in. Kick off a long run. Glance at the
terminal. Still going. Glance again. Still going. Wander off, come back — the
Mac went to sleep and the run stalled twenty minutes ago. Fine, disable sleep
system-wide, kick it off again, leave for the evening. Next morning: the run
finished five minutes after you left, then the machine sat there, lit up,
doing nothing all night.

And the finishes are the easy case. Agents also *stop and wait* — for a
permission, for an answer, for you. There's no sound for that. A waiting agent
looks exactly like a working agent from across the room, so you check. And
check. Each check that finds nothing is a context switch you paid for anyway.

The tools are brilliant. The workflow around them leaks time from three
places: the Mac sleeps when it shouldn't, the agent waits in silence, and you
keep coming back to look. Delegation with hovering isn't delegation — it's
babysitting with extra steps.

## Pirates don't stand watch over a ship that sails itself

So we built the thing we wanted on our own desks: a small menu bar app that
stands the watch for you. It's called
[BlackFlare](https://blackflare.dev), and the idea fits in one sentence —
your Mac stays awake while an agent is running, and you get pinged the moment
it finishes or needs you.

That one sentence dissolves the whole loop. Overnight runs finish on their
own because the Mac won't sleep mid-session — and sleeps normally the second
the work is done. The silence is gone because the ping finds you: on your
desktop, or on Telegram or Slack when you've stepped away from the desk
entirely.

Along the way it picked up the other small frictions we kept
tripping on — switching model or permission mode from the menu instead of
hand-editing configs, and plan usage sitting right in the menu bar so limits
stop being a surprise.

The test we hold it to is simple: can you start a run, leave the building,
and trust that the machine will work and the news will reach you? That's what
"agentic" was supposed to mean.

## Take the watch off your calendar

BlackFlare is a free download for macOS — the full story, docs, and pricing
live at [blackflare.dev](https://blackflare.dev). If you spend your days with
Claude Code or Codex, take it for a sail.

Pirates don't fight for medals, they fight for freedom — including the
freedom to leave the terminal unattended. 🏴‍☠️
