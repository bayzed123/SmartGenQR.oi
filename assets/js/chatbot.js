// SmartGen Advanced AI Chatbot - Integrated with Groq API
class SmartGenChatbot {
    constructor() {
        this.faqData = [];
        this.sitemapData = [];
        this.isOpen = false;
        this.conversationHistory = [];
        this.apiEndpoint = "https://smartgen-chatbot-api.vercel.app/api/chat"; // Replace with your real backend URL
        this.init();
    }

    async init() {
        try {
            await this.loadFAQ();
            await this.loadSitemap();
            this.createChatbotUI();
            this.attachEventListeners();
            console.log("✅ SmartGen AI Chatbot initialized successfully");
        } catch (error) {
            console.error("Error initializing chatbot:", error);
        }
    }

    async loadFAQ() {
        try {
            // Use absolute path to ensure it works from any page
            const response = await fetch("/data/faq.json");
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
        // Remove existing if any
        const existing = document.getElementById("smartgen-chatbot");
        if (existing) existing.remove();

        const chatbotContainer = document.createElement("div");
        chatbotContainer.id = "smartgen-chatbot";
        chatbotContainer.className = "smartgen-chatbot-container";
        
        chatbotContainer.innerHTML = `
            <div class="chatbot-widget">
                <button class="chatbot-toggle-btn" id="chatbot-toggle" title="Open SmartGen AI Assistant">
                    <span class="chatbot-icon">🤖</span>
                </button>
                <div class="chatbot-window" id="chatbot-window">
                    <div class="chatbot-header">
                        <div class="chatbot-header-content">
                            <h3>SmartGen AI Assistant</h3>
                            <p>Powered by Groq • Online</p>
                        </div>
                        <button class="chatbot-close-btn" id="chatbot-close" title="Close chat">✕</button>
                    </div>
                    <div class="chatbot-messages" id="chatbot-messages">
                        <div class="chatbot-message bot-message">
                            <div class="message-content">
                                <p>👋 Hello! I'm your SmartGen AI Assistant. I can help you find tools, answer questions, and provide direct links from our platform. How can I assist you today?</p>
                                <div class="quick-replies">
                                    <button class="quick-reply-btn">What is SmartGen?</button>
                                    <button class="quick-reply-btn">Show me SEO tools</button>
                                    <button class="quick-reply-btn">Is my data safe?</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="chatbot-typing-indicator" id="chatbot-typing" style="display: none;">
                        <span></span><span></span><span></span>
                    </div>
                    <div class="chatbot-input-area">
                        <input type="text" id="chatbot-input" class="chatbot-input" placeholder="Ask me anything..." autocomplete="off">
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

        // Delegate quick reply clicks
        document.addEventListener("click", (e) => {
            if (e.target.classList.contains("quick-reply-btn")) {
                input.value = e.target.textContent;
                this.sendMessage();
            }
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

    async sendMessage() {
        const input = document.getElementById("chatbot-input");
        const message = input.value.trim();
        if (message.length === 0) return;

        input.value = "";
        this.addMessageToChat(message, "user");
        
        // Show typing indicator
        const typingIndicator = document.getElementById("chatbot-typing");
        typingIndicator.style.display = "flex";

        try {
            const response = await this.getAIResponse(message);
            typingIndicator.style.display = "none";
            this.addMessageToChat(response, "bot");
        } catch (error) {
            typingIndicator.style.display = "none";
            console.error("AI Response Error:", error);
            const fallback = this.findFallbackAnswer(message);
            this.addMessageToChat(fallback, "bot");
        }
    }

    async getAIResponse(userMessage) {
        // Prepare conversation history for the API
        this.conversationHistory.push({ role: "user", content: userMessage });
        
        try {
            const response = await fetch(this.apiEndpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: this.conversationHistory.slice(-6) // Send last 6 messages
                })
            });

            if (!response.ok) throw new Error("API request failed");
            
            const data = await response.json();
            const aiMessage = data.response;
            
            this.conversationHistory.push({ role: "assistant", content: aiMessage });
            return this.formatLinks(aiMessage);
        } catch (error) {
            throw error;
        }
    }

    formatLinks(text) {
        // Convert URLs to clickable links if the AI didn't format them as Markdown
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        return text.replace(urlRegex, (url) => {
            return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="chatbot-link">${url}</a>`;
        });
    }

    findFallbackAnswer(userQuery) {
        const query = userQuery.toLowerCase();
        
        // 1. Search FAQ Data
        let bestMatch = null;
        let maxScore = 0;

        for (const faq of this.faqData) {
            const score = this.calculateSimilarity(query, faq.question.toLowerCase());
            if (score > maxScore) {
                maxScore = score;
                bestMatch = faq.answer;
            }
        }

        if (maxScore > 0.6) return bestMatch;

        // 2. Search Sitemap for relevant links
        const relevantLinks = this.sitemapData.filter(item => 
            query.includes(item.title.toLowerCase()) || 
            item.title.toLowerCase().includes(query)
        );

        if (relevantLinks.length > 0) {
            let response = "I found some relevant pages on SmartGen for you:<br><ul>";
            relevantLinks.slice(0, 3).forEach(link => {
                response += `<li><a href="${link.loc}" target="_blank">${link.title}</a></li>`;
            });
            response += "</ul>";
            return response;
        }

        return "I'm sorry, I'm having trouble connecting to my brain right now. SmartGen is a free all-in-one digital utility platform. How else can I help you?";
    }

    calculateSimilarity(s1, s2) {
        const words1 = s1.split(/\s+/);
        const words2 = s2.split(/\s+/);
        const intersection = words1.filter(w => words2.includes(w));
        return intersection.length / Math.max(words1.length, words2.length);
    }

    addMessageToChat(message, sender) {
        const messagesContainer = document.getElementById("chatbot-messages");
        const messageDiv = document.createElement("div");
        messageDiv.className = `chatbot-message ${sender}-message`;
        const contentDiv = document.createElement("div");
        contentDiv.className = "message-content";
        
        // Use innerHTML for bot messages to support links
        if (sender === "bot") {
            contentDiv.innerHTML = message;
        } else {
            contentDiv.textContent = message;
        }
        
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
