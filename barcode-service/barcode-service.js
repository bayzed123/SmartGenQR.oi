/*
 * Copyright (c) 2026 SmartGen Tools. All rights reserved.
 * SmartGen-owned browser implementation for barcode validation and rendering.
 * No third-party barcode-rendering code is included or required.
 */
(function (root) {
  "use strict";

  var FORMAT_HELP = {
    CODE128: "Code 128 uses SmartGen Code Set B encoding for readable product, stock, and inventory values.",
    EAN13: "Enter 12 digits to calculate a check digit, or 13 digits to verify one.",
    UPC: "Enter 11 digits to calculate a check digit, or 12 digits to verify one.",
    CODE39: "Code 39 allows uppercase letters, numbers, spaces, and - . $ / + % symbols."
  };

  var EAN_L = ["0001101", "0011001", "0010011", "0111101", "0100011", "0110001", "0101111", "0111011", "0110111", "0001011"];
  var EAN_G = ["0100111", "0110011", "0011011", "0100001", "0011101", "0111001", "0000101", "0010001", "0001001", "0010111"];
  var EAN_R = ["1110010", "1100110", "1101100", "1000010", "1011100", "1001110", "1010000", "1000100", "1001000", "1110100"];
  var EAN_PARITY = ["LLLLLL", "LLGLGG", "LLGGLG", "LLGGGL", "LGLLGG", "LGGLLG", "LGGGLL", "LGLGLG", "LGLGGL", "LGGLGL"];

  var CODE128_WIDTHS = [
    "212222", "221122", "222122", "121223", "121322", "131222", "122213", "122312", "132212", "221213",
    "221312", "231212", "112232", "122132", "122231", "113222", "123122", "123221", "223211", "221132",
    "221231", "213212", "223112", "312131", "311222", "321122", "321221", "312212", "322112", "322211",
    "212123", "212321", "232121", "111323", "131123", "131321", "112313", "132113", "132311", "211313",
    "231113", "231311", "112133", "112331", "132131", "113123", "113321", "133121", "313121", "211331",
    "231131", "213113", "213311", "213131", "311123", "311321", "331121", "312113", "312311", "332111",
    "314111", "221411", "431111", "111224", "111422", "121124", "121421", "141122", "141221", "112214",
    "112412", "122114", "122411", "142112", "142211", "241211", "221114", "413111", "241112", "134111",
    "111242", "121142", "121241", "114212", "124112", "124211", "411212", "421112", "421211", "212141",
    "214121", "412121", "111143", "111341", "131141", "114113", "114311", "411113", "411311", "113141",
    "114131", "311141", "411131", "211412", "211214", "211232", "2331112"
  ];

  var CODE39_PATTERNS = {
    "*": "NWNNWNWNN", "0": "NNNWWNWNN", "1": "WNNWNNNNW", "2": "NNWWNNNNW", "3": "WNWWNNNNN",
    "4": "NNNWWNNNW", "5": "WNNWWNNNN", "6": "NNWWWNNNN", "7": "NNNWNNWNW", "8": "WNNWNNWNN",
    "9": "NNWWNNWNN", "A": "WNNNNWNNW", "B": "NNWNNWNNW", "C": "WNWNNWNNN", "D": "NNNNWWNNW",
    "E": "WNNNWWNNN", "F": "NNWNWWNNN", "G": "NNNNNWWNW", "H": "WNNNNWWNN", "I": "NNWNNWWNN",
    "J": "NNNNWWWNN", "K": "WNNNNNNWW", "L": "NNWNNNNWW", "M": "WNWNNNNWN", "N": "NNNNWNNWW",
    "O": "WNNNWNNWN", "P": "NNWNWNNWN", "Q": "NNNNNNWWW", "R": "WNNNNNWWN", "S": "NNWNNNWWN",
    "T": "NNNNWNWWN", "U": "WWNNNNNNW", "V": "NWWNNNNNW", "W": "WWWNNNNNN", "X": "NWNNWNNNW",
    "Y": "WWNNWNNNN", "Z": "NWWNWNNNN", "-": "NWNNNNWNW", ".": "WWNNNNWNN", " ": "NWWNNNWNN",
    "$": "NWNWNWNNN", "/": "NWNWNNNWN", "+": "NWNNNWNWN", "%": "NNNWNWNWN"
  };

  function clean(value) { return String(value == null ? "" : value).trim(); }
  function digits(value) { return clean(value).replace(/\s|-/g, ""); }

  function calculateModulo10(value) {
    var sum = 0;
    for (var index = value.length - 1, position = 0; index >= 0; index -= 1, position += 1) {
      sum += Number(value[index]) * (position % 2 === 0 ? 3 : 1);
    }
    return String((10 - (sum % 10)) % 10);
  }

  function validateBarcode(format, rawValue) {
    var value = clean(rawValue);
    if (!value) return { valid: false, code: "required", message: "Enter a barcode value before continuing." };
    if (value.length > 80) return { valid: false, code: "too_long", message: "Keep the barcode value under 80 characters." };

    if (format === "EAN13") {
      value = digits(value);
      if (!/^\d{12,13}$/.test(value)) return { valid: false, code: "ean_length", message: "EAN-13 needs 12 digits, or a valid 13-digit identifier." };
      if (value.length === 12) return { valid: true, value: value + calculateModulo10(value), normalized: true, message: "Check digit added automatically." };
      if (calculateModulo10(value.slice(0, 12)) !== value[12]) return { valid: false, code: "ean_checksum", message: "The EAN-13 check digit is not valid." };
      return { valid: true, value: value, normalized: false, message: "Valid EAN-13 identifier." };
    }

    if (format === "UPC") {
      value = digits(value);
      if (!/^\d{11,12}$/.test(value)) return { valid: false, code: "upc_length", message: "UPC-A needs 11 digits, or a valid 12-digit identifier." };
      if (value.length === 11) return { valid: true, value: value + calculateModulo10(value), normalized: true, message: "Check digit added automatically." };
      if (calculateModulo10(value.slice(0, 11)) !== value[11]) return { valid: false, code: "upc_checksum", message: "The UPC-A check digit is not valid." };
      return { valid: true, value: value, normalized: false, message: "Valid UPC-A identifier." };
    }

    if (format === "CODE39") {
      value = value.toUpperCase();
      if (!/^[0-9A-Z .\-$/+%]+$/.test(value)) return { valid: false, code: "code39_character", message: "Code 39 uses uppercase letters, numbers, spaces, and approved symbols only." };
      return { valid: true, value: value, normalized: value !== rawValue, message: "Valid Code 39 value." };
    }

    if (!/^[\x20-\x7E]+$/.test(value)) return { valid: false, code: "code128_character", message: "Code 128 accepts printable text characters only." };
    return { valid: true, value: value, normalized: false, message: "Valid Code 128 value." };
  }

  function prepareProductBarcode(input) {
    var result = validateBarcode(input.format || "CODE128", input.barcode);
    if (!result.valid) return result;
    return { valid: true, barcode: result.value, format: input.format || "CODE128", normalized: result.normalized, message: result.message };
  }

  function widthsToModules(widths) {
    var modules = "";
    for (var position = 0; position < widths.length; position += 1) {
      modules += (position % 2 === 0 ? "1" : "0").repeat(Number(widths[position]));
    }
    return modules;
  }

  function encodeCode128B(value) {
    var symbols = [104];
    for (var index = 0; index < value.length; index += 1) symbols.push(value.charCodeAt(index) - 32);
    var checksum = 104;
    for (var position = 1; position < symbols.length; position += 1) checksum += symbols[position] * position;
    symbols.push(checksum % 103, 106);
    return symbols.map(function (symbol) { return widthsToModules(CODE128_WIDTHS[symbol]); }).join("");
  }

  function encodeCode39(value) {
    var symbols = "*" + value + "*";
    return symbols.split("").map(function (symbol) {
      var pattern = CODE39_PATTERNS[symbol];
      var modules = "";
      for (var position = 0; position < pattern.length; position += 1) {
        modules += (position % 2 === 0 ? "1" : "0").repeat(pattern[position] === "W" ? 3 : 1);
      }
      return modules;
    }).join("0");
  }

  function encodeEan13(value) {
    var modules = "101";
    var parity = EAN_PARITY[Number(value[0])];
    for (var index = 1; index <= 6; index += 1) {
      modules += parity[index - 1] === "L" ? EAN_L[Number(value[index])] : EAN_G[Number(value[index])];
    }
    modules += "01010";
    for (var right = 7; right <= 12; right += 1) modules += EAN_R[Number(value[right])];
    return modules + "101";
  }

  function encodeUpc(value) {
    var modules = "101";
    for (var left = 0; left < 6; left += 1) modules += EAN_L[Number(value[left])];
    modules += "01010";
    for (var right = 6; right < 12; right += 1) modules += EAN_R[Number(value[right])];
    return modules + "101";
  }

  function encodeBarcode(format, rawValue) {
    var result = validateBarcode(format, rawValue);
    if (!result.valid) return result;
    var modules = format === "EAN13" ? encodeEan13(result.value) : format === "UPC" ? encodeUpc(result.value) : format === "CODE39" ? encodeCode39(result.value) : encodeCode128B(result.value);
    return { valid: true, value: result.value, modules: modules, normalized: result.normalized, message: result.message };
  }

  function resolveElement(target) {
    if (typeof target === "string" && typeof document !== "undefined") return document.querySelector(target);
    return target || null;
  }

  function attachProductForm(config) {
    if (typeof document === "undefined") throw new Error("attachProductForm requires a browser document.");
    var settings = config || {};
    var form = resolveElement(settings.form);
    var barcodeInput = resolveElement(settings.barcodeInput);
    var formatInput = resolveElement(settings.formatInput);
    var statusElement = resolveElement(settings.statusElement);
    if (!form || !barcodeInput || !formatInput) throw new Error("SmartGenBarcode requires form, barcodeInput, and formatInput elements.");

    function report(result) {
      if (!statusElement) return;
      statusElement.textContent = result.message;
      statusElement.dataset.state = result.valid ? "valid" : "invalid";
    }

    function validateField() {
      var result = prepareProductBarcode({ format: formatInput.value, barcode: barcodeInput.value });
      report(result);
      return result;
    }

    barcodeInput.addEventListener("input", validateField);
    formatInput.addEventListener("change", validateField);
    form.addEventListener("submit", function (event) {
      var result = validateField();
      if (!result.valid) {
        event.preventDefault();
        barcodeInput.focus();
        return;
      }
      barcodeInput.value = result.barcode;
      var detail = { barcode: result.barcode, format: result.format, normalized: result.normalized };
      form.dispatchEvent(new CustomEvent("smartgen:valid-barcode", { bubbles: true, detail: detail }));
      if (typeof settings.onValid === "function") settings.onValid(detail);
    });
    return { validate: validateField, destroy: function () {} };
  }

  root.SmartGenBarcode = {
    version: "2.0.0",
    validate: validateBarcode,
    prepareProductBarcode: prepareProductBarcode,
    encode: encodeBarcode,
    attachProductForm: attachProductForm
  };

  if (typeof document === "undefined") return;

  function byId(id) { return document.getElementById(id); }
  function svgElement(name) { return document.createElementNS("http://www.w3.org/2000/svg", name); }
  function setAttributes(element, attributes) { Object.keys(attributes).forEach(function (key) { element.setAttribute(key, String(attributes[key])); }); }
  function syncColor(color, text) {
    color.addEventListener("input", function () { text.value = color.value; render(); });
    text.addEventListener("input", function () {
      if (/^#[0-9a-fA-F]{6}$/.test(text.value)) { color.value = text.value; render(); }
    });
  }

  function drawSvg(svg, encoded, settings) {
    var quietZone = 12;
    var moduleWidth = 2;
    var textHeight = settings.displayValue ? 25 : 0;
    var width = (encoded.modules.length + quietZone * 2) * moduleWidth;
    var totalHeight = settings.height + textHeight + 10;
    svg.replaceChildren();
    setAttributes(svg, { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 " + width + " " + totalHeight, width: width, height: totalHeight, role: "img", "aria-label": settings.format + " barcode for " + encoded.value });
    var background = svgElement("rect");
    setAttributes(background, { x: 0, y: 0, width: width, height: totalHeight, fill: settings.background });
    svg.appendChild(background);
    var x = quietZone * moduleWidth;
    for (var index = 0; index < encoded.modules.length; index += 1) {
      if (encoded.modules[index] === "1") {
        var bar = svgElement("rect");
        setAttributes(bar, { x: x, y: 0, width: moduleWidth, height: settings.height, fill: settings.ink });
        svg.appendChild(bar);
      }
      x += moduleWidth;
    }
    if (settings.displayValue) {
      var label = svgElement("text");
      setAttributes(label, { x: width / 2, y: settings.height + 19, "text-anchor": "middle", fill: settings.ink, "font-family": "Arial, sans-serif", "font-size": 14, "letter-spacing": 1 });
      label.textContent = encoded.value;
      svg.appendChild(label);
    }
  }

  function initTool() {
    var formatInput = byId("barcode-format");
    var valueInput = byId("barcode-value");
    if (!formatInput || !valueInput) return;
    var preview = byId("barcode-preview");
    var message = byId("validation-message");
    var characterCount = byId("character-count");
    var help = byId("format-help");
    var previewFormat = byId("preview-format");
    var ink = byId("barcode-ink");
    var inkText = byId("barcode-ink-text");
    var background = byId("barcode-background");
    var backgroundText = byId("barcode-background-text");
    var height = byId("barcode-height");
    var heightDisplay = byId("height-display");
    var displayValue = byId("show-value");

    function render() {
      var encoded = encodeBarcode(formatInput.value, valueInput.value);
      characterCount.textContent = clean(valueInput.value).length + "/80";
      help.textContent = FORMAT_HELP[formatInput.value];
      previewFormat.textContent = formatInput.options[formatInput.selectedIndex].text.split(" — ")[0].toUpperCase();
      message.textContent = encoded.message;
      message.dataset.state = encoded.valid ? "valid" : "invalid";
      heightDisplay.textContent = height.value + "px";
      if (!encoded.valid) { preview.replaceChildren(); return; }
      drawSvg(preview, encoded, { format: formatInput.value, ink: ink.value, background: background.value, height: Number(height.value), displayValue: displayValue.checked });
    }

    [formatInput, valueInput, height, displayValue].forEach(function (element) { element.addEventListener("input", render); element.addEventListener("change", render); });
    syncColor(ink, inkText); syncColor(background, backgroundText);
    byId("reset-button").addEventListener("click", function () { formatInput.value = "CODE128"; valueInput.value = "SMARTGEN-2026"; ink.value = inkText.value = "#123f2b"; background.value = backgroundText.value = "#ffffff"; height.value = 108; displayValue.checked = true; render(); });
    byId("download-button").addEventListener("click", function () {
      if (!encodeBarcode(formatInput.value, valueInput.value).valid) { render(); return; }
      var svg = new XMLSerializer().serializeToString(preview);
      var url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml;charset=utf-8" }));
      var anchor = document.createElement("a");
      anchor.href = url; anchor.download = "smartgen-" + formatInput.value.toLowerCase() + "-barcode.svg";
      document.body.appendChild(anchor); anchor.click(); anchor.remove(); URL.revokeObjectURL(url);
    });
    render();
  }

  function initCopy() {
    var button = byId("copy-snippet");
    var snippet = byId("integration-snippet");
    if (!button || !snippet || !navigator.clipboard) return;
    button.addEventListener("click", function () {
      navigator.clipboard.writeText(snippet.textContent).then(function () { button.textContent = "Copied"; setTimeout(function () { button.textContent = "Copy"; }, 1500); });
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { initTool(); initCopy(); });
  else { initTool(); initCopy(); }
})(typeof window !== "undefined" ? window : globalThis);
