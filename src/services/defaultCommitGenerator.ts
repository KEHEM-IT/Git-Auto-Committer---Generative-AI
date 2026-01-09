import * as vscode from 'vscode';

/**
 * Default commit message generator that works without AI
 * Supports three message styles: conventional, simple, and detailed
 */
export class DefaultCommitGenerator {
    /**
     * Generates a commit message based on git diff without AI
     * @param diff The git diff string
     * @returns A formatted commit message
     */
    static generate(diff: string): string {
        const config = vscode.workspace.getConfiguration('gitAutoCommit');
        const style = config.get<string>('commitMessageStyle', 'conventional');

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
    private static analyzeDiff(diff: string): DiffAnalysis {
        const lines = diff.split('\n');
        const analysis: DiffAnalysis = {
            filesChanged: new Set<string>(),
            additions: 0,
            deletions: 0,
            fileTypes: new Map<string, number>(),
            changeTypes: new Set<string>(),
            directories: new Set<string>(),
            isNewFiles: false,
            isDeletedFiles: false,
            isModifiedFiles: false
        };

        let currentFile = '';
        let inNewFilesSection = false;

        for (const line of lines) {
            if (line.trim() === 'New files:') {
                inNewFilesSection = true;
                analysis.isNewFiles = true;
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
                    
                    analysis.additions += 10;
                }
                continue;
            }

            if (line.startsWith('diff --git')) {
                const match = line.match(/b\/(.*?)(\s|$)/);
                if (match) {
                    currentFile = match[1];
                    analysis.filesChanged.add(currentFile);

                    const ext = this.getFileExtension(currentFile);
                    analysis.fileTypes.set(ext, (analysis.fileTypes.get(ext) || 0) + 1);

                    const dir = this.getDirectory(currentFile);
                    if (dir) {
                        analysis.directories.add(dir);
                    }

                    const changeType = this.detectChangeType(currentFile);
                    analysis.changeTypes.add(changeType);
                }
            } 
            else if (line.startsWith('+') && !line.startsWith('+++')) {
                analysis.additions++;
            } 
            else if (line.startsWith('-') && !line.startsWith('---')) {
                analysis.deletions++;
            }
            else if (line.startsWith('new file mode')) {
                analysis.isNewFiles = true;
                if (currentFile) {
                    analysis.additions += 10;
                }
            }
            else if (line.startsWith('deleted file mode')) {
                analysis.isDeletedFiles = true;
                if (currentFile) {
                    analysis.deletions += 10;
                }
            }
            else if (line.startsWith('index ') && currentFile) {
                analysis.isModifiedFiles = true;
            }
        }

        return analysis;
    }

    /**
     * Generates a conventional commit message (feat:, fix:, etc.)
     */
    private static generateConventional(analysis: DiffAnalysis): string {
        const type = this.determineConventionalType(analysis);
        const scope = this.determineScope(analysis);
        const subject = this.generateSubject(analysis);

        const scopePart = scope ? `(${scope})` : '';
        let message = `${type}${scopePart}: ${subject}`;

        const files = Array.from(analysis.filesChanged);
        if (files.length > 0) {
            const stats = `\n\n- ${files.length} file${files.length !== 1 ? 's' : ''} changed`;
            const changes = [];
            if (analysis.additions > 0) changes.push(`${analysis.additions} insertions(+)`);
            if (analysis.deletions > 0) changes.push(`${analysis.deletions} deletions(-)`);
            if (changes.length > 0) {
                message += `${stats}: ${changes.join(', ')}`;
            } else {
                message += stats;
            }
        }

        return message;
    }

    /**
     * Generates a simple, clear message explaining what changed
     */
    private static generateSimple(analysis: DiffAnalysis): string {
        const files = Array.from(analysis.filesChanged);
        const fileCount = files.length;

        if (fileCount === 0) {
            return 'Updated project files';
        }

        // Single file
        if (fileCount === 1) {
            const file = files[0];
            const fileName = file.split('/').pop() || file;
            
            if (analysis.isNewFiles) {
                return `Created ${fileName}`;
            } else if (analysis.isDeletedFiles) {
                return `Removed ${fileName}`;
            } else {
                return `Modified ${fileName}`;
            }
        }

        // Multiple files - describe the action and what was affected
        const action = analysis.isNewFiles && !analysis.isModifiedFiles ? 'Added' : 
                      analysis.isDeletedFiles && !analysis.isModifiedFiles ? 'Removed' : 
                      'Updated';

        // Group by directory or type
        const mainDir = this.getMostCommonDirectory(analysis);
        if (mainDir && mainDir !== '.') {
            return `${action} ${fileCount} files in ${mainDir}`;
        }

        const mainType = this.getMostCommonFileType(analysis);
        const typeName = this.getReadableFileTypePlural(mainType);
        
        return `${action} ${fileCount} ${typeName}`;
    }

    /**
     * Generates a detailed, narrative-style commit message
     */
    private static generateDetailed(analysis: DiffAnalysis): string {
        const files = Array.from(analysis.filesChanged);
        const fileCount = files.length;

        if (fileCount === 0) {
            return 'Made updates to the project';
        }

        // Start with a descriptive summary
        let message = this.createNarrativeSummary(analysis, fileCount);

        // Add details about what changed
        message += '\n\n' + this.describeChanges(analysis, files);

        // Add technical details
        message += '\n\n' + this.createTechnicalSummary(analysis);

        return message;
    }

    /**
     * Creates a narrative summary
     */
    private static createNarrativeSummary(analysis: DiffAnalysis, fileCount: number): string {
        const changeTypes = Array.from(analysis.changeTypes);
        
        // Documentation updates
        if (changeTypes.includes('docs')) {
            return fileCount === 1 ? 
                'Updated project documentation with latest information' :
                'Refreshed documentation to reflect current project state';
        }

        // Configuration changes
        if (changeTypes.includes('config')) {
            return 'Adjusted project configuration and settings';
        }

        // Test changes
        if (changeTypes.includes('test')) {
            return 'Enhanced test coverage and testing capabilities';
        }

        // Style changes
        if (changeTypes.includes('style')) {
            return 'Improved visual appearance and styling';
        }

        // Code changes
        if (analysis.isNewFiles && !analysis.isModifiedFiles) {
            const mainType = this.getMostCommonFileType(analysis);
            const typeName = this.getReadableFileTypePlural(mainType);
            return `Introduced new ${typeName} to expand functionality`;
        }

        if (analysis.isDeletedFiles && !analysis.isModifiedFiles) {
            return 'Cleaned up unused code and removed obsolete files';
        }

        if (analysis.deletions > analysis.additions * 1.5) {
            return 'Refactored codebase to improve maintainability';
        }

        return `Enhanced ${fileCount} file${fileCount !== 1 ? 's' : ''} with improvements`;
    }

    /**
     * Describes what changed in detail
     */
    private static describeChanges(analysis: DiffAnalysis, files: string[]): string {
        const filesByType = this.groupFilesByType(files);
        const descriptions: string[] = [];

        // Describe each file type
        const sortedTypes = Array.from(filesByType.entries())
            .sort((a, b) => b[1].length - a[1].length)
            .slice(0, 3);

        for (const [type, typeFiles] of sortedTypes) {
            const count = typeFiles.length;
            const typeName = this.getReadableFileTypePlural(type);
            
            if (count === 1) {
                const fileName = typeFiles[0].split('/').pop() || typeFiles[0];
                descriptions.push(`Modified ${fileName}`);
            } else {
                descriptions.push(`Updated ${count} ${typeName}`);
            }
        }

        if (descriptions.length === 0) {
            return 'Made various improvements to the codebase';
        }

        return 'Changes include: ' + descriptions.join(', ');
    }

    /**
     * Creates a technical summary with stats
     */
    private static createTechnicalSummary(analysis: DiffAnalysis): string {
        const lines = [];
        
        if (analysis.additions > 0 && analysis.deletions > 0) {
            lines.push(`Modified ${analysis.additions + analysis.deletions} lines`);
            lines.push(`(+${analysis.additions} additions, -${analysis.deletions} deletions)`);
        } else if (analysis.additions > 0) {
            lines.push(`Added ${analysis.additions} new lines`);
        } else if (analysis.deletions > 0) {
            lines.push(`Removed ${analysis.deletions} lines`);
        }

        return lines.join(' ');
    }

    /**
     * Groups files by type
     */
    private static groupFilesByType(files: string[]): Map<string, string[]> {
        const groups = new Map<string, string[]>();
        
        for (const file of files) {
            const ext = this.getFileExtension(file);
            if (!groups.has(ext)) {
                groups.set(ext, []);
            }
            groups.get(ext)!.push(file);
        }
        
        return groups;
    }

    /**
     * Gets the most common directory
     */
    private static getMostCommonDirectory(analysis: DiffAnalysis): string {
        const dirs = Array.from(analysis.directories);
        if (dirs.length === 0) return '.';
        if (dirs.length === 1) return dirs[0];
        
        // Return the first directory
        return dirs[0];
    }

    /**
     * Gets the most common file type
     */
    private static getMostCommonFileType(analysis: DiffAnalysis): string {
        const types = Array.from(analysis.fileTypes.entries());
        if (types.length === 0) return 'files';
        
        const sorted = types.sort((a, b) => b[1] - a[1]);
        return sorted[0][0];
    }

    /**
     * Gets human-readable file type (plural)
     */
    private static getReadableFileTypePlural(ext: string): string {
        const typeMap: { [key: string]: string } = {
            'ts': 'TypeScript files',
            'js': 'JavaScript files',
            'tsx': 'React components',
            'jsx': 'React components',
            'py': 'Python files',
            'java': 'Java files',
            'md': 'documentation files',
            'json': 'configuration files',
            'yml': 'YAML files',
            'yaml': 'YAML files',
            'css': 'stylesheets',
            'scss': 'stylesheets',
            'html': 'HTML files',
            'xml': 'XML files',
        };
        
        return typeMap[ext] || 'files';
    }

    /**
     * Determines conventional commit type
     */
    private static determineConventionalType(analysis: DiffAnalysis): string {
        const changeTypes = Array.from(analysis.changeTypes);

        if (changeTypes.includes('test')) return 'test';
        if (changeTypes.includes('docs')) return 'docs';
        if (changeTypes.includes('config')) return 'chore';
        if (changeTypes.includes('style')) return 'style';

        if (analysis.deletions > analysis.additions * 2) {
            return 'refactor';
        }

        if (analysis.additions > analysis.deletions * 1.5) {
            return 'feat';
        }

        return 'fix';
    }

    /**
     * Determines scope
     */
    private static determineScope(analysis: DiffAnalysis): string | null {
        const dirs = Array.from(analysis.directories);
        
        if (dirs.length === 1 && dirs[0] !== '.') {
            return dirs[0];
        }

        return null;
    }

    /**
     * Generates subject line
     */
    private static generateSubject(analysis: DiffAnalysis): string {
        const files = Array.from(analysis.filesChanged);

        if (files.length === 1) {
            const fileName = files[0].split('/').pop() || files[0];
            return `update ${fileName}`;
        }

        const mainType = this.getMostCommonFileType(analysis);
        const count = files.length;
        
        return `update ${count} ${mainType} file${count !== 1 ? 's' : ''}`;
    }

    /**
     * Detects change type from filename
     */
    private static detectChangeType(filename: string): string {
        const name = filename.toLowerCase();

        if (name.includes('test') || name.includes('.spec.') || name.includes('.test.')) {
            return 'test';
        }
        if (name.endsWith('.md') || name.includes('readme') || name.includes('doc')) {
            return 'docs';
        }
        if (name.includes('config') || name.endsWith('.json') || name.endsWith('.yml') || name.endsWith('.yaml')) {
            return 'config';
        }
        if (name.endsWith('.css') || name.endsWith('.scss') || name.endsWith('.sass')) {
            return 'style';
        }

        return 'code';
    }

    /**
     * Gets file extension
     */
    private static getFileExtension(filename: string): string {
        const parts = filename.split('.');
        return parts.length > 1 ? parts[parts.length - 1] : 'file';
    }

    /**
     * Gets directory name
     */
    private static getDirectory(filename: string): string {
        const parts = filename.split('/');
        return parts.length > 1 ? parts[0] : '.';
    }
}

/**
 * Interface for diff analysis results
 */
interface DiffAnalysis {
    filesChanged: Set<string>;
    additions: number;
    deletions: number;
    fileTypes: Map<string, number>;
    changeTypes: Set<string>;
    directories: Set<string>;
    isNewFiles: boolean;
    isDeletedFiles: boolean;
    isModifiedFiles: boolean;
}
