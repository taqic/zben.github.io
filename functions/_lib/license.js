/**
 * Offline license key helpers (must match HDRecover LicenseManager).
 * Format: HDR-PRO-<12 hex nonce>-<16 hex HMAC-SHA256(nonce)[0:8]>
 */

export const DEFAULT_HMAC_MATERIAL = 'HDRecover.Offline.License.v1.DoNotShare';

/**
 * @param {string} material
 * @param {string} payload
 * @param {number} byteCount
 */
async function computeSigHex(material, payload, byteCount) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(material),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const mac = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
  const bytes = new Uint8Array(mac).slice(0, byteCount);
  return [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('').toUpperCase();
}

/** @param {string} [material] */
export async function generateProKey(material = DEFAULT_HMAC_MATERIAL) {
  const nonceBytes = crypto.getRandomValues(new Uint8Array(6));
  const nonce = [...nonceBytes].map((b) => b.toString(16).padStart(2, '0')).join('').toUpperCase();
  const sig = await computeSigHex(material, nonce, 8);
  return `HDR-PRO-${nonce}-${sig}`;
}

/**
 * @param {string} key
 * @param {string} [material]
 */
export async function validateProKey(key, material = DEFAULT_HMAC_MATERIAL) {
  if (typeof key !== 'string' || !key.toUpperCase().startsWith('HDR-PRO-')) return false;
  const rest = key.slice('HDR-PRO-'.length).trim();
  const dash = rest.indexOf('-');
  if (dash > 0) {
    const nonce = rest.slice(0, dash);
    const sig = rest.slice(dash + 1).trim();
    if (nonce.length !== 12 || sig.length !== 16) return false;
    if (!/^[0-9a-fA-F]+$/.test(nonce) || !/^[0-9a-fA-F]+$/.test(sig)) return false;
    const expect = await computeSigHex(material, nonce.toUpperCase(), 8);
    return sig.toUpperCase() === expect;
  }
  if (rest.length === 16 && /^[0-9a-fA-F]+$/.test(rest)) {
    const expect = await computeSigHex(material, 'PRO', 8);
    return rest.toUpperCase() === expect;
  }
  return false;
}

/**
 * Verify Paddle Billing webhook signature.
 * Header: Paddle-Signature: ts=...;h1=...
 * @param {string} rawBody
 * @param {string} signatureHeader
 * @param {string} secret
 */
export async function verifyPaddleSignature(rawBody, signatureHeader, secret) {
  if (!secret || !signatureHeader) return false;
  const parts = Object.fromEntries(
    signatureHeader.split(';').map((p) => {
      const i = p.indexOf('=');
      return i > 0 ? [p.slice(0, i).trim(), p.slice(i + 1).trim()] : [p, ''];
    })
  );
  const ts = parts.ts;
  const h1 = parts.h1;
  if (!ts || !h1) return false;

  const signed = `${ts}:${rawBody}`;
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const mac = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(signed));
  const digest = [...new Uint8Array(mac)].map((b) => b.toString(16).padStart(2, '0')).join('');
  return digest === h1.toLowerCase();
}

/**
 * Extract buyer email + transaction id from Paddle event JSON.
 * @param {any} event
 */
export function extractPurchase(event) {
  const data = event && event.data ? event.data : null;
  if (!data) return null;
  const eventType = typeof event.event_type === 'string' ? event.event_type : '';
  if (eventType && eventType !== 'transaction.completed') {
    return { skip: true, eventType };
  }

  const transactionId = typeof data.id === 'string' ? data.id : '';
  if (!transactionId) return null;

  let email = '';
  if (data.customer && typeof data.customer.email === 'string') {
    email = data.customer.email;
  } else if (data.details && data.details.totals && typeof data.details.totals.email === 'string') {
    email = data.details.totals.email;
  } else if (typeof data.email === 'string') {
    email = data.email;
  }

  // Paddle Billing often nests customer separately; also check custom_data
  if (!email && data.customer_id && typeof data.customer_id === 'string') {
    // email may arrive only on customer object in some payloads
  }

  const items = Array.isArray(data.items) ? data.items : [];
  const priceId =
    items[0] && items[0].price && typeof items[0].price.id === 'string'
      ? items[0].price.id
      : '';
  const productId =
    items[0] && items[0].price && items[0].price.product_id
      ? String(items[0].price.product_id)
      : '';

  return {
    skip: false,
    transactionId,
    email: (email || '').trim().toLowerCase(),
    priceId,
    productId,
    status: typeof data.status === 'string' ? data.status : '',
  };
}
