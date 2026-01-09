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
class DashboardUI {
    static getDashboardHtml(commitHistory, extensionPath, webview) {
        const config = vscode.workspace.getConfiguration('gitAutoCommit');
        const autoEnabled = config.get('enableAutoCommit', false);
        const autoWithoutConfirm = config.get('autoCommitWithoutConfirmation', false);
        const useAI = config.get('useAIGeneration', false);
        // Get logo URI for webview
        const logoPath = vscode.Uri.file(extensionPath + '/images/icon.png');
        const logoUri = webview ? webview.asWebviewUri(logoPath) : logoPath;
        // Calculate statistics
        const totalCommits = commitHistory.length;
        const todayCommits = commitHistory.filter(c => {
            const today = new Date().setHours(0, 0, 0, 0);
            return c.timestamp >= today;
        }).length;
        const filesChanged = commitHistory.reduce((sum, c) => sum + c.files.length, 0);
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Git Auto Commit Dashboard</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background-color: var(--vscode-editor-background);
            color: var(--vscode-editor-foreground);
            padding: 20px;
            line-height: 1.6;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
        }

        .header {
            text-align: center;
            padding-bottom: 30px;
            border-bottom: 1px solid var(--vscode-panel-border);
            margin-bottom: 30px;
        }

        .logo {
            width: 64px;
            height: 64px;
            margin-bottom: 15px;
        }

        .header h1 {
            font-size: 24px;
            font-weight: 500;
            color: var(--vscode-foreground);
        }

        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-bottom: 30px;
        }

        .stat-card {
            background-color: var(--vscode-editor-inactiveSelectionBackground);
            border: 1px solid var(--vscode-panel-border);
            border-radius: 4px;
            padding: 16px;
        }

        .stat-card .stat-value {
            font-size: 32px;
            font-weight: 600;
            color: var(--vscode-foreground);
            margin-bottom: 4px;
        }

        .stat-card .stat-label {
            font-size: 13px;
            color: var(--vscode-descriptionForeground);
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .section {
            background-color: var(--vscode-sideBar-background);
            border: 1px solid var(--vscode-panel-border);
            border-radius: 4px;
            padding: 20px;
            margin-bottom: 20px;
        }

        .section-title {
            font-size: 16px;
            font-weight: 500;
            margin-bottom: 20px;
            color: var(--vscode-foreground);
        }

        .setting-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 0;
            border-bottom: 1px solid var(--vscode-panel-border);
        }

        .setting-row:last-child {
            border-bottom: none;
        }

        .setting-label {
            font-size: 13px;
            color: var(--vscode-foreground);
        }

        .setting-value {
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .toggle-switch {
            position: relative;
            width: 48px;
            height: 24px;
            background-color: var(--vscode-button-background);
            border-radius: 12px;
            cursor: pointer;
            transition: background-color 0.2s;
        }

        .toggle-switch.on {
            background-color: var(--vscode-button-background);
            opacity: 1;
        }

        .toggle-switch.off {
            background-color: var(--vscode-input-background);
            border: 1px solid var(--vscode-panel-border);
        }

        .toggle-switch::after {
            content: '';
            position: absolute;
            width: 18px;
            height: 18px;
            background-color: white;
            border-radius: 50%;
            top: 3px;
            left: 3px;
            transition: left 0.2s;
        }

        .toggle-switch.on::after {
            left: 27px;
        }

        .status-badge {
            font-size: 11px;
            padding: 2px 8px;
            border-radius: 2px;
            font-weight: 500;
            text-transform: uppercase;
        }

        .status-badge.on {
            background-color: rgba(30, 180, 100, 0.3);
            color: rgb(30, 180, 100);
        }

        .status-badge.off {
            background-color: rgba(200, 30, 30, 0.3);
            color: rgb(200, 30, 30);
        }

        .warning-box {
            background-color: rgba(255, 191, 0, 0.1);
            border: 1px solid rgba(255, 191, 0, 0.3);
            border-radius: 4px;
            padding: 12px;
            margin-top: 12px;
            font-size: 13px;
            color: var(--vscode-editorWarning-foreground);
        }

        .button-group {
            display: flex;
            gap: 10px;
            margin-top: 20px;
            flex-wrap: wrap;
        }

        button {
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            border-radius: 2px;
            padding: 8px 16px;
            font-size: 13px;
            cursor: pointer;
            transition: background-color 0.2s;
        }

        button:hover {
            background-color: var(--vscode-button-hoverBackground);
        }

        button.secondary {
            background-color: var(--vscode-button-secondaryBackground);
            color: var(--vscode-button-secondaryForeground);
        }

        button.secondary:hover {
            background-color: var(--vscode-button-secondaryHoverBackground);
        }

        .commit-card {
            background-color: var(--vscode-editor-inactiveSelectionBackground);
            border-left: 3px solid var(--vscode-button-background);
            padding: 14px;
            margin-bottom: 12px;
            border-radius: 2px;
        }

        .commit-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            font-size: 12px;
            color: var(--vscode-descriptionForeground);
        }

        .commit-message {
            font-size: 14px;
            margin-bottom: 8px;
            color: var(--vscode-foreground);
        }

        .commit-files {
            font-size: 12px;
            color: var(--vscode-descriptionForeground);
        }

        .empty-state {
            text-align: center;
            padding: 60px 20px;
            color: var(--vscode-descriptionForeground);
        }

        .empty-state h3 {
            font-size: 18px;
            margin-bottom: 10px;
            color: var(--vscode-foreground);
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <img src="${logoUri.toString()}" alt="Logo" class="logo">
            <h1>Git Auto Commit Dashboard</h1>
        </div>

        <!-- Statistics -->
        <div class="stats">
            <div class="stat-card">
                <div class="stat-value">${totalCommits}</div>
                <div class="stat-label">Total Commits</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${todayCommits}</div>
                <div class="stat-label">Today's Commits</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${filesChanged}</div>
                <div class="stat-label">Files Changed</div>
            </div>
        </div>

        <!-- Settings -->
        <div class="section">
            <h2 class="section-title">Configuration</h2>
            
            <div class="setting-row">
                <div class="setting-label">Auto Commit</div>
                <div class="setting-value">
                    <span class="status-badge ${autoEnabled ? 'on' : 'off'}">${autoEnabled ? 'ON' : 'OFF'}</span>
                    <div class="toggle-switch ${autoEnabled ? 'on' : 'off'}" onclick="toggleAutoCommit()"></div>
                </div>
            </div>

            <div class="setting-row">
                <div class="setting-label">Auto-Commit Without Confirmation</div>
                <div class="setting-value">
                    <span class="status-badge ${autoWithoutConfirm ? 'on' : 'off'}">${autoWithoutConfirm ? 'ON' : 'OFF'}</span>
                    <div class="toggle-switch ${autoWithoutConfirm ? 'on' : 'off'}" onclick="toggleConfirmation()"></div>
                </div>
            </div>

            ${autoWithoutConfirm ? `
                <div class="warning-box">
                    ⚠️ Commits will be made automatically without asking for confirmation
                </div>
            ` : ''}

            <div class="setting-row">
                <div class="setting-label">AI Commiter</div>
                <div class="setting-value">
                    <span class="status-badge ${useAI ? 'on' : 'off'}">${useAI ? 'ON' : 'OFF'}</span>
                    <div class="toggle-switch ${useAI ? 'on' : 'off'}" onclick="toggleAI()"></div>
                </div>
            </div>

            <div class="button-group">
                <button onclick="generateCommit()">Generate Commit</button>
                <button class="secondary" onclick="openSettings()">Advanced Settings</button>
                <button class="secondary" onclick="clearHistory()">Clear History</button>
            </div>
        </div>

        <!-- Commits Section -->
        <div class="section">
            <h2 class="section-title">Recent Commits (${totalCommits})</h2>
            
            ${totalCommits === 0 ? `
                <div class="empty-state">
                    <h3>No commits yet</h3>
                    <p>Start committing to see your history here</p>
                    <button onclick="generateCommit()" style="margin-top: 20px;">Make Your First Commit</button>
                </div>
            ` : commitHistory.map(commit => `
                <div class="commit-card">
                    <div class="commit-header">
                        <span>${commit.hash || 'N/A'}</span>
                        <span>${this.formatTime(commit.timestamp)}</span>
                    </div>
                    <div class="commit-message">${this.escapeHtml(commit.message.split('\n')[0])}</div>
                    <div class="commit-files">
                        ${commit.files.length} file${commit.files.length !== 1 ? 's' : ''} • 
                        ${commit.files.slice(0, 2).join(', ')}${commit.files.length > 2 ? ` +${commit.files.length - 2} more` : ''}
                    </div>
                </div>
            `).join('')}
        </div>
    </div>

    <script>
        const vscode = acquireVsCodeApi();

        function clearHistory() {
            if (confirm('Are you sure you want to clear all commit history?')) {
                vscode.postMessage({ command: 'clearHistory' });
            }
        }

        function openSettings() {
            vscode.postMessage({ command: 'openSettings' });
        }

        function generateCommit() {
            vscode.postMessage({ command: 'generateCommit' });
        }

        function toggleAutoCommit() {
            vscode.postMessage({ command: 'toggleAutoCommit' });
        }

        function toggleConfirmation() {
            vscode.postMessage({ command: 'toggleConfirmation' });
        }

        function toggleAI() {
            vscode.postMessage({ command: 'toggleAI' });
        }
    </script>
</body>
</html>`;
    }
    static formatTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        if (days > 0)
            return `${days}d ago`;
        if (hours > 0)
            return `${hours}h ago`;
        if (minutes > 0)
            return `${minutes}m ago`;
        return 'just now';
    }
    static escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }
}
exports.DashboardUI = DashboardUI;
//# sourceMappingURL=dashboard.js.map