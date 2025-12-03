// Trending Myths Alert System
// Tracks and alerts users about currently viral nutrition myths

class TrendingMyths {
    constructor(evidenceDB) {
        this.evidenceDB = evidenceDB;
        this.storageKey = 'alpha_trending_myths';
        this.trendingMyths = this.loadTrendingMyths();
    }

    loadTrendingMyths() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (e) {
            console.error('Error loading trending myths:', e);
        }
        
        // Default trending myths (can be updated)
        return {
            active: [
                {
                    id: 'carbs-are-bad',
                    trendLevel: 'high',
                    platforms: ['TikTok', 'Instagram'],
                    alertMessage: '⚠️ TRENDING: "Carbs are always bad" is going viral. This is a myth!',
                    lastUpdated: new Date().toISOString()
                },
                {
                    id: 'detox-teas',
                    trendLevel: 'high',
                    platforms: ['Instagram', 'Facebook'],
                    alertMessage: '🚨 ALERT: Detox teas are trending. These are ineffective and potentially harmful!',
                    lastUpdated: new Date().toISOString()
                },
                {
                    id: 'fat-makes-fat',
                    trendLevel: 'medium',
                    platforms: ['YouTube'],
                    alertMessage: '📢 TRENDING: "Fat makes you fat" is spreading. This is scientifically incorrect!',
                    lastUpdated: new Date().toISOString()
                }
            ],
            history: [],
            userAlerts: []
        };
    }

    saveTrendingMyths() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.trendingMyths));
        } catch (e) {
            console.error('Error saving trending myths:', e);
        }
    }

    // Get active trending myths
    getActiveTrendingMyths() {
        return this.trendingMyths.active.filter(myth => {
            // Check if user has already seen this alert
            return !this.trendingMyths.userAlerts.includes(myth.id);
        });
    }

    // Mark alert as seen
    markAlertSeen(mythId) {
        if (!this.trendingMyths.userAlerts.includes(mythId)) {
            this.trendingMyths.userAlerts.push(mythId);
            this.saveTrendingMyths();
        }
    }

    // Get daily myth debunk
    getDailyMythDebunk() {
        const allMyths = Object.keys(this.evidenceDB.myths);
        const today = new Date();
        const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
        
        // Cycle through myths based on day of year
        const mythIndex = dayOfYear % allMyths.length;
        const mythKey = allMyths[mythIndex];
        const myth = this.evidenceDB.myths[mythKey];
        
        return {
            mythKey,
            myth,
            day: dayOfYear
        };
    }

    // Check if user should see trending alert
    shouldShowAlert() {
        const lastAlertDate = localStorage.getItem('alpha_last_alert_date');
        const today = new Date().toDateString();
        
        if (lastAlertDate !== today) {
            const activeMyths = this.getActiveTrendingMyths();
            if (activeMyths.length > 0) {
                localStorage.setItem('alpha_last_alert_date', today);
                return activeMyths[0]; // Return first unread alert
            }
        }
        return null;
    }

    // Add new trending myth
    addTrendingMyth(mythId, trendLevel = 'medium', platforms = []) {
        const existing = this.trendingMyths.active.find(m => m.id === mythId);
        if (!existing) {
            const myth = this.evidenceDB.myths[mythId];
            if (myth) {
                this.trendingMyths.active.push({
                    id: mythId,
                    trendLevel,
                    platforms,
                    alertMessage: `⚠️ TRENDING: "${myth.myth}" is going viral. Let me debunk this!`,
                    lastUpdated: new Date().toISOString()
                });
                this.saveTrendingMyths();
            }
        }
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TrendingMyths;
}

