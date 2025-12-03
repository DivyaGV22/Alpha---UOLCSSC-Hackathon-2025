// Product Safety Checker
// Database of fad products with safety ratings and evidence

class ProductSafetyChecker {
    constructor() {
        this.storageKey = 'alpha_product_safety_db';
        this.products = this.loadProducts();
    }

    loadProducts() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (e) {
            console.error('Error loading product database:', e);
        }
        
        // Product safety database
        return {
            'detox tea': {
                name: 'Detox Teas',
                category: 'supplement',
                safetyRating: 2, // 1-5 scale (1 = dangerous, 5 = safe)
                effectivenessRating: 1, // 1-5 scale (1 = ineffective, 5 = effective)
                evidence: 'weak',
                warnings: [
                    'Often contains laxatives that can cause dehydration',
                    'May interact with medications',
                    'No proven detoxification benefits',
                    'Temporary weight loss is mostly water weight'
                ],
                alternatives: [
                    'Herbal teas (chamomile, peppermint) for hydration',
                    'Balanced diet with adequate fiber',
                    'Adequate water intake',
                    'Regular exercise'
                ],
                sources: [
                    { name: 'NCCIH', url: 'https://www.nccih.nih.gov/health/detoxes-and-cleanses-what-you-need-to-know' }
                ],
                costAnalysis: {
                    averageCost: '$30-50/month',
                    value: 'Poor - No proven benefits',
                    betterAlternative: 'Whole foods diet - $150-200/month for balanced nutrition'
                }
            },
            'fat burner': {
                name: 'Fat Burner Supplements',
                category: 'supplement',
                safetyRating: 2,
                effectivenessRating: 2,
                evidence: 'weak',
                warnings: [
                    'May contain stimulants (caffeine, synephrine)',
                    'Can cause heart palpitations and anxiety',
                    'No FDA approval for weight loss claims',
                    'Long-term safety unknown'
                ],
                alternatives: [
                    'Regular exercise',
                    'Balanced diet with caloric deficit',
                    'Strength training to build muscle',
                    'Adequate sleep for metabolism'
                ],
                sources: [
                    { name: 'FDA', url: 'https://www.fda.gov/food/dietary-supplements' }
                ],
                costAnalysis: {
                    averageCost: '$40-80/month',
                    value: 'Poor - Minimal proven benefits',
                    betterAlternative: 'Gym membership + whole foods - Better long-term results'
                }
            },
            'appetite suppressant': {
                name: 'Appetite Suppressant Pills',
                category: 'supplement',
                safetyRating: 2,
                effectivenessRating: 2,
                evidence: 'weak',
                warnings: [
                    'May cause side effects (nausea, dizziness)',
                    'Not regulated by FDA for over-the-counter use',
                    'Can mask underlying eating issues',
                    'Temporary solution, not sustainable'
                ],
                alternatives: [
                    'High-fiber foods (fruits, vegetables, whole grains)',
                    'Adequate protein intake',
                    'Regular meal timing',
                    'Mindful eating practices'
                ],
                sources: [
                    { name: 'Mayo Clinic', url: 'https://www.mayoclinic.org/healthy-lifestyle/weight-loss/in-depth/weight-loss/art-20048466' }
                ],
                costAnalysis: {
                    averageCost: '$50-100/month',
                    value: 'Poor - Side effects outweigh benefits',
                    betterAlternative: 'Nutrition counseling - Sustainable approach'
                }
            },
            'carb blocker': {
                name: 'Carb Blocker Supplements',
                category: 'supplement',
                safetyRating: 3,
                effectivenessRating: 2,
                evidence: 'weak',
                warnings: [
                    'Limited evidence for effectiveness',
                    'May cause digestive issues',
                    'Does not replace need for balanced diet',
                    'Expensive for minimal benefit'
                ],
                alternatives: [
                    'Choose whole grains over refined carbs',
                    'Portion control',
                    'Balanced meals with protein and fiber',
                    'Regular physical activity'
                ],
                sources: [
                    { name: 'NCCIH', url: 'https://www.nccih.nih.gov/health/weight-control' }
                ],
                costAnalysis: {
                    averageCost: '$30-60/month',
                    value: 'Poor - Unproven benefits',
                    betterAlternative: 'Whole grain foods - Better nutrition value'
                }
            },
            'metabolism booster': {
                name: 'Metabolism Booster Supplements',
                category: 'supplement',
                safetyRating: 2,
                effectivenessRating: 2,
                evidence: 'weak',
                warnings: [
                    'Metabolism is largely determined by genetics and muscle mass',
                    'Supplements have minimal impact',
                    'May contain unregulated ingredients',
                    'Expensive with little benefit'
                ],
                alternatives: [
                    'Strength training to build muscle',
                    'Adequate protein intake',
                    'Regular physical activity',
                    'Adequate sleep (7-9 hours)'
                ],
                sources: [
                    { name: 'Mayo Clinic', url: 'https://www.mayoclinic.org/healthy-lifestyle/weight-loss/in-depth/metabolism/art-20046508' }
                ],
                costAnalysis: {
                    averageCost: '$40-70/month',
                    value: 'Poor - Minimal impact on metabolism',
                    betterAlternative: 'Gym membership + protein-rich foods - Proven results'
                }
            }
        };
    }

    saveProducts() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.products));
        } catch (e) {
            console.error('Error saving product database:', e);
        }
    }

    // Check product safety
    checkProduct(productName) {
        const lowerName = productName.toLowerCase();
        
        // Direct match
        if (this.products[lowerName]) {
            return { found: true, product: this.products[lowerName] };
        }

        // Partial match
        for (const [key, product] of Object.entries(this.products)) {
            if (lowerName.includes(key) || key.includes(lowerName.split(' ')[0])) {
                return { found: true, product };
            }
        }

        // Check for keywords
        const keywords = {
            'detox': 'detox tea',
            'cleanse': 'detox tea',
            'fat burn': 'fat burner',
            'weight loss pill': 'appetite suppressant',
            'appetite suppress': 'appetite suppressant',
            'carb block': 'carb blocker',
            'metabolism boost': 'metabolism booster'
        };

        for (const [keyword, productKey] of Object.entries(keywords)) {
            if (lowerName.includes(keyword)) {
                return { found: true, product: this.products[productKey] };
            }
        }

        return { found: false, product: null };
    }

    // Get safety rating color
    getSafetyColor(rating) {
        if (rating <= 2) return '#ef4444'; // Red - Dangerous
        if (rating === 3) return '#f59e0b'; // Orange - Caution
        return '#10b981'; // Green - Safe
    }

    // Calculate money saved
    calculateSavings(productsChecked) {
        let totalSpent = 0;
        let totalValue = 0;

        productsChecked.forEach(productName => {
            const check = this.checkProduct(productName);
            if (check.found && check.product.costAnalysis) {
                const cost = parseFloat(check.product.costAnalysis.averageCost.replace(/[^0-9.]/g, ''));
                totalSpent += cost || 0;
                totalValue += 0; // No value from fad products
            }
        });

        return {
            totalSpent,
            totalValue,
            moneyWasted: totalSpent,
            recommendation: `You could save $${totalSpent.toFixed(0)}/month by avoiding these products and investing in whole foods instead.`
        };
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProductSafetyChecker;
}

