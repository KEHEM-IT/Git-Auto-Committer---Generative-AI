# Commit Message Styles Guide

Git Auto Commit Generator supports **three distinct commit message styles** to match your workflow and preferences. Each style is designed for different use cases and audiences.

---

## 📋 Available Styles

### 1. **Conventional** (Default)
Standard commit format following [Conventional Commits](https://www.conventionalcommits.org/) specification.

**Best for:** Professional projects, open-source contributions, teams following strict conventions.

#### Format
```
<type>(<scope>): <subject>

- <files> changed: <additions>, <deletions>
```

#### Examples
```
feat(src): update 3 ts files

- 3 files changed: 45 insertions(+), 12 deletions(-)
```

```
docs: update README.md

- 1 file changed: 8 insertions(+)
```

```
fix(services): update gitService.ts

- 1 file changed: 23 insertions(+), 15 deletions(-)
```

#### Commit Types Used
- `feat`: New features or functionality
- `fix`: Bug fixes or improvements
- `docs`: Documentation changes
- `style`: CSS/styling changes
- `refactor`: Code refactoring
- `test`: Test-related changes
- `chore`: Configuration, build, or other maintenance

---

### 2. **Simple**
Clear, human-readable messages that explain what changed without technical jargon.

**Best for:** Personal projects, quick commits, teams preferring readability over convention.

#### Format
```
<Action> <what changed>
```

#### Examples
```
Created package.json
```

```
Modified README.md
```

```
Updated 5 TypeScript files in src
```

```
Added 3 configuration files
```

```
Removed outdated documentation
```

```
Updated 12 files in src
```

---

### 3. **Detailed**
Narrative-style messages that tell the story of your changes, similar to how AI would describe them.

**Best for:** Important commits, releases, code reviews, detailed project history.

#### Format
```
<Narrative summary>

<Description of changes>

<Technical details>
```

#### Examples

**Example 1: Documentation Update**
```
Updated project documentation with latest information

Changes include: Modified README.md

Modified 45 lines (+25 additions, -20 deletions)
```

**Example 2: New Features**
```
Introduced new TypeScript files to expand functionality

Changes include: Updated 5 TypeScript files, Modified 2 configuration files

Modified 150 lines (+120 additions, -30 deletions)
```

**Example 3: Refactoring**
```
Refactored codebase to improve maintainability

Changes include: Updated 8 TypeScript files

Modified 200 lines (+50 additions, -150 deletions)
```

**Example 4: Configuration Changes**
```
Adjusted project configuration and settings

Changes include: Updated 3 configuration files

Modified 30 lines (+15 additions, -15 deletions)
```

---

## 🔧 How to Configure

### Option 1: VS Code Settings UI
1. Open **Settings** (`Ctrl+,` or `Cmd+,`)
2. Search for **"Git Auto Commit"**
3. Find **"Commit Message Style"**
4. Select: `conventional`, `simple`, or `detailed`

### Option 2: Settings JSON
Add to your `settings.json`:
```json
{
  "gitAutoCommit.commitMessageStyle": "simple"
}
```

### Option 3: Workspace Settings
Create `.vscode/settings.json` in your project:
```json
{
  "gitAutoCommit.commitMessageStyle": "detailed"
}
```

---

## 🎯 Which Style Should I Use?

### Use **Conventional** when:
- ✅ Working on professional/open-source projects
- ✅ Team follows Conventional Commits standard
- ✅ Using automated changelog generators
- ✅ Need structured, parseable commit history
- ✅ Contributing to projects with strict conventions

### Use **Simple** when:
- ✅ Working on personal projects
- ✅ Want quick, readable commit messages
- ✅ Prefer clarity over convention
- ✅ Don't need structured commit types
- ✅ Making frequent, small commits

### Use **Detailed** when:
- ✅ Making important/complex changes
- ✅ Want descriptive, narrative commit messages
- ✅ Need context for code reviews
- ✅ Creating release commits
- ✅ Documenting significant refactoring

---

## 📊 Comparison Table

| Feature | Conventional | Simple | Detailed |
|---------|-------------|--------|----------|
| **Format** | Structured | Natural | Narrative |
| **Length** | Short | Short | Long |
| **Technical Detail** | Medium | Low | High |
| **Readability** | Good | Excellent | Excellent |
| **Professional** | ✅ Yes | ⚠️ Maybe | ✅ Yes |
| **Quick Scan** | ✅ Yes | ✅ Yes | ❌ No |
| **Context Rich** | ❌ No | ⚠️ Some | ✅ Yes |

---

## 🔄 Switching Between Styles

You can change styles **at any time** without affecting existing commits. Each commit is generated independently based on your current setting.

### Quick Switch (Command Palette)
1. Press `Ctrl+Shift+P` (or `Cmd+Shift+P`)
2. Type: **"Git Auto Commit: Configure"**
3. Select your preferred message style

---

## 🎨 Style Examples Side-by-Side

### Same Changes, Different Styles

**Scenario:** Modified 3 TypeScript files in the `src` directory

#### Conventional
```
feat(src): update 3 ts files

- 3 files changed: 67 insertions(+), 23 deletions(-)
```

#### Simple
```
Updated 3 TypeScript files in src
```

#### Detailed
```
Enhanced 3 files with improvements

Changes include: Updated 3 TypeScript files

Modified 90 lines (+67 additions, -23 deletions)
```

---

## 💡 Tips

### Conventional Style Tips
- Scopes are auto-detected from directory names
- Commit types are inferred from file changes
- Always follows standard format

### Simple Style Tips
- Messages are always clear and direct
- No technical jargon or conventions
- Perfect for git logs that non-developers read

### Detailed Style Tips
- Provides rich context for complex changes
- Great for explaining "why" behind changes
- Includes technical metrics for reference

---

## 🚀 Getting Started

1. **Install** Git Auto Commit Generator
2. **Open Settings** and search for "Git Auto Commit"
3. **Select** your preferred message style
4. **Start coding** - commits are generated automatically!

---

## 📖 Related Documentation

- [Setup Guide](SETUP_GUIDE.md)
- [Configuration Options](README.md#configuration)
- [Default Commit Generator](docs/DEFAULT_COMMIT_GENERATOR.md)

---

## ❓ Need Help?

- Check our [Troubleshooting Guide](TROUBLESHOOTING.md)
- View [Examples](COMMIT_MESSAGE_EXAMPLES.md)
- Open an issue on GitHub

---

**Remember:** The best commit message style is the one that works for **your workflow** and **your team**! 🎯
