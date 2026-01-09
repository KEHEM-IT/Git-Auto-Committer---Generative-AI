"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.API_KEY_SETUP_INSTRUCTIONS = exports.PROVIDER_NAMES = exports.AI_MODELS = exports.AI_PROVIDERS = void 0;
exports.AI_PROVIDERS = [
    { label: 'OpenAI (ChatGPT)', value: 'openai', description: 'GPT-4, GPT-3.5-turbo models' },
    { label: 'Anthropic (Claude)', value: 'anthropic', description: 'Claude 3.5 Sonnet, Opus' },
    { label: 'Google Gemini', value: 'gemini', description: 'Gemini Pro, Flash models' },
    { label: 'OpenRouter', value: 'openrouter', description: 'Access multiple AI models' }
];
exports.AI_MODELS = {
    'openai': [
        { label: 'GPT-4o Mini (Recommended)', value: 'gpt-4o-mini' },
        { label: 'GPT-4o', value: 'gpt-4o' },
        { label: 'GPT-4 Turbo', value: 'gpt-4-turbo' },
        { label: 'GPT-3.5 Turbo', value: 'gpt-3.5-turbo' }
    ],
    'anthropic': [
        { label: 'Claude 3.5 Sonnet (Recommended)', value: 'claude-3-5-sonnet-20241022' },
        { label: 'Claude 3 Opus', value: 'claude-3-opus-20240229' },
        { label: 'Claude 3 Sonnet', value: 'claude-3-sonnet-20240229' },
        { label: 'Claude 3 Haiku', value: 'claude-3-haiku-20240307' }
    ],
    'gemini': [
        { label: 'Gemini Pro (Recommended)', value: 'gemini-pro' },
        { label: 'Gemini Pro Vision', value: 'gemini-pro-vision' }
    ],
    'openrouter': [
        { label: 'Claude 3.5 Sonnet', value: 'anthropic/claude-3.5-sonnet' },
        { label: 'GPT-4o', value: 'openai/gpt-4o' },
        { label: 'Llama 3.1 405B', value: 'meta-llama/llama-3.1-405b-instruct' },
        { label: 'Gemini Pro 1.5', value: 'google/gemini-pro-1.5' }
    ]
};
exports.PROVIDER_NAMES = {
    'openai': 'OpenAI (ChatGPT)',
    'anthropic': 'Anthropic (Claude)',
    'gemini': 'Google Gemini',
    'openrouter': 'OpenRouter'
};
exports.API_KEY_SETUP_INSTRUCTIONS = {
    'openai': `
📝 How to get OpenAI API Key:
1. Go to https://platform.openai.com/api-keys
2. Sign in or create an account
3. Click "Create new secret key"
4. Copy the key (starts with sk-...)
5. Paste it in the extension settings

💰 Pricing: ~$0.002 per commit with GPT-4o-mini
`,
    'anthropic': `
📝 How to get Anthropic API Key:
1. Go to https://console.anthropic.com/
2. Sign in or create an account
3. Go to API Keys section
4. Click "Create Key"
5. Copy the key (starts with sk-ant-...)
6. Paste it in the extension settings

💰 Pricing: ~$0.003 per commit with Claude 3 Haiku
`,
    'gemini': `
📝 How to get Google Gemini API Key:
1. Go to https://makersuite.google.com/app/apikey
2. Sign in with Google account
3. Click "Create API Key"
4. Copy the key
5. Paste it in the extension settings

💰 Pricing: Free tier available, then pay-as-you-go
`,
    'openrouter': `
📝 How to get OpenRouter API Key:
1. Go to https://openrouter.ai/keys
2. Sign in or create an account
3. Click "Create Key"
4. Copy the key (starts with sk-or-...)
5. Paste it in the extension settings

💰 Pricing: Varies by model, competitive rates
`
};
//# sourceMappingURL=constants.js.map