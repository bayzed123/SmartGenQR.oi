import assert from "node:assert/strict";
import { createHmac, generateKeyPairSync } from "node:crypto";
import worker from "./bkash-payment-gateway.js";

const { privateKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
const signingKeyPem = privateKey.export({ type: "pkcs8", format: "pem" });
const consumerKey = `${"a".repeat(48)}!${"b".repeat(48)}`;
const env = {
  MASTERCARD_CONSUMER_KEY: consumerKey,
  MASTERCARD_SIGNING_KEY_PEM: signingKeyPem,
  MASTERCARD_BASE_URL: "https://sandbox.example.test/send/static",
  MASTERCARD_PARTNER_ID: "partner-test",
  MASTERCARD_CURRENCY: "USD",
  MASTERCARD_PAYMENT_ORIGINATION_COUNTRY: "BGD",
  MASTERCARD_CARD_ACCEPTOR_NAME: "SmartGen Test",
  ALLOWED_ORIGINS: "https://smartgentools.com",
  RATE_LIMIT_PER_MINUTE: "15",
};

const originalFetch = globalThis.fetch;
let upstreamCalls = 0;
let lastUpstreamPayment;
let retrievalFixture = null;
globalThis.fetch = async (_url, options = {}) => {
  if (options.method === "GET") {
    if (retrievalFixture) return new Response(JSON.stringify(retrievalFixture), { status: 200, headers: { "correlation-id": "corr_retrieval" } });
    return new Response(JSON.stringify({ Description: "not found" }), { status: 404 });
  }
  upstreamCalls += 1;
  if (options.body) {
    const requestBody = JSON.parse(options.body);
    lastUpstreamPayment = requestBody.merchant_payment_transfer;
  }
  return new Response(JSON.stringify({
    merchant_transfer: {
      id: "mtrn_test",
      transfer_reference: "SGMPQR_IDEMP_001",
      status: "APPROVED",
      original_status: "APPROVED",
      transfer_amount: { value: "51.00", currency: "USD" },
      transaction_local_date_time: "2026-08-26T00:00:00.000Z",
      account_uri: "must-not-be-returned",
      transaction_history: {
        data: {
          transaction: [{
            id: "txn_test",
            status: "APPROVED",
            unique_reference_number: "urn_test",
            account_uri: "must-not-be-returned",
            transaction_amount: { value: "51.00", currency: "USD" },
          }],
        },
      },
    },
  }), { status: 200, headers: { "correlation-id": "corr_test" } });
};

try {
  const health = await worker.fetch(new Request("https://worker.test/health"), env);
  assert.equal(health.status, 200);
  const healthData = await health.json();
  assert.equal(healthData.service, "smartgen-mastercard-mpqr-sandbox-gateway");
  assert.equal(healthData.provider, "mastercard_mpqr");
  assert.equal(healthData.environment, "sandbox");
  assert.equal(healthData.configured, true);
  assert.equal(healthData.mastercardConfigured, true);
  assert.equal(healthData.bkashStatus, "on_hold");
  assert.equal(healthData.authMode, "sandbox_public");
  assert.equal(healthData.orderBinding, "sandbox_legacy_amount");
  assert.equal(healthData.idempotency, "optional_with_memory_guard");

  const arbitraryRetrieval = await worker.fetch(new Request("https://worker.test/api/mastercard/mpqr/retrieve?transferId=mtrn_AUDIT_NOT_CREATED_1787754895"), env);
  assert.equal(arbitraryRetrieval.status, 403);
  const arbitraryBody = await arbitraryRetrieval.json();
  assert.equal(arbitraryBody.state, "verification_failed");

  const request = () => new Request("https://worker.test/api/mastercard/mpqr/payment", {
    method: "POST",
    headers: {
      Origin: "https://smartgentools.com",
      "Content-Type": "application/json",
      "Idempotency-Key": "idemp-test-001",
    },
    body: JSON.stringify({ amount: "51.00", transferReference: "SGMPQR_IDEMP_001" }),
  });

  const first = await worker.fetch(request(), env);
  const second = await worker.fetch(request(), env);
  assert.equal(first.status, 200);
  assert.equal(second.status, 200);
  assert.equal(upstreamCalls, 1);
  assert.equal(first.headers.get("access-control-allow-origin"), "https://smartgentools.com");
  assert.equal(first.headers.get("x-content-type-options"), "nosniff");
  assert.equal(first.headers.get("x-frame-options"), "DENY");
  assert.equal(first.headers.get("referrer-policy"), "no-referrer");
  assert.match(first.headers.get("content-security-policy"), /frame-ancestors 'none'/);

  const publicResult = await first.json();
  const serialized = JSON.stringify(publicResult);
  assert.equal(publicResult.result.merchant_transfer.status, "APPROVED");
  assert.equal(publicResult.result.merchant_transfer.id, "mtrn_test");
  assert.equal(publicResult.result.merchant_transfer.transaction_history.data.transaction[0].id, "txn_test");
  assert.doesNotMatch(serialized, /account_uri|must-not-be-returned|private|secret|authorization/i);

  const orderSecret = "test-order-secret";
  const orderPayload = Buffer.from(JSON.stringify({
    orderId: "SG_ORDER_001",
    amount: "51.00",
    transferReference: "SGORDER_001",
    transferId: "mtrn_test",
    currency: "USD",
    exp: Math.floor(Date.now() / 1000) + 300,
  })).toString("base64url");
  const orderSignature = createHmac("sha256", orderSecret).update(orderPayload).digest("base64url");
  const orderToken = `${orderPayload}.${orderSignature}`;
  const protectedEnv = {
    ...env,
    REQUIRE_CLIENT_AUTH: "true",
    SMARTGEN_CLIENT_API_KEY: "test-client-key",
    REQUIRE_ORDER_BINDING: "true",
    REQUIRE_IDEMPOTENCY_KEY: "true",
    SMARTGEN_ORDER_SIGNING_SECRET: orderSecret,
  };
  const unauthorized = await worker.fetch(new Request("https://worker.test/api/mastercard/mpqr/payment", {
    method: "POST",
    body: JSON.stringify({ amount: "999.00", transferReference: "SGORDER_001", orderToken }),
  }), protectedEnv);
  assert.equal(unauthorized.status, 401);
  const protectedRequest = new Request("https://worker.test/api/mastercard/mpqr/payment", {
    method: "POST",
    headers: {
      Origin: "https://smartgentools.com",
      Authorization: "Bearer test-client-key",
      "Content-Type": "application/json",
      "Idempotency-Key": "idemp-order-001",
    },
    body: JSON.stringify({ amount: "999.00", transferReference: "TAMPERED", orderToken }),
  });
  const protectedResponse = await worker.fetch(protectedRequest, protectedEnv);
  assert.equal(protectedResponse.status, 200);
  assert.equal(lastUpstreamPayment.amount, "51.00");
  assert.equal(lastUpstreamPayment.transfer_reference, "SGORDER_001");

  retrievalFixture = {
    merchant_transfer: {
      id: "mtrn_test",
      transfer_reference: "SGORDER_001",
      status: "APPROVED",
      transfer_amount: { value: "51.00", currency: "USD" },
    },
  };
  const verifiedRetrieval = await worker.fetch(new Request(`https://worker.test/api/mastercard/mpqr/retrieve?transferId=mtrn_test&orderToken=${encodeURIComponent(orderToken)}`, {
    headers: { Authorization: "Bearer test-client-key" },
  }), protectedEnv);
  assert.equal(verifiedRetrieval.status, 200);
  const verifiedBody = await verifiedRetrieval.json();
  assert.equal(verifiedBody.state, "verified");

  const mismatchedRetrieval = await worker.fetch(new Request(`https://worker.test/api/mastercard/mpqr/retrieve?transferId=mtrn_not_the_order&orderToken=${encodeURIComponent(orderToken)}`, {
    headers: { Authorization: "Bearer test-client-key" },
  }), protectedEnv);
  assert.equal(mismatchedRetrieval.status, 403);
  const mismatchedBody = await mismatchedRetrieval.json();
  assert.equal(mismatchedBody.state, "verification_failed");

  console.log("Mastercard hardening tests passed");
} finally {
  globalThis.fetch = originalFetch;
}
