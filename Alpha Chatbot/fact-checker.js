// Real-Time Fact-Checker for Social Media Claims
// Detects and fact-checks claims users mention from social media or viral trends

class FactChecker {
    constructor(evidenceDB, ragPipeline) {
        this.evidenceDB = evidenceDB;
        this.ragPipeline = ragPipeline;
        
        // Phrases that indicate social media claims
        this.socialMediaIndicators = [
            'i saw on', 'i heard', 'someone said', 'i read', 'i saw that',
            'tiktok says', 'instagram says', 'facebook says', 'twitter says',
            'youtube says', 'influencer', 'viral', 'trending', 'everyone says',
            'people say', 'they say', 'apparently', 'supposedly', 'rumor',
            'my friend said', 'i was told', 'i saw a video', 'i saw a post'
        ];
        
        // Fad product keywords
        this.fadProductKeywords = [
            'detox tea', 'weight loss tea', 'fat burner', 'metabolism booster',
            'cleanse', 'detox supplement', 'miracle', 'instant', 'guaranteed',
            'lose weight fast', 'burn fat fast', 'flat tummy tea', 'skinny tea',
            'appetite suppressant', 'carb blocker', 'fat blocker'
        ];
        
        // Unproven claim patterns
        this.unprovenPatterns = [
            /(?:lose|burn|melt)\s+\d+\s*(?:pounds?|kg|lbs?)\s+(?:in|per)\s+\d+\s*(?:days?|weeks?|hours?)/i,
            /(?:guaranteed|proven|scientific|doctor approved)\s+(?:to|will)/i,
            /(?:secret|ancient|miracle|magic)\s+(?:formula|method|trick|tip)/i,
            /(?:one\s+)?(?:simple|easy)\s+(?:trick|tip|way|method)\s+(?:to|for)/i
        ];
    }

    // Check if message contains social media claim indicators
    hasSocialMediaClaim(message) {
        const lowerMessage = message.toLowerCase();
        return this.socialMediaIndicators.some(indicator => 
            lowerMessage.includes(indicator)
        );
    }

    // Detect fad products
    detectFadProduct(message) {
        const lowerMessage = message.toLowerCase();
        const detectedProducts = [];
        
        this.fadProductKeywords.forEach(keyword => {
            if (lowerMessage.includes(keyword)) {
                detectedProducts.push(keyword);
            }
        });
        
        // Check for unproven claim patterns
        const hasUnprovenPattern = this.unprovenPatterns.some(pattern => 
            pattern.test(message)
        );
        
        return {
            isFadProduct: detectedProducts.length > 0 || hasUnprovenPattern,
            products: detectedProducts,
            hasUnprovenClaim: hasUnprovenPattern
        };
    }

    // Extract claim from message
    extractClaim(message) {
        // Look for quoted text
        const quotedMatch = message.match(/"([^"]+)"/);
        if (quotedMatch) {
            return quotedMatch[1];
        }
        
        // Look for "that X" patterns
        const thatMatch = message.match(/that\s+(.+?)(?:\.|$|,)/i);
        if (thatMatch) {
            return thatMatch[1].trim();
        }
        
        // Look for claims after "says", "says that", etc.
        const saysMatch = message.match(/(?:says?|said|claims?|told)\s+(?:that\s+)?(.+?)(?:\.|$|,)/i);
        if (saysMatch) {
            return saysMatch[1].trim();
        }
        
        return null;
    }

    // Fact-check a claim
    async factCheck(claim, originalMessage) {
        const results = {
            claim: claim || originalMessage,
            isMyth: false,
            isFadProduct: false,
            confidence: 0,
            evidence: null,
            sources: [],
            warning: null,
            recommendation: null
        };

        // Check for fad products first
        const fadCheck = this.detectFadProduct(originalMessage);
        if (fadCheck.isFadProduct) {
            results.isFadProduct = true;
            results.warning = '⚠️ This appears to be a fad product or unproven claim.';
            results.recommendation = 'Be cautious of products that promise rapid results. Evidence-based nutrition focuses on sustainable, long-term habits rather than quick fixes.';
            
            // Check if it's a known myth
            const myth = this.evidenceDB.findMyth(originalMessage);
            if (myth) {
                results.isMyth = true;
                results.evidence = myth;
                results.confidence = 0.9;
                results.sources = myth.sources || [];
            }
            
            return results;
        }

        // Check against known myths
        const myth = this.evidenceDB.findMyth(claim || originalMessage);
        if (myth) {
            results.isMyth = true;
            results.evidence = myth;
            results.confidence = 0.95;
            results.sources = myth.sources || [];
            return results;
        }

        // Use RAG to find similar evidence
        if (this.ragPipeline) {
            try {
                const retrieved = await this.ragPipeline.hybridRetrieve(claim || originalMessage, 3);
                if (retrieved.length > 0) {
                    // Check if retrieved items are myths
                    const mythItems = retrieved.filter(item => item.type === 'myth');
                    if (mythItems.length > 0) {
                        results.isMyth = true;
                        results.evidence = mythItems[0];
                        results.confidence = 0.7;
                        results.sources = mythItems[0].metadata?.sources || [];
                    } else {
                        // Found evidence but not a myth - might be factual
                        results.confidence = 0.5;
                        results.evidence = retrieved[0];
                    }
                }
            } catch (error) {
                console.error('Error in RAG fact-check:', error);
            }
        }

        return results;
    }

    // Generate fact-check response
    generateResponse(factCheckResult) {
        if (factCheckResult.isFadProduct && factCheckResult.isMyth) {
            return this.generateFadProductDebunk(factCheckResult);
        } else if (factCheckResult.isMyth) {
            return this.generateMythDebunk(factCheckResult);
        } else if (factCheckResult.isFadProduct) {
            return this.generateFadProductWarning(factCheckResult);
        } else if (factCheckResult.confidence > 0.5) {
            return this.generateEvidenceBasedResponse(factCheckResult);
        } else {
            return this.generateNeutralResponse(factCheckResult);
        }
    }

    generateFadProductDebunk(result) {
        const myth = result.evidence;
        let response = `🚨 **Fad Product Alert + Myth Detected**\n\n`;
        response += `You mentioned: "${result.claim}"\n\n`;
        response += `⚠️ **This is both a fad product claim AND a nutrition myth.**\n\n`;
        response += `**The Myth:** "${myth.myth}"\n\n`;
        response += `**The Truth:** ${myth.debunk}\n\n`;
        response += `**Why this is problematic:**\n`;
        response += `- Fad products often make unproven claims\n`;
        response += `- They can be expensive and ineffective\n`;
        response += `- Some may have safety concerns\n`;
        response += `- Sustainable nutrition doesn't require special products\n\n`;
        response += `**What the science shows:** ${myth.science}\n\n`;
        
        if (myth.swaps && myth.swaps.length > 0) {
            response += `**Better alternatives:**\n`;
            myth.swaps.forEach(swap => {
                response += `• ${swap}\n`;
            });
            response += `\n`;
        }
        
        if (myth.sources && myth.sources.length > 0) {
            response += `**Evidence sources:**\n`;
            myth.sources.forEach(source => {
                response += `• [${source.name}](${source.url}) - ${source.text}\n`;
            });
        }
        
        return response;
    }

    generateMythDebunk(result) {
        const myth = result.evidence;
        let response = `🔍 **Fact-Check Result**\n\n`;
        response += `**Claim:** "${result.claim}"\n\n`;
        response += `❌ **This is a common nutrition myth.**\n\n`;
        response += `**The Truth:** ${myth.debunk}\n\n`;
        response += `**Why people believe this:** ${myth.whyBelieve}\n\n`;
        response += `**What the science shows:** ${myth.science}\n\n`;
        
        if (myth.swaps && myth.swaps.length > 0) {
            response += `**Healthy swaps:**\n`;
            myth.swaps.forEach(swap => {
                response += `• ${swap}\n`;
            });
            response += `\n`;
        }
        
        if (myth.sources && myth.sources.length > 0) {
            response += `**Evidence sources:**\n`;
            myth.sources.forEach(source => {
                response += `• [${source.name}](${source.url}) - ${source.text}\n`;
            });
        }
        
        return response;
    }

    generateFadProductWarning(result) {
        let response = `⚠️ **Fad Product Warning**\n\n`;
        response += `You mentioned: "${result.claim}"\n\n`;
        response += `**This appears to be a fad product or unproven claim.**\n\n`;
        response += `**Red flags:**\n`;
        response += `• Promises rapid or guaranteed results\n`;
        response += `• Uses terms like "miracle," "secret," or "instant"\n`;
        response += `• Lacks strong scientific evidence\n`;
        response += `• Often expensive for unproven benefits\n\n`;
        response += `**Evidence-based approach:**\n`;
        response += `• Focus on whole foods and balanced nutrition\n`;
        response += `• Sustainable habits over quick fixes\n`;
        response += `• Consult healthcare providers before supplements\n`;
        response += `• Be skeptical of products that sound too good to be true\n\n`;
        response += `**Remember:** Your body's natural systems (liver, kidneys) already handle detoxification. No special products are needed.`;
        
        return response;
    }

    generateEvidenceBasedResponse(result) {
        let response = `✅ **Evidence-Based Information**\n\n`;
        response += `**Claim:** "${result.claim}"\n\n`;
        response += `This aligns with evidence-based nutrition guidance.\n\n`;
        
        if (result.evidence && result.evidence.content) {
            response += `${result.evidence.content}\n\n`;
        }
        
        if (result.sources && result.sources.length > 0) {
            response += `**Sources:**\n`;
            result.sources.forEach(source => {
                if (typeof source === 'string') {
                    response += `• ${source}\n`;
                } else {
                    response += `• [${source.name}](${source.url})\n`;
                }
            });
        }
        
        return response;
    }

    generateNeutralResponse(result) {
        let response = `🤔 **Need More Information**\n\n`;
        response += `**Claim:** "${result.claim}"\n\n`;
        response += `I don't have specific evidence about this claim in my database. However, here are some general guidelines:\n\n`;
        response += `**Red flags to watch for:**\n`;
        response += `• Promises of rapid weight loss\n`;
        response += `• "Miracle" or "secret" solutions\n`;
        response += `• Products that claim to "detox" or "cleanse"\n`;
        response += `• Lack of scientific evidence or citations\n\n`;
        response += `**Evidence-based approach:**\n`;
        response += `• Look for information from reputable sources (NHS, WHO, Mayo Clinic)\n`;
        response += `• Be skeptical of claims that sound too good to be true\n`;
        response += `• Consult healthcare providers for personalized advice\n`;
        response += `• Focus on sustainable, balanced nutrition\n\n`;
        response += `Would you like me to help you find evidence-based information about a specific topic?`;
        
        return response;
    }

    // Main fact-check method
    async checkMessage(message) {
        const hasSocialMediaClaim = this.hasSocialMediaClaim(message);
        const claim = this.extractClaim(message);
        const factCheckResult = await this.factCheck(claim, message);
        
        return {
            ...factCheckResult,
            hasSocialMediaClaim: hasSocialMediaClaim,
            extractedClaim: claim,
            response: this.generateResponse(factCheckResult)
        };
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FactChecker;
}

