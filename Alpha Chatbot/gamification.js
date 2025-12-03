// Gamification System for Alpha Nutrition Chatbot
// Includes: Points, XP, Levels, Achievements, Streaks, Challenges

class GamificationSystem {
    constructor() {
        this.storageKey = 'alpha_gamification_data';
        this.data = this.loadData();
        this.initializeDefaults();
    }

    initializeDefaults() {
        if (!this.data.initialized) {
            this.data = {
                initialized: true,
                level: 1,
                xp: 0,
                totalXP: 0,
                points: 0,
                streak: 0,
                lastActiveDate: null,
                achievements: [],
                completedChallenges: [],
                activeChallenges: [],
                stats: {
                    messagesSent: 0,
                    mythsDebunked: 0,
                    swapsLearned: 0,
                    recipesViewed: 0,
                    daysActive: 0,
                    questionsAnswered: 0
                },
                unlockedContent: [],
                badges: []
            };
            this.saveData();
        }
    }

    loadData() {
        const saved = localStorage.getItem(this.storageKey);
        return saved ? JSON.parse(saved) : { initialized: false };
    }

    saveData() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.data));
    }

    // XP and Leveling System
    addXP(amount, reason = '') {
        this.data.xp += amount;
        this.data.totalXP += amount;
        
        const oldLevel = this.data.level;
        this.data.level = this.calculateLevel(this.data.totalXP);
        
        const leveledUp = this.data.level > oldLevel;
        
        if (leveledUp) {
            this.unlockAchievement('level_up', { level: this.data.level });
            this.addPoints(50, 'Level Up Bonus!');
        }
        
        this.saveData();
        return { leveledUp, newLevel: this.data.level, xp: this.data.xp };
    }

    calculateLevel(totalXP) {
        // Level formula: sqrt(xp / 100) + 1
        return Math.floor(Math.sqrt(totalXP / 100)) + 1;
    }

    getXPForNextLevel() {
        const currentLevelXP = Math.pow((this.data.level - 1), 2) * 100;
        const nextLevelXP = Math.pow(this.data.level, 2) * 100;
        return nextLevelXP - currentLevelXP;
    }

    getXPProgress() {
        const currentLevelXP = Math.pow((this.data.level - 1), 2) * 100;
        const nextLevelXP = Math.pow(this.data.level, 2) * 100;
        const currentProgress = this.data.totalXP - currentLevelXP;
        const needed = nextLevelXP - currentLevelXP;
        return {
            current: currentProgress,
            needed: needed,
            percentage: (currentProgress / needed) * 100
        };
    }

    // Points System
    addPoints(amount, reason = '') {
        this.data.points += amount;
        this.saveData();
        return this.data.points;
    }

    spendPoints(amount) {
        if (this.data.points >= amount) {
            this.data.points -= amount;
            this.saveData();
            return true;
        }
        return false;
    }

    // Streak System
    updateStreak() {
        const today = new Date().toDateString();
        const lastDate = this.data.lastActiveDate ? new Date(this.data.lastActiveDate).toDateString() : null;
        
        if (lastDate === today) {
            // Already active today
            return { streak: this.data.streak, isNew: false };
        }
        
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toDateString();
        
        if (lastDate === yesterdayStr) {
            // Continuing streak
            this.data.streak += 1;
        } else if (lastDate !== today) {
            // Streak broken
            this.data.streak = 1;
        } else {
            // First time
            this.data.streak = 1;
        }
        
        this.data.lastActiveDate = new Date().toISOString();
        this.data.stats.daysActive += 1;
        
        // Streak achievements
        if (this.data.streak === 7) {
            this.unlockAchievement('streak_7', { streak: 7 });
        } else if (this.data.streak === 30) {
            this.unlockAchievement('streak_30', { streak: 30 });
        } else if (this.data.streak === 100) {
            this.unlockAchievement('streak_100', { streak: 100 });
        }
        
        this.saveData();
        return { streak: this.data.streak, isNew: true };
    }

    // Achievements System
    achievements = {
        first_message: {
            name: 'First Steps',
            description: 'Send your first message',
            icon: '👋',
            xp: 10,
            points: 5
        },
        myth_buster_1: {
            name: 'Myth Buster',
            description: 'Debunk your first myth',
            icon: '🔍',
            xp: 25,
            points: 10
        },
        myth_buster_10: {
            name: 'Myth Destroyer',
            description: 'Debunk 10 myths',
            icon: '💥',
            xp: 100,
            points: 50
        },
        swap_master: {
            name: 'Swap Master',
            description: 'Learn 5 healthy swaps',
            icon: '🔄',
            xp: 50,
            points: 25
        },
        recipe_collector: {
            name: 'Recipe Collector',
            description: 'View 10 recipes',
            icon: '📖',
            xp: 75,
            points: 35
        },
        streak_7: {
            name: 'Week Warrior',
            description: '7 day streak',
            icon: '🔥',
            xp: 50,
            points: 25
        },
        streak_30: {
            name: 'Monthly Master',
            description: '30 day streak',
            icon: '⭐',
            xp: 200,
            points: 100
        },
        streak_100: {
            name: 'Century Champion',
            description: '100 day streak',
            icon: '🏆',
            xp: 500,
            points: 250
        },
        level_5: {
            name: 'Rising Star',
            description: 'Reach level 5',
            icon: '⭐',
            xp: 0,
            points: 0
        },
        level_10: {
            name: 'Nutrition Expert',
            description: 'Reach level 10',
            icon: '🌟',
            xp: 0,
            points: 0
        },
        level_20: {
            name: 'Nutrition Master',
            description: 'Reach level 20',
            icon: '👑',
            xp: 0,
            points: 0
        },
        level_up: {
            name: 'Level Up!',
            description: 'Level up for the first time',
            icon: '⬆️',
            xp: 0,
            points: 0
        },
        question_master: {
            name: 'Question Master',
            description: 'Ask 50 questions',
            icon: '❓',
            xp: 100,
            points: 50
        },
        early_bird: {
            name: 'Early Bird',
            description: 'Use the app before 8 AM',
            icon: '🌅',
            xp: 25,
            points: 10
        }
    };

    unlockAchievement(achievementId, metadata = {}) {
        if (this.data.achievements.includes(achievementId)) {
            return null; // Already unlocked
        }

        const achievement = this.achievements[achievementId];
        if (!achievement) return null;

        this.data.achievements.push(achievementId);
        
        if (achievement.xp > 0) {
            this.addXP(achievement.xp, `Achievement: ${achievement.name}`);
        }
        
        if (achievement.points > 0) {
            this.addPoints(achievement.points, `Achievement: ${achievement.name}`);
        }

        this.saveData();
        return {
            id: achievementId,
            name: achievement.name,
            description: achievement.description,
            icon: achievement.icon,
            xp: achievement.xp,
            points: achievement.points
        };
    }

    checkAchievements() {
        const newAchievements = [];

        // Check message count achievements
        if (this.data.stats.messagesSent === 1 && !this.data.achievements.includes('first_message')) {
            const achievement = this.unlockAchievement('first_message');
            if (achievement) newAchievements.push(achievement);
        }

        // Check myth debunking achievements
        if (this.data.stats.mythsDebunked === 1 && !this.data.achievements.includes('myth_buster_1')) {
            const achievement = this.unlockAchievement('myth_buster_1');
            if (achievement) newAchievements.push(achievement);
        }

        if (this.data.stats.mythsDebunked >= 10 && !this.data.achievements.includes('myth_buster_10')) {
            const achievement = this.unlockAchievement('myth_buster_10');
            if (achievement) newAchievements.push(achievement);
        }

        // Check swap achievements
        if (this.data.stats.swapsLearned >= 5 && !this.data.achievements.includes('swap_master')) {
            const achievement = this.unlockAchievement('swap_master');
            if (achievement) newAchievements.push(achievement);
        }

        // Check recipe achievements
        if (this.data.stats.recipesViewed >= 10 && !this.data.achievements.includes('recipe_collector')) {
            const achievement = this.unlockAchievement('recipe_collector');
            if (achievement) newAchievements.push(achievement);
        }

        // Check level achievements
        if (this.data.level >= 5 && !this.data.achievements.includes('level_5')) {
            const achievement = this.unlockAchievement('level_5');
            if (achievement) newAchievements.push(achievement);
        }

        if (this.data.level >= 10 && !this.data.achievements.includes('level_10')) {
            const achievement = this.unlockAchievement('level_10');
            if (achievement) newAchievements.push(achievement);
        }

        if (this.data.level >= 20 && !this.data.achievements.includes('level_20')) {
            const achievement = this.unlockAchievement('level_20');
            if (achievement) newAchievements.push(achievement);
        }

        // Check question achievements
        if (this.data.stats.questionsAnswered >= 50 && !this.data.achievements.includes('question_master')) {
            const achievement = this.unlockAchievement('question_master');
            if (achievement) newAchievements.push(achievement);
        }

        // Check early bird
        const hour = new Date().getHours();
        if (hour < 8 && !this.data.achievements.includes('early_bird')) {
            const achievement = this.unlockAchievement('early_bird');
            if (achievement) newAchievements.push(achievement);
        }

        return newAchievements;
    }

    // Challenges/Quests System
    challenges = {
        daily_myth: {
            name: 'Daily Myth Buster',
            description: 'Debunk one myth today',
            type: 'daily',
            reward: { xp: 20, points: 10 },
            check: () => this.data.stats.mythsDebunked > 0
        },
        daily_swap: {
            name: 'Swap Seeker',
            description: 'Learn one healthy swap today',
            type: 'daily',
            reward: { xp: 15, points: 5 },
            check: () => this.data.stats.swapsLearned > 0
        },
        weekly_questions: {
            name: 'Curious Mind',
            description: 'Ask 10 questions this week',
            type: 'weekly',
            reward: { xp: 50, points: 25 },
            check: () => this.data.stats.questionsAnswered >= 10
        }
    };

    // Stats tracking
    trackMessage() {
        this.data.stats.messagesSent += 1;
        this.addXP(2, 'Message sent');
        this.saveData();
    }

    trackMythDebunked() {
        this.data.stats.mythsDebunked += 1;
        this.addXP(15, 'Myth debunked');
        this.saveData();
        this.checkAchievements();
    }

    trackSwapLearned() {
        this.data.stats.swapsLearned += 1;
        this.addXP(10, 'Swap learned');
        this.saveData();
        this.checkAchievements();
    }

    trackRecipeViewed() {
        this.data.stats.recipesViewed += 1;
        this.addXP(5, 'Recipe viewed');
        this.saveData();
        this.checkAchievements();
    }

    trackQuestionAnswered() {
        this.data.stats.questionsAnswered += 1;
        this.addXP(3, 'Question answered');
        this.saveData();
        this.checkAchievements();
    }

    // Get formatted stats
    getStats() {
        return {
            level: this.data.level,
            xp: this.data.xp,
            totalXP: this.data.totalXP,
            points: this.data.points,
            streak: this.data.streak,
            xpProgress: this.getXPProgress(),
            achievements: this.data.achievements.length,
            totalAchievements: Object.keys(this.achievements).length,
            stats: { ...this.data.stats }
        };
    }

    // Get achievement details
    getAchievementDetails(achievementId) {
        return this.achievements[achievementId] || null;
    }

    // Get all unlocked achievements
    getUnlockedAchievements() {
        return this.data.achievements.map(id => ({
            id,
            ...this.achievements[id],
            unlocked: true
        }));
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GamificationSystem;
}

