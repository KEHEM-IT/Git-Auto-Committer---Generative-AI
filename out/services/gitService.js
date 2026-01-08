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
            const { stdout } = await execAsync('git diff --cached --stat', {
                cwd: workspaceFolder.uri.fsPath
            });
            return stdout;
        }
        catch {
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
                .map(line => line.substring(3));
        }
        catch {
            return [];
        }
    }
    static async stageAllChanges() {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder)
            return;
        await execAsync('git add .', { cwd: workspaceFolder.uri.fsPath });
    }
    static async commitChanges(message) {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder)
            throw new Error('No workspace folder');
        const cwd = workspaceFolder.uri.fsPath;
        await execAsync(`git commit -m "${message.replace(/"/g, '\\"')}"`, { cwd });
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