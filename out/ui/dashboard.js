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
exports.DashboardUI = void 0;
const vscode = __importStar(require("vscode"));
const constants_1 = require("../config/constants");
class DashboardUI {
    static getDashboardHtml(commitHistory) {
        const config = vscode.workspace.getConfiguration('gitAutoCommit');
        const autoEnabled = config.get('enableAutoCommit', false);
        const autoWithoutConfirm = config.get('autoCommitWithoutConfirmation', false);
        const interval = config.get('autoCommitInterval', 10);
        const reminderEnabled = config.get('enableReminder', true);
        const reminderInterval = config.get('reminderInterval', 5);
        const useAI = config.get('useAIGeneration', false);
        const aiProvider = config.get('aiProvider', 'openai');
        const aiModel = config.get('aiModel', '');
        const apiKeyField = `${aiProvider}ApiKey`;
        const hasApiKey = !!config.get(apiKeyField, '');
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
                <span>${constants_1.PROVIDER_NAMES[aiProvider] || aiProvider}</span>
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
}
exports.DashboardUI = DashboardUI;
//# sourceMappingURL=dashboard.js.map