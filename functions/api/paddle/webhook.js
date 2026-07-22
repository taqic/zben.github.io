import {
  DEFAULT_HMAC_MATERIAL,
  extractPurchase,
  generateProKey,
  verifyPaddleSignature,
} from '../../_lib/license.js';
import { buildActivationEmail, sendSmtpMail } from '../../_lib/smtp.js';

const DOWNLOAD_URL =
  'https://github.com/taqic/zben.github.io/releases/download/v0.2.1/HDRECOVER-Setup-0.2.1.exe';

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

/**
 * @param {string} customerId
 * @param {string} apiKey
 */
async function fetchCustomerEmail(customerId, apiKey) {
  if (!customerId || !apiKey) return '';
  const res = await fetch(`https://api.paddle.com/customers/${customerId}`, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) return '';
  const body = await res.json();
  const email = body && body.data && typeof body.data.email === 'string' ? body.data.email : '';
  return email.trim().toLowerCase();
}

/**
 * @param {{
 *   request: Request,
 *   env: {
 *     DB: D1Database,
 *     PADDLE_WEBHOOK_SECRET?: string,
 *     PADDLE_API_KEY?: string,
 *     LICENSE_HMAC_SECRET?: string,
 *     SMTP_HOST?: string,
 *     SMTP_PORT?: string,
 *     SMTP_USER?: string,
 *     SMTP_PASS?: string,
 *     SMTP_FROM?: string,
 *   },
 * }} context
 */
export async function onRequestPost({ request, env }) {
  if (!env.DB) return json({ ok: false, error: 'db_unavailable' }, 503);

  const rawBody = await request.text();
  const sig = request.headers.get('Paddle-Signature') || '';
  const secret = env.PADDLE_WEBHOOK_SECRET || '';

  if (!secret) return json({ ok: false, error: 'webhook_secret_missing' }, 503);

  const okSig = await verifyPaddleSignature(rawBody, sig, secret);
  if (!okSig) return json({ ok: false, error: 'invalid_signature' }, 401);

  let event;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return json({ ok: false, error: 'invalid_json' }, 400);
  }

  const purchase = extractPurchase(event);
  if (!purchase) return json({ ok: false, error: 'unrecognized_payload' }, 400);
  if (purchase.skip) return json({ ok: true, skipped: purchase.eventType });

  let email = purchase.email;
  if (!email) {
    const customerId =
      event.data && typeof event.data.customer_id === 'string' ? event.data.customer_id : '';
    email = await fetchCustomerEmail(customerId, env.PADDLE_API_KEY || '');
  }
  if (!email) {
    console.error('license_missing_email', purchase.transactionId);
    return json({ ok: false, error: 'missing_email' }, 422);
  }

  // Idempotent: existing row → do not regenerate / re-mail unless email_sent=0
  const existing = await env.DB.prepare(
    'SELECT license_key, email_sent FROM licenses WHERE transaction_id = ?'
  )
    .bind(purchase.transactionId)
    .first();

  let licenseKey = existing && existing.license_key ? String(existing.license_key) : '';
  let emailSent = existing ? Number(existing.email_sent) === 1 : false;

  if (!licenseKey) {
    const material = env.LICENSE_HMAC_SECRET || DEFAULT_HMAC_MATERIAL;
    licenseKey = await generateProKey(material);
    try {
      await env.DB.prepare(
        `INSERT INTO licenses (transaction_id, email, license_key, email_sent, product_id, price_id)
         VALUES (?, ?, ?, 0, ?, ?)`
      )
        .bind(
          purchase.transactionId,
          email,
          licenseKey,
          purchase.productId || null,
          purchase.priceId || null
        )
        .run();
    } catch (err) {
      // Race: another delivery inserted first
      const again = await env.DB.prepare(
        'SELECT license_key, email_sent FROM licenses WHERE transaction_id = ?'
      )
        .bind(purchase.transactionId)
        .first();
      if (!again) {
        console.error('license_insert_failed', err);
        return json({ ok: false, error: 'persist_failed' }, 500);
      }
      licenseKey = String(again.license_key);
      emailSent = Number(again.email_sent) === 1;
    }
  }

  if (emailSent) {
    return json({ ok: true, duplicate: true });
  }

  const host = env.SMTP_HOST || '';
  const user = env.SMTP_USER || '';
  const pass = env.SMTP_PASS || '';
  const from = env.SMTP_FROM || user || 'leaf@zbens.com';
  const port = Number(env.SMTP_PORT || '465');

  if (!host || !user || !pass) {
    console.error('smtp_not_configured', purchase.transactionId);
    return json({ ok: false, error: 'smtp_not_configured', license_stored: true }, 503);
  }

  try {
    await sendSmtpMail({
      host,
      port,
      user,
      pass,
      from,
      to: email,
      subject: 'HDRECOVER Pro — your activation code',
      text: buildActivationEmail({
        licenseKey,
        email,
        downloadUrl: DOWNLOAD_URL,
      }),
    });
    await env.DB.prepare('UPDATE licenses SET email_sent = 1 WHERE transaction_id = ?')
      .bind(purchase.transactionId)
      .run();
  } catch (err) {
    console.error('smtp_send_failed', purchase.transactionId, err);
    return json({ ok: false, error: 'smtp_failed', license_stored: true }, 502);
  }

  return json({ ok: true });
}
