# ZBENS site structure

Backup before this tidy: sibling folder `zben-site-backup-20260722-1204` (or latest `zben-site-backup-*`).

## Public pages (root — keep URLs stable)

| Page | Role |
|------|------|
| `index.html` | Home / publisher overview |
| `hdrecover.html` | HDRECOVER product |
| `pricing.html` | HDRECOVER Pro checkout (Paddle) |
| `download.html` | Installer list (`downloads/catalog.json`) |
| `pc-apps.html` / `mobile-apps.html` | Product catalogs |
| `electronics.html` / `iot.html` / `careers.html` | Brand/portfolio pages (retained) |
| `feedback.html` | Feedback form |
| `terms.html` / `privacy.html` / `refunds.html` / `cookies.html` | Legal |
| `privacy-app*.html` / `skincare-cycle-privacy.html` / `cupdial-privacy.html` / `hostreach-privacy.html` / `adventurerslog-privacy.html` / `babytv-privacy.html` | App-specific privacy |

## Shared assets

- `js/` — i18n + site chrome
- `locales/` — en/zh strings
- `images/` — favicon & assets
- `downloads/catalog.json` — download links

## Backend (Cloudflare Pages)

- `functions/` — feedback API + Paddle webhook
- `migrations/` — D1 SQL
- `secrets/` — templates only (real secrets in `.dev.vars`, gitignored)
- `scripts/` — secret push helpers
- `wrangler.toml` — D1 binding

## Archived (not deleted)

- `_archive/mirror/` — old locale mirror tree
- `_archive/lib/` — unused lib folder (if present)

## Do not commit

- `.dev.vars`, `.wrangler/`, `node_modules/`
