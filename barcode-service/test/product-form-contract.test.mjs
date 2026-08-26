import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

class FakeElement extends EventTarget {
  constructor(value = "") {
    super();
    this.value = value;
    this.dataset = {};
    this.textContent = "";
    this.focused = false;
  }

  focus() {
    this.focused = true;
  }
}

class FakeCustomEvent extends Event {
  constructor(type, options = {}) {
    super(type, options);
    this.detail = options.detail;
  }
}

const form = new FakeElement();
const barcodeInput = new FakeElement("5901234123458");
const formatInput = new FakeElement("EAN13");
const status = new FakeElement();
const elements = {
  "#product-form": form,
  "#product-barcode": barcodeInput,
  "#barcode-format": formatInput,
  "#barcode-status": status,
};
const context = {
  console,
  Event,
  CustomEvent: FakeCustomEvent,
  document: {
    readyState: "loading",
    addEventListener() {},
    querySelector(selector) { return elements[selector] || null; },
  },
};
context.globalThis = context;
const source = fs.readFileSync(new URL("../barcode-service.js", import.meta.url), "utf8");
vm.runInNewContext(source, context);

let validPayload = null;
context.SmartGenBarcode.attachProductForm({
  form: "#product-form",
  barcodeInput: "#product-barcode",
  formatInput: "#barcode-format",
  statusElement: "#barcode-status",
  onValid(payload) { validPayload = payload; },
});

const invalidSubmit = new Event("submit", { cancelable: true });
form.dispatchEvent(invalidSubmit);
assert.equal(invalidSubmit.defaultPrevented, true);
assert.equal(status.dataset.state, "invalid");
assert.equal(barcodeInput.focused, true);

barcodeInput.value = "590123412345";
const validSubmit = new Event("submit", { cancelable: true });
form.dispatchEvent(validSubmit);
assert.equal(validSubmit.defaultPrevented, false);
assert.equal(barcodeInput.value, "5901234123457");
assert.equal(JSON.stringify(validPayload), JSON.stringify({ barcode: "5901234123457", format: "EAN13", normalized: true }));
assert.equal(status.dataset.state, "valid");

console.log("SmartGen Barcode Service product form contract tests passed.");
