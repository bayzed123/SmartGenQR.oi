// SmartGen FAQ Chatbot - Client-side, Privacy-First, AI-Powered
class SmartGenChatbot {
    constructor() {
        this.faqData = [];
        this.sitemapData = [];
        this.isOpen = false;
        this.conversationHistory = [];
        
        // This will be replaced by your GitHub Actions workflow
        this.apiKey = "INJECT_GEMINI_API_KEY_HERE"; 
        
        this.init();
    }

    async init() {
        try {
            await this.loadFAQ();
            await this.loadSitemap();
            this.createChatbotUI();
            this.attachEventListeners();
            console.log("SmartGen AI Chatbot initialized successfully");
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
                    <span class="chatbot-badge" id="chatbot-badge"></span>
                </button>
                <div class="chatbot-window" id="chatbot-window">
                    <div class="chatbot-header">
                        <div class="chatbot-header-content">
                            <h3>SmartGen AI Assistant</h3>
                            <p>Powered by AI & SmartGen</p>
                        </div>
                        <button class="chatbot-close-btn" id="chatbot-close" title="Close chat">✕</button>
                    </div>
                    <div class="chatbot-messages" id="chatbot-messages">
                        <div class="chatbot-message bot-message">
                            <div class="message-content">
                                <p>👋 Hi! I'm the SmartGen AI Assistant. How can I help you today?</p>
                                <div class="quick-replies">
                                    <button class="quick-reply-btn" data-question="What is SmartGen?">What is SmartGen?</button>
                                    <button class="quick-reply-btn" data-question="Is my data safe?">Is my data safe?</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="chatbot-input-area">
                        <input type="text" id="chatbot-input" class="chatbot-input" placeholder="Ask AI about SmartGen..." autocomplete="off">
                        <button class="chatbot-send-btn" id="chatbot-send" title="Send message"><span>➤</span></button>
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
        const quickReplyBtns = document.querySelectorAll(".quick-reply-btn");

        toggleBtn.addEventListener("click", () => this.toggleChatWindow());
        closeBtn.addEventListener("click", () => this.toggleChatWindow());

        sendBtn.addEventListener("click", () => this.sendMessage());
        input.addEventListener("keypress", (e) => {
            if (e.key === "Enter") this.sendMessage();
        });

        quickReplyBtns.forEach(btn => {
            btn.addEventListener("click", (e) => {
                const question = e.target.getAttribute("data-question");
                this.handleUserMessage(question);
            });
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

    async handleUserMessage(userMessage) {
        // Add user message to UI
        this.addMessageToChat(userMessage, "user");

        // Show typing indicator
        const typingId = this.showTypingIndicator();

        try {
            if (this.apiKey === "INJECT_GEMINI_API_KEY_HERE" || !this.apiKey) {
                throw new Error("API Key missing");
            }

            // Call Gemini API
            const answer = await this.fetchGeminiResponse(userMessage);
            this.removeTypingIndicator(typingId);
            
            // Format Markdown for HTML (Bold and Links)
            let formattedAnswer = answer
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.*?)\*/g, '<em>$1</em>')
                .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" style="color:var(--primary); font-weight:600;">$1</a>');
                
            this.addMessageToChat(formattedAnswer, "bot");

        } catch (error) {
            console.error("AI Error:", error);
            this.removeTypingIndicator(typingId);
            // Fallback to old static logic if API fails
            const fallbackAnswer = this.findBestAnswer(userMessage);
            this.addMessageToChat(fallbackAnswer, "bot");
        }

        this.conversationHistory.push({
            user: userMessage,
            timestamp: new Date()
        });
    }

    async fetchGeminiResponse(userQuery) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`;
        
        // --------------------------------------------------------------------------------
        // SMART SYSTEM PROMPT: This makes the bot an absolute expert on your project
        // --------------------------------------------------------------------------------
        const systemInstruction = `You are the official AI Assistant for "SmartGen", a privacy-first web utility platform.
Your job is to assist users politely, smartly, and concisely.

Key Information about SmartGen:
1. Main Website: https://smartgentools.com
2. Developer Docs: https://docs.smartgentools.com
3. What it is: A platform offering 131+ free, client-side web utilities. 
4. Categories: SEO Tools, Developer Utilities (JSON, Base64, Hash generators), Daily Utilities (Calculators), Content & Design, and an HTML Code Library (80+ codes).
5. Core Features: 100% Free, NO login required, Zero data tracking. Everything runs locally in the user's browser, ensuring maximum privacy.
6. Developer: Operated by "Connect with Bayezid" and developed by Sayad Md Bayezid Hosan.

Rules for your responses:
- Keep answers professional, friendly, and concise. Avoid unnecessarily long essays.
- If asked about features, mention they are free, private, and client-side.
- If relevant, naturally suggest checking https://smartgentools.com for tools or https://docs.smartgentools.com for open-source documentation.
- Use markdown links if you provide a URL. Example: [SmartGen Tools](https://smartgentools.com)
- Never invent tools that don't exist in standard web utilities.
- Do not mention that you are a Google AI, just say you are the SmartGen AI Assistant.`;

        const payload = {
            system_instruction: {
                parts: { text: systemInstruction }
            },
            contents: [
                { role: "user", parts: [{ text: userQuery }] }
            ],
            generationConfig: {
                temperature: 0.3,
                maxOutputTokens: 300,
            }
        };

        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`Gemini API Error: ${response.status}`);
        }

        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
    }

    showTypingIndicator() {
        const messagesContainer = document.getElementById("chatbot-messages");
        const typingId = "typing-" + Date.now();
        const messageDiv = document.createElement("div");
        messageDiv.className = "chatbot-message bot-message";
        messageDiv.id = typingId;
        messageDiv.innerHTML = `<div class="message-content"><p class="typing-animation">Generating answer...</p></div>`;
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        const quickReplies = messagesContainer.querySelector(".quick-replies");
        if (quickReplies) quickReplies.remove();
        
        return typingId;
    }

    removeTypingIndicator(id) {
        const el = document.getElementById(id);
        if (el) el.remove();
    }

    // --- FALLBACK LOGIC ---
    findBestAnswer(userQuery) {
        const query = userQuery.toLowerCase().trim();
        let bestMatch = null;
        let bestScore = 0;

        for (const faq of this.faqData) {
            const question = faq.question.toLowerCase();
            let score = this.calculateWordSimilarity(query, question);
            if (score > bestScore) {
                bestScore = score;
                bestMatch = faq;
            }
        }

        if (bestMatch && bestScore >= 40) return bestMatch.answer;
        return this.generateFallbackResponse(userQuery);
    }

    calculateWordSimilarity(query, text) {
        const queryWords = query.split(/\s+/).filter(w => w.length > 2);
        let matchCount = 0;
        for (const word of queryWords) {
            if (text.includes(word)) matchCount++;
        }
        return queryWords.length ? (matchCount / queryWords.length) * 60 : 0;
    }

    generateFallbackResponse(query) {
        const q = query.toLowerCase();
        if (q.includes("data") || q.includes("privacy")) return "Your data is completely safe! SmartGen is built with a privacy-first architecture.";
        return "I'm currently unable to connect to the AI brain. However, you can visit <a href='https://docs.smartgentools.com' target='_blank'>docs.smartgentools.com</a> for help!";
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

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => new SmartGenChatbot());
} else {
    new SmartGenChatbot();
}