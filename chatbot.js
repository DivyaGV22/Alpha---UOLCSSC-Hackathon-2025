// Nutrition Chatbot with OpenAI API Integration

class NutritionChatbot {
    constructor() {
        this.apiKey = null;
        this.messages = [];
        this.initializeElements();
        this.loadApiKey();
        this.setupEventListeners();
    }

    //Initialize elements
    initializeElements() {
        this.apiKeyInput = document.getElementById('apiKey');
        this.saveKeyBtn = document.getElementById('saveKeyBtn');
        this.keyStatus = document.getElementById('keyStatus');
        this.userInput = document.getElementById('userInput');
        this.sendBtn = document.getElementById('sendBtn');
        this.messagesContainer = document.getElementById('messages');
        this.chatContainer = document.getElementById('chatContainer');
    }

    //Load API Key
    loadApiKey() {
        const savedKey = CONFIG.getApiKey();
        if (savedKey) {
            this.apiKey = savedKey;
            this.apiKeyInput.value = savedKey;
            this.updateKeyStatus('saved', '✓ Key saved');
            this.enableChat();
        } else {
            this.disableChat();
        }
    }
// Integrate OPENAI API Key
    setupEventListeners() {
        // Save API key
        this.saveKeyBtn.addEventListener('click', () => this.saveApiKey());
        this.apiKeyInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.saveApiKey();
            }
        });

        // Send message
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        this.userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
    }

    saveApiKey() {
        const key = this.apiKeyInput.value.trim();
        if (!key) {
            this.updateKeyStatus('error', 'Please enter an API key');
            return;
        }

        if (CONFIG.saveApiKey(key)) {
            this.apiKey = key;
            this.updateKeyStatus('saved', '✓ Key saved');
            this.enableChat();
        } else {
            this.updateKeyStatus('error', 'Failed to save key');
        }
    }

    updateKeyStatus(type, message) {
        this.keyStatus.textContent = message;
        this.keyStatus.className = `status-indicator ${type}`;
        setTimeout(() => {
            if (type === 'saved') {
                this.keyStatus.textContent = '';
            }
        }, 3000);
    }

    enableChat() {
        this.userInput.disabled = false;
        this.sendBtn.disabled = false;
        this.userInput.focus();
    }

    disableChat() {
        this.userInput.disabled = true;
        this.sendBtn.disabled = true;
    }

    async sendMessage() {
        const userMessage = this.userInput.value.trim();
        if (!userMessage || !this.apiKey) return;

        // Clear input
        this.userInput.value = '';
        this.userInput.disabled = true;
        this.sendBtn.disabled = true;

        // Add user message to chat
        this.addMessage('user', userMessage);

        // Show typing indicator
        const typingId = this.showTypingIndicator();

        try {
            // Call OpenAI API
            const response = await this.callOpenAI(userMessage);
            
            // Remove typing indicator
            this.removeTypingIndicator(typingId);
            
            // Add bot response
            this.addMessage('bot', response);
        } catch (error) {
            // Remove typing indicator
            this.removeTypingIndicator(typingId);
            
            // Show error message
            this.addMessage('bot', `Sorry, I encountered an error: ${error.message}. Please check your API key and try again.`);
            console.error('Error:', error);
        } finally {
            this.userInput.disabled = false;
            this.sendBtn.disabled = false;
            this.userInput.focus();
        }
    }
// Call API Key
    async callOpenAI(userMessage) {
        // System prompt for nutrition chatbot - explicitly aligned with all 5 requirements
        const systemPrompt = `You are Alpha, a nutrition-focused chatbot that delivers clear, evidence-based food guidance to help users cut through misinformation.

CORE REQUIREMENTS (follow these strictly):

1. BUILD - Evidence-Based Guidance:
   - Deliver clear, evidence-based food guidance
   - Help users cut through misinformation
   - Base ALL responses on peer-reviewed scientific research
   - Cite relevant studies when appropriate (mention "research shows" or "studies indicate")

2. DEBUNK MISINFORMATION:
   - Actively address common diet myths when mentioned
   - Explain the science behind popular misconceptions clearly
   - When debunking myths, structure your response as:
     a) State the myth
     b) Explain why it's incorrect
     c) Provide the scientific evidence
     d) Offer the evidence-based truth

3. PERSONALIZED RESPONSES:
   - Tailor advice based on user input and conversation history
   - Provide practical tips specific to their situation
   - Suggest healthy swaps relevant to their dietary preferences/needs
   - Ask clarifying questions when needed to personalize better
   - Reference previous parts of the conversation to show personalization

4. RELEVANCY - Science Over Trends:
   - Promote credible, science-based nutrition over viral trends
   - When users ask about trending diets/products, redirect to evidence-based alternatives
   - Explain why evidence-based approaches are more reliable
   - Avoid promoting fad diets or unproven products

5. ENGAGEMENT:
   - Use friendly, warm, and interactive language
   - Keep users informed, engaged, and build trust
   - Use conversational tone (like talking to a knowledgeable friend)
   - Show enthusiasm about helping them make better choices
   - Use encouraging language and celebrate their interest in evidence-based nutrition

ADDITIONAL GUIDELINES:
- Be empathetic and non-judgmental
- Keep responses concise but informative (2-4 paragraphs max)
- Use bullet points or numbered lists for clarity
- If asked about specific medical conditions, recommend consulting a healthcare professional
- Avoid making absolute claims unless supported by strong evidence
- Use phrases like "research suggests," "studies show," "evidence indicates"`;

        const messages = [
            { role: 'system', content: systemPrompt },
            ...this.messages.slice(-8), // Keep last 8 messages for better personalization context
            { role: 'user', content: userMessage }
        ];

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: messages,
                temperature: 0.7,
                max_tokens: 800  // Increased for more detailed, personalized responses
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error?.message || `API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        const assistantMessage = data.choices[0].message.content;
        
        // Store message in history
        this.messages.push({ role: 'user', content: userMessage });
        this.messages.push({ role: 'assistant', content: assistantMessage });
        
        return assistantMessage;
    }

    addMessage(role, content) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${role}`;

        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.textContent = role === 'user' ? '👤' : '🥗';

        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        
        // Format message content (handle line breaks and basic markdown)
        const formattedContent = this.formatMessage(content);
        messageContent.innerHTML = formattedContent;

        messageDiv.appendChild(avatar);
        messageDiv.appendChild(messageContent);
        this.messagesContainer.appendChild(messageDiv);

        // Scroll to bottom
        this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
    }

    formatMessage(text) {
        // Convert markdown-style formatting to HTML
        let formatted = text
            // Bold text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            // Italic text
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            // Line breaks
            .replace(/\n/g, '<br>')
            // Numbered lists
            .replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>')
            // Bullet points
            .replace(/^[-•]\s+(.+)$/gm, '<li>$1</li>');

        // Wrap consecutive list items in ul tags
        formatted = formatted.replace(/(<li>.*<\/li>)/gs, (match) => {
            if (!match.includes('<ul>')) {
                return '<ul>' + match + '</ul>';
            }
            return match;
        });

        // Wrap paragraphs
        const paragraphs = formatted.split('<br><br>');
        formatted = paragraphs.map(p => {
            if (p.trim() && !p.includes('<ul>') && !p.includes('<li>')) {
                return '<p>' + p + '</p>';
            }
            return p;
        }).join('');

        return formatted;
    }

    showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message bot';
        typingDiv.id = 'typing-indicator';

        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.textContent = '🥗';

        const typingContent = document.createElement('div');
        typingContent.className = 'typing-indicator';
        typingContent.innerHTML = '<span></span><span></span><span></span>';

        typingDiv.appendChild(avatar);
        typingDiv.appendChild(typingContent);
        this.messagesContainer.appendChild(typingDiv);

        this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
        return 'typing-indicator';
    }

    removeTypingIndicator(id) {
        const indicator = document.getElementById(id);
        if (indicator) {
            indicator.remove();
        }
    }
}

// Initialize chatbot when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new NutritionChatbot();
});





