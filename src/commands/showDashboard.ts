import * as vscode from 'vscode';
import { CommitHistory } from '../types';
import { DashboardUI } from '../ui/dashboard';
import { AIService } from '../services/aiService';

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
                    case 'updateSetting':
                        await handleSettingUpdate(message.setting, message.value, config, updateDashboard);
                        break;

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

                    case 'testAIConnection':
                        await testAIConnection(config);
                        break;
                }
            }
        );
    }
}

async function handleSettingUpdate(
    setting: string, 
    value: any, 
    config: vscode.WorkspaceConfiguration,
    updateDashboard: () => void
) {
    let newValue = value;

    // Handle toggle for boolean settings
    if (value === 'toggle') {
        const currentValue = config.get(setting, false);
        newValue = !currentValue;
    }

    // Update the setting
    await config.update(setting, newValue, vscode.ConfigurationTarget.Global);

    // Show appropriate message based on setting
    switch (setting) {
        case 'enableAutoCommit':
            vscode.window.showInformationMessage(
                newValue ? '✓ Auto-commit enabled' : '✗ Auto-commit disabled'
            );
            break;

        case 'autoCommitWithoutConfirmation':
            vscode.window.showInformationMessage(
                newValue 
                    ? '⚠️ Auto-commit will now proceed without confirmation' 
                    : '✓ Auto-commit will ask for confirmation'
            );
            break;

        case 'autoCommitInterval':
            vscode.window.showInformationMessage(
                `Auto-commit interval set to ${newValue} minutes`
            );
            break;

        case 'enableReminder':
            vscode.window.showInformationMessage(
                newValue ? '✓ Reminders enabled' : '✗ Reminders disabled'
            );
            break;

        case 'reminderInterval':
            vscode.window.showInformationMessage(
                `Reminder interval set to ${newValue} minutes`
            );
            break;

        case 'useAIGeneration':
            if (newValue) {
                // AI is being enabled, check if API key is configured
                const apiKey = config.get('aiApiKey', '') as string;
                
                if (!apiKey) {
                    vscode.window.showWarningMessage(
                        'AI generation enabled but no API key configured. Please add your API key in the dashboard.',
                        'OK'
                    );
                } else {
                    vscode.window.showInformationMessage('✓ AI generation enabled');
                }
            } else {
                vscode.window.showInformationMessage('✗ AI generation disabled');
            }
            break;

        case 'aiProvider':
            vscode.window.showInformationMessage(
                `AI provider changed to ${newValue}`
            );
            break;

        case 'aiModel':
            vscode.window.showInformationMessage(
                `AI model changed to ${newValue}`
            );
            break;

        case 'aiApiKey':
            if (newValue && newValue.trim().length > 0) {
                vscode.window.showInformationMessage('✓ API key updated');
            }
            break;

        case 'commitMessageStyle':
            const styleNames: { [key: string]: string } = {
                'conventional': 'Conventional Commits',
                'simple': 'Simple',
                'detailed': 'Detailed'
            };
            vscode.window.showInformationMessage(
                `Commit message style set to ${styleNames[newValue] || newValue}`
            );
            break;
    }

    // Refresh the dashboard to show updated values
    updateDashboard();
}

async function testAIConnection(config: vscode.WorkspaceConfiguration) {
    const apiKey = config.get('aiApiKey', '') as string;
    const aiProvider = config.get('aiProvider', 'openai') as string;
    const aiModel = config.get('aiModel', 'gpt-4o-mini') as string;

    if (!apiKey || apiKey.trim().length === 0) {
        vscode.window.showErrorMessage('❌ No API key configured. Please add your API key first.');
        return;
    }

    // Show progress
    await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: "Testing AI connection...",
        cancellable: false
    }, async (progress) => {
        try {
            progress.report({ increment: 30, message: "Connecting to AI service..." });

            const testDiff = `diff --git a/test.txt b/test.txt
new file mode 100644
index 0000000..9daeafb
--- /dev/null
+++ b/test.txt
@@ -0,0 +1 @@
+test`;

            progress.report({ increment: 40, message: "Generating test commit message..." });

            const message = await AIService.generateCommitMessage(testDiff);

            progress.report({ increment: 30, message: "Success!" });

            if (message && message.trim().length > 0) {
                vscode.window.showInformationMessage(
                    `✓ AI connection successful!\n\nProvider: ${aiProvider}\nModel: ${aiModel}\n\nTest message: ${message.substring(0, 100)}${message.length > 100 ? '...' : ''}`,
                    'OK'
                );
            } else {
                vscode.window.showWarningMessage(
                    '⚠️ Connection succeeded but received empty response. Please check your configuration.'
                );
            }
        } catch (error) {
            vscode.window.showErrorMessage(
                `❌ AI connection failed: ${error instanceof Error ? error.message : String(error)}\n\nPlease check your API key and try again.`,
                'OK'
            );
        }
    });
}
