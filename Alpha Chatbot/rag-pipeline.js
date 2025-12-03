// RAG (Retrieval-Augmented Generation) Pipeline
// Uses vector embeddings for semantic search and retrieval

class RAGPipeline {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.knowledgeBase = [];
        this.embeddings = new Map(); // Cache for embeddings
    }

    // Initialize knowledge base from evidence database
    async initializeKnowledgeBase(evidenceDB) {
        this.knowledgeBase = [];

        // Add myths and their debunks
        for (const [key, myth] of Object.entries(evidenceDB.myths)) {
            const knowledgeItem = {
                id: `myth-${key}`,
                type: 'myth',
                content: `Myth: ${myth.myth}\n\nDebunk: ${myth.debunk}\n\nScience: ${myth.science}\n\nSwaps: ${myth.swaps.join(', ')}`,
                metadata: {
                    myth: myth.myth,
                    debunk: myth.debunk,
                    science: myth.science,
                    swaps: myth.swaps,
                    sources: myth.sources
                },
                keywords: this.extractKeywordsFromMyth(myth)
            };
            this.knowledgeBase.push(knowledgeItem);
        }

        // Add general nutrition facts
        const nutritionFacts = [
            {
                id: 'fact-whole-grains',
                type: 'fact',
                content: 'Whole grains provide fiber, B vitamins, and minerals. They are recommended as part of a healthy diet.',
                metadata: { topic: 'whole grains', nutrients: ['fiber', 'B vitamins', 'minerals'] }
            },
            {
                id: 'fact-protein-needs',
                type: 'fact',
                content: 'Most adults need approximately 0.8g of protein per kg of body weight daily. Active individuals may need more.',
                metadata: { topic: 'protein', dailyNeed: '0.8g per kg body weight' }
            },
            {
                id: 'fact-fiber-intake',
                type: 'fact',
                content: 'Adults should aim for 30g of fiber per day. Good sources include fruits, vegetables, whole grains, and legumes.',
                metadata: { topic: 'fiber', dailyNeed: '30g', sources: ['fruits', 'vegetables', 'whole grains', 'legumes'] }
            },
            {
                id: 'fact-hydration',
                type: 'fact',
                content: 'Adequate hydration is essential for health. Most adults need about 2-3 liters of water daily, depending on activity level and climate.',
                metadata: { topic: 'hydration', dailyNeed: '2-3 liters' }
            },
            {
                id: 'fact-balanced-plate',
                type: 'fact',
                content: 'A balanced plate includes: 1/2 vegetables and fruits, 1/4 whole grains, 1/4 lean protein, plus healthy fats in moderation.',
                metadata: { topic: 'balanced diet', plateComposition: 'vegetables, grains, protein, fats' }
            }
        ];

        this.knowledgeBase.push(...nutritionFacts);

        // Generate embeddings for all knowledge items
        await this.generateEmbeddings();
    }

    // Extract keywords from myth for better matching
    extractKeywordsFromMyth(myth) {
        const nlp = new NLPUtils();
        const text = `${myth.myth} ${myth.debunk} ${myth.science}`;
        return nlp.extractKeywords(text, 10);
    }

    // Generate embeddings using OpenAI API
    async generateEmbedding(text) {
        // Check cache first
        if (this.embeddings.has(text)) {
            return this.embeddings.get(text);
        }

        try {
            const response = await fetch('https://api.openai.com/v1/embeddings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: 'text-embedding-3-small',
                    input: text
                })
            });

            if (!response.ok) {
                throw new Error(`Embedding API error: ${response.status}`);
            }

            const data = await response.json();
            const embedding = data.data[0].embedding;
            
            // Cache the embedding
            this.embeddings.set(text, embedding);
            
            return embedding;
        } catch (error) {
            console.error('Error generating embedding:', error);
            // Return zero vector as fallback
            return new Array(1536).fill(0);
        }
    }

    // Generate embeddings for all knowledge base items
    async generateEmbeddings() {
        console.log('Generating embeddings for knowledge base...');
        for (const item of this.knowledgeBase) {
            if (!item.embedding) {
                item.embedding = await this.generateEmbedding(item.content);
            }
        }
        console.log('Embeddings generated successfully');
    }

    // Calculate cosine similarity between two vectors
    cosineSimilarity(vecA, vecB) {
        if (vecA.length !== vecB.length) return 0;

        let dotProduct = 0;
        let normA = 0;
        let normB = 0;

        for (let i = 0; i < vecA.length; i++) {
            dotProduct += vecA[i] * vecB[i];
            normA += vecA[i] * vecA[i];
            normB += vecB[i] * vecB[i];
        }

        const denominator = Math.sqrt(normA) * Math.sqrt(normB);
        return denominator === 0 ? 0 : dotProduct / denominator;
    }

    // Retrieve relevant knowledge based on query
    async retrieve(query, topK = 3) {
        // Generate embedding for query
        const queryEmbedding = await this.generateEmbedding(query);

        // Calculate similarity scores
        const scores = this.knowledgeBase.map(item => ({
            item,
            score: this.cosineSimilarity(queryEmbedding, item.embedding || [])
        }));

        // Sort by score and return top K
        scores.sort((a, b) => b.score - a.score);
        
        return scores
            .slice(0, topK)
            .filter(result => result.score > 0.3) // Threshold for relevance
            .map(result => result.item);
    }

    // Hybrid search: combines semantic (embedding) and keyword matching
    async hybridRetrieve(query, topK = 3) {
        const nlp = new NLPUtils();
        const queryKeywords = nlp.extractKeywords(query);
        
        // Semantic retrieval
        const semanticResults = await this.retrieve(query, topK * 2);
        
        // Keyword-based scoring
        const keywordScores = this.knowledgeBase.map(item => {
            let score = 0;
            const itemKeywords = item.keywords || [];
            
            queryKeywords.forEach(keyword => {
                if (itemKeywords.includes(keyword)) {
                    score += 2;
                }
                // Also check if keyword appears in content
                if (item.content.toLowerCase().includes(keyword.toLowerCase())) {
                    score += 1;
                }
            });
            
            return { item, score };
        });

        keywordScores.sort((a, b) => b.score - a.score);
        const keywordResults = keywordScores
            .slice(0, topK)
            .filter(result => result.score > 0)
            .map(result => result.item);

        // Combine and deduplicate results
        const combined = [...semanticResults, ...keywordResults];
        const unique = [];
        const seen = new Set();
        
        for (const item of combined) {
            if (!seen.has(item.id)) {
                seen.add(item.id);
                unique.push(item);
                if (unique.length >= topK) break;
            }
        }

        return unique;
    }

    // Add PDF content to knowledge base with progress callback
    async addPDFContent(pdfData, progressCallback = null) {
        const { text, fileName, pageCount, chunks } = pdfData;
        
        // If chunks are provided, add each chunk as a separate knowledge item
        if (chunks && chunks.length > 0) {
            const knowledgeItems = [];
            
            // First, create all knowledge items without embeddings
            for (let i = 0; i < chunks.length; i++) {
                const chunk = chunks[i];
                const knowledgeItem = {
                    id: `pdf-${fileName}-chunk-${i}`,
                    type: 'pdf',
                    content: chunk,
                    metadata: {
                        fileName: fileName,
                        pageCount: pageCount,
                        chunkIndex: i,
                        totalChunks: chunks.length,
                        source: 'uploaded-pdf'
                    },
                    keywords: this.extractKeywordsFromText(chunk)
                };
                knowledgeItems.push(knowledgeItem);
            }
            
            // Batch generate embeddings (process in batches of 10 to avoid rate limits)
            const batchSize = 10;
            for (let i = 0; i < knowledgeItems.length; i += batchSize) {
                const batch = knowledgeItems.slice(i, i + batchSize);
                
                // Generate embeddings in parallel for this batch
                const embeddingPromises = batch.map(item => this.generateEmbedding(item.content));
                const embeddings = await Promise.all(embeddingPromises);
                
                // Assign embeddings
                batch.forEach((item, idx) => {
                    item.embedding = embeddings[idx];
                    this.knowledgeBase.push(item);
                });
                
                // Update progress
                if (progressCallback) {
                    progressCallback(i + batch.length, knowledgeItems.length);
                }
            }
        } else {
            // Add as single item if no chunks
            const knowledgeItem = {
                id: `pdf-${fileName}`,
                type: 'pdf',
                content: text,
                metadata: {
                    fileName: fileName,
                    pageCount: pageCount,
                    source: 'uploaded-pdf'
                },
                keywords: this.extractKeywordsFromText(text)
            };
            
            // Generate embedding
            if (progressCallback) progressCallback(0, 1);
            knowledgeItem.embedding = await this.generateEmbedding(text);
            if (progressCallback) progressCallback(1, 1);
            
            this.knowledgeBase.push(knowledgeItem);
        }
        
        console.log(`Added PDF "${fileName}" to knowledge base with ${chunks ? chunks.length : 1} item(s)`);
    }

    // Extract keywords from text (helper method)
    extractKeywordsFromText(text) {
        const nlp = new NLPUtils();
        return nlp.extractKeywords(text, 15);
    }

    // Remove PDF from knowledge base
    removePDFContent(fileName) {
        const initialLength = this.knowledgeBase.length;
        this.knowledgeBase = this.knowledgeBase.filter(item => {
            return !(item.type === 'pdf' && item.metadata && item.metadata.fileName === fileName);
        });
        
        const removedCount = initialLength - this.knowledgeBase.length;
        console.log(`Removed PDF "${fileName}" from knowledge base (${removedCount} items)`);
        return removedCount;
    }

    // Get list of uploaded PDFs
    getUploadedPDFs() {
        const pdfs = new Set();
        this.knowledgeBase.forEach(item => {
            if (item.type === 'pdf' && item.metadata && item.metadata.fileName) {
                pdfs.add(item.metadata.fileName);
            }
        });
        return Array.from(pdfs);
    }

    // Format retrieved knowledge for context
    formatContext(retrievedItems) {
        if (retrievedItems.length === 0) return '';

        let context = 'Relevant knowledge from evidence base:\n\n';
        
        retrievedItems.forEach((item, index) => {
            const sourceInfo = item.type === 'pdf' 
                ? `[PDF: ${item.metadata.fileName}${item.metadata.chunkIndex !== undefined ? `, Chunk ${item.metadata.chunkIndex + 1}/${item.metadata.totalChunks}` : ''}]`
                : `[${item.type.toUpperCase()}]`;
            
            context += `${index + 1}. ${sourceInfo} ${item.content}\n`;
            if (item.metadata && item.metadata.sources) {
                context += `Sources: ${item.metadata.sources.map(s => s.name).join(', ')}\n`;
            }
            context += '\n';
        });

        return context;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RAGPipeline;
}

