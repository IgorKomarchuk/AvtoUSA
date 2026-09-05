# DRIVE STATE

Production-oriented marketplace for selecting, estimating, purchasing, and delivering vehicles from Copart and IAAI auctions to Ukraine.

The application is bilingual (Ukrainian by default, Russian switcher), server-rendered, mobile-first, and safe to run without an auction API key. Demo inventory is always marked `DEMO` and excluded from vehicle sitemap entries.

## Stack

- Next.js 16 App Router, React 19, TypeScript
- Tailwind CSS 4 with local reusable UI components
- PostgreSQL + Prisma ORM
- Apibara.tech Vehicle Auction Data API, server-only
- Signed HTTP-only admin session cookies
- Telegram lead delivery and Telegram vehicle publishing
- Optional official Meta (Facebook Page / Instagram Business) and Viber adapters
- PostgreSQL-backed publication queue, quality gate, templates, limits and audit history
- VPS worker, PM2 and Nginx deployment examples

## Local start

```bash
npm install
copy .env.example .env
npm run dev
```

Open <http://localhost:3000>.

The default `.env.example` configuration uses mock auction mode. No Apibara request is made unless `APIBARA_API_KEY` is present and a sync is explicitly triggered.

## PostgreSQL setup

1. Create a PostgreSQL database.
2. Set `DATABASE_URL` in `.env`.
3. Create the schema and initial admin:

```bash
npm run db:migrate -- --name init
npm run db:seed
```

Use a strong `ADMIN_INITIAL_PASSWORD` only for seeding. The stored database value is a bcrypt hash. In local development without PostgreSQL, the environment credentials can authenticate the mock admin; this fallback is disabled in production.

## Apibara integration

```env
APIBARA_API_KEY=
APIBARA_BASE_URL=https://apibara.tech/api/v1/vehicle-auction
AUCTION_SYNC_MODE=free
AUCTION_SYNC_PER_PAGE=20
MOCK_AUCTION_MODE=true
```

The API key is read exclusively by server modules. Never rename it with a `NEXT_PUBLIC_` prefix.

FREE mode uses one combined `/vehicles` request per automatic run, twice daily. With a 20-record page this is about 60 API requests in a 30-day month. Manual Copart, IAAI, single-vehicle, and `/usage` refreshes consume additional requests and require explicit confirmation in the admin UI.

Data flow:

```text
Apibara -> AuctionSyncService -> PostgreSQL -> server-rendered catalog -> browser
```

Public visitors never call Apibara. When Apibara fails, previously saved vehicles remain available and the error is written to `AuctionSyncLog`. A failed request never deletes inventory.

Manual CLI sync:

```bash
npm run sync:auctions
```

Scheduled sync endpoint:

```text
GET /api/cron/auction-sync
Authorization: Bearer <CRON_SECRET>
```

`vercel.json` schedules this endpoint at 01:17 and 13:17 UTC. Railway, Render, or a VPS can call the same route from their scheduler.

## Leads and Telegram

Lead submissions are validated and rate-limited. With PostgreSQL configured they are saved first; Telegram is an optional delivery channel and fallback.

```env
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
```

If neither PostgreSQL nor Telegram is configured, the form returns a clear configuration error instead of pretending that a manager received the lead.

## Admin

- `/admin/login` — authentication
- `/admin` — vehicle, lead, sync, and cached API usage metrics
- `/admin/sync` — manual sync controls and sync logs
- `/admin/autoposting` — mode, channel status, limits and time windows
- `/admin/autoposting/candidates` — quality-approved real lot candidates
- `/admin/autoposting/queue` — scheduled, failed and in-progress publications
- `/admin/autoposting/history` — publication audit trail and post URLs
- `/admin/autoposting/errors` — per-attempt channel errors and retry actions
- `/admin/autoposting/templates` — editable per-channel post templates
- `/admin/leads` — lead source, vehicle and UTM attribution

`SESSION_SECRET` must contain at least 32 random characters. Admin pages are `noindex` and API actions verify the signed HTTP-only session.

## SEO policy

- `/`, `/cars`, primary make/model/platform landing pages: indexable
- real active vehicle pages: indexable, canonical, Open Graph, Twitter card, Vehicle/Product-compatible data
- demo vehicle pages: `noindex`
- admin and API paths: blocked from crawling
- arbitrary query-filter combinations canonicalize to `/cars`
- sitemap includes only real vehicle records, never DEMO records

## Social autopublishing

The initial mode is `manual`. A vehicle must be active, real (not DEMO), current, complete, photographed and pass the configurable quality filter before it can enter a channel queue. Database uniqueness on `vehicleId + channel` prevents duplicate publication.

```text
Apibara -> PostgreSQL -> quality gate -> per-channel queue -> social post -> UTM vehicle URL -> lead
```

Telegram publishing uses `sendPhoto` and an inline “Подивитися авто” button. Facebook uses the official Page photo endpoint. Instagram uses the official container + `media_publish` flow; set the account bio link to `SITE_URL/instagram`, where visitors see the real vehicles published in that channel. This avoids unofficial automation and the non-clickable feed-caption limitation. Viber uses the official broadcast rich-media endpoint and additionally requires subscribed recipient IDs in `VIBER_BROADCAST_LIST`. Missing channel credentials are isolated as a publication error and do not interrupt the site or other channels.

The Node.js worker runs small bounded jobs: auction sync twice daily in free mode, candidate discovery, queue processing, retry and cleanup.

```bash
npm run worker:autopost
```

The same jobs are exposed to schedulers through `GET /api/cron/autoposting`, protected by `Authorization: Bearer <CRON_SECRET>`.

## Verification

```bash
npm run db:generate
npm run lint
npm run typecheck
npm test
npm run build
npm audit
```

## VPS deployment

For one Ubuntu VPS with about 4 GB RAM, install Node.js LTS, PostgreSQL, Nginx, PM2 and Certbot. Then:

```bash
npm ci
npm run db:deploy
npm run db:seed
npm run build
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

Copy `deploy/nginx/drivestate.conf` to `/etc/nginx/sites-available/drivestate`, replace `example.com`, enable it, test with `nginx -t`, reload Nginx and run the Certbot command shown in the file. PM2 runs one Next.js process and one lightweight TypeScript worker with memory restart limits. PostgreSQL may run on the same VPS. Redis is optional; PostgreSQL is the durable queue/cache fallback.

## Legal notice

Lot data comes from public sources and a third-party data aggregator. Copart and IAAI are trademarks of their respective owners. DRIVE STATE does not claim to be Copart, IAAI, or an official partner. The included privacy and offer pages are structural templates and require review plus real company details before production launch.
