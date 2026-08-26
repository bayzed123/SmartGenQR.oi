(function (root) {
  "use strict";

  var FORMAT_HELP = {
    CODE128: "Code 128 accepts readable product, stock, and inventory values.",
    EAN13: "Enter 12 digits to calculate a check digit, or 13 digits to verify one.",
    UPC: "Enter 11 digits to calculate a check digit, or 12 digits to verify one.",
    CODE39: "Code 39 allows uppercase letters, numbers, spaces, and - . $ / + % symbols."
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
    version: "1.0.0",
    validate: validateBarcode,
    prepareProductBarcode: prepareProductBarcode,
    attachProductForm: attachProductForm
  };

  if (typeof document === "undefined") return;

  function byId(id) { return document.getElementById(id); }
  function syncColor(color, text) {
    color.addEventListener("input", function () { text.value = color.value; render(); });
    text.addEventListener("input", function () {
      if (/^#[0-9a-fA-F]{6}$/.test(text.value)) { color.value = text.value; render(); }
    });
  }

  function initTool() {
    var formatInput = byId("barcode-format");
    var valueInput = byId("barcode-value");
    if (!formatInput || !valueInput || !root.JsBarcode) return;
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
      var result = validateBarcode(formatInput.value, valueInput.value);
      characterCount.textContent = clean(valueInput.value).length + "/80";
      help.textContent = FORMAT_HELP[formatInput.value];
      previewFormat.textContent = formatInput.options[formatInput.selectedIndex].text.split(" — ")[0].toUpperCase();
      message.textContent = result.message;
      message.dataset.state = result.valid ? "valid" : "invalid";
      heightDisplay.textContent = height.value + "px";
      if (!result.valid) { preview.replaceChildren(); return; }
      try {
        root.JsBarcode(preview, result.value, {
          format: formatInput.value,
          lineColor: ink.value,
          background: background.value,
          width: 2,
          height: Number(height.value),
          margin: 14,
          displayValue: displayValue.checked,
          font: "Arial",
          fontSize: 15,
          textMargin: 7
        });
      } catch (error) {
        message.textContent = "This value cannot be rendered in the selected format.";
        message.dataset.state = "invalid";
        preview.replaceChildren();
      }
    }

    [formatInput, valueInput, height, displayValue].forEach(function (element) { element.addEventListener("input", render); element.addEventListener("change", render); });
    syncColor(ink, inkText); syncColor(background, backgroundText);
    byId("reset-button").addEventListener("click", function () { formatInput.value = "CODE128"; valueInput.value = "SMARTGEN-2026"; ink.value = inkText.value = "#123f2b"; background.value = backgroundText.value = "#ffffff"; height.value = 108; displayValue.checked = true; render(); });
    byId("download-button").addEventListener("click", function () {
      var result = validateBarcode(formatInput.value, valueInput.value);
      if (!result.valid) { render(); return; }
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
