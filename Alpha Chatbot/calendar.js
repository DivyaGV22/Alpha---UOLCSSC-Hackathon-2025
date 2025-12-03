// Calendar System for Meal Planning and Reminders
// Manages meal plans, reminders, and appointments

class CalendarSystem {
    constructor() {
        this.storageKey = 'alpha_calendar_data';
        this.data = this.loadData();
    }

    loadData() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (e) {
            console.error('Error loading calendar data:', e);
        }
        
        return {
            mealPlans: {},
            reminders: [],
            appointments: []
        };
    }

    saveData() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.data));
        } catch (e) {
            console.error('Error saving calendar data:', e);
        }
    }

    // Format date as YYYY-MM-DD
    formatDate(date) {
        const d = new Date(date);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }

    // Add meal plan for a date
    addMealPlan(date, meals) {
        const dateKey = this.formatDate(date);
        this.data.mealPlans[dateKey] = meals;
        this.saveData();
    }

    // Get meal plan for a date
    getMealPlan(date) {
        const dateKey = this.formatDate(date);
        return this.data.mealPlans[dateKey] || null;
    }

    // Generate weekly meal plan
    generateWeeklyMealPlan(startDate = new Date()) {
        const weekPlan = {};
        const meals = ['breakfast', 'lunch', 'dinner'];
        
        // Sample meal suggestions (in a real app, this would use AI)
        const mealSuggestions = {
            breakfast: [
                'Oatmeal with berries and nuts',
                'Greek yogurt with granola',
                'Scrambled eggs with whole grain toast',
                'Smoothie bowl',
                'Avocado toast with eggs'
            ],
            lunch: [
                'Grilled chicken salad',
                'Quinoa bowl with vegetables',
                'Lentil soup with whole grain bread',
                'Turkey and vegetable wrap',
                'Mediterranean bowl'
            ],
            dinner: [
                'Baked salmon with roasted vegetables',
                'Chicken stir-fry with brown rice',
                'Vegetable curry with quinoa',
                'Grilled chicken with sweet potato',
                'Pasta with marinara and vegetables'
            ]
        };

        for (let i = 0; i < 7; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);
            const dateKey = this.formatDate(date);
            
            weekPlan[dateKey] = {
                breakfast: mealSuggestions.breakfast[i % mealSuggestions.breakfast.length],
                lunch: mealSuggestions.lunch[i % mealSuggestions.lunch.length],
                dinner: mealSuggestions.dinner[i % mealSuggestions.dinner.length],
                snacks: 'Fresh fruit or nuts'
            };
        }

        // Save all plans
        Object.keys(weekPlan).forEach(dateKey => {
            this.data.mealPlans[dateKey] = weekPlan[dateKey];
        });

        this.saveData();
        return weekPlan;
    }

    // Add reminder
    addReminder(type, time, message, repeat = false) {
        const reminder = {
            id: Date.now().toString(),
            type: type, // 'water', 'meal', 'checkin', 'prep'
            time: time,
            message: message,
            repeat: repeat,
            active: true,
            createdAt: new Date().toISOString()
        };
        
        this.data.reminders.push(reminder);
        this.saveData();
        return reminder;
    }

    // Get reminders for today
    getTodayReminders() {
        const today = new Date();
        const todayTime = today.getHours() * 60 + today.getMinutes();
        
        return this.data.reminders.filter(reminder => {
            if (!reminder.active) return false;
            
            const reminderTime = parseInt(reminder.time.split(':')[0]) * 60 + parseInt(reminder.time.split(':')[1]);
            
            if (reminder.repeat) {
                return reminderTime >= todayTime;
            } else {
                // Check if reminder is for today
                const reminderDate = new Date(reminder.createdAt);
                return reminderDate.toDateString() === today.toDateString() && reminderTime >= todayTime;
            }
        });
    }

    // Add appointment
    addAppointment(title, date, time, notes = '') {
        const appointment = {
            id: Date.now().toString(),
            title: title,
            date: this.formatDate(date),
            time: time,
            notes: notes,
            createdAt: new Date().toISOString()
        };
        
        this.data.appointments.push(appointment);
        this.saveData();
        return appointment;
    }

    // Get appointments for a date range
    getAppointments(startDate, endDate) {
        const start = this.formatDate(startDate);
        const end = this.formatDate(endDate);
        
        return this.data.appointments.filter(apt => {
            return apt.date >= start && apt.date <= end;
        });
    }

    // Generate grocery list from meal plans
    generateGroceryList(startDate, days = 7) {
        const items = new Set();
        const mealPlans = {};
        
        for (let i = 0; i < days; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);
            const dateKey = this.formatDate(date);
            const plan = this.data.mealPlans[dateKey];
            
            if (plan) {
                // Extract common ingredients (simplified)
                const allMeals = `${plan.breakfast} ${plan.lunch} ${plan.dinner} ${plan.snacks || ''}`.toLowerCase();
                
                // Common ingredients to look for
                const ingredients = [
                    'chicken', 'salmon', 'turkey', 'eggs', 'yogurt', 'milk',
                    'oats', 'quinoa', 'rice', 'bread', 'pasta',
                    'vegetables', 'fruits', 'berries', 'avocado', 'sweet potato',
                    'nuts', 'granola', 'lentils', 'beans'
                ];
                
                ingredients.forEach(ingredient => {
                    if (allMeals.includes(ingredient)) {
                        items.add(ingredient);
                    }
                });
            }
        }
        
        return Array.from(items);
    }

    // Get calendar view for a month
    getMonthView(year, month) {
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const days = [];
        
        for (let i = 1; i <= lastDay.getDate(); i++) {
            const date = new Date(year, month, i);
            const dateKey = this.formatDate(date);
            const mealPlan = this.data.mealPlans[dateKey];
            const appointments = this.data.appointments.filter(apt => apt.date === dateKey);
            
            days.push({
                date: i,
                dateKey: dateKey,
                hasMealPlan: !!mealPlan,
                hasAppointment: appointments.length > 0,
                appointments: appointments
            });
        }
        
        return {
            year: year,
            month: month,
            firstDay: firstDay.getDay(),
            days: days
        };
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CalendarSystem;
}

