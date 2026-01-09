import * as vscode from 'vscode';
import { CommitHistory } from '../types';
import { GitService } from '../services/gitService';
import { AIService } from '../services/aiService';

export class GenerateCommitCommand {
    static async execute(context: vscode.ExtensionContext, silent: boolean = false): Promise<void> {
        try {
            const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
            if (!workspaceFolder) {
                if (!silent) {
                    vscode.window.showErrorMessage('No workspace folder open');
                }
                return;
            }

            const hasChanges = await GitService.checkForChanges();
            if (!hasChanges) {
                if (!silent) {
                    vscode.window.showInformationMessage('No changes to commit');
                }
                return;
            }

            const files = await GitService.getChangedFiles();
            const diff = await GitService.getGitDiff();

            const config = vscode.workspace.getConfiguration('gitAutoCommit');
            const useAI = config.get('useAIGeneration', false);

            let commitMessage = '';

            vscode.window.showInformationMessage('Generating commit message...');
            commitMessage = await AIService.generateCommitMessage(diff);

            await GitService.stageAllChanges();
            GitService.setCommitMessageInSourceControl(commitMessage);

            const autoCommitEnabled = config.get('enableAutoCommit', false);
            const autoCommitWithoutConfirm = config.get('autoCommitWithoutConfirmation', false);

            if (silent && autoCommitEnabled) {
                if (autoCommitWithoutConfirm) {
                    await this.commitChanges(context, commitMessage, files, workspaceFolder.uri.fsPath);
                    vscode.window.showInformationMessage(`✓ Auto-committed: ${commitMessage.split('\n')[0]}`);
                } else {
                    const action = await vscode.window.showInformationMessage(
                        `Auto-commit ready: "${commitMessage.split('\n')[0]}"`,
                        'Commit Now',
                        'Skip'
                    );
                    if (action === 'Commit Now') {
                        await this.commitChanges(context, commitMessage, files, workspaceFolder.uri.fsPath);
                    }
                }
            } else if (!silent) {
                const action = await vscode.window.showInformationMessage(
                    'Commit message generated and staged. Ready to commit?',
                    'Commit',
                    'Edit Message',
                    'Cancel'
                );

                if (action === 'Commit') {
                    await this.commitChanges(context, commitMessage, files, workspaceFolder.uri.fsPath);
                } else if (action === 'Edit Message') {
                    vscode.commands.executeCommand('workbench.view.scm');
                }
            }
        } catch (error) {
            if (!silent) {
                vscode.window.showErrorMessage(`Failed to generate commit: ${error}`);
            }
        }
    }

    private static async commitChanges(
        context: vscode.ExtensionContext,
        message: string,
        files: string[],
        cwd: string
    ): Promise<void> {
        try {
            const hash = await GitService.commitChanges(message);

            const historyEntry: CommitHistory = {
                timestamp: Date.now(),
                message: message,
                files: files,
                hash: hash
            };

            let commitHistory: CommitHistory[] = context.globalState.get('commitHistory', []);
            commitHistory.unshift(historyEntry);
            if (commitHistory.length > 50) {
                commitHistory = commitHistory.slice(0, 50);
            }

            await context.globalState.update('commitHistory', commitHistory);

            vscode.window.showInformationMessage(`✓ Committed: ${message.split('\n')[0]}`);
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to commit: ${error}`);
        }
    }
}
