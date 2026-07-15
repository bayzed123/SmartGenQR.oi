    async getBotResponse(userMessage) {
        if (this.useGroq && this.backendUrl) {
            try {
                // Only send last 6 messages + current user message
                const recentHistory = this.conversationHistory.slice(-6).map(m => ({
                    role: m.user ? "user" : "assistant",
                    content: m.user || m.bot
                }));

                const payload = {
                    messages: [
                        ...recentHistory,
                        { role: "user", content: userMessage }
                    ]
                };

                const res = await fetch(`${this.backendUrl}/api/chat`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });

                if (res.ok) {
                    const data = await res.json();
                    return data.response;
                }
            } catch (e) {
                console.warn("Groq backend unavailable, falling back to local matching:", e);
            }
        }

        // Fallback to original local keyword matching
        return this.findBestAnswer(userMessage);
    }