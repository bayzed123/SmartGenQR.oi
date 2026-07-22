/**
 * SmartGen Preview Panel Component
 * Standardized live-preview logic for tool pages.
 */
class SmartGenPreview {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;

        this.debounceTime = options.debounceTime || 200;
        this.debounceTimer = null;
        this.iframe = null;
        this.init();
    }

    init() {
        this.container.innerHTML = `
            <div class="preview-wrapper relative w-full h-full min-h-[300px] bg-white rounded-lg overflow-hidden border border-blue-800/50">
                <div id="preview-loader" class="absolute inset-0 flex items-center justify-center bg-blue-900/10 hidden">
                    <div class="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <iframe id="preview-iframe" class="w-full h-full border-none bg-white" title="Live Preview"></iframe>
            </div>
        `;
        this.iframe = this.container.querySelector('#preview-iframe');
        this.loader = this.container.querySelector('#preview-loader');
    }

    update(htmlContent, cssContent = '') {
        clearTimeout(this.debounceTimer);
        this.showLoader();

        this.debounceTimer = setTimeout(() => {
            const fullContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { margin: 0; padding: 20px; font-family: sans-serif; }
                        ${cssContent}
                    </style>
                </head>
                <body>
                    ${htmlContent}
                </body>
                </html>
            `;

            const doc = this.iframe.contentWindow.document;
            doc.open();
            doc.write(fullContent);
            doc.close();
            this.hideLoader();
        }, this.debounceTime);
    }

    showLoader() {
        if (this.loader) this.loader.classList.remove('hidden');
    }

    hideLoader() {
        if (this.loader) this.loader.classList.add('hidden');
    }
}

window.SmartGenPreview = SmartGenPreview;
