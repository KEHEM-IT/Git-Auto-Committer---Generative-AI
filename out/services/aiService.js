"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIService = void 0;
const vscode = __importStar(require("vscode"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const defaultCommitGenerator_1 = require("./defaultCommitGenerator");
class AIService {
    static async getAIConfig() {
        const config = vscode.workspace.getConfiguration('gitAutoCommit');
        return {
            provider: config.get('aiProvider', 'openai'),
            apiKey: config.get('aiApiKey', ''),
            model: config.get('aiModel', 'gpt-4o-mini')
        };
    }
    static async generateCommitMessage(diff) {
        const config = vscode.workspace.getConfiguration('gitAutoCommit');
        const useAI = config.get('useAIGeneration', false);
        // Use default generator if AI is disabled
        if (!useAI) {
            return defaultCommitGenerator_1.DefaultCommitGenerator.generate(diff);
        }
        const aiConfig = await this.getAIConfig();
        // Use default generator if no API key is configured
        if (!aiConfig.apiKey) {
            vscode.window.showInformationMessage('Using default commit message generator. Configure AI for smarter messages.', 'Configure AI').then(selection => {
                if (selection === 'Configure AI') {
                    vscode.commands.executeCommand('gitAutoCommit.configureAI');
                }
            });
            return defaultCommitGenerator_1.DefaultCommitGenerator.generate(diff);
        }
        try {
            const commitStyle = config.get('commitMessageStyle', 'conventional');
            return await this.callAIProvider(aiConfig, diff, commitStyle);
        }
        catch (error) {
            console.error('AI generation error:', error);
            vscode.window.showWarningMessage(`AI generation failed: ${error.message}. Using default generator.`);
            return defaultCommitGenerator_1.DefaultCommitGenerator.generate(diff);
        }
    }
    static async callAIProvider(aiConfig, diff, style) {
        const prompt = this.buildPrompt(diff, style);
        switch (aiConfig.provider) {
            case 'openai':
                return await this.callOpenAI(aiConfig, prompt);
            case 'anthropic':
                return await this.callAnthropic(aiConfig, prompt);
            case 'gemini':
                return await this.callGemini(aiConfig, prompt);
            case 'openrouter':
                return await this.callOpenRouter(aiConfig, prompt);
            default:
                throw new Error(`Unknown AI provider: ${aiConfig.provider}`);
        }
    }
    static buildPrompt(diff, style) {
        const styleInstructions = {
            conventional: 'Use conventional commits format (feat:, fix:, docs:, style:, refactor:, test:, chore:)',
            simple: 'Write a simple, clear commit message',
            detailed: 'Write a detailed commit message with explanation'
        };
        return `Generate a concise commit message for these changes. ${styleInstructions[style] || styleInstructions.conventional}.

Changes:
${diff}

Return ONLY the commit message, no explanations or formatting.`;
    }
    static async callOpenAI(aiConfig, prompt) {
        const response = await (0, node_fetch_1.default)('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${aiConfig.apiKey}`
            },
            body: JSON.stringify({
                model: aiConfig.model || 'gpt-4o-mini',
                messages: [{ role: 'user', content: prompt }],
                max_tokens: 100,
                temperature: 0.7
            })
        });
        if (!response.ok) {
            const error = await response.text();
            throw new Error(`OpenAI API error: ${error}`);
        }
        const data = await response.json();
        return data.choices[0].message.content.trim();
    }
    static async callAnthropic(aiConfig, prompt) {
        const response = await (0, node_fetch_1.default)('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': aiConfig.apiKey,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: aiConfig.model || 'claude-3-5-sonnet-20241022',
                max_tokens: 100,
                messages: [{ role: 'user', content: prompt }]
            })
        });
        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Anthropic API error: ${error}`);
        }
        const data = await response.json();
        return data.content[0].text.trim();
    }
    static async callGemini(aiConfig, prompt) {
        const model = aiConfig.model || 'gemini-pro';
        const response = await (0, node_fetch_1.default)(`https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${aiConfig.apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });
        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Gemini API error: ${error}`);
        }
        const data = await response.json();
        return data.candidates[0].content.parts[0].text.trim();
    }
    static async callOpenRouter(aiConfig, prompt) {
        const response = await (0, node_fetch_1.default)('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${aiConfig.apiKey}`,
                'HTTP-Referer': 'https://github.com/KEHEM-IT/Git-Auto-Commit-Generator-AI',
                'X-Title': 'Git Auto Commit Generator'
            },
            body: JSON.stringify({
                model: aiConfig.model || 'openai/gpt-4o-mini',
                messages: [{ role: 'user', content: prompt }]
            })
        });
        if (!response.ok) {
            const error = await response.text();
            throw new Error(`OpenRouter API error: ${error}`);
        }
        const data = await response.json();
        return data.choices[0].message.content.trim();
    }
    /**
     * @deprecated Use DefaultCommitGenerator.generate() instead
     * This method is kept for backward compatibility
     */
    static generateBasicMessage(diff) {
        return defaultCommitGenerator_1.DefaultCommitGenerator.generate(diff);
    }
}
exports.AIService = AIService;
//# sourceMappingURL=aiService.js.map