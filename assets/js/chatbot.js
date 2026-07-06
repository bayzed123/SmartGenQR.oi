// SmartGen FAQ Chatbot - Client-side, Privacy-First
class SmartGenChatbot {
    constructor() {
        this.faqData = [];
        this.isOpen = false;
        this.conversationHistory = [];
        this.init();
    }

    async init() {
        try {
            // Load FAQ data
            await this.loadFAQ();
            
            // Create chatbot UI
            this.createChatbotUI();
            
            // Attach event listeners
            this.attachEventListeners();
            
            console.log('SmartGen Chatbot initialized successfully');
        } catch (error) {
            console.error('Error initializing chatbot:', error);
        }
    }

    async loadFAQ() {
        try {
            const response = await fetch('./data/faq.json');
            if (!response.ok) throw new Error('Failed to load FAQ data');
            
            const data = await response.json();
            this.faqData = data.faqs || [];
            
            if (this.faqData.length === 0) {
                console.warn('No FAQ data loaded');
            }
        } catch (error) {
            console.error('Error loading FAQ:', error);
            this.faqData = [];
        }
    }

    createChatbotUI() {
        // Create container
        const chatbotContainer = document.createElement('div');
        chatbotContainer.id = 'smartgen-chatbot';
        chatbotContainer.className = 'smartgen-chatbot-container';
        
        // Create chatbot HTML
        chatbotContainer.innerHTML = `
            <div class="chatbot-widget">
                <!-- Chat Button (Floating Icon) -->
                <button class="chatbot-toggle-btn" id="chatbot-toggle" title="Open SmartGen Assistant">
                    <span class="chatbot-icon">💬</span>
                    <span class="chatbot-badge" id="chatbot-badge"></span>
                </button>

                <!-- Chat Window -->
                <div class="chatbot-window" id="chatbot-window">
                    <!-- Header -->
                    <div class="chatbot-header">
                        <div class="chatbot-header-content">
                            <h3>SmartGen Assistant</h3>
                            <p>Ask me anything about SmartGen</p>
                        </div>
                        <button class="chatbot-close-btn" id="chatbot-close" title="Close chat">✕</button>
                    </div>

                    <!-- Messages Container -->
                    <div class="chatbot-messages" id="chatbot-messages">
                        <div class="chatbot-message bot-message">
                            <div class="message-content">
                                <p>👋 Hi! I'm the SmartGen Assistant. How can I help you today?</p>
                                <div class="quick-replies">
                                    <button class="quick-reply-btn" data-question="What is SmartGen?">What is SmartGen?</button>
                                    <button class="quick-reply-btn" data-question="Is my data safe?">Is my data safe?</button>
                                    <button class="quick-reply-btn" data-question="How do I use the tools?">How do I use the tools?</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Input Area -->
                    <div class="chatbot-input-area">
                        <input 
                            type="text" 
                            id="chatbot-input" 
                            class="chatbot-input" 
                            placeholder="Type your question..."
                            autocomplete="off"
                        >
                        <button class="chatbot-send-btn" id="chatbot-send" title="Send message">
                            <span>➤</span>
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Append to body
        document.body.appendChild(chatbotContainer);
    }

    attachEventListeners() {
        const toggleBtn = document.getElementById('chatbot-toggle');
        const closeBtn = document.getElementById('chatbot-close');
        const sendBtn = document.getElementById('chatbot-send');
        const input = document.getElementById('chatbot-input');
        const quickReplyBtns = document.querySelectorAll('.quick-reply-btn');

        // Toggle chat window
        toggleBtn.addEventListener('click', () => this.toggleChatWindow());
        closeBtn.addEventListener('click', () => this.toggleChatWindow());

        // Send message
        sendBtn.addEventListener('click', () => this.sendMessage());
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });

        // Quick replies
        quickReplyBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const question = e.target.getAttribute('data-question');
                this.handleUserMessage(question);
            });
        });
    }

    toggleChatWindow() {
        const chatWindow = document.getElementById('chatbot-window');
        const toggleBtn = document.getElementById('chatbot-toggle');
        
        this.isOpen = !this.isOpen;
        
        if (this.isOpen) {
            chatWindow.classList.add('open');
            toggleBtn.classList.add('active');
            document.getElementById('chatbot-input').focus();
        } else {
            chatWindow.classList.remove('open');
            toggleBtn.classList.remove('active');
        }
    }

    sendMessage() {
        const input = document.getElementById('chatbot-input');
        const message = input.value.trim();

        if (message.length === 0) return;

        this.handleUserMessage(message);
        input.value = '';
        input.focus();
    }

    handleUserMessage(userMessage) {
        // Add user message to chat
        this.addMessageToChat(userMessage, 'user');

        // Find best matching answer
        const answer = this.findBestAnswer(userMessage);

        // Simulate typing delay for better UX
        setTimeout(() => {
            this.addMessageToChat(answer, 'bot');
        }, 300);

        // Store in conversation history
        this.conversationHistory.push({
            user: userMessage,
            bot: answer,
            timestamp: new Date()
        });
    }

    findBestAnswer(userQuery) {
        if (!userQuery || this.faqData.length === 0) {
            return "I'm sorry, I couldn't find an answer to that. Please try asking another question or visit our Help page.";
        }

        const query = userQuery.toLowerCase().trim();
        let bestMatch = null;
        let bestScore = 0;

        // Search through FAQs
        for (const faq of this.faqData) {
            const question = faq.question.toLowerCase();
            const answer = faq.answer.toLowerCase();
            const category = (faq.category || '').toLowerCase();

            // Calculate relevance score
            let score = 0;

            // Exact match in question
            if (question === query) {
                score = 100;
            }
            // Question contains all query words
            else if (this.containsAllWords(question, query)) {
                score = 80;
            }
            // Query contains all question words
            else if (this.containsAllWords(query, question)) {
                score = 70;
            }
            // Partial word matching in question
            else {
                score = this.calculateWordSimilarity(query, question);
            }

            // Bonus for category match
            if (this.containsAllWords(category, query)) {
                score += 10;
            }

            // Update best match if this is better
            if (score > bestScore) {
                bestScore = score;
                bestMatch = faq;
            }
        }

        // Return best match or default message
        if (bestMatch && bestScore > 20) {
            return bestMatch.answer;
        }

        // Provide helpful suggestions based on query keywords
        return this.generateFallbackResponse(userQuery);
    }

    containsAllWords(text, query) {
        const queryWords = query.split(/\s+/).filter(w => w.length > 2);
        return queryWords.every(word => text.includes(word));
    }

    calculateWordSimilarity(query, text) {
        const queryWords = query.split(/\s+/).filter(w => w.length > 2);
        let matchCount = 0;

        for (const word of queryWords) {
            if (text.includes(word)) {
                matchCount++;
            }
        }

        return (matchCount / queryWords.length) * 60;
    }

    generateFallbackResponse(userQuery) {
        const query = userQuery.toLowerCase();

        // Category-based suggestions
        if (query.includes('tool') || query.includes('feature') || query.includes('use')) {
            return "SmartGen has 130+ tools available! You can explore them in the Tools directory. Would you like to know about a specific tool like QR Generator, SEO tools, or developer utilities?";
        }

        if (query.includes('free') || query.includes('cost') || query.includes('price')) {
            return "Yes, SmartGen is 100% free! All tools are completely free to use with no hidden charges, subscriptions, or premium features.";
        }

        if (query.includes('data') || query.includes('privacy') || query.includes('safe') || query.includes('security')) {
            return "Your data is completely safe! SmartGen is built with a privacy-first architecture. All processing happens locally in your browser, and we don't send any data to servers or track users.";
        }

        if (query.includes('account') || query.includes('login') || query.includes('sign')) {
            return "You don't need an account! SmartGen is completely anonymous and doesn't require registration. You can use all tools without logging in.";
        }

        if (query.includes('bug') || query.includes('error') || query.includes('problem')) {
            return "If you're experiencing an issue, please report it on our GitHub repository at github.com/bayzed123/SmartGenQR.oi or contact us through the Contact Us page.";
        }

        if (query.includes('contribute') || query.includes('help') || query.includes('open source')) {
            return "We'd love your help! SmartGen is open source on GitHub. You can fork the project, contribute improvements, and submit pull requests. Check our Contributing.md file for guidelines.";
        }

        if (query.includes('mobile') || query.includes('phone') || query.includes('tablet')) {
            return "Yes, SmartGen works great on mobile devices! The interface is fully responsive and automatically adapts to your screen size.";
        }

        if (query.includes('offline') || query.includes('internet')) {
            return "Most SmartGen tools work offline after the initial page load. However, some tools that require external APIs may need an internet connection.";
        }

        // Default response
        return "I'm not sure about that. Could you rephrase your question? You can also visit our Help page or contact us for more information.";
    }

    addMessageToChat(message, sender) {
        const messagesContainer = document.getElementById('chatbot-messages');
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `chatbot-message ${sender}-message`;
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.textContent = message;
        
        messageDiv.appendChild(contentDiv);
        messagesContainer.appendChild(messageDiv);

        // Auto-scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        // Remove quick replies if bot message
        if (sender === 'bot') {
            const quickReplies = messagesContainer.querySelector('.quick-replies');
            if (quickReplies) {
                quickReplies.remove();
            }
        }
    }
}

// Initialize chatbot when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new SmartGenChatbot();
    });
} else {
    new SmartGenChatbot();
}
