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

            const { stdout } = await execAsync('git diff --cached --stat', {
                cwd: workspaceFolder.uri.fsPath
            });
            return stdout;
        } catch {
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
                .map(line => line.substring(3));
        } catch {
            return [];
        }
    }

    static async stageAllChanges(): Promise<void> {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) return;

        await execAsync('git add .', { cwd: workspaceFolder.uri.fsPath });
    }

    static async commitChanges(message: string): Promise<string> {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) throw new Error('No workspace folder');

        const cwd = workspaceFolder.uri.fsPath;
        
        await execAsync(`git commit -m "${message.replace(/"/g, '\\"')}"`, { cwd });

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
