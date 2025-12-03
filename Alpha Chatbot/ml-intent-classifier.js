// Machine Learning-based Intent Classifier
// Uses pattern matching and keyword analysis for intent classification

class MLIntentClassifier {
    constructor() {
        this.nlp = new NLPUtils();
        
        // Intent categories with training patterns
        this.intentPatterns = {
            mythDebunk: {
                keywords: ['myth', 'true', 'false', 'believe', 'claim', 'say', 'think', 'wrong', 'correct'],
                patterns: [
                    /(?:is|are|does)\s+(?:it|this|that)\s+(?:true|false|correct|wrong)/i,
                    /(?:carbs?|fat|protein|sugar)\s+(?:are|is)\s+(?:bad|good|healthy)/i,
                    /(?:detox|cleanse|supplement)\s+(?:work|help|effective)/i
                ],
                examples: [
                    'are carbs bad for you',
                    'is it true that detox teas work',
                    'do I need to avoid fat'
                ]
            },
            swapRequest: {
                keywords: ['swap', 'replace', 'instead', 'alternative', 'substitute', 'instead of'],
                patterns: [
                    /(?:swap|replace|alternative|instead)\s+(?:for|with|of)/i,
                    /(?:what|can|suggest)\s+(?:swap|alternative|substitute)/i
                ],
                examples: [
                    'what can I swap for white bread',
                    'alternative to rice',
                    'healthy swap for sugar'
                ]
            },
            recipeRequest: {
                keywords: ['recipe', 'cook', 'make', 'prepare', 'meal', 'dish', 'breakfast', 'lunch', 'dinner'],
                patterns: [
                    /(?:recipe|how to)\s+(?:cook|make|prepare)/i,
                    /(?:meal|dish|breakfast|lunch|dinner)\s+(?:idea|suggestion|recipe)/i
                ],
                examples: [
                    'recipe for healthy breakfast',
                    'how to make a balanced meal',
                    'dinner ideas'
                ]
            },
            adviceRequest: {
                keywords: ['advice', 'tip', 'suggestion', 'recommend', 'should', 'help', 'guide'],
                patterns: [
                    /(?:what|how)\s+(?:should|can|do)/i,
                    /(?:advice|tip|suggestion|recommend)/i,
                    /(?:help|guide)\s+(?:me|with)/i
                ],
                examples: [
                    'what should I eat',
                    'advice for weight loss',
                    'tips for healthy eating'
                ]
            },
            productCheck: {
                keywords: ['product', 'supplement', 'pill', 'tea', 'ingredient', 'safe', 'check'],
                patterns: [
                    /(?:is|are)\s+(?:this|that|it)\s+(?:safe|good|healthy)/i,
                    /(?:check|review|analyze)\s+(?:product|supplement|ingredient)/i
                ],
                examples: [
                    'is this supplement safe',
                    'check this product',
                    'review these ingredients'
                ]
            },
            healthQuery: {
                keywords: ['health', 'condition', 'disease', 'symptom', 'problem', 'issue'],
                patterns: [
                    /(?:health|condition|disease|symptom)/i,
                    /(?:problem|issue)\s+(?:with|in)/i
                ],
                examples: [
                    'nutrition for diabetes',
                    'eating with heart disease',
                    'diet for my condition'
                ]
            },
            general: {
                keywords: [],
                patterns: [],
                examples: []
            }
        };
    }

    // Classify intent using ML approach (pattern matching + keyword analysis)
    classify(userMessage) {
        const lowerMessage = userMessage.toLowerCase();
        const tokens = this.nlp.tokenize(userMessage);
        const lemmatized = this.nlp.lemmatizeText(userMessage);
        
        const intentScores = {};

        // Score each intent
        for (const [intent, config] of Object.entries(this.intentPatterns)) {
            let score = 0;

            // Pattern matching
            config.patterns.forEach(pattern => {
                if (pattern.test(userMessage)) {
                    score += 3;
                }
            });

            // Keyword matching
            config.keywords.forEach(keyword => {
                const keywordLower = keyword.toLowerCase();
                if (lowerMessage.includes(keywordLower)) {
                    score += 2;
                }
                // Check in lemmatized tokens
                if (lemmatized.some(token => token.includes(keywordLower) || keywordLower.includes(token))) {
                    score += 1;
                }
            });

            // Example similarity (using Jaccard similarity)
            config.examples.forEach(example => {
                const similarity = this.nlp.jaccardSimilarity(userMessage, example);
                score += similarity * 2;
            });

            if (score > 0) {
                intentScores[intent] = score;
            }
        }

        // Get top intent
        const sortedIntents = Object.entries(intentScores)
            .sort((a, b) => b[1] - a[1]);

        if (sortedIntents.length === 0) {
            return { intent: 'general', confidence: 0.5, scores: {} };
        }

        const [topIntent, topScore] = sortedIntents[0];
        const maxPossibleScore = 10; // Approximate max score
        const confidence = Math.min(topScore / maxPossibleScore, 1);

        return {
            intent: topIntent,
            confidence,
            scores: intentScores,
            allIntents: sortedIntents.map(([intent, score]) => ({ intent, score }))
        };
    }

    // Get response template based on intent
    getResponseTemplate(intent) {
        const templates = {
            mythDebunk: 'I\'ll help you understand the science behind this. Let me debunk this myth with evidence.',
            swapRequest: 'Great question! Here are some healthy swaps you can try:',
            recipeRequest: 'I\'d be happy to suggest some recipes! Here are some ideas:',
            adviceRequest: 'Based on your profile, here\'s my evidence-based advice:',
            productCheck: 'Let me analyze this product for you. I\'ll check the ingredients and provide safety information.',
            healthQuery: 'For health conditions, I\'ll provide general information, but please consult your healthcare provider for personalized advice.',
            general: 'I\'m here to help with evidence-based nutrition guidance. What would you like to know?'
        };

        return templates[intent] || templates.general;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MLIntentClassifier;
}

