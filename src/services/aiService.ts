import * as vscode from 'vscode';
import fetch from 'node-fetch';
import { DefaultCommitGenerator } from './defaultCommitGenerator';

interface AIConfig {
    provider: 'openai' | 'anthropic' | 'gemini' | 'openrouter';
    apiKey: string;
    model: string;
}

export class AIService {
    private static async getAIConfig(): Promise<AIConfig> {
        const config = vscode.workspace.getConfiguration('gitAutoCommit');
        return {
            provider: config.get<'openai' | 'anthropic' | 'gemini' | 'openrouter'>('aiProvider', 'openai'),
            apiKey: config.get<string>('aiApiKey', ''),
            model: config.get<string>('aiModel', 'gpt-4o-mini')
        };
    }

    static async generateCommitMessage(diff: string): Promise<string> {
        const config = vscode.workspace.getConfiguration('gitAutoCommit');
        const useAI = config.get('useAIGeneration', false);
        
        // Use default generator if AI is disabled
        if (!useAI) {
            return DefaultCommitGenerator.generate(diff);
        }

        const aiConfig = await this.getAIConfig();
        
        // Use default generator if no API key is configured (no notification)
        if (!aiConfig.apiKey) {
            return DefaultCommitGenerator.generate(diff);
        }

        try {
            const commitStyle = config.get('commitMessageStyle', 'conventional');
            return await this.callAIProvider(aiConfig, diff, commitStyle);
        } catch (error: any) {
            console.error('AI generation error:', error);
            // Silently fallback to default generator
            return DefaultCommitGenerator.generate(diff);
        }
    }

    private static async callAIProvider(aiConfig: AIConfig, diff: string, style: string): Promise<string> {
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

    private static buildPrompt(diff: string, style: string): string {
        const styleInstructions = {
            conventional: 'Use conventional commits format (feat:, fix:, docs:, style:, refactor:, test:, chore:)',
            simple: 'Write a simple, clear commit message',
            detailed: 'Write a detailed commit message with explanation'
        };

        return `Generate a concise commit message for these changes. ${styleInstructions[style as keyof typeof styleInstructions] || styleInstructions.conventional}.

Changes:
${diff}

Return ONLY the commit message, no explanations or formatting.`;
    }

    private static async callOpenAI(aiConfig: AIConfig, prompt: string): Promise<string> {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
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

        const data: any = await response.json();
        return data.choices[0].message.content.trim();
    }

    private static async callAnthropic(aiConfig: AIConfig, prompt: string): Promise<string> {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
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

        const data: any = await response.json();
        return data.content[0].text.trim();
    }

    private static async callGemini(aiConfig: AIConfig, prompt: string): Promise<string> {
        const model = aiConfig.model || 'gemini-pro';
        const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${aiConfig.apiKey}`, {
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

        const data: any = await response.json();
        return data.candidates[0].content.parts[0].text.trim();
    }

    private static async callOpenRouter(aiConfig: AIConfig, prompt: string): Promise<string> {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
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

        const data: any = await response.json();
        return data.choices[0].message.content.trim();
    }

    /**
     * @deprecated Use DefaultCommitGenerator.generate() instead
     * This method is kept for backward compatibility
     */
    private static generateBasicMessage(diff: string): string {
        return DefaultCommitGenerator.generate(diff);
    }
}
