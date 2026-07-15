// SmartGen Chatbot - Local Version (No Backend Required)
class SmartGenChatbot {
    constructor() {
        this.faqData = [];
        this.sitemapData = [];
        this.isOpen = false;
        this.conversationHistory = [];
        this.init();
    }

    async init() {
        try {
            await this.loadFAQ();
            await this.loadSitemap();
            this.createChatbotUI();
            this.attachEventListeners();
            console.log("✅ SmartGen Chatbot (Local) initialized");
        } catch (error) {
            console.error("Init error:", error);
        }
    }

    async loadFAQ() {
        try {
            const res = await fetch("./data/faq.json");
            const data = await res.json();
            this.faqData = data.faqs || [];
        } catch (e) {
            console.error("FAQ load failed", e);
        }
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
                return { loc, title: path.replace(/-/g, " ").replace(/^\//, "") };
            });
        } catch (e) {
            console.error("Sitemap load failed", e);
        }
    }

    createChatbotUI() {
        const container = document.createElement("div");
        container.id = "smartgen-chatbot";
        container.innerHTML = `
            <button class="chatbot-toggle-btn" id="chatbot-toggle">💬</button>
            <div class="chatbot-window" id="chatbot-window">
                <div class="chatbot-header">
                    <h3>SmartGen Assistant</h3>
                    <button id="chatbot-close">✕</button>
                </div>
                <div class="chatbot-messages" id="chatbot-messages"></div>
                <div class="chatbot-input-area">
                    <input id="chatbot-input" placeholder="Ask me anything..." />
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
        win.style.display = this.isOpen ? "flex" : "none";
    }

    sendMessage() {
        const input = document.getElementById("chatbot-input");
        const msg = input.value.trim();
        if (!msg) return;

        this.addMessage(msg, "user");
        input.value = "";

        setTimeout(() => {
            const reply = this.findBestAnswer(msg);
            this.addMessage(reply, "bot");
        }, 400);
    }

    addMessage(text, sender) {
        const container = document.getElementById("chatbot-messages");
        const div = document.createElement("div");
        div.className = `chatbot-message ${sender}-message`;
        div.innerHTML = `<div class="message-content">${text}</div>`;
        container.appendChild(div);
        container.scrollTop = container.scrollHeight;
    }

    findBestAnswer(query) {
        // Your original logic or simple fallback
        if (query.toLowerCase().includes("what is") || query.toLowerCase().includes("smartgen")) {
            return "SmartGen is a free collection of 130+ web tools for developers and marketers.";
        }
        return "I found something related. Can you tell me more about what you need?";
    }
}

// Initialize
new SmartGenChatbot();