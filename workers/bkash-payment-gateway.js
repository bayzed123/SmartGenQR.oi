import { createMastercardPayment, mastercardMissingConfig, retrieveMastercardTransfer } from "./mastercard-mpqr.js";

/**
 * SmartGen Mastercard MPQR Sandbox Payment Gateway
 *
 * Cloudflare Worker API for a GitHub Pages frontend. bKash routes remain
 * disabled until approved merchant/API onboarding is available.
 * All bKash credentials must be configured as Worker secrets or environment
 * variables; never place them in this repository or in browser JavaScript.
 */

const DEFAULTS = {
  tokenPath: "/tokenized-checkout/token/grant",
  createPath: "/tokenized-checkout/payment/create",
  executePath: "/tokenized-checkout/payment/execute",
  queryPath: "/tokenized-checkout/payment/query",
  authPrefix: "",
  frontendUrl: "https://bayzed123.github.io/SmartGenQR.oi/payment-gateway/",
};

let tokenCache = { value: null, expiresAt: 0 };
const rateBuckets = new Map();
const idempotencyCache = new Map();
const CACHE_TTL_MS = 10 * 60 * 1000;

function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...headers,
    },
  });
}

function enabled(value) {
  return String(value || "").toLowerCase() === "true";
}

function constantTimeEqual(left, right) {
  const a = new TextEncoder().encode(String(left || ""));
  const b = new TextEncoder().encode(String(right || ""));
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i += 1) result |= a[i] ^ b[i];
  return result === 0;
}

function clientAddress(request) {
  return request.headers.get("CF-Connecting-IP") || request.headers.get("X-Forwarded-For")?.split(",")[0]?.trim() || "unknown";
}

function rateLimitResponse(request, env, bucket) {
  const limit = Math.max(1, Math.min(120, Number(env.RATE_LIMIT_PER_MINUTE || 15)));
  const now = Date.now();
  const key = `${bucket}:${clientAddress(request)}`;
  const previous = rateBuckets.get(key) || { startedAt: now, count: 0 };
  if (now - previous.startedAt >= 60_000) {
    previous.startedAt = now;
    previous.count = 0;
  }
  previous.count += 1;
  rateBuckets.set(key, previous);
  if (rateBuckets.size > 2000) {
    for (const [entryKey, entry] of rateBuckets) if (now - entry.startedAt >= 60_000) rateBuckets.delete(entryKey);
  }
  if (previous.count > limit) return json({ error: "Rate limit exceeded" }, 429, { "retry-after": "60" });
  return null;
}

function authResponse(request, env) {
  if (!enabled(env.REQUIRE_CLIENT_AUTH)) return null;
  const expected = env.SMARTGEN_CLIENT_API_KEY || "";
  const provided = request.headers.get("X-SmartGen-Api-Key") || request.headers.get("Authorization")?.replace(/^Bearer\s+/i, "") || "";
  if (!expected || !provided || !constantTimeEqual(provided, expected)) {
    return json({ error: "Authentication required" }, 401, { "www-authenticate": "Bearer" });
  }
  return null;
}

function productionControlResponse(env, body = {}) {
  if (enabled(env.REQUIRE_IDEMPOTENCY_KEY) && !String(body.orderId || body.idempotencyKey || body.transferReference || body.orderToken || "").trim()) {
    return json({ error: "Idempotency key, orderToken, or orderId is required" }, 400);
  }
  return null;
}

function base64urlBytes(value) {
  const normalized = String(value || "").replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(String(value || "").length / 4) * 4, "=");
  const binary = atob(normalized);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

async function verifyOrderToken(token, secret) {
  const [encodedPayload, encodedSignature] = String(token || "").split(".");
  if (!encodedPayload || !encodedSignature || !secret) throw new Error("Invalid order token");
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"],
  );
  const valid = await crypto.subtle.verify(
    "HMAC",
    key,
    base64urlBytes(encodedSignature),
    new TextEncoder().encode(encodedPayload),
  );
  if (!valid) throw new Error("Invalid order token");
  const payload = JSON.parse(new TextDecoder().decode(base64urlBytes(encodedPayload)));
  if (!payload || typeof payload !== "object" || !payload.orderId || !validAmount(payload.amount)) throw new Error("Invalid order token payload");
  if (payload.expiresAt && Date.parse(payload.expiresAt) <= Date.now()) throw new Error("Order token expired");
  if (payload.exp && Number(payload.exp) <= Math.floor(Date.now() / 1000)) throw new Error("Order token expired");
  return payload;
}

async function resolveMastercardPaymentInput(env, body) {
  if (!enabled(env.REQUIRE_ORDER_BINDING)) return { amount: body.amount, transferReference: body.transferReference };
  try {
    const order = await verifyOrderToken(body.orderToken, env.SMARTGEN_ORDER_SIGNING_SECRET);
    const transferReference = String(order.transferReference || order.orderId);
    if (!/^[A-Za-z0-9*._~-]{6,40}$/.test(transferReference)) throw new Error("Order token reference is invalid");
    return { amount: String(order.amount), transferReference, orderId: String(order.orderId) };
  } catch (error) {
    return { error: json({ error: "A valid signed order token is required" }, 401) };
  }
}

function getAllowedOrigins(env) {
  return (env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function corsHeaders(request, env) {
  const origin = request.headers.get("Origin") || "";
  const allowed = getAllowedOrigins(env);
  const allowOrigin = allowed.includes(origin) ? origin : allowed[0] || "";
  return {
    ...(allowOrigin ? { "access-control-allow-origin": allowOrigin } : {}),
    "access-control-allow-methods": "GET,POST,OPTIONS",
    "access-control-allow-headers": "Content-Type, Authorization",
    "access-control-max-age": "86400",
    vary: "Origin",
  };
}

function withCors(response, request, env) {
  const headers = new Headers(response.headers);
  for (const [key, value] of Object.entries(corsHeaders(request, env))) {
    headers.set(key, value);
  }
  headers.set("strict-transport-security", "max-age=31536000; includeSubDomains");
  headers.set("x-content-type-options", "nosniff");
  headers.set("x-frame-options", "DENY");
  headers.set("referrer-policy", "no-referrer");
  headers.set("content-security-policy", "default-src 'none'; frame-ancestors 'none'; form-action 'none'");
  return new Response(response.body, { status: response.status, headers });
}

function cleanPath(value, fallback) {
  if (!value) return fallback;
  return value.startsWith("/") ? value : `/${value}`;
}

function config(env) {
  return {
    baseUrl: String(env.BKASH_BASE_URL || "").replace(/\/$/, ""),
    username: env.BKASH_USERNAME,
    password: env.BKASH_PASSWORD,
    appKey: env.BKASH_APP_KEY,
    appSecret: env.BKASH_APP_SECRET,
    tokenPath: cleanPath(env.BKASH_TOKEN_PATH, DEFAULTS.tokenPath),
    createPath: cleanPath(env.BKASH_CREATE_PATH, DEFAULTS.createPath),
    executePath: cleanPath(env.BKASH_EXECUTE_PATH, DEFAULTS.executePath),
    queryPath: cleanPath(env.BKASH_QUERY_PATH, DEFAULTS.queryPath),
    authPrefix: env.BKASH_AUTH_PREFIX || DEFAULTS.authPrefix,
    callbackUrl: env.BKASH_CALLBACK_URL,
    frontendUrl: env.FRONTEND_URL || DEFAULTS.frontendUrl,
  };
}

function missingConfig(c) {
  return [
    ["BKASH_BASE_URL", c.baseUrl],
    ["BKASH_USERNAME", c.username],
    ["BKASH_PASSWORD", c.password],
    ["BKASH_APP_KEY", c.appKey],
    ["BKASH_APP_SECRET", c.appSecret],
  ].filter(([, value]) => !value).map(([name]) => name);
}

async function readJson(response) {
  const text = await response.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return { raw: text.slice(0, 1000) };
  }
}

const CLIENT_SENSITIVE_KEY = /(authorization|consumer|signing|private|secret|password|token|pan|cvc|cvv|pin|account.?uri|app.?key|app.?secret)/i;

function sanitizeForClient(value, depth = 0) {
  if (depth > 8) return "[omitted]";
  if (Array.isArray(value)) return value.map((item) => sanitizeForClient(item, depth + 1));
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.entries(value).map(([key, item]) => [
    key,
    CLIENT_SENSITIVE_KEY.test(key) ? "[redacted]" : sanitizeForClient(item, depth + 1),
  ]));
}

function extractMastercardTransfer(data) {
  const direct = data?.merchant_transfer || data?.merchantTransfer || data?.result?.merchant_transfer || data?.result?.merchantTransfer;
  if (direct && !Array.isArray(direct)) return direct;
  const list = data?.merchant_transfers?.data?.merchant_transfer
    || data?.merchantTransfers?.data?.merchantTransfer
    || data?.result?.merchant_transfers?.data?.merchant_transfer
    || data?.result?.merchantTransfers?.data?.merchantTransfer;
  if (Array.isArray(list)) return list[0] || null;
  return null;
}

function publicMastercardData(data) {
  const transfer = extractMastercardTransfer(data);
  if (!transfer || typeof transfer !== "object" || !transfer.id) return null;
  const transaction = transfer?.transaction_history?.data?.transaction?.[0] || {};
  const safeTransfer = {
    id: transfer.id || null,
    transfer_reference: transfer.transfer_reference || null,
    status: transfer.status || null,
    original_status: transfer.original_status || null,
    transfer_amount: transfer.transfer_amount && {
      value: transfer.transfer_amount.value || null,
      currency: transfer.transfer_amount.currency || null,
    },
    created: transfer.created || transfer.transaction_local_date_time || null,
  };
  if (transaction.id || transaction.status || transaction.unique_reference_number) {
    safeTransfer.transaction_history = {
      data: {
        transaction: [{
          id: transaction.id || null,
          status: transaction.status || null,
          unique_reference_number: transaction.unique_reference_number || null,
          transaction_amount: transaction.transaction_amount && {
            value: transaction.transaction_amount.value || null,
            currency: transaction.transaction_amount.currency || null,
          },
        }],
      },
    };
  }
  return { merchant_transfer: safeTransfer };
}

async function bkashRequest(path, options, c) {
  const response = await fetch(`${c.baseUrl}${path}`, {
    ...options,
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      ...(options.headers || {}),
    },
  });
  const data = await readJson(response);
  if (!response.ok) {
    const error = new Error(data.errorMessage || data.statusMessage || `bKash HTTP ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }
  return data;
}

async function getAccessToken(c) {
  const now = Date.now();
  if (tokenCache.value && tokenCache.expiresAt > now + 60_000) {
    return tokenCache.value;
  }

  const token = await bkashRequest(c.tokenPath, {
    method: "POST",
    headers: {
      username: c.username,
      password: c.password,
    },
    body: JSON.stringify({ app_key: c.appKey, app_secret: c.appSecret }),
  }, c);

  const value = token.id_token || token.access_token || token.token;
  if (!value) throw new Error("bKash token response did not include an access token");
  const expiresIn = Number(token.expires_in || 3600);
  tokenCache = { value, expiresAt: now + Math.max(60, expiresIn - 60) * 1000 };
  return value;
}

function authorizationHeader(token, c) {
  return c.authPrefix ? `${c.authPrefix} ${token}` : token;
}

function safeInvoice() {
  const now = new Date();
  const stamp = now.toISOString().replace(/\D/g, "").slice(0, 14);
  const random = crypto.randomUUID().replace(/-/g, "").slice(0, 10);
  return `SG-${stamp}-${random}`;
}

function validReference(value) {
  return typeof value === "string" && value.length >= 1 && value.length <= 255 && !/[<>&]/.test(value);
}

function validAmount(value) {
  if (typeof value !== "string" && typeof value !== "number") return false;
  const text = String(value);
  return /^\d{1,9}(\.\d{1,2})?$/.test(text) && Number(text) > 0;
}

function createPayload(body, callbackUrl) {
  const amount = String(body.amount);
  const payload = {
    payerReference: body.payerReference || "Customer",
    callbackURL: callbackUrl,
    amount,
    intent: body.intent || "authorization",
    platform: body.platform || "https://smartgentools.com",
    currency: "BDT",
    merchantInvoiceNumber: safeInvoice(),
  };
  if (body.agreementID) payload.agreementID = body.agreementID;
  if (body.mode) payload.mode = body.mode;
  return payload;
}

function redirectToResult(c, params) {
  const target = new URL(c.frontendUrl);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") target.searchParams.set(key, String(value));
  }
  return Response.redirect(target.toString(), 303);
}

async function handleCreate(request, env) {
  const c = config(env);
  const missing = missingConfig(c);
  if (missing.length) return json({ error: "Worker is not configured" }, 503);

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Request body must be valid JSON" }, 400);
  }
  if (!validAmount(body.amount)) return json({ error: "amount must be a positive BDT amount with up to 2 decimals" }, 400);
  if (body.payerReference !== undefined && !validReference(body.payerReference)) {
    return json({ error: "payerReference must be 1–255 characters and cannot contain <, >, or &" }, 400);
  }
  if (body.platform !== undefined && !validReference(body.platform)) {
    return json({ error: "platform is invalid" }, 400);
  }

  try {
    const token = await getAccessToken(c);
    const callbackUrl = c.callbackUrl || new URL("/api/payments/callback", request.url).toString();
    const result = await bkashRequest(c.createPath, {
      method: "POST",
      headers: {
        authorization: authorizationHeader(token, c),
        "x-app-key": c.appKey,
      },
      body: JSON.stringify(createPayload(body, callbackUrl)),
    }, c);
    return json({
      ok: true,
      paymentId: result.paymentId || result.paymentID,
      bkashURL: result.bkashURL,
      merchantInvoiceNumber: result.merchantInvoiceNumber,
      amount: result.amount,
      currency: result.currency || "BDT",
      transactionStatus: result.transactionStatus,
      callbackURL: result.callbackURL,
    });
  } catch (error) {
    return json({ error: "bKash payment creation failed", details: sanitizeForClient(error.data || error.message) }, error.status || 502);
  }
}

async function executePayment(paymentId, c) {
  const token = await getAccessToken(c);
  return bkashRequest(c.executePath, {
    method: "POST",
    headers: {
      authorization: authorizationHeader(token, c),
      "x-app-key": c.appKey,
    },
    body: JSON.stringify({ paymentID: paymentId, paymentId }),
  }, c);
}

async function handleCallback(request, env) {
  const c = config(env);
  const url = new URL(request.url);
  const paymentId = url.searchParams.get("paymentID") || url.searchParams.get("paymentId");
  const providerStatus = (url.searchParams.get("status") || "unknown").toLowerCase();
  if (!paymentId) return redirectToResult(c, { status: "error", message: "Missing payment ID" });

  if (providerStatus !== "success") {
    return redirectToResult(c, { status: providerStatus, paymentId });
  }

  if (missingConfig(c).length) return redirectToResult(c, { status: "error", paymentId, message: "Worker is not configured" });

  try {
    const result = await executePayment(paymentId, c);
    const completed = String(result.transactionStatus || "").toLowerCase() === "completed";
    return redirectToResult(c, {
      status: completed ? "success" : "pending",
      paymentId,
      trxID: result.trxID,
      transactionStatus: result.transactionStatus,
      amount: result.amount,
      message: result.statusMessage,
    });
  } catch (error) {
    return redirectToResult(c, { status: "error", paymentId, message: error.data?.errorMessage || error.message });
  }
}

async function handleMastercardPayment(request, env) {
  const limited = rateLimitResponse(request, env, "mastercard-payment");
  if (limited) return limited;
  const authenticated = authResponse(request, env);
  if (authenticated) return authenticated;
  const missing = mastercardMissingConfig(env);
  if (missing.length) return json({ error: "Mastercard MPQR adapter is not configured" }, 503);
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Request body must be valid JSON" }, 400);
  }
  const controlError = productionControlResponse(env, body);
  if (controlError) return controlError;
  const resolved = await resolveMastercardPaymentInput(env, body);
  if (resolved.error) return resolved.error;
  if (!validAmount(resolved.amount)) return json({ error: "The server-side order amount is invalid" }, 400);
  const idempotencyKey = String(request.headers.get("Idempotency-Key") || body.idempotencyKey || resolved.orderId || resolved.transferReference || "").trim();
  const cached = idempotencyCache.get(idempotencyKey);
  if (cached && cached.expiresAt > Date.now()) return cached.response.clone();
  if (enabled(env.REQUIRE_ORDER_BINDING) && resolved.transferReference) {
    try {
      const existing = await retrieveMastercardTransfer(env, { transferReference: resolved.transferReference });
      const safeExisting = publicMastercardData(existing.data);
      if (!safeExisting) {
        const notFound = new Error("No existing Mastercard transfer found");
        notFound.status = 404;
        throw notFound;
      }
      const response = json({ ok: true, reused: true, correlationId: existing.correlationId, result: safeExisting });
      if (idempotencyKey) idempotencyCache.set(idempotencyKey, { expiresAt: Date.now() + CACHE_TTL_MS, response: response.clone() });
      return response;
    } catch (error) {
      if (Number(error.status) !== 404) return json({ error: "Existing Mastercard transfer status is unresolved", correlationId: error.correlationId }, 409);
    }
  }
  try {
    const result = await createMastercardPayment(env, {
      amount: resolved.amount,
      transferReference: resolved.transferReference,
    });
    const response = json({ ok: true, correlationId: result.correlationId, result: publicMastercardData(result.data) });
    if (idempotencyKey) idempotencyCache.set(idempotencyKey, { expiresAt: Date.now() + CACHE_TTL_MS, response: response.clone() });
    return response;
  } catch (error) {
    return json({ error: "Mastercard sandbox payment failed", correlationId: error.correlationId }, error.status || 502);
  }
}

async function handleMastercardRetrieve(request, env) {
  const limited = rateLimitResponse(request, env, "mastercard-retrieve");
  if (limited) return limited;
  const authenticated = authResponse(request, env);
  if (authenticated) return authenticated;
  const missing = mastercardMissingConfig(env);
  if (missing.length) return json({ error: "Mastercard MPQR adapter is not configured" }, 503);
  const url = new URL(request.url);
  const transferId = url.searchParams.get("transferId");
  const transferReference = url.searchParams.get("ref");
  if (!transferId && !transferReference) return json({ error: "transferId or ref is required" }, 400);
  try {
    const result = await retrieveMastercardTransfer(env, { transferId, transferReference });
    const safeResult = publicMastercardData(result.data);
    if (!safeResult) return json({ error: "Mastercard transfer not found", correlationId: result.correlationId }, 404);
    return json({ ok: true, correlationId: result.correlationId, result: safeResult });
  } catch (error) {
    return json({ error: "Mastercard sandbox retrieval failed", correlationId: error.correlationId }, error.status || 502);
  }
}

async function handleQuery(request, env) {
  const c = config(env);
  const paymentId = new URL(request.url).searchParams.get("paymentId");
  if (!paymentId || !/^[A-Za-z0-9_-]{5,100}$/.test(paymentId)) return json({ error: "A valid paymentId is required" }, 400);
  if (missingConfig(c).length) return json({ error: "Worker is not configured" }, 503);
  try {
    const token = await getAccessToken(c);
    const result = await bkashRequest(c.queryPath, {
      method: "POST",
      headers: { authorization: authorizationHeader(token, c), "x-app-key": c.appKey },
      body: JSON.stringify({ paymentID: paymentId, paymentId }),
    }, c);
    return json({ ok: true, result: sanitizeForClient(result) });
  } catch (error) {
    return json({ error: "bKash payment query failed", details: sanitizeForClient(error.data || error.message) }, error.status || 502);
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const headers = corsHeaders(request, env);
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers });

    let response;
    if (url.pathname === "/health" && request.method === "GET") {
      const c = config(env);
      response = json({
        ok: true,
        service: "smartgen-mastercard-mpqr-sandbox-gateway",
        provider: "mastercard_mpqr",
        environment: "sandbox",
        configured: mastercardMissingConfig(env).length === 0,
        mastercardConfigured: mastercardMissingConfig(env).length === 0,
        bkashStatus: missingConfig(c).length === 0 ? "configured_but_inactive" : "on_hold",
        authMode: enabled(env.REQUIRE_CLIENT_AUTH) ? "required" : "sandbox_public",
        orderBinding: enabled(env.REQUIRE_ORDER_BINDING) ? "required" : "sandbox_legacy_amount",
        idempotency: enabled(env.REQUIRE_IDEMPOTENCY_KEY) ? "required_with_memory_guard" : "optional_with_memory_guard",
        rateLimitPerMinute: Math.max(1, Math.min(120, Number(env.RATE_LIMIT_PER_MINUTE || 15))),
        frontendUrl: c.frontendUrl,
      });
    } else if (url.pathname === "/api/payments/create" && request.method === "POST") {
      response = await handleCreate(request, env);
    } else if (url.pathname === "/api/mastercard/mpqr/payment" && request.method === "POST") {
      response = await handleMastercardPayment(request, env);
    } else if (url.pathname === "/api/mastercard/mpqr/retrieve" && request.method === "GET") {
      response = await handleMastercardRetrieve(request, env);
    } else if (url.pathname === "/api/payments/callback" && request.method === "GET") {
      response = await handleCallback(request, env);
    } else if (url.pathname === "/api/payments/status" && request.method === "GET") {
      response = await handleQuery(request, env);
    } else {
      response = json({ error: "Not found" }, 404);
    }
    return withCors(response, request, env);
  },
};
