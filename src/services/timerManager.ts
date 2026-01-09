import * as vscode from 'vscode';
import { GitService } from '../services/gitService';
import { GenerateCommitCommand } from '../commands/generateCommit';

export class TimerManager {
    private autoCommitTimer: NodeJS.Timeout | undefined;
    private reminderTimer: NodeJS.Timeout | undefined;

    startAutoCommitTimer(context: vscode.ExtensionContext): void {
        this.stopAutoCommitTimer();
        const config = vscode.workspace.getConfiguration('gitAutoCommit');
        const interval = config.get('autoCommitInterval', 10) * 60 * 1000;

        this.autoCommitTimer = setInterval(() => {
            GenerateCommitCommand.execute(context, true);
        }, interval);
    }

    stopAutoCommitTimer(): void {
        if (this.autoCommitTimer) {
            clearInterval(this.autoCommitTimer);
            this.autoCommitTimer = undefined;
        }
    }

    startReminderTimer(context: vscode.ExtensionContext): void {
        this.stopReminderTimer();
        const config = vscode.workspace.getConfiguration('gitAutoCommit');
        const interval = config.get('reminderInterval', 5) * 60 * 1000;

        this.reminderTimer = setInterval(async () => {
            const hasChanges = await GitService.checkForChanges();
            if (hasChanges) {
                const action = await vscode.window.showInformationMessage(
                    'You have uncommitted changes. Would you like to commit now?',
                    'Commit Now',
                    'Dismiss'
                );
                if (action === 'Commit Now') {
                    GenerateCommitCommand.execute(context);
                }
            }
        }, interval);
    }

    stopReminderTimer(): void {
        if (this.reminderTimer) {
            clearInterval(this.reminderTimer);
            this.reminderTimer = undefined;
        }
    }

    stopAllTimers(): void {
        this.stopAutoCommitTimer();
        this.stopReminderTimer();
    }
}
