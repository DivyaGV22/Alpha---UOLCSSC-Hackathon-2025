// Misinformation Tracker
// Tracks myths user has encountered and debunked

class MisinformationTracker {
    constructor() {
        this.storageKey = 'alpha_misinformation_tracker';
        this.data = this.loadData();
    }

    loadData() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (e) {
            console.error('Error loading misinformation tracker:', e);
        }
        
        return {
            mythsEncountered: [],
            mythsDebunked: [],
            fadProductsChecked: [],
            socialMediaClaims: [],
            totalSavings: 0,
            firstEncounterDate: null,
            lastEncounterDate: null
        };
    }

    saveData() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.data));
        } catch (e) {
            console.error('Error saving misinformation tracker:', e);
        }
    }

    // Track myth encounter
    trackMythEncounter(mythId, mythData, source = 'user_message') {
        const encounter = {
            mythId,
            myth: mythData.myth || mythData,
            source,
            timestamp: new Date().toISOString(),
            debunked: false
        };

        // Check if already encountered
        const existing = this.data.mythsEncountered.find(m => m.mythId === mythId);
        if (!existing) {
            this.data.mythsEncountered.push(encounter);
            if (!this.data.firstEncounterDate) {
                this.data.firstEncounterDate = new Date().toISOString();
            }
            this.data.lastEncounterDate = new Date().toISOString();
            this.saveData();
        }

        return encounter;
    }

    // Track myth debunk
    trackMythDebunked(mythId, mythData) {
        // Add to debunked list
        const debunked = {
            mythId,
            myth: mythData.myth || mythData,
            timestamp: new Date().toISOString()
        };

        const existing = this.data.mythsDebunked.find(m => m.mythId === mythId);
        if (!existing) {
            this.data.mythsDebunked.push(debunked);
        }

        // Update encounter
        const encounter = this.data.mythsEncountered.find(m => m.mythId === mythId);
        if (encounter) {
            encounter.debunked = true;
            encounter.debunkedAt = new Date().toISOString();
        }

        this.saveData();
    }

    // Track fad product check
    trackFadProduct(productName, productData) {
        const check = {
            productName,
            safetyRating: productData.safetyRating,
            effectivenessRating: productData.effectivenessRating,
            timestamp: new Date().toISOString()
        };

        const existing = this.data.fadProductsChecked.find(p => p.productName === productName);
        if (!existing) {
            this.data.fadProductsChecked.push(check);
            this.saveData();
        }
    }

    // Track social media claim
    trackSocialMediaClaim(claim, factCheckResult) {
        const claimData = {
            claim,
            isMyth: factCheckResult.isMyth,
            isFadProduct: factCheckResult.isFadProduct,
            confidence: factCheckResult.confidence,
            timestamp: new Date().toISOString()
        };

        this.data.socialMediaClaims.push(claimData);
        this.saveData();
    }

    // Get statistics
    getStats() {
        const totalMyths = this.data.mythsEncountered.length;
        const totalDebunked = this.data.mythsDebunked.length;
        const debunkRate = totalMyths > 0 ? (totalDebunked / totalMyths) * 100 : 0;
        
        const daysActive = this.data.firstEncounterDate 
            ? Math.ceil((new Date() - new Date(this.data.firstEncounterDate)) / (1000 * 60 * 60 * 24))
            : 0;

        return {
            totalMythsEncountered: totalMyths,
            totalMythsDebunked: totalDebunked,
            debunkRate: Math.round(debunkRate),
            fadProductsChecked: this.data.fadProductsChecked.length,
            socialMediaClaimsChecked: this.data.socialMediaClaims.length,
            daysActive,
            mythsPerDay: daysActive > 0 ? (totalMyths / daysActive).toFixed(1) : 0,
            recentMyths: this.data.mythsEncountered.slice(-5).reverse(),
            recentDebunks: this.data.mythsDebunked.slice(-5).reverse()
        };
    }

    // Get learning progress
    getLearningProgress() {
        const stats = this.getStats();
        
        let level = 'Beginner';
        let progress = 0;
        
        if (stats.totalMythsDebunked >= 20) {
            level = 'Expert';
            progress = 100;
        } else if (stats.totalMythsDebunked >= 10) {
            level = 'Advanced';
            progress = (stats.totalMythsDebunked / 20) * 100;
        } else if (stats.totalMythsDebunked >= 5) {
            level = 'Intermediate';
            progress = (stats.totalMythsDebunked / 10) * 100;
        } else {
            level = 'Beginner';
            progress = (stats.totalMythsDebunked / 5) * 100;
        }

        return {
            level,
            progress: Math.min(progress, 100),
            mythsToNextLevel: level === 'Expert' ? 0 : 
                            level === 'Advanced' ? 20 - stats.totalMythsDebunked :
                            level === 'Intermediate' ? 10 - stats.totalMythsDebunked :
                            5 - stats.totalMythsDebunked
        };
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MisinformationTracker;
}

