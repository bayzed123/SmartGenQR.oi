# SmartGen Barcode System

The **SmartGen Barcode System** is a first-party browser-side barcode tool for ecommerce teams. It validates supported product identifiers, renders downloadable SVG barcodes locally, and helps a client’s own product-admin dashboard stop invalid barcode saves before they reach the client’s backend.

> **Core rule:** SmartGen supplies the barcode interface and browser code. Each client keeps ownership of its product database, file bucket, administrator session, API credentials, and final product save.

## Documentation map

| Start here | Build and operate | Business information |
|---|---|---|
| [System documentation](docomation.md) | [Installation](installation.md) | [Pricing](Pricing.md) |
| [How to use the tool](how-to-use.md) | [API and form contract](api.md) | [About SmartGen](about.md) |
| [Who uses barcodes](who-use-barcode.md) | [Benefits](how-benifit.md) | [Get started](call-to-action.md) |

## What the system does

The browser tool currently supports **Code 128**, **Code 39**, **EAN-13**, and **UPC-A**. The retail formats can calculate a missing check digit or reject an invalid check digit. The inventory formats validate their allowed character rules before the product form is submitted.

The output is an SVG created in the browser. No barcode payload is sent to a SmartGen data API, and no client API key is requested by the integration. The client’s own backend remains responsible for saving products and assets.

## Recommended reading order

Begin with [System documentation](docomation.md) for the architecture. Continue with [Installation](installation.md) and [How to use the tool](how-to-use.md) to configure a client admin workflow. Technical teams should then read the [API and form contract](api.md) before testing in a non-production store.

## Navigation

**You are here:** Overview · [Documentation](docomation.md) · [Installation](installation.md) · [API](api.md) · [Pricing](Pricing.md) · [About](about.md) · [How to use](how-to-use.md) · [Who uses barcodes](who-use-barcode.md) · [Benefits](how-benifit.md) · [Get started](call-to-action.md)

## References

[1] [SmartGen Barcode Service README](../../barcode-service/README.md)  
[2] [SmartGen Barcode Service testing record](../../barcode-service/TESTING.md)
