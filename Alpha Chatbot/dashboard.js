// Dashboard System for Nutrition Tracking
// Manages daily nutrition summary, habit tracking, goals, and insights

class Dashboard {
    constructor() {
        this.storageKey = 'alpha_dashboard_data';
        this.data = this.loadData();
    }

    loadData() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (e) {
            console.error('Error loading dashboard data:', e);
        }
        
        return {
            nutrition: {
                calories: 0,
                protein: 0,
                carbs: 0,
                fats: 0,
                fiber: 0,
                water: 0
            },
            habits: {
                fruitsVeggies: 0,
                steps: 0,
                sleep: 0
            },
            goals: {
                calories: 2000,
                protein: 150,
                carbs: 250,
                fats: 65,
                fiber: 30,
                water: 8
            },
            weight: [],
            mealStreak: 0,
            lastMealDate: null,
            history: []
        };
    }

    saveData() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.data));
        } catch (e) {
            console.error('Error saving dashboard data:', e);
        }
    }

    // Update nutrition values
    updateNutrition(nutrition) {
        Object.keys(nutrition).forEach(key => {
            if (this.data.nutrition.hasOwnProperty(key)) {
                this.data.nutrition[key] += nutrition[key];
            }
        });
        this.saveData();
    }

    // Update habits
    updateHabits(habits) {
        Object.keys(habits).forEach(key => {
            if (this.data.habits.hasOwnProperty(key)) {
                this.data.habits[key] += habits[key];
            }
        });
        this.saveData();
    }

    // Log meal
    logMeal(mealData) {
        const today = new Date().toDateString();
        
        // Update streak
        if (this.data.lastMealDate !== today) {
            if (this.data.lastMealDate === new Date(Date.now() - 86400000).toDateString()) {
                this.data.mealStreak++;
            } else {
                this.data.mealStreak = 1;
            }
            this.data.lastMealDate = today;
        }

        // Add to history
        this.data.history.push({
            date: today,
            meal: mealData,
            timestamp: new Date().toISOString()
        });

        // Update nutrition if provided
        if (mealData.nutrition) {
            this.updateNutrition(mealData.nutrition);
        }

        this.saveData();
    }

    // Add weight entry
    addWeight(weight, date = new Date()) {
        this.data.weight.push({
            date: date.toISOString(),
            weight: weight
        });
        this.saveData();
    }

    // Get insights
    getInsights() {
        const insights = [];
        const nutrition = this.data.nutrition;
        const goals = this.data.goals;

        // Protein goal
        if (nutrition.protein >= goals.protein) {
            insights.push({
                type: 'success',
                message: `🎉 You hit your protein goal today! (${nutrition.protein.toFixed(0)}g / ${goals.protein}g)`,
                icon: '💪'
            });
        } else if (nutrition.protein < goals.protein * 0.5) {
            insights.push({
                type: 'warning',
                message: `⚠️ You're low on protein. Try adding lean meats, eggs, or legumes!`,
                icon: '🥩'
            });
        }

        // Fiber goal
        if (nutrition.fiber < goals.fiber * 0.7) {
            insights.push({
                type: 'info',
                message: `📊 You're low on fiber. Here are high-fiber foods: berries, whole grains, beans, and leafy greens!`,
                icon: '🌾'
            });
        } else if (nutrition.fiber >= goals.fiber) {
            insights.push({
                type: 'success',
                message: `✅ Great job on hitting your fiber goal!`,
                icon: '🌾'
            });
        }

        // Water intake
        if (nutrition.water < goals.water * 0.7) {
            insights.push({
                type: 'warning',
                message: `💧 Remember to stay hydrated! You've had ${nutrition.water} glasses today.`,
                icon: '💧'
            });
        }

        // Calories
        const calPercent = (nutrition.calories / goals.calories) * 100;
        if (calPercent > 110) {
            insights.push({
                type: 'warning',
                message: `📈 You're over your calorie goal. Consider lighter options for your next meal.`,
                icon: '📈'
            });
        } else if (calPercent >= 90 && calPercent <= 110) {
            insights.push({
                type: 'success',
                message: `🎯 Perfect calorie balance today!`,
                icon: '🎯'
            });
        }

        return insights;
    }

    // Get dashboard summary
    getSummary() {
        const nutrition = this.data.nutrition;
        const goals = this.data.goals;
        const habits = this.data.habits;

        return {
            nutrition: {
                calories: {
                    current: nutrition.calories,
                    goal: goals.calories,
                    percent: (nutrition.calories / goals.calories) * 100
                },
                protein: {
                    current: nutrition.protein,
                    goal: goals.protein,
                    percent: (nutrition.protein / goals.protein) * 100
                },
                carbs: {
                    current: nutrition.carbs,
                    goal: goals.carbs,
                    percent: (nutrition.carbs / goals.carbs) * 100
                },
                fats: {
                    current: nutrition.fats,
                    goal: goals.fats,
                    percent: (nutrition.fats / goals.fats) * 100
                },
                fiber: {
                    current: nutrition.fiber,
                    goal: goals.fiber,
                    percent: (nutrition.fiber / goals.fiber) * 100
                },
                water: {
                    current: nutrition.water,
                    goal: goals.water,
                    percent: (nutrition.water / goals.water) * 100
                }
            },
            habits: habits,
            mealStreak: this.data.mealStreak,
            weight: this.data.weight.slice(-7), // Last 7 entries
            insights: this.getInsights()
        };
    }

    // Reset daily values
    resetDaily() {
        const today = new Date().toDateString();
        const lastReset = localStorage.getItem('alpha_dashboard_last_reset');
        
        if (lastReset !== today) {
            this.data.nutrition = {
                calories: 0,
                protein: 0,
                carbs: 0,
                fats: 0,
                fiber: 0,
                water: 0
            };
            this.data.habits = {
                fruitsVeggies: 0,
                steps: 0,
                sleep: 0
            };
            localStorage.setItem('alpha_dashboard_last_reset', today);
            this.saveData();
        }
    }

    // Initialize - reset daily values if needed
    init() {
        this.resetDaily();
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Dashboard;
}

