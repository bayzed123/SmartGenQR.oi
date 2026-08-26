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
assert.equal(barcode.encode("EAN13", "590123412345").modules, "10100010110100111011001100100110111101001110101010110011011011001000010101110010011101000100101");
assert.equal(barcode.encode("UPC", "03600029145").modules, "10100011010111101010111100011010001101000110101010110110011101001100110101110010011101101100101");
assert.equal(barcode.encode("CODE39", "A").modules, "10001011101110101110101000101110100010111011101");
assert.equal(barcode.encode("CODE128", "A").modules, "1101001000010100011000100010110001100011101011");

const leftDigitPatterns = {
  L: ["0011001", "0010011", "0111101", "0100011", "0110001", "0101111"],
  G: ["0110011", "0011011", "0100001", "0011101", "0111001", "0000101"],
};
const eanParitySequences = ["LLLLLL", "LLGLGG", "LLGGLG", "LLGGGL", "LGLLGG", "LGGLLG", "LGGGLL", "LGLGLG", "LGLGGL", "LGGLGL"];
for (const [prefix, parity] of eanParitySequences.entries()) {
  const body = `${prefix}12345678901`;
  const encoded = barcode.encode("EAN13", body);
  assert.equal(encoded.valid, true);
  assert.equal(encoded.modules.length, 95);
  assert.equal(encoded.modules.startsWith("101"), true);
  assert.equal(encoded.modules.endsWith("101"), true);
  const expectedLeftModules = parity.split("").map((set, index) => leftDigitPatterns[set][index]).join("");
  assert.equal(encoded.modules.slice(3, 45), expectedLeftModules);
}
console.log("SmartGen Barcode Service validation tests passed.");
