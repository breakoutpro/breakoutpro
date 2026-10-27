# Smart Alerts - setup and honesty notes

Smart Alerts monitors ONLY the user's own watchlist (plus NIFTY / BANK NIFTY when switched on).
Rules live on the server and are evaluated there against real provider candles; alerts are
delivered as Web Push so they can arrive while the app is closed. Educational signals only: no
orders, no buy/sell advice.

## What the repo did NOT have (and what was added)

| Need | Found in repo | Added |
|---|---|---|
| Database | none | Upstash Redis over its REST API (free tier). Fails closed if not configured. |
| Scheduler | none (no `crons` in vercel.json; Vercel Hobby cannot run frequent crons) | A GitHub Actions workflow calling `POST /api/alerts?action=cron` every 5 min on weekdays. Free. |
| Push sender | only a service-worker listener | Dependency-free Web Push (RFC 8291 + VAPID) in `api/_lib/webpush.js`. |
| Per-user identity | beta tokens carry no identity | Device enrollment (see below). |

Paid services: none are required. Upstash and GitHub Actions have free tiers that are enough for a
small beta; Upstash is a third-party account you must create. Vercel Pro would also allow native
crons, but it is not needed.

## Identity and isolation (read this)

The app has no server-side user accounts. A device enrolls once (needs a valid session token from
`/api/auth` or a valid beta invite code); the server then creates a 256-bit device secret, the
browser keeps it in localStorage and sends it in the `X-BP-Device` header. Storage is keyed by
`sha256("bp-alerts-v1:" + secret)`. A user id sent by the client is never read. Consequence:
isolation is per enrolled device; two devices of the same person are separate unless you add real
accounts later. Clearing browser data loses the secret (the server data then becomes orphaned until
deleted by the "Delete my alert data" button before clearing).

## Setup steps

1. Create an Upstash Redis database (free). Copy its REST URL and REST token.
2. On your own computer run `node scripts/generate-vapid-keys.mjs` and copy the three lines.
3. In Vercel -> Settings -> Environment Variables add (Production): `UPSTASH_REDIS_REST_URL`,
   `UPSTASH_REDIS_REST_TOKEN` (or `KV_REST_API_URL` / `KV_REST_API_TOKEN`), `VAPID_PUBLIC_KEY`,
   `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` (a `mailto:` you own), `CRON_SECRET` (16+ random characters).
   `SESSION_SECRET` / `BETA_CODES` already exist for login. None of these may have a `VITE_` prefix.
4. Redeploy. Open the app -> Smart Alerts: the status card should show "Ready" for server storage.
5. In GitHub -> Settings -> Secrets and variables -> Actions add `ALERTS_APP_URL` (your site URL, no
   trailing slash) and `CRON_SECRET` (same value as Vercel). Run the workflow once with "Run workflow".
6. On a phone: open the app, Smart Alerts -> "Enable background alerts", allow notifications,
   "Send test notification".

## Vercel Hobby function limit

`api/` now holds 13 functions (`alerts.js` is the new one). Vercel Hobby allows 12 per deployment, so a
Hobby deploy will fail unless you remove or merge one existing function (e.g. the duplicate
`market-mood-data.js` / unused providers) or upgrade to Pro. This was not changed here because it
would touch unrelated work.

## Behaviour rules (documented, tested)

* Level crossings fire only on a fresh cross (a level already passed when the rule is created waits for a
  re-cross); 0.1% hysteresis; 15 min cooldown; crosses between two checks are detected from traded highs/lows.
* Percent-move rules fire once per trading day. Compared with the previous session close derived from candles.
* Breakout/breakdown fires on the first COMPLETED candle close beyond the level (a wick or forming candle never
  fires) and re-arms when a candle closes back inside.
* Candle patterns use the last completed candle only, with trend context and minimum history.
* Volume spike baseline: median of the same time-of-day candle over earlier sessions (needs 3, uses up to 10);
  daily needs 10 bars (uses up to 20). No baseline -> "unavailable", never an invented one. Index data usually has no
  volume, so volume rules on NIFTY/BANK NIFTY are reported unavailable.
* Freshness: quote live <= 90 s, delayed <= 20 min, else stale; bars live <= 3 min lag, delayed <= 25 min; daily
  bars stale after 5 days. Stale data never alerts.
* Market closed / holiday / weekend: the provider is not called; rules show why. Daily candles are never labelled
  intraday.
* Duplicate events are suppressed and counted; failed pushes retry up to 3 times within 20 minutes.
* Subscription lifecycle: 404/410 from the push service removes that device; 401/403 (bad keys) is reported but keeps it;
  the browser re-registers a rotated subscription next time the app opens.

## Limits you should know

* Data source is the free Yahoo chart endpoint already used by `api/history.js`; it is delayed for NSE and has
  no SLA. Nothing in this build was run against it (the build sandbox has no access), only fixtures.
* GitHub Actions cron is best-effort (late or skipped runs happen); alerts can be delayed by minutes.
* Voice speaks only while the app is open and only if the device has a voice for the language; background alerts
  are text notifications.
* iOS Web Push works only for a PWA added to the Home Screen (iOS 16.4+).
* A push-service rotation that happens while the app is never opened is only re-registered on the next open.
