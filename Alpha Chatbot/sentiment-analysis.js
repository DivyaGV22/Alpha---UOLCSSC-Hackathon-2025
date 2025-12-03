// Sentiment Analysis Module
// Analyzes user sentiment to provide empathetic responses

class SentimentAnalyzer {
    constructor() {
        // Positive sentiment words
        this.positiveWords = new Set([
            'good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic',
            'love', 'like', 'enjoy', 'happy', 'pleased', 'satisfied', 'grateful',
            'helpful', 'useful', 'effective', 'working', 'improving', 'better',
            'thanks', 'thank', 'appreciate', 'excited', 'motivated', 'confident'
        ]);

        // Negative sentiment words
        this.negativeWords = new Set([
            'bad', 'terrible', 'awful', 'horrible', 'worst', 'hate', 'dislike',
            'frustrated', 'confused', 'worried', 'anxious', 'stressed', 'tired',
            'difficult', 'hard', 'impossible', 'struggling', 'failing', 'worse',
            'problem', 'issue', 'concern', 'afraid', 'scared', 'nervous',
            'disappointed', 'sad', 'depressed', 'angry', 'annoyed', 'upset'
        ]);

        // Negation words that flip sentiment
        this.negationWords = new Set([
            'not', 'no', 'never', 'none', 'nothing', 'nobody', 'nowhere',
            'neither', 'nor', 'cannot', "can't", "won't", "don't", "didn't",
            "isn't", "aren't", "wasn't", "weren't", "hasn't", "haven't"
        ]);

        // Intensifiers that amplify sentiment
        this.intensifiers = {
            positive: new Set(['very', 'extremely', 'incredibly', 'absolutely', 'completely', 'totally']),
            negative: new Set(['very', 'extremely', 'incredibly', 'absolutely', 'completely', 'totally'])
        };
    }

    // Analyze sentiment of text
    analyze(text) {
        if (!text || text.trim().length === 0) {
            return { sentiment: 'neutral', score: 0, confidence: 0 };
        }

        const tokens = this.tokenize(text.toLowerCase());
        let positiveScore = 0;
        let negativeScore = 0;
        let negationContext = false;

        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];
            const nextToken = tokens[i + 1];

            // Check for negation
            if (this.negationWords.has(token)) {
                negationContext = true;
                continue;
            }

            // Check for positive words
            if (this.positiveWords.has(token)) {
                let score = 1;
                // Check for intensifiers
                if (i > 0 && this.intensifiers.positive.has(tokens[i - 1])) {
                    score = 1.5;
                }
                if (negationContext) {
                    negativeScore += score;
                    negationContext = false;
                } else {
                    positiveScore += score;
                }
            }

            // Check for negative words
            if (this.negativeWords.has(token)) {
                let score = 1;
                // Check for intensifiers
                if (i > 0 && this.intensifiers.negative.has(tokens[i - 1])) {
                    score = 1.5;
                }
                if (negationContext) {
                    positiveScore += score;
                    negationContext = false;
                } else {
                    negativeScore += score;
                }
            }

            // Reset negation context after a few words
            if (negationContext && i > 0 && !this.negationWords.has(tokens[i - 1])) {
                negationContext = false;
            }
        }

        // Calculate final sentiment
        const totalScore = positiveScore + negativeScore;
        const sentimentScore = totalScore > 0 ? (positiveScore - negativeScore) / totalScore : 0;

        let sentiment = 'neutral';
        let confidence = Math.abs(sentimentScore);

        if (sentimentScore > 0.2) {
            sentiment = 'positive';
        } else if (sentimentScore < -0.2) {
            sentiment = 'negative';
        }

        // Adjust confidence based on total score
        confidence = Math.min(confidence, Math.min(totalScore / 3, 1));

        return {
            sentiment,
            score: sentimentScore,
            confidence,
            positiveScore,
            negativeScore
        };
    }

    // Tokenize text
    tokenize(text) {
        return text
            .toLowerCase()
            .replace(/[^\w\s]/g, ' ')
            .split(/\s+/)
            .filter(word => word.length > 0);
    }

    // Get empathetic response suggestions based on sentiment
    getEmpatheticResponse(sentimentResult) {
        const { sentiment, confidence } = sentimentResult;

        if (confidence < 0.3) {
            return null; // Not confident enough to adjust response
        }

        const suggestions = {
            positive: [
                "That's great to hear!",
                "I'm glad you're feeling positive about this!",
                "Wonderful! Let's keep that momentum going.",
                "Excellent! I'm here to support your continued progress."
            ],
            negative: [
                "I understand this can be challenging.",
                "I hear you, and I'm here to help.",
                "It's okay to feel this way. Let's work through this together.",
                "I appreciate you sharing this. Let's find a solution that works for you."
            ],
            neutral: []
        };

        if (sentiment in suggestions && suggestions[sentiment].length > 0) {
            return suggestions[sentiment][Math.floor(Math.random() * suggestions[sentiment].length)];
        }

        return null;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SentimentAnalyzer;
}

