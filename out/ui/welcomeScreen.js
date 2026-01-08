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
exports.WelcomeScreen = void 0;
const vscode = __importStar(require("vscode"));
class WelcomeScreen {
    static async show(context) {
        const hasShownWelcome = context.globalState.get('hasShownWelcome', false);
        if (hasShownWelcome)
            return;
        const choice = await vscode.window.showInformationMessage('🚀 Welcome to Git Auto Commit! This extension can automatically commit your changes at regular intervals. Would you like to enable auto-commit?', 'Enable Auto-Commit', 'Not Now', 'Learn More');
        if (choice === 'Enable Auto-Commit') {
            const config = vscode.workspace.getConfiguration('gitAutoCommit');
            await config.update('enableAutoCommit', true, vscode.ConfigurationTarget.Global);
            vscode.window.showInformationMessage('✓ Auto-commit enabled! Changes will be committed every 10 minutes. You can adjust settings anytime.', 'Open Settings').then(action => {
                if (action === 'Open Settings') {
                    vscode.commands.executeCommand('workbench.action.openSettings', 'gitAutoCommit');
                }
            });
        }
        else if (choice === 'Learn More') {
            vscode.commands.executeCommand('gitAutoCommit.showDashboard');
        }
        await context.globalState.update('hasShownWelcome', true);
    }
}
exports.WelcomeScreen = WelcomeScreen;
//# sourceMappingURL=welcomeScreen.js.map