# Barcode System Documentation

The SmartGen Barcode System works as a **client-side validation and rendering layer**. It does not replace a client’s ecommerce platform. Instead, it improves the client’s product-admin form before the client’s existing backend performs its normal product save.

## Architecture at a glance

```text
Ecommerce administrator browser                 Client-owned ecommerce backend
────────────────────────────────                ─────────────────────────────
SmartGen barcode form controls                  Administrator authentication
First-party barcode validation                  Product database
First-party SVG barcode rendering               Product create/update process
Local valid-barcode event                       Client-owned media bucket

No SmartGen product-data storage                No client credential in browser code
```

## Product workflow

| Step | Browser action | Client-owned action |
|---:|---|---|
| 1 | Administrator enters a format and barcode value. | The client’s normal product form remains open. |
| 2 | SmartGen validates the value locally. | No request is sent to SmartGen. |
| 3 | Invalid values block the form submit event. | The product is not saved. |
| 4 | Valid retail values can be normalized. | The valid barcode is present in the form field. |
| 5 | The form continues to its normal destination. | The client backend saves the product under its own rules. |

## Supported validation rules

EAN-13 accepts twelve digits and calculates the final check digit, or validates a full thirteen-digit value. UPC-A follows the same pattern with eleven or twelve digits. Code 128 accepts printable product and inventory text through the current SmartGen Code Set B encoder. Code 39 accepts uppercase letters, digits, spaces, and its documented symbol set.

> A structurally valid retail code is not proof that a business owns the product identifier. The store team must use identifiers that are valid and authorized for its own products.

## Privacy boundary

SmartGen should never receive a client’s product payload, database connection string, private API key, payment credential, or storage-bucket key. The browser integration needs only the selectors for an existing form and fields. The client backend continues to use its own session controls, permissions, and server-side secrets.

## Navigation

[Overview](index.md) · **Documentation** · [Installation](installation.md) · [API](api.md) · [Pricing](Pricing.md) · [About](about.md) · [How to use](how-to-use.md) · [Who uses barcodes](who-use-barcode.md) · [Benefits](how-benifit.md) · [Get started](call-to-action.md)

## References

[1] [Client integration guide](../../barcode-service/CLIENT-INTEGRATION-GUIDE.md)  
[2] [Barcode Service testing record](../../barcode-service/TESTING.md)
