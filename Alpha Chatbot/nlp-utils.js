// Natural Language Processing Utilities
// Includes: lemmatization, keyword extraction, regex patterns, text processing

class NLPUtils {
    constructor() {
        // Common stop words
        this.stopWords = new Set([
            'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
            'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the',
            'to', 'was', 'will', 'with', 'i', 'you', 'this', 'but', 'they',
            'have', 'had', 'what', 'said', 'each', 'which', 'their', 'time',
            'if', 'up', 'out', 'many', 'then', 'them', 'these', 'so', 'some',
            'her', 'would', 'make', 'like', 'him', 'into', 'has', 'two', 'more',
            'very', 'after', 'words', 'long', 'than', 'first', 'been', 'call',
            'who', 'oil', 'sit', 'now', 'find', 'down', 'day', 'did', 'get',
            'come', 'made', 'may', 'part', 'about', 'how', 'when', 'where', 'why'
        ]);

        // Lemmatization dictionary (simplified - for production use a proper library)
        this.lemmatizationMap = {
            // Verbs
            'eating': 'eat', 'eats': 'eat', 'ate': 'eat', 'eaten': 'eat',
            'losing': 'lose', 'loses': 'lose', 'lost': 'lose',
            'gaining': 'gain', 'gains': 'gain', 'gained': 'gain',
            'exercising': 'exercise', 'exercises': 'exercise', 'exercised': 'exercise',
            'drinking': 'drink', 'drinks': 'drink', 'drank': 'drink', 'drunk': 'drink',
            'taking': 'take', 'takes': 'take', 'took': 'take', 'taken': 'take',
            'wanting': 'want', 'wants': 'want', 'wanted': 'want',
            'needing': 'need', 'needs': 'need', 'needed': 'need',
            'helping': 'help', 'helps': 'help', 'helped': 'help',
            'asking': 'ask', 'asks': 'ask', 'asked': 'ask',
            
            // Nouns (plural to singular)
            'carbs': 'carb', 'carbohydrates': 'carbohydrate',
            'calories': 'calorie', 'proteins': 'protein', 'fats': 'fat',
            'vitamins': 'vitamin', 'minerals': 'mineral',
            'meals': 'meal', 'foods': 'food', 'diets': 'diet',
            'myths': 'myth', 'tips': 'tip', 'swaps': 'swap',
            
            // Adjectives
            'healthier': 'healthy', 'healthiest': 'healthy',
            'better': 'good', 'best': 'good', 'worse': 'bad', 'worst': 'bad'
        };

        // Nutrition-related keywords
        this.nutritionKeywords = [
            'carb', 'carbohydrate', 'protein', 'fat', 'calorie', 'vitamin', 'mineral',
            'fiber', 'sugar', 'salt', 'sodium', 'cholesterol', 'omega', 'antioxidant',
            'diet', 'nutrition', 'meal', 'food', 'eating', 'weight', 'health',
            'exercise', 'fitness', 'muscle', 'metabolism', 'digestion', 'nutrient'
        ];

        // Intent patterns (regex)
        this.intentPatterns = {
            mythQuestion: /(?:is|are|does|do|can|will)\s+(?:it|this|that|they)\s+(?:true|false|bad|good|healthy|unhealthy|work|help)/i,
            mythStatement: /(?:carbs?|carbohydrates?)\s+(?:are|is)\s+(?:always\s+)?bad/i,
            detoxQuestion: /(?:detox|cleanse|flush|remove)\s+(?:toxins?|waste)/i,
            swapRequest: /(?:swap|replace|alternative|instead|substitute)/i,
            recipeRequest: /(?:recipe|how to cook|how to make|meal idea|dish)/i,
            adviceRequest: /(?:advice|tip|suggestion|recommend|what should|how should)/i,
            productCheck: /(?:product|supplement|pill|tea|drink|ingredient)/i,
            healthCondition: /(?:diabetes|diabetic|pregnancy|pregnant|heart disease|kidney|liver|cancer)/i,
            medication: /(?:medication|medicine|prescription|drug|pill|taking|on)/i
        };
    }

    // Text preprocessing: lowercase, remove punctuation, trim
    preprocess(text) {
        if (!text) return '';
        return text
            .toLowerCase()
            .replace(/[^\w\s]/g, ' ')  // Remove punctuation
            .replace(/\s+/g, ' ')      // Normalize whitespace
            .trim();
    }

    // Tokenization: split text into words
    tokenize(text) {
        const preprocessed = this.preprocess(text);
        return preprocessed.split(/\s+/).filter(word => word.length > 0);
    }

    // Lemmatization: convert words to their base form
    lemmatize(word) {
        const lowerWord = word.toLowerCase();
        return this.lemmatizationMap[lowerWord] || lowerWord;
    }

    // Lemmatize entire text
    lemmatizeText(text) {
        const tokens = this.tokenize(text);
        return tokens.map(token => this.lemmatize(token));
    }

    // Remove stop words
    removeStopWords(tokens) {
        return tokens.filter(token => !this.stopWords.has(token.toLowerCase()));
    }

    // Extract keywords from text
    extractKeywords(text, maxKeywords = 10) {
        const tokens = this.tokenize(text);
        const lemmatized = tokens.map(t => this.lemmatize(t));
        const filtered = this.removeStopWords(lemmatized);
        
        // Score keywords (nutrition-related keywords get higher scores)
        const keywordScores = {};
        filtered.forEach(word => {
            if (word.length > 2) {  // Ignore very short words
                keywordScores[word] = (keywordScores[word] || 0) + 1;
                if (this.nutritionKeywords.some(kw => word.includes(kw) || kw.includes(word))) {
                    keywordScores[word] += 2;  // Boost nutrition keywords
                }
            }
        });

        // Sort by score and return top keywords
        return Object.entries(keywordScores)
            .sort((a, b) => b[1] - a[1])
            .slice(0, maxKeywords)
            .map(([word]) => word);
    }

    // Intent classification using regex patterns
    classifyIntent(text) {
        const lowerText = text.toLowerCase();
        const intents = [];

        for (const [intent, pattern] of Object.entries(this.intentPatterns)) {
            if (pattern.test(text)) {
                intents.push(intent);
            }
        }

        // Default intent
        if (intents.length === 0) {
            intents.push('general');
        }

        return intents;
    }

    // Named Entity Recognition (NER) for nutrition context
    extractEntities(text) {
        const entities = {
            foods: [],
            nutrients: [],
            quantities: [],
            timeReferences: [],
            healthConditions: []
        };

        // Food items (common patterns)
        const foodPatterns = [
            /\b(?:rice|bread|pasta|potato|potatoes|chicken|fish|beef|pork|eggs?|milk|cheese|yogurt|fruit|vegetable|salad|soup|sandwich|pizza|burger)\w*/gi,
            /\b(?:apple|banana|orange|strawberry|blueberry|broccoli|spinach|carrot|tomato|avocado|almond|walnut|peanut)\w*/gi
        ];

        foodPatterns.forEach(pattern => {
            const matches = text.match(pattern);
            if (matches) {
                entities.foods.push(...matches.map(m => m.toLowerCase()));
            }
        });

        // Nutrients
        const nutrientPattern = /\b(?:carb|carbohydrate|protein|fat|fiber|vitamin|mineral|calorie|sugar|sodium|cholesterol|omega|antioxidant)\w*/gi;
        const nutrientMatches = text.match(nutrientPattern);
        if (nutrientMatches) {
            entities.nutrients.push(...nutrientMatches.map(m => m.toLowerCase()));
        }

        // Quantities (numbers with units)
        const quantityPattern = /\b\d+\s*(?:g|gram|kg|kilogram|mg|milligram|ml|milliliter|l|liter|oz|ounce|lb|pound|cal|calorie|kcal)\b/gi;
        const quantityMatches = text.match(quantityPattern);
        if (quantityMatches) {
            entities.quantities.push(...quantityMatches);
        }

        // Time references
        const timePattern = /\b(?:breakfast|lunch|dinner|snack|morning|afternoon|evening|daily|weekly|monthly)\w*/gi;
        const timeMatches = text.match(timePattern);
        if (timeMatches) {
            entities.timeReferences.push(...timeMatches.map(m => m.toLowerCase()));
        }

        // Health conditions
        const conditionPattern = /\b(?:diabetes|diabetic|pregnancy|pregnant|heart disease|kidney disease|liver disease|cancer|obesity|hypertension|high blood pressure)\w*/gi;
        const conditionMatches = text.match(conditionPattern);
        if (conditionMatches) {
            entities.healthConditions.push(...conditionMatches.map(m => m.toLowerCase()));
        }

        // Remove duplicates
        Object.keys(entities).forEach(key => {
            entities[key] = [...new Set(entities[key])];
        });

        return entities;
    }

    // Text similarity using Jaccard similarity
    jaccardSimilarity(text1, text2) {
        const tokens1 = new Set(this.lemmatizeText(text1));
        const tokens2 = new Set(this.lemmatizeText(text2));
        
        const intersection = new Set([...tokens1].filter(x => tokens2.has(x)));
        const union = new Set([...tokens1, ...tokens2]);
        
        return intersection.size / union.size;
    }

    // Find most similar text from a list
    findMostSimilar(query, texts, threshold = 0.3) {
        let maxSimilarity = 0;
        let mostSimilar = null;

        texts.forEach(text => {
            const similarity = this.jaccardSimilarity(query, text);
            if (similarity > maxSimilarity && similarity >= threshold) {
                maxSimilarity = similarity;
                mostSimilar = text;
            }
        });

        return { text: mostSimilar, similarity: maxSimilarity };
    }

    // Split text into sentences
    splitSentences(text) {
        return text.split(/[.!?]+\s+/).filter(s => s.trim().length > 0);
    }

    // Extract phrases (n-grams)
    extractNgrams(tokens, n = 2) {
        const ngrams = [];
        for (let i = 0; i <= tokens.length - n; i++) {
            ngrams.push(tokens.slice(i, i + n).join(' '));
        }
        return ngrams;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NLPUtils;
}

