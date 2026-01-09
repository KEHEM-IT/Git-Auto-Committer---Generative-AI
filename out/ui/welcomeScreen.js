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
exports.WelcomeScreen = void 0;
const vscode = __importStar(require("vscode"));
class WelcomeScreen {
    static async show(context, forceShow = false) {
        const hasShownWelcome = context.globalState.get('hasShownWelcome', false);
        // Skip if already shown and not forced
        if (hasShownWelcome && !forceShow) {
            return;
        }
        // Mark as shown before opening to prevent duplicate calls
        if (!forceShow) {
            await context.globalState.update('hasShownWelcome', true);
        }
        const panel = vscode.window.createWebviewPanel('gitAutoCommitWelcome', 'Welcome to Git Auto Commit', vscode.ViewColumn.One, {
            enableScripts: true,
            retainContextWhenHidden: true
        });
        panel.webview.html = this.getWelcomeHtml(context.extensionPath);
        panel.webview.onDidReceiveMessage(async (message) => {
            switch (message.command) {
                case 'enableAutoCommit':
                    const config = vscode.workspace.getConfiguration('gitAutoCommit');
                    await config.update('enableAutoCommit', true, vscode.ConfigurationTarget.Global);
                    vscode.window.showInformationMessage('✓ Auto-commit enabled!');
                    panel.dispose();
                    // Open dashboard after enabling
                    setTimeout(() => {
                        vscode.commands.executeCommand('gitAutoCommit.showDashboard');
                    }, 500);
                    break;
                case 'configureAI':
                    panel.dispose();
                    vscode.commands.executeCommand('gitAutoCommit.configureAI');
                    break;
                case 'openSettings':
                    vscode.commands.executeCommand('workbench.action.openSettings', '@ext:KEHEM-IT.git-auto-commit');
                    break;
                case 'close':
                    panel.dispose();
                    break;
                case 'dontShowAgain':
                    panel.dispose();
                    break;
            }
        });
    }
    static getWelcomeHtml(extensionPath) {
        const logoUri = vscode.Uri.file(extensionPath + '/images/icon.png');
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Git Auto Commit</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
</head>
<body class="bg-gradient-to-br from-purple-600 to-purple-900 min-h-screen p-6">
    <div class="max-w-5xl mx-auto">
        <!-- Header -->
        <div class="text-center mb-12 pt-16">
            <img src="${logoUri.toString()}" alt="Logo" class="w-24 h-24 mx-auto mb-6 animate-bounce">
            <h1 class="text-5xl font-bold text-white mb-4">Git Auto Commit</h1>
            <p class="text-2xl text-purple-100">
                Intelligent commit automation powered by AI
            </p>
        </div>

        <!-- Features Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <div class="bg-white bg-opacity-10 backdrop-blur-lg border-2 border-white border-opacity-20 rounded-2xl p-8 hover:transform hover:-translate-y-2 transition-all">
                <div class="text-4xl mb-4">⚡</div>
                <div class="text-xl font-semibold text-white mb-3">Auto Commit</div>
                <div class="text-purple-100">Automatically commit your changes at customizable intervals. Never lose work again!</div>
            </div>

            <div class="bg-white bg-opacity-10 backdrop-blur-lg border-2 border-white border-opacity-20 rounded-2xl p-8 hover:transform hover:-translate-y-2 transition-all">
                <div class="text-4xl mb-4">🧠</div>
                <div class="text-xl font-semibold text-white mb-3">AI-Powered</div>
                <div class="text-purple-100">Generate meaningful commit messages using GPT-4, Claude, Gemini, or OpenRouter.</div>
            </div>

            <div class="bg-white bg-opacity-10 backdrop-blur-lg border-2 border-white border-opacity-20 rounded-2xl p-8 hover:transform hover:-translate-y-2 transition-all">
                <div class="text-4xl mb-4">📊</div>
                <div class="text-xl font-semibold text-white mb-3">Smart Dashboard</div>
                <div class="text-purple-100">Track your commit history, view statistics, and manage settings in one place.</div>
            </div>

            <div class="bg-white bg-opacity-10 backdrop-blur-lg border-2 border-white border-opacity-20 rounded-2xl p-8 hover:transform hover:-translate-y-2 transition-all">
                <div class="text-4xl mb-4">🔔</div>
                <div class="text-xl font-semibold text-white mb-3">Smart Reminders</div>
                <div class="text-purple-100">Get notified about uncommitted changes so you never forget to commit.</div>
            </div>

            <div class="bg-white bg-opacity-10 backdrop-blur-lg border-2 border-white border-opacity-20 rounded-2xl p-8 hover:transform hover:-translate-y-2 transition-all">
                <div class="text-4xl mb-4">⚙️</div>
                <div class="text-xl font-semibold text-white mb-3">Highly Configurable</div>
                <div class="text-purple-100">Customize intervals, AI models, commit styles, and notification preferences.</div>
            </div>

            <div class="bg-white bg-opacity-10 backdrop-blur-lg border-2 border-white border-opacity-20 rounded-2xl p-8 hover:transform hover:-translate-y-2 transition-all">
                <div class="text-4xl mb-4">📈</div>
                <div class="text-xl font-semibold text-white mb-3">Status Bar</div>
                <div class="text-purple-100">Quick access to all features with live status updates right in your editor.</div>
            </div>
        </div>

        <!-- Quick Start Guide -->
        <div class="bg-white bg-opacity-10 backdrop-blur-lg border-2 border-white border-opacity-20 rounded-2xl p-10 mb-12">
            <h2 class="text-3xl font-bold text-white mb-8 text-center">Quick Start Guide</h2>
            <div class="space-y-5">
                <div class="flex items-center gap-6 p-5 bg-white bg-opacity-5 rounded-xl hover:bg-opacity-10 transition-all">
                    <div class="flex-shrink-0 w-14 h-14 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-2xl font-bold text-white border-2 border-white border-opacity-40">1</div>
                    <div>
                        <div class="text-lg font-semibold text-white mb-1">Enable Auto-Commit</div>
                        <div class="text-purple-100">Click the button below or use the status bar icon to enable automatic commits</div>
                    </div>
                </div>

                <div class="flex items-center gap-6 p-5 bg-white bg-opacity-5 rounded-xl hover:bg-opacity-10 transition-all">
                    <div class="flex-shrink-0 w-14 h-14 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-2xl font-bold text-white border-2 border-white border-opacity-40">2</div>
                    <div>
                        <div class="text-lg font-semibold text-white mb-1">Configure AI (Optional)</div>
                        <div class="text-purple-100">Set up AI-powered commit messages for more intelligent descriptions</div>
                    </div>
                </div>

                <div class="flex items-center gap-6 p-5 bg-white bg-opacity-5 rounded-xl hover:bg-opacity-10 transition-all">
                    <div class="flex-shrink-0 w-14 h-14 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-2xl font-bold text-white border-2 border-white border-opacity-40">3</div>
                    <div>
                        <div class="text-lg font-semibold text-white mb-1">Customize Settings</div>
                        <div class="text-purple-100">Adjust commit intervals, notification preferences, and more</div>
                    </div>
                </div>

                <div class="flex items-center gap-6 p-5 bg-white bg-opacity-5 rounded-xl hover:bg-opacity-10 transition-all">
                    <div class="flex-shrink-0 w-14 h-14 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-2xl font-bold text-white border-2 border-white border-opacity-40">4</div>
                    <div>
                        <div class="text-lg font-semibold text-white mb-1">Start Coding!</div>
                        <div class="text-purple-100">Focus on your work while the extension handles commits automatically</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- CTA Section -->
        <div class="bg-white bg-opacity-10 backdrop-blur-lg border-2 border-white border-opacity-20 rounded-2xl p-12 text-center mb-12">
            <div class="text-3xl font-bold text-white mb-4">Ready to Get Started?</div>
            <p class="text-xl text-purple-100 mb-8">Choose your setup path and start committing smarter!</p>
            <div class="flex flex-wrap justify-center gap-4">
                <button onclick="enableAutoCommit()" class="px-8 py-4 bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
                    Enable Auto-Commit
                </button>
                <button onclick="configureAI()" class="px-8 py-4 bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
                    Configure AI
                </button>
                <button onclick="openSettings()" class="px-8 py-4 bg-white bg-opacity-15 hover:bg-opacity-25 text-white font-semibold rounded-xl border-2 border-white border-opacity-40 transition-all transform hover:-translate-y-1">
                    Open Settings
                </button>
                <button onclick="dontShowAgain()" class="px-8 py-4 bg-white bg-opacity-15 hover:bg-opacity-25 text-white font-semibold rounded-xl border-2 border-white border-opacity-40 transition-all transform hover:-translate-y-1">
                    Got It!
                </button>
            </div>
        </div>

        <!-- Footer -->
        <div class="text-center pb-12">
            <p class="text-purple-100 mb-3">💡 Access this screen anytime from the status bar menu → About</p>
            <p class="text-purple-100">Made with ❤️ by <strong>KEHEM IT</strong></p>
        </div>
    </div>

    <script>
        const vscode = acquireVsCodeApi();

        function enableAutoCommit() {
            vscode.postMessage({ command: 'enableAutoCommit' });
        }

        function configureAI() {
            vscode.postMessage({ command: 'configureAI' });
        }

        function openSettings() {
            vscode.postMessage({ command: 'openSettings' });
        }

        function dontShowAgain() {
            vscode.postMessage({ command: 'dontShowAgain' });
        }
    </script>
</body>
</html>`;
    }
}
exports.WelcomeScreen = WelcomeScreen;
//# sourceMappingURL=welcomeScreen.js.map