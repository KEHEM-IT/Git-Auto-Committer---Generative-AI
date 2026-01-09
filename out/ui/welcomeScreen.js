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
        panel.webview.html = this.getWelcomeHtml();
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
    static getWelcomeHtml() {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Git Auto Commit</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: var(--vscode-font-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif);
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #fff;
            overflow-x: hidden;
            padding: 20px;
            min-height: 100vh;
        }
        
        /* VS Code Dark Theme Support */
        body.vscode-dark {
            background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%);
        }
        
        body.vscode-light {
            background: linear-gradient(135deg, #7c3aed 0%, #db2777 100%);
        }

        .container {
            max-width: 1000px;
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
            margin-bottom: 50px;
            padding: 60px 20px 40px;
            position: relative;
        }

        .logo-container {
            position: relative;
            display: inline-block;
            margin-bottom: 30px;
        }

        .logo {
            font-size: 90px;
            animation: float 3s ease-in-out infinite;
            filter: drop-shadow(0 10px 20px rgba(0,0,0,0.3));
        }

        @keyframes float {
            0%, 100% { 
                transform: translateY(0) rotate(0deg); 
            }
            25% { 
                transform: translateY(-10px) rotate(-5deg); 
            }
            75% { 
                transform: translateY(-15px) rotate(5deg); 
            }
        }

        .logo-glow {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 120px;
            height: 120px;
            background: radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%);
            border-radius: 50%;
            animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
            0%, 100% { 
                transform: translate(-50%, -50%) scale(1);
                opacity: 0.5;
            }
            50% { 
                transform: translate(-50%, -50%) scale(1.3);
                opacity: 0;
            }
        }

        h1 {
            font-size: 52px;
            margin-bottom: 15px;
            font-weight: 700;
            text-shadow: 3px 3px 6px rgba(0,0,0,0.3);
            background: linear-gradient(45deg, #fff, #f0f0f0);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .subtitle {
            font-size: 22px;
            opacity: 0.95;
            font-weight: 300;
            text-shadow: 1px 1px 3px rgba(0,0,0,0.2);
        }

        .subtitle i {
            margin: 0 8px;
            color: #ffd700;
            animation: sparkle 1.5s ease-in-out infinite;
        }

        @keyframes sparkle {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.5; transform: scale(1.2); }
        }

        .features {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 25px;
            margin: 50px 0;
        }

        .feature-card {
            background: rgba(255, 255, 255, 0.12);
            backdrop-filter: blur(15px);
            border-radius: 20px;
            padding: 35px;
            border: 2px solid rgba(255, 255, 255, 0.25);
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            animation: fadeIn 0.6s ease-out backwards;
            position: relative;
            overflow: hidden;
        }

        .feature-card::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
            opacity: 0;
            transition: opacity 0.3s ease;
        }

        .feature-card:hover::before {
            opacity: 1;
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
                transform: scale(0.9) translateY(20px);
            }
            to {
                opacity: 1;
                transform: scale(1) translateY(0);
            }
        }

        .feature-card:hover {
            transform: translateY(-8px) scale(1.02);
            box-shadow: 0 15px 40px rgba(0,0,0,0.4);
            background: rgba(255, 255, 255, 0.18);
            border-color: rgba(255, 255, 255, 0.4);
        }

        .feature-icon {
            font-size: 48px;
            margin-bottom: 20px;
            display: inline-block;
            transition: transform 0.3s ease;
        }

        .feature-card:hover .feature-icon {
            transform: scale(1.2) rotate(5deg);
        }

        .feature-icon.fa-bolt { color: #ffd700; }
        .feature-icon.fa-brain { color: #ff6ec7; }
        .feature-icon.fa-chart-line { color: #00d4ff; }
        .feature-icon.fa-bell { color: #ff9800; }
        .feature-icon.fa-sliders { color: #4caf50; }
        .feature-icon.fa-gauge-high { color: #e91e63; }

        .feature-title {
            font-size: 22px;
            font-weight: 600;
            margin-bottom: 12px;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.2);
        }

        .feature-desc {
            font-size: 15px;
            opacity: 0.92;
            line-height: 1.7;
        }

        .cta-section {
            background: rgba(255, 255, 255, 0.12);
            backdrop-filter: blur(15px);
            border-radius: 25px;
            padding: 50px 40px;
            margin: 50px 0;
            text-align: center;
            border: 2px solid rgba(255, 255, 255, 0.25);
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
        }

        .cta-title {
            font-size: 32px;
            margin-bottom: 15px;
            font-weight: 600;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
        }

        .cta-subtitle {
            opacity: 0.92;
            margin-bottom: 35px;
            font-size: 18px;
        }

        .cta-buttons {
            display: flex;
            gap: 20px;
            justify-content: center;
            flex-wrap: wrap;
            margin-top: 30px;
        }

        .btn {
            padding: 18px 45px;
            border: none;
            border-radius: 15px;
            font-size: 17px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            text-transform: uppercase;
            letter-spacing: 1.2px;
            display: inline-flex;
            align-items: center;
            gap: 12px;
            position: relative;
            overflow: hidden;
        }

        .btn::before {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            width: 0;
            height: 0;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.3);
            transform: translate(-50%, -50%);
            transition: width 0.6s, height 0.6s;
        }

        .btn:hover::before {
            width: 300px;
            height: 300px;
        }

        .btn i {
            font-size: 20px;
            position: relative;
            z-index: 1;
        }

        .btn span {
            position: relative;
            z-index: 1;
        }

        .btn-primary {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            box-shadow: 0 8px 20px rgba(102, 126, 234, 0.5);
            border: 2px solid rgba(255, 255, 255, 0.3);
        }

        .btn-primary:hover {
            transform: translateY(-3px) scale(1.05);
            box-shadow: 0 12px 30px rgba(102, 126, 234, 0.7);
        }

        .btn-primary:active {
            transform: translateY(-1px) scale(1.02);
        }

        .btn-secondary {
            background: rgba(255, 255, 255, 0.15);
            color: white;
            border: 2px solid rgba(255, 255, 255, 0.4);
            backdrop-filter: blur(10px);
        }

        .btn-secondary:hover {
            background: rgba(255, 255, 255, 0.25);
            border-color: rgba(255, 255, 255, 0.6);
            transform: translateY(-3px) scale(1.05);
        }

        .quick-start {
            background: rgba(255, 255, 255, 0.12);
            backdrop-filter: blur(15px);
            border-radius: 25px;
            padding: 40px;
            margin: 50px 0;
            border: 2px solid rgba(255, 255, 255, 0.25);
        }

        .quick-start h2 {
            font-size: 28px;
            margin-bottom: 35px;
            text-align: center;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
        }

        .quick-start h2 i {
            margin-right: 15px;
            color: #ffd700;
        }

        .steps {
            display: flex;
            flex-direction: column;
            gap: 20px;
        }

        .step {
            display: flex;
            align-items: center;
            gap: 25px;
            padding: 20px;
            background: rgba(255, 255, 255, 0.08);
            border-radius: 15px;
            transition: all 0.3s ease;
            border: 1px solid rgba(255, 255, 255, 0.15);
        }

        .step:hover {
            background: rgba(255, 255, 255, 0.12);
            transform: translateX(10px);
            border-color: rgba(255, 255, 255, 0.3);
        }

        .step-number {
            font-size: 28px;
            font-weight: 700;
            background: linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.15) 100%);
            width: 55px;
            height: 55px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            border: 2px solid rgba(255, 255, 255, 0.4);
            box-shadow: 0 4px 10px rgba(0,0,0,0.2);
        }

        .step-content {
            flex: 1;
        }

        .step-title {
            font-weight: 600;
            margin-bottom: 8px;
            font-size: 18px;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .step-title i {
            font-size: 16px;
            opacity: 0.8;
        }

        .step-desc {
            font-size: 15px;
            opacity: 0.9;
            line-height: 1.6;
        }

        .footer {
            text-align: center;
            margin-top: 50px;
            padding: 30px;
            opacity: 0.9;
        }

        .footer-content {
            display: flex;
            flex-direction: column;
            gap: 15px;
            align-items: center;
        }

        .footer p {
            display: flex;
            align-items: center;
            gap: 10px;
            justify-content: center;
            font-size: 16px;
        }

        .footer i.fa-lightbulb {
            color: #ffd700;
            animation: glow 2s ease-in-out infinite;
        }

        @keyframes glow {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }

        .footer i.fa-heart {
            color: #ff6b6b;
            animation: heartbeat 1.5s ease-in-out infinite;
        }

        @keyframes heartbeat {
            0%, 100% { transform: scale(1); }
            25% { transform: scale(1.2); }
            50% { transform: scale(1); }
        }

        .footer a {
            color: #fff;
            text-decoration: none;
            margin: 0 10px;
            transition: all 0.3s ease;
            display: inline-flex;
            align-items: center;
            gap: 5px;
        }

        .footer a:hover {
            opacity: 0.7;
            transform: translateY(-2px);
        }

        @media (max-width: 768px) {
            h1 { font-size: 36px; }
            .subtitle { font-size: 18px; }
            .logo { font-size: 70px; }
            .features { grid-template-columns: 1fr; }
            .cta-buttons { flex-direction: column; }
            .btn { width: 100%; justify-content: center; }
            .step { flex-direction: column; text-align: center; }
            .step:hover { transform: translateY(-5px); }
        }

        /* Particle effect */
        .particles {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 0;
        }

        .particle {
            position: absolute;
            width: 4px;
            height: 4px;
            background: rgba(255, 255, 255, 0.5);
            border-radius: 50%;
            animation: float-particle 10s infinite ease-in-out;
        }

        @keyframes float-particle {
            0%, 100% {
                transform: translateY(0) translateX(0);
                opacity: 0;
            }
            10% {
                opacity: 1;
            }
            90% {
                opacity: 1;
            }
            100% {
                transform: translateY(-100vh) translateX(50px);
                opacity: 0;
            }
        }
    </style>
</head>
<body>
    <div class="particles" id="particles"></div>
    
    <div class="container">
        <div class="header">
            <div class="logo-container">
                <div class="logo-glow"></div>
                <div class="logo">
                    <i class="fa-solid fa-rocket"></i>
                </div>
            </div>
            <h1>Git Auto Commit</h1>
            <p class="subtitle">
                <i class="fa-solid fa-sparkles"></i>
                Intelligent commit automation powered by AI
                <i class="fa-solid fa-sparkles"></i>
            </p>
        </div>

        <div class="features">
            <div class="feature-card">
                <div class="feature-icon">
                    <i class="fa-solid fa-bolt"></i>
                </div>
                <div class="feature-title">
                    <i class="fa-solid fa-circle-check" style="font-size: 18px; color: #4caf50;"></i>
                    Auto Commit
                </div>
                <div class="feature-desc">Automatically commit your changes at customizable intervals. Never lose work again!</div>
            </div>

            <div class="feature-card">
                <div class="feature-icon">
                    <i class="fa-solid fa-brain"></i>
                </div>
                <div class="feature-title">
                    <i class="fa-solid fa-wand-magic-sparkles" style="font-size: 18px; color: #ff6ec7;"></i>
                    AI-Powered
                </div>
                <div class="feature-desc">Generate meaningful commit messages using GPT-4, Claude, Gemini, or OpenRouter.</div>
            </div>

            <div class="feature-card">
                <div class="feature-icon">
                    <i class="fa-solid fa-chart-line"></i>
                </div>
                <div class="feature-title">
                    <i class="fa-solid fa-chart-pie" style="font-size: 18px; color: #00d4ff;"></i>
                    Smart Dashboard
                </div>
                <div class="feature-desc">Track your commit history, view statistics, and manage settings in one place.</div>
            </div>

            <div class="feature-card">
                <div class="feature-icon">
                    <i class="fa-solid fa-bell"></i>
                </div>
                <div class="feature-title">
                    <i class="fa-solid fa-bell-concierge" style="font-size: 18px; color: #ff9800;"></i>
                    Smart Reminders
                </div>
                <div class="feature-desc">Get notified about uncommitted changes so you never forget to commit.</div>
            </div>

            <div class="feature-card">
                <div class="feature-icon">
                    <i class="fa-solid fa-sliders"></i>
                </div>
                <div class="feature-title">
                    <i class="fa-solid fa-palette" style="font-size: 18px; color: #4caf50;"></i>
                    Highly Configurable
                </div>
                <div class="feature-desc">Customize intervals, AI models, commit styles, and notification preferences.</div>
            </div>

            <div class="feature-card">
                <div class="feature-icon">
                    <i class="fa-solid fa-gauge-high"></i>
                </div>
                <div class="feature-title">
                    <i class="fa-solid fa-display" style="font-size: 18px; color: #e91e63;"></i>
                    Status Bar
                </div>
                <div class="feature-desc">Quick access to all features with live status updates right in your editor.</div>
            </div>
        </div>

        <div class="quick-start">
            <h2><i class="fa-solid fa-bullseye"></i> Quick Start Guide</h2>
            <div class="steps">
                <div class="step">
                    <div class="step-number">1</div>
                    <div class="step-content">
                        <div class="step-title">
                            <i class="fa-solid fa-toggle-on"></i>
                            Enable Auto-Commit
                        </div>
                        <div class="step-desc">Click the button below or use the status bar icon to enable automatic commits</div>
                    </div>
                </div>
                <div class="step">
                    <div class="step-number">2</div>
                    <div class="step-content">
                        <div class="step-title">
                            <i class="fa-solid fa-robot"></i>
                            Configure AI (Optional)
                        </div>
                        <div class="step-desc">Set up AI-powered commit messages for more intelligent descriptions</div>
                    </div>
                </div>
                <div class="step">
                    <div class="step-number">3</div>
                    <div class="step-content">
                        <div class="step-title">
                            <i class="fa-solid fa-screwdriver-wrench"></i>
                            Customize Settings
                        </div>
                        <div class="step-desc">Adjust commit intervals, notification preferences, and more</div>
                    </div>
                </div>
                <div class="step">
                    <div class="step-number">4</div>
                    <div class="step-content">
                        <div class="step-title">
                            <i class="fa-solid fa-code"></i>
                            Start Coding!
                        </div>
                        <div class="step-desc">Focus on your work while the extension handles commits automatically</div>
                    </div>
                </div>
            </div>
        </div>

        <div class="cta-section">
            <div class="cta-title">
                <i class="fa-solid fa-star" style="color: #ffd700;"></i>
                Ready to Get Started?
            </div>
            <p class="cta-subtitle">Choose your setup path and start committing smarter!</p>
            <div class="cta-buttons">
                <button class="btn btn-primary" onclick="enableAutoCommit()">
                    <i class="fa-solid fa-bolt"></i>
                    <span>Enable Auto-Commit</span>
                </button>
                <button class="btn btn-primary" onclick="configureAI()">
                    <i class="fa-solid fa-brain"></i>
                    <span>Configure AI</span>
                </button>
                <button class="btn btn-secondary" onclick="openSettings()">
                    <i class="fa-solid fa-gear"></i>
                    <span>Open Settings</span>
                </button>
                <button class="btn btn-secondary" onclick="dontShowAgain()">
                    <i class="fa-solid fa-circle-check"></i>
                    <span>Got It!</span>
                </button>
            </div>
        </div>

        <div class="footer">
            <div class="footer-content">
                <p>
                    <i class="fa-solid fa-lightbulb"></i> 
                    Access this screen anytime from the status bar menu → About
                </p>
                <p>
                    Made with <i class="fa-solid fa-heart"></i> by 
                    <strong style="text-shadow: 1px 1px 2px rgba(0,0,0,0.3);">KEHEM IT</strong>
                </p>
            </div>
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

        // Create floating particles
        function createParticles() {
            const particlesContainer = document.getElementById('particles');
            const particleCount = 20;

            for (let i = 0; i < particleCount; i++) {
                const particle = document.createElement('div');
                particle.className = 'particle';
                particle.style.left = Math.random() * 100 + '%';
                particle.style.animationDelay = Math.random() * 10 + 's';
                particle.style.animationDuration = (Math.random() * 10 + 10) + 's';
                particlesContainer.appendChild(particle);
            }
        }

        createParticles();
    </script>
</body>
</html>`;
    }
}
exports.WelcomeScreen = WelcomeScreen;
//# sourceMappingURL=welcomeScreen.js.map