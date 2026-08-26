# How to Use SmartGen Barcode System

Use the public tool for local barcode generation, or connect the same SmartGen browser file to a client’s product-admin form. The operational goal is the same in both cases: validate before labels or products are saved.

## Generate a barcode locally

| Step | Action |
|---:|---|
| 1 | Open the [SmartGen Barcode Service](https://smartgentools.com/barcode-service/). |
| 2 | Select Code 128, Code 39, EAN-13, or UPC-A. |
| 3 | Enter the product or inventory value. |
| 4 | Read the local validation message. Correct any invalid value before download. |
| 5 | Choose ink color, background color, height, and visible value text. |
| 6 | Download the local SVG and test a physical print before a production run. |

## Add validation to a client product form

First complete [Installation](installation.md), then add the configuration from [API](api.md). When the administrator creates or edits a product, the integration checks the barcode field. An invalid value stops the form. A valid value can be normalized and then saved by the client’s existing backend.

## Daily operating guidance

Use the format that matches the client workflow. Use EAN-13 or UPC-A only when the store has the correct retail identifier. Use Code 128 or Code 39 for internal stock, inventory, warehouse, or operational labels when those formats suit the client’s scanner and label process.

Maintain a final quality step: scan a physical sample printed on the final label material. A browser preview confirms the symbol generation, but operational scanning quality also depends on print size, contrast, quiet zones, printer settings, and scanner configuration.

## Navigation

[Overview](index.md) · [Documentation](docomation.md) · [Installation](installation.md) · [API](api.md) · [Pricing](Pricing.md) · [About](about.md) · **How to use** · [Who uses barcodes](who-use-barcode.md) · [Benefits](how-benifit.md) · [Get started](call-to-action.md)

## References

[1] [SmartGen Barcode Service](https://smartgentools.com/barcode-service/)  
[2] [Testing record](../../barcode-service/TESTING.md)
