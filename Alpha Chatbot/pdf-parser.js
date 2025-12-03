// PDF Parser for RAG Chatbot
// Extracts text from PDF files using pdf.js

class PDFParser {
    constructor() {
        this.pdfjsLib = null;
        this.initialized = false;
    }

    // Initialize PDF.js library
    async initialize() {
        if (this.initialized) return;

        // Check if PDF.js is already loaded (pre-loaded in HTML)
        if (typeof window.pdfjsLib !== 'undefined') {
            this.pdfjsLib = window.pdfjsLib;
            if (!this.pdfjsLib.GlobalWorkerOptions.workerSrc) {
                this.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
            }
            this.initialized = true;
            return;
        }
        
        // Also check for pdfjsLib directly (without window prefix)
        if (typeof pdfjsLib !== 'undefined') {
            this.pdfjsLib = pdfjsLib;
            if (!this.pdfjsLib.GlobalWorkerOptions.workerSrc) {
                this.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
            }
            this.initialized = true;
            return;
        }

        // Load PDF.js from CDN
        return new Promise((resolve, reject) => {
            // Check if script is already being loaded
            const existingScript = document.querySelector('script[src*="pdf.min.js"]');
            if (existingScript) {
                existingScript.addEventListener('load', () => {
                    if (typeof window.pdfjsLib !== 'undefined') {
                        this.pdfjsLib = window.pdfjsLib;
                        this.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
                        this.initialized = true;
                        resolve();
                    } else {
                        reject(new Error('PDF.js failed to load'));
                    }
                });
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
            script.crossOrigin = 'anonymous';
            
            script.onload = () => {
                if (typeof window.pdfjsLib !== 'undefined') {
                    this.pdfjsLib = window.pdfjsLib;
                    this.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
                    this.initialized = true;
                    resolve();
                } else {
                    reject(new Error('PDF.js failed to load'));
                }
            };
            script.onerror = () => reject(new Error('Failed to load PDF.js library'));
            document.head.appendChild(script);
        });
    }

    // Extract text from PDF file
    async extractText(file) {
        if (!this.initialized) {
            await this.initialize();
        }

        try {
            const arrayBuffer = await file.arrayBuffer();
            const loadingTask = this.pdfjsLib.getDocument({ data: arrayBuffer });
            const pdf = await loadingTask.promise;
            
            let fullText = '';
            const totalPages = pdf.numPages;

            // Extract text from each page
            for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
                const page = await pdf.getPage(pageNum);
                const textContent = await page.getTextContent();
                
                // Combine text items from the page
                const pageText = textContent.items
                    .map(item => item.str)
                    .join(' ');
                
                fullText += `\n\n--- Page ${pageNum} ---\n\n${pageText}`;
            }

            return {
                text: fullText.trim(),
                pageCount: totalPages,
                fileName: file.name,
                fileSize: file.size
            };
        } catch (error) {
            console.error('Error extracting PDF text:', error);
            throw new Error(`Failed to extract text from PDF: ${error.message}`);
        }
    }

    // Split PDF text into chunks for better RAG retrieval
    // Increased chunk size to reduce number of chunks and speed up processing
    splitIntoChunks(text, chunkSize = 2000, overlap = 300) {
        const chunks = [];
        const sentences = text.split(/[.!?]+\s+/);
        
        let currentChunk = '';
        let currentLength = 0;

        for (const sentence of sentences) {
            const sentenceLength = sentence.length;
            
            if (currentLength + sentenceLength > chunkSize && currentChunk) {
                // Save current chunk
                chunks.push(currentChunk.trim());
                
                // Start new chunk with overlap
                const words = currentChunk.split(/\s+/);
                const overlapWords = words.slice(-Math.floor(overlap / 10)); // Approximate overlap
                currentChunk = overlapWords.join(' ') + ' ' + sentence;
                currentLength = currentChunk.length;
            } else {
                currentChunk += (currentChunk ? ' ' : '') + sentence;
                currentLength += sentenceLength;
            }
        }

        // Add remaining chunk
        if (currentChunk.trim()) {
            chunks.push(currentChunk.trim());
        }

        return chunks.filter(chunk => chunk.length > 50); // Filter out very short chunks
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PDFParser;
}

