// Configuration for API key storage
const CONFIG = {
    STORAGE_KEY: 'alpha_chatbot_api_key',
    
    // Get API key from localStorage
    getApiKey: function() {
        return localStorage.getItem(this.STORAGE_KEY);
    },
    
    // Save API key to localStorage
    saveApiKey: function(key) {
        if (key && key.trim()) {
            localStorage.setItem(this.STORAGE_KEY, key.trim());
            return true;
        }
        return false;
    },
    
    // Check if API key exists and save it
    hasApiKey: function() {
        return this.getApiKey() !== null && this.getApiKey() !== '';
    }
};


