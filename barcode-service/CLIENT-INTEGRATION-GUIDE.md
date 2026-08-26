# SmartGen Barcode Service: Client Integration Guide

## What is now live in the repository

The `barcode-service/` folder is a self-hosted static product. Once the site’s existing deployment publishes the `main` branch, the public tool is available at:

```text
https://smartgentools.com/barcode-service/
```

The service is composed entirely of files delivered from the SmartGen repository. The browser loads the page, styling, validation code, and the local barcode renderer from the same `barcode-service/` folder. It does not call a SmartGen API, save barcode values to a SmartGen database, send a product request through a SmartGen server, or use a third-party hosted barcode service.

## How the barcode generator works

The generator validates the value in the browser before it creates the SVG barcode. EAN-13 and UPC-A values use a local modulo-10 check-digit calculation. A user may enter the body of a retail identifier, and the tool adds the missing check digit. If a user enters a complete identifier with the wrong final digit, the preview is blocked and the error is shown immediately.

| Format | Accepted input | Browser result |
|---|---|---|
| **EAN-13** | 12 digits, or a valid 13-digit value | Calculates or verifies the check digit, then renders the SVG. |
| **UPC-A** | 11 digits, or a valid 12-digit value | Calculates or verifies the check digit, then renders the SVG. |
| **Code 128** | 1–80 printable characters | Renders a local inventory, stock, or internal product barcode. |
| **Code 39** | Uppercase letters, digits, spaces, and `- . $ / + %` | Normalizes lowercase input to uppercase and blocks unsupported characters. |

> **Important:** The tool verifies a barcode’s structure and check digit. It does not issue retail barcodes or prove that a number has been assigned to a particular company or product. Clients must use identifiers they are authorized to use.

When the user clicks **Download local SVG**, the browser creates the file locally. No product data is uploaded during generation or download.

## Add it to a client ecommerce admin dashboard

The client must keep their normal product create/update form and their normal backend. Add the self-hosted SmartGen script to the client admin page, then connect the client’s existing fields.

```html
<script src="https://smartgentools.com/barcode-service/barcode-service.js"></script>

<script>
  SmartGenBarcode.attachProductForm({
    form: "#client-product-form",
    barcodeInput: "#product-barcode",
    formatInput: "#barcode-format",
    statusElement: "#barcode-status",
    onValid: ({ barcode, format, normalized }) => {
      // The input is now validated locally.
      // The client's normal form submission saves it to the client's own backend.
      console.log({ barcode, format, normalized });
    }
  });
</script>
```

The integration watches the barcode and format fields as the client creates a product. When a value is invalid, the plugin displays an error and cancels the product form submission. When the value is valid, it writes any normalized value—such as a calculated retail check digit—back into the client barcode field. The client’s own product form then continues its normal submission to the client’s own server.

The plugin also emits a `smartgen:valid-barcode` event on the product form. A client may listen to the event to update a preview or product workflow without sending data to SmartGen.

```js
document.querySelector("#client-product-form").addEventListener("smartgen:valid-barcode", event => {
  const { barcode, format } = event.detail;
  // Use the value only inside the client’s own product-admin workflow.
});
```

## Secret-key and storage rules

Never add a real ecommerce API key, private token, or storage-bucket credential to `onValid`, browser JavaScript, HTML, or an admin-page field. Browser code can be inspected by anyone who has access to the page.

The client’s own backend must keep its server credentials, authorization rules, product database, and product image bucket. The client’s authenticated product-create request should persist the valid barcode with the rest of the product record. SmartGen has no role in that request and does not store the product barcode.

## Deployment and verification

The barcode service is committed to the `main` branch under commit `1f3f0e4`. The current repository deployment must publish the `main` branch as usual. After it finishes, open the public URL and test the following flow:

1. Select **EAN-13** and enter `590123412345`. The status must report that the check digit was added and the barcode should render as `5901234123457`.
2. Enter `5901234123458`. The tool must show an invalid check-digit error and clear the barcode preview.
3. Download the valid SVG. The browser should download it locally without a product-data upload.
4. In a client test admin page, attach the integration to a product form. Submit an invalid EAN-13 and confirm the form does not continue. Submit a valid value and confirm the client’s own backend receives the normalized barcode.

The repository includes repeatable checks:

```bash
node barcode-service/test/validation.test.mjs
node barcode-service/test/product-form-contract.test.mjs
```

## Current service offer and payment status

The public product message is **$10 lifetime service**. The first published version is intentionally payment-free so its browser-only generator and client-admin validation flow can be tested without a checkout dependency. PayPal, local payments, checkout, license activation, and automatic billing are not included yet. They can be designed after the static product flow has been tested on the live SmartGen domain.
