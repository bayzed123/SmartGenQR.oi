import fs from "node:fs";

const source = fs.readFileSync(new URL("./bkash-payment-gateway.js", import.meta.url), "utf8");
const code = `async () => {
  const source = ${JSON.stringify(source)};
  const boundary = \`----SmartGen\${Date.now()}\`;
  const metadata = { main_module: "bkash-payment-gateway.js", compatibility_date: "2026-08-26" };
  const body = [
    \`--\${boundary}\`,
    'Content-Disposition: form-data; name="metadata"',
    'Content-Type: application/json',
    '',
    JSON.stringify(metadata),
    \`--\${boundary}\`,
    'Content-Disposition: form-data; name="bkash-payment-gateway.js"; filename="bkash-payment-gateway.js"',
    'Content-Type: application/javascript+module',
    '',
    source,
    \`--\${boundary}--\`,
    ''
  ].join("\\r\\n");
  return cloudflare.request({
    method: "PUT",
    path: \`/accounts/\${accountId}/workers/scripts/smartgen-bkash-sandbox\`,
    body,
    contentType: \`multipart/form-data; boundary=\${boundary}\`,
    rawBody: true
  });
}`;
fs.writeFileSync("/tmp/cloudflare-deploy-input.json", JSON.stringify({ code }));
console.log("Wrote /tmp/cloudflare-deploy-input.json");
