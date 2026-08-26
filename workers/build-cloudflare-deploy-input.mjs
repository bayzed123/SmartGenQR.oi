import fs from "node:fs";

const files = [
  {
    name: "bkash-payment-gateway.js",
    contentType: "application/javascript+module",
    source: fs.readFileSync(new URL("./bkash-payment-gateway.js", import.meta.url), "utf8"),
  },
  {
    name: "mastercard-mpqr.js",
    contentType: "application/javascript+module",
    source: fs.readFileSync(new URL("./mastercard-mpqr.js", import.meta.url), "utf8"),
  },
];

const code = `async () => {
  const boundary = \`----SmartGen\${Date.now()}\`;
  const metadata = { main_module: "bkash-payment-gateway.js", compatibility_date: "2026-08-26" };
  const files = ${JSON.stringify(files)};
  const parts = [
    \`--\${boundary}\`,
    'Content-Disposition: form-data; name="metadata"',
    'Content-Type: application/json',
    '',
    JSON.stringify(metadata),
  ];
  for (const file of files) {
    parts.push(
      \`--\${boundary}\`,
      \`Content-Disposition: form-data; name="\${file.name}"; filename="\${file.name}"\`,
      \`Content-Type: \${file.contentType}\`,
      '',
      file.source,
    );
  }
  parts.push(\`--\${boundary}--\`, '');
  const body = parts.join("\\r\\n");
  return cloudflare.request({
    method: "PUT",
    path: \`/accounts/\${accountId}/workers/scripts/smartgen-bkash-sandbox\`,
    body,
    contentType: \`multipart/form-data; boundary=\${boundary}\`,
    rawBody: true,
  });
}`;

fs.writeFileSync("/tmp/cloudflare-deploy-input.json", JSON.stringify({ code }));
console.log("Wrote /tmp/cloudflare-deploy-input.json");
