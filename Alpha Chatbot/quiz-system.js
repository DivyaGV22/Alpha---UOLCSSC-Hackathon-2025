// Interactive Quiz System for Nutrition Education
// Gamified quizzes with points and achievements

class QuizSystem {
    constructor(gamification) {
        this.gamification = gamification;
        this.quizzes = this.initializeQuizzes();
    }

    initializeQuizzes() {
        return [
            {
                id: 'carbs_quiz',
                title: 'Carbohydrates Quiz',
                description: 'Test your knowledge about carbs!',
                questions: [
                    {
                        question: 'Are all carbs bad for you?',
                        options: ['Yes, avoid all carbs', 'No, quality matters', 'Only complex carbs are bad', 'Carbs are always healthy'],
                        correct: 1,
                        explanation: 'Not all carbs are bad! Whole grains, fruits, and vegetables provide essential nutrients and fiber.'
                    },
                    {
                        question: 'Which is a better carb choice?',
                        options: ['White bread', 'Whole grain bread', 'They are the same', 'Neither'],
                        correct: 1,
                        explanation: 'Whole grain bread contains more fiber and nutrients than refined white bread.'
                    },
                    {
                        question: 'How much of your plate should be carbs?',
                        options: ['None', '1/4', '1/2', 'All of it'],
                        correct: 1,
                        explanation: 'A balanced plate includes about 1/4 whole grains, 1/4 protein, and 1/2 vegetables/fruits.'
                    }
                ],
                reward: { xp: 30, points: 15 },
                unlocked: true
            },
            {
                id: 'protein_quiz',
                title: 'Protein Power Quiz',
                description: 'Learn about protein needs!',
                questions: [
                    {
                        question: 'How much protein do most adults need per day?',
                        options: ['0.5g per kg', '0.8g per kg', '2g per kg', '5g per kg'],
                        correct: 1,
                        explanation: 'Most adults need about 0.8g of protein per kg of body weight daily.'
                    },
                    {
                        question: 'Which is a complete protein?',
                        options: ['Rice', 'Beans', 'Chicken', 'Bread'],
                        correct: 2,
                        explanation: 'Animal proteins like chicken contain all essential amino acids, making them complete proteins.'
                    },
                    {
                        question: 'Can you get enough protein on a plant-based diet?',
                        options: ['No, impossible', 'Yes, with proper planning', 'Only with supplements', 'Only from soy'],
                        correct: 1,
                        explanation: 'Yes! Plant-based diets can provide adequate protein through beans, lentils, nuts, and whole grains.'
                    }
                ],
                reward: { xp: 30, points: 15 },
                unlocked: true
            },
            {
                id: 'myths_quiz',
                title: 'Myth Buster Quiz',
                description: 'Debunk common nutrition myths!',
                questions: [
                    {
                        question: 'Do detox teas actually cleanse your body?',
                        options: ['Yes, they remove toxins', 'No, your liver and kidneys do this', 'Only if used daily', 'They work for some people'],
                        correct: 1,
                        explanation: 'Your liver and kidneys already remove waste. Detox products often act as laxatives and can be harmful.'
                    },
                    {
                        question: 'Is breakfast the most important meal?',
                        options: ['Yes, always', 'No, it depends on the person', 'Only for children', 'Only if you exercise'],
                        correct: 1,
                        explanation: 'Research is mixed. Some people benefit from breakfast, others do well with intermittent fasting.'
                    },
                    {
                        question: 'Are gluten-free foods always healthier?',
                        options: ['Yes, always', 'Only if you have celiac disease', 'They are the same', 'They are always worse'],
                        correct: 1,
                        explanation: 'Gluten-free is only necessary for celiac disease. For others, whole grains with gluten provide important nutrients.'
                    }
                ],
                reward: { xp: 40, points: 20 },
                unlocked: true
            }
        ];
    }

    getQuiz(quizId) {
        return this.quizzes.find(q => q.id === quizId);
    }

    getAvailableQuizzes() {
        return this.quizzes.filter(q => q.unlocked);
    }

    startQuiz(quizId) {
        const quiz = this.getQuiz(quizId);
        if (!quiz) return null;
        
        return {
            id: quiz.id,
            title: quiz.title,
            description: quiz.description,
            questions: quiz.questions.map((q, index) => ({
                index,
                question: q.question,
                options: q.options,
                totalQuestions: quiz.questions.length
            })),
            currentQuestion: 0,
            answers: [],
            started: true
        };
    }

    submitAnswer(quizSession, questionIndex, answerIndex) {
        const quiz = this.getQuiz(quizSession.id);
        if (!quiz) return null;

        const question = quiz.questions[questionIndex];
        const isCorrect = answerIndex === question.correct;
        
        quizSession.answers.push({
            questionIndex,
            answerIndex,
            correct: isCorrect
        });

        return {
            correct: isCorrect,
            explanation: question.explanation,
            correctAnswer: question.correct
        };
    }

    completeQuiz(quizSession) {
        const quiz = this.getQuiz(quizSession.id);
        if (!quiz) return null;

        const totalQuestions = quiz.questions.length;
        const correctAnswers = quizSession.answers.filter(a => a.correct).length;
        const score = (correctAnswers / totalQuestions) * 100;
        const passed = score >= 70; // 70% to pass

        let xpEarned = 0;
        let pointsEarned = 0;

        if (passed) {
            // Base reward
            xpEarned = quiz.reward.xp;
            pointsEarned = quiz.reward.points;
            
            // Bonus for perfect score
            if (score === 100) {
                xpEarned += 20;
                pointsEarned += 10;
            }
            
            this.gamification.addXP(xpEarned, `Quiz: ${quiz.title}`);
            this.gamification.addPoints(pointsEarned, `Quiz: ${quiz.title}`);
        }

        return {
            score,
            correctAnswers,
            totalQuestions,
            passed,
            xpEarned,
            pointsEarned,
            quiz: quiz.title
        };
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = QuizSystem;
}

