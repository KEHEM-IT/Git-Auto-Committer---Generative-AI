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
exports.deactivate = exports.activate = void 0;
const vscode = __importStar(require("vscode"));
const cp = __importStar(require("child_process"));
const util_1 = require("util");
const node_fetch_1 = __importDefault(require("node-fetch"));
const execAsync = (0, util_1.promisify)(cp.exec);
let autoCommitTimer;
let reminderTimer;
let commitHistory = [];
let statusBarItem;
function activate(context) {
    console.log('Git Auto Commit extension activated');
    // Load commit history from storage
    commitHistory = context.globalState.get('commitHistory', []);
    // Show welcome message and request permission on first activation
    const hasShownWelcome = context.globalState.get('hasShownWelcome', false);
    if (!hasShownWelcome) {
        showWelcomeAndRequestPermission(context);
    }
    // Create status bar item
    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    statusBarItem.command = 'gitAutoCommit.showDashboard';
    updateStatusBar();
    statusBarItem.show();
    context.subscriptions.push(statusBarItem);
    // Register commands
    context.subscriptions.push(vscode.commands.registerCommand('gitAutoCommit.generateCommit', () => generateAndCommit(context)), vscode.commands.registerCommand('gitAutoCommit.showDashboard', () => showDashboard(context)), vscode.commands.registerCommand('gitAutoCommit.toggleAutoCommit', () => toggleAutoCommit(context)), vscode.commands.registerCommand('gitAutoCommit.configureAI', () => configureAI(context)));
    // Start auto-commit timer if enabled
    const config = vscode.workspace.getConfiguration('gitAutoCommit');
    if (config.get('enableAutoCommit', false)) {
        startAutoCommitTimer(context);
    }
    // Start reminder timer if enabled
    if (config.get('enableReminder', true)) {
        startReminderTimer(context);
    }
    // Listen for configuration changes
    context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(e => {
        if (e.affectsConfiguration('gitAutoCommit')) {
            handleConfigChange(context);
        }
    }));
}
exports.activate = activate;
function updateStatusBar() {
    const config = vscode.workspace.getConfiguration('gitAutoCommit');
    const autoEnabled = config.get('enableAutoCommit', false);
    statusBarItem.text = autoEnabled ? '$(git-commit) Auto-Commit: ON' : '$(git-commit) Auto-Commit: OFF';
    statusBarItem.tooltip = 'Click to view commit dashboard';
}
async function showWelcomeAndRequestPermission(context) {
    const choice = await vscode.window.showInformationMessage('🚀 Welcome to Git Auto Commit! This extension can automatically commit your changes at regular intervals. Would you like to enable auto-commit?', 'Enable Auto-Commit', 'Not Now', 'Learn More');
    if (choice === 'Enable Auto-Commit') {
        const config = vscode.workspace.getConfiguration('gitAutoCommit');
        await config.update('enableAutoCommit', true, vscode.ConfigurationTarget.Global);
        vscode.window.showInformationMessage('✓ Auto-commit enabled! Changes will be committed every 10 minutes. You can adjust settings anytime.', 'Open Settings').then(action => {
            if (action === 'Open Settings') {
                vscode.commands.executeCommand('workbench.action.openSettings', 'gitAutoCommit');
            }
        });
    }
    else if (choice === 'Learn More') {
        vscode.commands.executeCommand('gitAutoCommit.showDashboard');
    }
    await context.globalState.update('hasShownWelcome', true);
}
async function configureAI(context) {
    const config = vscode.workspace.getConfiguration('gitAutoCommit');
    // Step 1: Choose AI provider
    const provider = await vscode.window.showQuickPick([
        { label: 'OpenAI (ChatGPT)', value: 'openai', description: 'GPT-4, GPT-3.5-turbo models' },
        { label: 'Anthropic (Claude)', value: 'anthropic', description: 'Claude 3.5 Sonnet, Opus' },
        { label: 'Google Gemini', value: 'gemini', description: 'Gemini Pro, Flash models' },
        { label: 'OpenRouter', value: 'openrouter', description: 'Access multiple AI models' }
    ], {
        placeHolder: 'Select AI provider'
    });
    if (!provider)
        return;
    await config.update('aiProvider', provider.value, vscode.ConfigurationTarget.Global);
    // Step 2: Enter API key
    const apiKeyField = `${provider.value}ApiKey`;
    const currentKey = config.get(apiKeyField, '');
    const maskedKey = currentKey ? `${currentKey.substring(0, 8)}...` : 'Not set';
    const apiKey = await vscode.window.showInputBox({
        prompt: `Enter your ${provider.label} API key`,
        password: true,
        value: currentKey,
        placeHolder: `Current: ${maskedKey}`,
        validateInput: (value) => {
            if (!value || value.trim().length === 0) {
                return 'API key cannot be empty';
            }
            return null;
        }
    });
    if (!apiKey)
        return;
    await config.update(apiKeyField, apiKey, vscode.ConfigurationTarget.Global);
    // Step 3: Choose model (optional)
    const models = {
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
    const modelOptions = models[provider.value] || [];
    const model = await vscode.window.showQuickPick(modelOptions, {
        placeHolder: 'Select AI model (optional - press Esc to use default)'
    });
    if (model) {
        await config.update('aiModel', model.value, vscode.ConfigurationTarget.Global);
    }
    // Step 4: Enable AI generation
    const enable = await vscode.window.showQuickPick([
        { label: 'Yes', value: true },
        { label: 'No', value: false }
    ], {
        placeHolder: 'Enable AI-powered commit messages?'
    });
    if (enable) {
        await config.update('useAIGeneration', enable.value, vscode.ConfigurationTarget.Global);
    }
    // Show success message
    vscode.window.showInformationMessage(`✓ AI configured: ${provider.label}${model ? ` (${model.label})` : ''}`, 'Test It', 'View Settings').then(action => {
        if (action === 'Test It') {
            vscode.commands.executeCommand('gitAutoCommit.generateCommit');
        }
        else if (action === 'View Settings') {
            vscode.commands.executeCommand('workbench.action.openSettings', 'gitAutoCommit');
        }
    });
}
function getApiKeySetupInstructions(provider) {
    const instructions = {
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
    return instructions[provider] || 'Please refer to the provider\'s documentation.';
}
function handleConfigChange(context) {
    const config = vscode.workspace.getConfiguration('gitAutoCommit');
    // Handle auto-commit toggle
    if (config.get('enableAutoCommit', false)) {
        startAutoCommitTimer(context);
    }
    else {
        stopAutoCommitTimer();
    }
    // Handle reminder toggle
    if (config.get('enableReminder', true)) {
        startReminderTimer(context);
    }
    else {
        stopReminderTimer();
    }
    updateStatusBar();
}
function toggleAutoCommit(context) {
    const config = vscode.workspace.getConfiguration('gitAutoCommit');
    const current = config.get('enableAutoCommit', false);
    config.update('enableAutoCommit', !current, vscode.ConfigurationTarget.Global);
}
function startAutoCommitTimer(context) {
    stopAutoCommitTimer();
    const config = vscode.workspace.getConfiguration('gitAutoCommit');
    const interval = config.get('autoCommitInterval', 10) * 60 * 1000;
    autoCommitTimer = setInterval(() => {
        generateAndCommit(context, true);
    }, interval);
}
function stopAutoCommitTimer() {
    if (autoCommitTimer) {
        clearInterval(autoCommitTimer);
        autoCommitTimer = undefined;
    }
}
function startReminderTimer(context) {
    stopReminderTimer();
    const config = vscode.workspace.getConfiguration('gitAutoCommit');
    const interval = config.get('reminderInterval', 5) * 60 * 1000;
    reminderTimer = setInterval(async () => {
        const hasChanges = await checkForChanges();
        if (hasChanges) {
            const action = await vscode.window.showInformationMessage('You have uncommitted changes. Would you like to commit now?', 'Commit Now', 'Dismiss');
            if (action === 'Commit Now') {
                generateAndCommit(context);
            }
        }
    }, interval);
}
function stopReminderTimer() {
    if (reminderTimer) {
        clearInterval(reminderTimer);
        reminderTimer = undefined;
    }
}
async function checkForChanges() {
    try {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder)
            return false;
        const { stdout } = await execAsync('git status --porcelain', {
            cwd: workspaceFolder.uri.fsPath
        });
        return stdout.trim().length > 0;
    }
    catch {
        return false;
    }
}
async function getGitDiff() {
    try {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder)
            return '';
        const { stdout } = await execAsync('git diff --cached --stat', {
            cwd: workspaceFolder.uri.fsPath
        });
        return stdout;
    }
    catch {
        return '';
    }
}
async function getChangedFiles() {
    try {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder)
            return [];
        const { stdout } = await execAsync('git status --porcelain', {
            cwd: workspaceFolder.uri.fsPath
        });
        return stdout.split('\n')
            .filter(line => line.trim())
            .map(line => line.substring(3));
    }
    catch {
        return [];
    }
}
function generateCommitMessage(files, diff) {
    const config = vscode.workspace.getConfiguration('gitAutoCommit');
    const useAI = config.get('useAIGeneration', false);
    // Simple rule-based commit message generation
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
    // Add file count detail
    if (files.length <= 3) {
        message += `\n\n${files.map(f => `- ${f}`).join('\n')}`;
    }
    else {
        message += `\n\n${files.slice(0, 3).map(f => `- ${f}`).join('\n')}\n- and ${files.length - 3} more...`;
    }
    return message;
}
async function generateAICommitMessage(files, diff) {
    const config = vscode.workspace.getConfiguration('gitAutoCommit');
    const provider = config.get('aiProvider', 'openai');
    const model = config.get('aiModel', 'gpt-4o-mini');
    // Get API key based on provider
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
        // Parse response based on provider
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
        // Clean up the message (remove markdown formatting if present)
        message = message.replace(/```\w*\n?/g, '').trim();
        return message;
    }
    catch (error) {
        throw new Error(`AI generation failed: ${error}`);
    }
}
async function generateAndCommit(context, silent = false) {
    try {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
            if (!silent) {
                vscode.window.showErrorMessage('No workspace folder open');
            }
            return;
        }
        const hasChanges = await checkForChanges();
        if (!hasChanges) {
            if (!silent) {
                vscode.window.showInformationMessage('No changes to commit');
            }
            return;
        }
        const files = await getChangedFiles();
        const diff = await getGitDiff();
        // Check if AI generation is enabled
        const config = vscode.workspace.getConfiguration('gitAutoCommit');
        const useAI = config.get('useAIGeneration', false);
        let commitMessage = '';
        if (useAI) {
            try {
                vscode.window.showInformationMessage('Generating AI commit message...');
                commitMessage = await generateAICommitMessage(files, diff);
            }
            catch (error) {
                vscode.window.showErrorMessage(`AI generation failed: ${error}. Falling back to rule-based generation.`);
                commitMessage = generateCommitMessage(files, diff);
            }
        }
        else {
            commitMessage = generateCommitMessage(files, diff);
        }
        // Stage all changes
        await execAsync('git add .', { cwd: workspaceFolder.uri.fsPath });
        // Show commit message in Source Control input
        const gitExtension = vscode.extensions.getExtension('vscode.git')?.exports;
        const git = gitExtension?.getAPI(1);
        if (git && git.repositories.length > 0) {
            git.repositories[0].inputBox.value = commitMessage;
        }
        const autoCommitEnabled = config.get('enableAutoCommit', false);
        const autoCommitWithoutConfirm = config.get('autoCommitWithoutConfirmation', false);
        // If called from auto-commit timer and auto-commit is enabled
        if (silent && autoCommitEnabled) {
            // Check if we should auto-commit without confirmation
            if (autoCommitWithoutConfirm) {
                await commitChanges(context, commitMessage, files, workspaceFolder.uri.fsPath);
                vscode.window.showInformationMessage(`✓ Auto-committed: ${commitMessage.split('\n')[0]}`);
            }
            else {
                // Show notification with option to commit
                const action = await vscode.window.showInformationMessage(`Auto-commit ready: "${commitMessage.split('\n')[0]}"`, 'Commit Now', 'Skip');
                if (action === 'Commit Now') {
                    await commitChanges(context, commitMessage, files, workspaceFolder.uri.fsPath);
                }
            }
        }
        else if (!silent) {
            // Manual trigger - always ask for confirmation
            const action = await vscode.window.showInformationMessage('Commit message generated and staged. Ready to commit?', 'Commit', 'Edit Message', 'Cancel');
            if (action === 'Commit') {
                await commitChanges(context, commitMessage, files, workspaceFolder.uri.fsPath);
            }
            else if (action === 'Edit Message') {
                vscode.commands.executeCommand('workbench.view.scm');
            }
        }
    }
    catch (error) {
        if (!silent) {
            vscode.window.showErrorMessage(`Failed to generate commit: ${error}`);
        }
    }
}
async function commitChanges(context, message, files, cwd) {
    try {
        const { stdout } = await execAsync(`git commit -m "${message.replace(/"/g, '\\"')}"`, { cwd });
        // Get commit hash
        const { stdout: hash } = await execAsync('git rev-parse --short HEAD', { cwd });
        // Save to history
        const historyEntry = {
            timestamp: Date.now(),
            message: message,
            files: files,
            hash: hash.trim()
        };
        commitHistory.unshift(historyEntry);
        if (commitHistory.length > 50) {
            commitHistory = commitHistory.slice(0, 50);
        }
        await context.globalState.update('commitHistory', commitHistory);
        vscode.window.showInformationMessage(`✓ Committed: ${message.split('\n')[0]}`);
    }
    catch (error) {
        vscode.window.showErrorMessage(`Failed to commit: ${error}`);
    }
}
function showDashboard(context) {
    const panel = vscode.window.createWebviewPanel('commitDashboard', 'Git Commit History', vscode.ViewColumn.One, { enableScripts: true });
    panel.webview.html = getDashboardHtml();
    panel.webview.onDidReceiveMessage(async (message) => {
        switch (message.command) {
            case 'refresh':
                panel.webview.html = getDashboardHtml();
                break;
            case 'clearHistory':
                commitHistory = [];
                await context.globalState.update('commitHistory', []);
                panel.webview.html = getDashboardHtml();
                break;
            case 'configureAI':
                await configureAI(context);
                panel.webview.html = getDashboardHtml();
                break;
            case 'openSettings':
                vscode.commands.executeCommand('workbench.action.openSettings', 'gitAutoCommit');
                break;
        }
    });
}
function getDashboardHtml() {
    const config = vscode.workspace.getConfiguration('gitAutoCommit');
    const autoEnabled = config.get('enableAutoCommit', false);
    const autoWithoutConfirm = config.get('autoCommitWithoutConfirmation', false);
    const interval = config.get('autoCommitInterval', 10);
    const reminderEnabled = config.get('enableReminder', true);
    const reminderInterval = config.get('reminderInterval', 5);
    const useAI = config.get('useAIGeneration', false);
    const aiProvider = config.get('aiProvider', 'openai');
    const aiModel = config.get('aiModel', '');
    // Check if API key is set
    const apiKeyField = `${aiProvider}ApiKey`;
    const hasApiKey = !!config.get(apiKeyField, '');
    const providerNames = {
        'openai': 'OpenAI (ChatGPT)',
        'anthropic': 'Anthropic (Claude)',
        'gemini': 'Google Gemini',
        'openrouter': 'OpenRouter'
    };
    return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body {
            font-family: var(--vscode-font-family);
            padding: 20px;
            color: var(--vscode-foreground);
        }
        h1 { margin-bottom: 30px; }
        .settings {
            background: var(--vscode-editor-background);
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
        }
        .setting-item {
            margin: 10px 0;
            padding: 8px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .status {
            color: ${autoEnabled ? '#4caf50' : '#f44336'};
            font-weight: bold;
        }
        .ai-status {
            color: ${useAI && hasApiKey ? '#4caf50' : '#ff9800'};
            font-weight: bold;
        }
        .warning {
            background: #ff9800;
            color: #000;
            padding: 10px;
            border-radius: 4px;
            margin: 10px 0;
            font-weight: 500;
        }
        .info-box {
            background: var(--vscode-textBlockQuote-background);
            border-left: 4px solid var(--vscode-textLink-foreground);
            padding: 12px;
            margin: 15px 0;
            border-radius: 3px;
        }
        .ai-box {
            background: var(--vscode-textBlockQuote-background);
            border-left: 4px solid #9c27b0;
            padding: 12px;
            margin: 15px 0;
            border-radius: 3px;
        }
        .commit-item {
            background: var(--vscode-editor-background);
            padding: 15px;
            margin: 10px 0;
            border-left: 3px solid var(--vscode-focusBorder);
            border-radius: 3px;
        }
        .commit-hash {
            color: var(--vscode-textLink-foreground);
            font-family: monospace;
            font-size: 0.9em;
        }
        .commit-time {
            color: var(--vscode-descriptionForeground);
            font-size: 0.85em;
        }
        .commit-message {
            margin: 8px 0;
            font-weight: 500;
        }
        .file-list {
            font-size: 0.9em;
            color: var(--vscode-descriptionForeground);
            margin-top: 8px;
        }
        button {
            background: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            padding: 8px 16px;
            cursor: pointer;
            border-radius: 3px;
            margin: 5px;
        }
        button:hover {
            background: var(--vscode-button-hoverBackground);
        }
        button.secondary {
            background: var(--vscode-button-secondaryBackground);
            color: var(--vscode-button-secondaryForeground);
        }
        button.secondary:hover {
            background: var(--vscode-button-secondaryHoverBackground);
        }
        .empty-state {
            text-align: center;
            padding: 40px;
            color: var(--vscode-descriptionForeground);
        }
    </style>
</head>
<body>
    <h1>🚀 Git Auto Commit Dashboard</h1>
    
    <div class="settings">
        <h2>Current Settings</h2>
        <div class="setting-item">
            <span>Auto Commit:</span>
            <span class="status">${autoEnabled ? 'ENABLED' : 'DISABLED'}</span>
        </div>
        <div class="setting-item">
            <span>Auto Commit Interval:</span>
            <span>${interval} minutes</span>
        </div>
        <div class="setting-item">
            <span>Auto-Commit Without Confirmation:</span>
            <span class="status">${autoWithoutConfirm ? 'YES' : 'NO'}</span>
        </div>
        ${autoWithoutConfirm ? '<div class="warning">⚠️ WARNING: Commits will be made automatically without asking for confirmation!</div>' : ''}
        <div class="setting-item">
            <span>Commit Reminder:</span>
            <span class="status">${reminderEnabled ? 'ENABLED' : 'DISABLED'}</span>
        </div>
        <div class="setting-item">
            <span>Reminder Interval:</span>
            <span>${reminderInterval} minutes</span>
        </div>
    </div>

    <div class="ai-box">
        <h2>🤖 AI Configuration</h2>
        <div class="setting-item">
            <span>AI Generation:</span>
            <span class="ai-status">${useAI ? 'ENABLED' : 'DISABLED'}</span>
        </div>
        ${useAI ? `
            <div class="setting-item">
                <span>AI Provider:</span>
                <span>${providerNames[aiProvider] || aiProvider}</span>
            </div>
            <div class="setting-item">
                <span>Model:</span>
                <span>${aiModel || 'Default'}</span>
            </div>
            <div class="setting-item">
                <span>API Key:</span>
                <span class="ai-status">${hasApiKey ? '✓ Configured' : '⚠️ Not Set'}</span>
            </div>
            ${!hasApiKey ? '<div class="warning">⚠️ Please configure your API key to use AI generation!</div>' : ''}
        ` : '<p style="color: var(--vscode-descriptionForeground); margin: 10px 0;">Enable AI generation to get smarter, context-aware commit messages.</p>'}
        <button class="secondary" onclick="configureAI()">⚙️ Configure AI</button>
    </div>

    <div class="info-box">
        <strong>How Auto-Commit Works:</strong><br>
        • <strong>With Confirmation (Default):</strong> You'll see a notification to approve each commit<br>
        • <strong>Without Confirmation:</strong> Commits happen automatically (enable in settings)<br>
        • <strong>With AI:</strong> Uses AI to analyze changes and generate detailed messages
    </div>

    <div style="margin: 20px 0;">
        <button onclick="refresh()">🔄 Refresh</button>
        <button onclick="clearHistory()">🗑️ Clear History</button>
        <button class="secondary" onclick="openSettings()">⚙️ Settings</button>
    </div>

    <h2>Recent Commits (${commitHistory.length})</h2>
    ${commitHistory.length === 0 ?
        '<div class="empty-state">No commits yet. Start committing to see your history here!</div>' :
        commitHistory.map(commit => `
            <div class="commit-item">
                <div class="commit-hash">${commit.hash || 'N/A'}</div>
                <div class="commit-time">${new Date(commit.timestamp).toLocaleString()}</div>
                <div class="commit-message">${commit.message.split('\n')[0]}</div>
                <div class="file-list">
                    ${commit.files.length} file(s): ${commit.files.slice(0, 3).join(', ')}
                    ${commit.files.length > 3 ? ` + ${commit.files.length - 3} more` : ''}
                </div>
            </div>
        `).join('')}

    <script>
        const vscode = acquireVsCodeApi();
        
        function refresh() {
            vscode.postMessage({ command: 'refresh' });
        }
        
        function clearHistory() {
            if (confirm('Are you sure you want to clear all commit history?')) {
                vscode.postMessage({ command: 'clearHistory' });
            }
        }

        function configureAI() {
            vscode.postMessage({ command: 'configureAI' });
        }

        function openSettings() {
            vscode.postMessage({ command: 'openSettings' });
        }
    </script>
</body>
</html>`;
}
function deactivate() {
    stopAutoCommitTimer();
    stopReminderTimer();
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map