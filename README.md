# Git Auto Commit Generator - VS Code Extension

An intelligent VS Code extension that automatically generates meaningful commit messages based on your code changes and helps you maintain a consistent commit history.

## Features

### ✨ Core Features
- **Smart Commit Message Generation**: Automatically analyzes your code changes and generates meaningful commit messages following conventional commit standards
- **Auto-Commit Timer**: Set a custom interval (default 10 minutes) to automatically commit staged changes
- **Commit Reminders**: Get notified every 5 minutes (configurable) when you have uncommitted changes
- **Commit History Dashboard**: View all your commits in a beautiful dashboard with timestamps and file details
- **Source Control Integration**: Seamlessly integrates with VS Code's built-in Git support

### 🎯 Advanced Features
- **Conventional Commit Format**: Follows the conventional commit specification (feat:, fix:, chore:, docs:, etc.)
- **Intelligent File Analysis**: Recognizes different file types and purposes (tests, configs, documentation)
- **Status Bar Integration**: Quick access to dashboard and auto-commit status
- **Persistent History**: Keeps track of your last 50 commits with full details

## Installation

### From Source (Development)

1. **Clone the repository:**
```bash
git clone https://github.com/yourusername/git-auto-commit.git
cd git-auto-commit
```

2. **Install dependencies:**
```bash
npm install
```

3. **Compile the extension:**
```bash
npm run compile
```

4. **Open in VS Code:**
```bash
code .
```

5. **Press F5** to open a new Extension Development Host window with your extension loaded

### Directory Structure

Create the following structure:
```
git-auto-commit/
├── src/
│   └── extension.ts    (Main extension file)
├── package.json
├── tsconfig.json
├── README.md
└── .vscode/
    └── launch.json     (For debugging)
```

## Usage

### Quick Start

1. **Open Command Palette** (`Ctrl+Shift+P` or `Cmd+Shift+P`)
2. Type "Git Auto Commit" to see available commands:
   - `Git Auto Commit: Generate Commit Message` - Generate message for current changes
   - `Git Auto Commit: Show Commit Dashboard` - View commit history
   - `Git Auto Commit: Toggle Auto Commit` - Enable/disable auto-commit

### Commands

| Command | Description | Shortcut |
|---------|-------------|----------|
| Generate Commit Message | Analyzes changes and generates a commit message | - |
| Show Commit Dashboard | Opens the history dashboard | Click status bar icon |
| Toggle Auto Commit | Enable/disable automatic commits | - |

### Settings

Access settings through `File > Preferences > Settings` and search for "Git Auto Commit":

| Setting | Default | Description |
|---------|---------|-------------|
| `gitAutoCommit.enableAutoCommit` | `false` | Enable automatic commits |
| `gitAutoCommit.autoCommitWithoutConfirmation` | `false` | ⚠️ Commit WITHOUT asking (use with caution!) |
| `gitAutoCommit.autoCommitInterval` | `10` | Auto-commit interval in minutes (1-120) |
| `gitAutoCommit.enableReminder` | `true` | Show commit reminders |
| `gitAutoCommit.reminderInterval` | `5` | Reminder interval in minutes (1-60) |
| `gitAutoCommit.useAIGeneration` | `false` | Use AI for advanced message generation |
| `gitAutoCommit.commitMessageStyle` | `conventional` | Message style: conventional, simple, or detailed |

### ⚠️ Auto-Commit Behavior

The extension offers **two modes** for auto-commit:

#### 1. **With Confirmation (Default & Recommended)**
- Timer triggers every X minutes
- You see a notification: "Auto-commit ready: [message]"
- Choose "Commit Now" or "Skip"
- **Safe for production use**

#### 2. **Without Confirmation (Advanced)**
- Enable `autoCommitWithoutConfirmation` in settings
- Commits happen **automatically without asking**
- **Use with extreme caution!**
- Best for: personal projects, experimentation, prototyping
- **Not recommended for:** team projects, production code

### First-Time Setup

When you first install the extension, you'll see a welcome message:

```
🚀 Welcome to Git Auto Commit!
This extension can automatically commit your changes at regular intervals.
Would you like to enable auto-commit?

[Enable Auto-Commit] [Not Now] [Learn More]
```

Choose your preference, and you can always change it later in settings.

### Example Workflow

1. **Make some code changes** in your workspace
2. **Click the status bar icon** or run "Generate Commit Message"
3. **Review the generated message** in the Source Control input box
4. **Choose an action:**
   - Click "Commit" to commit immediately
   - Click "Edit Message" to modify before committing
   - Click "Cancel" to discard

### Commit Message Examples

The extension generates contextual messages based on your changes:

```
feat: update ts, js files

- src/components/Button.tsx
- src/utils/helpers.js
- and 3 more...
```

```
docs: update documentation

- README.md
```

```
test: update test files

- tests/unit/component.test.ts
```

## Dashboard

The commit dashboard provides:
- ✅ Current settings overview
- 📊 Commit history with timestamps
- 🔍 File details for each commit
- 🔄 Refresh and clear history options

Access it by:
- Clicking the status bar icon
- Running "Show Commit Dashboard" from command palette

## Configuration Examples

### Enable Auto-Commit Every 15 Minutes (With Confirmation)

```json
{
  "gitAutoCommit.enableAutoCommit": true,
  "gitAutoCommit.autoCommitInterval": 15,
  "gitAutoCommit.autoCommitWithoutConfirmation": false
}
```

### Enable Fully Automatic Commits (No Confirmation)

⚠️ **Use with caution!**

```json
{
  "gitAutoCommit.enableAutoCommit": true,
  "gitAutoCommit.autoCommitInterval": 10,
  "gitAutoCommit.autoCommitWithoutConfirmation": true
}
```

### Disable Reminders

```json
{
  "gitAutoCommit.enableReminder": false
}
```

### Use Simple Message Style

```json
{
  "gitAutoCommit.commitMessageStyle": "simple"
}
```

## How It Works

1. **Change Detection**: Uses `git status --porcelain` to detect modified files
2. **Analysis**: Examines file types, paths, and patterns
3. **Message Generation**: Applies rules based on conventional commit standards
4. **Integration**: Populates VS Code's Source Control input box
5. **History Tracking**: Stores commit metadata in workspace state

## Future Enhancements

Planned features for future releases:
- 🤖 AI-powered commit messages using Claude API
- 🌐 Multi-repository support
- 📈 Commit statistics and insights
- 🎨 Customizable message templates
- 🔗 GitHub/GitLab integration
- 📝 Commit message validation
- 🔄 Undo/amend last commit

## Development

### Building from Source

```bash
# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Watch mode (auto-compile on save)
npm run watch

# Run tests
npm test
```

### Debugging

1. Open the project in VS Code
2. Press `F5` to launch Extension Development Host
3. Set breakpoints in `src/extension.ts`
4. Test your changes in the development host

## Troubleshooting

### Extension not working
- Ensure you're in a Git repository
- Check that Git is installed and accessible from terminal
- Verify VS Code has the built-in Git extension enabled

### Auto-commit not triggering
- Check that `enableAutoCommit` is set to `true`
- Verify there are actual changes to commit
- Look for errors in the Output panel (View > Output > Git Auto Commit)

### Commit history not showing
- Try refreshing the dashboard
- Check the Output panel for errors

## Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - feel free to use this extension in your projects!

## Support

- 🐛 Report issues on [GitHub Issues](https://github.com/yourusername/git-auto-commit/issues)
- 💡 Request features on [GitHub Discussions](https://github.com/yourusername/git-auto-commit/discussions)
- ⭐ Star the repo if you find it useful!

## Credits

Created with ❤️ for developers who value clean commit history

---

**Happy Committing! 🚀**