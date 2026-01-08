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
class AIService {
    static async generateCommitMessage(files, diff) {
        const config = vscode.workspace.getConfiguration('gitAutoCommit');
        const provider = config.get('aiProvider', 'openai');
        const model = config.get('aiModel', 'gpt-4o-mini');
        let apiKey = '';
        let apiUrl = '';
        let headers = {};
        let body = {};
        switch (provider) {
            case 'openai':
                apiKey = config.get('openaiApiKey', '');
                apiUrl = 'https://api.openai.com/v1/chat/completions';
                headers = {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                };
                body = {
                    model: model || 'gpt-4o-mini',
                    messages: [
                        {
                            role: 'system',
                            content: 'You are a helpful assistant that generates concise, meaningful git commit messages following conventional commit format. Keep messages short and focused.'
                        },
                        {
                            role: 'user',
                            content: `Generate a commit message for these changes:\n\nFiles changed:\n${files.join('\n')}\n\nDiff summary:\n${diff.substring(0, 1000)}`
                        }
                    ],
                    max_tokens: 150,
                    temperature: 0.7
                };
                break;
            case 'anthropic':
                apiKey = config.get('anthropicApiKey', '');
                apiUrl = 'https://api.anthropic.com/v1/messages';
                headers = {
                    'Content-Type': 'application/json',
                    'x-api-key': apiKey,
                    'anthropic-version': '2023-06-01'
                };
                body = {
                    model: model || 'claude-3-5-sonnet-20241022',
                    max_tokens: 150,
                    messages: [
                        {
                            role: 'user',
                            content: `Generate a concise git commit message following conventional commit format for these changes:\n\nFiles changed:\n${files.join('\n')}\n\nDiff summary:\n${diff.substring(0, 1000)}\n\nRespond with ONLY the commit message, nothing else.`
                        }
                    ]
                };
                break;
            case 'gemini':
                apiKey = config.get('geminiApiKey', '');
                apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model || 'gemini-pro'}:generateContent?key=${apiKey}`;
                headers = {
                    'Content-Type': 'application/json'
                };
                body = {
                    contents: [
                        {
                            parts: [
                                {
                                    text: `Generate a concise git commit message following conventional commit format for these changes:\n\nFiles changed:\n${files.join('\n')}\n\nDiff summary:\n${diff.substring(0, 1000)}\n\nRespond with ONLY the commit message.`
                                }
                            ]
                        }
                    ]
                };
                break;
            case 'openrouter':
                apiKey = config.get('openrouterApiKey', '');
                apiUrl = 'https://openrouter.ai/api/v1/chat/completions';
                headers = {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                    'HTTP-Referer': 'https://github.com/yourusername/git-auto-commit',
                    'X-Title': 'Git Auto Commit'
                };
                body = {
                    model: model || 'anthropic/claude-3.5-sonnet',
                    messages: [
                        {
                            role: 'user',
                            content: `Generate a concise git commit message following conventional commit format for these changes:\n\nFiles changed:\n${files.join('\n')}\n\nDiff summary:\n${diff.substring(0, 1000)}`
                        }
                    ],
                    max_tokens: 150
                };
                break;
        }
        if (!apiKey) {
            throw new Error(`No API key configured for ${provider}. Please configure it in settings.`);
        }
        try {
            const response = await (0, node_fetch_1.default)(apiUrl, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(body)
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`API request failed: ${response.status} ${errorText}`);
            }
            const data = await response.json();
            let message = '';
            switch (provider) {
                case 'openai':
                case 'openrouter':
                    message = data.choices[0].message.content.trim();
                    break;
                case 'anthropic':
                    message = data.content[0].text.trim();
                    break;
                case 'gemini':
                    message = data.candidates[0].content.parts[0].text.trim();
                    break;
            }
            message = message.replace(/```\w*\n?/g, '').trim();
            return message;
        }
        catch (error) {
            throw new Error(`AI generation failed: ${error}`);
        }
    }
    static generateRuleBasedCommitMessage(files, diff) {
        const fileTypes = new Set();
        const actions = new Set();
        files.forEach(file => {
            const ext = file.split('.').pop()?.toLowerCase();
            if (ext)
                fileTypes.add(ext);
            if (file.includes('test'))
                actions.add('test');
            if (file.includes('config'))
                actions.add('config');
            if (file.includes('README') || file.includes('doc'))
                actions.add('docs');
        });
        let message = '';
        if (actions.has('test')) {
            message = 'test: update test files';
        }
        else if (actions.has('docs')) {
            message = 'docs: update documentation';
        }
        else if (actions.has('config')) {
            message = 'chore: update configuration';
        }
        else if (fileTypes.has('json') || fileTypes.has('yaml') || fileTypes.has('yml')) {
            message = 'chore: update data files';
        }
        else if (fileTypes.has('css') || fileTypes.has('scss') || fileTypes.has('less')) {
            message = 'style: update styles';
        }
        else if (fileTypes.has('ts') || fileTypes.has('js') || fileTypes.has('py') || fileTypes.has('java')) {
            message = `feat: update ${Array.from(fileTypes).join(', ')} files`;
        }
        else {
            message = `chore: update ${files.length} file${files.length > 1 ? 's' : ''}`;
        }
        if (files.length <= 3) {
            message += `\n\n${files.map(f => `- ${f}`).join('\n')}`;
        }
        else {
            message += `\n\n${files.slice(0, 3).map(f => `- ${f}`).join('\n')}\n- and ${files.length - 3} more...`;
        }
        return message;
    }
}
exports.AIService = AIService;
//# sourceMappingURL=aiService.js.map