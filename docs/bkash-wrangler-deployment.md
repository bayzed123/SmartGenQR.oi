# SmartGen bKash Worker Deployment with Wrangler

This guide deploys the bKash sandbox gateway already added to [`bayzed123/SmartGenQR.oi`](https://github.com/bayzed123/SmartGenQR.oi). The public checkout page is available at [`https://smartgentools.com/payment-gateway/`](https://smartgentools.com/payment-gateway/), while the API runs on a separate Cloudflare Worker.

The integration keeps the bKash username, password, App Key, and App Secret on the server. They must never be committed to GitHub or placed in the checkout page. Cloudflare documents Worker secrets as encrypted bindings accessed through the Worker `env` object, and recommends `wrangler secret put` for adding them.[1]

## 1. Repository structure

The relevant files are already in the repository:

| Path | Purpose |
|---|---|
| `payment-gateway/index.html` | GitHub Pages checkout form |
| `workers/bkash-payment-gateway.js` | Cloudflare Worker API |
| `workers/wrangler.toml.example` | Safe deployment configuration template |
| `workers/README.md` | Worker-specific setup and security notes |
| `workers/smoke-test.mjs` | Local deterministic tests that do not contact bKash |
| `docs/bkash-research.md` | Official API findings and verification notes |

Clone the repository and enter the Worker directory:

```bash
git clone https://github.com/bayzed123/SmartGenQR.oi.git
cd SmartGenQR.oi
cp workers/wrangler.toml.example workers/wrangler.toml
cd workers
```

The repository already exists, so you do not need to create another one. If you are starting a separate project, create it with GitHub’s interface or with `gh repo create <name> --private`, then push your local files. A public repository is normally required for GitHub Pages on plans that do not include Pages for private repositories.

## 2. Install Wrangler and log in

Use a current Node.js release and run Wrangler through `npx`, or install Wrangler locally in the Worker package. Cloudflare’s command documentation uses the `npx wrangler <command>` form and recommends keeping Wrangler associated with the project rather than relying on a global installation.[2]

```bash
node --version
npm --version
npm install --save-dev wrangler@latest
npx wrangler --version
npx wrangler login
npx wrangler whoami
```

`wrangler login` opens a browser authorization flow. Choose the Cloudflare account that owns the Worker. If you have multiple accounts, verify the selected account before deploying. You can also set the account explicitly in `workers/wrangler.toml` with an `account_id` field, or set `CLOUDFLARE_ACCOUNT_ID` in your shell.

## 3. Configure the Worker

Open `workers/wrangler.toml` and replace the placeholder API host with the exact **bKash sandbox API base URL** supplied during onboarding:

```toml
name = "smartgen-bkash-sandbox"
main = "bkash-payment-gateway.js"
compatibility_date = "2026-08-26"

[vars]
BKASH_BASE_URL = "https://YOUR-BKASH-SANDBOX-API-HOST"
BKASH_TOKEN_PATH = "/tokenized-checkout/token/grant"
BKASH_CREATE_PATH = "/tokenized-checkout/payment/create"
BKASH_EXECUTE_PATH = "/tokenized-checkout/payment/execute"
BKASH_QUERY_PATH = "/tokenized-checkout/payment/query"
BKASH_AUTH_PREFIX = ""
ALLOWED_ORIGINS = "https://smartgentools.com,https://bayzed123.github.io"
FRONTEND_URL = "https://smartgentools.com/payment-gateway/"
BKASH_CALLBACK_URL = "https://smartgen-bkash-sandbox.YOUR-SUBDOMAIN.workers.dev/api/payments/callback"
```

Use the API host, not the hosted checkout URL. For example, do not use a URL beginning with `https://sandbox.payment.bkash.com/?paymentId=...` as `BKASH_BASE_URL`; that is a customer redirect URL, not the API base URL.

The supplied request uses the v2-style route `/tokenized-checkout/payment/create`, which is the default in this project. Some bKash onboarding profiles use the official v1.2.0-beta route family instead. In that case, change the four paths to the exact routes supplied by bKash, such as `/tokenized/checkout/token/grant`, `/tokenized/checkout/create`, `/tokenized/checkout/execute`, and the corresponding query route. Do not guess the base URL or route family.

The official bKash reference describes the token grant endpoint as requiring `username` and `password` headers, with `app_key` and `app_secret` in the request body.[3] The official Create Payment reference describes the authorization token and `X-App-Key` headers and documents the hosted `bkashURL` returned to the merchant.[4]

## 4. Add bKash credentials as Worker secrets

Run these commands from the `workers` directory. Each command prompts for the value so the credential is not displayed in the shell command or stored in Git:

```bash
npx wrangler secret put BKASH_USERNAME
npx wrangler secret put BKASH_PASSWORD
npx wrangler secret put BKASH_APP_KEY
npx wrangler secret put BKASH_APP_SECRET
```

The values come from your bKash sandbox merchant onboarding information. The App Key identifies the application, and the App Secret authenticates it privately. Do not put them in `wrangler.toml`, `.env`, frontend JavaScript, GitHub commits, screenshots, or public chat.

For local development only, create `workers/.dev.vars` using dotenv syntax. The repository’s `.gitignore` already excludes `.dev.vars` and `.env` files:

```bash
BKASH_BASE_URL="https://YOUR-BKASH-SANDBOX-API-HOST"
BKASH_USERNAME="your-sandbox-username"
BKASH_PASSWORD="your-sandbox-password"
BKASH_APP_KEY="your-sandbox-app-key"
BKASH_APP_SECRET="your-sandbox-app-secret"
ALLOWED_ORIGINS="http://localhost:8787,https://smartgentools.com"
FRONTEND_URL="http://localhost:8787/payment-gateway/"
BKASH_CALLBACK_URL="http://localhost:8787/api/payments/callback"
```

Never commit this file. Cloudflare specifically warns that local secret files should not be committed and recommends using `.dev.vars` or `.env` for local development only.[1]

## 5. Deploy the Worker

Deploy from the `workers` directory:

```bash
npx wrangler deploy --config wrangler.toml
```

Wrangler will print the deployed Worker URL, normally similar to:

```text
https://smartgen-bkash-sandbox.<your-subdomain>.workers.dev
```

If you deploy before adding the bKash secrets, the Worker can still answer `/health`, but payment creation will return a configuration error. After the Worker URL is known, set `BKASH_CALLBACK_URL` to:

```text
https://smartgen-bkash-sandbox.<your-subdomain>.workers.dev/api/payments/callback
```

Update the value in `wrangler.toml` and redeploy. The callback URL must be public HTTPS so bKash can return the customer to the Worker.

## 6. Connect the GitHub Pages frontend

Open `payment-gateway/index.html` and replace the placeholder Worker URL:

```js
const PAYMENT_WORKER_URL = "https://smartgen-bkash-sandbox.<your-subdomain>.workers.dev";
```

Do not add a trailing slash. Commit and push the frontend change:

```bash
cd ..
git add payment-gateway/index.html workers/wrangler.toml
git commit -m "config: connect checkout to deployed bKash Worker"
git pull --rebase origin main
git push origin main
```

The existing GitHub Pages workflow will publish the page. The Worker’s `ALLOWED_ORIGINS` must include every origin from which the page is served. For the current site, keep `https://smartgentools.com` and optionally retain `https://bayzed123.github.io` for direct repository Pages access. Do not add a trailing slash to an origin.

## 7. Test safely

First run the local deterministic smoke test. It uses mocked upstream responses and does not call bKash:

```bash
cd workers
npm test
```

Then check the deployed Worker health endpoint:

```bash
curl -sS https://smartgen-bkash-sandbox.<your-subdomain>.workers.dev/health
```

A configured Worker should return JSON containing `"configured": true` and an empty `missing` array. If `configured` is false, check the four Worker secrets and redeploy or run `npx wrangler secret list`.

Create a new sandbox payment using the same small test amount as the supplied example:

```bash
curl -sS -X POST \
  https://smartgen-bkash-sandbox.<your-subdomain>.workers.dev/api/payments/create \
  -H 'content-type: application/json' \
  -d '{"amount":"4.53","payerReference":"Customer","platform":"https://smartgentools.com"}'
```

A successful response should contain a newly generated `paymentId`, a new `bkashURL`, `amount`, `currency`, and an `Initiated` transaction status. Open the returned `bkashURL` in a browser and use only the test wallet information supplied by bKash for your sandbox account.

Do not reuse the payment ID from the original example. bKash documents that a payment ID expires after a limited period and is valid for only one execution; after execution it may be used for query or search purposes but not executed again.[4] The Worker executes a successful provider callback server-side and redirects the result to the GitHub Pages checkout.

The direct status endpoint is:

```bash
curl -sS \
  "https://smartgen-bkash-sandbox.<your-subdomain>.workers.dev/api/payments/status?paymentId=TRxxxxxxxx"
```

Use this only with a newly created sandbox payment ID. A real payment should be considered complete only after the server-side execution response reports `transactionStatus` as `Completed`. The bKash Execute Payment reference identifies `Completed` as the successful final status.[5]

## 8. Optional GitHub Actions deployment

For automatic Worker deployment after changes to `workers/`, create `.github/workflows/deploy-bkash-worker.yml`:

```yaml
name: Deploy bKash Worker

on:
  push:
    branches: [main]
    paths:
      - "workers/**"
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    timeout-minutes: 15
    steps:
      - name: Check out repository
        uses: actions/checkout@v6

      - name: Deploy Worker
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          workingDirectory: workers
          command: deploy --config wrangler.toml
```

Before enabling this workflow, commit a configured `workers/wrangler.toml` containing no secrets. In GitHub repository settings, add `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` as Actions secrets. Cloudflare recommends a narrowly scoped API token with the **Edit Cloudflare Workers** permission rather than a broad account-wide token.[6] Do not add the bKash credentials to GitHub Actions unless you intentionally want CI to manage them; the safer arrangement is to store them once in the Worker’s encrypted secret store with `wrangler secret put`.

## 9. Common errors

| Error | Likely cause | Fix |
|---|---|---|
| `Authentication error` from Wrangler | Wrangler is not logged in or the API token lacks permission | Run `npx wrangler login` locally, or recreate a narrowly scoped Cloudflare API token for CI |
| `Worker is not configured` | One or more bKash secrets are missing | Run `npx wrangler secret put` for all four credentials |
| bKash HTTP 401 or 403 | Incorrect sandbox credentials, App Key, App Secret, or authorization prefix | Verify onboarding values and check whether `BKASH_AUTH_PREFIX` should be empty or `Bearer` |
| CORS error in the browser | The page origin is missing from `ALLOWED_ORIGINS` | Add `https://smartgentools.com` and redeploy |
| bKash callback does not return | Callback URL is not public HTTPS or does not match the deployed Worker | Set `BKASH_CALLBACK_URL` to the Worker callback endpoint and redeploy |
| Payment ID already used or timed out | A sample or old payment ID was reused | Create a new payment and use the new returned `bkashURL` |

## References

[1]: https://developers.cloudflare.com/workers/configuration/secrets/ "Cloudflare Workers Secrets"
[2]: https://developers.cloudflare.com/workers/wrangler/commands/ "Cloudflare Wrangler Commands"
[3]: https://developer.bka.sh/docs/grant-token-3 "bKash Grant Token"
[4]: https://developer.bka.sh/docs/create-payment-1 "bKash Create Payment"
[5]: https://developer.bka.sh/docs/execute-payment-1 "bKash Execute Payment"
[6]: https://developers.cloudflare.com/workers/ci-cd/external-cicd/github-actions/ "Cloudflare Workers GitHub Actions"
