# bKash Account and API Access for SmartGen

I am not a bKash representative, so confirm eligibility, fees, limits, and approval directly with bKash before opening or using a business account.

## Short answer

A normal personal bKash account does not provide the merchant API credentials required by the SmartGen Cloudflare Worker. You cannot simply convert a personal account into an API merchant account. The App Key, App Secret, API username, password, and sandbox base URL are issued by bKash during merchant or online-payment onboarding.[1]

Do not use either phone number as a merchant number until bKash approves it. A phone number can be registered only if it satisfies bKash’s identity and account-eligibility checks. Never share your bKash PIN, OTP, NID photograph, App Secret, or password in GitHub, chat, or screenshots.

## Which account should you choose?

| Your situation | Suitable path | Will it automatically give API credentials? |
|---|---|---|
| You only need to receive occasional payments personally | Keep your personal bKash account and use a payment request, QR, or another bKash-supported manual method | No |
| You operate a small online or retail business and do not have a trade license | Apply for a **Personal Retail Account (PRA)** | Not automatically; ask bKash separately about online-payment/API eligibility |
| You have a business, trade license, and bank account | Apply for a **bKash Merchant Account** and request Online Payment Gateway/API onboarding | No; API access requires approval and credentials |
| You need the SmartGen automated checkout Worker | Request **bKash Online Payment Gateway / Tokenized Checkout sandbox access** | Yes, after bKash approves and issues credentials |

bKash says a Personal Retail Account is intended for micro and small retail or f-commerce businesses. Its published requirements include an NID, a valid mobile number registered against that NID that has not previously been used to open a bKash account, proof of SIM ownership, and—where applicable—nominee information.[2] bKash also states that a personal bKash account cannot be transferred into a Personal Retail Account.[2]

## Recommended path for SmartGen

If SmartGen is being operated as an online business and you do not yet have a trade license, first review the official [Online Business](https://www.bkash.com/en/business/online-business) process and apply for a Personal Retail Account if you meet its requirements. The official page says businesses without a trade license may use this route.[3]

If you have a valid trade license, use the official [Merchant application](https://www.bkash.com/en/business/merchant). The form requests business name, district, contact information, NID status, trade-license information, and bank-account information.[4]

After the account is approved, contact bKash and explicitly request:

> “Sandbox Online Payment Gateway credentials for Tokenized Checkout API integration: API username, API password, App Key, App Secret, exact sandbox API base URL, route version, authorization-header format, and approved callback URL.”

The official bKash developer documentation says the username and password are provided during onboarding, the App Key and App Secret are required for the Grant Token request, and the base URL is shared during onboarding.[1]

## About the two phone numbers

Do not assume that either number can become a merchant number. Use the number that is legally registered to you and meets bKash’s eligibility rules. If the second number already has a bKash account, it may not qualify for a new Personal Retail Account under the published requirement that the number must not have been used to open a bKash account.[2] bKash—not the Worker and not GitHub—must approve the registration.

If you only want to test the Worker code without obtaining a merchant account, keep using the included mocked smoke test. It verifies the code locally but cannot create a real bKash payment. A real sandbox Create Payment test requires real bKash sandbox credentials; the sample payment URL and payment ID previously shared are not credentials and should not be reused.

## After bKash gives you credentials

Run the following from the repository’s `workers` directory. Each command stores the value as an encrypted Cloudflare Worker secret:

```bash
npx wrangler secret put BKASH_USERNAME
npx wrangler secret put BKASH_PASSWORD
npx wrangler secret put BKASH_APP_KEY
npx wrangler secret put BKASH_APP_SECRET
```

Then set the exact bKash sandbox base URL and API paths in `workers/wrangler.toml`, deploy the Worker, and update `PAYMENT_WORKER_URL` in `payment-gateway/index.html`. Never put the four credentials in `wrangler.toml` or frontend JavaScript.

## Official references

[1]: https://developer.bka.sh/docs/grant-token-3 "bKash Grant Token"
[2]: https://www.bkash.com/en/page/personal-retail-account "bKash Personal Retail Account"
[3]: https://www.bkash.com/en/business/online-business "bKash Online Business"
[4]: https://www.bkash.com/en/business/merchant "bKash Merchant"
