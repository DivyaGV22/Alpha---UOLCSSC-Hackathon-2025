// Onboarding System for Personalization

const ONBOARDING = {
    questions: [
        {
            id: 'age',
            question: 'What\'s your age? (This helps me tailor advice)',
            type: 'number',
            placeholder: 'Enter your age',
            required: true
        },
        {
            id: 'sex',
            question: 'Sex assigned at birth? (For nutrient needs)',
            type: 'select',
            options: ['Male', 'Female', 'Prefer not to say'],
            required: false
        },
        {
            id: 'goal',
            question: 'What\'s your main goal?',
            type: 'select',
            options: [
                'Weight loss',
                'Muscle gain',
                'Manage diabetes',
                'Improve energy',
                'General health',
                'Other'
            ],
            required: true
        },
        {
            id: 'dietary',
            question: 'Any dietary patterns or restrictions?',
            type: 'multiselect',
            options: [
                'None',
                'Vegan',
                'Vegetarian',
                'Halal',
                'Kosher',
                'Gluten-free',
                'Dairy-free',
                'Nut allergies',
                'Other allergies'
            ],
            required: false
        },
        {
            id: 'activity',
            question: 'Activity level?',
            type: 'select',
            options: [
                'Sedentary (little/no exercise)',
                'Moderate (exercise 1-3x/week)',
                'Active (exercise 4-5x/week)',
                'Very active (exercise 6-7x/week)'
            ],
            required: true
        },
        {
            id: 'medications',
            question: 'Are you taking any medications or have chronic conditions?',
            type: 'yesno',
            followUp: 'Please share details (this helps me provide safe advice)',
            required: true
        },
        {
            id: 'preference',
            question: 'How do you prefer tips?',
            type: 'multiselect',
            options: [
                'Short swaps',
                'Recipes',
                'Science notes',
                'Quick facts'
            ],
            required: false
        }
    ],
    
    currentStep: 0,
    answers: {},
    
    init: function() {
        this.currentStep = 0;
        this.answers = {};
    },
    
    getCurrentQuestion: function() {
        return this.questions[this.currentStep];
    },
    
    saveAnswer: function(questionId, answer) {
        this.answers[questionId] = answer;
    },
    
    next: function() {
        if (this.currentStep < this.questions.length - 1) {
            this.currentStep++;
            return true;
        }
        return false;
    },
    
    isComplete: function() {
        return this.currentStep >= this.questions.length;
    },
    
    getProfile: function() {
        return this.answers;
    },
    
    hasRedFlags: function() {
        const meds = this.answers.medications;
        const conditions = this.answers.medicationsDetails || '';
        return meds === 'Yes' || conditions.toLowerCase().includes('diabetes') || 
               conditions.toLowerCase().includes('pregnancy') || 
               conditions.toLowerCase().includes('heart') ||
               conditions.toLowerCase().includes('kidney') ||
               conditions.toLowerCase().includes('liver');
    }
};

