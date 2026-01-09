import * as vscode from 'vscode';
import { AI_PROVIDERS, AI_MODELS } from '../config/constants';

export class ConfigureAICommand {
    static async execute(context: vscode.ExtensionContext): Promise<void> {
        const config = vscode.workspace.getConfiguration('gitAutoCommit');

        const provider = await vscode.window.showQuickPick(AI_PROVIDERS, {
            placeHolder: 'Select AI provider'
        });

        if (!provider) return;

        await config.update('aiProvider', provider.value, vscode.ConfigurationTarget.Global);

        const apiKeyField = `${provider.value}ApiKey`;
        const currentKey = config.get(apiKeyField, '') as string;
        const maskedKey = currentKey ? `${currentKey.substring(0, 8)}...` : 'Not set';

        const apiKey = await vscode.window.showInputBox({
            prompt: `Enter your ${provider.label} API key`,
            password: true,
            value: currentKey,
            placeHolder: `Current: ${maskedKey}`,
            validateInput: (value) => {
                if (!value || value.trim().length === 0) {
                    return 'API key cannot be empty';
                }
                return null;
            }
        });

        if (!apiKey) return;

        await config.update(apiKeyField, apiKey, vscode.ConfigurationTarget.Global);

        const modelOptions = AI_MODELS[provider.value] || [];
        const model = await vscode.window.showQuickPick(modelOptions, {
            placeHolder: 'Select AI model (optional - press Esc to use default)'
        });

        if (model) {
            await config.update('aiModel', model.value, vscode.ConfigurationTarget.Global);
        }

        const enable = await vscode.window.showQuickPick([
            { label: 'Yes', value: true },
            { label: 'No', value: false }
        ], {
            placeHolder: 'Enable AI-powered commit messages?'
        });

        if (enable) {
            await config.update('useAIGeneration', enable.value, vscode.ConfigurationTarget.Global);
        }

        vscode.window.showInformationMessage(
            `✓ AI configured: ${provider.label}${model ? ` (${model.label})` : ''}`,
            'Test It',
            'View Settings'
        ).then(action => {
            if (action === 'Test It') {
                vscode.commands.executeCommand('gitAutoCommit.generateCommit');
            } else if (action === 'View Settings') {
                vscode.commands.executeCommand('workbench.action.openSettings', 'gitAutoCommit');
            }
        });
    }
}
