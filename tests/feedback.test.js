import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { validateFeedback, hashIp } from '../functions/_lib/feedback.js';

describe('validateFeedback', () => {
  it('accepts a minimal valid payload', () => {
    const r = validateFeedback({
      appId: 'hdrecover',
      message: 'Scan is slow on large disks',
    });
    assert.equal(r.ok, true);
    assert.equal(r.value.appId, 'hdrecover');
    assert.equal(r.value.email, null);
    assert.equal(r.value.rating, null);
    assert.equal(r.value.locale, 'en');
  });

  it('normalizes zh locale and rating', () => {
    const r = validateFeedback({
      appId: 'skincare-cycle',
      message: '希望增加提醒',
      email: 'user@example.com',
      rating: 5,
      locale: 'zh-CN',
    });
    assert.equal(r.ok, true);
    assert.equal(r.value.locale, 'zh');
    assert.equal(r.value.rating, 5);
    assert.equal(r.value.email, 'user@example.com');
  });

  it('rejects empty message', () => {
    const r = validateFeedback({ appId: 'hdrecover', message: '   ' });
    assert.equal(r.ok, false);
    assert.equal(r.error, 'invalid_message');
  });

  it('rejects bad app id', () => {
    const r = validateFeedback({ appId: '../x', message: 'hi' });
    assert.equal(r.ok, false);
    assert.equal(r.error, 'invalid_app_id');
  });

  it('rejects invalid email', () => {
    const r = validateFeedback({
      appId: 'website',
      message: 'hello',
      email: 'not-an-email',
    });
    assert.equal(r.ok, false);
    assert.equal(r.error, 'invalid_email');
  });

  it('rejects out-of-range rating', () => {
    const r = validateFeedback({
      appId: 'website',
      message: 'hello',
      rating: 9,
    });
    assert.equal(r.ok, false);
    assert.equal(r.error, 'invalid_rating');
  });
});

describe('hashIp', () => {
  it('returns stable short hex', async () => {
    const a = await hashIp('1.2.3.4', 'salt');
    const b = await hashIp('1.2.3.4', 'salt');
    const c = await hashIp('1.2.3.5', 'salt');
    assert.equal(a, b);
    assert.notEqual(a, c);
    assert.equal(a.length, 32);
  });
});
