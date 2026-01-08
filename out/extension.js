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
exports.deactivate = exports.activate = void 0;
const vscode = __importStar(require("vscode"));
const statusBar_1 = require("./ui/statusBar");
const welcomeScreen_1 = require("./ui/welcomeScreen");
const timerManager_1 = require("./services/timerManager");
const generateCommit_1 = require("./commands/generateCommit");
const showDashboard_1 = require("./commands/showDashboard");
const configureAI_1 = require("./commands/configureAI");
let statusBarManager;
let timerManager;
function activate(context) {
    console.log('Git Auto Commit extension activated');
    // Initialize managers
    statusBarManager = new statusBar_1.StatusBarManager(context);
    timerManager = new timerManager_1.TimerManager();
    // Show welcome screen on first install
    welcomeScreen_1.WelcomeScreen.show(context, false);
    // Update status bar
    statusBarManager.update();
    context.subscriptions.push(statusBarManager.getStatusBarItem());
    // Register commands
    context.subscriptions.push(vscode.commands.registerCommand('gitAutoCommit.generateCommit', () => generateCommit_1.GenerateCommitCommand.execute(context).then(() => {
        statusBarManager.updateLastCommitTime();
        statusBarManager.update();
    })), vscode.commands.registerCommand('gitAutoCommit.showDashboard', () => showDashboard_1.ShowDashboardCommand.execute(context)), vscode.commands.registerCommand('gitAutoCommit.toggleAutoCommit', () => toggleAutoCommit(context)), vscode.commands.registerCommand('gitAutoCommit.configureAI', () => configureAI_1.ConfigureAICommand.execute(context)), vscode.commands.registerCommand('gitAutoCommit.showQuickMenu', () => statusBarManager.showQuickMenu()), vscode.commands.registerCommand('gitAutoCommit.showWelcome', () => welcomeScreen_1.WelcomeScreen.show(context, true)));
    // Start timers if enabled
    const config = vscode.workspace.getConfiguration('gitAutoCommit');
    if (config.get('enableAutoCommit', false)) {
        timerManager.startAutoCommitTimer(context);
    }
    if (config.get('enableReminder', true)) {
        timerManager.startReminderTimer(context);
    }
    // Listen for configuration changes
    context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(e => {
        if (e.affectsConfiguration('gitAutoCommit')) {
            handleConfigChange(context);
        }
    }));
    // Update status bar periodically
    const statusBarInterval = setInterval(() => {
        statusBarManager.update();
    }, 10000); // Update every 10 seconds
    context.subscriptions.push({
        dispose: () => clearInterval(statusBarInterval)
    });
}
exports.activate = activate;
function handleConfigChange(context) {
    const config = vscode.workspace.getConfiguration('gitAutoCommit');
    if (config.get('enableAutoCommit', false)) {
        timerManager.startAutoCommitTimer(context);
    }
    else {
        timerManager.stopAutoCommitTimer();
    }
    if (config.get('enableReminder', true)) {
        timerManager.startReminderTimer(context);
    }
    else {
        timerManager.stopReminderTimer();
    }
    statusBarManager.update();
}
function toggleAutoCommit(context) {
    const config = vscode.workspace.getConfiguration('gitAutoCommit');
    const current = config.get('enableAutoCommit', false);
    config.update('enableAutoCommit', !current, vscode.ConfigurationTarget.Global);
    const message = !current ? '✓ Auto-commit enabled' : '✗ Auto-commit disabled';
    vscode.window.showInformationMessage(message);
}
function deactivate() {
    timerManager.stopAllTimers();
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map