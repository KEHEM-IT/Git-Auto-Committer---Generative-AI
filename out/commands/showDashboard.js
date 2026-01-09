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
const aiService_1 = require("../services/aiService");
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
        });
    }
}
exports.ShowDashboardCommand = ShowDashboardCommand;
async function handleSettingUpdate(setting, value, config, updateDashboard) {
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
            vscode.window.showInformationMessage(newValue ? '✓ Auto-commit enabled' : '✗ Auto-commit disabled');
            break;
        case 'autoCommitWithoutConfirmation':
            vscode.window.showInformationMessage(newValue
                ? '⚠️ Auto-commit will now proceed without confirmation'
                : '✓ Auto-commit will ask for confirmation');
            break;
        case 'autoCommitInterval':
            vscode.window.showInformationMessage(`Auto-commit interval set to ${newValue} minutes`);
            break;
        case 'enableReminder':
            vscode.window.showInformationMessage(newValue ? '✓ Reminders enabled' : '✗ Reminders disabled');
            break;
        case 'reminderInterval':
            vscode.window.showInformationMessage(`Reminder interval set to ${newValue} minutes`);
            break;
        case 'useAIGeneration':
            if (newValue) {
                // AI is being enabled, check if API key is configured
                const apiKey = config.get('aiApiKey', '');
                if (!apiKey) {
                    vscode.window.showWarningMessage('AI generation enabled but no API key configured. Please add your API key in the dashboard.', 'OK');
                }
                else {
                    vscode.window.showInformationMessage('✓ AI generation enabled');
                }
            }
            else {
                vscode.window.showInformationMessage('✗ AI generation disabled');
            }
            break;
        case 'aiProvider':
            vscode.window.showInformationMessage(`AI provider changed to ${newValue}`);
            break;
        case 'aiModel':
            vscode.window.showInformationMessage(`AI model changed to ${newValue}`);
            break;
        case 'aiApiKey':
            if (newValue && newValue.trim().length > 0) {
                vscode.window.showInformationMessage('✓ API key updated');
            }
            break;
        case 'commitMessageStyle':
            const styleNames = {
                'conventional': 'Conventional Commits',
                'simple': 'Simple',
                'detailed': 'Detailed'
            };
            vscode.window.showInformationMessage(`Commit message style set to ${styleNames[newValue] || newValue}`);
            break;
    }
    // Refresh the dashboard to show updated values
    updateDashboard();
}
async function testAIConnection(config) {
    const apiKey = config.get('aiApiKey', '');
    const aiProvider = config.get('aiProvider', 'openai');
    const aiModel = config.get('aiModel', 'gpt-4o-mini');
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
            const message = await aiService_1.AIService.generateCommitMessage(testDiff);
            progress.report({ increment: 30, message: "Success!" });
            if (message && message.trim().length > 0) {
                vscode.window.showInformationMessage(`✓ AI connection successful!\n\nProvider: ${aiProvider}\nModel: ${aiModel}\n\nTest message: ${message.substring(0, 100)}${message.length > 100 ? '...' : ''}`, 'OK');
            }
            else {
                vscode.window.showWarningMessage('⚠️ Connection succeeded but received empty response. Please check your configuration.');
            }
        }
        catch (error) {
            vscode.window.showErrorMessage(`❌ AI connection failed: ${error instanceof Error ? error.message : String(error)}\n\nPlease check your API key and try again.`, 'OK');
        }
    });
}
//# sourceMappingURL=showDashboard.js.map