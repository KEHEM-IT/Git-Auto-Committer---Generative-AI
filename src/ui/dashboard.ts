import * as vscode from 'vscode';
import { CommitHistory } from '../types';
import { PROVIDER_NAMES } from '../config/constants';

export class DashboardUI {
    static getDashboardHtml(commitHistory: CommitHistory[], extensionPath: string): string {
        const config = vscode.workspace.getConfiguration('gitAutoCommit');
        const autoEnabled = config.get('enableAutoCommit', false);
        const autoWithoutConfirm = config.get('autoCommitWithoutConfirmation', false);
        const interval = config.get('autoCommitInterval', 10);
        const reminderEnabled = config.get('enableReminder', true);
        const reminderInterval = config.get('reminderInterval', 5);
        const useAI = config.get('useAIGeneration', false);
        const aiProvider = config.get('aiProvider', 'openai') as string;
        const aiModel = config.get('aiModel', '') as string;
        const commitStyle = config.get('commitMessageStyle', 'conventional') as string;

        const apiKeyField = `${aiProvider}ApiKey`;
        const hasApiKey = !!(config.get(apiKeyField, '') as string);

        // Get logo URI for webview
        const logoUri = vscode.Uri.file(extensionPath + '/images/icon.png');

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
    <title>Git Commit Dashboard</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
</head>
<body class="bg-gray-900 text-gray-100 p-8">
    <div class="max-w-6xl mx-auto">
        <!-- Header with Logo -->
        <div class="text-center mb-10 bg-gray-800 border border-gray-700 rounded-xl p-8">
            <img src="${logoUri.toString()}" alt="Logo" class="w-20 h-20 mx-auto mb-4">
            <h1 class="text-4xl font-bold mb-2">Git Commit Dashboard</h1>
            <p class="text-gray-400">Track your commits and manage automation</p>
        </div>

        <!-- Statistics -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div class="bg-gray-800 border border-gray-700 rounded-xl p-6 text-center hover:transform hover:-translate-y-1 transition-transform">
                <div class="text-4xl font-bold mb-2">${totalCommits}</div>
                <div class="text-sm text-gray-400 uppercase tracking-wider">Total Commits</div>
            </div>
            <div class="bg-gray-800 border border-gray-700 rounded-xl p-6 text-center hover:transform hover:-translate-y-1 transition-transform">
                <div class="text-4xl font-bold mb-2">${todayCommits}</div>
                <div class="text-sm text-gray-400 uppercase tracking-wider">Today's Commits</div>
            </div>
            <div class="bg-gray-800 border border-gray-700 rounded-xl p-6 text-center hover:transform hover:-translate-y-1 transition-transform">
                <div class="text-4xl font-bold mb-2">${filesChanged}</div>
                <div class="text-sm text-gray-400 uppercase tracking-wider">Files Changed</div>
            </div>
        </div>

        <!-- Settings Panel -->
        <div class="bg-gray-800 border border-gray-700 rounded-xl p-8 mb-8">
            <h2 class="text-2xl font-bold mb-6">Current Configuration</h2>
            
            <div class="space-y-4">
                <div class="flex justify-between items-center p-4 bg-gray-700 rounded-lg">
                    <div class="font-medium">Auto Commit</div>
                    <div class="flex items-center gap-3">
                        <span class="px-4 py-1 rounded-full text-sm font-semibold ${autoEnabled ? 'bg-green-500 text-black' : 'bg-red-500 text-black'}">
                            ${autoEnabled ? 'ENABLED' : 'DISABLED'}
                        </span>
                        <button onclick="toggleAutoCommit()" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
                            ${autoEnabled ? 'Disable' : 'Enable'}
                        </button>
                    </div>
                </div>

                <div class="flex justify-between items-center p-4 bg-gray-700 rounded-lg">
                    <div class="font-medium">Commit Interval</div>
                    <select onchange="updateInterval(this.value)" class="px-4 py-2 bg-gray-600 border border-gray-500 rounded-lg">
                        ${[1, 5, 10, 15, 30, 60].map(v => 
                            `<option value="${v}" ${interval === v ? 'selected' : ''}>${v} min</option>`
                        ).join('')}
                    </select>
                </div>

                <div class="flex justify-between items-center p-4 bg-gray-700 rounded-lg">
                    <div class="font-medium">Auto-Commit Without Confirmation</div>
                    <div class="flex items-center gap-3">
                        <span class="px-4 py-1 rounded-full text-sm font-semibold ${autoWithoutConfirm ? 'bg-yellow-500 text-black' : 'bg-blue-500 text-white'}">
                            ${autoWithoutConfirm ? 'YES' : 'NO'}
                        </span>
                        <button onclick="toggleConfirmation()" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
                            ${autoWithoutConfirm ? 'Require Confirmation' : 'Skip Confirmation'}
                        </button>
                    </div>
                </div>

                ${autoWithoutConfirm ? `
                    <div class="flex items-center gap-3 p-4 bg-yellow-900 bg-opacity-20 border-2 border-yellow-500 rounded-lg">
                        <span class="text-yellow-500">⚠️ Commits will be made automatically without asking for confirmation!</span>
                    </div>
                ` : ''}

                <div class="flex justify-between items-center p-4 bg-gray-700 rounded-lg">
                    <div class="font-medium">Commit Reminder</div>
                    <div class="flex items-center gap-3">
                        <span class="px-4 py-1 rounded-full text-sm font-semibold ${reminderEnabled ? 'bg-green-500 text-black' : 'bg-red-500 text-black'}">
                            ${reminderEnabled ? 'ENABLED' : 'DISABLED'}
                        </span>
                        <select onchange="updateReminderInterval(this.value)" class="px-4 py-2 bg-gray-600 border border-gray-500 rounded-lg">
                            ${[1, 5, 10, 15, 30].map(v => 
                                `<option value="${v}" ${reminderInterval === v ? 'selected' : ''}>${v} min</option>`
                            ).join('')}
                        </select>
                    </div>
                </div>

                <div class="flex justify-between items-center p-4 bg-gray-700 rounded-lg">
                    <div class="font-medium">AI Generation</div>
                    <div class="flex items-center gap-3">
                        <span class="px-4 py-1 rounded-full text-sm font-semibold ${useAI ? 'bg-green-500 text-black' : 'bg-red-500 text-black'}">
                            ${useAI ? 'ENABLED' : 'DISABLED'}
                        </span>
                        <button onclick="configureAI()" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
                            ${useAI ? 'Reconfigure' : 'Enable'} AI
                        </button>
                    </div>
                </div>

                ${useAI ? `
                    <div class="flex justify-between items-center p-4 bg-gray-700 rounded-lg">
                        <div class="font-medium">AI Provider</div>
                        <div class="flex items-center gap-3">
                            <span class="px-4 py-1 rounded-full text-sm font-semibold bg-blue-500 text-white">${PROVIDER_NAMES[aiProvider] || aiProvider}</span>
                            ${hasApiKey ? 
                                '<span class="text-green-500">✓ API Key Configured</span>' : 
                                '<span class="px-4 py-1 rounded-full text-sm font-semibold bg-yellow-500 text-black">⚠️ No API Key</span>'
                            }
                        </div>
                    </div>

                    <div class="flex justify-between items-center p-4 bg-gray-700 rounded-lg">
                        <div class="font-medium">AI Model</div>
                        <span class="text-gray-400">${aiModel || 'Default'}</span>
                    </div>

                    <div class="flex justify-between items-center p-4 bg-gray-700 rounded-lg">
                        <div class="font-medium">Commit Message Style</div>
                        <select onchange="updateCommitStyle(this.value)" class="px-4 py-2 bg-gray-600 border border-gray-500 rounded-lg">
                            <option value="conventional" ${commitStyle === 'conventional' ? 'selected' : ''}>Conventional (feat:, fix:)</option>
                            <option value="simple" ${commitStyle === 'simple' ? 'selected' : ''}>Simple</option>
                            <option value="detailed" ${commitStyle === 'detailed' ? 'selected' : ''}>Detailed</option>
                        </select>
                    </div>
                ` : ''}
            </div>

            <div class="flex flex-wrap gap-4 mt-6">
                <button onclick="refresh()" class="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
                    Refresh Dashboard
                </button>
                <button onclick="generateCommit()" class="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
                    Generate Commit
                </button>
                <button onclick="openSettings()" class="px-6 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors">
                    Advanced Settings
                </button>
                <button onclick="clearHistory()" class="px-6 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors">
                    Clear History
                </button>
            </div>
        </div>

        <!-- Commits Section -->
        <div class="bg-gray-800 border border-gray-700 rounded-xl p-8">
            <h2 class="text-2xl font-bold mb-6">Recent Commits (${totalCommits})</h2>
            
            ${totalCommits === 0 ? `
                <div class="text-center py-16">
                    <h3 class="text-2xl font-bold mb-3">No commits yet</h3>
                    <p class="text-gray-400 mb-6">Start committing to see your history here!</p>
                    <button onclick="generateCommit()" class="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
                        Make Your First Commit
                    </button>
                </div>
            ` : commitHistory.map(commit => `
                <div class="bg-gray-700 border-l-4 border-blue-500 rounded-lg p-5 mb-4 hover:bg-gray-600 transition-colors">
                    <div class="flex justify-between items-center mb-3">
                        <span class="font-mono text-sm bg-gray-800 text-yellow-300 px-3 py-1 rounded border border-gray-600">
                            # ${commit.hash || 'N/A'}
                        </span>
                        <span class="text-sm text-gray-400">${this.formatTime(commit.timestamp)}</span>
                    </div>
                    <div class="text-lg font-semibold mb-2">${this.escapeHtml(commit.message.split('\n')[0])}</div>
                    <div class="flex items-center gap-2 text-sm">
                        <span class="bg-gray-600 text-white px-3 py-1 rounded-full">
                            ${commit.files.length} file${commit.files.length !== 1 ? 's' : ''}
                        </span>
                        <span class="text-gray-400">${commit.files.slice(0, 2).join(', ')}${commit.files.length > 2 ? ` +${commit.files.length - 2} more` : ''}</span>
                    </div>
                </div>
            `).join('')}
        </div>
    </div>

    <script>
        const vscode = acquireVsCodeApi();

        function refresh() {
            vscode.postMessage({ command: 'refresh' });
        }

        function clearHistory() {
            if (confirm('Are you sure you want to clear all commit history?')) {
                vscode.postMessage({ command: 'clearHistory' });
            }
        }

        function configureAI() {
            vscode.postMessage({ command: 'configureAI' });
        }

        function openSettings() {
            vscode.postMessage({ command: 'openSettings' });
        }

        function generateCommit() {
            vscode.postMessage({ command: 'generateCommit' });
        }

        function toggleAutoCommit() {
            vscode.postMessage({ command: 'toggleAutoCommit' });
        }

        function toggleConfirmation() {
            vscode.postMessage({ command: 'toggleConfirmation' });
        }

        function updateInterval(value) {
            vscode.postMessage({ command: 'updateInterval', value: parseInt(value) });
        }

        function updateReminderInterval(value) {
            vscode.postMessage({ command: 'updateReminderInterval', value: parseInt(value) });
        }

        function updateCommitStyle(value) {
            vscode.postMessage({ command: 'updateCommitStyle', value: value });
        }
    </script>
</body>
</html>`;
    }

    private static formatTime(timestamp: number): string {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days}d ago`;
        if (hours > 0) return `${hours}h ago`;
        if (minutes > 0) return `${minutes}m ago`;
        return 'just now';
    }

    private static escapeHtml(text: string): string {
        const map: { [key: string]: string } = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }
}
