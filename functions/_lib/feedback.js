/**
 * Shared feedback validation (Pages Function + unit tests).
 */

const APP_ID_RE = /^[a-z0-9][a-z0-9_-]{0,63}$/i;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_MESSAGE = 4000;
const MAX_EMAIL = 254;

/**
 * @param {unknown} body
 */
export function validateFeedback(body) {
  if (!body || typeof body !== 'object') {
    return { ok: false, error: 'invalid_json', status: 400 };
  }

  const raw = /** @type {Record<string, unknown>} */ (body);
  const appId = typeof raw.appId === 'string' ? raw.appId.trim() : '';
  const message = typeof raw.message === 'string' ? raw.message.trim() : '';
  const emailRaw = typeof raw.email === 'string' ? raw.email.trim() : '';
  const localeRaw = typeof raw.locale === 'string' ? raw.locale.trim().toLowerCase() : 'en';
  const ratingRaw = raw.rating;

  if (!APP_ID_RE.test(appId)) {
    return { ok: false, error: 'invalid_app_id', status: 400 };
  }
  if (!message || message.length > MAX_MESSAGE) {
    return { ok: false, error: 'invalid_message', status: 400 };
  }

  let email = null;
  if (emailRaw) {
    if (emailRaw.length > MAX_EMAIL || !EMAIL_RE.test(emailRaw)) {
      return { ok: false, error: 'invalid_email', status: 400 };
    }
    email = emailRaw;
  }

  let rating = null;
  if (ratingRaw !== undefined && ratingRaw !== null && ratingRaw !== '') {
    const n = Number(ratingRaw);
    if (!Number.isInteger(n) || n < 1 || n > 5) {
      return { ok: false, error: 'invalid_rating', status: 400 };
    }
    rating = n;
  }

  const locale = localeRaw.startsWith('zh') ? 'zh' : 'en';

  return {
    ok: true,
    value: { appId, message, email, rating, locale },
  };
}

/**
 * @param {string} ip
 * @param {string} salt
 */
export async function hashIp(ip, salt) {
  const data = new TextEncoder().encode(`${salt}:${ip || 'unknown'}`);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(digest)]
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, 32);
}
