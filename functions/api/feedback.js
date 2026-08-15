import { validateFeedback, hashIp } from '../_lib/feedback.js';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...CORS },
  });
}

/**
 * @param {string} token
 * @param {string} secret
 * @param {string} ip
 */
async function verifyTurnstile(token, secret, ip) {
  if (!secret) {
    return token === 'dev-bypass';
  }
  const form = new FormData();
  form.append('secret', secret);
  form.append('response', token);
  if (ip) form.append('remoteip', ip);

  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: form,
  });
  const data = await res.json();
  return Boolean(data.success);
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS });
}

/**
 * @param {{ request: Request, env: { DB: D1Database, TURNSTILE_SECRET_KEY?: string, FEEDBACK_IP_SALT?: string } }} context
 */
export async function onRequestPost({ request, env }) {
  if (!env.DB) {
    return json({ ok: false, error: 'db_unavailable' }, 503);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: 'invalid_json' }, 400);
  }

  const turnstileToken =
    typeof body.turnstileToken === 'string' ? body.turnstileToken : '';
  const ip = request.headers.get('CF-Connecting-IP') || '';

  const human = await verifyTurnstile(
    turnstileToken,
    env.TURNSTILE_SECRET_KEY || '',
    ip
  );
  if (!human) {
    return json({ ok: false, error: 'turnstile_failed' }, 403);
  }

  const result = validateFeedback(body);
  if (!result.ok) {
    return json({ ok: false, error: result.error }, result.status);
  }

  const { appId, message, email, rating, locale } = result.value;
  const ipHash = await hashIp(ip, env.FEEDBACK_IP_SALT || 'zbens');
  const ua = (request.headers.get('User-Agent') || '').slice(0, 512);

  try {
    await env.DB.prepare(
      `INSERT INTO feedback (app_id, locale, email, message, rating, user_agent, ip_hash)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(appId, locale, email, message, rating, ua, ipHash)
      .run();
  } catch (err) {
    console.error('feedback_insert_failed', err);
    return json({ ok: false, error: 'persist_failed' }, 500);
  }

  return json({ ok: true });
}
