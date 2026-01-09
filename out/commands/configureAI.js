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
exports.ConfigureAICommand = void 0;
const vscode = __importStar(require("vscode"));
const constants_1 = require("../config/constants");
class ConfigureAICommand {
    static async execute(context) {
        const config = vscode.workspace.getConfiguration('gitAutoCommit');
        const provider = await vscode.window.showQuickPick(constants_1.AI_PROVIDERS, {
            placeHolder: 'Select AI provider'
        });
        if (!provider)
            return;
        await config.update('aiProvider', provider.value, vscode.ConfigurationTarget.Global);
        const currentKey = config.get('aiApiKey', '');
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
        if (!apiKey)
            return;
        await config.update('aiApiKey', apiKey, vscode.ConfigurationTarget.Global);
        const modelOptions = constants_1.AI_MODELS[provider.value] || [];
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
        vscode.window.showInformationMessage(`✓ AI configured: ${provider.label}${model ? ` (${model.label})` : ''}`, 'Test It', 'View Settings').then(action => {
            if (action === 'Test It') {
                vscode.commands.executeCommand('gitAutoCommit.generateCommit');
            }
            else if (action === 'View Settings') {
                vscode.commands.executeCommand('workbench.action.openSettings', 'gitAutoCommit');
            }
        });
    }
}
exports.ConfigureAICommand = ConfigureAICommand;
//# sourceMappingURL=configureAI.js.map