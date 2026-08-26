import assert from "node:assert/strict";
import { generateKeyPairSync } from "node:crypto";
import { createMastercardAuthorizationHeader } from "./mastercard-mpqr.js";

const { privateKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
const signingKeyPem = privateKey.export({ type: "pkcs8", format: "pem" });
const url = "https://sandbox.api.mastercard.com/send/static/v1/partners/ptnr_BEeCrYJHh2BXTXPy_PEtp-8DBOo/merchant/transfers/payment";
const body = JSON.stringify({ merchant_payment_transfer: { amount: "51.00", currency: "USD" } });
const header = await createMastercardAuthorizationHeader({
  url,
  method: "POST",
  body,
  consumerKey: "test-consumer-key",
  signingKeyPem,
});

assert.match(header, /^OAuth /);
assert.match(header, /oauth_consumer_key=/);
assert.match(header, /oauth_signature_method=\"RSA-SHA256\"/);
assert.match(header, /oauth_body_hash=/);
assert.match(header, /oauth_nonce=/);
assert.match(header, /oauth_timestamp=/);
assert.match(header, /oauth_signature=/);
console.log("Mastercard OAuth signer smoke test passed");
