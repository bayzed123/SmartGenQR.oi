# API and Product-Form Contract

The SmartGen Barcode System exposes a small browser API. It is designed to work with an existing ecommerce admin form, not to replace the client’s product API.

## Global object

```js
SmartGenBarcode
```

| Method | Purpose |
|---|---|
| `validate(format, value)` | Checks a barcode value and returns a validity result. |
| `prepareProductBarcode({ format, barcode })` | Returns a normalized product barcode when the input is valid. |
| `encode(format, value)` | Returns the first-party encoded module pattern for a valid value. |
| `attachProductForm(config)` | Connects local validation to an existing client product form. |

## Form integration example

```html
<script src="https://smartgentools.com/barcode-service/barcode-service.js"></script>
<script>
  SmartGenBarcode.attachProductForm({
    form: "#client-product-form",
    barcodeInput: "#product-barcode",
    formatInput: "#barcode-format",
    statusElement: "#barcode-status",
    onValid: ({ barcode, format, normalized }) => {
      document.querySelector("#product-barcode").value = barcode;
      console.log({ barcode, format, normalized });
    }
  });
</script>
```

## Configuration contract

| Property | Required | Description |
|---|---:|---|
| `form` | Yes | Selector or form element for the client’s product form. |
| `barcodeInput` | Yes | Selector or input element containing the barcode value. |
| `formatInput` | Yes | Selector or select element containing the barcode format. |
| `statusElement` | No | Element that receives local validation feedback. |
| `onValid` | No | Client-side callback after a valid barcode is normalized. |

## Local event

After a valid form submit attempt, the form dispatches a browser event named `smartgen:valid-barcode`. Its detail object contains `barcode`, `format`, and `normalized` values. The event is local to the browser page; it does not send a request to SmartGen.

```js
document.querySelector("#client-product-form").addEventListener("smartgen:valid-barcode", event => {
  const { barcode, format } = event.detail;
  // Continue with the client’s normal authenticated product workflow.
});
```

> Do not place a real ecommerce API key, storage key, or payment credential in `onValid` or any other browser code. Keep those secrets on the client server.

## Navigation

[Overview](index.md) · [Documentation](docomation.md) · [Installation](installation.md) · **API** · [Pricing](Pricing.md) · [About](about.md) · [How to use](how-to-use.md) · [Who uses barcodes](who-use-barcode.md) · [Benefits](how-benifit.md) · [Get started](call-to-action.md)

## References

[1] [SmartGen Barcode Service source and documentation](../../barcode-service/README.md)  
[2] [Client integration guide](../../barcode-service/CLIENT-INTEGRATION-GUIDE.md)
