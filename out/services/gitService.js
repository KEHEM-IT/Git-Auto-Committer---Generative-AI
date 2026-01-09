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
exports.GitService = void 0;
const vscode = __importStar(require("vscode"));
const cp = __importStar(require("child_process"));
const util_1 = require("util");
const execAsync = (0, util_1.promisify)(cp.exec);
class GitService {
    static async checkForChanges() {
        try {
            const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
            if (!workspaceFolder)
                return false;
            const { stdout } = await execAsync('git status --porcelain', {
                cwd: workspaceFolder.uri.fsPath
            });
            return stdout.trim().length > 0;
        }
        catch {
            return false;
        }
    }
    static async getGitDiff() {
        try {
            const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
            if (!workspaceFolder)
                return '';
            const cwd = workspaceFolder.uri.fsPath;
            // Get both staged and unstaged changes
            let diff = '';
            try {
                // Get staged changes
                const { stdout: stagedDiff } = await execAsync('git diff --cached', { cwd });
                if (stagedDiff) {
                    diff += stagedDiff;
                }
            }
            catch (e) {
                // No staged changes
            }
            try {
                // Get unstaged changes
                const { stdout: unstagedDiff } = await execAsync('git diff', { cwd });
                if (unstagedDiff) {
                    diff += unstagedDiff;
                }
            }
            catch (e) {
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
                }
                catch (e) {
                    // Ignore
                }
            }
            return diff;
        }
        catch (error) {
            console.error('Error getting git diff:', error);
            return '';
        }
    }
    static async getChangedFiles() {
        try {
            const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
            if (!workspaceFolder)
                return [];
            const { stdout } = await execAsync('git status --porcelain', {
                cwd: workspaceFolder.uri.fsPath
            });
            return stdout.split('\n')
                .filter(line => line.trim())
                .map(line => line.substring(3).trim());
        }
        catch {
            return [];
        }
    }
    static async stageAllChanges() {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder)
            return;
        await execAsync('git add -A', { cwd: workspaceFolder.uri.fsPath });
    }
    static async commitChanges(message) {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder)
            throw new Error('No workspace folder');
        const cwd = workspaceFolder.uri.fsPath;
        // Escape special characters in commit message
        const escapedMessage = message.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/`/g, '\\`').replace(/\$/g, '\\$');
        await execAsync(`git commit -m "${escapedMessage}"`, { cwd });
        const { stdout: hash } = await execAsync('git rev-parse --short HEAD', { cwd });
        return hash.trim();
    }
    static setCommitMessageInSourceControl(message) {
        const gitExtension = vscode.extensions.getExtension('vscode.git')?.exports;
        const git = gitExtension?.getAPI(1);
        if (git && git.repositories.length > 0) {
            git.repositories[0].inputBox.value = message;
        }
    }
}
exports.GitService = GitService;
//# sourceMappingURL=gitService.js.map