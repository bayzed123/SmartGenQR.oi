// SmartGen FAQ Chatbot - Client-side, Privacy-First
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
            console.log("✅ SmartGen Chatbot initialized successfully");
        } catch (error) {
            console.error("Error initializing chatbot:", error);
        }
    }

    async loadFAQ() {
        try {
            const response = await fetch("./data/faq.json");
            if (!response.ok) throw new Error("Failed to load FAQ data");
            const data = await response.json();
            this.faqData = data.faqs || [];
        } catch (error) {
            console.error("Error loading FAQ:", error);
            this.faqData = [];
        }
    }

    async loadSitemap() {
        try {
            const response = await fetch("/sitemap.xml");
            if (!response.ok) throw new Error("Failed to load sitemap.xml");
            const sitemapText = await response.text();
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(sitemapText, "text/xml");
            const urls = xmlDoc.querySelectorAll("url");
            this.sitemapData = Array.from(urls).map(urlElement => {
                const loc = urlElement.querySelector("loc").textContent;
                const path = new URL(loc).pathname;
                const title = this.extractTitleFromPath(path);
                return { loc, path, title };
            });
        } catch (error) {
            console.error("Error loading sitemap:", error);
            this.sitemapData = [];
        }
    }

    extractTitleFromPath(path) {
        const parts = path.split("/").filter(Boolean);
        if (parts.length === 0) return "Home Page";
        let title = parts[parts.length - 1].replace(/-/g, " ");
        title = title.charAt(0).toUpperCase() + title.slice(1);
        return title;
    }

    createChatbotUI() {
        const chatbotContainer = document.createElement("div");
        chatbotContainer.id = "smartgen-chatbot";
        chatbotContainer.className = "smartgen-chatbot-container";
        
        chatbotContainer.innerHTML = `
            <div class="chatbot-widget">
                <button class="chatbot-toggle-btn" id="chatbot-toggle" title="Open SmartGen Assistant">
                    <span class="chatbot-icon">💬</span>
                </button>
                <div class="chatbot-window" id="chatbot-window">
                    <div class="chatbot-header">
                        <div class="chatbot-header-content">
                            <h3>SmartGen Assistant</h3>
                            <p>Ask me anything about SmartGen</p>
                        </div>
                        <button class="chatbot-close-btn" id="chatbot-close" title="Close chat">✕</button>
                    </div>
                    <div class="chatbot-messages" id="chatbot-messages">
                        <div class="chatbot-message bot-message">
                            <div class="message-content">
                                <p>👋 Hi! I'm the SmartGen Assistant. How can I help you today?</p>
                            </div>
                        </div>
                    </div>
                    <div class="chatbot-input-area">
                        <input type="text" id="chatbot-input" class="chatbot-input" placeholder="Type your question..." autocomplete="off">
                        <button class="chatbot-send-btn" id="chatbot-send" title="Send message">➤</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(chatbotContainer);
    }

    attachEventListeners() {
        const toggleBtn = document.getElementById("chatbot-toggle");
        const closeBtn = document.getElementById("chatbot-close");
        const sendBtn = document.getElementById("chatbot-send");
        const input = document.getElementById("chatbot-input");

        toggleBtn.addEventListener("click", () => this.toggleChatWindow());
        closeBtn.addEventListener("click", () => this.toggleChatWindow());
        sendBtn.addEventListener("click", () => this.sendMessage());
        input.addEventListener("keypress", (e) => {
            if (e.key === "Enter") this.sendMessage();
        });
    }

    toggleChatWindow() {
        const chatWindow = document.getElementById("chatbot-window");
        const toggleBtn = document.getElementById("chatbot-toggle");
        this.isOpen = !this.isOpen;
        if (this.isOpen) {
            chatWindow.classList.add("open");
            toggleBtn.classList.add("active");
            document.getElementById("chatbot-input").focus();
        } else {
            chatWindow.classList.remove("open");
            toggleBtn.classList.remove("active");
        }
    }

    sendMessage() {
        const input = document.getElementById("chatbot-input");
        const message = input.value.trim();
        if (message.length === 0) return;

        this.handleUserMessage(message);
        input.value = "";
        input.focus();
    }

    handleUserMessage(userMessage) {
        this.addMessageToChat(userMessage, "user");
        const answer = this.findBestAnswer(userMessage);
        setTimeout(() => {
            this.addMessageToChat(answer, "bot");
        }, 300);
    }

    findBestAnswer(userQuery) {
        // Your original logic from backup
        if (!userQuery) return "I'm sorry, I couldn't find an answer.";
        const query = userQuery.toLowerCase().trim();
        // ... (you can keep expanding this later)
        return this.generateFallbackResponse(userQuery);
    }

    generateFallbackResponse(userQuery) {
        const query = userQuery.toLowerCase();
        if (query.includes("smartgen") || query.includes("what is")) {
            return "SmartGen is a free all-in-one digital & web utility platform with 130+ tools.";
        }
        return "I'm here to help! What would you like to know?";
    }

    addMessageToChat(message, sender) {
        const messagesContainer = document.getElementById("chatbot-messages");
        const messageDiv = document.createElement("div");
        messageDiv.className = `chatbot-message ${sender}-message`;
        const contentDiv = document.createElement("div");
        contentDiv.className = "message-content";
        contentDiv.innerHTML = message;
        messageDiv.appendChild(contentDiv);
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
}

// Initialize
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => new SmartGenChatbot());
} else {
    new SmartGenChatbot();
}