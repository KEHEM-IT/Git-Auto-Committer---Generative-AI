import * as vscode from 'vscode';
import { CommitHistory } from '../types';
import { DashboardUI } from '../ui/dashboard';

export class ShowDashboardCommand {
    static execute(context: vscode.ExtensionContext): void {
        const panel = vscode.window.createWebviewPanel(
            'commitDashboard',
            'Git Commit History',
            vscode.ViewColumn.One,
            { 
                enableScripts: true,
                localResourceRoots: [vscode.Uri.file(context.extensionPath)]
            }
        );

        const updateDashboard = () => {
            const commitHistory: CommitHistory[] = context.globalState.get('commitHistory', []);
            panel.webview.html = DashboardUI.getDashboardHtml(commitHistory, context.extensionPath, panel.webview);
        };

        updateDashboard();

        panel.webview.onDidReceiveMessage(
            async message => {
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
                        vscode.window.showInformationMessage(
                            !currentAuto ? '✓ Auto-commit enabled' : '✗ Auto-commit disabled'
                        );
                        updateDashboard();
                        break;
                        
                    case 'toggleConfirmation':
                        const currentConfirm = config.get('autoCommitWithoutConfirmation', false);
                        await config.update('autoCommitWithoutConfirmation', !currentConfirm, vscode.ConfigurationTarget.Global);
                        vscode.window.showInformationMessage(
                            !currentConfirm 
                                ? '⚠️ Auto-commit will now proceed without confirmation' 
                                : '✓ Auto-commit will ask for confirmation'
                        );
                        updateDashboard();
                        break;
                        
                    case 'toggleAI':
                        const currentAI = config.get('useAIGeneration', false);
                        await config.update('useAIGeneration', !currentAI, vscode.ConfigurationTarget.Global);
                        
                        if (!currentAI) {
                            // AI is being enabled, check if API key is configured
                            const aiProvider = config.get('aiProvider', 'openai') as string;
                            const apiKeyField = `${aiProvider}ApiKey`;
                            const hasApiKey = !!(config.get(apiKeyField, '') as string);
                            
                            if (!hasApiKey) {
                                vscode.window.showWarningMessage(
                                    'AI Commiter enabled but no API key configured. Please configure your API key.',
                                    'Configure Now'
                                ).then(selection => {
                                    if (selection === 'Configure Now') {
                                        vscode.commands.executeCommand('gitAutoCommit.configureAI');
                                    }
                                });
                            } else {
                                vscode.window.showInformationMessage('✓ AI Commiter enabled');
                            }
                        } else {
                            vscode.window.showInformationMessage('✗ AI Commiter disabled');
                        }
                        
                        updateDashboard();
                        break;
                }
            }
        );
    }
}
