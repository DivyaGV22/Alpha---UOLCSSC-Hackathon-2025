// Source Credibility Scoring System
// Rates source trustworthiness and evidence strength

class SourceCredibility {
    constructor() {
        // Source credibility ratings (1-5 scale)
        this.sourceRatings = {
            // Tier 1: Highest credibility (5/5)
            'NHS': { rating: 5, tier: 'Tier 1', description: 'National Health Service - Government health authority' },
            'WHO': { rating: 5, tier: 'Tier 1', description: 'World Health Organization - International health authority' },
            'Mayo Clinic': { rating: 5, tier: 'Tier 1', description: 'Mayo Clinic - Leading medical institution' },
            'CDC': { rating: 5, tier: 'Tier 1', description: 'Centers for Disease Control and Prevention' },
            'FDA': { rating: 5, tier: 'Tier 1', description: 'Food and Drug Administration' },
            'NCCIH': { rating: 5, tier: 'Tier 1', description: 'National Center for Complementary and Integrative Health' },
            
            // Tier 2: High credibility (4/5)
            'British Dietetic Association': { rating: 4, tier: 'Tier 2', description: 'Professional dietetic association' },
            'Academy of Nutrition and Dietetics': { rating: 4, tier: 'Tier 2', description: 'Professional nutrition organization' },
            'Harvard Health': { rating: 4, tier: 'Tier 2', description: 'Harvard Medical School health publications' },
            'Cleveland Clinic': { rating: 4, tier: 'Tier 2', description: 'Leading medical center' },
            
            // Tier 3: Moderate credibility (3/5)
            'WebMD': { rating: 3, tier: 'Tier 3', description: 'Health information website' },
            'Healthline': { rating: 3, tier: 'Tier 3', description: 'Health information website' },
            'Medical News Today': { rating: 3, tier: 'Tier 3', description: 'Health news website' },
            
            // Tier 4: Low credibility (2/5)
            'Blog': { rating: 2, tier: 'Tier 4', description: 'Personal blog or opinion piece' },
            'Social Media': { rating: 1, tier: 'Tier 4', description: 'Social media post' },
            'Influencer': { rating: 1, tier: 'Tier 4', description: 'Social media influencer' },
            
            // Tier 5: Very low credibility (1/5)
            'Unknown': { rating: 1, tier: 'Tier 5', description: 'Unknown or unverified source' }
        };

        // Evidence strength indicators
        this.evidenceStrength = {
            'strong': {
                level: 5,
                label: 'Strong Evidence',
                description: 'Multiple high-quality studies, consensus among health authorities',
                color: '#10b981',
                icon: '✅'
            },
            'moderate': {
                level: 3,
                label: 'Moderate Evidence',
                description: 'Some supporting research, but more studies needed',
                color: '#f59e0b',
                icon: '⚠️'
            },
            'weak': {
                level: 1,
                label: 'Weak Evidence',
                description: 'Limited or conflicting research, not widely accepted',
                color: '#ef4444',
                icon: '❌'
            }
        };
    }

    // Rate a source
    rateSource(sourceName) {
        // Try exact match first
        if (this.sourceRatings[sourceName]) {
            return this.sourceRatings[sourceName];
        }

        // Try partial match
        const lowerName = sourceName.toLowerCase();
        for (const [key, rating] of Object.entries(this.sourceRatings)) {
            if (lowerName.includes(key.toLowerCase()) || key.toLowerCase().includes(lowerName)) {
                return rating;
            }
        }

        // Check for common patterns
        if (lowerName.includes('government') || lowerName.includes('national') || lowerName.includes('health service')) {
            return { rating: 5, tier: 'Tier 1', description: 'Government health authority' };
        }
        if (lowerName.includes('university') || lowerName.includes('medical school')) {
            return { rating: 4, tier: 'Tier 2', description: 'Academic institution' };
        }
        if (lowerName.includes('blog') || lowerName.includes('personal')) {
            return { rating: 2, tier: 'Tier 4', description: 'Personal blog' };
        }
        if (lowerName.includes('tiktok') || lowerName.includes('instagram') || lowerName.includes('social')) {
            return { rating: 1, tier: 'Tier 4', description: 'Social media' };
        }

        // Default to unknown
        return this.sourceRatings['Unknown'];
    }

    // Determine evidence strength based on sources
    determineEvidenceStrength(sources) {
        if (!sources || sources.length === 0) {
            return this.evidenceStrength.weak;
        }

        const ratings = sources.map(source => {
            const rating = this.rateSource(source.name || source);
            return rating.rating;
        });

        const avgRating = ratings.reduce((a, b) => a + b, 0) / ratings.length;
        const hasTier1 = ratings.some(r => r === 5);
        const sourceCount = sources.length;

        // Strong evidence: High average rating + multiple sources + at least one Tier 1
        if (avgRating >= 4 && sourceCount >= 2 && hasTier1) {
            return this.evidenceStrength.strong;
        }

        // Moderate evidence: Medium rating or single good source
        if (avgRating >= 3 || (sourceCount === 1 && avgRating >= 4)) {
            return this.evidenceStrength.moderate;
        }

        // Weak evidence: Low rating or few sources
        return this.evidenceStrength.weak;
    }

    // Format source with credibility badge
    formatSourceWithCredibility(source) {
        const sourceName = typeof source === 'string' ? source : (source.name || 'Unknown');
        const rating = this.rateSource(sourceName);
        
        return {
            name: sourceName,
            rating: rating.rating,
            tier: rating.tier,
            description: rating.description,
            url: source.url || null,
            text: source.text || null
        };
    }

    // Get credibility badge HTML
    getCredibilityBadge(rating) {
        const stars = '⭐'.repeat(rating.rating) + '☆'.repeat(5 - rating.rating);
        return {
            stars,
            rating: rating.rating,
            tier: rating.tier,
            description: rating.description
        };
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SourceCredibility;
}

