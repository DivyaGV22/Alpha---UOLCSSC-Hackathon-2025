# Alpha - Evidence-Based Nutrition Chatbot

A production-ready, evidence-based nutrition chatbot that helps users cut through diet misinformation and make informed food choices. Built following a comprehensive design plan with personalized advice, myth debunking and safety features.

## 🎯 Core Features

### 1. **Evidence-Based Guidance**
- Scientifically-validated nutrition information
- Citations from reputable sources (NHS, WHO, Mayo Clinic, NCCIH)
- Science-first approach over viral trends

### 2. **Myth Debunker Module**
- Automatically detects and debunks common diet myths
- Structured responses with:
  - Clear myth statement
  - Why people believe it
  - Scientific evidence
  - Evidence-based truth
  - Practical swaps

### 3. **Personalized Responses**
- Onboarding flow (6 questions) to create user profile
- Tailored advice based on:
  - Age, goals, activity level
  - Dietary restrictions and preferences
  - Health conditions and medications
- Practical tips and healthy swaps specific to user needs

### 4. **Safety Filter & Escalation**
- Automatic detection of red flags (medications, pregnancy, chronic conditions)
- Safety banners and warnings
- Always recommends consulting healthcare providers when needed
- Clear disclaimers: "Educational only. For medical conditions, consult your clinician."

### 5. **Enhanced Features**
- **Onboarding System**: Personalized setup flow
- **Evidence Database**: Curated myths with citations
- **Citation Display**: Links to reputable sources
- **User Profile Storage**: Saves preferences locally
- **Interactive UI**: Modern, responsive design with smooth animations

## 🚀 Setup Instructions

### 1. Get Your OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in to your account
3. Navigate to [API Keys](https://platform.openai.com/api-keys)
4. Click "Create new secret key"
5. Copy your API key (you'll only see it once!)

### 2. Run the Chatbot

1. Open `index.html` in your web browser
2. Enter your OpenAI API key in the input field at the top
3. Click "Save Key" (the key is stored locally in your browser)
4. Complete the onboarding (6 quick questions)
5. Start chatting!

## 📋 How to Use

### First Time Setup
1. **Enter API Key**: Required for the chatbot to function
2. **Complete Onboarding**: Answer 6 questions to personalize your experience:
   - Age
   - Sex (for nutrient needs)
   - Main goal (weight loss, muscle gain, general health, etc.)
   - Dietary patterns/restrictions
   - Activity level
   - Medications/conditions (for safety)
   - Preference for tips format

### Using the Chatbot

**Ask about myths:**
- "Are carbs always bad?"
- "Do detox teas work?"
- "Is gluten-free healthier?"

**Get personalized advice:**
- "What are healthy swaps for my diet?"
- "I want to lose weight, what should I eat?"
- "Give me breakfast ideas for my activity level"

**Check products:**
- Paste ingredient lists or product names
- Get safety warnings and evidence-based alternatives

## 📁 File Structure

```
Alpha Chatbot/
├── index.html          # Main HTML structure
├── styles.css          # Styling and UI design
├── chatbot.js          # Enhanced chatbot logic with Alpha persona
├── config.js           # API key configuration and storage
├── evidence-db.js      # Evidence database with myths and citations
├── onboarding.js       # Onboarding system for personalization
└── README.md           # This file
```

## 🔒 Security & Privacy

- **API Key Storage**: Stored locally in browser's localStorage
- **User Profile**: Saved locally, never sent to servers
- **Data Privacy**: Minimal PII collected, users can clear data anytime
- **No Medical Advice**: Educational only, always recommends consulting healthcare providers

## 🎨 Features in Detail

### Myth Debunking Examples

**Myth: "Carbs are always bad"**
- Debunked with scientific evidence
- Explains why people believe it
- Provides practical swaps (white bread → whole grain)
- Links to NHS and Mayo Clinic sources

**Myth: "Detox teas cleanse your body"**
- Explains liver/kidney function
- Warns about laxative effects
- Provides evidence-based alternatives
- Safety notes for medications

### Personalization Engine

- Uses user profile to tailor all responses
- References goals, restrictions, and activity level
- Suggests swaps relevant to dietary preferences
- Adjusts advice based on health conditions

### Safety Features

- **Red Flag Detection**: Automatically detects mentions of:
  - Medications
  - Pregnancy
  - Chronic conditions (diabetes, heart disease, etc.)
- **Escalation**: Shows safety banners and recommends healthcare consultation
- **Disclaimers**: Clear educational-only messaging

## 🌐 Browser Compatibility

Works on all modern browsers:
- Chrome/Edge (recommended)
- Firefox
- Safari
- Opera

## 🔧 Customization

### Adding New Myths

Edit `evidence-db.js` to add new myths:
```javascript
'new-myth-key': {
    myth: 'The myth statement',
    debunk: 'The truth',
    whyBelieve: 'Why people believe it',
    science: 'Scientific evidence',
    sources: [{ name: 'Source', url: 'url', text: 'Description' }],
    swaps: ['Swap 1', 'Swap 2']
}
```

### Modifying Onboarding

Edit `onboarding.js` to change questions or add new ones.

### Adjusting Persona

Edit the `systemPrompt` in `chatbot.js` to modify Alpha's tone and behaviour.

## 🐛 Troubleshooting

**"API error" messages:**
- Verify your API key is correct
- Check that you have credits/usage available on your OpenAI account
- Ensure you have an active internet connection

**Chat not working:**
- Make sure you've entered and saved your API key
- Check the browser console for error messages (F12)
- Try refreshing the page
- Clear localStorage if onboarding is stuck

**Onboarding issues:**
- Clear browser localStorage: `localStorage.clear()`
- Refresh the page to restart onboarding

## 📚 Evidence Sources

The chatbot references:
- **NHS** (National Health Service, UK)
- **WHO** (World Health Organization)
- **Mayo Clinic**
- **NCCIH** (National Center for Complementary and Integrative Health)
- **British Dietetic Association**
- Peer-reviewed research

## ⚠️ Important Disclaimers

- **Educational Only**: This chatbot provides educational information, not medical advice
- **Not a Medical Device**: Does not diagnose, treat, or prevent any disease
- **Consult Healthcare Providers**: Always consult qualified healthcare professionals for:
  - Medical conditions
  - Medication changes
  - Pregnancy
  - Chronic diseases
  - Dietary restrictions for health reasons

## 📝 License

This project is open source and available for personal and educational use.

## 🙏 Acknowledgments

Built following a comprehensive design plan for evidence-based nutrition guidance. All evidence and citations are from reputable health authorities and peer-reviewed sources.


