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
exports.StatusBarManager = void 0;
const vscode = __importStar(require("vscode"));
const gitService_1 = require("../services/gitService");
class StatusBarManager {
    constructor(context) {
        this.context = context;
        this.lastCommitTime = null;
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
        this.statusBarItem.command = 'gitAutoCommit.showQuickMenu';
        this.lastCommitTime = context.globalState.get('lastCommitTime', null);
        this.update();
        this.statusBarItem.show();
    }
    async update() {
        const config = vscode.workspace.getConfiguration('gitAutoCommit');
        const autoEnabled = config.get('enableAutoCommit', false);
        const useAI = config.get('useAIGeneration', false);
        // Check for changes
        const hasChanges = await gitService_1.GitService.checkForChanges();
        const changesCount = hasChanges ? await this.getChangesCount() : 0;
        // Build status text
        let icon = autoEnabled ? '$(sync~spin)' : '$(git-commit)';
        let statusText = autoEnabled ? 'Auto' : 'Manual';
        if (useAI) {
            icon = '$(sparkle)';
        }
        let text = `${icon} Git: ${statusText}`;
        if (changesCount > 0) {
            text += ` $(diff) ${changesCount}`;
        }
        this.statusBarItem.text = text;
        // Build tooltip
        let tooltip = 'Git Auto Commit\n\n';
        tooltip += `Mode: ${autoEnabled ? 'Auto-Commit Enabled' : 'Manual Mode'}\n`;
        tooltip += `AI Generation: ${useAI ? 'Enabled ✓' : 'Disabled'}\n`;
        tooltip += `Uncommitted Changes: ${changesCount}\n`;
        if (this.lastCommitTime) {
            const timeAgo = this.getTimeAgo(this.lastCommitTime);
            tooltip += `Last Commit: ${timeAgo}\n`;
        }
        else {
            tooltip += 'Last Commit: None\n';
        }
        tooltip += '\n🖱️ Click for quick actions';
        this.statusBarItem.tooltip = tooltip;
    }
    async getChangesCount() {
        try {
            const files = await gitService_1.GitService.getChangedFiles();
            return files.length;
        }
        catch {
            return 0;
        }
    }
    getTimeAgo(timestamp) {
        const seconds = Math.floor((Date.now() - timestamp) / 1000);
        if (seconds < 60)
            return `${seconds}s ago`;
        if (seconds < 3600)
            return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400)
            return `${Math.floor(seconds / 3600)}h ago`;
        return `${Math.floor(seconds / 86400)}d ago`;
    }
    updateLastCommitTime() {
        this.lastCommitTime = Date.now();
        this.context.globalState.update('lastCommitTime', this.lastCommitTime);
        this.update();
    }
    dispose() {
        this.statusBarItem.dispose();
    }
    getStatusBarItem() {
        return this.statusBarItem;
    }
    async showQuickMenu() {
        const config = vscode.workspace.getConfiguration('gitAutoCommit');
        const autoEnabled = config.get('enableAutoCommit', false);
        const useAI = config.get('useAIGeneration', false);
        const hasChanges = await gitService_1.GitService.checkForChanges();
        const changesCount = await this.getChangesCount();
        const items = [
            {
                label: '$(git-commit) Generate & Commit',
                description: hasChanges ? `${changesCount} file(s) changed` : 'No changes',
                detail: 'Generate commit message and commit changes',
            },
            {
                label: '$(check) Check Changes',
                description: hasChanges ? `${changesCount} uncommitted changes` : 'All clean',
                detail: 'View current uncommitted changes',
            },
            { label: '', kind: vscode.QuickPickItemKind.Separator },
            {
                label: autoEnabled ? '$(debug-pause) Disable Auto-Commit' : '$(play) Enable Auto-Commit',
                description: autoEnabled ? 'Currently ON' : 'Currently OFF',
                detail: 'Toggle automatic commit mode',
            },
            {
                label: useAI ? '$(sparkle) AI Mode: ON' : '$(robot) AI Mode: OFF',
                description: useAI ? 'Using AI generation' : 'Using rule-based generation',
                detail: 'Configure AI-powered commit messages',
            },
            { label: '', kind: vscode.QuickPickItemKind.Separator },
            {
                label: '$(dashboard) Open Dashboard',
                description: 'View commit history and stats',
                detail: 'See all your commits and settings',
            },
            {
                label: '$(gear) Settings',
                description: 'Configure extension',
                detail: 'Open Git Auto Commit settings',
            },
            {
                label: '$(info) About',
                description: 'Extension information',
                detail: 'View welcome screen and help',
            },
        ];
        const selected = await vscode.window.showQuickPick(items, {
            placeHolder: 'Git Auto Commit - Quick Actions',
            matchOnDescription: true,
            matchOnDetail: true,
        });
        if (!selected)
            return;
        switch (selected.label) {
            case '$(git-commit) Generate & Commit':
                vscode.commands.executeCommand('gitAutoCommit.generateCommit');
                break;
            case '$(check) Check Changes':
                await this.showChanges();
                break;
            case '$(debug-pause) Disable Auto-Commit':
            case '$(play) Enable Auto-Commit':
                vscode.commands.executeCommand('gitAutoCommit.toggleAutoCommit');
                break;
            case '$(sparkle) AI Mode: ON':
            case '$(robot) AI Mode: OFF':
                vscode.commands.executeCommand('gitAutoCommit.configureAI');
                break;
            case '$(dashboard) Open Dashboard':
                vscode.commands.executeCommand('gitAutoCommit.showDashboard');
                break;
            case '$(gear) Settings':
                vscode.commands.executeCommand('workbench.action.openSettings', '@ext:KEHEM-IT.git-auto-commit');
                break;
            case '$(info) About':
                vscode.commands.executeCommand('gitAutoCommit.showWelcome');
                break;
        }
    }
    async showChanges() {
        const hasChanges = await gitService_1.GitService.checkForChanges();
        if (!hasChanges) {
            vscode.window.showInformationMessage('✓ No uncommitted changes');
            return;
        }
        const files = await gitService_1.GitService.getChangedFiles();
        const diff = await gitService_1.GitService.getGitDiff();
        const message = `📝 ${files.length} Uncommitted Changes:\n\n${files.slice(0, 10).join('\n')}${files.length > 10 ? `\n... and ${files.length - 10} more` : ''}\n\n${diff}`;
        const action = await vscode.window.showInformationMessage(message, 'Commit Now', 'View in Source Control', 'Dismiss');
        if (action === 'Commit Now') {
            vscode.commands.executeCommand('gitAutoCommit.generateCommit');
        }
        else if (action === 'View in Source Control') {
            vscode.commands.executeCommand('workbench.view.scm');
        }
    }
}
exports.StatusBarManager = StatusBarManager;
//# sourceMappingURL=statusBar.js.map