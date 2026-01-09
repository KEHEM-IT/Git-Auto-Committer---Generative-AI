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
        const commitStyle = config.get('commitMessageStyle', 'conventional');
        const apiKeyField = `${aiProvider}ApiKey`;
        const hasApiKey = !!config.get(apiKeyField, '');
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
    <title>Git Commit Dashboard</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: var(--vscode-editor-background, #1e1e1e);
            color: var(--vscode-editor-foreground, #d4d4d4);
            padding: 30px;
            min-height: 100vh;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            animation: fadeIn 0.5s ease-out;
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .header {
            text-align: center;
            margin-bottom: 40px;
            animation: slideDown 0.6s ease-out;
            padding: 30px;
            background-color: var(--vscode-editor-background, #252526);
            border: 1px solid var(--vscode-panel-border, #3e3e42);
            border-radius: 12px;
        }

        @keyframes slideDown {
            from { opacity: 0; transform: translateY(-30px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .header h1 {
            font-size: 42px;
            font-weight: 700;
            margin-bottom: 10px;
            color: var(--vscode-editor-foreground, #d4d4d4);
        }

        .header .icon-large {
            font-size: 60px;
            margin-bottom: 15px;
            display: inline-block;
            animation: bounce 2s infinite;
            color: var(--vscode-textLink-foreground, #3794ff);
        }

        @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-15px); }
        }

        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }

        .stat-card {
            background-color: var(--vscode-editor-background, #252526);
            border: 1px solid var(--vscode-panel-border, #3e3e42);
            border-radius: 12px;
            padding: 25px;
            text-align: center;
            transition: all 0.3s ease;
            animation: fadeIn 0.6s ease-out backwards;
        }

        .stat-card:nth-child(1) { animation-delay: 0.1s; }
        .stat-card:nth-child(2) { animation-delay: 0.2s; }
        .stat-card:nth-child(3) { animation-delay: 0.3s; }

        .stat-card:hover {
            transform: translateY(-5px);
            border-color: var(--vscode-textLink-foreground, #3794ff);
            box-shadow: 0 4px 12px rgba(55, 148, 255, 0.2);
        }

        .stat-card .icon {
            font-size: 40px;
            margin-bottom: 10px;
            color: var(--vscode-textLink-foreground, #3794ff);
        }

        .stat-card .number {
            font-size: 36px;
            font-weight: 700;
            margin-bottom: 5px;
            color: var(--vscode-editor-foreground, #d4d4d4);
        }

        .stat-card .label {
            font-size: 14px;
            opacity: 0.7;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: var(--vscode-descriptionForeground, #cccccc);
        }

        .settings-panel {
            background-color: var(--vscode-editor-background, #252526);
            border: 1px solid var(--vscode-panel-border, #3e3e42);
            border-radius: 12px;
            padding: 30px;
            margin-bottom: 30px;
        }

        .settings-panel h2 {
            font-size: 24px;
            margin-bottom: 25px;
            display: flex;
            align-items: center;
            gap: 10px;
            color: var(--vscode-editor-foreground, #d4d4d4);
        }

        .settings-panel h2 i {
            color: var(--vscode-textLink-foreground, #3794ff);
        }

        .setting-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px;
            margin: 10px 0;
            background-color: var(--vscode-input-background, #3c3c3c);
            border: 1px solid var(--vscode-input-border, #3e3e42);
            border-radius: 8px;
            transition: all 0.3s ease;
        }

        .setting-row:hover {
            border-color: var(--vscode-focusBorder, #007acc);
            background-color: var(--vscode-list-hoverBackground, #2a2d2e);
        }

        .setting-label {
            font-size: 16px;
            font-weight: 500;
            color: var(--vscode-editor-foreground, #d4d4d4);
        }

        .setting-value {
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .badge {
            padding: 6px 14px;
            border-radius: 20px;
            font-size: 13px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .badge.success {
            background-color: var(--vscode-testing-iconPassed, #73c991);
            color: var(--vscode-editor-background, #1e1e1e);
        }

        .badge.danger {
            background-color: var(--vscode-testing-iconFailed, #f48771);
            color: var(--vscode-editor-background, #1e1e1e);
        }

        .badge.warning {
            background-color: var(--vscode-editorWarning-foreground, #cca700);
            color: var(--vscode-editor-background, #1e1e1e);
        }

        .badge.info {
            background-color: var(--vscode-textLink-foreground, #3794ff);
            color: var(--vscode-editor-background, #1e1e1e);
        }

        .btn {
            padding: 8px 16px;
            border: 1px solid var(--vscode-button-border, #3e3e42);
            border-radius: 6px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            background-color: var(--vscode-button-secondaryBackground, #3a3d41);
            color: var(--vscode-button-secondaryForeground, #cccccc);
        }

        .btn:hover {
            background-color: var(--vscode-button-secondaryHoverBackground, #45494e);
            border-color: var(--vscode-focusBorder, #007acc);
        }

        .btn.primary {
            background-color: var(--vscode-button-background, #0e639c);
            color: var(--vscode-button-foreground, #ffffff);
            border-color: transparent;
        }

        .btn.primary:hover {
            background-color: var(--vscode-button-hoverBackground, #1177bb);
        }

        .btn i {
            margin-right: 5px;
        }

        .action-buttons {
            display: flex;
            gap: 15px;
            flex-wrap: wrap;
            margin: 25px 0;
        }

        .commits-section {
            background-color: var(--vscode-editor-background, #252526);
            border: 1px solid var(--vscode-panel-border, #3e3e42);
            border-radius: 12px;
            padding: 30px;
        }

        .commits-section h2 {
            font-size: 24px;
            margin-bottom: 25px;
            display: flex;
            align-items: center;
            gap: 10px;
            color: var(--vscode-editor-foreground, #d4d4d4);
        }

        .commits-section h2 i {
            color: var(--vscode-textLink-foreground, #3794ff);
        }

        .commit-card {
            background-color: var(--vscode-input-background, #3c3c3c);
            border-left: 4px solid var(--vscode-textLink-foreground, #3794ff);
            border-radius: 8px;
            padding: 20px;
            margin: 15px 0;
            transition: all 0.3s ease;
            animation: slideIn 0.4s ease-out backwards;
        }

        .commit-card:hover {
            background-color: var(--vscode-list-hoverBackground, #2a2d2e);
            transform: translateX(5px);
            box-shadow: 0 4px 12px rgba(55, 148, 255, 0.15);
        }

        @keyframes slideIn {
            from {
                opacity: 0;
                transform: translateX(-30px);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }

        .commit-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;
        }

        .commit-hash {
            font-family: 'Courier New', monospace;
            font-size: 14px;
            background-color: var(--vscode-editor-background, #1e1e1e);
            color: var(--vscode-textPreformat-foreground, #d7ba7d);
            padding: 4px 10px;
            border-radius: 5px;
            border: 1px solid var(--vscode-panel-border, #3e3e42);
        }

        .commit-hash i {
            margin-right: 5px;
            color: var(--vscode-textLink-foreground, #3794ff);
        }

        .commit-time {
            font-size: 13px;
            opacity: 0.7;
            color: var(--vscode-descriptionForeground, #cccccc);
        }

        .commit-time i {
            margin-right: 5px;
        }

        .commit-message {
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 10px;
            line-height: 1.5;
            color: var(--vscode-editor-foreground, #d4d4d4);
        }

        .commit-message i {
            margin-right: 8px;
            color: var(--vscode-textLink-foreground, #3794ff);
        }

        .commit-files {
            font-size: 13px;
            opacity: 0.8;
            display: flex;
            align-items: center;
            gap: 8px;
            color: var(--vscode-descriptionForeground, #cccccc);
        }

        .file-badge {
            background-color: var(--vscode-badge-background, #4d4d4d);
            color: var(--vscode-badge-foreground, #ffffff);
            padding: 4px 10px;
            border-radius: 12px;
            font-size: 12px;
        }

        .file-badge i {
            margin-right: 5px;
        }

        .empty-state {
            text-align: center;
            padding: 60px 20px;
            opacity: 0.7;
        }

        .empty-state .icon {
            font-size: 80px;
            margin-bottom: 20px;
            color: var(--vscode-textLink-foreground, #3794ff);
        }

        .empty-state h3 {
            font-size: 24px;
            margin-bottom: 10px;
            color: var(--vscode-editor-foreground, #d4d4d4);
        }

        .empty-state p {
            color: var(--vscode-descriptionForeground, #cccccc);
        }

        .warning-box {
            background-color: rgba(204, 167, 0, 0.15);
            border: 2px solid var(--vscode-editorWarning-foreground, #cca700);
            border-radius: 8px;
            padding: 15px;
            margin: 15px 0;
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .warning-box .icon {
            font-size: 24px;
            color: var(--vscode-editorWarning-foreground, #cca700);
        }

        .warning-box span {
            color: var(--vscode-editor-foreground, #d4d4d4);
        }

        select {
            background-color: var(--vscode-dropdown-background, #3c3c3c);
            color: var(--vscode-dropdown-foreground, #cccccc);
            border: 1px solid var(--vscode-dropdown-border, #3e3e42);
            border-radius: 6px;
            padding: 8px 12px;
            font-size: 14px;
            cursor: pointer;
            outline: none;
            transition: all 0.3s ease;
        }

        select:hover {
            border-color: var(--vscode-focusBorder, #007acc);
        }

        select:focus {
            border-color: var(--vscode-focusBorder, #007acc);
        }

        select option {
            background-color: var(--vscode-dropdown-background, #3c3c3c);
            color: var(--vscode-dropdown-foreground, #cccccc);
        }

        @media (max-width: 768px) {
            body { padding: 15px; }
            .header h1 { font-size: 28px; }
            .stats-grid { grid-template-columns: 1fr; }
            .action-buttons { flex-direction: column; }
            .btn { width: 100%; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="icon-large"><i class="fas fa-chart-line"></i></div>
            <h1>Git Commit Dashboard</h1>
            <p style="opacity: 0.7; font-size: 18px;">Track your commits and manage automation</p>
        </div>

        <!-- Statistics -->
        <div class="stats-grid">
            <div class="stat-card">
                <div class="icon"><i class="fas fa-code-commit"></i></div>
                <div class="number">${totalCommits}</div>
                <div class="label">Total Commits</div>
            </div>
            <div class="stat-card">
                <div class="icon"><i class="fas fa-fire"></i></div>
                <div class="number">${todayCommits}</div>
                <div class="label">Today's Commits</div>
            </div>
            <div class="stat-card">
                <div class="icon"><i class="fas fa-folder-open"></i></div>
                <div class="number">${filesChanged}</div>
                <div class="label">Files Changed</div>
            </div>
        </div>

        <!-- Settings Panel -->
        <div class="settings-panel">
            <h2><i class="fas fa-cog"></i> Current Configuration</h2>
            
            <div class="setting-row">
                <div class="setting-label">Auto Commit</div>
                <div class="setting-value">
                    <span class="badge ${autoEnabled ? 'success' : 'danger'}">
                        ${autoEnabled ? 'ENABLED' : 'DISABLED'}
                    </span>
                    <button class="btn" onclick="toggleAutoCommit()">
                        ${autoEnabled ? 'Disable' : 'Enable'}
                    </button>
                </div>
            </div>

            <div class="setting-row">
                <div class="setting-label">Commit Interval</div>
                <div class="setting-value">
                    <select onchange="updateInterval(this.value)">
                        ${[1, 5, 10, 15, 30, 60].map(v => `<option value="${v}" ${interval === v ? 'selected' : ''}>${v} min</option>`).join('')}
                    </select>
                </div>
            </div>

            <div class="setting-row">
                <div class="setting-label">Auto-Commit Without Confirmation</div>
                <div class="setting-value">
                    <span class="badge ${autoWithoutConfirm ? 'warning' : 'info'}">
                        ${autoWithoutConfirm ? 'YES' : 'NO'}
                    </span>
                    <button class="btn" onclick="toggleConfirmation()">
                        ${autoWithoutConfirm ? 'Require Confirmation' : 'Skip Confirmation'}
                    </button>
                </div>
            </div>

            ${autoWithoutConfirm ? `
                <div class="warning-box">
                    <span class="icon"><i class="fas fa-exclamation-triangle"></i></span>
                    <span>Commits will be made automatically without asking for confirmation!</span>
                </div>
            ` : ''}

            <div class="setting-row">
                <div class="setting-label">Commit Reminder</div>
                <div class="setting-value">
                    <span class="badge ${reminderEnabled ? 'success' : 'danger'}">
                        ${reminderEnabled ? 'ENABLED' : 'DISABLED'}
                    </span>
                    <select onchange="updateReminderInterval(this.value)">
                        ${[1, 5, 10, 15, 30].map(v => `<option value="${v}" ${reminderInterval === v ? 'selected' : ''}>${v} min</option>`).join('')}
                    </select>
                </div>
            </div>

            <div class="setting-row">
                <div class="setting-label">AI Generation</div>
                <div class="setting-value">
                    <span class="badge ${useAI ? 'success' : 'danger'}">
                        ${useAI ? 'ENABLED' : 'DISABLED'}
                    </span>
                    <button class="btn primary" onclick="configureAI()">
                        ${useAI ? 'Reconfigure' : 'Enable'} AI
                    </button>
                </div>
            </div>

            ${useAI ? `
                <div class="setting-row">
                    <div class="setting-label">AI Provider</div>
                    <div class="setting-value">
                        <span class="badge info">${constants_1.PROVIDER_NAMES[aiProvider] || aiProvider}</span>
                        ${hasApiKey ?
            '<span style="opacity: 0.7;"><i class="fas fa-check-circle"></i> API Key Configured</span>' :
            '<span class="badge warning"><i class="fas fa-exclamation-triangle"></i> No API Key</span>'}
                    </div>
                </div>

                <div class="setting-row">
                    <div class="setting-label">AI Model</div>
                    <div class="setting-value">
                        <span style="opacity: 0.7;">${aiModel || 'Default'}</span>
                    </div>
                </div>

                <div class="setting-row">
                    <div class="setting-label">Commit Message Style</div>
                    <div class="setting-value">
                        <select onchange="updateCommitStyle(this.value)">
                            <option value="conventional" ${commitStyle === 'conventional' ? 'selected' : ''}>Conventional (feat:, fix:)</option>
                            <option value="simple" ${commitStyle === 'simple' ? 'selected' : ''}>Simple</option>
                            <option value="detailed" ${commitStyle === 'detailed' ? 'selected' : ''}>Detailed</option>
                        </select>
                    </div>
                </div>
            ` : ''}

            <div class="action-buttons">
                <button class="btn primary" onclick="refresh()"><i class="fas fa-sync-alt"></i> Refresh Dashboard</button>
                <button class="btn primary" onclick="generateCommit()"><i class="fas fa-magic"></i> Generate Commit</button>
                <button class="btn" onclick="openSettings()"><i class="fas fa-cog"></i> Advanced Settings</button>
                <button class="btn" onclick="clearHistory()"><i class="fas fa-trash-alt"></i> Clear History</button>
            </div>
        </div>

        <!-- Commits Section -->
        <div class="commits-section">
            <h2><i class="fas fa-history"></i> Recent Commits (${totalCommits})</h2>
            
            ${totalCommits === 0 ? `
                <div class="empty-state">
                    <div class="icon"><i class="fas fa-inbox"></i></div>
                    <h3>No commits yet</h3>
                    <p>Start committing to see your history here!</p>
                    <button class="btn primary" onclick="generateCommit()" style="margin-top: 20px;">
                        <i class="fas fa-plus-circle"></i> Make Your First Commit
                    </button>
                </div>
            ` : commitHistory.map((commit, index) => `
                <div class="commit-card" style="animation-delay: ${index * 0.05}s">
                    <div class="commit-header">
                        <span class="commit-hash"><i class="fas fa-hashtag"></i> ${commit.hash || 'N/A'}</span>
                        <span class="commit-time"><i class="far fa-clock"></i> ${this.formatTime(commit.timestamp)}</span>
                    </div>
                    <div class="commit-message"><i class="fas fa-comment-dots"></i> ${this.escapeHtml(commit.message.split('\n')[0])}</div>
                    <div class="commit-files">
                        <span class="file-badge"><i class="fas fa-file-code"></i> ${commit.files.length} file${commit.files.length !== 1 ? 's' : ''}</span>
                        <span style="opacity: 0.8;">${commit.files.slice(0, 2).join(', ')}${commit.files.length > 2 ? ` +${commit.files.length - 2} more` : ''}</span>
                    </div>
                </div>
            `).join('')}
        </div>
    </div>

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

        function generateCommit() {
            vscode.postMessage({ command: 'generateCommit' });
        }

        function toggleAutoCommit() {
            vscode.postMessage({ command: 'toggleAutoCommit' });
        }

        function toggleConfirmation() {
            vscode.postMessage({ command: 'toggleConfirmation' });
        }

        function updateInterval(value) {
            vscode.postMessage({ command: 'updateInterval', value: parseInt(value) });
        }

        function updateReminderInterval(value) {
            vscode.postMessage({ command: 'updateReminderInterval', value: parseInt(value) });
        }

        function updateCommitStyle(value) {
            vscode.postMessage({ command: 'updateCommitStyle', value: value });
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