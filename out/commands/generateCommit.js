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
exports.GenerateCommitCommand = void 0;
const vscode = __importStar(require("vscode"));
const gitService_1 = require("../services/gitService");
const aiService_1 = require("../services/aiService");
class GenerateCommitCommand {
    static async execute(context, silent = false) {
        try {
            const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
            if (!workspaceFolder) {
                if (!silent) {
                    vscode.window.showErrorMessage('No workspace folder open');
                }
                return;
            }
            const hasChanges = await gitService_1.GitService.checkForChanges();
            if (!hasChanges) {
                if (!silent) {
                    vscode.window.showInformationMessage('No changes to commit');
                }
                return;
            }
            const files = await gitService_1.GitService.getChangedFiles();
            const diff = await gitService_1.GitService.getGitDiff();
            const config = vscode.workspace.getConfiguration('gitAutoCommit');
            const useAI = config.get('useAIGeneration', false);
            let commitMessage = '';
            vscode.window.showInformationMessage('Generating commit message...');
            commitMessage = await aiService_1.AIService.generateCommitMessage(diff);
            await gitService_1.GitService.stageAllChanges();
            gitService_1.GitService.setCommitMessageInSourceControl(commitMessage);
            const autoCommitEnabled = config.get('enableAutoCommit', false);
            const autoCommitWithoutConfirm = config.get('autoCommitWithoutConfirmation', false);
            if (silent && autoCommitEnabled) {
                if (autoCommitWithoutConfirm) {
                    await this.commitChanges(context, commitMessage, files, workspaceFolder.uri.fsPath);
                    vscode.window.showInformationMessage(`✓ Auto-committed: ${commitMessage.split('\n')[0]}`);
                }
                else {
                    const action = await vscode.window.showInformationMessage(`Auto-commit ready: "${commitMessage.split('\n')[0]}"`, 'Commit Now', 'Skip');
                    if (action === 'Commit Now') {
                        await this.commitChanges(context, commitMessage, files, workspaceFolder.uri.fsPath);
                    }
                }
            }
            else if (!silent) {
                const action = await vscode.window.showInformationMessage('Commit message generated and staged. Ready to commit?', 'Commit', 'Edit Message', 'Cancel');
                if (action === 'Commit') {
                    await this.commitChanges(context, commitMessage, files, workspaceFolder.uri.fsPath);
                }
                else if (action === 'Edit Message') {
                    vscode.commands.executeCommand('workbench.view.scm');
                }
            }
        }
        catch (error) {
            if (!silent) {
                vscode.window.showErrorMessage(`Failed to generate commit: ${error}`);
            }
        }
    }
    static async commitChanges(context, message, files, cwd) {
        try {
            const hash = await gitService_1.GitService.commitChanges(message);
            const historyEntry = {
                timestamp: Date.now(),
                message: message,
                files: files,
                hash: hash
            };
            let commitHistory = context.globalState.get('commitHistory', []);
            commitHistory.unshift(historyEntry);
            if (commitHistory.length > 50) {
                commitHistory = commitHistory.slice(0, 50);
            }
            await context.globalState.update('commitHistory', commitHistory);
            vscode.window.showInformationMessage(`✓ Committed: ${message.split('\n')[0]}`);
        }
        catch (error) {
            vscode.window.showErrorMessage(`Failed to commit: ${error}`);
        }
    }
}
exports.GenerateCommitCommand = GenerateCommitCommand;
//# sourceMappingURL=generateCommit.js.map