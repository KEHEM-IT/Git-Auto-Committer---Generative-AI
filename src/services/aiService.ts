import * as vscode from 'vscode';
import fetch from 'node-fetch';
import { AIProviderType } from '../types';

export class AIService {
    static async generateCommitMessage(files: string[], diff: string): Promise<string> {
        const config = vscode.workspace.getConfiguration('gitAutoCommit');
        const provider = config.get('aiProvider', 'openai') as AIProviderType;
        const model = config.get('aiModel', 'gpt-4o-mini') as string;
        const commitStyle = config.get('commitMessageStyle', 'conventional') as string;

        // Read file contents for better context
        const fileContents = await this.readFileContents(files);

        let apiKey = '';
        let apiUrl = '';
        let headers: any = {};
        let body: any = {};

        const stylePrompt = this.getStylePrompt(commitStyle);
        const contextPrompt = `Generate a commit message for these changes:\n\nFiles changed:\n${files.join('\n')}\n\nFile contents preview:\n${fileContents}\n\nDiff summary:\n${diff.substring(0, 1500)}\n\n${stylePrompt}`;

        switch (provider) {
            case 'openai':
                apiKey = config.get('openaiApiKey', '') as string;
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
                            content: 'You are an expert software developer who writes clear, meaningful git commit messages. Analyze the code changes and write human-readable commit messages that explain WHAT changed and WHY, not just WHICH files.'
                        },
                        {
                            role: 'user',
                            content: contextPrompt
                        }
                    ],
                    max_tokens: commitStyle === 'detailed' ? 300 : 150,
                    temperature: 0.7
                };
                break;

            case 'anthropic':
                apiKey = config.get('anthropicApiKey', '') as string;
                apiUrl = 'https://api.anthropic.com/v1/messages';
                headers = {
                    'Content-Type': 'application/json',
                    'x-api-key': apiKey,
                    'anthropic-version': '2023-06-01'
                };
                body = {
                    model: model || 'claude-3-5-sonnet-20241022',
                    max_tokens: commitStyle === 'detailed' ? 300 : 150,
                    messages: [
                        {
                            role: 'user',
                            content: contextPrompt + '\n\nRespond with ONLY the commit message, nothing else.'
                        }
                    ]
                };
                break;

            case 'gemini':
                apiKey = config.get('geminiApiKey', '') as string;
                apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model || 'gemini-pro'}:generateContent?key=${apiKey}`;
                headers = {
                    'Content-Type': 'application/json'
                };
                body = {
                    contents: [
                        {
                            parts: [
                                {
                                    text: contextPrompt + '\n\nRespond with ONLY the commit message.'
                                }
                            ]
                        }
                    ]
                };
                break;

            case 'openrouter':
                apiKey = config.get('openrouterApiKey', '') as string;
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
                            content: contextPrompt
                        }
                    ],
                    max_tokens: commitStyle === 'detailed' ? 300 : 150
                };
                break;
        }

        if (!apiKey) {
            throw new Error(`No API key configured for ${provider}. Please configure it in settings.`);
        }

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`API request failed: ${response.status} ${errorText}`);
            }

            const data: any = await response.json();
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
        } catch (error) {
            throw new Error(`AI generation failed: ${error}`);
        }
    }

    private static getStylePrompt(style: string): string {
        switch (style) {
            case 'conventional':
                return 'Use conventional commit format (feat:, fix:, docs:, style:, refactor:, test:, chore:). Write a clear, concise message explaining what functionality changed.';
            case 'simple':
                return 'Write a simple, clear commit message in present tense. Focus on what changed functionally, not which files.';
            case 'detailed':
                return 'Write a detailed commit message with a summary line, followed by bullet points explaining the changes, their purpose, and any important details.';
            default:
                return 'Write a clear, meaningful commit message.';
        }
    }

    private static async readFileContents(files: string[]): Promise<string> {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) return '';

        const contents: string[] = [];
        const filesToRead = files.slice(0, 3); // Read first 3 files for context

        for (const file of filesToRead) {
            try {
                const filePath = vscode.Uri.joinPath(workspaceFolder.uri, file);
                const content = await vscode.workspace.fs.readFile(filePath);
                const text = Buffer.from(content).toString('utf8');
                
                // Get last 20 lines or 500 chars for context
                const lines = text.split('\n');
                const preview = lines.slice(-20).join('\n').substring(0, 500);
                
                contents.push(`File: ${file}\nRecent changes:\n${preview}\n`);
            } catch (error) {
                // Skip files that can't be read
                continue;
            }
        }

        return contents.join('\n---\n');
    }

    static generateRuleBasedCommitMessage(files: string[], diff: string): string {
        const config = vscode.workspace.getConfiguration('gitAutoCommit');
        const commitStyle = config.get('commitMessageStyle', 'conventional') as string;

        const analysis = this.analyzeChanges(files);
        let message = '';

        // Determine commit type and message based on analysis
        if (analysis.hasTests) {
            message = 'test: ';
            if (analysis.testCount > 1) {
                message += `update ${analysis.testCount} test files`;
            } else {
                message += 'update test suite';
            }
        } else if (analysis.hasDocs) {
            message = 'docs: ';
            if (analysis.hasReadme) {
                message += 'update README documentation';
            } else {
                message += 'update documentation';
            }
        } else if (analysis.hasConfig) {
            message = 'chore: ';
            message += this.getConfigMessage(files);
        } else if (analysis.hasStyles) {
            message = 'style: ';
            message += this.getStyleMessage(files);
        } else if (analysis.hasCode) {
            message = 'feat: ';
            message += this.getCodeMessage(files, analysis);
        } else {
            message = 'chore: ';
            message += `update ${files.length} file${files.length > 1 ? 's' : ''}`;
        }

        // Add details based on style
        if (commitStyle === 'detailed') {
            message += '\n\n' + this.getDetailedDescription(files, analysis);
        } else if (commitStyle !== 'simple') {
            message += '\n\n' + this.getFileList(files);
        }

        return message;
    }

    private static analyzeChanges(files: string[]): any {
        const analysis = {
            hasTests: false,
            testCount: 0,
            hasDocs: false,
            hasReadme: false,
            hasConfig: false,
            hasStyles: false,
            hasCode: false,
            fileTypes: new Set<string>(),
            directories: new Set<string>(),
            functions: [] as string[]
        };

        files.forEach(file => {
            const lower = file.toLowerCase();
            const ext = file.split('.').pop()?.toLowerCase() || '';
            
            // Analyze file type
            if (ext) analysis.fileTypes.add(ext);
            
            // Get directory
            const dir = file.split('/')[0];
            if (dir) analysis.directories.add(dir);

            // Check patterns
            if (lower.includes('test') || lower.includes('spec')) {
                analysis.hasTests = true;
                analysis.testCount++;
            }
            if (lower.includes('readme') || lower.includes('doc')) {
                analysis.hasDocs = true;
                if (lower.includes('readme')) analysis.hasReadme = true;
            }
            if (lower.includes('config') || ext === 'json' || ext === 'yaml' || ext === 'yml' || ext === 'toml') {
                analysis.hasConfig = true;
            }
            if (ext === 'css' || ext === 'scss' || ext === 'sass' || ext === 'less') {
                analysis.hasStyles = true;
            }
            if (['ts', 'js', 'jsx', 'tsx', 'py', 'java', 'go', 'rs', 'cpp', 'c'].includes(ext)) {
                analysis.hasCode = true;
            }

            // Extract function/component names from filename
            const fileName = file.split('/').pop()?.replace(/\.(ts|js|tsx|jsx|py|java)$/, '') || '';
            if (fileName && !fileName.includes('index') && !fileName.includes('test')) {
                analysis.functions.push(fileName);
            }
        });

        return analysis;
    }

    private static getConfigMessage(files: string[]): string {
        const configFiles = files.filter(f => 
            f.toLowerCase().includes('config') || 
            f.endsWith('.json') || 
            f.endsWith('.yaml') || 
            f.endsWith('.yml')
        );

        if (configFiles.some(f => f.includes('package.json'))) {
            return 'update project dependencies';
        }
        if (configFiles.some(f => f.includes('tsconfig') || f.includes('jsconfig'))) {
            return 'update TypeScript configuration';
        }
        if (configFiles.some(f => f.includes('eslint') || f.includes('prettier'))) {
            return 'update code formatting rules';
        }
        return 'update configuration files';
    }

    private static getStyleMessage(files: string[]): string {
        if (files.some(f => f.includes('global') || f.includes('main') || f.includes('app'))) {
            return 'update global styles';
        }
        if (files.some(f => f.includes('component') || f.includes('module'))) {
            return 'update component styles';
        }
        if (files.length === 1) {
            const name = files[0].split('/').pop()?.replace(/\.(css|scss|sass)$/, '') || 'styles';
            return `update ${name} styling`;
        }
        return 'update styles';
    }

    private static getCodeMessage(files: string[], analysis: any): string {
        // Try to infer what functionality was updated
        const functions = analysis.functions.filter((f: string) => f.length > 0);
        
        if (functions.length === 1) {
            const funcName = this.humanizeFileName(functions[0]);
            return `update ${funcName} functionality`;
        }
        if (functions.length === 2) {
            return `update ${this.humanizeFileName(functions[0])} and ${this.humanizeFileName(functions[1])}`;
        }
        if (functions.length > 2) {
            return `update ${this.humanizeFileName(functions[0])} and ${functions.length - 1} other modules`;
        }

        // Fallback to directory-based message
        if (analysis.directories.size === 1) {
            const dir = Array.from(analysis.directories)[0];
            return `update ${dir} module`;
        }

        // Fallback to file type
        const types = Array.from(analysis.fileTypes);
        if (types.length === 1) {
            return `update ${types[0]} implementation`;
        }

        return 'update core functionality';
    }

    private static humanizeFileName(fileName: string): string {
        // Convert camelCase or PascalCase to readable text
        return fileName
            .replace(/([A-Z])/g, ' $1')
            .replace(/[-_]/g, ' ')
            .toLowerCase()
            .trim();
    }

    private static getDetailedDescription(files: string[], analysis: any): string {
        const lines: string[] = ['Changes:'];
        
        if (analysis.hasCode) {
            const functions = analysis.functions.slice(0, 3);
            if (functions.length > 0) {
                lines.push(`- Updated ${functions.map((f: string) => this.humanizeFileName(f)).join(', ')}`);
            }
        }

        if (analysis.hasConfig) {
            lines.push('- Modified configuration settings');
        }

        if (analysis.hasStyles) {
            lines.push('- Updated styling and visual elements');
        }

        const dirs = Array.from(analysis.directories).slice(0, 3);
        if (dirs.length > 0) {
            lines.push(`- Affected modules: ${dirs.join(', ')}`);
        }

        lines.push('');
        lines.push('Modified files:');
        files.slice(0, 5).forEach(f => lines.push(`- ${f}`));
        if (files.length > 5) {
            lines.push(`- ... and ${files.length - 5} more files`);
        }

        return lines.join('\n');
    }

    private static getFileList(files: string[]): string {
        if (files.length <= 3) {
            return files.map(f => `- ${f}`).join('\n');
        }
        return files.slice(0, 3).map(f => `- ${f}`).join('\n') + `\n- ... and ${files.length - 3} more files`;
    }
}
