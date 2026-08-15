import { generateProKey, validateProKey, verifyPaddleSignature } from '../functions/_lib/license.js';

async function assert(cond, msg) {
  if (!cond) throw new Error(msg || 'assert failed');
}

const key = await generateProKey();
await assert(await validateProKey(key), 'generated key should validate');
const key2 = await generateProKey();
await assert(key !== key2, 'keys should be unique');
await assert(!(await validateProKey('HDR-PRO-000000000000-0000000000000000')), 'bad key');
await assert(await validateProKey('HDR-PRO-4F9DD2E552DB7702'), 'legacy key');

const secret = 'test_secret';
const body = '{"event_type":"transaction.completed"}';
const ts = '1234567890';
const keyMaterial = await crypto.subtle.importKey(
  'raw',
  new TextEncoder().encode(secret),
  { name: 'HMAC', hash: 'SHA-256' },
  false,
  ['sign']
);
const mac = await crypto.subtle.sign('HMAC', keyMaterial, new TextEncoder().encode(`${ts}:${body}`));
const h1 = [...new Uint8Array(mac)].map((b) => b.toString(16).padStart(2, '0')).join('');
await assert(await verifyPaddleSignature(body, `ts=${ts};h1=${h1}`, secret), 'sig ok');
await assert(!(await verifyPaddleSignature(body, `ts=${ts};h1=deadbeef`, secret)), 'sig bad');

console.log('license tests passed');
