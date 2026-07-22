/**
 * Minimal SMTP client for Cloudflare Workers (TLS / port 465 preferred).
 * Uses cloudflare:sockets. Credentials from env only.
 */

import { connect } from 'cloudflare:sockets';

/**
 * @param {ReadableStreamDefaultReader<Uint8Array>} reader
 * @param {number} expectCode
 */
async function readResponse(reader, expectCode) {
  const decoder = new TextDecoder();
  let buf = '';
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    // Multi-line SMTP responses end when a line matches /^\d{3} /
    const lines = buf.split(/\r?\n/).filter(Boolean);
    if (!lines.length) continue;
    const last = lines[lines.length - 1];
    if (/^\d{3} /.test(last) || (/^\d{3}-/.test(lines[0]) && /^\d{3} /.test(last))) {
      const code = parseInt(last.slice(0, 3), 10);
      if (expectCode && code !== expectCode) {
        throw new Error(`smtp_unexpected_${code}: ${last}`);
      }
      return { code, text: buf };
    }
  }
  throw new Error('smtp_connection_closed');
}

/**
 * @param {WritableStreamDefaultWriter<Uint8Array>} writer
 * @param {string} line
 */
async function writeLine(writer, line) {
  const data = new TextEncoder().encode(line + '\r\n');
  await writer.write(data);
}

function b64(s) {
  return btoa(s);
}

/**
 * @param {{
 *   host: string,
 *   port: number,
 *   user: string,
 *   pass: string,
 *   from: string,
 *   to: string,
 *   subject: string,
 *   text: string,
 * }} opts
 */
export async function sendSmtpMail(opts) {
  const port = Number(opts.port) || 465;
  const useTls = port === 465;

  const socket = connect({
    hostname: opts.host,
    port,
    secureTransport: useTls ? 'on' : 'off',
  });

  const writer = socket.writable.getWriter();
  const reader = socket.readable.getReader();

  try {
    await readResponse(reader, 220);
    await writeLine(writer, `EHLO zbens.com`);
    await readResponse(reader, 250);

    if (!useTls && port === 587) {
      await writeLine(writer, 'STARTTLS');
      await readResponse(reader, 220);
      // Workers cannot easily upgrade mid-stream; require port 465 for TLS.
      throw new Error('smtp_use_port_465_ssl');
    }

    await writeLine(writer, 'AUTH LOGIN');
    await readResponse(reader, 334);
    await writeLine(writer, b64(opts.user));
    await readResponse(reader, 334);
    await writeLine(writer, b64(opts.pass));
    await readResponse(reader, 235);

    await writeLine(writer, `MAIL FROM:<${opts.from}>`);
    await readResponse(reader, 250);
    await writeLine(writer, `RCPT TO:<${opts.to}>`);
    await readResponse(reader, 250);
    await writeLine(writer, 'DATA');
    await readResponse(reader, 354);

    const headers = [
      `From: ZBENS HDRECOVER <${opts.from}>`,
      `To: <${opts.to}>`,
      `Subject: ${opts.subject}`,
      'MIME-Version: 1.0',
      'Content-Type: text/plain; charset=utf-8',
      'Content-Transfer-Encoding: 8bit',
      '',
      opts.text.replace(/\r?\n/g, '\r\n'),
      '.',
    ].join('\r\n');

    await writer.write(new TextEncoder().encode(headers + '\r\n'));
    await readResponse(reader, 250);
    await writeLine(writer, 'QUIT');
  } finally {
    try {
      writer.releaseLock();
    } catch {
      /* ignore */
    }
    try {
      reader.releaseLock();
    } catch {
      /* ignore */
    }
    try {
      socket.close();
    } catch {
      /* ignore */
    }
  }
}

/**
 * Build activation email body.
 * @param {{ licenseKey: string, email: string, downloadUrl: string }} p
 */
export function buildActivationEmail(p) {
  return [
    'Thank you for purchasing HDRECOVER Pro.',
    '',
    'Your activation code:',
    p.licenseKey,
    '',
    'How to activate:',
    '1. Install HDRECOVER (download link below).',
    '2. Open Upgrade to Pro and paste the code.',
    '',
    `Download: ${p.downloadUrl}`,
    '',
    'Need help? Reply to this email or contact leaf@zbens.com.',
    '',
    '鈥?ZBENS',
  ].join('\n');
}
