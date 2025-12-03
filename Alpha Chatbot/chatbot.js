// "Alpha Chatbot" - Evidence-Based Nutrition Buddy
// Production-ready implementation with NLP, RAG, and ML features :)

class NutritionChatbot {
    constructor() {
        this.apiKey = null;
        this.messages = [];
        this.userProfile = null;
        this.onboardingActive = false;
        this.onboardingStep = 0;
        
        // Initialize NLP components
        this.nlp = new NLPUtils();
        this.sentimentAnalyzer = new SentimentAnalyzer();
        this.intentClassifier = new MLIntentClassifier();
        this.ragPipeline = null;
        this.pdfParser = null;
        
        // Initialize Gamification
        this.gamification = new GamificationSystem();
        this.quizSystem = new QuizSystem(this.gamification);
        this.currentQuizSession = null;
        
        // Initialize Dashboard and Calendar
        this.dashboard = new Dashboard();
        this.calendar = new CalendarSystem();
        this.dashboard.init();
        
        // Initialize Fact Checker (will be set after RAG is initialized)
        this.factChecker = null;
        
        // Initialize Misinformation Combat Features
        this.misinformationTracker = new MisinformationTracker();
        this.sourceCredibility = new SourceCredibility();
        this.productSafety = new ProductSafetyChecker();
        this.trendingMyths = null; // Will be initialized after evidence DB is available
        
        this.initializeElements();
        this.loadApiKey();
        this.loadUserProfile();
        this.setupEventListeners();
        this.checkOnboarding();
        // Initialize RAG after API key is loaded
        this.initializeRAG();
        // Update streak on load
        this.gamification.updateStreak();
        // Display gamification UI
        this.updateGamificationUI();
        // Setup quick reply buttons
        this.setupQuickReplies();
    }

    setupQuickReplies() {
        // Use event delegation for quick reply buttons (works for existing and dynamically added buttons)
        const messagesContainer = this.messagesContainer || document.getElementById('messages');
        const welcomeMessage = this.welcomeMessage || document.querySelector('.welcome-message');
        
        // Setup for welcome message quick replies
        if (welcomeMessage) {
            const quickReplyBtns = welcomeMessage.querySelectorAll('.quick-reply-btn');
            quickReplyBtns.forEach(btn => {
                // Remove any existing listeners by cloning
                const newBtn = btn.cloneNode(true);
                btn.parentNode.replaceChild(newBtn, btn);
                
                newBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const replyText = newBtn.dataset.reply || newBtn.textContent.trim();
                    if (this.userInput && !this.userInput.disabled) {
                        this.userInput.value = replyText;
                        this.userInput.focus();
                        setTimeout(() => {
                            this.sendMessage();
                        }, 100);
                    }
                });
            });
        }
        
        // Also use event delegation on messages container for dynamically added quick replies
        if (messagesContainer) {
            messagesContainer.addEventListener('click', (e) => {
                if (e.target.classList.contains('quick-reply-btn')) {
                    e.preventDefault();
                    e.stopPropagation();
                    const replyText = e.target.dataset.reply || e.target.textContent.trim();
                    if (this.userInput && !this.userInput.disabled) {
                        this.userInput.value = replyText;
                        this.userInput.focus();
                        setTimeout(() => {
                            this.sendMessage();
                        }, 100);
                    }
                }
            });
        }
    }

    async initializeRAG() {
        if (this.apiKey) {
            try {
                this.ragPipeline = new RAGPipeline(this.apiKey);
                await this.ragPipeline.initializeKnowledgeBase(EVIDENCE_DB);
                console.log('RAG pipeline initialized successfully');
                
                // Initialize fact checker after RAG is ready
                this.factChecker = new FactChecker(EVIDENCE_DB, this.ragPipeline);
                
                // Initialize trending myths
                this.trendingMyths = new TrendingMyths(EVIDENCE_DB);
                
                // Show daily myth debunk or trending alert
                this.checkForDailyAlerts();
            } catch (error) {
                console.error('Error initializing RAG pipeline:', error);
                // Continue without RAG if initialization fails
                this.factChecker = new FactChecker(EVIDENCE_DB, null);
                this.trendingMyths = new TrendingMyths(EVIDENCE_DB);
            }
        } else {
            // Initialize fact checker without RAG
            this.factChecker = new FactChecker(EVIDENCE_DB, null);
            this.trendingMyths = new TrendingMyths(EVIDENCE_DB);
        }
    }

    // Check for daily alerts and show them
    checkForDailyAlerts() {
        if (!this.trendingMyths) return;

        // Check for trending alert
        const trendingAlert = this.trendingMyths.shouldShowAlert();
        if (trendingAlert) {
            setTimeout(() => {
                this.showTrendingAlert(trendingAlert);
            }, 2000); // Show after 2 seconds
            return;
        }

        // Show daily myth debunk if no trending alert
        const dailyMyth = this.trendingMyths.getDailyMythDebunk();
        const lastDailyMyth = localStorage.getItem('alpha_last_daily_myth');
        const today = new Date().toDateString();
        
        if (lastDailyMyth !== today && !this.onboardingActive) {
            setTimeout(() => {
                this.showDailyMythDebunk(dailyMyth);
                localStorage.setItem('alpha_last_daily_myth', today);
            }, 2000);
        }
    }

    initializeElements() {
        this.apiKeyInput = document.getElementById('apiKey');
        this.saveKeyBtn = document.getElementById('saveKeyBtn');
        this.keyStatus = document.getElementById('keyStatus');
        this.userInput = document.getElementById('userInput');
        this.sendBtn = document.getElementById('sendBtn');
        this.messagesContainer = document.getElementById('messages');
        this.chatContainer = document.getElementById('chatContainer');
        this.welcomeMessage = document.querySelector('.welcome-message');
        this.gamificationPanel = document.getElementById('gamificationPanel');
        this.emojiBtn = document.getElementById('emojiBtn');
        this.attachmentBtn = document.getElementById('attachmentBtn');
        this.fileInput = document.getElementById('fileInput');
        this.attachedFiles = [];
    }

    loadApiKey() {
        const savedKey = CONFIG.getApiKey();
        if (savedKey) {
            this.apiKey = savedKey;
            this.apiKeyInput.value = savedKey;
            this.updateKeyStatus('saved', '✓ Key saved');
            this.enableChat();
        } else {
            this.disableChat();
        }
    }

    loadUserProfile() {
        const saved = localStorage.getItem('alpha_user_profile');
        if (saved) {
            this.userProfile = JSON.parse(saved);
        }
    }

    saveUserProfile() {
        if (this.userProfile) {
            localStorage.setItem('alpha_user_profile', JSON.stringify(this.userProfile));
        }
    }

    checkOnboarding() {
        if (!this.userProfile) {
            this.startOnboarding();
        }
    }

    startOnboarding() {
        this.onboardingActive = true;
        ONBOARDING.init();
        this.showOnboardingWelcome();
    }

    showOnboardingWelcome() {
        const welcomeHtml = `
            <div class="onboarding-welcome">
                <h3>👋 Welcome to Alpha!</h3>
                <p>I'm your evidence-based nutrition buddy. I explain nutrition using science you can trust. I don't sell products or push trends.</p>
                <p><strong>Quick setup — 6 questions to personalize your food tips.</strong></p>
                <button class="btn-primary" id="startOnboardingBtn">Get Started</button>
            </div>
        `;
        if (this.welcomeMessage) {
            this.welcomeMessage.innerHTML = welcomeHtml;
            document.getElementById('startOnboardingBtn').addEventListener('click', () => {
                this.askOnboardingQuestion();
            });
        }
    }

    askOnboardingQuestion() {
        if (this.welcomeMessage) {
            this.welcomeMessage.style.display = 'none';
        }
        
        const question = ONBOARDING.getCurrentQuestion();
        if (!question) {
            this.completeOnboarding();
            return;
        }

        let questionHtml = `<div class="onboarding-question">
            <p class="question-text">${question.question}</p>`;

        if (question.type === 'select') {
            questionHtml += '<div class="options-container">';
            question.options.forEach(option => {
                questionHtml += `<button class="option-btn" data-value="${option}">${option}</button>`;
            });
            questionHtml += '</div>';
        } else if (question.type === 'multiselect') {
            questionHtml += '<div class="options-container multiselect">';
            question.options.forEach(option => {
                questionHtml += `<button class="option-btn" data-value="${option}">${option}</button>`;
            });
            questionHtml += '<button class="btn-primary" id="continueBtn" style="margin-top: 15px;">Continue</button></div>';
        } else if (question.type === 'yesno') {
            questionHtml += '<div class="options-container">';
            questionHtml += '<button class="option-btn" data-value="Yes">Yes</button>';
            questionHtml += '<button class="option-btn" data-value="No">No</button>';
            questionHtml += '</div>';
            if (question.followUp) {
                questionHtml += `<div id="followUp" style="display:none; margin-top: 15px;">
                    <input type="text" id="followUpInput" placeholder="${question.followUp}" style="width: 100%; padding: 10px; border-radius: 8px; border: 2px solid #dee2e6;">
                    <button class="btn-primary" id="followUpBtn" style="margin-top: 10px;">Continue</button>
                </div>`;
            }
        } else {
            questionHtml += `<input type="${question.type}" id="questionInput" placeholder="${question.placeholder || ''}" style="width: 100%; padding: 10px; border-radius: 8px; border: 2px solid #dee2e6;">
            <button class="btn-primary" id="continueBtn" style="margin-top: 10px;">Continue</button>`;
        }

        questionHtml += '</div>';

        const messageContent = this.addMessage('bot', questionHtml, true);

        // Setup event listeners
        setTimeout(() => {
            // Use the message content we just created
            const questionContainer = messageContent.querySelector('.onboarding-question');
            
            if (question.type === 'select' || question.type === 'yesno') {
                document.querySelectorAll('.option-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const value = e.target.dataset.value;
                        ONBOARDING.saveAnswer(question.id, value);
                        if (question.followUp && value === 'Yes') {
                            document.getElementById('followUp').style.display = 'block';
                            document.getElementById('followUpBtn').addEventListener('click', () => {
                                const details = document.getElementById('followUpInput').value;
                                ONBOARDING.saveAnswer(question.id + 'Details', details);
                                this.nextOnboardingStep();
                            });
                        } else {
                            this.nextOnboardingStep();
                        }
                    });
                });
            } else if (question.type === 'multiselect') {
                // Store selected values in a closure
                let selectedValues = [];
                
                // Use the message content we have
                if (!messageContent) return;
                
                const continueBtn = messageContent.querySelector('#continueBtn');
                const optionButtons = messageContent.querySelectorAll('.option-btn');
                
                // Set up continue button handler
                if (continueBtn) {
                    continueBtn.style.display = 'block';
                    
                    // Use a named function to ensure proper binding
                    const handleContinue = (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        
                        const answer = selectedValues.length > 0 ? selectedValues : ['None'];
                        ONBOARDING.saveAnswer(question.id, answer);
                        this.nextOnboardingStep();
                    };
                    
                    continueBtn.addEventListener('click', handleContinue, { once: false });
                }
                
                // Set up option button handlers
                optionButtons.forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        
                        const button = e.target;
                        const value = button.dataset.value;
                        const isSelected = button.classList.contains('selected');
                        
                        button.classList.toggle('selected');
                        
                        if (!isSelected) {
                            // Adding selection
                            if (value === 'None') {
                                // Deselect all others
                                optionButtons.forEach(b => {
                                    if (b !== button) {
                                        b.classList.remove('selected');
                                    }
                                });
                                selectedValues = ['None'];
                            } else {
                                // Remove "None" if it exists
                                const noneIndex = selectedValues.indexOf('None');
                                if (noneIndex > -1) {
                                    selectedValues.splice(noneIndex, 1);
                                    optionButtons.forEach(b => {
                                        if (b.dataset.value === 'None') {
                                            b.classList.remove('selected');
                                        }
                                    });
                                }
                                if (selectedValues.indexOf(value) === -1) {
                                    selectedValues.push(value);
                                }
                            }
                        } else {
                            // Removing selection
                            const index = selectedValues.indexOf(value);
                            if (index > -1) {
                                selectedValues.splice(index, 1);
                            }
                        }
                    });
                });
            } else {
                const continueBtn = document.getElementById('continueBtn');
                const input = document.getElementById('questionInput');
                if (continueBtn && input) {
                    continueBtn.addEventListener('click', () => {
                        ONBOARDING.saveAnswer(question.id, input.value);
                        this.nextOnboardingStep();
                    });
                    input.addEventListener('keypress', (e) => {
                        if (e.key === 'Enter') {
                            continueBtn.click();
                        }
                    });
                }
            }
        }, 100);
    }

    nextOnboardingStep() {
        if (ONBOARDING.next()) {
            this.askOnboardingQuestion();
        } else {
            this.completeOnboarding();
        }
    }

    completeOnboarding() {
        this.userProfile = ONBOARDING.getProfile();
        this.saveUserProfile();
        this.onboardingActive = false;
        
        // Show safety banner if needed
        if (ONBOARDING.hasRedFlags()) {
            this.showSafetyBanner();
        }
        
        this.addMessage('bot', `Great! I've saved your preferences. I'm ready to help you with evidence-based nutrition advice. What would you like to know? 🥗`);
    }

    showSafetyBanner() {
        const banner = document.createElement('div');
        banner.className = 'safety-banner';
        banner.innerHTML = `
            <strong>⚠️ Important:</strong> If you're taking medications or have a health condition, 
            I'll suggest checking with your healthcare team first. This chatbot is for educational 
            purposes only and doesn't replace professional medical advice.
        `;
        this.messagesContainer.insertBefore(banner, this.messagesContainer.firstChild);
    }

    setupEventListeners() {
        this.saveKeyBtn.addEventListener('click', () => this.saveApiKey());
        this.apiKeyInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.saveApiKey();
            }
        });

        this.sendBtn.addEventListener('click', () => this.sendMessage());
        this.userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Gamification button handlers
        const dashboardBtn = document.getElementById('dashboardBtn');
        const calendarBtn = document.getElementById('calendarBtn');
        const quizBtn = document.getElementById('quizBtn');
        const statsBtn = document.getElementById('statsBtn');
        const achievementsBtn = document.getElementById('achievementsBtn');

        if (dashboardBtn) {
            dashboardBtn.addEventListener('click', () => this.showDashboard());
        }
        if (calendarBtn) {
            calendarBtn.addEventListener('click', () => this.showCalendar());
        }
        if (quizBtn) {
            quizBtn.addEventListener('click', () => this.showQuizMenu());
        }
        if (statsBtn) {
            statsBtn.addEventListener('click', () => this.showStats());
        }
        if (achievementsBtn) {
            achievementsBtn.addEventListener('click', () => this.showAchievements());
        }

        // Emoji button - trigger emoji picker
        if (this.emojiBtn) {
            // Remove any existing listener by cloning
            const newBtn = this.emojiBtn.cloneNode(true);
            this.emojiBtn.parentNode.replaceChild(newBtn, this.emojiBtn);
            this.emojiBtn = newBtn;
            
            this.emojiBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                console.log('Emoji button clicked in chatbot.js');
                // Initialize emoji picker if not already done or if it's not a proper instance
                if (!window.emojiPicker || !(window.emojiPicker instanceof EmojiPicker)) {
                    console.log('Initializing emoji picker...');
                    try {
                        window.emojiPicker = new EmojiPicker();
                        window.emojiPicker.init();
                    } catch (err) {
                        console.error('Failed to initialize emoji picker:', err);
                        return;
                    }
                }
                
                // Check if toggle method exists before calling
                if (window.emojiPicker && typeof window.emojiPicker.toggle === 'function') {
                    window.emojiPicker.toggle();
                } else {
                    console.error('Emoji picker toggle method not available', {
                        emojiPicker: window.emojiPicker,
                        hasToggle: typeof window.emojiPicker?.toggle,
                        isInstance: window.emojiPicker instanceof EmojiPicker
                    });
                }
            });
        } else {
            console.warn('Emoji button not found');
        }

        // Attachment button
        if (this.attachmentBtn && this.fileInput) {
            this.attachmentBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.fileInput.click();
            });

            this.fileInput.addEventListener('change', (e) => {
                if (e.target.files && e.target.files.length > 0) {
                    this.handleFileAttachment(e.target.files);
                }
            });
        } else {
            console.warn('Attachment button or file input not found', {
                attachmentBtn: !!this.attachmentBtn,
                fileInput: !!this.fileInput
            });
        }
    }

    async handleFileAttachment(files) {
        if (files.length === 0) return;

        for (const file of Array.from(files)) {
            // Handle PDF files specially
            if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
                await this.handlePDFUpload(file);
            } else {
                // Handle other file types (images, etc.)
                const reader = new FileReader();
                
                reader.onload = (e) => {
                    const attachment = {
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    url: e.target.result
                };

                this.attachedFiles.push(attachment);
                this.displayAttachment(attachment);
                };

                if (file.type.startsWith('image/')) {
                    reader.readAsDataURL(file);
                } else {
                    // For non-image files, create a blob URL
                    const blob = new Blob([file], { type: file.type });
                    const url = URL.createObjectURL(blob);
                    const attachment = {
                        name: file.name,
                        type: file.type,
                        size: file.size,
                        url: url
                    };
                    this.attachedFiles.push(attachment);
                    this.displayAttachment(attachment);
                }
            }
        }

        // Reset file input
        this.fileInput.value = '';
    }

    async handlePDFUpload(file) {
        // Show processing message
        this.addMessage('bot', `📄 Processing PDF "${file.name}"... This may take a moment.`, false);
        const processingId = this.showTypingIndicator();
        
        try {
            // Initialize PDF parser if not already done
            if (!this.pdfParser) {
                this.pdfParser = new PDFParser();
                await this.pdfParser.initialize();
            }

            // Extract text from PDF
            const pdfData = await this.pdfParser.extractText(file);
            
            // Split into chunks for better retrieval (larger chunks = fewer API calls)
            const chunks = this.pdfParser.splitIntoChunks(pdfData.text, 2000, 300);
            
            // Update processing message with progress
            const updateProgress = (processed, total) => {
                const progressPercent = Math.round((processed / total) * 100);
                const messages = this.messagesContainer.querySelectorAll('.message.bot');
                if (messages.length > 0) {
                    const lastMessage = messages[messages.length - 1];
                    if (lastMessage.textContent.includes('Processing PDF')) {
                        const messageContent = lastMessage.querySelector('.message-content');
                        if (messageContent) {
                            const contentDiv = messageContent.querySelector('div');
                            if (contentDiv) {
                                contentDiv.textContent = 
                                    `📄 Processing PDF "${file.name}"... ${progressPercent}% (${processed}/${total} chunks)`;
                            }
                        }
                    }
                }
            };
            
            // Add to RAG knowledge base with progress updates
            if (this.ragPipeline) {
                await this.ragPipeline.addPDFContent({
                    ...pdfData,
                    chunks: chunks
                }, updateProgress);
                
                this.removeTypingIndicator(processingId);
                // Remove the processing message
                const messages = this.messagesContainer.querySelectorAll('.message.bot');
                if (messages.length > 0) {
                    const lastMessage = messages[messages.length - 1];
                    if (lastMessage.textContent.includes('Processing PDF')) {
                        lastMessage.remove();
                    }
                }
                
                this.addMessage('bot', `✅ Successfully processed PDF "${file.name}"!\n\n📄 Pages: ${pdfData.pageCount}\n📝 Chunks: ${chunks.length}\n\nI can now answer questions about this document. Try asking me something about it!`, false, [
                    'What is this document about?',
                    'Summarize the main points',
                    'What are the key findings?'
                ]);
                
                // Track achievement
                if (this.gamification) {
                    this.gamification.addPoints(50, 'PDF uploaded');
                }
            } else {
                throw new Error('RAG pipeline not initialized. Please ensure your API key is saved.');
            }
        } catch (error) {
            this.removeTypingIndicator(processingId);
            console.error('Error processing PDF:', error);
            // Remove the processing message
            const messages = this.messagesContainer.querySelectorAll('.message.bot');
            if (messages.length > 0) {
                const lastMessage = messages[messages.length - 1];
                if (lastMessage.textContent.includes('Processing PDF')) {
                    lastMessage.remove();
                }
            }
            this.addMessage('bot', `❌ Error processing PDF "${file.name}": ${error.message}\n\nPlease make sure it's a valid PDF file and try again.`, false);
        }
    }

    displayAttachment(attachment) {
        // Show attachment preview in input area
        const attachmentPreview = document.createElement('div');
        attachmentPreview.className = 'attachment-preview';
        attachmentPreview.dataset.name = attachment.name;

        if (attachment.type.startsWith('image/')) {
            const img = document.createElement('img');
            img.src = attachment.url;
            img.alt = attachment.name;
            img.style.maxWidth = '100px';
            img.style.maxHeight = '100px';
            img.style.borderRadius = '8px';
            img.style.objectFit = 'cover';
            attachmentPreview.appendChild(img);
        } else {
            const fileText = document.createElement('span');
            fileText.textContent = `📎 ${attachment.name}`;
            fileText.style.marginRight = '10px';
            attachmentPreview.appendChild(fileText);
        }

        const removeBtn = document.createElement('button');
        removeBtn.className = 'attachment-remove';
        removeBtn.innerHTML = '&times;';
        removeBtn.type = 'button';
        removeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.removeAttachment(attachment.name);
            attachmentPreview.remove();
        });
        attachmentPreview.appendChild(removeBtn);

        // Insert before input container
        const inputContainer = document.querySelector('.input-container');
        if (inputContainer && inputContainer.parentNode) {
            inputContainer.parentNode.insertBefore(attachmentPreview, inputContainer);
        }
    }

    removeAttachment(fileName) {
        this.attachedFiles = this.attachedFiles.filter(file => file.name !== fileName);
    }

    saveApiKey() {
        const key = this.apiKeyInput.value.trim();
        if (!key) {
            this.updateKeyStatus('error', 'Please enter an API key');
            return;
        }

        if (CONFIG.saveApiKey(key)) {
            this.apiKey = key;
            this.updateKeyStatus('saved', '✓ Key saved');
            this.enableChat();
            // Initialize RAG pipeline with new API key
            this.initializeRAG();
        } else {
            this.updateKeyStatus('error', 'Failed to save key');
        }
    }

    updateKeyStatus(type, message) {
        this.keyStatus.textContent = message;
        this.keyStatus.className = `status-indicator ${type}`;
        setTimeout(() => {
            if (type === 'saved') {
                this.keyStatus.textContent = '';
            }
        }, 3000);
    }

    enableChat() {
        this.userInput.disabled = false;
        this.sendBtn.disabled = false;
        this.userInput.focus();
    }

    disableChat() {
        this.userInput.disabled = true;
        this.sendBtn.disabled = true;
    }

    async sendMessage() {
        if (this.onboardingActive) {
            return; // Don't process messages during onboarding
        }

        const userMessage = this.userInput.value.trim();
        if ((!userMessage && this.attachedFiles.length === 0) || !this.apiKey) return;

        // Get attachments before clearing
        const attachmentsToSend = [...this.attachedFiles];
        
        this.userInput.value = '';
        this.userInput.disabled = true;
        this.sendBtn.disabled = true;

        // Remove attachment previews
        document.querySelectorAll('.attachment-preview').forEach(preview => {
            preview.remove();
        });

        // Add user message with attachments
        this.addMessage('user', userMessage || '📎 Attachment', false, [], attachmentsToSend);
        
        // Clear attachments
        this.attachedFiles = [];

        const typingId = this.showTypingIndicator();

        try {
            // NLP Processing Pipeline
            const nlpAnalysis = this.processWithNLP(userMessage);
            
            // Check for red flags first
            const redFlags = EVIDENCE_DB.checkRedFlags(userMessage);
            if (redFlags.length > 0) {
                this.removeTypingIndicator(typingId);
                this.handleRedFlags(redFlags);
                return;
            }

            // Check for product safety first
            const productCheck = this.productSafety.checkProduct(userMessage);
            if (productCheck.found) {
                this.removeTypingIndicator(typingId);
                this.showProductSafetyCheck(productCheck.product);
                this.misinformationTracker.trackFadProduct(productCheck.product.name, productCheck.product);
                return;
            }

            // Real-time fact-checking for social media claims and fad products
            if (this.factChecker) {
                const factCheckResult = await this.factChecker.checkMessage(userMessage);
                
                // Track social media claim
                if (factCheckResult.hasSocialMediaClaim) {
                    this.misinformationTracker.trackSocialMediaClaim(userMessage, factCheckResult);
                }
                
                // Track myth encounter
                if (factCheckResult.isMyth && factCheckResult.evidence) {
                    this.misinformationTracker.trackMythEncounter(
                        factCheckResult.evidence.key || 'unknown',
                        factCheckResult.evidence,
                        factCheckResult.hasSocialMediaClaim ? 'social_media' : 'user_message'
                    );
                }
                
                // If it's a social media claim or fad product, prioritize fact-checking
                if (factCheckResult.hasSocialMediaClaim || factCheckResult.isFadProduct || (factCheckResult.isMyth && factCheckResult.confidence > 0.7)) {
                    this.removeTypingIndicator(typingId);
                    
                    // Track myth debunking if applicable
                    if (factCheckResult.isMyth) {
                        this.gamification.trackMythDebunked();
                        if (factCheckResult.evidence) {
                            this.misinformationTracker.trackMythDebunked(
                                factCheckResult.evidence.key || 'unknown',
                                factCheckResult.evidence
                            );
                        }
                    }
                    
                    // Add quick replies with comparison option
                    const quickReplies = [];
                    if (factCheckResult.isMyth || factCheckResult.isFadProduct) {
                        quickReplies.push('Show comparison', 'Show me sources', 'What are healthy alternatives?');
                    } else {
                        quickReplies.push('Thanks!', 'Tell me more', 'Check another claim');
                    }
                    
                    // Enhance response with source credibility
                    let enhancedResponse = factCheckResult.response;
                    if (factCheckResult.evidence && factCheckResult.evidence.sources) {
                        enhancedResponse += this.formatSourcesWithCredibility(factCheckResult.evidence.sources);
                    }
                    
                    this.addMessage('bot', enhancedResponse, false, quickReplies);
                    this.updateGamificationUI();
                    return;
                }
            }

            // Check for dashboard/calendar requests first
            const lowerMessage = userMessage.toLowerCase();
            if (lowerMessage.includes('dashboard') || lowerMessage.includes('show my dashboard') || lowerMessage.includes('nutrition hub')) {
                this.removeTypingIndicator(typingId);
                this.showDashboard();
                return;
            }
            
            if (lowerMessage.includes('calendar') || lowerMessage.includes('meal plan') || lowerMessage.includes('plan my meals')) {
                this.removeTypingIndicator(typingId);
                if (lowerMessage.includes('plan my meals') || lowerMessage.includes('generate') || lowerMessage.includes('weekly plan')) {
                    this.calendar.generateWeeklyMealPlan();
                    this.addMessage('bot', '✅ I\'ve generated a 7-day meal plan for you! Opening calendar...', false);
                }
                this.showCalendar();
                return;
            }

            if (lowerMessage.includes('misinformation tracker') || lowerMessage.includes('myth tracker') || lowerMessage.includes('show my progress')) {
                this.removeTypingIndicator(typingId);
                this.showMisinformationTracker();
                return;
            }

            if (lowerMessage.includes('compare myth') || lowerMessage.includes('show comparison') || lowerMessage.includes('myth vs fact')) {
                // Try to find myth from recent messages
                const messages = this.messagesContainer.querySelectorAll('.message.bot');
                for (let i = messages.length - 1; i >= 0; i--) {
                    const mythKey = messages[i].dataset.mythKey;
                    if (mythKey) {
                        this.removeTypingIndicator(typingId);
                        this.showMythComparison(mythKey);
                        return;
                    }
                }
                // If no myth found, ask user
                this.removeTypingIndicator(typingId);
                this.addMessage('bot', 'I\'d be happy to show you a myth comparison! Which myth would you like me to compare?', false);
                return;
            }

            // Intent classification
            const intentResult = this.intentClassifier.classify(userMessage);
            console.log('Intent:', intentResult);

            // Sentiment analysis
            const sentiment = this.sentimentAnalyzer.analyze(userMessage);
            console.log('Sentiment:', sentiment);

            // Named Entity Recognition
            const entities = this.nlp.extractEntities(userMessage);
            console.log('Entities:', entities);

            // RAG Retrieval
            let ragContext = '';
            if (this.ragPipeline) {
                const retrievedKnowledge = await this.ragPipeline.hybridRetrieve(userMessage, 3);
                ragContext = this.ragPipeline.formatContext(retrievedKnowledge);
                console.log('Retrieved knowledge:', retrievedKnowledge.length, 'items');
            }

            // Gamification: Track message
            this.gamification.trackMessage();
            this.gamification.trackQuestionAnswered();
            
            // Check for known myths (enhanced with NLP)
            const myth = EVIDENCE_DB.findMyth(userMessage);
            if (myth || intentResult.intent === 'mythDebunk') {
                this.removeTypingIndicator(typingId);
                if (myth) {
                    // Track myth encounter
                    if (this.misinformationTracker) {
                        this.misinformationTracker.trackMythEncounter(myth.key, myth, 'user_message');
                    }
                    
                    this.debunkMyth(myth);
                    this.gamification.trackMythDebunked();
                    // Note: debunkMyth already calls addMessage with quick replies
                } else {
                    // Use AI with RAG context for myth debunking
                    const response = await this.callOpenAIWithNLP(userMessage, {
                        intent: intentResult,
                        sentiment,
                        entities,
                        ragContext
                    });
                    const quickReplies = this.generateQuickReplies('mythDebunk', response);
                    this.addMessage('bot', response, false, quickReplies);
                    this.gamification.trackMythDebunked();
                }
            } else {
                // Use AI with full NLP context
                const response = await this.callOpenAIWithNLP(userMessage, {
                    intent: intentResult,
                    sentiment,
                    entities,
                    ragContext
                });
                this.removeTypingIndicator(typingId);
                const quickReplies = this.generateQuickReplies(intentResult.intent, response);
                this.addMessage('bot', response, false, quickReplies);
                
                // Track swaps/recipes if detected
                if (intentResult.intent === 'swapRequest') {
                    this.gamification.trackSwapLearned();
                }
                if (intentResult.intent === 'recipeRequest') {
                    this.gamification.trackRecipeViewed();
                }
            }
            
            // Check for new achievements
            const newAchievements = this.gamification.checkAchievements();
            if (newAchievements.length > 0) {
                this.showAchievementNotification(newAchievements);
            }
            
            // Update gamification UI
            this.updateGamificationUI();
        } catch (error) {
            this.removeTypingIndicator(typingId);
            this.addMessage('bot', `Sorry, I encountered an error: ${error.message}. Please check your API key and try again.`);
            console.error('Error:', error);
        } finally {
            this.userInput.disabled = false;
            this.sendBtn.disabled = false;
            this.userInput.focus();
        }
    }

    // Process message with NLP pipeline
    processWithNLP(text) {
        const tokens = this.nlp.tokenize(text);
        const lemmatized = this.nlp.lemmatizeText(text);
        const keywords = this.nlp.extractKeywords(text);
        const entities = this.nlp.extractEntities(text);
        const intent = this.intentClassifier.classify(text);
        const sentiment = this.sentimentAnalyzer.analyze(text);

        return {
            tokens,
            lemmatized,
            keywords,
            entities,
            intent,
            sentiment
        };
    }

    handleRedFlags(redFlags) {
        let message = `⚠️ **Important Safety Notice:**\n\n`;
        message += `I noticed you mentioned something that requires medical attention. `;
        message += `**Please consult your healthcare provider** before making any dietary changes, especially if you're:\n\n`;
        message += `• Taking medications\n`;
        message += `• Pregnant or planning pregnancy\n`;
        message += `• Managing a chronic condition (diabetes, heart disease, kidney/liver issues)\n\n`;
        message += `This chatbot is for **educational purposes only** and doesn't replace professional medical advice. `;
        message += `I can still provide general nutrition information, but always check with your healthcare team for personalized guidance.`;
        
        this.addMessage('bot', message);
    }

    debunkMyth(myth) {
        // Track myth debunk
        if (this.misinformationTracker && myth.key) {
            this.misinformationTracker.trackMythDebunked(myth.key, myth);
        }

        // Get evidence strength and source credibility
        const evidenceStrength = this.sourceCredibility.determineEvidenceStrength(myth.sources);
        const credibilityBadges = myth.sources.map(source => 
            this.sourceCredibility.formatSourceWithCredibility(source)
        );

        let message = `**Myth:** "${myth.myth}"\n\n`;
        message += `**The Truth:** ${myth.debunk}\n\n`;
        message += `**Why people believe this:** ${myth.whyBelieve}\n\n`;
        message += `**What the science shows:** ${myth.science}\n\n`;
        
        // Add evidence strength badge
        message += `**Evidence Strength:** ${evidenceStrength.icon} ${evidenceStrength.label}\n`;
        message += `${evidenceStrength.description}\n\n`;

        if (myth.swaps && myth.swaps.length > 0) {
            message += `**Practical swaps you can try:**\n`;
            myth.swaps.forEach(swap => {
                message += `• ${swap}\n`;
            });
            message += `\n`;
        }

        if (myth.safetyNote) {
            message += `⚠️ ${myth.safetyNote}\n\n`;
        }

        message += `**Sources & Credibility:**\n`;
        credibilityBadges.forEach(badge => {
            const stars = '⭐'.repeat(badge.rating) + '☆'.repeat(5 - badge.rating);
            message += `• **${badge.name}** ${stars} (${badge.tier})\n`;
            if (badge.url) {
                message += `  [${badge.text || 'View source'}](${badge.url})\n`;
            }
        });

        // Add quick replies with comparison option
        const quickReplies = ['Compare Myth vs Fact', 'What are healthy swaps?', 'Show me sources'];
        this.addMessage('bot', message, false, quickReplies);
        
        // Store myth key for comparison
        if (myth.key) {
            const lastMessage = this.messagesContainer.querySelector('.message.bot:last-child');
            if (lastMessage) {
                lastMessage.dataset.mythKey = myth.key;
            }
        }
    }

    async callOpenAIWithNLP(userMessage, nlpContext = {}) {
        const { intent, sentiment, entities, ragContext } = nlpContext;
        
        // Build enhanced system prompt with NLP insights
        let enhancedPrompt = `You are Alpha, a warm and friendly evidence-based nutrition chatbot. Your persona is: "The Evidence-Based Nutrition Buddy."

CORE IDENTITY:
- Name: Alpha
- Tone: Warm, conversational, encouraging, non-judgmental. Use short sentences. Friendly emojis are optional.
- Core value: "I explain nutrition using science you can trust. I don't sell products or push trends."

USER PROFILE: ${this.userProfile ? JSON.stringify(this.userProfile) : 'No profile yet'}`;

        // Add NLP context
        if (intent) {
            enhancedPrompt += `\n\nDETECTED INTENT: ${intent.intent} (confidence: ${(intent.confidence * 100).toFixed(0)}%)`;
            enhancedPrompt += `\nIntent Template: ${this.intentClassifier.getResponseTemplate(intent.intent)}`;
        }

        if (sentiment) {
            enhancedPrompt += `\n\nUSER SENTIMENT: ${sentiment.sentiment} (score: ${sentiment.score.toFixed(2)})`;
            const empatheticNote = this.sentimentAnalyzer.getEmpatheticResponse(sentiment);
            if (empatheticNote) {
                enhancedPrompt += `\nNote: User seems ${sentiment.sentiment}. Consider starting with: "${empatheticNote}"`;
            }
        }

        if (entities && Object.keys(entities).length > 0) {
            enhancedPrompt += `\n\nDETECTED ENTITIES:`;
            if (entities.foods.length > 0) enhancedPrompt += `\n- Foods mentioned: ${entities.foods.join(', ')}`;
            if (entities.nutrients.length > 0) enhancedPrompt += `\n- Nutrients mentioned: ${entities.nutrients.join(', ')}`;
            if (entities.healthConditions.length > 0) enhancedPrompt += `\n- Health conditions: ${entities.healthConditions.join(', ')}`;
            if (entities.quantities.length > 0) enhancedPrompt += `\n- Quantities: ${entities.quantities.join(', ')}`;
        }

        if (ragContext) {
            enhancedPrompt += `\n\n${ragContext}`;
            
            // Check if PDF content is in the context
            if (ragContext.includes('[PDF:')) {
                enhancedPrompt += `\n\nIMPORTANT: The user has uploaded PDF documents. When answering questions, prioritize information from the uploaded PDFs. Reference specific PDFs by name when citing information from them. If the question is about content in a PDF, make sure to use the PDF content as the primary source.`;
            }
        }

        enhancedPrompt += `\n\nCORE CAPABILITIES:

1. MYTH DEBUNKING:
   - When users mention myths, structure response as:
     a) State the myth clearly
     b) Explain why it's incorrect
     c) Provide scientific evidence
     d) Offer evidence-based truth
     e) Suggest practical swaps
   - Always cite sources (NHS, WHO, Mayo Clinic, NCCIH, dietetic associations)

2. PERSONALIZED ADVICE:
   - Use the user profile to tailor all advice
   - Reference their goals, dietary restrictions, activity level
   - Use detected entities (foods, nutrients) to provide specific guidance
   - Provide practical tips specific to their situation
   - Suggest healthy swaps relevant to their preferences

3. SAFETY FIRST:
   - If user mentions medications, pregnancy, or chronic conditions, ALWAYS recommend consulting a healthcare provider
   - Never give medical advice or prescriptions
   - Add disclaimers when needed: "This is educational only. For medical conditions, consult your clinician."

4. EVIDENCE-BASED:
   - Base ALL responses on peer-reviewed research
   - Use the retrieved knowledge context provided above
   - Cite 1-3 reputable sources per major claim
   - Use phrases like "research suggests," "studies show," "evidence indicates"
   - Promote credible sources over viral trends

5. ENGAGEMENT:
   - Adjust tone based on detected sentiment (${sentiment?.sentiment || 'neutral'})
   - Keep responses concise (2-4 paragraphs max)
   - Use bullet points for clarity
   - Ask follow-up questions to engage
   - Show enthusiasm about helping them make better choices
   - Offer quick-reply suggestions when appropriate

6. PRACTICAL FOCUS:
   - Always provide actionable swaps
   - Suggest recipes when relevant
   - Give portion guidance when appropriate
   - Make advice practical and implementable
   - Reference detected foods and nutrients in your response

IMPORTANT:
- Never replace medical advice
- Always be empathetic and non-judgmental
- Keep language simple and accessible
- Celebrate small wins and progress
- Build trust through transparency about sources`;

        const messages = [
            { role: 'system', content: enhancedPrompt },
            ...this.messages.slice(-8),
            { role: 'user', content: userMessage }
        ];

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: messages,
                temperature: 0.7,
                max_tokens: 1200
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error?.message || `API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        const assistantMessage = data.choices[0].message.content;
        
        this.messages.push({ role: 'user', content: userMessage });
        this.messages.push({ role: 'assistant', content: assistantMessage });
        
        return assistantMessage;
    }

    // Legacy method for backward compatibility
    async callOpenAI(userMessage) {
        // Enhanced system prompt for Alpha persona
        const systemPrompt = `You are Alpha, a warm and friendly evidence-based nutrition chatbot. Your persona is: "The Evidence-Based Nutrition Buddy."

CORE IDENTITY:
- Name: Alpha
- Tone: Warm, conversational, encouraging, non-judgmental. Use short sentences. Friendly emojis are optional.
- Core value: "I explain nutrition using science you can trust. I don't sell products or push trends."

USER PROFILE: ${this.userProfile ? JSON.stringify(this.userProfile) : 'No profile yet'}

CORE CAPABILITIES:

1. MYTH DEBUNKING:
   - When users mention myths, structure response as:
     a) State the myth clearly
     b) Explain why it's incorrect
     c) Provide scientific evidence
     d) Offer evidence-based truth
     e) Suggest practical swaps
   - Always cite sources (NHS, WHO, Mayo Clinic, NCCIH, dietetic associations)

2. PERSONALIZED ADVICE:
   - Use the user profile to tailor all advice
   - Reference their goals, dietary restrictions, activity level
   - Provide practical tips specific to their situation
   - Suggest healthy swaps relevant to their preferences

3. SAFETY FIRST:
   - If user mentions medications, pregnancy, or chronic conditions, ALWAYS recommend consulting a healthcare provider
   - Never give medical advice or prescriptions
   - Add disclaimers when needed: "This is educational only. For medical conditions, consult your clinician."

4. EVIDENCE-BASED:
   - Base ALL responses on peer-reviewed research
   - Cite 1-3 reputable sources per major claim
   - Use phrases like "research suggests," "studies show," "evidence indicates"
   - Promote credible sources over viral trends

5. ENGAGEMENT:
   - Keep responses concise (2-4 paragraphs max)
   - Use bullet points for clarity
   - Ask follow-up questions to engage
   - Show enthusiasm about helping them make better choices
   - Offer quick-reply suggestions when appropriate

6. PRACTICAL FOCUS:
   - Always provide actionable swaps
   - Suggest recipes when relevant
   - Give portion guidance when appropriate
   - Make advice practical and implementable

IMPORTANT:
- Never replace medical advice
- Always be empathetic and non-judgmental
- Keep language simple and accessible
- Celebrate small wins and progress
- Build trust through transparency about sources`;

        const messages = [
            { role: 'system', content: systemPrompt },
            ...this.messages.slice(-8),
            { role: 'user', content: userMessage }
        ];

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: messages,
                temperature: 0.7,
                max_tokens: 1000
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error?.message || `API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        const assistantMessage = data.choices[0].message.content;
        
        this.messages.push({ role: 'user', content: userMessage });
        this.messages.push({ role: 'assistant', content: assistantMessage });
        
        return assistantMessage;
    }

    addMessage(role, content, isHtml = false, quickReplies = [], attachments = []) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${role}`;

        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.textContent = role === 'user' ? '👤' : '🥗';

        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        
        // Add attachments if any
        if (attachments.length > 0) {
            attachments.forEach(attachment => {
                const attachmentDiv = document.createElement('div');
                attachmentDiv.className = 'message-attachment';
                if (attachment.type.startsWith('image/')) {
                    const img = document.createElement('img');
                    img.src = attachment.url;
                    img.alt = attachment.name;
                    img.className = 'attachment-image';
                    attachmentDiv.appendChild(img);
                } else {
                    const fileLink = document.createElement('a');
                    fileLink.href = attachment.url;
                    fileLink.download = attachment.name;
                    fileLink.textContent = `📎 ${attachment.name}`;
                    fileLink.className = 'attachment-link';
                    attachmentDiv.appendChild(fileLink);
                }
                messageContent.appendChild(attachmentDiv);
            });
        }
        
        if (isHtml) {
            const contentDiv = document.createElement('div');
            contentDiv.innerHTML = content;
            messageContent.appendChild(contentDiv);
        } else {
            const formattedContent = this.formatMessage(content);
            const contentDiv = document.createElement('div');
            contentDiv.innerHTML = formattedContent;
            messageContent.appendChild(contentDiv);
        }

        messageDiv.appendChild(avatar);
        messageDiv.appendChild(messageContent);
        this.messagesContainer.appendChild(messageDiv);

        // Add quick reply buttons for bot messages
        if (role === 'bot' && quickReplies && quickReplies.length > 0) {
            const quickRepliesContainer = document.createElement('div');
            quickRepliesContainer.className = 'quick-replies';
            quickReplies.forEach(reply => {
                const btn = document.createElement('button');
                btn.className = 'quick-reply-btn';
                btn.type = 'button'; // Prevent form submission
                btn.textContent = reply;
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    // Handle special quick replies
                    if (reply === 'Compare Myth vs Fact' || reply === 'Show comparison') {
                        // Find the myth key from the last bot message
                        const messages = this.messagesContainer.querySelectorAll('.message.bot');
                        if (messages.length > 0) {
                            const lastMessage = messages[messages.length - 1];
                            const mythKey = lastMessage.dataset.mythKey;
                            if (mythKey) {
                                this.showMythComparison(mythKey);
                                return;
                            }
                        }
                        // If no myth key found, treat as regular message
                    }
                    
                    if (this.userInput && !this.userInput.disabled) {
                        this.userInput.value = reply;
                        this.userInput.focus();
                        // Small delay to ensure input is ready
                        setTimeout(() => {
                            this.sendMessage();
                        }, 100);
                    }
                });
                quickRepliesContainer.appendChild(btn);
            });
            messageDiv.appendChild(quickRepliesContainer);
        }

        // Store reference to the message content for onboarding
        if (isHtml && role === 'bot') {
            messageContent.dataset.isOnboardingQuestion = 'true';
        }

        this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
        return messageContent;
    }

    generateQuickReplies(intent, response) {
        // Generate contextually relevant quick reply suggestions based on intent
        const quickReplies = [];
        
        switch (intent) {
            case 'mythDebunk':
                quickReplies.push('Tell me more about this', 'What are the sources?', 'Any practical tips?');
                break;
            case 'swapRequest':
                quickReplies.push('More swaps please', 'Why is this better?', 'Any recipes?');
                break;
            case 'recipeRequest':
                quickReplies.push('More recipes', 'Nutrition info?', 'Cooking tips?');
                break;
            case 'adviceRequest':
                quickReplies.push('More details', 'Any concerns?', 'What about supplements?');
                break;
            case 'productCheck':
                quickReplies.push('Is it safe?', 'Better alternatives?', 'More info?');
                break;
            case 'healthQuery':
                quickReplies.push('More information', 'What should I do?', 'Any resources?');
                break;
            default:
                // Generic quick replies for general queries
                if (response && (response.toLowerCase().includes('myth') || response.toLowerCase().includes('debunk'))) {
                    quickReplies.push('More myths to debunk', 'Tell me more', 'Sources?');
                } else if (response && (response.toLowerCase().includes('recipe') || response.toLowerCase().includes('cook'))) {
                    quickReplies.push('More recipes', 'Nutrition info?', 'Tips?');
                } else if (response && (response.toLowerCase().includes('swap') || response.toLowerCase().includes('replace'))) {
                    quickReplies.push('More swaps', 'Why better?', 'Examples?');
                } else {
                    quickReplies.push('Tell me more', 'Any tips?', 'What else?');
                }
        }
        
        // Limit to 3 quick replies max
        return quickReplies.slice(0, 3);
    }

    formatMessage(text) {
        // Enhanced markdown formatting with link support
        let formatted = text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
            .replace(/\n/g, '<br>')
            .replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>')
            .replace(/^[-•]\s+(.+)$/gm, '<li>$1</li>');

        formatted = formatted.replace(/(<li>.*<\/li>)/gs, (match) => {
            if (!match.includes('<ul>')) {
                return '<ul>' + match + '</ul>';
            }
            return match;
        });

        const paragraphs = formatted.split('<br><br>');
        formatted = paragraphs.map(p => {
            if (p.trim() && !p.includes('<ul>') && !p.includes('<li>') && !p.startsWith('<')) {
                return '<p>' + p + '</p>';
            }
            return p;
        }).join('');

        return formatted;
    }

    showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message bot';
        typingDiv.id = 'typing-indicator';

        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.textContent = '🥗';

        const typingContent = document.createElement('div');
        typingContent.className = 'typing-indicator';
        typingContent.innerHTML = '<span></span><span></span><span></span>';

        typingDiv.appendChild(avatar);
        typingDiv.appendChild(typingContent);
        this.messagesContainer.appendChild(typingDiv);

        this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
        return 'typing-indicator';
    }

    removeTypingIndicator(id) {
        const indicator = document.getElementById(id);
        if (indicator) {
            indicator.remove();
        }
    }

    // Gamification UI Updates
    updateGamificationUI() {
        const stats = this.gamification.getStats();
        const xpProgress = stats.xpProgress;
        
        // Update level display
        const levelDisplay = document.getElementById('levelDisplay');
        if (levelDisplay) {
            levelDisplay.textContent = `Level ${stats.level}`;
        }
        
        // Update XP progress bar
        const xpBar = document.getElementById('xpProgressBar');
        const xpText = document.getElementById('xpText');
        if (xpBar) {
            xpBar.style.width = `${xpProgress.percentage}%`;
        }
        if (xpText) {
            xpText.textContent = `${xpProgress.current} / ${xpProgress.needed} XP`;
        }
        
        // Update points
        const pointsDisplay = document.getElementById('pointsDisplay');
        if (pointsDisplay) {
            pointsDisplay.textContent = `💰 ${stats.points}`;
        }
        
        // Update streak
        const streakDisplay = document.getElementById('streakDisplay');
        if (streakDisplay) {
            streakDisplay.innerHTML = `🔥 ${stats.streak} day${stats.streak !== 1 ? 's' : ''}`;
        }
    }

    showAchievementNotification(achievements) {
        achievements.forEach(achievement => {
            const notification = document.createElement('div');
            notification.className = 'achievement-notification';
            notification.innerHTML = `
                <div class="achievement-content">
                    <div class="achievement-icon">${achievement.icon}</div>
                    <div class="achievement-text">
                        <div class="achievement-title">Achievement Unlocked!</div>
                        <div class="achievement-name">${achievement.name}</div>
                        <div class="achievement-reward">+${achievement.xp} XP • +${achievement.points} Points</div>
                    </div>
                </div>
            `;
            
            document.body.appendChild(notification);
            
            // Animate in
            setTimeout(() => {
                notification.classList.add('show');
            }, 100);
            
            // Remove after animation
            setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => {
                    notification.remove();
                }, 500);
            }, 3000);
        });
    }

    // Quiz functionality
    startQuiz(quizId) {
        this.currentQuizSession = this.quizSystem.startQuiz(quizId);
        if (this.currentQuizSession) {
            this.showQuiz(this.currentQuizSession);
        }
    }

    showQuiz(quizSession) {
        const question = quizSession.questions[quizSession.currentQuestion];
        if (!question) return;

        const quizHtml = `
            <div class="quiz-container">
                <div class="quiz-header">
                    <h3>${quizSession.title}</h3>
                    <p>Question ${question.index + 1} of ${question.totalQuestions}</p>
                </div>
                <div class="quiz-question">
                    <p>${question.question}</p>
                </div>
                <div class="quiz-options">
                    ${question.options.map((option, idx) => `
                        <button class="quiz-option" data-index="${idx}">${option}</button>
                    `).join('')}
                </div>
            </div>
        `;

        this.addMessage('bot', quizHtml, true);

        // Add event listeners
        setTimeout(() => {
            const options = this.messagesContainer.querySelectorAll('.quiz-option');
            options.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const answerIndex = parseInt(e.target.dataset.index);
                    this.handleQuizAnswer(quizSession, answerIndex);
                });
            });
        }, 100);
    }

    handleQuizAnswer(quizSession, answerIndex) {
        const result = this.quizSystem.submitAnswer(quizSession, quizSession.currentQuestion, answerIndex);
        
        // Show result
        let resultHtml = `
            <div class="quiz-result ${result.correct ? 'correct' : 'incorrect'}">
                <p><strong>${result.correct ? '✅ Correct!' : '❌ Incorrect'}</strong></p>
                <p>${result.explanation}</p>
            </div>
        `;

        this.addMessage('bot', resultHtml, true);

        // Move to next question or complete
        quizSession.currentQuestion++;
        if (quizSession.currentQuestion < quizSession.questions.length) {
            setTimeout(() => {
                this.showQuiz(quizSession);
            }, 2000);
        } else {
            // Complete quiz
            const completion = this.quizSystem.completeQuiz(quizSession);
            let completionHtml = `
                <div class="quiz-completion">
                    <h3>Quiz Complete! 🎉</h3>
                    <p>Score: ${completion.correctAnswers}/${completion.totalQuestions} (${completion.score.toFixed(0)}%)</p>
                    ${completion.passed ? `
                        <p class="quiz-passed">✅ Passed!</p>
                        <p>Rewards: +${completion.xpEarned} XP • +${completion.pointsEarned} Points</p>
                    ` : `
                        <p class="quiz-failed">Try again to earn rewards!</p>
                    `}
                </div>
            `;
            this.addMessage('bot', completionHtml, true);
            this.currentQuizSession = null;
            this.updateGamificationUI();
        }
    }

    // Show achievements modal
    showAchievements() {
        const unlocked = this.gamification.getUnlockedAchievements();
        const stats = this.gamification.getStats();
        const allAchievements = Object.entries(this.gamification.achievements).map(([id, achievement]) => ({
            id,
            ...achievement,
            unlocked: unlocked.some(u => u.id === id)
        }));

        // Sort: unlocked first, then by XP
        allAchievements.sort((a, b) => {
            if (a.unlocked !== b.unlocked) return b.unlocked - a.unlocked;
            return b.xp - a.xp;
        });

        const modal = document.createElement('div');
        modal.className = 'stats-modal show';
        modal.innerHTML = `
            <div class="stats-modal-content">
                <div class="modal-header">
                    <h2>🏆 Achievements</h2>
                    <button class="stats-modal-close">&times;</button>
                </div>
                <div class="achievement-progress">
                    <div class="progress-info">
                        <span class="progress-label">Progress</span>
                        <span class="progress-value">${stats.achievements} / ${stats.totalAchievements}</span>
                    </div>
                    <div class="progress-bar-container">
                        <div class="progress-bar" style="width: ${(stats.achievements / stats.totalAchievements) * 100}%"></div>
                    </div>
                </div>
                <div class="stats-section achievement-section">
                    <div class="achievement-grid">
                        ${allAchievements.map(ach => `
                            <div class="achievement-badge ${ach.unlocked ? 'unlocked' : 'locked'}" title="${ach.description || ach.name}">
                                <div class="achievement-badge-icon ${ach.unlocked ? '' : 'locked-icon'}">${ach.icon}</div>
                                <div class="achievement-badge-content">
                                    <div class="achievement-badge-name">${ach.name}</div>
                                    <div class="achievement-badge-reward">+${ach.xp} XP • +${ach.points} pts</div>
                                </div>
                                ${ach.unlocked ? '<div class="achievement-check">✓</div>' : '<div class="achievement-lock">🔒</div>'}
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        modal.querySelector('.stats-modal-close').addEventListener('click', () => {
            modal.classList.remove('show');
            setTimeout(() => modal.remove(), 300);
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('show');
                setTimeout(() => modal.remove(), 300);
            }
        });
    }

    // Show quiz menu
    showQuizMenu() {
        const quizzes = this.quizSystem.getAvailableQuizzes();
        
        const quizHtml = `
            <div class="quiz-menu">
                <h3>📝 Take a Quiz</h3>
                <p>Test your nutrition knowledge and earn XP!</p>
                ${quizzes.map(quiz => `
                    <button class="quiz-menu-item" data-quiz-id="${quiz.id}">
                        <strong>${quiz.title}</strong>
                        <p>${quiz.description}</p>
                        <small>Reward: +${quiz.reward.xp} XP • +${quiz.reward.points} Points</small>
                    </button>
                `).join('')}
            </div>
        `;

        this.addMessage('bot', quizHtml, true);

        setTimeout(() => {
            const items = this.messagesContainer.querySelectorAll('.quiz-menu-item');
            items.forEach(item => {
                item.addEventListener('click', (e) => {
                    const quizId = e.currentTarget.dataset.quizId;
                    this.startQuiz(quizId);
                });
            });
        }, 100);
    }

    // Show stats modal
    showStats() {
        const stats = this.gamification.getStats();
        const xpProgress = stats.xpProgress;
        const nextLevelXP = xpProgress.needed - xpProgress.current;
        
        const modal = document.createElement('div');
        modal.className = 'stats-modal show';
        modal.innerHTML = `
            <div class="stats-modal-content">
                <div class="modal-header">
                    <h2>📊 Your Statistics</h2>
                    <button class="stats-modal-close">&times;</button>
                </div>
                
                <div class="stats-hero">
                    <div class="stat-card level-card">
                        <div class="stat-card-icon">⭐</div>
                        <div class="stat-card-content">
                            <div class="stat-card-label">Level</div>
                            <div class="stat-card-value">${stats.level}</div>
                        </div>
                    </div>
                    <div class="stat-card xp-card">
                        <div class="stat-card-icon">💎</div>
                        <div class="stat-card-content">
                            <div class="stat-card-label">Total XP</div>
                            <div class="stat-card-value">${stats.totalXP.toLocaleString()}</div>
                        </div>
                    </div>
                    <div class="stat-card points-card">
                        <div class="stat-card-icon">💰</div>
                        <div class="stat-card-content">
                            <div class="stat-card-label">Points</div>
                            <div class="stat-card-value">${stats.points.toLocaleString()}</div>
                        </div>
                    </div>
                </div>

                <div class="xp-progress-section">
                    <div class="xp-progress-header">
                        <span>Progress to Level ${stats.level + 1}</span>
                        <span class="xp-remaining">${nextLevelXP} XP needed</span>
                    </div>
                    <div class="xp-progress-bar-container">
                        <div class="xp-progress-bar" style="width: ${xpProgress.percentage}%"></div>
                        <span class="xp-progress-text">${xpProgress.current} / ${xpProgress.needed} XP</span>
                    </div>
                </div>

                <div class="stats-section">
                    <h3 class="section-title">
                        <span class="section-icon">🔥</span>
                        Streak & Achievements
                    </h3>
                    <div class="stats-grid">
                        <div class="stat-item-card">
                            <div class="stat-item-icon">🔥</div>
                            <div class="stat-item-info">
                                <div class="stat-item-label">Current Streak</div>
                                <div class="stat-item-value">${stats.streak} day${stats.streak !== 1 ? 's' : ''}</div>
                            </div>
                        </div>
                        <div class="stat-item-card">
                            <div class="stat-item-icon">🏆</div>
                            <div class="stat-item-info">
                                <div class="stat-item-label">Achievements</div>
                                <div class="stat-item-value">${stats.achievements} / ${stats.totalAchievements}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="stats-section">
                    <h3 class="section-title">
                        <span class="section-icon">📈</span>
                        Activity Overview
                    </h3>
                    <div class="activity-grid">
                        <div class="activity-item">
                            <div class="activity-icon">💬</div>
                            <div class="activity-content">
                                <div class="activity-label">Messages Sent</div>
                                <div class="activity-value">${stats.stats.messagesSent}</div>
                            </div>
                        </div>
                        <div class="activity-item">
                            <div class="activity-icon">🔍</div>
                            <div class="activity-content">
                                <div class="activity-label">Myths Debunked</div>
                                <div class="activity-value">${stats.stats.mythsDebunked}</div>
                            </div>
                        </div>
                        <div class="activity-item">
                            <div class="activity-icon">🔄</div>
                            <div class="activity-content">
                                <div class="activity-label">Swaps Learned</div>
                                <div class="activity-value">${stats.stats.swapsLearned}</div>
                            </div>
                        </div>
                        <div class="activity-item">
                            <div class="activity-icon">🍳</div>
                            <div class="activity-content">
                                <div class="activity-label">Recipes Viewed</div>
                                <div class="activity-value">${stats.stats.recipesViewed}</div>
                            </div>
                        </div>
                        <div class="activity-item">
                            <div class="activity-icon">❓</div>
                            <div class="activity-content">
                                <div class="activity-label">Questions Answered</div>
                                <div class="activity-value">${stats.stats.questionsAnswered}</div>
                            </div>
                        </div>
                        <div class="activity-item">
                            <div class="activity-icon">📅</div>
                            <div class="activity-content">
                                <div class="activity-label">Days Active</div>
                                <div class="activity-value">${stats.stats.daysActive}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        modal.querySelector('.stats-modal-close').addEventListener('click', () => {
            modal.classList.remove('show');
            setTimeout(() => modal.remove(), 300);
        });

            modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('show');
                setTimeout(() => modal.remove(), 300);
            }
        });
    }

    // Show Dashboard
    showDashboard() {
        const summary = this.dashboard.getSummary();
        
        const modal = document.createElement('div');
        modal.className = 'stats-modal show';
        modal.innerHTML = `
            <div class="stats-modal-content dashboard-content">
                <div class="modal-header">
                    <h2>📊 Nutrition Dashboard</h2>
                    <button class="stats-modal-close">&times;</button>
                </div>
                
                <div class="dashboard-section">
                    <h3 class="section-title">
                        <span class="section-icon">🍎</span>
                        Daily Nutrition Summary
                    </h3>
                    <div class="nutrition-grid">
                        <div class="nutrition-card">
                            <div class="nutrition-label">Calories</div>
                            <div class="nutrition-value">${summary.nutrition.calories.current.toFixed(0)}</div>
                            <div class="nutrition-goal">/ ${summary.nutrition.calories.goal} kcal</div>
                            <div class="nutrition-progress">
                                <div class="nutrition-progress-bar" style="width: ${Math.min(summary.nutrition.calories.percent, 100)}%"></div>
                            </div>
                        </div>
                        <div class="nutrition-card">
                            <div class="nutrition-label">Protein</div>
                            <div class="nutrition-value">${summary.nutrition.protein.current.toFixed(0)}g</div>
                            <div class="nutrition-goal">/ ${summary.nutrition.protein.goal}g</div>
                            <div class="nutrition-progress">
                                <div class="nutrition-progress-bar protein" style="width: ${Math.min(summary.nutrition.protein.percent, 100)}%"></div>
                            </div>
                        </div>
                        <div class="nutrition-card">
                            <div class="nutrition-label">Carbs</div>
                            <div class="nutrition-value">${summary.nutrition.carbs.current.toFixed(0)}g</div>
                            <div class="nutrition-goal">/ ${summary.nutrition.carbs.goal}g</div>
                            <div class="nutrition-progress">
                                <div class="nutrition-progress-bar carbs" style="width: ${Math.min(summary.nutrition.carbs.percent, 100)}%"></div>
                            </div>
                        </div>
                        <div class="nutrition-card">
                            <div class="nutrition-label">Fats</div>
                            <div class="nutrition-value">${summary.nutrition.fats.current.toFixed(0)}g</div>
                            <div class="nutrition-goal">/ ${summary.nutrition.fats.goal}g</div>
                            <div class="nutrition-progress">
                                <div class="nutrition-progress-bar fats" style="width: ${Math.min(summary.nutrition.fats.percent, 100)}%"></div>
                            </div>
                        </div>
                        <div class="nutrition-card">
                            <div class="nutrition-label">Fiber</div>
                            <div class="nutrition-value">${summary.nutrition.fiber.current.toFixed(0)}g</div>
                            <div class="nutrition-goal">/ ${summary.nutrition.fiber.goal}g</div>
                            <div class="nutrition-progress">
                                <div class="nutrition-progress-bar fiber" style="width: ${Math.min(summary.nutrition.fiber.percent, 100)}%"></div>
                            </div>
                        </div>
                        <div class="nutrition-card">
                            <div class="nutrition-label">Water</div>
                            <div class="nutrition-value">${summary.nutrition.water}</div>
                            <div class="nutrition-goal">/ ${summary.nutrition.water.goal} glasses</div>
                            <div class="nutrition-progress">
                                <div class="nutrition-progress-bar water" style="width: ${Math.min(summary.nutrition.water.percent, 100)}%"></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="dashboard-section">
                    <h3 class="section-title">
                        <span class="section-icon">🎯</span>
                        Habits & Goals
                    </h3>
                    <div class="habits-grid">
                        <div class="habit-card">
                            <div class="habit-icon">🥗</div>
                            <div class="habit-info">
                                <div class="habit-label">Fruits & Veggies</div>
                                <div class="habit-value">${summary.habits.fruitsVeggies} servings</div>
                            </div>
                        </div>
                        <div class="habit-card">
                            <div class="habit-icon">👟</div>
                            <div class="habit-info">
                                <div class="habit-label">Steps</div>
                                <div class="habit-value">${summary.habits.steps.toLocaleString()}</div>
                            </div>
                        </div>
                        <div class="habit-card">
                            <div class="habit-icon">😴</div>
                            <div class="habit-info">
                                <div class="habit-label">Sleep</div>
                                <div class="habit-value">${summary.habits.sleep}h</div>
                            </div>
                        </div>
                        <div class="habit-card streak-card">
                            <div class="habit-icon">🔥</div>
                            <div class="habit-info">
                                <div class="habit-label">Meal Logging Streak</div>
                                <div class="habit-value">${summary.mealStreak} days</div>
                            </div>
                        </div>
                    </div>
                </div>

                ${summary.insights.length > 0 ? `
                <div class="dashboard-section">
                    <h3 class="section-title">
                        <span class="section-icon">💡</span>
                        Insights
                    </h3>
                    <div class="insights-list">
                        ${summary.insights.map(insight => `
                            <div class="insight-item ${insight.type}">
                                <span class="insight-icon">${insight.icon}</span>
                                <span class="insight-message">${insight.message}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                ` : ''}

                <div class="dashboard-actions">
                    <button class="dashboard-btn" onclick="window.chatbot?.logMealPrompt()">➕ Log Meal</button>
                    <button class="dashboard-btn secondary" onclick="window.chatbot?.updateHabitsPrompt()">📝 Update Habits</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        modal.querySelector('.stats-modal-close').addEventListener('click', () => {
            modal.classList.remove('show');
            setTimeout(() => modal.remove(), 300);
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('show');
                setTimeout(() => modal.remove(), 300);
            }
        });
    }

    // Show Calendar
    showCalendar() {
        const today = new Date();
        const monthView = this.calendar.getMonthView(today.getFullYear(), today.getMonth());
        const todayReminders = this.calendar.getTodayReminders();
        
        const modal = document.createElement('div');
        modal.className = 'stats-modal show';
        modal.innerHTML = `
            <div class="stats-modal-content calendar-content">
                <div class="modal-header">
                    <h2>📅 Meal Planning Calendar</h2>
                    <button class="stats-modal-close">&times;</button>
                </div>
                
                <div class="calendar-section">
                    <div class="calendar-header">
                        <h3>${today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h3>
                        <button class="calendar-action-btn" onclick="window.chatbot?.generateMealPlan()">📋 Generate Weekly Plan</button>
                    </div>
                    
                    <div class="calendar-grid">
                        ${monthView.days.map(day => {
                            const isToday = day.dateKey === this.calendar.formatDate(today);
                            const mealPlan = this.calendar.getMealPlan(new Date(day.dateKey));
                            return `
                                <div class="calendar-day ${isToday ? 'today' : ''} ${day.hasMealPlan ? 'has-meal' : ''}">
                                    <div class="calendar-day-number">${day.date}</div>
                                    ${mealPlan ? `
                                        <div class="calendar-meals">
                                            <div class="calendar-meal-item">🍳 ${mealPlan.breakfast.substring(0, 20)}...</div>
                                            <div class="calendar-meal-item">🍽️ ${mealPlan.lunch.substring(0, 20)}...</div>
                                            <div class="calendar-meal-item">🌙 ${mealPlan.dinner.substring(0, 20)}...</div>
                                        </div>
                                    ` : ''}
                                    ${day.hasAppointment ? '<div class="calendar-appointment">📅</div>' : ''}
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>

                ${todayReminders.length > 0 ? `
                <div class="calendar-section">
                    <h3 class="section-title">
                        <span class="section-icon">⏰</span>
                        Today's Reminders
                    </h3>
                    <div class="reminders-list">
                        ${todayReminders.map(reminder => `
                            <div class="reminder-item">
                                <span class="reminder-time">${reminder.time}</span>
                                <span class="reminder-message">${reminder.message}</span>
                                <span class="reminder-type">${reminder.type}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                ` : ''}

                <div class="calendar-actions">
                    <button class="dashboard-btn" onclick="window.chatbot?.addReminderPrompt()">➕ Add Reminder</button>
                    <button class="dashboard-btn secondary" onclick="window.chatbot?.viewGroceryList()">🛒 Grocery List</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        modal.querySelector('.stats-modal-close').addEventListener('click', () => {
            modal.classList.remove('show');
            setTimeout(() => modal.remove(), 300);
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('show');
                setTimeout(() => modal.remove(), 300);
            }
        });
    }

    // Helper methods for dashboard actions
    logMealPrompt() {
        // Close dashboard modal if open
        const modal = document.querySelector('.stats-modal.show');
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => modal.remove(), 300);
        }
        
        this.addMessage('bot', 'What did you have for your meal? I\'ll log it and update your dashboard!', false, [
            'Breakfast: Oatmeal with berries',
            'Lunch: Grilled chicken salad',
            'Dinner: Salmon with vegetables'
        ]);
    }

    updateHabitsPrompt() {
        // Close dashboard modal if open
        const modal = document.querySelector('.stats-modal.show');
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => modal.remove(), 300);
        }
        
        this.addMessage('bot', 'What would you like to update?', false, [
            'Add fruits/veggies',
            'Log steps',
            'Update sleep hours'
        ]);
    }

    generateMealPlan() {
        // Close calendar modal if open
        const modal = document.querySelector('.stats-modal.show');
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => modal.remove(), 300);
        }
        
        const weekPlan = this.calendar.generateWeeklyMealPlan();
        this.addMessage('bot', '✅ I\'ve generated a 7-day meal plan for you! Check your calendar to see the meals. Would you like me to set reminders?', false, [
            'Yes, set reminders',
            'Show grocery list',
            'No thanks'
        ]);
        
        // Show calendar again after a moment
        setTimeout(() => {
            this.showCalendar();
        }, 500);
    }

    addReminderPrompt() {
        // Close calendar modal if open
        const modal = document.querySelector('.stats-modal.show');
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => modal.remove(), 300);
        }
        
        this.addMessage('bot', 'What type of reminder would you like to set?', false, [
            'Water reminder',
            'Meal reminder',
            'Meal prep reminder'
        ]);
    }

    viewGroceryList() {
        // Close calendar modal if open
        const modal = document.querySelector('.stats-modal.show');
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => modal.remove(), 300);
        }
        
        const today = new Date();
        const groceryList = this.calendar.generateGroceryList(today, 7);
        
        if (groceryList.length > 0) {
            this.addMessage('bot', `🛒 Your Weekly Grocery List:\n\n${groceryList.map(item => `• ${item.charAt(0).toUpperCase() + item.slice(1)}`).join('\n')}\n\nWant me to add anything else?`, false);
        } else {
            this.addMessage('bot', 'No meal plans found. Generate a weekly meal plan first to create a grocery list!', false);
        }
    }

    // Show trending alert
    showTrendingAlert(alert) {
        const myth = EVIDENCE_DB.myths[alert.id];
        if (!myth) return;

        const alertHtml = `
            <div class="trending-alert">
                <div class="trending-alert-header">
                    <span class="trending-badge">🔥 TRENDING</span>
                    <button class="alert-close" onclick="this.parentElement.parentElement.remove()">&times;</button>
                </div>
                <div class="trending-alert-content">
                    <p class="trending-alert-message">${alert.alertMessage}</p>
                    <div class="trending-alert-myth">
                        <strong>Myth:</strong> "${myth.myth}"
                    </div>
                    <div class="trending-alert-truth">
                        <strong>Truth:</strong> ${myth.debunk}
                    </div>
                    <div class="trending-alert-actions">
                        <button class="alert-btn" onclick="window.chatbot?.showMythComparison('${alert.id}')">Compare Myth vs Fact</button>
                        <button class="alert-btn secondary" onclick="window.chatbot?.markAlertSeen('${alert.id}')">Got it, thanks!</button>
                    </div>
                </div>
            </div>
        `;

        this.addMessage('bot', alertHtml, true);
        
        // Mark as seen after user interacts
        setTimeout(() => {
            const closeBtn = this.messagesContainer.querySelector('.alert-close');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    if (this.trendingMyths) {
                        this.trendingMyths.markAlertSeen(alert.id);
                    }
                });
            }
        }, 100);
    }

    // Show daily myth debunk
    showDailyMythDebunk(dailyMyth) {
        const myth = dailyMyth.myth;
        const mythHtml = `
            <div class="daily-myth-debunk">
                <div class="daily-myth-header">
                    <span class="daily-badge">📚 Daily Myth Debunk</span>
                </div>
                <div class="daily-myth-content">
                    <p class="daily-myth-intro">Let's debunk a common nutrition myth today!</p>
                    <div class="daily-myth-box">
                        <div class="myth-side">
                            <h4>❌ The Myth</h4>
                            <p>"${myth.myth}"</p>
                        </div>
                        <div class="fact-side">
                            <h4>✅ The Truth</h4>
                            <p>${myth.debunk}</p>
                        </div>
                    </div>
                    <div class="daily-myth-science">
                        <strong>Science:</strong> ${myth.science}
                    </div>
                    <div class="daily-myth-actions">
                        <button class="alert-btn" onclick="window.chatbot?.showMythComparison('${dailyMyth.mythKey}')">See Full Comparison</button>
                        <button class="alert-btn secondary" onclick="this.parentElement.parentElement.parentElement.remove()">Thanks!</button>
                    </div>
                </div>
            </div>
        `;

        this.addMessage('bot', mythHtml, true);
    }

    // Show product safety check
    showProductSafetyCheck(product) {
        const safetyColor = this.productSafety.getSafetyColor(product.safetyRating);
        const effectivenessColor = this.productSafety.getSafetyColor(product.effectivenessRating);
        
        const modal = document.createElement('div');
        modal.className = 'stats-modal show';
        modal.innerHTML = `
            <div class="stats-modal-content product-safety-content">
                <div class="modal-header">
                    <h2>🔍 Product Safety Check</h2>
                    <button class="stats-modal-close">&times;</button>
                </div>
                
                <div class="product-safety-section">
                    <h3 class="product-name">${product.name}</h3>
                    
                    <div class="safety-ratings">
                        <div class="rating-card">
                            <div class="rating-label">Safety Rating</div>
                            <div class="rating-value" style="color: ${safetyColor}">
                                ${'⭐'.repeat(product.safetyRating)}${'☆'.repeat(5 - product.safetyRating)}
                            </div>
                            <div class="rating-description">${product.safetyRating <= 2 ? '⚠️ Use with caution' : product.safetyRating === 3 ? '⚠️ Moderate safety concerns' : '✅ Generally safe'}</div>
                        </div>
                        <div class="rating-card">
                            <div class="rating-label">Effectiveness</div>
                            <div class="rating-value" style="color: ${effectivenessColor}">
                                ${'⭐'.repeat(product.effectivenessRating)}${'☆'.repeat(5 - product.effectivenessRating)}
                            </div>
                            <div class="rating-description">${product.effectivenessRating <= 2 ? '❌ Limited evidence' : product.effectivenessRating === 3 ? '⚠️ Some evidence' : '✅ Proven effective'}</div>
                        </div>
                    </div>

                    <div class="evidence-badge ${product.evidence}">
                        <span class="evidence-icon">${product.evidence === 'weak' ? '❌' : product.evidence === 'moderate' ? '⚠️' : '✅'}</span>
                        <span class="evidence-label">${product.evidence.charAt(0).toUpperCase() + product.evidence.slice(1)} Evidence</span>
                    </div>

                    ${product.warnings && product.warnings.length > 0 ? `
                    <div class="warnings-section">
                        <h4>⚠️ Warnings</h4>
                        <ul class="warnings-list">
                            ${product.warnings.map(warning => `<li>${warning}</li>`).join('')}
                        </ul>
                    </div>
                    ` : ''}

                    ${product.alternatives && product.alternatives.length > 0 ? `
                    <div class="alternatives-section">
                        <h4>✅ Evidence-Based Alternatives</h4>
                        <ul class="alternatives-list">
                            ${product.alternatives.map(alt => `<li>${alt}</li>`).join('')}
                        </ul>
                    </div>
                    ` : ''}

                    ${product.costAnalysis ? `
                    <div class="cost-analysis-section">
                        <h4>💰 Cost Analysis</h4>
                        <div class="cost-comparison">
                            <div class="cost-item">
                                <span class="cost-label">Average Cost:</span>
                                <span class="cost-value">${product.costAnalysis.averageCost}</span>
                            </div>
                            <div class="cost-item">
                                <span class="cost-label">Value:</span>
                                <span class="cost-value poor">${product.costAnalysis.value}</span>
                            </div>
                            <div class="cost-item better">
                                <span class="cost-label">Better Alternative:</span>
                                <span class="cost-value">${product.costAnalysis.betterAlternative}</span>
                            </div>
                        </div>
                    </div>
                    ` : ''}

                    ${product.sources && product.sources.length > 0 ? `
                    <div class="sources-section">
                        <h4>📚 Sources</h4>
                        <div class="sources-list">
                            ${product.sources.map(source => {
                                const credibility = this.sourceCredibility.rateSource(source.name);
                                return `
                                    <div class="source-item">
                                        <div class="source-name">${source.name}</div>
                                        <div class="source-credibility">
                                            <span class="credibility-badge tier-${credibility.tier.replace(' ', '-').toLowerCase()}">
                                                ${credibility.tier} • ${'⭐'.repeat(credibility.rating)}
                                            </span>
                                        </div>
                                        ${source.url ? `<a href="${source.url}" target="_blank" class="source-link">View Source →</a>` : ''}
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                    ` : ''}
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        modal.querySelector('.stats-modal-close').addEventListener('click', () => {
            modal.classList.remove('show');
            setTimeout(() => modal.remove(), 300);
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('show');
                setTimeout(() => modal.remove(), 300);
            }
        });
    }

    // Show myth comparison (Myth vs Fact)
    showMythComparison(mythKey) {
        const myth = EVIDENCE_DB.myths[mythKey];
        if (!myth) return;

        // Close any open modals
        document.querySelectorAll('.stats-modal.show').forEach(modal => {
            modal.classList.remove('show');
            setTimeout(() => modal.remove(), 300);
        });

        const evidenceStrength = this.sourceCredibility.determineEvidenceStrength(myth.sources);
        const credibilityBadges = myth.sources.map(source => 
            this.sourceCredibility.formatSourceWithCredibility(source)
        );

        const modal = document.createElement('div');
        modal.className = 'stats-modal show';
        modal.innerHTML = `
            <div class="stats-modal-content comparison-content">
                <div class="modal-header">
                    <h2>⚖️ Myth vs Fact Comparison</h2>
                    <button class="stats-modal-close">&times;</button>
                </div>
                
                <div class="comparison-container">
                    <div class="comparison-side myth-side">
                        <div class="side-header myth-header">
                            <span class="side-icon">❌</span>
                            <h3>The Myth</h3>
                        </div>
                        <div class="side-content">
                            <p class="myth-text">"${myth.myth}"</p>
                            <div class="myth-reasons">
                                <h4>Why people believe this:</h4>
                                <p>${myth.whyBelieve}</p>
                            </div>
                        </div>
                    </div>

                    <div class="comparison-divider">
                        <div class="vs-badge">VS</div>
                    </div>

                    <div class="comparison-side fact-side">
                        <div class="side-header fact-header">
                            <span class="side-icon">✅</span>
                            <h3>The Fact</h3>
                        </div>
                        <div class="side-content">
                            <p class="fact-text">${myth.debunk}</p>
                            <div class="fact-science">
                                <h4>What science shows:</h4>
                                <p>${myth.science}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="evidence-strength-section">
                    <div class="evidence-badge ${evidenceStrength.label.toLowerCase().replace(' ', '-')}">
                        <span class="evidence-icon">${evidenceStrength.icon}</span>
                        <div class="evidence-info">
                            <div class="evidence-label">${evidenceStrength.label}</div>
                            <div class="evidence-description">${evidenceStrength.description}</div>
                        </div>
                    </div>
                </div>

                ${myth.swaps && myth.swaps.length > 0 ? `
                <div class="swaps-section">
                    <h3 class="section-title">
                        <span class="section-icon">🔄</span>
                        Healthy Swaps
                    </h3>
                    <div class="swaps-grid">
                        ${myth.swaps.map(swap => {
                            const [from, to] = swap.split(' → ');
                            return `
                                <div class="swap-card">
                                    <div class="swap-from">${from || swap}</div>
                                    <div class="swap-arrow">→</div>
                                    <div class="swap-to">${to || ''}</div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
                ` : ''}

                <div class="sources-section">
                    <h3 class="section-title">
                        <span class="section-icon">📚</span>
                        Evidence Sources
                    </h3>
                    <div class="sources-grid">
                        ${credibilityBadges.map(badge => `
                            <div class="source-card">
                                <div class="source-name">${badge.name}</div>
                                <div class="source-credibility-badge tier-${badge.tier.replace(' ', '-').toLowerCase()}">
                                    <span class="credibility-stars">${'⭐'.repeat(badge.rating)}${'☆'.repeat(5 - badge.rating)}</span>
                                    <span class="credibility-tier">${badge.tier}</span>
                                </div>
                                ${badge.url ? `<a href="${badge.url}" target="_blank" class="source-link">View Source →</a>` : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        modal.querySelector('.stats-modal-close').addEventListener('click', () => {
            modal.classList.remove('show');
            setTimeout(() => modal.remove(), 300);
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('show');
                setTimeout(() => modal.remove(), 300);
            }
        });
    }

    // Format sources with credibility
    formatSourcesWithCredibility(sources) {
        if (!sources || sources.length === 0) return '';
        
        let formatted = '\n\n**📚 Sources & Credibility:**\n\n';
        
        sources.forEach(source => {
            const credibility = this.sourceCredibility.formatSourceWithCredibility(source);
            const badge = this.sourceCredibility.getCredibilityBadge(credibility);
            
            formatted += `• **${credibility.name}** ${badge.stars} (${badge.tier})\n`;
            if (source.url) {
                formatted += `  [${source.text || 'View source'}](${source.url})\n`;
            }
        });
        
        return formatted;
    }

    // Mark alert as seen
    markAlertSeen(alertId) {
        if (this.trendingMyths) {
            this.trendingMyths.markAlertSeen(alertId);
        }
        // Remove the alert message
        const messages = this.messagesContainer.querySelectorAll('.message.bot');
        if (messages.length > 0) {
            const lastMessage = messages[messages.length - 1];
            if (lastMessage.querySelector('.trending-alert')) {
                lastMessage.remove();
            }
        }
    }

    // Show misinformation tracker stats
    showMisinformationTracker() {
        const stats = this.misinformationTracker.getStats();
        const progress = this.misinformationTracker.getLearningProgress();
        const savings = this.productSafety.calculateSavings(
            this.misinformationTracker.data.fadProductsChecked.map(p => p.productName)
        );

        const modal = document.createElement('div');
        modal.className = 'stats-modal show';
        modal.innerHTML = `
            <div class="stats-modal-content tracker-content">
                <div class="modal-header">
                    <h2>🛡️ Misinformation Tracker</h2>
                    <button class="stats-modal-close">&times;</button>
                </div>
                
                <div class="tracker-hero">
                    <div class="tracker-card">
                        <div class="tracker-icon">🎓</div>
                        <div class="tracker-content">
                            <div class="tracker-label">Learning Level</div>
                            <div class="tracker-value">${progress.level}</div>
                            <div class="tracker-progress">
                                <div class="tracker-progress-bar" style="width: ${progress.progress}%"></div>
                            </div>
                            <div class="tracker-subtext">${progress.mythsToNextLevel} myths to next level</div>
                        </div>
                    </div>
                    <div class="tracker-card">
                        <div class="tracker-icon">✅</div>
                        <div class="tracker-content">
                            <div class="tracker-label">Myths Debunked</div>
                            <div class="tracker-value">${stats.totalMythsDebunked}</div>
                            <div class="tracker-subtext">${stats.debunkRate}% debunk rate</div>
                        </div>
                    </div>
                    <div class="tracker-card">
                        <div class="tracker-icon">💰</div>
                        <div class="tracker-content">
                            <div class="tracker-label">Money Saved</div>
                            <div class="tracker-value">$${savings.moneyWasted.toFixed(0)}</div>
                            <div class="tracker-subtext">Avoided fad products</div>
                        </div>
                    </div>
                </div>

                <div class="tracker-section">
                    <h3 class="section-title">
                        <span class="section-icon">📊</span>
                        Statistics
                    </h3>
                    <div class="tracker-stats-grid">
                        <div class="tracker-stat-item">
                            <div class="stat-icon">🔍</div>
                            <div class="stat-info">
                                <div class="stat-label">Myths Encountered</div>
                                <div class="stat-value">${stats.totalMythsEncountered}</div>
                            </div>
                        </div>
                        <div class="tracker-stat-item">
                            <div class="stat-icon">🚨</div>
                            <div class="stat-info">
                                <div class="stat-label">Fad Products Checked</div>
                                <div class="stat-value">${stats.fadProductsChecked}</div>
                            </div>
                        </div>
                        <div class="tracker-stat-item">
                            <div class="stat-icon">📱</div>
                            <div class="stat-info">
                                <div class="stat-label">Social Media Claims</div>
                                <div class="stat-value">${stats.socialMediaClaimsChecked}</div>
                            </div>
                        </div>
                        <div class="tracker-stat-item">
                            <div class="stat-icon">📅</div>
                            <div class="stat-info">
                                <div class="stat-label">Days Active</div>
                                <div class="stat-value">${stats.daysActive}</div>
                            </div>
                        </div>
                    </div>
                </div>

                ${stats.recentDebunks.length > 0 ? `
                <div class="tracker-section">
                    <h3 class="section-title">
                        <span class="section-icon">✅</span>
                        Recently Debunked
                    </h3>
                    <div class="recent-myths-list">
                        ${stats.recentDebunks.map(debunk => {
                            const myth = EVIDENCE_DB.myths[debunk.mythId];
                            return `
                                <div class="recent-myth-item">
                                    <div class="recent-myth-icon">✅</div>
                                    <div class="recent-myth-content">
                                        <div class="recent-myth-text">"${myth ? myth.myth : debunk.myth}"</div>
                                        <div class="recent-myth-date">${new Date(debunk.timestamp).toLocaleDateString()}</div>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
                ` : ''}
            </div>
        `;

        document.body.appendChild(modal);

        modal.querySelector('.stats-modal-close').addEventListener('click', () => {
            modal.classList.remove('show');
            setTimeout(() => modal.remove(), 300);
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('show');
                setTimeout(() => modal.remove(), 300);
            }
        });
    }
}

// Make chatbot accessible globally for button callbacks
window.chatbot = null;

// Initialize chatbot when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.chatbot = new NutritionChatbot();
});
