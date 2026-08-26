# Payment Platform Research Notes

## Bangladesh Bank official page

Source: https://www.bb.org.bd/en/index.php/financialactivity/paysystems

Bangladesh Bank's Payment Systems Department states that it issues licenses in two broad categories under BPSSR-2014: Payment Service Provider (PSP) and Payment System Operator (PSO). The page describes PSPs as companies that facilitate payments or payment processes directly to customers and settle transactions through a scheduled bank or financial institution. It describes PSOs as companies operating settlement systems among participants where the principal participant is a scheduled bank or financial institution, and specifically includes payment gateways and payment aggregators as examples. Bangladesh Bank reviews market demand, business rationale, regulatory requirements, risk management, settlement systems, eligibility criteria, and other matters when considering licensing.

## ShurjoPay official page

Source: https://shurjopay.com.bd/

ShurjoPay describes itself as a secure payment gateway for Bangladesh with merchant onboarding, dashboard reporting, multiple payment channels, API and plugin integrations, and a PSO license. The official page says it supports cards, bKash, Nagad, Rocket, and other channels, promotes merchant onboarding and integration, and states that it received a Payment System Operator (PSO) license from Bangladesh Bank in 2016. This indicates that ShurjoPay is not just a frontend or API wrapper; it is a regulated payment-platform operator with acquiring/settlement relationships, risk/compliance processes, merchant operations, and multiple provider integrations.

## Mastercard Developers findings

Sources: https://developer.mastercard.com/products ; https://developer.mastercard.com/mastercard-processing-core/documentation/ ; https://developer.mastercard.com/mastercard-merchant-presented-qr/documentation/server-apis/api-reference/payment-api/

A Mastercard Developers account can provide documentation, API specifications, project access, and sandbox testing. Mastercard Processing Core is aimed at issuers and financial institutions/fintechs building card programs, card lifecycle, transaction, and processing services; the official documentation says card-scheme licensing and a processor relationship are part of the setup before issuing cards. It is not a ready-made Bangladesh merchant payment gateway and does not itself give a small business the right to acquire card payments or settle funds.

The Mastercard Merchant Presented QR Payment API exposes a sandbox endpoint and simulated responses. The official docs state that sandbox use requires a Mastercard Developers project and OAuth 1.0a authorization, while MTF and production use a partner reference ID obtained through the MPQR program. This is useful for technical prototyping and a future QR/card rail, but it does not replace Bangladesh Bank licensing, a local acquiring/settlement relationship, or merchant onboarding.

## Architecture conclusion

The practical near-term product is a secure payment orchestration platform: the user's software owns the checkout UI, order state, idempotency, webhook/event processing, refunds, reporting, and merchant dashboard, while one or more licensed PSP/PSO, bank, MFS, or card-acquiring partners perform regulated payment processing and settlement. A fully independent ShurjoPay-like gateway requires regulated status and direct network, bank, MFS, and card-scheme agreements; it cannot be created solely with a personal bKash account, a Mastercard Developers account, GitHub, or a Cloudflare Worker.
