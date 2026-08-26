---
slug: "mastercard-mpqr-oauth1-signing"
title: "Mastercard MPQR OAuth 1.0a RSA-SHA256 Authentication"
description: "Understand and implement Mastercard MPQR OAuth 1.0a request signing, body hashes, nonce, timestamps, and Cloudflare Web Crypto safely."
order: 4
---

<!-- smartgen-mastercard-navigation -->

## SmartGen Mastercard navigation

Use the links below to move between the SmartGen Mastercard documentation chapters and the live Sandbox Lab. The Lab is for simulated technical testing only; it does not authorize real-money use or live merchant fulfillment.

- [A-to-Z index](/docs/mastercard/)
- [Sandbox Lab](/payment-gateway/mastercard-mpqr.html)
- [Overview and roles](/docs/mastercard/mastercard-mpqr-overview-and-roles/)
- [Account and keys](/docs/mastercard/mastercard-mpqr-account-setup-and-keys/)
- [OAuth 1.0a signing](/docs/mastercard/mastercard-mpqr-oauth1-signing/)
- [Payment and Retrieval API](/docs/mastercard/mastercard-mpqr-api-reference-smartgen/)
- [QR/static/dynamic flow](/docs/mastercard/mastercard-mpqr-qr-static-dynamic-device-sdks/)
- [Sandbox testing](/docs/mastercard/mastercard-mpqr-sandbox-testing/)
- [Worker security](/docs/mastercard/mastercard-mpqr-worker-deployment-security/)
- [Partner and Production onboarding](/docs/mastercard/mastercard-mpqr-partnership-and-production-onboarding/)
- [Orders and reconciliation](/docs/mastercard/mastercard-mpqr-orders-status-reconciliation-refunds/)
- [Bangladesh checklist](/docs/mastercard/mastercard-mpqr-bangladesh-operating-checklist/)
- [Troubleshooting](/docs/mastercard/mastercard-mpqr-troubleshooting/)
- [Security remediation](/docs/mastercard/mastercard-mpqr-security-remediation-status/)
- [MTF checklist](/docs/mastercard/checklists/mtf-readiness/)
- [Production checklist](/docs/mastercard/checklists/production-go-live/)
- [Safe examples](/docs/mastercard/examples/curl-and-worker-examples/)
- [Configuration template](/docs/mastercard/examples/configuration-template/)
- [Official Mastercard MPQR docs](https://developer.mastercard.com/mastercard-merchant-presented-qr/documentation/)


# Mastercard MPQR OAuth 1.0a RSA-SHA256 Authentication

## Protocol used by the current MPQR API

The current Mastercard MPQR Server APIs require an OAuth 1.0a `Authorization` header. The request is signed with the private RSA key corresponding to the public key registered in the Mastercard Developers project. The Consumer Key identifies the project. The private signing key never belongs in the browser.[1]

The current SmartGen Worker implements this signing flow in `workers/mastercard-mpqr.js` with Cloudflare Web Crypto.

## OAuth parameters

The Worker creates these OAuth parameters for every request:

| Parameter | Purpose |
|---|---|
| `oauth_consumer_key` | Identifies the Mastercard project |
| `oauth_nonce` | Unique random value to prevent replay |
| `oauth_signature_method` | `RSA-SHA256` |
| `oauth_timestamp` | Current Unix time in seconds |
| `oauth_version` | `1.0` |
| `oauth_body_hash` | Base64 SHA-256 digest of the exact request body, when a body exists |
| `oauth_signature` | RSA-SHA256 signature over the OAuth signature base string |

## Signing algorithm

For each request, SmartGen should:

1. Build the exact final URL, including the path and any query parameters.
2. Serialize the exact JSON body that will be sent over the network.
3. Compute SHA-256 over the UTF-8 body bytes and encode the digest as Base64 for `oauth_body_hash`.
4. Create the OAuth parameter collection.
5. Percent-encode parameter names and values using OAuth encoding rules.
6. Include URL query parameters and OAuth parameters in the normalized parameter string.
7. Sort normalized parameters by encoded name and encoded value.
8. Normalize the request URL without the query string.
9. Build the signature base string as `METHOD & encoded_base_url & encoded_normalized_parameters`.
10. Sign the UTF-8 signature base string using the RSA private key and SHA-256 with PKCS#1 v1.5 padding.
11. Percent-encode each OAuth header value and send the resulting `Authorization` header.

The signature must be calculated over the same URL, method, parameters, and body that are actually sent. A changed body, extra whitespace, different query encoding, or different URL host invalidates the signature.

## Simplified example

The following is illustrative pseudocode. The production implementation is in the Worker and should not be replaced casually:

```text
body = JSON.stringify(payload)
bodyHash = Base64(SHA256(UTF8(body)))

oauth = {
  oauth_consumer_key: CONSUMER_KEY,
  oauth_nonce: random_nonce(),
  oauth_signature_method: "RSA-SHA256",
  oauth_timestamp: unix_seconds(),
  oauth_version: "1.0",
  oauth_body_hash: bodyHash
}

normalized_parameters = percent_sort(query_parameters + oauth)
base_url = scheme + "://" + host + path
base_string = METHOD + "&" + encode(base_url) + "&" + encode(normalized_parameters)
signature = RSA_SHA256_PKCS1_v1_5_SIGN(private_key, UTF8(base_string))
oauth.oauth_signature = Base64(signature)

Authorization: OAuth <encoded oauth parameters>
```

## SmartGen implementation map

| SmartGen function | Responsibility |
|---|---|
| `createMastercardAuthorizationHeader` | Creates OAuth parameters, body hash, signature base string, RSA signature, and header |
| `pemToBytes` | Converts PKCS#8 PEM body into bytes for Web Crypto |
| `sha256Base64` | Computes body hash |
| `parameterString` | Combines query/OAuth parameters and sorts them |
| `signRsaSha256` | Imports PKCS#8 key and signs with RSA-SHA256 |
| `safeTransferReference` | Validates the 6–40 character transfer reference |
| `parseResponse` | Parses Mastercard JSON and preserves non-secret correlation information |

## Why the browser must not sign requests

Signing in browser code would expose the private signing key to every visitor. A visitor could copy the key, impersonate SmartGen, create unauthorized transfers, or attack the account. The browser should call only the SmartGen Worker over HTTPS. The Worker should validate the request and sign the provider call internally.

## Body-hash mistakes to avoid

| Mistake | Result |
|---|---|
| Hashing a pretty-printed body but sending compact JSON | Signature mismatch |
| Hashing one amount and sending another | Signature mismatch or incorrect request |
| Computing the hash after modifying the body | Signature mismatch |
| Omitting the body hash for a request that requires it | Authentication failure |
| Using a URL with a query in one step and without it in another | Signature mismatch |
| Encoding spaces with `+` instead of OAuth percent encoding | Signature mismatch |
| Reusing nonce/timestamp values | Replay or timestamp rejection |

## Key format checks

The Worker validates that the Consumer Key matches the MPQR project’s expected two-part format separated by one `!`. It also requires a signing key value. The validation does not prove that the key is correct; only a signed API request can confirm the key pair and project configuration.

Do not add logging that prints the Consumer Key, Authorization header, signature base string, private key, account URI, or full request body. If debugging is required, log only a request ID, endpoint family, HTTP method, status, and provider correlation ID after masking sensitive values.

## OAuth 2.0 and FAPI 2.0

Mastercard’s general platform documentation describes OAuth 2.0 and FAPI 2.0 for APIs that support that model. The current MPQR API documentation requires OAuth 1.0a. A future migration would require confirmation from Mastercard, a supported MPQR project configuration, a different token and proof flow, new test coverage, and a controlled secret rotation. It is not part of the current SmartGen MPQR implementation.

## References

[1]: https://developer.mastercard.com/mastercard-merchant-presented-qr/documentation/server-apis/api-basics/ "Mastercard MPQR API Basics"
[2]: https://developer.mastercard.com/platform/documentation/authentication/using-oauth-1a-to-access-mastercard-apis/ "Mastercard Using OAuth 1.0a to Access Mastercard APIs"
