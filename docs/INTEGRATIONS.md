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

## Live integrations (built in Phase 2)

These are implemented now, ahead of the original Phase 5 schedule, since
they're core to daily iPhone use.

### News — Hacker News + NPR (live, no setup needed)

`netlify/functions/news.ts` pulls real headlines from two free sources
requiring no signup or API key: the Hacker News Algolia API (AI/Tech) and
NPR's public RSS feed (general news). 15-minute in-memory cache per
Function instance. If broader coverage is wanted later (business,
beverage/retail specifically), swap or add sources here — the frontend
(`NewsCard`) doesn't care where headlines come from as long as the shape
(`title`, `url`, `source`, `publishedAt`) stays the same.

### Motivation Quote, Word of the Day, Fun Fact, Dad Joke (live, no setup needed)

Four free, no-key sources, each with a 1-hour in-memory cache:
`motivation.ts` (ZenQuotes), `word-of-day.ts` (a random-word API + a free
public dictionary API for the real definition), `fun-fact.ts` (a free
curated facts API), `dad-joke.ts` (icanhazdadjoke.com). None of these are
AI-generated — same reasoning as News: anything presented as a real quote,
fact, or definition needs to actually be one.

### Sports — TheSportsDB (live, shared demo key)

`sports.ts` uses TheSportsDB's publicly documented free test API key
(`"3"`) — works with no signup, but it's shared and rate-limited. Get a
personal key at thesportsdb.com/api.php and set `SPORTS_DATA_API_KEY` if
it becomes unreliable under real use. Favorite teams are currently
hardcoded (Eagles/Phillies/76ers/Flyers) — configurable teams via
preferences is a later improvement.

### Stock Market — live via Finnhub

`stocks.ts` uses Finnhub's free tier (60 calls/min, no credit card
required) — real quotes, never fabricated. Set `MARKET_DATA_API_KEY` to a
Finnhub API key (finnhub.io → sign up → dashboard shows your key). Watchlist is currently hardcoded to
DIA/SPY/QQQ/IWM (ETF proxies for Dow/S&P 500/Nasdaq 100/Russell 2000,
since free-tier providers generally don't expose raw index values) —
configurable symbols via preferences is a later improvement, same as
Sports' hardcoded teams. 15-minute cache. Informational only, never
individualized investment advice, per the brief.


### Weather — National Weather Service (live, no setup needed)

`netlify/functions/weather.ts` calls api.weather.gov directly — free, no
API key. The only thing to set is `NWS_USER_AGENT` in `.env`/Netlify env
vars: a short string identifying the app plus a real contact email (NWS
asks for this so they can reach you if something's misbehaving — not a
secret, just good API citizenship). US locations only.

### Calendar — iCloud (live), Google + Outlook (not yet)

**iCloud Calendar (CalDAV) — live:**
1. Go to https://appleid.apple.com → **Sign-In and Security** →
   **App-Specific Passwords** → generate one, label it something like
   "RDP 2.0".
2. Set `ICLOUD_APPLE_ID` (your Apple ID email) and
   `ICLOUD_APP_SPECIFIC_PASSWORD` (the generated password — never your
   real Apple ID password) in `.env` and Netlify env vars.
3. Once deployed, hit "Sync now" next to iCloud Calendar in Settings, or
   call `POST /api/calendar/sync/icloud` directly.
4. There's no automatic schedule yet — each sync is manually triggered.
   A Netlify Scheduled Function to automate this is Phase 4/5 territory
   (see `ARCHITECTURE.md`'s Morning Intelligence generation workflow,
   which this would slot into).

**Google Calendar — not implemented:**
Requires creating an OAuth app in Google Cloud Console yourself (client
ID + secret, consent screen) — this is a manual setup step outside this
codebase; I can't create that app on your behalf. Once you have a client
ID/secret and a stored refresh token, `calendar-sync-google.ts` is where
the actual API calls get added — see the comment in that file for the
exact shape to normalize into.

**Outlook / Microsoft 365 — not implemented:**
Same situation via Azure AD app registration (Microsoft Entra admin
center) instead of Google Cloud. See `calendar-sync-outlook.ts`.

Both stubs return a clear 501 error rather than silently doing nothing,
and the frontend (`CalendarSettings` in `SettingsPage.tsx`) shows that
message directly so it's never a mystery why nothing synced.

## Planned external integrations (Phase 5, remaining)

Each row below is the eventual data source and the Netlify Function secret
it needs — none of these are called yet; `.env.example` reserves the
variable names so Phase 5 doesn't require an env-var restructure.

| Integration | Env var | Feeds briefing section | Notes |
|---|---|---|---|
| Sports scores/standings | `SPORTS_DATA_API_KEY` | Sports | Favorite teams configurable in Brief Builder |
| Financial markets | `MARKET_DATA_API_KEY` | Markets | Indexes + watchlist; informational framing only, no individualized advice |
| News | `NEWS_API_KEY` | AI and Technology, Beverage and Retail Intelligence | Category-filtered, avoid low-signal items per the brief |
| Gmail | `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Career | Read-only scope; important-email surfacing only, not full inbox access |
| AI provider (summary generation) | `AI_API_KEY` | All narrative sections | Already scaffolded server-side in `netlify/functions/shared/`; actual calls start in Phase 4 |

Weather and Google/Outlook Calendar moved up to the "Live integrations"
section above — Google Calendar and Outlook are schema-ready but still
require you to complete an OAuth app registration first.

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
