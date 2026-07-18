# RDP 2.0 — Integrations

Per the Phase 0 assignment, no third-party integrations are implemented
yet. This document identifies what's coming (Phase 5, one at a time) and
the access-control setup this instance actually uses — it's a map, not
code.

## Access control: Netlify Password Protection (not Supabase Auth)

This is a single-user instance. There's no in-app login — the whole site
sits behind Netlify's built-in site password instead:

1. Netlify dashboard → your site → **Site configuration → Visitor access**
   (may be labeled **Password protection** depending on your Netlify
   plan — this is a paid-plan feature, not available on the free tier).
2. Enable it, set a password.
3. That's it — every route (including `/api/*` Function calls made from
   the browser) sits behind that one shared password. There's nothing to
   configure in this codebase for it.

If you ever outgrow single-user (a second person needs their own login,
not the shared site password), that's when real Supabase Auth comes back
— see `ARCHITECTURE.md` → "Access control model" for what that migration
involves.

## Planned external integrations (Phase 5)

Each row below is the eventual data source and the Netlify Function secret
it needs — none of these are called yet; `.env.example` reserves the
variable names so Phase 5 doesn't require an env-var restructure.

| Integration | Env var | Feeds briefing section | Notes |
|---|---|---|---|
| Weather | `WEATHER_API_KEY` | Today at a Glance | Needs user location + units preference |
| Sports scores/standings | `SPORTS_DATA_API_KEY` | Sports | Favorite teams configurable in Brief Builder |
| Financial markets | `MARKET_DATA_API_KEY` | Markets | Indexes + watchlist; informational framing only, no individualized advice |
| News | `NEWS_API_KEY` | AI and Technology, Beverage and Retail Intelligence | Category-filtered, avoid low-signal items per the brief |
| Google Calendar | `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Today at a Glance, Career, Family | OAuth; tokens stored server-side only |
| Gmail | `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Career | Read-only scope; important-email surfacing only, not full inbox access |
| AI provider (summary generation) | `AI_API_KEY` | All narrative sections | Already scaffolded server-side in `netlify/functions/shared/`; actual calls start in Phase 4 |

Beverage/retail intelligence has no dedicated API row above — it's expected
to be sourced through the general News integration with a category/keyword
filter (competitor names, retailer names, category terms from the brief),
not a separate paid data source, unless that proves insufficient once
built.

## Integration build checklist (applies to each row above, Phase 5)

- [ ] Documented in this file with scope/rationale before implementation
- [ ] Server-side only — key never reaches the browser
- [ ] Input validation on any user-configurable parameter (tickers, teams,
      location)
- [ ] Timeout handling
- [ ] Caching (avoid re-fetching unchanged data every briefing generation)
- [ ] Rate-limit handling / backoff
- [ ] Source name + timestamp recorded in `brief_sources`
- [ ] Fallback behavior: a failure here marks that one `brief_sections` row
      `failed`, never the whole `daily_briefs` row
- [ ] User control: enable/disable + importance level in Brief Builder
      (`user_preferences.brief_category_settings`)

## Explicitly not planned

- No individualized investment/trade instructions from the Markets section
  — informational only, with disclaimers, per the brief.
- No automated posting/sending on the user's behalf through Gmail/Calendar
  integrations without explicit in-app confirmation — read/surface first,
  write actions are a later, separately-scoped decision.
