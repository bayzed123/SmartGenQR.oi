# SmartGen Barcode Service: Ecommerce Administrator Presentation Script

**Audience:** Ecommerce administrators, store owners, and client technical teams  
**Recommended duration:** 8–10 minutes  
**Purpose:** Explain how the SmartGen Barcode Service validates product barcodes in the browser while keeping product data, credentials, and final product storage under the client’s control.

> **Presenter note:** This presentation explains the current first-party implementation. The SmartGen software license notice is a working draft and should be reviewed by qualified legal counsel before it becomes a final customer agreement.

| Slide | On-screen title | Presenter outcome |
|---:|---|---|
| 1 | SmartGen Barcode Service | Establish the first-party, browser-only position. |
| 2 | Why the architecture changed | Explain removal of third-party code and licensing. |
| 3 | Who owns what | Clarify the SmartGen browser layer versus the client backend. |
| 4 | The product-admin data flow | Show how a valid barcode reaches the client’s own server. |
| 5 | Barcode validation before save | Explain the format and checksum controls. |
| 6 | Secrets and security boundary | Make the browser/server credential rule clear. |
| 7 | Connect the client’s existing admin form | Explain the integration interface. |
| 8 | What the client backend does | Clarify storage, product update, and bucket ownership. |
| 9 | Service offer and operating limits | Set expectations for the $10 lifetime offer and current scope. |
| 10 | Launch checklist | Give administrators a practical adoption sequence. |

---

## Slide 1 — SmartGen Barcode Service

### On-screen content

**Reliable barcodes. Nothing stored.**

**A first-party, browser-side barcode tool for ecommerce product administration.**

* SmartGen-owned rendering code
* No SmartGen product database
* No client secret in browser code
* No third-party barcode service

### Presenter script

“Today I will show how SmartGen Barcode Service works inside an ecommerce product-admin workflow. The key point is simple: SmartGen supplies a self-hosted browser tool, but each client keeps ownership of their own products, backend, storage bucket, and server credentials.

The barcode is validated and drawn directly in the administrator’s browser. Product information is not sent to a SmartGen database. The client’s existing product system remains the only place where the final product record is saved.”

---

## Slide 2 — Why the architecture changed

### On-screen content

**Original rule: SmartGen must own the tool code.**

| Removed | Current position |
|---|---|
| Third-party barcode renderer | SmartGen-owned encoder and SVG renderer |
| External software license file | SmartGen proprietary software-license draft |
| Vendor asset folder | Single self-hosted SmartGen JavaScript file |

### Presenter script

“We corrected an important ownership issue. An earlier version included a locally copied third-party barcode-rendering library. It did not make an external request, but it was still third-party code and it included another developer’s copyright license.

That does not match the SmartGen rule. We removed the vendor code and its MIT license file. The current tool uses SmartGen-owned browser-side code for validation, barcode encoding, and SVG drawing. The only product license shown with the tool is now SmartGen’s own draft software license, which must be legally reviewed before it is used as a final commercial agreement.”

---

## Slide 3 — Who owns what

### On-screen content

```text
SmartGen domain / client browser                 Client ecommerce server
───────────────────────────────                  ───────────────────────
SmartGen JavaScript                              Client login/session
Local barcode validation                         Client product database
Local SVG preview and download                   Client image / file bucket
Product-form validation event                    Client product create/update API

No SmartGen product-data storage                 Client keeps real credentials
```

### Presenter script

“This slide defines the ownership boundary. SmartGen owns the barcode interface and the client-side code that runs inside the browser. The client owns the ecommerce system: the user account, permissions, product records, images, inventory, and storage bucket.

The SmartGen script does not replace the client’s product API. It improves the product form before the client’s normal save action continues. This gives clients a valid barcode workflow without moving their product data into a new SmartGen system.”

---

## Slide 4 — The product-admin data flow

### On-screen content

```text
1. Admin enters product information and barcode value
                ↓
2. SmartGen browser code validates the selected barcode format
                ↓
3. Invalid value: browser blocks form submission and shows an error
                ↓
4. Valid value: browser normalizes the barcode and raises a local event
                ↓
5. Client’s existing form submits to client’s own backend
                ↓
6. Client backend saves product and barcode to the client’s own database
```

### Presenter script

“The product-admin flow is local first. An administrator enters a barcode and chooses the correct format. SmartGen validates the value before the product form is allowed to save.

If the barcode is invalid, the browser stops the form submission. If it is valid, the browser writes the normalized value back into the product field. For example, it can add a missing valid retail check digit. Then the client’s existing backend handles the final product update in the same way it does today.

There is no SmartGen redirect, database write, or product-data transfer in this flow.”

---

## Slide 5 — Barcode validation before save

### On-screen content

| Format | Client-admin behavior |
|---|---|
| **EAN-13** | Accepts 12 digits and calculates the final check digit, or verifies a full 13-digit identifier. |
| **UPC-A** | Accepts 11 digits and calculates the final check digit, or verifies a full 12-digit identifier. |
| **Code 128** | Uses SmartGen’s browser-side Code Set B encoder for readable internal product and inventory values. |
| **Code 39** | Normalizes supported values to uppercase and blocks unsupported characters. |

### Presenter script

“The first layer is structural validity. EAN-13 and UPC-A values are checked using local check-digit logic. Code 128 is intended for flexible product, stock, or inventory values. Code 39 handles a controlled uppercase character set.

It is important to explain the limit: a structurally valid retail barcode is not proof that a business owns that identifier. The store must still use identifiers assigned or authorized for its products. Before printing at scale, the client should test a final physical label with its own scanner and packaging material.”

---

## Slide 6 — Secrets and security boundary

### On-screen content

**Never place real secrets in browser code.**

| Safe in browser | Must stay on the client server |
|---|---|
| Barcode value | Ecommerce API secret |
| Barcode format | Private database credential |
| Public form selectors | Storage-bucket key |
| Product form event | Payment credential |

### Presenter script

“This rule protects every client. A browser script can be viewed by users who can access the page, so real API keys and storage credentials must never be placed in the SmartGen integration snippet.

The browser only validates a barcode and lets the client’s normal authenticated form request continue. The client’s server session, CSRF protection, permissions, and private credentials remain on the client’s own backend. SmartGen does not need those secrets, and the tool will not ask for them.”

---

## Slide 7 — Connect the client’s existing admin form

### On-screen content

```html
<script src="https://smartgentools.com/barcode-service/barcode-service.js"></script>
<script>
SmartGenBarcode.attachProductForm({
  form: "#client-product-form",
  barcodeInput: "#product-barcode",
  formatInput: "#barcode-format"
});
</script>
```

### Presenter script

“Integration is intentionally small. The client loads one file hosted on the SmartGen domain, or copies the same SmartGen-owned file into the client’s own repository. Then the client provides three existing page selectors: the product form, the barcode input, and the format input.

The integration listens to the barcode field and product-form submit event. It prevents an invalid product from being saved. When the barcode is valid, it dispatches a local `smartgen:valid-barcode` event. The client can use that event to update its preview, audit display, or product workflow without sending data to SmartGen.”

---

## Slide 8 — What the client backend does

### On-screen content

**The SmartGen tool validates. The client backend owns the product.**

* Authenticate the administrator
* Enforce role and product permissions
* Save the product record and validated barcode
* Save images and files in the client-owned bucket
* Audit product changes according to the client’s policies

### Presenter script

“SmartGen does not create a competing product database. The client backend remains responsible for authentication, authorization, product creation, updates, images, inventory, and audit history.

When a client administrator adds a new product, SmartGen helps ensure the barcode field is structurally valid before the form reaches the client backend. The backend then owns the final decision to save the product. This design allows clients to use the barcode service while keeping their ecommerce architecture and data governance unchanged.”

---

## Slide 9 — Service offer and operating limits

### On-screen content

**Current public message: $10 lifetime service**

**Included now**

* First-party browser barcode generator
* Local SVG export
* Product-admin validation integration
* No SmartGen product-data storage

**Not enabled yet**

* Checkout, PayPal, and local payments
* Automatic activation or license verification
* SmartGen payment processing

### Presenter script

“The public message is a $10 lifetime service. However, the first priority is a stable tool. Payment, checkout, automatic activation, and license verification are intentionally not enabled in this version.

This avoids making the core tool dependent on a payment provider or a new data platform. Once the first-party browser tool is tested in real client admin workflows, SmartGen can decide whether payment and activation should be built on a separate SmartGen-owned system.”

---

## Slide 10 — Administrator launch checklist

### On-screen content

| Step | Owner | Confirmation |
|---:|---|---|
| 1 | SmartGen admin | Open the barcode page and test each supported format. |
| 2 | Client technical team | Connect the script to a non-production product form. |
| 3 | Client ecommerce admin | Test invalid and valid barcode submissions. |
| 4 | Client backend owner | Confirm the normalized barcode is saved only in the client system. |
| 5 | Client operations team | Print and scan a physical test label. |
| 6 | SmartGen admin | Approve production use after the workflow is confirmed. |

### Presenter script

“The final step is controlled testing. Start in a client test environment. Confirm that an invalid barcode blocks the product form, a valid barcode reaches the client backend, and no browser code contains a private client credential.

Then print a real label and scan it using the client’s operational scanner. After the client confirms that workflow, the tool is ready for that client’s production admin environment.”

---

## Closing statement

“SmartGen Barcode Service is designed as a first-party browser tool, not a product-data platform. SmartGen owns the barcode code and presentation layer. Each client owns its ecommerce backend, credentials, products, bucket, and final save process. That separation keeps the service simple, private, and practical for ecommerce administrators.”

## References

[1] [SmartGen Barcode Service repository documentation](https://github.com/bayzed123/SmartGenQR.oi/tree/main/barcode-service)  
[2] [SmartGen client integration guide](https://github.com/bayzed123/SmartGenQR.oi/blob/main/barcode-service/CLIENT-INTEGRATION-GUIDE.md)  
[3] [SmartGen proprietary license draft](https://github.com/bayzed123/SmartGenQR.oi/blob/main/barcode-service/SMARTGEN-PROPRIETARY-LICENSE.txt)
