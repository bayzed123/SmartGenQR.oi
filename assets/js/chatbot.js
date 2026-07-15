// SmartGen Chatbot - Full Local Version (No Backend Needed)
class SmartGenChatbot {
    constructor() {
        this.faqData = [];
        this.sitemapData = [];
        this.isOpen = false;
        this.conversationHistory = [];
        this.init();
    }

    async init() {
        await this.loadFAQ();
        await this.loadSitemap();
        this.createChatbotUI();
        this.attachEventListeners();
        console.log("✅ SmartGen Chatbot initialized");
    }

    async loadFAQ() {
        try {
            const res = await fetch("./data/faq.json");
            const data = await res.json();
            this.faqData = data.faqs || [];
        } catch (e) { console.error("FAQ load failed", e); }
    }

    async loadSitemap() {
        try {
            const res = await fetch("/sitemap.xml");
            const text = await res.text();
            const parser = new DOMParser();
            const xml = parser.parseFromString(text, "text/xml");
            const urls = xml.querySelectorAll("url");
            this.sitemapData = Array.from(urls).map(u => {
                const loc = u.querySelector("loc").textContent;
                const path = new URL(loc).pathname;
                const title = path.split("/").filter(Boolean).pop()?.replace(/-/g, " ") || "Page";
                return { loc, title };
            });
        } catch (e) { console.error("Sitemap load failed", e); }
    }

    createChatbotUI() {
        const container = document.createElement("div");
        container.id = "smartgen-chatbot";
        container.innerHTML = `
            <button class="chatbot-toggle-btn" id="chatbot-toggle" title="Chat with SmartGen">💬</button>
            <div class="chatbot-window" id="chatbot-window" style="display:none;">
                <div class="chatbot-header">
                    <h3>SmartGen Assistant</h3>
                    <button id="chatbot-close">✕</button>
                </div>
                <div class="chatbot-messages" id="chatbot-messages"></div>
                <div class="chatbot-input-area">
                    <input id="chatbot-input" placeholder="Ask anything about SmartGen..." />
                    <button id="chatbot-send">➤</button>
                </div>
            </div>
        `;
        document.body.appendChild(container);
    }

    attachEventListeners() {
        document.getElementById("chatbot-toggle").onclick = () => this.toggleChatWindow();
        document.getElementById("chatbot-close").onclick = () => this.toggleChatWindow();
        document.getElementById("chatbot-send").onclick = () => this.sendMessage();
        document.getElementById("chatbot-input").addEventListener("keypress", e => {
            if (e.key === "Enter") this.sendMessage();
        });
    }

    toggleChatWindow() {
        const win = document.getElementById("chatbot-window");
        this.isOpen = !this.isOpen;
        win.style.display = this.isOpen ? "block" : "none";
    }

    sendMessage() {
        const input = document.getElementById("chatbot-input");
        const msg = input.value.trim();
        if (!msg) return;
        this.addMessage(msg, "user");
        input.value = "";
        setTimeout(() => {
            this.addMessage("I'm here to help! What would you like to know about SmartGen tools?", "bot");
        }, 300);
    }

    addMessage(text, sender) {
        const container = document.getElementById("chatbot-messages");
        const div = document.createElement("div");
        div.className = `chatbot-message ${sender}-message`;
        div.innerHTML = `<div class="message-content">${text}</div>`;
        container.appendChild(div);
        container.scrollTop = container.scrollHeight;
    }
}

// Initialize
new SmartGenChatbot();