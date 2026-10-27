# Unified data layer: setup and deployment

No new environment variables or services are required. Existing ones are unchanged:

* Smart Alerts: `SESSION_SECRET`, `BETA_CODES`, `CRON_SECRET`, `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` (see `docs/SMART_ALERTS_SETUP.md`).
* Optional providers: `DHAN_*`, `INDIANAPI_KEY`, `UPSTOX_ACCESS_TOKEN`, Angel One variables.

## Vercel Hobby function limit

Vercel counts every file under `api/` whose name does not start with an underscore as a function, **including files in
sub-folders**. Before this change `api/` held 13 top-level files plus 4 files in `api/providers/` = 17 functions
(limit 12). Now:

* `api/providers/*` moved to `api/_lib/providers/` (underscore folders are not functions).
* `api/yahoo.js` and `api/history.js` removed; `/api/market?action=yahoo|history` serve the same responses and
  `vercel.json` rewrites keep the old URLs working (`/api/yahoo`, `/api/history`), so no screen or cached client breaks.
* The stray 1-byte file `api/repo root` removed.
* Result: **11 functions** (ai, alerts, auth, futures-data, futures-feed-token, market-mood-data, market, news, nse, scanner-data, upstox). `tests/unified-data.test.mjs` fails if the count passes 12.

Delete these when you copy the ZIP over the repo (the ZIP cannot delete files): `api/yahoo.js`, `api/history.js`,
`api/repo root`, and the old folder `api/providers/` (its files are in `api/_lib/providers/`).

`vercel.json` is new. It has rewrites only; there are no `crons` (Hobby cannot run frequent crons), so the
scheduler remains the GitHub Actions workflow `.github/workflows/smart-alerts-cron.yml`.

## Scheduler

Unchanged: GitHub Actions calls `POST /api/alerts?action=cron` every 5 minutes on weekdays with the `CRON_SECRET`
bearer token. The run now reads prices and candles through `api/_lib/marketFeed.js`. GitHub schedules are best effort
(late or skipped runs happen), so alerts can arrive minutes late.

## Push

Real server-delivered Web Push only works when the VAPID keys, Upstash and a subscribed phone are set up. The browser
speech feature is a foreground convenience and does not speak when the app is closed.

## Test it

```
node --test tests/*.test.mjs
```
The scheduler, data layer and push sender are tested with mocks (fake Yahoo responses, a fake push sender). That
proves the logic. It is **not** a real phone push test: do that after deploy with Alerts -> "Send test notification"
on your phone, and one live scheduled run via the GitHub Actions "Run workflow" button.
