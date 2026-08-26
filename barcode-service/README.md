# SmartGen Barcode Service

`barcode-service/` is a static, self-hosted barcode generator and product-form validator. It does not call a SmartGen API, collect product data, save barcode values, require a client API key, or use third-party barcode-rendering code. All barcode rendering and validation occur in the browser through SmartGen-owned code.

For the full client workflow, field contract, secret-handling rules, deployment checks, and limitations, read [CLIENT-INTEGRATION-GUIDE.md](CLIENT-INTEGRATION-GUIDE.md). The draft SmartGen-owned product license is in [SMARTGEN-PROPRIETARY-LICENSE.txt](SMARTGEN-PROPRIETARY-LICENSE.txt).

## Client-admin integration

Load `barcode-service.js` from the SmartGen domain or copy it to the client’s own repository. Then connect their existing product form. The integration prevents a form submission when a barcode is not valid for the selected format. For EAN-13 and UPC-A, it calculates a missing check digit and verifies an existing check digit before allowing the product to save.

```html
<script src="https://smartgentools.com/barcode-service/barcode-service.js"></script>
<script>
  SmartGenBarcode.attachProductForm({
    form: "#client-product-form",
    barcodeInput: "#product-barcode",
    formatInput: "#barcode-format",
    onValid: ({ barcode, format }) => {
      // The client’s own product backend saves this value.
      // Do not place server API keys in this browser callback.
      document.querySelector("#product-barcode").value = barcode;
    }
  });
</script>
```

The client’s product server keeps its own authentication, CSRF checks, sessions, storage bucket, and real credentials. The browser plugin only validates and normalizes the barcode before the client’s normal product-save request runs.

## Local verification

Run the validation and product-form contract tests from the repository root:

```bash
node barcode-service/test/validation.test.mjs
node barcode-service/test/product-form-contract.test.mjs
```

The local JavaScript dependency used for rendering is stored under `barcode-service/vendor/`. It is delivered from the SmartGen repository and does not make a network request to a third-party barcode or analytics service.
