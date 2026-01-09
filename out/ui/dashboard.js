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
exports.DashboardUI = void 0;
const vscode = __importStar(require("vscode"));
class DashboardUI {
    static getDashboardHtml(commitHistory, extensionPath, webview) {
        const config = vscode.workspace.getConfiguration('gitAutoCommit');
        // Get all settings
        const enableAutoCommit = config.get('enableAutoCommit', false);
        const autoCommitWithoutConfirmation = config.get('autoCommitWithoutConfirmation', false);
        const autoCommitInterval = config.get('autoCommitInterval', 10);
        const enableReminder = config.get('enableReminder', true);
        const reminderInterval = config.get('reminderInterval', 5);
        const useAIGeneration = config.get('useAIGeneration', false);
        const aiProvider = config.get('aiProvider', 'openai');
        const aiModel = config.get('aiModel', 'gpt-4o-mini');
        const aiApiKey = config.get('aiApiKey', '');
        const commitMessageStyle = config.get('commitMessageStyle', 'conventional');
        // Get logo URI for webview
        const logoPath = vscode.Uri.file(extensionPath + '/images/icon.png');
        const logoUri = webview ? webview.asWebviewUri(logoPath) : logoPath;
        // Calculate statistics
        const totalCommits = commitHistory.length;
        const todayCommits = commitHistory.filter(c => {
            const today = new Date().setHours(0, 0, 0, 0);
            return c.timestamp >= today;
        }).length;
        const filesChanged = commitHistory.reduce((sum, c) => sum + c.files.length, 0);
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Git Auto Commit Dashboard</title>
    
    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    
    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
    
    <style>
        body {
            background-color: var(--vscode-editor-background);
            color: var(--vscode-editor-foreground);
        }

        .toggle-switch {
            position: relative;
            width: 48px;
            height: 24px;
            background-color: var(--vscode-input-background);
            border: 1px solid var(--vscode-panel-border);
            border-radius: 12px;
            cursor: pointer;
            transition: background-color 0.2s;
        }

        .toggle-switch.on {
            background-color: var(--vscode-button-background);
            border: none;
        }

        .toggle-switch::after {
            content: '';
            position: absolute;
            width: 18px;
            height: 18px;
            background-color: white;
            border-radius: 50%;
            top: 3px;
            left: 3px;
            transition: left 0.2s;
        }

        .toggle-switch.on::after {
            left: 27px;
        }

        .slider {
            -webkit-appearance: none;
            appearance: none;
            width: 150px;
            height: 4px;
            border-radius: 2px;
            background: var(--vscode-input-background);
            outline: none;
        }

        .slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background: var(--vscode-button-background);
            cursor: pointer;
        }

        .slider::-moz-range-thumb {
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background: var(--vscode-button-background);
            cursor: pointer;
            border: none;
        }

        select, input[type="text"], input[type="password"] {
            background-color: var(--vscode-input-background);
            color: var(--vscode-input-foreground);
            border: 1px solid var(--vscode-input-border);
        }

        select:focus, input:focus {
            outline: none;
            border-color: var(--vscode-focusBorder);
        }

        button {
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
        }

        button:hover {
            background-color: var(--vscode-button-hoverBackground);
        }

        button.secondary {
            background-color: var(--vscode-button-secondaryBackground);
            color: var(--vscode-button-secondaryForeground);
        }

        button.secondary:hover {
            background-color: var(--vscode-button-secondaryHoverBackground);
        }
    </style>
</head>
<body class="p-5">
    <div class="max-w-6xl mx-auto">
        <!-- Header -->
        <header class="text-center pb-8 border-b mb-8" style="border-color: var(--vscode-panel-border);">
            <img src="${logoUri.toString()}" alt="Logo" class="w-16 h-16 mx-auto mb-4">
            <h1 class="text-2xl font-medium">
                <i class="fas fa-code-branch"></i> Git Auto Commit Dashboard
            </h1>
        </header>

        <!-- Statistics -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div class="p-4 rounded border" style="background-color: var(--vscode-editor-inactiveSelectionBackground); border-color: var(--vscode-panel-border);">
                <div class="text-3xl font-semibold mb-1">
                    <i class="fas fa-check-circle"></i> ${totalCommits}
                </div>
                <div class="text-xs uppercase tracking-wide opacity-70">Total Commits</div>
            </div>
            <div class="p-4 rounded border" style="background-color: var(--vscode-editor-inactiveSelectionBackground); border-color: var(--vscode-panel-border);">
                <div class="text-3xl font-semibold mb-1">
                    <i class="fas fa-calendar-day"></i> ${todayCommits}
                </div>
                <div class="text-xs uppercase tracking-wide opacity-70">Today's Commits</div>
            </div>
            <div class="p-4 rounded border" style="background-color: var(--vscode-editor-inactiveSelectionBackground); border-color: var(--vscode-panel-border);">
                <div class="text-3xl font-semibold mb-1">
                    <i class="fas fa-file-code"></i> ${filesChanged}
                </div>
                <div class="text-xs uppercase tracking-wide opacity-70">Files Changed</div>
            </div>
        </div>

        <!-- Settings -->
        <section class="p-5 rounded border mb-5" style="background-color: var(--vscode-sideBar-background); border-color: var(--vscode-panel-border);">
            <h2 class="text-lg font-medium mb-5 flex items-center gap-2">
                <i class="fas fa-cog"></i> Configuration
            </h2>
            
            <!-- AUTO COMMIT SETTINGS -->
            <div class="text-sm font-medium uppercase tracking-wide opacity-70 my-5 pb-2 border-b" style="border-color: var(--vscode-panel-border);">
                <i class="fas fa-clock"></i> Auto Commit
            </div>
            
            <div class="flex justify-between items-center py-3 border-b" style="border-color: var(--vscode-panel-border);">
                <div class="flex-1">
                    <div class="text-sm mb-1">Enable Auto Commit</div>
                    <div class="text-xs opacity-80">Automatically commit changes after the specified interval</div>
                </div>
                <div class="flex items-center gap-3">
                    <span class="text-xs px-2 py-0.5 rounded font-medium uppercase ${enableAutoCommit ? 'bg-green-900 bg-opacity-30 text-green-400' : 'bg-red-900 bg-opacity-30 text-red-400'}">
                        ${enableAutoCommit ? 'ON' : 'OFF'}
                    </span>
                    <div class="toggle-switch ${enableAutoCommit ? 'on' : 'off'}" onclick="toggleSetting('enableAutoCommit')"></div>
                </div>
            </div>

            <div class="flex justify-between items-center py-3 border-b" style="border-color: var(--vscode-panel-border);">
                <div class="flex-1">
                    <div class="text-sm mb-1">Auto Commit Interval</div>
                    <div class="text-xs opacity-80">Time between automatic commits (1-120 minutes)</div>
                </div>
                <div class="flex items-center gap-3">
                    <input type="range" min="1" max="120" value="${autoCommitInterval}" 
                           class="slider" id="autoCommitInterval" 
                           oninput="updateSliderValue('autoCommitInterval', this.value)"
                           onchange="updateSetting('autoCommitInterval', parseInt(this.value))">
                    <span class="text-sm font-medium min-w-[60px] text-right" id="autoCommitIntervalValue">${autoCommitInterval} min</span>
                </div>
            </div>

            <div class="flex justify-between items-center py-3 border-b" style="border-color: var(--vscode-panel-border);">
                <div class="flex-1">
                    <div class="text-sm mb-1">Skip Confirmation</div>
                    <div class="text-xs opacity-80">
                        <i class="fas fa-exclamation-triangle"></i> Commit automatically WITHOUT confirmation dialogs
                    </div>
                </div>
                <div class="flex items-center gap-3">
                    <span class="text-xs px-2 py-0.5 rounded font-medium uppercase ${autoCommitWithoutConfirmation ? 'bg-green-900 bg-opacity-30 text-green-400' : 'bg-red-900 bg-opacity-30 text-red-400'}">
                        ${autoCommitWithoutConfirmation ? 'ON' : 'OFF'}
                    </span>
                    <div class="toggle-switch ${autoCommitWithoutConfirmation ? 'on' : 'off'}" onclick="toggleSetting('autoCommitWithoutConfirmation')"></div>
                </div>
            </div>

            ${autoCommitWithoutConfirmation ? `
                <div class="bg-yellow-900 bg-opacity-10 border border-yellow-900 border-opacity-30 rounded p-3 mt-3 text-sm text-yellow-400">
                    <i class="fas fa-exclamation-triangle"></i> Warning: Commits will be made automatically without asking for confirmation. Use with caution!
                </div>
            ` : ''}

            <!-- REMINDER SETTINGS -->
            <div class="text-sm font-medium uppercase tracking-wide opacity-70 my-5 pb-2 border-b" style="border-color: var(--vscode-panel-border);">
                <i class="fas fa-bell"></i> Reminders
            </div>

            <div class="flex justify-between items-center py-3 border-b" style="border-color: var(--vscode-panel-border);">
                <div class="flex-1">
                    <div class="text-sm mb-1">Enable Reminders</div>
                    <div class="text-xs opacity-80">Show notification when there are uncommitted changes</div>
                </div>
                <div class="flex items-center gap-3">
                    <span class="text-xs px-2 py-0.5 rounded font-medium uppercase ${enableReminder ? 'bg-green-900 bg-opacity-30 text-green-400' : 'bg-red-900 bg-opacity-30 text-red-400'}">
                        ${enableReminder ? 'ON' : 'OFF'}
                    </span>
                    <div class="toggle-switch ${enableReminder ? 'on' : 'off'}" onclick="toggleSetting('enableReminder')"></div>
                </div>
            </div>

            <div class="flex justify-between items-center py-3 border-b" style="border-color: var(--vscode-panel-border);">
                <div class="flex-1">
                    <div class="text-sm mb-1">Reminder Interval</div>
                    <div class="text-xs opacity-80">Time between reminder notifications (1-60 minutes)</div>
                </div>
                <div class="flex items-center gap-3">
                    <input type="range" min="1" max="60" value="${reminderInterval}" 
                           class="slider" id="reminderInterval" 
                           oninput="updateSliderValue('reminderInterval', this.value)"
                           onchange="updateSetting('reminderInterval', parseInt(this.value))">
                    <span class="text-sm font-medium min-w-[60px] text-right" id="reminderIntervalValue">${reminderInterval} min</span>
                </div>
            </div>

            <!-- AI SETTINGS -->
            <div class="text-sm font-medium uppercase tracking-wide opacity-70 my-5 pb-2 border-b" style="border-color: var(--vscode-panel-border);">
                <i class="fas fa-robot"></i> AI-Powered Commits
            </div>

            <div class="flex justify-between items-center py-3 border-b" style="border-color: var(--vscode-panel-border);">
                <div class="flex-1">
                    <div class="text-sm mb-1">Use AI Generation</div>
                    <div class="text-xs opacity-80">Generate detailed commit messages using AI</div>
                </div>
                <div class="flex items-center gap-3">
                    <span class="text-xs px-2 py-0.5 rounded font-medium uppercase ${useAIGeneration ? 'bg-green-900 bg-opacity-30 text-green-400' : 'bg-red-900 bg-opacity-30 text-red-400'}">
                        ${useAIGeneration ? 'ON' : 'OFF'}
                    </span>
                    <div class="toggle-switch ${useAIGeneration ? 'on' : 'off'}" onclick="toggleSetting('useAIGeneration')"></div>
                </div>
            </div>

            <div class="mt-3">
                <div class="cursor-pointer select-none py-2 flex items-center gap-2 text-sm" style="color: var(--vscode-textLink-foreground);" onclick="toggleCollapsible('aiSettings')">
                    <span id="aiSettingsIcon">▶</span> AI Provider Configuration
                </div>
                <div id="aiSettings" class="hidden mt-2 pl-4">
                    <div class="flex justify-between items-center py-3 border-b" style="border-color: var(--vscode-panel-border);">
                        <div class="flex-1">
                            <div class="text-sm mb-1">AI Provider</div>
                            <div class="text-xs opacity-80">Choose your preferred AI service provider</div>
                        </div>
                        <div>
                            <select id="aiProvider" class="rounded px-3 py-1.5 text-sm min-w-[200px]" onchange="updateSetting('aiProvider', this.value); updateModelOptions(this.value)">
                                <option value="openai" ${aiProvider === 'openai' ? 'selected' : ''}>OpenAI (GPT)</option>
                                <option value="anthropic" ${aiProvider === 'anthropic' ? 'selected' : ''}>Anthropic (Claude)</option>
                                <option value="gemini" ${aiProvider === 'gemini' ? 'selected' : ''}>Google Gemini</option>
                                <option value="openrouter" ${aiProvider === 'openrouter' ? 'selected' : ''}>OpenRouter</option>
                            </select>
                        </div>
                    </div>

                    <div class="flex justify-between items-center py-3 border-b" style="border-color: var(--vscode-panel-border);">
                        <div class="flex-1">
                            <div class="text-sm mb-1">AI Model</div>
                            <div class="text-xs opacity-80">Select the specific model to use</div>
                        </div>
                        <div>
                            <select id="aiModel" class="rounded px-3 py-1.5 text-sm min-w-[200px]" onchange="updateSetting('aiModel', this.value)">
                                <!-- OpenAI Models -->
                                <option value="gpt-4o-mini" ${aiModel === 'gpt-4o-mini' ? 'selected' : ''} data-provider="openai">GPT-4o Mini (Recommended)</option>
                                <option value="gpt-4o" ${aiModel === 'gpt-4o' ? 'selected' : ''} data-provider="openai">GPT-4o</option>
                                <option value="gpt-4-turbo" ${aiModel === 'gpt-4-turbo' ? 'selected' : ''} data-provider="openai">GPT-4 Turbo</option>
                                <option value="gpt-3.5-turbo" ${aiModel === 'gpt-3.5-turbo' ? 'selected' : ''} data-provider="openai">GPT-3.5 Turbo</option>
                                
                                <!-- Anthropic Models -->
                                <option value="claude-3-5-sonnet-20241022" ${aiModel === 'claude-3-5-sonnet-20241022' ? 'selected' : ''} data-provider="anthropic">Claude 3.5 Sonnet (Recommended)</option>
                                <option value="claude-3-opus-20240229" ${aiModel === 'claude-3-opus-20240229' ? 'selected' : ''} data-provider="anthropic">Claude 3 Opus</option>
                                <option value="claude-3-sonnet-20240229" ${aiModel === 'claude-3-sonnet-20240229' ? 'selected' : ''} data-provider="anthropic">Claude 3 Sonnet</option>
                                <option value="claude-3-haiku-20240307" ${aiModel === 'claude-3-haiku-20240307' ? 'selected' : ''} data-provider="anthropic">Claude 3 Haiku</option>
                                
                                <!-- Gemini Models -->
                                <option value="gemini-pro" ${aiModel === 'gemini-pro' ? 'selected' : ''} data-provider="gemini">Gemini Pro (Recommended)</option>
                                <option value="gemini-pro-vision" ${aiModel === 'gemini-pro-vision' ? 'selected' : ''} data-provider="gemini">Gemini Pro Vision</option>
                                
                                <!-- OpenRouter Models -->
                                <option value="anthropic/claude-3.5-sonnet" ${aiModel === 'anthropic/claude-3.5-sonnet' ? 'selected' : ''} data-provider="openrouter">Claude 3.5 Sonnet (OR)</option>
                                <option value="openai/gpt-4o" ${aiModel === 'openai/gpt-4o' ? 'selected' : ''} data-provider="openrouter">GPT-4o (OR)</option>
                                <option value="meta-llama/llama-3.1-405b-instruct" ${aiModel === 'meta-llama/llama-3.1-405b-instruct' ? 'selected' : ''} data-provider="openrouter">Llama 3.1 405B</option>
                                <option value="google/gemini-pro-1.5" ${aiModel === 'google/gemini-pro-1.5' ? 'selected' : ''} data-provider="openrouter">Gemini Pro 1.5 (OR)</option>
                            </select>
                        </div>
                    </div>

                    <div class="flex justify-between items-center py-3 border-b" style="border-color: var(--vscode-panel-border);">
                        <div class="flex-1">
                            <div class="text-sm mb-1">API Key</div>
                            <div class="text-xs opacity-80">
                                <div>Enter your API key for the selected provider</div>
                                <div class="mt-1">
                                    <a href="https://platform.openai.com/api-keys" class="text-xs hover:underline" style="color: var(--vscode-textLink-foreground);" target="_blank">
                                        <i class="fas fa-key"></i> OpenAI
                                    </a> • 
                                    <a href="https://console.anthropic.com/settings/keys" class="text-xs hover:underline" style="color: var(--vscode-textLink-foreground);" target="_blank">
                                        <i class="fas fa-key"></i> Anthropic
                                    </a> • 
                                    <a href="https://makersuite.google.com/app/apikey" class="text-xs hover:underline" style="color: var(--vscode-textLink-foreground);" target="_blank">
                                        <i class="fas fa-key"></i> Gemini
                                    </a> • 
                                    <a href="https://openrouter.ai/keys" class="text-xs hover:underline" style="color: var(--vscode-textLink-foreground);" target="_blank">
                                        <i class="fas fa-key"></i> OpenRouter
                                    </a>
                                </div>
                            </div>
                        </div>
                        <div class="relative inline-block">
                            <input type="password" id="aiApiKey" value="${this.escapeHtml(aiApiKey)}" 
                                   placeholder="Enter API Key" 
                                   class="rounded px-3 py-1.5 text-sm font-mono tracking-wide pr-16"
                                   style="min-width: 250px;"
                                   onblur="updateSetting('aiApiKey', this.value)">
                            <button class="absolute right-2 top-1/2 -translate-y-1/2 bg-transparent border-0 text-xs cursor-pointer px-1.5 py-0.5" style="color: var(--vscode-descriptionForeground);" onclick="togglePasswordVisibility('aiApiKey')">Show</button>
                        </div>
                    </div>

                    ${!aiApiKey && useAIGeneration ? `
                        <div class="bg-blue-900 bg-opacity-10 border border-blue-900 border-opacity-30 rounded p-3 mt-3 text-xs" style="color: var(--vscode-textLink-foreground);">
                            <i class="fas fa-info-circle"></i> You need to configure an API key to use AI-powered commit messages. Click the links above to get your API key.
                        </div>
                    ` : ''}
                </div>
            </div>

            <!-- COMMIT MESSAGE STYLE -->
            <div class="text-sm font-medium uppercase tracking-wide opacity-70 my-5 pb-2 border-b" style="border-color: var(--vscode-panel-border);">
                <i class="fas fa-pen"></i> Commit Message Style
            </div>

            <div class="flex justify-between items-center py-3 border-b" style="border-color: var(--vscode-panel-border);">
                <div class="flex-1">
                    <div class="text-sm mb-1">Message Style</div>
                    <div class="text-xs opacity-80">Choose your preferred commit message format</div>
                </div>
                <div>
                    <select id="commitMessageStyle" class="rounded px-3 py-1.5 text-sm min-w-[200px]" onchange="updateSetting('commitMessageStyle', this.value)">
                        <option value="conventional" ${commitMessageStyle === 'conventional' ? 'selected' : ''}>Conventional (feat:, fix:, etc.)</option>
                        <option value="simple" ${commitMessageStyle === 'simple' ? 'selected' : ''}>Simple (Plain text)</option>
                        <option value="detailed" ${commitMessageStyle === 'detailed' ? 'selected' : ''}>Detailed (With descriptions)</option>
                    </select>
                </div>
            </div>

            <div class="flex flex-wrap gap-3 mt-5">
                <button class="rounded px-4 py-2 text-sm cursor-pointer border-0 transition-colors" onclick="generateCommit()">
                    <i class="fas fa-rocket"></i> Generate Commit
                </button>
                <button class="secondary rounded px-4 py-2 text-sm cursor-pointer border-0 transition-colors" onclick="testAIConnection()">
                    <i class="fas fa-plug"></i> Test AI Connection
                </button>
                <button class="secondary rounded px-4 py-2 text-sm cursor-pointer border-0 transition-colors" onclick="openSettings()">
                    <i class="fas fa-cog"></i> Open VS Code Settings
                </button>
                <button class="secondary rounded px-4 py-2 text-sm cursor-pointer border-0 transition-colors" onclick="clearHistory()">
                    <i class="fas fa-trash"></i> Clear History
                </button>
            </div>
        </section>

        <!-- Commits Section -->
        <section class="p-5 rounded border" style="background-color: var(--vscode-sideBar-background); border-color: var(--vscode-panel-border);">
            <h2 class="text-lg font-medium mb-5 flex items-center gap-2">
                <i class="fas fa-history"></i> Recent Commits (${totalCommits})
            </h2>
            
            ${totalCommits === 0 ? `
                <div class="text-center py-16 px-5 opacity-70">
                    <h3 class="text-lg mb-3">
                        <i class="fas fa-inbox"></i> No commits yet
                    </h3>
                    <p class="mb-5">Start committing to see your history here</p>
                    <button class="rounded px-4 py-2 text-sm cursor-pointer border-0 transition-colors" onclick="generateCommit()">
                        <i class="fas fa-plus-circle"></i> Make Your First Commit
                    </button>
                </div>
            ` : commitHistory.map(commit => `
                <div class="p-4 mb-3 rounded border-l-4" style="background-color: var(--vscode-editor-inactiveSelectionBackground); border-color: var(--vscode-button-background);">
                    <div class="flex justify-between mb-2 text-xs opacity-70">
                        <span><i class="fas fa-hashtag"></i> ${commit.hash || 'N/A'}</span>
                        <span><i class="fas fa-clock"></i> ${this.formatTime(commit.timestamp)}</span>
                    </div>
                    <div class="text-sm mb-2">
                        <i class="fas fa-comment-alt"></i> ${this.escapeHtml(commit.message.split('\n')[0])}
                    </div>
                    <div class="text-xs opacity-70">
                        <i class="fas fa-file-code"></i> ${commit.files.length} file${commit.files.length !== 1 ? 's' : ''} • 
                        ${commit.files.slice(0, 2).map(f => this.escapeHtml(f)).join(', ')}${commit.files.length > 2 ? ` +${commit.files.length - 2} more` : ''}
                    </div>
                </div>
            `).join('')}
        </section>
    </div>

    <script>
        const vscode = acquireVsCodeApi();

        window.addEventListener('DOMContentLoaded', () => {
            updateModelOptions('${aiProvider}');
        });

        function toggleCollapsible(id) {
            const content = document.getElementById(id);
            const icon = document.getElementById(id + 'Icon');
            
            if (content.classList.contains('hidden')) {
                content.classList.remove('hidden');
                icon.textContent = '▼';
            } else {
                content.classList.add('hidden');
                icon.textContent = '▶';
            }
        }

        function updateModelOptions(provider) {
            const modelSelect = document.getElementById('aiModel');
            const options = modelSelect.options;
            
            for (let i = 0; i < options.length; i++) {
                const option = options[i];
                const optionProvider = option.getAttribute('data-provider');
                
                if (optionProvider === provider) {
                    option.style.display = 'block';
                } else {
                    option.style.display = 'none';
                }
            }
            
            const currentOption = modelSelect.options[modelSelect.selectedIndex];
            if (currentOption.style.display === 'none') {
                for (let i = 0; i < options.length; i++) {
                    if (options[i].style.display !== 'none') {
                        modelSelect.selectedIndex = i;
                        updateSetting('aiModel', options[i].value);
                        break;
                    }
                }
            }
        }

        function togglePasswordVisibility(inputId) {
            const input = document.getElementById(inputId);
            const button = input.nextElementSibling;
            
            if (input.type === 'password') {
                input.type = 'text';
                button.textContent = 'Hide';
            } else {
                input.type = 'password';
                button.textContent = 'Show';
            }
        }

        function updateSliderValue(sliderId, value) {
            document.getElementById(sliderId + 'Value').textContent = value + ' min';
        }

        function toggleSetting(settingName) {
            vscode.postMessage({ 
                command: 'updateSetting', 
                setting: settingName,
                value: 'toggle'
            });
        }

        function updateSetting(settingName, value) {
            vscode.postMessage({ 
                command: 'updateSetting', 
                setting: settingName,
                value: value
            });
        }

        function clearHistory() {
            if (confirm('Are you sure you want to clear all commit history?')) {
                vscode.postMessage({ command: 'clearHistory' });
            }
        }

        function openSettings() {
            vscode.postMessage({ command: 'openSettings' });
        }

        function generateCommit() {
            vscode.postMessage({ command: 'generateCommit' });
        }

        function testAIConnection() {
            vscode.postMessage({ command: 'testAIConnection' });
        }
    </script>
</body>
</html>`;
    }
    static formatTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        if (days > 0)
            return `${days}d ago`;
        if (hours > 0)
            return `${hours}h ago`;
        if (minutes > 0)
            return `${minutes}m ago`;
        return 'just now';
    }
    static escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }
}
exports.DashboardUI = DashboardUI;
//# sourceMappingURL=dashboard.js.map