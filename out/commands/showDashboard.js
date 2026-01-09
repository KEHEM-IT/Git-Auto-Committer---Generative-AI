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
exports.ShowDashboardCommand = void 0;
const vscode = __importStar(require("vscode"));
const dashboard_1 = require("../ui/dashboard");
class ShowDashboardCommand {
    static execute(context) {
        const panel = vscode.window.createWebviewPanel('commitDashboard', 'Git Commit History', vscode.ViewColumn.One, {
            enableScripts: true,
            localResourceRoots: [vscode.Uri.file(context.extensionPath)]
        });
        const updateDashboard = () => {
            const commitHistory = context.globalState.get('commitHistory', []);
            panel.webview.html = dashboard_1.DashboardUI.getDashboardHtml(commitHistory, context.extensionPath, panel.webview);
        };
        updateDashboard();
        panel.webview.onDidReceiveMessage(async (message) => {
            const config = vscode.workspace.getConfiguration('gitAutoCommit');
            switch (message.command) {
                case 'clearHistory':
                    await context.globalState.update('commitHistory', []);
                    updateDashboard();
                    vscode.window.showInformationMessage('✓ Commit history cleared');
                    break;
                case 'openSettings':
                    vscode.commands.executeCommand('workbench.action.openSettings', 'gitAutoCommit');
                    break;
                case 'generateCommit':
                    panel.dispose();
                    vscode.commands.executeCommand('gitAutoCommit.generateCommit');
                    break;
                case 'toggleAutoCommit':
                    const currentAuto = config.get('enableAutoCommit', false);
                    await config.update('enableAutoCommit', !currentAuto, vscode.ConfigurationTarget.Global);
                    vscode.window.showInformationMessage(!currentAuto ? '✓ Auto-commit enabled' : '✗ Auto-commit disabled');
                    updateDashboard();
                    break;
                case 'toggleConfirmation':
                    const currentConfirm = config.get('autoCommitWithoutConfirmation', false);
                    await config.update('autoCommitWithoutConfirmation', !currentConfirm, vscode.ConfigurationTarget.Global);
                    vscode.window.showInformationMessage(!currentConfirm
                        ? '⚠️ Auto-commit will now proceed without confirmation'
                        : '✓ Auto-commit will ask for confirmation');
                    updateDashboard();
                    break;
                case 'toggleAI':
                    const currentAI = config.get('useAIGeneration', false);
                    await config.update('useAIGeneration', !currentAI, vscode.ConfigurationTarget.Global);
                    if (!currentAI) {
                        // AI is being enabled, check if API key is configured
                        const aiProvider = config.get('aiProvider', 'openai');
                        const apiKeyField = `${aiProvider}ApiKey`;
                        const hasApiKey = !!config.get(apiKeyField, '');
                        if (!hasApiKey) {
                            vscode.window.showWarningMessage('AI Commiter enabled but no API key configured. Please configure your API key.', 'Configure Now').then(selection => {
                                if (selection === 'Configure Now') {
                                    vscode.commands.executeCommand('gitAutoCommit.configureAI');
                                }
                            });
                        }
                        else {
                            vscode.window.showInformationMessage('✓ AI Commiter enabled');
                        }
                    }
                    else {
                        vscode.window.showInformationMessage('✗ AI Commiter disabled');
                    }
                    updateDashboard();
                    break;
            }
        });
    }
}
exports.ShowDashboardCommand = ShowDashboardCommand;
//# sourceMappingURL=showDashboard.js.map