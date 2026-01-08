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
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = __importStar(require("vscode"));
const cp = __importStar(require("child_process"));
const util_1 = require("util");
const execAsync = (0, util_1.promisify)(cp.exec);
let autoCommitTimer;
let reminderTimer;
let commitHistory = [];
let statusBarItem;
function activate(context) {
    console.log('Git Auto Commit extension activated');
    // Load commit history from storage
    commitHistory = context.globalState.get('commitHistory', []);
    // Create status bar item
    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    statusBarItem.command = 'gitAutoCommit.showDashboard';
    updateStatusBar();
    statusBarItem.show();
    context.subscriptions.push(statusBarItem);
    // Register commands
    context.subscriptions.push(vscode.commands.registerCommand('gitAutoCommit.generateCommit', () => generateAndCommit(context)), vscode.commands.registerCommand('gitAutoCommit.showDashboard', () => showDashboard(context)), vscode.commands.registerCommand('gitAutoCommit.toggleAutoCommit', () => toggleAutoCommit(context)));
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
        const commitMessage = generateCommitMessage(files, diff);
        // Stage all changes
        await execAsync('git add .', { cwd: workspaceFolder.uri.fsPath });
        // Show commit message in Source Control input
        const gitExtension = vscode.extensions.getExtension('vscode.git')?.exports;
        const git = gitExtension?.getAPI(1);
        if (git && git.repositories.length > 0) {
            git.repositories[0].inputBox.value = commitMessage;
        }
        if (!silent) {
            const action = await vscode.window.showInformationMessage('Commit message generated. Ready to commit?', 'Commit', 'Edit Message', 'Cancel');
            if (action === 'Commit') {
                await commitChanges(context, commitMessage, files, workspaceFolder.uri.fsPath);
            }
            else if (action === 'Edit Message') {
                vscode.commands.executeCommand('workbench.view.scm');
            }
        }
        else {
            const config = vscode.workspace.getConfiguration('gitAutoCommit');
            if (config.get('enableAutoCommit', false)) {
                await commitChanges(context, commitMessage, files, workspaceFolder.uri.fsPath);
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
        }
    });
}
function getDashboardHtml() {
    const config = vscode.workspace.getConfiguration('gitAutoCommit');
    const autoEnabled = config.get('enableAutoCommit', false);
    const interval = config.get('autoCommitInterval', 10);
    const reminderEnabled = config.get('enableReminder', true);
    const reminderInterval = config.get('reminderInterval', 5);
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
            <span>Commit Reminder:</span>
            <span class="status">${reminderEnabled ? 'ENABLED' : 'DISABLED'}</span>
        </div>
        <div class="setting-item">
            <span>Reminder Interval:</span>
            <span>${reminderInterval} minutes</span>
        </div>
    </div>

    <div style="margin: 20px 0;">
        <button onclick="refresh()">🔄 Refresh</button>
        <button onclick="clearHistory()">🗑️ Clear History</button>
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