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
        const panel = vscode.window.createWebviewPanel('commitDashboard', 'Git Commit History', vscode.ViewColumn.One, { enableScripts: true });
        const commitHistory = context.globalState.get('commitHistory', []);
        panel.webview.html = dashboard_1.DashboardUI.getDashboardHtml(commitHistory, context.extensionPath);
        panel.webview.onDidReceiveMessage(async (message) => {
            const config = vscode.workspace.getConfiguration('gitAutoCommit');
            switch (message.command) {
                case 'refresh':
                    const updatedHistory = context.globalState.get('commitHistory', []);
                    panel.webview.html = dashboard_1.DashboardUI.getDashboardHtml(updatedHistory, context.extensionPath);
                    break;
                case 'clearHistory':
                    await context.globalState.update('commitHistory', []);
                    panel.webview.html = dashboard_1.DashboardUI.getDashboardHtml([], context.extensionPath);
                    vscode.window.showInformationMessage('✓ Commit history cleared');
                    break;
                case 'configureAI':
                    await vscode.commands.executeCommand('gitAutoCommit.configureAI');
                    const newHistory = context.globalState.get('commitHistory', []);
                    panel.webview.html = dashboard_1.DashboardUI.getDashboardHtml(newHistory, context.extensionPath);
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
                    const history1 = context.globalState.get('commitHistory', []);
                    panel.webview.html = dashboard_1.DashboardUI.getDashboardHtml(history1, context.extensionPath);
                    break;
                case 'toggleConfirmation':
                    const currentConfirm = config.get('autoCommitWithoutConfirmation', false);
                    await config.update('autoCommitWithoutConfirmation', !currentConfirm, vscode.ConfigurationTarget.Global);
                    vscode.window.showInformationMessage(!currentConfirm
                        ? '⚠️ Auto-commit will now proceed without confirmation'
                        : '✓ Auto-commit will ask for confirmation');
                    const history2 = context.globalState.get('commitHistory', []);
                    panel.webview.html = dashboard_1.DashboardUI.getDashboardHtml(history2, context.extensionPath);
                    break;
                case 'updateInterval':
                    await config.update('autoCommitInterval', message.value, vscode.ConfigurationTarget.Global);
                    vscode.window.showInformationMessage(`✓ Commit interval updated to ${message.value} minutes`);
                    const history3 = context.globalState.get('commitHistory', []);
                    panel.webview.html = dashboard_1.DashboardUI.getDashboardHtml(history3, context.extensionPath);
                    break;
                case 'updateReminderInterval':
                    await config.update('reminderInterval', message.value, vscode.ConfigurationTarget.Global);
                    vscode.window.showInformationMessage(`✓ Reminder interval updated to ${message.value} minutes`);
                    const history4 = context.globalState.get('commitHistory', []);
                    panel.webview.html = dashboard_1.DashboardUI.getDashboardHtml(history4, context.extensionPath);
                    break;
                case 'updateCommitStyle':
                    await config.update('commitMessageStyle', message.value, vscode.ConfigurationTarget.Global);
                    vscode.window.showInformationMessage(`✓ Commit style updated to ${message.value}`);
                    const history5 = context.globalState.get('commitHistory', []);
                    panel.webview.html = dashboard_1.DashboardUI.getDashboardHtml(history5, context.extensionPath);
                    break;
            }
        });
    }
}
exports.ShowDashboardCommand = ShowDashboardCommand;
//# sourceMappingURL=showDashboard.js.map