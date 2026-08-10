#!/usr/bin/env node
/**
 * Mint a premium unlock token.
 *
 * While PAYMENTS_ENABLED=false you use this to hand out preview access.
 * Once payments are live, your checkout webhook mints tokens with the same
 * algorithm after a successful payment.
 *
 * Usage:
 *   node scripts/mint-unlock-token.mjs --secret "<PREMIUM_UNLOCK_SECRET>" \
 *        --order "manual-001" --days 30 [--domain client.com]
 */

import crypto from 'node:crypto';

const args = parseArgs();

function parseArgs() {
  const out = {};
  const argv = process.argv.slice(2);
  for (let i = 0; i < argv.length; i++) {
    if (!argv[i].startsWith('--')) continue;
    const key = argv[i].slice(2);
    const next = argv[i + 1];
    out[key] = next && !next.startsWith('--') ? next : 'true';
    if (out[key] !== 'true') i++;
  }
  return out;
}

const secret = args.secret || process.env.PREMIUM_UNLOCK_SECRET;
if (!secret) {
  console.error('Missing --secret (or PREMIUM_UNLOCK_SECRET in the environment).');
  process.exit(1);
}

const days = Number(args.days || 30);
const payload = {
  order: args.order || `manual-${Date.now()}`,
  exp: Math.floor(Date.now() / 1000) + days * 86400,
  ...(args.domain ? { domain: args.domain } : {}),
};

const b64url = (buf) =>
  Buffer.from(buf).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

const payloadPart = b64url(JSON.stringify(payload));
const signature = crypto.createHmac('sha256', secret).update(payloadPart).digest();
const token = `${payloadPart}.${b64url(signature)}`;

console.log('\nUnlock token (valid %d days):\n', days);
console.log(token);
console.log('\nTest it with:\n');
console.log(
  `curl -X POST https://smartgen-platforms.<your-subdomain>.workers.dev/api/audit/premium \\
  -H 'Content-Type: application/json' \\
  -H 'Authorization: Bearer ${token}' \\
  -d '{"url":"example.com"}'\n`
);
