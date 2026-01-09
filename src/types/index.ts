export interface CommitHistory {
    timestamp: number;
    message: string;
    files: string[];
    hash?: string;
}

export interface AIProvider {
    label: string;
    value: string;
    description: string;
}

export interface AIModel {
    label: string;
    value: string;
}

export type AIProviderType = 'openai' | 'anthropic' | 'gemini' | 'openrouter';
