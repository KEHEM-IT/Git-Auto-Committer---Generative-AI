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
        if (hasShownWelcome && !forceShow)
            return;
        const panel = vscode.window.createWebviewPanel('gitAutoCommitWelcome', 'Welcome to Git Auto Commit', vscode.ViewColumn.One, {
            enableScripts: true,
            retainContextWhenHidden: true
        });
        panel.webview.html = this.getWelcomeHtml();
        panel.webview.onDidReceiveMessage(async (message) => {
            switch (message.command) {
                case 'enableAutoCommit':
                    const config = vscode.workspace.getConfiguration('gitAutoCommit');
                    await config.update('enableAutoCommit', true, vscode.ConfigurationTarget.Global);
                    vscode.window.showInformationMessage('✓ Auto-commit enabled!');
                    panel.dispose();
                    break;
                case 'configureAI':
                    panel.dispose();
                    vscode.commands.executeCommand('gitAutoCommit.configureAI');
                    break;
                case 'openSettings':
                    vscode.commands.executeCommand('workbench.action.openSettings', 'gitAutoCommit');
                    break;
                case 'close':
                    panel.dispose();
                    break;
                case 'dontShowAgain':
                    await context.globalState.update('hasShownWelcome', true);
                    panel.dispose();
                    break;
            }
        });
        if (!hasShownWelcome && !forceShow) {
            await context.globalState.update('hasShownWelcome', true);
        }
    }
    static getWelcomeHtml() {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Git Auto Commit</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #fff;
            overflow-x: hidden;
            padding: 20px;
        }

        .container {
            max-width: 900px;
            margin: 0 auto;
            animation: fadeInUp 0.6s ease-out;
        }

        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .header {
            text-align: center;
            margin-bottom: 40px;
            padding: 40px 20px;
        }

        .logo {
            font-size: 80px;
            margin-bottom: 20px;
            animation: bounce 2s infinite;
        }

        @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-20px); }
        }

        h1 {
            font-size: 48px;
            margin-bottom: 10px;
            font-weight: 700;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
        }

        .subtitle {
            font-size: 20px;
            opacity: 0.9;
            font-weight: 300;
        }

        .features {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin: 40px 0;
        }

        .feature-card {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 15px;
            padding: 30px;
            border: 1px solid rgba(255, 255, 255, 0.2);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            animation: fadeIn 0.6s ease-out backwards;
        }

        .feature-card:nth-child(1) { animation-delay: 0.1s; }
        .feature-card:nth-child(2) { animation-delay: 0.2s; }
        .feature-card:nth-child(3) { animation-delay: 0.3s; }
        .feature-card:nth-child(4) { animation-delay: 0.4s; }
        .feature-card:nth-child(5) { animation-delay: 0.5s; }
        .feature-card:nth-child(6) { animation-delay: 0.6s; }

        @keyframes fadeIn {
            from {
                opacity: 0;
                transform: scale(0.9);
            }
            to {
                opacity: 1;
                transform: scale(1);
            }
        }

        .feature-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            background: rgba(255, 255, 255, 0.15);
        }

        .feature-icon {
            font-size: 40px;
            margin-bottom: 15px;
        }

        .feature-title {
            font-size: 20px;
            font-weight: 600;
            margin-bottom: 10px;
        }

        .feature-desc {
            font-size: 14px;
            opacity: 0.9;
            line-height: 1.6;
        }

        .cta-section {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 40px;
            margin: 40px 0;
            text-align: center;
            border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .cta-title {
            font-size: 28px;
            margin-bottom: 20px;
            font-weight: 600;
        }

        .cta-buttons {
            display: flex;
            gap: 15px;
            justify-content: center;
            flex-wrap: wrap;
            margin-top: 30px;
        }

        .btn {
            padding: 15px 40px;
            border: none;
            border-radius: 10px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .btn-primary {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
        }

        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(102, 126, 234, 0.6);
        }

        .btn-secondary {
            background: rgba(255, 255, 255, 0.2);
            color: white;
            border: 2px solid rgba(255, 255, 255, 0.3);
        }

        .btn-secondary:hover {
            background: rgba(255, 255, 255, 0.3);
            border-color: rgba(255, 255, 255, 0.5);
        }

        .quick-start {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 30px;
            margin: 40px 0;
            border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .quick-start h2 {
            font-size: 24px;
            margin-bottom: 20px;
            text-align: center;
        }

        .steps {
            display: flex;
            flex-direction: column;
            gap: 15px;
        }

        .step {
            display: flex;
            align-items: center;
            gap: 20px;
            padding: 15px;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 10px;
        }

        .step-number {
            font-size: 24px;
            font-weight: 700;
            background: rgba(255, 255, 255, 0.2);
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
        }

        .step-content {
            flex: 1;
        }

        .step-title {
            font-weight: 600;
            margin-bottom: 5px;
        }

        .step-desc {
            font-size: 14px;
            opacity: 0.9;
        }

        .footer {
            text-align: center;
            margin-top: 40px;
            padding: 20px;
            opacity: 0.8;
        }

        .footer a {
            color: #fff;
            text-decoration: none;
            margin: 0 10px;
            transition: opacity 0.3s ease;
        }

        .footer a:hover {
            opacity: 0.7;
        }

        @media (max-width: 768px) {
            h1 { font-size: 32px; }
            .subtitle { font-size: 16px; }
            .features { grid-template-columns: 1fr; }
            .cta-buttons { flex-direction: column; }
            .btn { width: 100%; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🚀</div>
            <h1>Git Auto Commit</h1>
            <p class="subtitle">Intelligent commit automation powered by AI</p>
        </div>

        <div class="features">
            <div class="feature-card">
                <div class="feature-icon">⚡</div>
                <div class="feature-title">Auto Commit</div>
                <div class="feature-desc">Automatically commit your changes at customizable intervals. Never lose work again!</div>
            </div>

            <div class="feature-card">
                <div class="feature-icon">🤖</div>
                <div class="feature-title">AI-Powered</div>
                <div class="feature-desc">Generate meaningful commit messages using GPT-4, Claude, Gemini, or OpenRouter.</div>
            </div>

            <div class="feature-card">
                <div class="feature-icon">📊</div>
                <div class="feature-title">Smart Dashboard</div>
                <div class="feature-desc">Track your commit history, view statistics, and manage settings in one place.</div>
            </div>

            <div class="feature-card">
                <div class="feature-icon">🔔</div>
                <div class="feature-title">Reminders</div>
                <div class="feature-desc">Get notified about uncommitted changes so you never forget to commit.</div>
            </div>

            <div class="feature-card">
                <div class="feature-icon">⚙️</div>
                <div class="feature-title">Highly Configurable</div>
                <div class="feature-desc">Customize intervals, AI models, commit styles, and notification preferences.</div>
            </div>

            <div class="feature-card">
                <div class="feature-icon">📈</div>
                <div class="feature-title">Status Bar</div>
                <div class="feature-desc">Quick access to all features with live status updates right in your editor.</div>
            </div>
        </div>

        <div class="quick-start">
            <h2>🎯 Quick Start Guide</h2>
            <div class="steps">
                <div class="step">
                    <div class="step-number">1</div>
                    <div class="step-content">
                        <div class="step-title">Enable Auto-Commit</div>
                        <div class="step-desc">Click the button below or use the status bar icon to enable automatic commits</div>
                    </div>
                </div>
                <div class="step">
                    <div class="step-number">2</div>
                    <div class="step-content">
                        <div class="step-title">Configure AI (Optional)</div>
                        <div class="step-desc">Set up AI-powered commit messages for more intelligent descriptions</div>
                    </div>
                </div>
                <div class="step">
                    <div class="step-number">3</div>
                    <div class="step-content">
                        <div class="step-title">Customize Settings</div>
                        <div class="step-desc">Adjust commit intervals, notification preferences, and more</div>
                    </div>
                </div>
                <div class="step">
                    <div class="step-number">4</div>
                    <div class="step-content">
                        <div class="step-title">Start Coding!</div>
                        <div class="step-desc">Focus on your work while the extension handles commits automatically</div>
                    </div>
                </div>
            </div>
        </div>

        <div class="cta-section">
            <div class="cta-title">Ready to Get Started?</div>
            <p style="opacity: 0.9; margin-bottom: 10px;">Choose your setup path and start committing smarter!</p>
            <div class="cta-buttons">
                <button class="btn btn-primary" onclick="enableAutoCommit()">
                    ⚡ Enable Auto-Commit
                </button>
                <button class="btn btn-primary" onclick="configureAI()">
                    🤖 Configure AI
                </button>
                <button class="btn btn-secondary" onclick="openSettings()">
                    ⚙️ Open Settings
                </button>
                <button class="btn btn-secondary" onclick="dontShowAgain()">
                    👍 Got It!
                </button>
            </div>
        </div>

        <div class="footer">
            <p>💡 Access this screen anytime from the status bar menu → About</p>
            <p style="margin-top: 10px;">
                Made with ❤️ by KEHEM IT
            </p>
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