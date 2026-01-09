import * as vscode from 'vscode';
import { CommitHistory } from '../types';
import { DashboardUI } from '../ui/dashboard';

export class ShowDashboardCommand {
    static execute(context: vscode.ExtensionContext): void {
        const panel = vscode.window.createWebviewPanel(
            'commitDashboard',
            'Git Commit History',
            vscode.ViewColumn.One,
            { enableScripts: true }
        );

        const commitHistory: CommitHistory[] = context.globalState.get('commitHistory', []);
        panel.webview.html = DashboardUI.getDashboardHtml(commitHistory, context.extensionPath);

        panel.webview.onDidReceiveMessage(
            async message => {
                const config = vscode.workspace.getConfiguration('gitAutoCommit');
                
                switch (message.command) {
                    case 'refresh':
                        const updatedHistory: CommitHistory[] = context.globalState.get('commitHistory', []);
                        panel.webview.html = DashboardUI.getDashboardHtml(updatedHistory, context.extensionPath);
                        break;
                        
                    case 'clearHistory':
                        await context.globalState.update('commitHistory', []);
                        panel.webview.html = DashboardUI.getDashboardHtml([], context.extensionPath);
                        vscode.window.showInformationMessage('✓ Commit history cleared');
                        break;
                        
                    case 'configureAI':
                        await vscode.commands.executeCommand('gitAutoCommit.configureAI');
                        const newHistory: CommitHistory[] = context.globalState.get('commitHistory', []);
                        panel.webview.html = DashboardUI.getDashboardHtml(newHistory, context.extensionPath);
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
                        vscode.window.showInformationMessage(
                            !currentAuto ? '✓ Auto-commit enabled' : '✗ Auto-commit disabled'
                        );
                        const history1: CommitHistory[] = context.globalState.get('commitHistory', []);
                        panel.webview.html = DashboardUI.getDashboardHtml(history1, context.extensionPath);
                        break;
                        
                    case 'toggleConfirmation':
                        const currentConfirm = config.get('autoCommitWithoutConfirmation', false);
                        await config.update('autoCommitWithoutConfirmation', !currentConfirm, vscode.ConfigurationTarget.Global);
                        vscode.window.showInformationMessage(
                            !currentConfirm 
                                ? '⚠️ Auto-commit will now proceed without confirmation' 
                                : '✓ Auto-commit will ask for confirmation'
                        );
                        const history2: CommitHistory[] = context.globalState.get('commitHistory', []);
                        panel.webview.html = DashboardUI.getDashboardHtml(history2, context.extensionPath);
                        break;
                        
                    case 'updateInterval':
                        await config.update('autoCommitInterval', message.value, vscode.ConfigurationTarget.Global);
                        vscode.window.showInformationMessage(`✓ Commit interval updated to ${message.value} minutes`);
                        const history3: CommitHistory[] = context.globalState.get('commitHistory', []);
                        panel.webview.html = DashboardUI.getDashboardHtml(history3, context.extensionPath);
                        break;
                        
                    case 'updateReminderInterval':
                        await config.update('reminderInterval', message.value, vscode.ConfigurationTarget.Global);
                        vscode.window.showInformationMessage(`✓ Reminder interval updated to ${message.value} minutes`);
                        const history4: CommitHistory[] = context.globalState.get('commitHistory', []);
                        panel.webview.html = DashboardUI.getDashboardHtml(history4, context.extensionPath);
                        break;
                        
                    case 'updateCommitStyle':
                        await config.update('commitMessageStyle', message.value, vscode.ConfigurationTarget.Global);
                        vscode.window.showInformationMessage(`✓ Commit style updated to ${message.value}`);
                        const history5: CommitHistory[] = context.globalState.get('commitHistory', []);
                        panel.webview.html = DashboardUI.getDashboardHtml(history5, context.extensionPath);
                        break;
                }
            }
        );
    }
}
