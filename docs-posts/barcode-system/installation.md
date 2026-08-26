# Installation

Install the SmartGen Barcode System in a client’s **staging admin dashboard** first. The integration is browser-side and has no SmartGen server setup, database migration, API key, or product-data synchronization step.

## Prerequisites

| Requirement | Reason |
|---|---|
| Existing product-admin form | The integration attaches to the client’s own create or edit product form. |
| Barcode value field | The normalized value is written back to this field before submit. |
| Barcode format field | The selected format determines the local validation rule. |
| Client-owned save endpoint | The client backend performs the final authenticated save. |
| Staging store or test product | The integration should be tested before production labels are created. |

## Step 1: Add the SmartGen script

Place the first-party file in the client repository, or load it from the SmartGen domain:

```html
<script src="https://smartgentools.com/barcode-service/barcode-service.js"></script>
```

The file is self-hosted by SmartGen and contains the current SmartGen-owned validation and SVG-rendering logic. It does not need a client secret or SmartGen API key.

## Step 2: Identify the product fields

Confirm the CSS selectors for the product form, barcode input, and format select. Example selectors are `#client-product-form`, `#product-barcode`, and `#barcode-format`. Use the actual selectors from the client dashboard.

## Step 3: Attach the form validation

Use the form contract in [API](api.md). The integration validates each entry and prevents invalid form submission. It then emits a local valid-barcode event when the value is ready for the client’s normal save process.

## Step 4: Test before production

Create one product with an invalid barcode and confirm that the form is blocked. Then create a product with a valid value and confirm the client backend receives the normalized barcode. Finally, print and scan one physical label in the client’s actual operational environment.

## Navigation

[Overview](index.md) · [Documentation](docomation.md) · **Installation** · [API](api.md) · [Pricing](Pricing.md) · [About](about.md) · [How to use](how-to-use.md) · [Who uses barcodes](who-use-barcode.md) · [Benefits](how-benifit.md) · [Get started](call-to-action.md)

## References

[1] [Client integration guide](../../barcode-service/CLIENT-INTEGRATION-GUIDE.md)  
[2] [Testing checklist](../../barcode-service/TESTING.md)
