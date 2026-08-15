# Secrets (do not commit real values)

1. Copy `smtp.local.env.example` → project root `.dev.vars`
2. Fill SMTP / Paddle values locally (use **leaf@zbens.com** for outbound activation mail)
3. For production Cloudflare Pages:

```bash
# From site root (after wrangler login)
npx wrangler pages secret put SMTP_HOST --project-name=zbens < .dev.vars   # or set in Dashboard
```

Easier: Cloudflare Dashboard → Workers & Pages → zbens → Settings → Variables and Secrets  
Add as **Encrypt** secrets:

- SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM
- PADDLE_WEBHOOK_SECRET, PADDLE_API_KEY, LICENSE_HMAC_SECRET

## Paddle webhook

URL: `https://zbens.com/api/paddle/webhook`  
Event: `transaction.completed`

## D1 migration

```bash
npx wrangler d1 execute zbens-feedback --remote --file=./migrations/0002_licenses.sql
```

(Use your real D1 database name if different.)
