import assert from "node:assert/strict";
import worker from "./bkash-payment-gateway.js";

const baseEnv = {
  BKASH_BASE_URL: "https://sandbox.example.test",
  BKASH_USERNAME: "sandbox-user",
  BKASH_PASSWORD: "sandbox-password",
  BKASH_APP_KEY: "sandbox-app-key",
  BKASH_APP_SECRET: "sandbox-app-secret",
  ALLOWED_ORIGINS: "https://bayzed123.github.io",
  FRONTEND_URL: "https://bayzed123.github.io/SmartGenQR.oi/payment-gateway/",
};

const originalFetch = globalThis.fetch;
const requests = [];
globalThis.fetch = async (url, options) => {
  requests.push({ url, options });
  if (String(url).endsWith("/token/grant")) {
    return new Response(JSON.stringify({ id_token: "test-token", expires_in: 3600 }), { status: 200 });
  }
  if (String(url).endsWith("/payment/create")) {
    const body = JSON.parse(options.body);
    assert.equal(body.amount, "4.53");
    assert.equal(body.currency, "BDT");
    assert.match(body.merchantInvoiceNumber, /^SG-/);
    return new Response(JSON.stringify({ paymentId: "TRTEST12345", bkashURL: "https://sandbox.payment.bkash.com/?paymentId=TRTEST12345", amount: body.amount, currency: body.currency, transactionStatus: "Initiated", merchantInvoiceNumber: body.merchantInvoiceNumber }), { status: 200 });
  }
  throw new Error(`Unexpected upstream URL: ${url}`);
};

try {
  const health = await worker.fetch(new Request("https://worker.test/health"), baseEnv);
  assert.equal(health.status, 200);
  assert.equal((await health.json()).configured, true);

  const invalid = await worker.fetch(new Request("https://worker.test/api/payments/create", { method: "POST", headers: { Origin: "https://bayzed123.github.io", "content-type": "application/json" }, body: JSON.stringify({ amount: "0" }) }), baseEnv);
  assert.equal(invalid.status, 400);
  assert.equal(invalid.headers.get("access-control-allow-origin"), "https://bayzed123.github.io");

  const create = await worker.fetch(new Request("https://worker.test/api/payments/create", { method: "POST", headers: { Origin: "https://bayzed123.github.io", "content-type": "application/json" }, body: JSON.stringify({ amount: "4.53", payerReference: "Customer", platform: "https://smartgentools.com" }) }), baseEnv);
  assert.equal(create.status, 200);
  const created = await create.json();
  assert.equal(created.paymentId, "TRTEST12345");
  assert.match(created.bkashURL, /^https:\/\/sandbox\.payment\.bkash\.com/);
  assert.equal(requests.length, 2);

  console.log("Worker smoke tests passed");
} finally {
  globalThis.fetch = originalFetch;
}
