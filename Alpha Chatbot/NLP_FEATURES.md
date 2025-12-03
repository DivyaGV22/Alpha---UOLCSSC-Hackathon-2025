# NLP & ML Features Documentation

## Overview

The Alpha Nutrition Chatbot has been enhanced with advanced Natural Language Processing (NLP), Machine Learning (ML), and Retrieval-Augmented Generation (RAG) capabilities.

## Implemented Features

### 1. Natural Language Processing (NLP)

**File: `nlp-utils.js`**

- **Text Preprocessing**: Lowercasing, punctuation removal, whitespace normalization
- **Tokenization**: Splitting text into words
- **Lemmatization**: Converting words to base forms (e.g., "eating" → "eat")
- **Stop Word Removal**: Filtering common words that don't add meaning
- **Keyword Extraction**: Identifying important nutrition-related keywords
- **Text Similarity**: Jaccard similarity for finding similar content
- **Sentence Splitting**: Breaking text into sentences
- **N-gram Extraction**: Extracting phrases for better context understanding

### 2. Lemmatization

Custom lemmatization dictionary covering:
- Verb forms (eating → eat, loses → lose)
- Plural nouns (carbs → carb, calories → calorie)
- Comparative adjectives (healthier → healthy)

### 3. Regex Patterns

**Intent Detection Patterns:**
- Myth questions: `/(?:is|are|does|do|can|will)\s+(?:it|this|that|they)\s+(?:true|false|bad|good|healthy)/i`
- Detox questions: `/(?:detox|cleanse|flush|remove)\s+(?:toxins?|waste)/i`
- Swap requests: `/(?:swap|replace|alternative|instead|substitute)/i`
- Recipe requests: `/(?:recipe|how to cook|how to make|meal idea)/i`
- And more...

### 4. JSON Data Structures

- Evidence database stored as JSON
- User profiles in JSON format
- Knowledge base items with structured metadata
- Intent classification results as JSON objects

### 5. Text Splitting

- Sentence splitting using regex: `/[.!?]+\s+/`
- Token splitting: `/\s+/`
- N-gram generation for phrase extraction

### 6. Sentiment Analysis

**File: `sentiment-analysis.js`**

- **Positive/Negative Word Detection**: Analyzes sentiment using word lists
- **Negation Handling**: Detects negations (not, never, etc.) that flip sentiment
- **Intensifier Detection**: Recognizes words that amplify sentiment
- **Confidence Scoring**: Provides confidence levels for sentiment predictions
- **Empathetic Response Generation**: Suggests appropriate responses based on sentiment

**Example:**
```javascript
const sentiment = sentimentAnalyzer.analyze("I'm frustrated with my diet");
// Returns: { sentiment: 'negative', score: -0.67, confidence: 0.67 }
```

### 7. Named Entity Recognition (NER)

**Extracted Entities:**
- **Foods**: rice, bread, chicken, fruits, vegetables, etc.
- **Nutrients**: carbs, protein, fat, vitamins, minerals
- **Quantities**: "30g protein", "200 calories"
- **Time References**: breakfast, lunch, dinner, daily
- **Health Conditions**: diabetes, pregnancy, heart disease

**Example:**
```javascript
const entities = nlp.extractEntities("I eat 100g of chicken for dinner");
// Returns: {
//   foods: ['chicken'],
//   nutrients: [],
//   quantities: ['100g'],
//   timeReferences: ['dinner'],
//   healthConditions: []
// }
```

### 8. Keyword Extraction

- Extracts top 10 most relevant keywords
- Boosts nutrition-related keywords
- Removes stop words
- Uses lemmatization for better matching

### 9. Machine Learning - Intent Classification

**File: `ml-intent-classifier.js`**

**Intent Categories:**
- `mythDebunk`: Questions about nutrition myths
- `swapRequest`: Requests for food alternatives
- `recipeRequest`: Asking for recipes or meal ideas
- `adviceRequest`: General nutrition advice
- `productCheck`: Checking product safety/ingredients
- `healthQuery`: Health-related questions
- `general`: Default fallback

**ML Approach:**
- Pattern matching with regex
- Keyword scoring
- Example similarity (Jaccard similarity)
- Confidence scoring
- Multi-intent detection

**Example:**
```javascript
const intent = intentClassifier.classify("are carbs bad for you?");
// Returns: {
//   intent: 'mythDebunk',
//   confidence: 0.85,
//   scores: { mythDebunk: 8.5, general: 2.1 }
// }
```

### 10. RAG (Retrieval-Augmented Generation) Pipeline

**File: `rag-pipeline.js`**

**Components:**
1. **Knowledge Base**: Structured nutrition facts and myth debunks
2. **Vector Embeddings**: Using OpenAI's `text-embedding-3-small` model
3. **Semantic Search**: Cosine similarity for finding relevant content
4. **Hybrid Retrieval**: Combines semantic and keyword-based search
5. **Context Formatting**: Formats retrieved knowledge for LLM context

**RAG Process:**
1. User query → Generate embedding
2. Compare with knowledge base embeddings
3. Retrieve top-K most similar items
4. Format as context for LLM
5. LLM generates response with evidence

**Benefits:**
- More accurate, evidence-based responses
- Reduced hallucinations
- Better myth debunking
- Citations from knowledge base

## Integration Flow

```
User Message
    ↓
1. NLP Preprocessing (tokenization, lemmatization)
    ↓
2. Intent Classification (ML)
    ↓
3. Sentiment Analysis
    ↓
4. Named Entity Recognition
    ↓
5. RAG Retrieval (vector search)
    ↓
6. Enhanced LLM Prompt (with all NLP context)
    ↓
7. Response Generation
```

## Usage Examples

### Example 1: Myth Debunking with NLP
```javascript
User: "Are carbs always bad?"

NLP Analysis:
- Intent: mythDebunk (confidence: 0.92)
- Entities: { nutrients: ['carbs'] }
- Keywords: ['carb', 'bad']
- RAG Retrieval: Finds "carbs-are-bad" myth
- Response: Structured debunk with evidence
```

### Example 2: Sentiment-Aware Response
```javascript
User: "I'm really struggling with my diet"

Sentiment: negative (score: -0.75, confidence: 0.75)
Response starts with: "I understand this can be challenging..."
```

### Example 3: Entity-Based Personalization
```javascript
User: "I eat 200g chicken and rice for dinner"

Entities: {
  foods: ['chicken', 'rice'],
  quantities: ['200g'],
  timeReferences: ['dinner']
}

Response: Provides specific advice about chicken and rice portions
```

## Performance Optimizations

1. **Embedding Caching**: Embeddings are cached to avoid redundant API calls
2. **Keyword Pre-filtering**: Fast keyword matching before expensive semantic search
3. **Intent Pre-classification**: Quick intent detection guides processing
4. **Batch Processing**: Knowledge base embeddings generated once at startup

## Future Enhancements

1. **Advanced ML Models**: Fine-tuned models for nutrition domain
2. **Multi-language Support**: Extend NLP to other languages
3. **Conversation Memory**: Long-term memory using embeddings
4. **Active Learning**: Improve from user feedback
5. **Real-time Learning**: Update knowledge base from new evidence

## Technical Stack

- **NLP**: Custom implementation with regex and pattern matching
- **Embeddings**: OpenAI `text-embedding-3-small` (1536 dimensions)
- **Similarity**: Cosine similarity for vector comparison
- **ML**: Rule-based + pattern matching (expandable to neural models)
- **Storage**: In-memory with localStorage for persistence

## API Usage

All NLP features are integrated into the main chatbot. No separate API calls needed - everything works automatically when you send a message!

