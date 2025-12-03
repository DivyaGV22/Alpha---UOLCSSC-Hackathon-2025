// Evidence Database for Nutrition Myths and Facts
// Curated evidence pack mapping common myths to reputable sources

const EVIDENCE_DB = {
    myths: {
        'carbs-are-bad': {
            myth: 'Carbs are always bad; avoid them',
            debunk: 'Not true — carbs are a key energy source. It\'s the type of carb and portion that matter. Whole grains, fruits, vegetables, and legumes provide fiber and nutrients; highly refined carbs (pastries, sugary drinks) are less healthy.',
            whyBelieve: 'Low-carb diet marketing and rapid early weight loss after cutting carbs (mostly water loss).',
            science: 'Major health authorities recommend including starchy foods (prefer wholegrain) as part of a balanced plate.',
            sources: [
                { name: 'NHS', url: 'https://www.nhs.uk/live-well/eat-well/food-types/starchy-foods-and-carbohydrates/', text: 'Starchy foods and carbohydrates' },
                { name: 'Mayo Clinic', url: 'https://www.mayoclinic.org/healthy-lifestyle/nutrition-and-healthy-eating/in-depth/carbohydrates/art-20045705', text: 'Carbohydrates: How carbs fit into a healthy diet' }
            ],
            swaps: [
                'White bread → Wholegrain bread',
                'Sugary cereal → Oats with fruit + nuts',
                'White rice → Brown rice + extra vegetables',
                'Fries → Oven-roasted sweet potato wedges'
            ]
        },
        'detox-teas': {
            myth: 'Detox teas/cleanses cleanse your liver and flush toxins',
            debunk: 'No — your body\'s liver and kidneys already remove waste. "Detox" products often work as laxatives/diuretics and can cause dehydration or interact with meds. They don\'t remove toxins in a proven way.',
            whyBelieve: 'Marketing claims about "cleansing" and temporary weight loss (mostly water weight).',
            science: 'The liver and kidneys continuously filter waste. No external "detox" product is needed or proven effective.',
            sources: [
                { name: 'NCCIH', url: 'https://www.nccih.nih.gov/health/detoxes-and-cleanses-what-you-need-to-know', text: 'Detoxes and Cleanses: What You Need to Know' }
            ],
            swaps: [
                'Detox tea → Herbal tea (chamomile, peppermint) for hydration',
                'Cleanse products → Balanced diet with adequate protein, fiber, water, and sleep',
                'Laxative teas → Whole foods rich in fiber (fruits, vegetables, whole grains)'
            ],
            safetyNote: 'If you\'re taking medications, consult your healthcare provider before using any detox products.'
        },
        'fat-makes-fat': {
            myth: 'Eating fat makes you fat',
            debunk: 'Not true. Dietary fat is essential for health. Healthy fats (avocado, nuts, olive oil) support brain function, hormone production, and nutrient absorption. Weight gain comes from excess calories overall, not specifically from fat.',
            whyBelieve: 'The word "fat" creates confusion between dietary fat and body fat.',
            science: 'Research shows that moderate intake of healthy fats is part of a balanced diet. The type of fat matters more than the amount.',
            sources: [
                { name: 'NHS', url: 'https://www.nhs.uk/live-well/eat-well/food-types/different-fats-nutrition/', text: 'Different fats and nutrition' },
                { name: 'Mayo Clinic', url: 'https://www.mayoclinic.org/healthy-lifestyle/nutrition-and-healthy-eating/in-depth/fat/art-20045550', text: 'Dietary fats: Know which types to choose' }
            ],
            swaps: [
                'Butter → Olive oil or avocado',
                'Fried foods → Baked or grilled options',
                'Processed snacks → Nuts or seeds',
                'Full-fat dairy (if avoiding) → Moderate portions of full-fat or low-fat options based on preference'
            ]
        },
        'gluten-free-healthier': {
            myth: 'Gluten-free foods are always healthier',
            debunk: 'Only true if you have celiac disease or gluten sensitivity. For others, gluten-free products are often more processed, lower in fiber, and may have added sugars. Whole grains with gluten (like whole wheat) provide important nutrients.',
            whyBelieve: 'Marketing positioning gluten-free as "healthier" and association with weight loss diets.',
            science: 'Unless medically necessary, there\'s no evidence that avoiding gluten improves health for the general population.',
            sources: [
                { name: 'Mayo Clinic', url: 'https://www.mayoclinic.org/healthy-lifestyle/nutrition-and-healthy-eating/in-depth/gluten-free-diet/art-20048530', text: 'Gluten-free diet' },
                { name: 'NHS', url: 'https://www.nhs.uk/conditions/coeliac-disease/', text: 'Coeliac disease' }
            ],
            swaps: [
                'Gluten-free bread (if not needed) → Whole grain bread',
                'Gluten-free pasta → Whole wheat pasta',
                'Processed gluten-free snacks → Whole food snacks (fruits, vegetables, nuts)'
            ]
        },
        'breakfast-most-important': {
            myth: 'Breakfast is the most important meal of the day',
            debunk: 'Not necessarily. While breakfast can help some people maintain energy and avoid overeating later, it\'s not essential for everyone. What matters most is overall daily nutrition quality and eating patterns that work for your lifestyle.',
            whyBelieve: 'Traditional nutrition advice and breakfast cereal marketing.',
            science: 'Research is mixed. Some people benefit from breakfast, others do well with intermittent fasting. Individual needs vary.',
            sources: [
                { name: 'Mayo Clinic', url: 'https://www.mayoclinic.org/healthy-lifestyle/nutrition-and-healthy-eating/expert-answers/food-and-nutrition/faq-20058449', text: 'Is breakfast the most important meal?' }
            ],
            swaps: [
                'Skipping breakfast if hungry → Balanced breakfast with protein + fiber',
                'Large breakfast if not hungry → Smaller breakfast or wait until lunch',
                'Sugary breakfast → Protein-rich breakfast (eggs, Greek yogurt, whole grains)'
            ]
        }
    },
    
    // Quick reference for common nutrition facts
    facts: {
        'whole-grains': {
            fact: 'Whole grains provide fiber, B vitamins, and minerals',
            sources: [
                { name: 'NHS', url: 'https://www.nhs.uk/live-well/eat-well/food-types/starchy-foods-and-carbohydrates/', text: 'Starchy foods and carbohydrates' }
            ]
        },
        'protein-needs': {
            fact: 'Most adults need 0.8g protein per kg body weight daily',
            sources: [
                { name: 'WHO', url: 'https://www.who.int/news-room/fact-sheets/detail/healthy-diet', text: 'Healthy diet' }
            ]
        },
        'fiber-intake': {
            fact: 'Adults should aim for 30g of fiber per day',
            sources: [
                { name: 'NHS', url: 'https://www.nhs.uk/live-well/eat-well/how-to-get-more-fibre-in-your-diet/', text: 'How to get more fibre in your diet' }
            ]
        }
    },
    
    // Red flag keywords for safety escalation
    redFlags: {
        medical: ['pregnancy', 'pregnant', 'diabetes', 'diabetic', 'insulin', 'heart disease', 'kidney disease', 'liver disease', 'cancer', 'cancer treatment'],
        medications: ['medication', 'medications', 'prescription', 'anticoagulant', 'blood thinner', 'warfarin', 'metformin', 'insulin'],
        conditions: ['chronic', 'disease', 'disorder', 'syndrome', 'allergy', 'anaphylaxis']
    },
    
    // Get myth by keyword
    findMyth: function(query) {
        const lowerQuery = query.toLowerCase();
        for (const [key, mythData] of Object.entries(this.myths)) {
            if (lowerQuery.includes(key.replace('-', ' ')) || 
                mythData.myth.toLowerCase().includes(lowerQuery) ||
                lowerQuery.includes('carb') && key === 'carbs-are-bad' ||
                lowerQuery.includes('detox') && key === 'detox-teas' ||
                lowerQuery.includes('gluten') && key === 'gluten-free-healthier' ||
                lowerQuery.includes('breakfast') && key === 'breakfast-most-important' ||
                lowerQuery.includes('fat') && lowerQuery.includes('make') && key === 'fat-makes-fat') {
                return { key, ...mythData };
            }
        }
        return null;
    },
    
    // Check for red flags in user message
    checkRedFlags: function(message) {
        const lowerMessage = message.toLowerCase();
        const flags = [];
        
        for (const category in this.redFlags) {
            for (const flag of this.redFlags[category]) {
                if (lowerMessage.includes(flag.toLowerCase())) {
                    flags.push({ category, flag });
                }
            }
        }
        
        return flags;
    }
};

