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
exports.DefaultCommitGenerator = void 0;
const vscode = __importStar(require("vscode"));
/**
 * Default commit message generator that works without AI
 * Supports three message styles: conventional, simple, and detailed
 */
class DefaultCommitGenerator {
    /**
     * Generates a commit message based on git diff without AI
     * @param diff The git diff string
     * @returns A formatted commit message
     */
    static generate(diff) {
        const config = vscode.workspace.getConfiguration('gitAutoCommit');
        const style = config.get('commitMessageStyle', 'conventional');
        const analysis = this.analyzeDiff(diff);
        switch (style) {
            case 'conventional':
                return this.generateConventional(analysis);
            case 'simple':
                return this.generateSimple(analysis);
            case 'detailed':
                return this.generateDetailed(analysis);
            default:
                return this.generateConventional(analysis);
        }
    }
    /**
     * Analyzes the diff to extract meaningful information
     */
    static analyzeDiff(diff) {
        const lines = diff.split('\n');
        const analysis = {
            filesChanged: new Set(),
            additions: 0,
            deletions: 0,
            fileTypes: new Map(),
            changeTypes: new Set(),
            directories: new Set()
        };
        let currentFile = '';
        let inNewFilesSection = false;
        for (const line of lines) {
            // Handle "New files:" format
            if (line.trim() === 'New files:') {
                inNewFilesSection = true;
                continue;
            }
            if (inNewFilesSection && line.trim()) {
                const fileName = line.trim();
                if (fileName) {
                    analysis.filesChanged.add(fileName);
                    const ext = this.getFileExtension(fileName);
                    analysis.fileTypes.set(ext, (analysis.fileTypes.get(ext) || 0) + 1);
                    const dir = this.getDirectory(fileName);
                    if (dir) {
                        analysis.directories.add(dir);
                    }
                    const changeType = this.detectChangeType(fileName);
                    analysis.changeTypes.add(changeType);
                    // Count as addition for new files
                    analysis.additions += 10; // Estimate lines per new file
                }
                continue;
            }
            // Track file changes from diff format
            if (line.startsWith('diff --git')) {
                const match = line.match(/b\/(.*?)(\s|$)/);
                if (match) {
                    currentFile = match[1];
                    analysis.filesChanged.add(currentFile);
                    // Track file type
                    const ext = this.getFileExtension(currentFile);
                    analysis.fileTypes.set(ext, (analysis.fileTypes.get(ext) || 0) + 1);
                    // Track directory
                    const dir = this.getDirectory(currentFile);
                    if (dir) {
                        analysis.directories.add(dir);
                    }
                    // Determine change type
                    const changeType = this.detectChangeType(currentFile);
                    analysis.changeTypes.add(changeType);
                }
            }
            // Track additions
            else if (line.startsWith('+') && !line.startsWith('+++')) {
                analysis.additions++;
            }
            // Track deletions
            else if (line.startsWith('-') && !line.startsWith('---')) {
                analysis.deletions++;
            }
            // Track new file marker
            else if (line.startsWith('new file mode')) {
                if (currentFile) {
                    analysis.additions += 10; // Estimate for new file
                }
            }
            // Track deleted file marker
            else if (line.startsWith('deleted file mode')) {
                if (currentFile) {
                    analysis.deletions += 10; // Estimate for deleted file
                }
            }
        }
        return analysis;
    }
    /**
     * Generates a conventional commit message (feat:, fix:, docs:, etc.)
     */
    static generateConventional(analysis) {
        const type = this.determineConventionalType(analysis);
        const scope = this.determineScope(analysis);
        const subject = this.generateSubject(analysis);
        const scopePart = scope ? `(${scope})` : '';
        let message = `${type}${scopePart}: ${subject}`;
        // Add body with statistics if there are actual changes
        const files = Array.from(analysis.filesChanged);
        if (files.length > 0) {
            const stats = `\n\n- ${files.length} file${files.length !== 1 ? 's' : ''} changed`;
            const changes = [];
            if (analysis.additions > 0)
                changes.push(`${analysis.additions} insertions(+)`);
            if (analysis.deletions > 0)
                changes.push(`${analysis.deletions} deletions(-)`);
            if (changes.length > 0) {
                message += `${stats}: ${changes.join(', ')}`;
            }
            else {
                message += stats;
            }
        }
        return message;
    }
    /**
     * Generates a simple commit message
     */
    static generateSimple(analysis) {
        const files = Array.from(analysis.filesChanged);
        const fileCount = files.length;
        if (fileCount === 0) {
            return 'Update files';
        }
        if (fileCount === 1) {
            return `Update ${files[0]}`;
        }
        if (fileCount === 2) {
            return `Update ${files[0]} and ${files[1]}`;
        }
        const parts = [];
        if (analysis.additions > 0)
            parts.push(`+${analysis.additions}`);
        if (analysis.deletions > 0)
            parts.push(`-${analysis.deletions}`);
        const firstTwo = files.slice(0, 2).join(', ');
        const more = fileCount > 2 ? ` and ${fileCount - 2} more file${fileCount - 2 !== 1 ? 's' : ''}` : '';
        const statsStr = parts.length > 0 ? ` (${parts.join('/')})` : '';
        return `Update ${fileCount} files${statsStr}: ${firstTwo}${more}`;
    }
    /**
     * Generates a detailed commit message with descriptions
     */
    static generateDetailed(analysis) {
        const type = this.determineConventionalType(analysis);
        const files = Array.from(analysis.filesChanged);
        const fileTypes = Array.from(analysis.fileTypes.entries())
            .sort((a, b) => b[1] - a[1]);
        let message = `${type}: Update ${files.length} file${files.length !== 1 ? 's' : ''}`;
        // Add file type breakdown
        if (fileTypes.length > 0) {
            const typeDesc = fileTypes
                .map(([ext, count]) => `${count} ${ext} file${count !== 1 ? 's' : ''}`)
                .join(', ');
            message += `\n\nModified: ${typeDesc}`;
        }
        // Add statistics
        const stats = [];
        if (analysis.additions > 0)
            stats.push(`${analysis.additions} additions`);
        if (analysis.deletions > 0)
            stats.push(`${analysis.deletions} deletions`);
        if (stats.length > 0) {
            message += `\n\nChanges: ${stats.join(', ')}`;
        }
        // Add affected files (up to 5)
        if (files.length > 0) {
            const fileList = files.slice(0, 5).map(f => `  - ${f}`).join('\n');
            const more = files.length > 5 ? `\n  ... and ${files.length - 5} more files` : '';
            message += `\n\nFiles:\n${fileList}${more}`;
        }
        return message;
    }
    /**
     * Determines the conventional commit type based on changes
     */
    static determineConventionalType(analysis) {
        const files = Array.from(analysis.filesChanged);
        const changeTypes = Array.from(analysis.changeTypes);
        // Check for specific patterns
        if (changeTypes.includes('test'))
            return 'test';
        if (changeTypes.includes('docs'))
            return 'docs';
        if (changeTypes.includes('config'))
            return 'chore';
        if (changeTypes.includes('style'))
            return 'style';
        // Check if it's mainly deletions (cleanup)
        if (analysis.deletions > analysis.additions * 2) {
            return 'refactor';
        }
        // Check file types
        const hasSourceFiles = files.some(f => /\.(ts|js|tsx|jsx|py|java|cpp|c|go|rs)$/i.test(f));
        if (hasSourceFiles) {
            // If more additions than deletions, likely a feature
            if (analysis.additions > analysis.deletions * 1.5) {
                return 'feat';
            }
            // Otherwise, could be a fix
            return 'fix';
        }
        return 'chore';
    }
    /**
     * Determines the scope based on directory or file type
     */
    static determineScope(analysis) {
        const dirs = Array.from(analysis.directories);
        // If all changes are in one directory, use that as scope
        if (dirs.length === 1 && dirs[0] !== '.') {
            return dirs[0];
        }
        // If changes are in multiple related directories, try to find common parent
        if (dirs.length > 1) {
            const commonDir = this.findCommonDirectory(dirs);
            if (commonDir && commonDir !== '.') {
                return commonDir;
            }
        }
        return null;
    }
    /**
     * Generates a subject line for the commit
     */
    static generateSubject(analysis) {
        const files = Array.from(analysis.filesChanged);
        const fileTypes = Array.from(analysis.fileTypes.entries())
            .sort((a, b) => b[1] - a[1]);
        // If single file, use filename
        if (files.length === 1) {
            const fileName = files[0].split('/').pop() || files[0];
            return `update ${fileName}`;
        }
        // If multiple files of same type, mention the type
        if (fileTypes.length === 1) {
            const [ext, count] = fileTypes[0];
            return `update ${count} ${ext} file${count !== 1 ? 's' : ''}`;
        }
        // General message
        return `update ${files.length} files`;
    }
    /**
     * Detects the type of change based on filename
     */
    static detectChangeType(filename) {
        const name = filename.toLowerCase();
        if (name.includes('test') || name.includes('.spec.') || name.includes('.test.')) {
            return 'test';
        }
        if (name.includes('readme') || name.includes('doc') || name.endsWith('.md')) {
            return 'docs';
        }
        if (name.includes('config') || name.includes('.json') || name.includes('.yml') || name.includes('.yaml')) {
            return 'config';
        }
        if (name.includes('.css') || name.includes('.scss') || name.includes('.sass') || name.includes('.less')) {
            return 'style';
        }
        return 'code';
    }
    /**
     * Gets file extension
     */
    static getFileExtension(filename) {
        const parts = filename.split('.');
        if (parts.length > 1) {
            return parts[parts.length - 1];
        }
        return 'file';
    }
    /**
     * Gets directory name
     */
    static getDirectory(filename) {
        const parts = filename.split('/');
        if (parts.length > 1) {
            return parts[0];
        }
        return '.';
    }
    /**
     * Finds common directory among multiple directories
     */
    static findCommonDirectory(dirs) {
        if (dirs.length === 0)
            return null;
        if (dirs.length === 1)
            return dirs[0];
        const parts = dirs.map(d => d.split('/'));
        const minLength = Math.min(...parts.map(p => p.length));
        for (let i = 0; i < minLength; i++) {
            const first = parts[0][i];
            if (!parts.every(p => p[i] === first)) {
                if (i === 0)
                    return null;
                return parts[0].slice(0, i).join('/');
            }
        }
        return parts[0].slice(0, minLength).join('/');
    }
}
exports.DefaultCommitGenerator = DefaultCommitGenerator;
//# sourceMappingURL=defaultCommitGenerator.js.map