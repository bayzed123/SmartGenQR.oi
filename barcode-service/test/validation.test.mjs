import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const source = fs.readFileSync(new URL("../barcode-service.js", import.meta.url), "utf8");
const context = { console };
context.globalThis = context;
vm.runInNewContext(source, context);

const barcode = context.SmartGenBarcode;
assert.equal(barcode.validate("EAN13", "590123412345").valid, true);
assert.equal(barcode.validate("EAN13", "590123412345").value, "5901234123457");
assert.equal(barcode.validate("EAN13", "5901234123458").valid, false);
assert.equal(barcode.validate("UPC", "03600029145").value, "036000291452");
assert.equal(barcode.validate("UPC", "036000291451").valid, false);
assert.equal(barcode.validate("CODE39", "SKU-42").valid, true);
assert.equal(barcode.validate("CODE39", "sku-42").value, "SKU-42");
assert.equal(barcode.validate("CODE39", "sku_42").valid, false);
assert.equal(barcode.prepareProductBarcode({ format: "CODE128", barcode: "INV-001" }).valid, true);
console.log("SmartGen Barcode Service validation tests passed.");
