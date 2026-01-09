import * as vscode from 'vscode';
import { StatusBarManager } from './ui/statusBar';
import { WelcomeScreen } from './ui/welcomeScreen';
import { TimerManager } from './services/timerManager';
import { GenerateCommitCommand } from './commands/generateCommit';
import { ShowDashboardCommand } from './commands/showDashboard';
import { ConfigureAICommand } from './commands/configureAI';

let statusBarManager: StatusBarManager;
let timerManager: TimerManager;

export function activate(context: vscode.ExtensionContext) {
    console.log('Git Auto Commit extension activated');

    // Initialize managers
    statusBarManager = new StatusBarManager(context);
    timerManager = new TimerManager();
 
    // Show welcome screen on first install (with a small delay to ensure proper activation)
    setTimeout(() => {
        WelcomeScreen.show(context, false);
    }, 500);

    // Update status bar
    statusBarManager.update();
    context.subscriptions.push(statusBarManager.getStatusBarItem());

    // Register commands
    context.subscriptions.push(
        vscode.commands.registerCommand('gitAutoCommit.generateCommit', () => 
            GenerateCommitCommand.execute(context).then(() => {
                statusBarManager.updateLastCommitTime();
                statusBarManager.update();
            })
        ),
        vscode.commands.registerCommand('gitAutoCommit.showDashboard', () => 
            ShowDashboardCommand.execute(context)
        ),
        vscode.commands.registerCommand('gitAutoCommit.toggleAutoCommit', () => 
            toggleAutoCommit(context)
        ),
        vscode.commands.registerCommand('gitAutoCommit.configureAI', () => 
            ConfigureAICommand.execute(context)
        ),
        vscode.commands.registerCommand('gitAutoCommit.showQuickMenu', () => 
            statusBarManager.showQuickMenu()
        ),
        vscode.commands.registerCommand('gitAutoCommit.showWelcome', () => 
            WelcomeScreen.show(context, true)
        )
    );

    // Start timers if enabled
    const config = vscode.workspace.getConfiguration('gitAutoCommit');
    if (config.get('enableAutoCommit', false)) {
        timerManager.startAutoCommitTimer(context);
    }

    if (config.get('enableReminder', true)) {
        timerManager.startReminderTimer(context);
    }

    // Listen for configuration changes
    context.subscriptions.push(
        vscode.workspace.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('gitAutoCommit')) {
                handleConfigChange(context);
            }
        })
    );

    // Update status bar periodically
    const statusBarInterval = setInterval(() => {
        statusBarManager.update();
    }, 10000); // Update every 10 seconds

    context.subscriptions.push({
        dispose: () => clearInterval(statusBarInterval)
    });
}

function handleConfigChange(context: vscode.ExtensionContext) {
    const config = vscode.workspace.getConfiguration('gitAutoCommit');

    if (config.get('enableAutoCommit', false)) {
        timerManager.startAutoCommitTimer(context);
    } else {
        timerManager.stopAutoCommitTimer();
    }

    if (config.get('enableReminder', true)) {
        timerManager.startReminderTimer(context);
    } else {
        timerManager.stopReminderTimer();
    }

    statusBarManager.update();
}

function toggleAutoCommit(context: vscode.ExtensionContext) {
    const config = vscode.workspace.getConfiguration('gitAutoCommit');
    const current = config.get('enableAutoCommit', false);
    config.update('enableAutoCommit', !current, vscode.ConfigurationTarget.Global);
    
    const message = !current ? '✓ Auto-commit enabled' : '✗ Auto-commit disabled';
    vscode.window.showInformationMessage(message);
}

export function deactivate() {
    timerManager.stopAllTimers();
}
