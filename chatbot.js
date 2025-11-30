// Nutrition Chatbot with OpenAI API Integration

class NutritionChatbot {
    constructor() {
        this.apiKey = null;
        this.messages = [];
        this.initializeElements();
        this.loadApiKey();
    }

    initializeElements() {
        this.apiKeyInput = document.getElementById('apiKey');
        this.saveKeyBtn = document.getElementById('saveKeyBtn');
        this.keyStatus = document.getElementById('keyStatus');
        this.userInput = document.getElementById('userInput');
        this.sendBtn = document.getElementById('sendBtn');
        this.messagesContainer = document.getElementById('messages');
        this.chatContainer = document.getElementById('chatContainer');
    }

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



