import * as vscode from 'vscode';
import * as cp from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(cp.exec);

export class GitService {
    static async checkForChanges(): Promise<boolean> {
        try {
            const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
            if (!workspaceFolder) return false;

            const { stdout } = await execAsync('git status --porcelain', {
                cwd: workspaceFolder.uri.fsPath
            });
            return stdout.trim().length > 0;
        } catch {
            return false;
        }
    }

    static async getGitDiff(): Promise<string> {
        try {
            const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
            if (!workspaceFolder) return '';

            const cwd = workspaceFolder.uri.fsPath;

            // Get both staged and unstaged changes
            let diff = '';
            
            try {
                // Get staged changes
                const { stdout: stagedDiff } = await execAsync('git diff --cached', { cwd });
                if (stagedDiff) {
                    diff += stagedDiff;
                }
            } catch (e) {
                // No staged changes
            }

            try {
                // Get unstaged changes
                const { stdout: unstagedDiff } = await execAsync('git diff', { cwd });
                if (unstagedDiff) {
                    diff += unstagedDiff;
                }
            } catch (e) {
                // No unstaged changes
            }

            // If no diff found, get untracked files
            if (!diff || diff.trim().length === 0) {
                try {
                    const { stdout: status } = await execAsync('git status --porcelain', { cwd });
                    const untrackedFiles = status.split('\n')
                        .filter(line => line.startsWith('??'))
                        .map(line => line.substring(3).trim());
                    
                    if (untrackedFiles.length > 0) {
                        diff = `New files:\n${untrackedFiles.join('\n')}`;
                    }
                } catch (e) {
                    // Ignore
                }
            }

            return diff;
        } catch (error) {
            console.error('Error getting git diff:', error);
            return '';
        }
    }

    static async getChangedFiles(): Promise<string[]> {
        try {
            const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
            if (!workspaceFolder) return [];

            const { stdout } = await execAsync('git status --porcelain', {
                cwd: workspaceFolder.uri.fsPath
            });

            return stdout.split('\n')
                .filter(line => line.trim())
                .map(line => line.substring(3).trim());
        } catch {
            return [];
        }
    }

    static async stageAllChanges(): Promise<void> {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) return;

        await execAsync('git add -A', { cwd: workspaceFolder.uri.fsPath });
    }

    static async commitChanges(message: string): Promise<string> {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) throw new Error('No workspace folder');

        const cwd = workspaceFolder.uri.fsPath;
        
        // Escape special characters in commit message
        const escapedMessage = message.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/`/g, '\\`').replace(/\$/g, '\\$');
        
        await execAsync(`git commit -m "${escapedMessage}"`, { cwd });

        const { stdout: hash } = await execAsync('git rev-parse --short HEAD', { cwd });
        return hash.trim();
    }

    static setCommitMessageInSourceControl(message: string): void {
        const gitExtension = vscode.extensions.getExtension('vscode.git')?.exports;
        const git = gitExtension?.getAPI(1);

        if (git && git.repositories.length > 0) {
            git.repositories[0].inputBox.value = message;
        }
    }
}
