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
exports.ShowDashboardCommand = void 0;
const vscode = __importStar(require("vscode"));
const dashboard_1 = require("../ui/dashboard");
class ShowDashboardCommand {
    static execute(context) {
        const panel = vscode.window.createWebviewPanel('commitDashboard', 'Git Commit History', vscode.ViewColumn.One, { enableScripts: true });
        const commitHistory = context.globalState.get('commitHistory', []);
        panel.webview.html = dashboard_1.DashboardUI.getDashboardHtml(commitHistory);
        panel.webview.onDidReceiveMessage(async (message) => {
            switch (message.command) {
                case 'refresh':
                    const updatedHistory = context.globalState.get('commitHistory', []);
                    panel.webview.html = dashboard_1.DashboardUI.getDashboardHtml(updatedHistory);
                    break;
                case 'clearHistory':
                    await context.globalState.update('commitHistory', []);
                    panel.webview.html = dashboard_1.DashboardUI.getDashboardHtml([]);
                    break;
                case 'configureAI':
                    await vscode.commands.executeCommand('gitAutoCommit.configureAI');
                    const newHistory = context.globalState.get('commitHistory', []);
                    panel.webview.html = dashboard_1.DashboardUI.getDashboardHtml(newHistory);
                    break;
                case 'openSettings':
                    vscode.commands.executeCommand('workbench.action.openSettings', 'gitAutoCommit');
                    break;
            }
        });
    }
}
exports.ShowDashboardCommand = ShowDashboardCommand;
//# sourceMappingURL=showDashboard.js.map