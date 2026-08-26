const DEFAULT_MPQR_BASE_URL = "https://sandbox.api.mastercard.com/send/static";
const DEFAULT_PARTNER_ID = "ptnr_BEeCrYJHh2BXTXPy_PEtp-8DBOo";

function encode(value) {
  return encodeURIComponent(String(value))
    .replace(/[!'()*]/g, (character) => `%${character.charCodeAt(0).toString(16).toUpperCase()}`);
}

function base64(bytes) {
  let binary = "";
  for (let index = 0; index < bytes.length; index += 1) binary += String.fromCharCode(bytes[index]);
  return btoa(binary);
}

function pemToBytes(pem) {
  const normalized = pem
    .replace(/-----BEGIN (?:RSA )?PRIVATE KEY-----/g, "")
    .replace(/-----END (?:RSA )?PRIVATE KEY-----/g, "")
    .replace(/\s+/g, "");
  const binary = atob(normalized);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

async function sha256Base64(value) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return base64(new Uint8Array(digest));
}

function normalizedUrl(url) {
  const parsed = new URL(url);
  return `${parsed.protocol}//${parsed.host}${parsed.pathname || "/"}`;
}

function parameterString(url, oauthParameters) {
  const parsed = new URL(url);
  const parameters = [
    ...parsed.searchParams.entries(),
    ...Object.entries(oauthParameters),
  ].map(([name, value]) => [encode(name), encode(value)]);
  parameters.sort((left, right) => left[0].localeCompare(right[0]) || left[1].localeCompare(right[1]));
  return parameters.map(([name, value]) => `${name}=${value}`).join("&");
}

async function signRsaSha256(signingBaseString, signingKeyPem) {
  const key = await crypto.subtle.importKey(
    "pkcs8",
    pemToBytes(signingKeyPem),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    { name: "RSASSA-PKCS1-v1_5" },
    key,
    new TextEncoder().encode(signingBaseString),
  );
  return base64(new Uint8Array(signature));
}

/**
 * Creates the Mastercard-specific OAuth 1.0a Authorization header.
 * The private signing key must be a PKCS#8 PEM key stored as a Worker secret.
 */
export async function createMastercardAuthorizationHeader({ url, method, body = "", consumerKey, signingKeyPem }) {
  if (!consumerKey || !signingKeyPem) throw new Error("Mastercard consumer key and signing key are required");
  const oauth = {
    oauth_consumer_key: consumerKey,
    oauth_nonce: crypto.randomUUID().replace(/-/g, ""),
    oauth_signature_method: "RSA-SHA256",
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_version: "1.0",
  };
  if (body) oauth.oauth_body_hash = await sha256Base64(body);
  const normalizedParameters = parameterString(url, oauth);
  const signingBaseString = [method.toUpperCase(), normalizedUrl(url), normalizedParameters]
    .map(encode)
    .join("&");
  oauth.oauth_signature = await signRsaSha256(signingBaseString, signingKeyPem);
  return `OAuth ${Object.entries(oauth)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([name, value]) => `${encode(name)}="${encode(value)}"`)
    .join(", ")}`;
}

function safeTransferReference(value) {
  const candidate = String(value || `SGMPQR_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`);
  if (!/^[A-Za-z0-9*._~-]{6,40}$/.test(candidate)) throw new Error("transferReference must be 6–40 safe characters");
  return candidate;
}

async function parseResponse(response) {
  const text = await response.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text.slice(0, 2000) };
  }
  if (!response.ok) {
    const error = new Error(data.Description || data.description || `Mastercard HTTP ${response.status}`);
    error.status = response.status;
    error.data = data;
    error.correlationId = response.headers.get("correlation-id");
    throw error;
  }
  return { data, correlationId: response.headers.get("correlation-id") };
}

function mastercardConfig(env) {
  return {
    baseUrl: String(env.MASTERCARD_BASE_URL || DEFAULT_MPQR_BASE_URL).replace(/\/$/, ""),
    partnerId: env.MASTERCARD_PARTNER_ID || DEFAULT_PARTNER_ID,
    consumerKey: env.MASTERCARD_CONSUMER_KEY,
    signingKeyPem: env.MASTERCARD_SIGNING_KEY_PEM,
    senderAccountUri: env.MASTERCARD_TEST_SENDER_ACCOUNT_URI,
    recipientAccountUri: env.MASTERCARD_TEST_RECIPIENT_ACCOUNT_URI,
    currency: env.MASTERCARD_CURRENCY || "USD",
    paymentOriginationCountry: env.MASTERCARD_PAYMENT_ORIGINATION_COUNTRY || "BGD",
    cardAcceptorName: env.MASTERCARD_CARD_ACCEPTOR_NAME || "SmartGen Sandbox",
  };
}

export function mastercardMissingConfig(env) {
  const config = mastercardConfig(env);
  return [
    ["MASTERCARD_CONSUMER_KEY", config.consumerKey],
    ["MASTERCARD_SIGNING_KEY_PEM", config.signingKeyPem],
    ["MASTERCARD_TEST_SENDER_ACCOUNT_URI", config.senderAccountUri],
    ["MASTERCARD_TEST_RECIPIENT_ACCOUNT_URI", config.recipientAccountUri],
  ].filter(([, value]) => !value).map(([name]) => name);
}

export async function createMastercardPayment(env, { amount, transferReference }) {
  const config = mastercardConfig(env);
  const path = `/v1/partners/${encode(config.partnerId)}/merchant/transfers/payment`;
  const url = `${config.baseUrl}${path}`;
  const payload = {
    merchant_payment_transfer: {
      payment_type: "P2M",
      amount: String(amount),
      currency: config.currency,
      payment_origination_country: config.paymentOriginationCountry,
      sender_account_uri: config.senderAccountUri,
      recipient_account_uri: config.recipientAccountUri,
      participant: { card_acceptor_name: config.cardAcceptorName },
      funding_source: "CASH",
      channel: "KIOSK",
      transfer_reference: safeTransferReference(transferReference),
    },
  };
  const body = JSON.stringify(payload);
  const authorization = await createMastercardAuthorizationHeader({
    url,
    method: "POST",
    body,
    consumerKey: config.consumerKey,
    signingKeyPem: config.signingKeyPem,
  });
  const response = await fetch(url, {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      authorization,
    },
    body,
  });
  return parseResponse(response);
}

export async function retrieveMastercardTransfer(env, { transferId, transferReference }) {
  const config = mastercardConfig(env);
  let url;
  if (transferId) {
    url = `${config.baseUrl}/v1/partners/${encode(config.partnerId)}/merchant/transfers/${encode(transferId)}`;
  } else if (transferReference) {
    url = `${config.baseUrl}/v1/partners/${encode(config.partnerId)}/merchant/transfers?ref=${encode(transferReference)}`;
  } else {
    throw new Error("transferId or transferReference is required");
  }
  const authorization = await createMastercardAuthorizationHeader({
    url,
    method: "GET",
    consumerKey: config.consumerKey,
    signingKeyPem: config.signingKeyPem,
  });
  const response = await fetch(url, {
    method: "GET",
    headers: { accept: "application/json", authorization },
  });
  return parseResponse(response);
}
