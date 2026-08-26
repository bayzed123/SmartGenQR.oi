---
slug: "mastercard-mpqr-account-setup-and-keys"
title: "Mastercard MPQR Account, Project, and Key Setup"
description: "Set up a Mastercard Developers MPQR project, understand Consumer Keys and signing keys, convert a PKCS#12 archive safely, and store secrets correctly."
order: 3
---

# Mastercard MPQR Account, Project, and Key Setup

## Before creating keys

Create or use a Mastercard Developers account owned by a stable company or team email address. Mastercard recommends a group email for projects that will be maintained by more than one person. Keep Sandbox and Production credentials separate, and never use a Production key in a local test or public repository.[1]

The key pair has two parts. Mastercard receives or stores the public certificate/key needed to verify signatures. SmartGen must keep the private signing key secret. The private key must never be placed in GitHub, browser JavaScript, screenshots, frontend HTML, issue comments, or chat messages.

## Create the Sandbox project

1. Sign in to Mastercard Developers.
2. Open **My Projects** and select **Create New Project**.
3. Select **Mastercard Merchant Presented QR** as the API.
4. Choose a permanent project name; Mastercard’s documentation says the project name cannot later be changed.
5. Select the Sandbox key-generation option.
6. Download the PKCS#12 keystore archive and its `readme.txt` file.
7. Record the Consumer Key in a password manager or secure company vault.
8. Confirm the project and verify that the MPQR Payment and Retrieval APIs are visible.

The Sandbox MPQR base URL is:

```text
https://sandbox.api.mastercard.com/send/static
```

The published Sandbox partner ID is:

```text
ptnr_BEeCrYJHh2BXTXPy_PEtp-8DBOo
```

The partner ID above is a public sandbox fixture. MTF and Production use the Partner Reference ID supplied after program registration and environment setup.[1][2]

## Consumer Key versus signing key

| Item | Meaning | Browser-safe? | SmartGen storage |
|---|---|---:|---|
| Consumer Key | Identifies the Mastercard Developers project/client for OAuth 1.0a | No | Cloudflare Worker secret |
| Private signing key | Signs each request so Mastercard can verify authenticity | No | Cloudflare Worker secret |
| Public certificate/key | Used by Mastercard to verify the signature | Not a credential, but still avoid unnecessary publication | Mastercard project/provider system |
| Partner ID | Identifies the originating institution or transaction originator in the API path | Usually not secret | Worker configuration or secret according to provider instructions |
| Keystore password | Protects the downloaded PKCS#12 archive | No | Password manager; delete after controlled conversion |

A Consumer Key is not the same as the private signing key. The Worker needs both the Consumer Key and the private signing key to create the OAuth 1.0a Authorization header.

## What the PKCS#12 archive contains

A `.p12` or `.pfx` file is a password-protected PKCS#12 archive. It commonly contains a private key and certificate. Mastercard’s project download may also include a `readme.txt` containing the key alias and keystore password.

The archive is not normally used directly by the Cloudflare Worker. Convert it once in a controlled environment into an unencrypted PKCS#8 PEM private key, then upload the PEM value directly to the Worker secret. Delete the extracted private key, temporary conversion files, and the original archive from any shared or public location after verifying the Worker.

Example conversion workflow on a secure local machine:

```bash
# Inspect aliases without printing private key material.
keytool -list -v -storetype PKCS12 -keystore project-sandbox.p12

# Export a temporary private key. Keep the password prompt private.
openssl pkcs12 -in project-sandbox.p12 -nocerts -nodes -out temporary-key.pem

# Convert to an unencrypted PKCS#8 PEM file for the Worker.
openssl pkcs8 -topk8 -nocrypt -in temporary-key.pem -out mastercard-signing-key-pkcs8.pem

# Verify the PEM header only; never print the key body.
head -1 mastercard-signing-key-pkcs8.pem
```

The expected header is usually:

```text
-----BEGIN PRIVATE KEY-----
```

Do not paste the output of `cat mastercard-signing-key-pkcs8.pem` into chat or GitHub.

## Store the secrets in the Worker

The SmartGen Worker uses these secret names:

```text
MASTERCARD_CONSUMER_KEY
MASTERCARD_SIGNING_KEY_PEM
```

With Wrangler, the safe pattern is:

```bash
npx wrangler secret put MASTERCARD_CONSUMER_KEY
npx wrangler secret put MASTERCARD_SIGNING_KEY_PEM
```

Paste each value only when Wrangler prompts for it. Never include the secret as a command-line argument, source-file value, workflow log, or GitHub Action variable unless the storage and masking policy has been reviewed.

SmartGen also uses non-secret configuration such as:

```text
MASTERCARD_BASE_URL=https://sandbox.api.mastercard.com/send/static
MASTERCARD_PARTNER_ID=ptnr_BEeCrYJHh2BXTXPy_PEtp-8DBOo
MASTERCARD_CURRENCY=USD
MASTERCARD_PAYMENT_ORIGINATION_COUNTRY=BGD
```

The Consumer Key and signing key are still secret even when the API calls are made only to Sandbox.

## Rotation and expiry

Mastercard project keys can expire. Track the expiry date in the company’s operational calendar. Before expiry, create or renew the replacement key according to the Mastercard project page, upload the replacement secret to a non-production Worker, run health and signer tests, then deploy the new key to Production during a controlled maintenance window.

If a key or keystore password is exposed, treat it as compromised. Revoke or rotate it in Mastercard Developers, create a replacement key pair, update the Worker secret, test the new secret, and remove the exposed material from local downloads, shell history, CI logs, tickets, screenshots, and chat. Do not rely on the fact that the key was “only Sandbox.”

## OAuth 2.0 note

The attached OAuth 2.0/FAPI guide is general Mastercard platform documentation. The current MPQR API Basics documentation requires OAuth 1.0a Authorization headers. Do not migrate the MPQR Worker to OAuth 2.0 unless Mastercard confirms that OAuth 2.0 is enabled and supported for this exact MPQR project and environment.

## Key-handling checklist

| Check | Complete when |
|---|---|
| Project owner | A stable business/team account controls the project |
| Sandbox/Production separation | Separate credentials and endpoints are documented |
| Private key | Stored only in the Worker secret manager or approved vault |
| Repository scan | No key, Consumer Key, password, or `.p12` archive is committed |
| Rotation plan | Expiry and revocation steps are recorded |
| Exposure response | The team knows how to revoke and replace a compromised key |

## References

[1]: https://developer.mastercard.com/mastercard-merchant-presented-qr/documentation/server-apis/getting-started/ "Mastercard MPQR Getting Started"
[2]: https://developer.mastercard.com/mastercard-merchant-presented-qr/documentation/server-apis/api-reference/payment-api/ "Mastercard MPQR Payment API"
