import { createMastercardPayment, mastercardMissingConfig, retrieveMastercardTransfer } from "./mastercard-mpqr.js";

/**
 * SmartGen bKash Sandbox Payment Gateway
 *
 * Cloudflare Worker API for a GitHub Pages frontend.
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

function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...headers,
    },
  });
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
  if (missing.length) return json({ error: "Worker is not configured", missing }, 503);

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
    return json({ error: "bKash payment creation failed", details: error.data || error.message }, error.status || 502);
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
  const missing = mastercardMissingConfig(env);
  if (missing.length) return json({ error: "Mastercard MPQR adapter is not configured", missing }, 503);
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Request body must be valid JSON" }, 400);
  }
  if (!validAmount(body.amount)) return json({ error: "amount must be a positive amount with up to 2 decimals" }, 400);
  try {
    const result = await createMastercardPayment(env, {
      amount: body.amount,
      transferReference: body.transferReference,
    });
    return json({ ok: true, correlationId: result.correlationId, result: result.data });
  } catch (error) {
    return json({ error: "Mastercard sandbox payment failed", correlationId: error.correlationId, details: error.data || error.message }, error.status || 502);
  }
}

async function handleMastercardRetrieve(request, env) {
  const missing = mastercardMissingConfig(env);
  if (missing.length) return json({ error: "Mastercard MPQR adapter is not configured", missing }, 503);
  const url = new URL(request.url);
  const transferId = url.searchParams.get("transferId");
  const transferReference = url.searchParams.get("ref");
  if (!transferId && !transferReference) return json({ error: "transferId or ref is required" }, 400);
  try {
    const result = await retrieveMastercardTransfer(env, { transferId, transferReference });
    return json({ ok: true, correlationId: result.correlationId, result: result.data });
  } catch (error) {
    return json({ error: "Mastercard sandbox retrieval failed", correlationId: error.correlationId, details: error.data || error.message }, error.status || 502);
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
    return json({ ok: true, result });
  } catch (error) {
    return json({ error: "bKash payment query failed", details: error.data || error.message }, error.status || 502);
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
        service: "smartgen-bkash-sandbox-gateway",
        configured: missingConfig(c).length === 0,
        missing: missingConfig(c),
        createPath: c.createPath,
        frontendUrl: c.frontendUrl,
        mastercardConfigured: mastercardMissingConfig(env).length === 0,
        mastercardMissing: mastercardMissingConfig(env),
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
