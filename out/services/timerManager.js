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
exports.TimerManager = void 0;
const vscode = __importStar(require("vscode"));
const gitService_1 = require("../services/gitService");
const generateCommit_1 = require("../commands/generateCommit");
class TimerManager {
    startAutoCommitTimer(context) {
        this.stopAutoCommitTimer();
        const config = vscode.workspace.getConfiguration('gitAutoCommit');
        const interval = config.get('autoCommitInterval', 10) * 60 * 1000;
        this.autoCommitTimer = setInterval(() => {
            generateCommit_1.GenerateCommitCommand.execute(context, true);
        }, interval);
    }
    stopAutoCommitTimer() {
        if (this.autoCommitTimer) {
            clearInterval(this.autoCommitTimer);
            this.autoCommitTimer = undefined;
        }
    }
    startReminderTimer(context) {
        this.stopReminderTimer();
        const config = vscode.workspace.getConfiguration('gitAutoCommit');
        const interval = config.get('reminderInterval', 5) * 60 * 1000;
        this.reminderTimer = setInterval(async () => {
            const hasChanges = await gitService_1.GitService.checkForChanges();
            if (hasChanges) {
                const action = await vscode.window.showInformationMessage('You have uncommitted changes. Would you like to commit now?', 'Commit Now', 'Dismiss');
                if (action === 'Commit Now') {
                    generateCommit_1.GenerateCommitCommand.execute(context);
                }
            }
        }, interval);
    }
    stopReminderTimer() {
        if (this.reminderTimer) {
            clearInterval(this.reminderTimer);
            this.reminderTimer = undefined;
        }
    }
    stopAllTimers() {
        this.stopAutoCommitTimer();
        this.stopReminderTimer();
    }
}
exports.TimerManager = TimerManager;
//# sourceMappingURL=timerManager.js.map