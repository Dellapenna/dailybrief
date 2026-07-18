# RDP 2.0 — Product Brief

## What this is

RDP 2.0 is a personal intelligence and life-management platform — not a habit
tracker, not a news dashboard, not a journal. It functions as a daily
intelligence briefing, life operating system, AI chief of staff, executive
coach, goal system, and decision-support tool, all built around one question:

> **"What should I know and do today to become RDP 2.0?"**

## Branding

| Surface | Name |
|---|---|
| Product | **RDP 2.0** |
| Primary dashboard | **Mission Control** |
| Morning report | **Morning Intelligence** |
| Evening report | **Evening Close** |
| Weekly report | **Weekly Presidential Brief** |
| Tagline | *Build the man. Lead the life.* |

**Visual identity note:** the original brief called for a calm, understated
executive look. That's since evolved on request — see `ARCHITECTURE.md`'s
"Design system" entries for the actual current direction (v3, navy/gold/
teal, an expedition-map mood image as a Mission Control hero banner). This
file's original UI language is left below for context; treat
`ARCHITECTURE.md` as the current source of truth for what's actually built.

## Core principles

- **Useful before impressive** — practical daily value over flashy features.
- **Personalized, not generic** — organized around the user's actual goals,
  health, work, and family, not a one-size-fits-all template.
- **Action-oriented** — information resolves into priorities and next actions.
- **Calm and focused** — an executive command center, not a social feed.
- **Honest coaching** — encouraging but direct; never automatic praise.
- **Evidence over invention** — factual data (markets, sports, weather, news)
  must come from real sources and is never fabricated.
- **Mobile-first** — must work extremely well on a phone; frontend stays
  compatible with a future Capacitor (iOS/Android) wrapper.

## Life pillars

Every goal, task, habit, note, and recommendation optionally belongs to one
of six pillars:

1. **Body** — exercise, weight, nutrition, sleep, glucose, medical
2. **Mind** — Spanish lessons, reading, learning, reflection, stress
3. **Family** — spouse/kids time, important dates, traditions
4. **Career** — work priorities, leadership, meetings, decisions
5. **Builder** — Athlete Intelligence, The Caddie, app development, ideas
6. **Life** — finances, home, travel, golf, friendships, fun

## Initial user

Built first for a single primary user (architecture supports multi-user
later). Priorities: physical health, sustainable fitness/nutrition, sleep,
glucose tracking, learning Spanish, presence as a husband/father, leadership
at work, beverage-industry responsibilities, entrepreneurial projects
(Athlete Intelligence, etc.), personal finances, and making time for golf,
family, travel, and friendship.

## MVP scope

Authentication, profile, preferences, six pillars, Mission Control dashboard,
morning check-in, daily top three, tasks, habits, 90-day goals, Idea Vault,
evening review, weekly scorecard, a Morning Intelligence interface fed by
**manual inputs + stored internal data only** (no third-party APIs yet),
responsive mobile-first design, RLS-secured database, error/loading/empty
states, docs, and tests.

Live sports/market/news/weather/Google integrations are explicitly deferred
to Phase 5 — see `BUILD_PLAN.md`.

## Explicitly out of scope for MVP

- RDP Council (multi-perspective AI panel) — future feature, not MVP.
- Any third-party data integration beyond what the user enters manually.
- Native iOS/Android builds (Capacitor compatibility is preserved, not used).
- Multi-user account management beyond a single primary user.

## Non-negotiables carried into every phase

- Never claim an AI-estimated probability or score is scientifically
  precise — label it clearly as rules-based or user-entered.
- Never present correlation as causation in analytics.
- Never present a placeholder/mock feature as complete or "live."
- Health content is tracking and wellness support, not diagnosis.
- Market content is informational/educational, never individualized
  investment instruction.
