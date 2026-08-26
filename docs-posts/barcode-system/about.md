# About SmartGen Barcode System

SmartGen Barcode System is designed for stores that need a clear and private way to create valid product barcodes. It is a self-hosted browser tool built around a simple separation of responsibilities: SmartGen owns the barcode interface, while the client owns their ecommerce data and backend operations.

## Product principles

| Principle | Meaning in practice |
|---|---|
| First-party implementation | The barcode service uses SmartGen-owned validation and rendering code. |
| Client data ownership | Product records and assets stay in the client’s existing system. |
| Browser-side operation | Barcode validation and SVG generation occur locally in the administrator’s browser. |
| No exposed secrets | Client server keys, bucket keys, and payment credentials do not belong in browser code. |
| Practical integration | The tool attaches to an existing product form instead of requiring a platform replacement. |

## What SmartGen does not do

The service does not issue retail identifiers, decide product ownership, replace the client’s ecommerce database, or save the client’s product records. It helps a client prevent format errors and generate a barcode asset before the client’s own product workflow continues.

## Navigation

[Overview](index.md) · [Documentation](docomation.md) · [Installation](installation.md) · [API](api.md) · [Pricing](Pricing.md) · **About** · [How to use](how-to-use.md) · [Who uses barcodes](who-use-barcode.md) · [Benefits](how-benifit.md) · [Get started](call-to-action.md)

## References

[1] [SmartGen Barcode Service README](../../barcode-service/README.md)  
[2] [SmartGen proprietary license draft](../../barcode-service/SMARTGEN-PROPRIETARY-LICENSE.txt)
