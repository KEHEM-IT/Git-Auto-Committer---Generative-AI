# Default Commit Message Generator

## Overview

The **Default Commit Message Generator** is a built-in, intelligent commit message generator that works **without requiring any AI API keys**. It provides three different message styles and analyzes your git changes to create meaningful, context-aware commit messages.

## Features

✅ **No API Key Required** - Works completely offline  
✅ **Three Message Styles** - Conventional, Simple, and Detailed  
✅ **Intelligent Analysis** - Detects file types, change patterns, and scope  
✅ **Fast & Reliable** - Instant generation with no API calls  
✅ **Automatic Fallback** - Used when AI is disabled or fails  

---

## How It Works

The default generator analyzes your git diff to understand:

1. **File Changes** - Which files were modified
2. **Change Types** - Additions, deletions, modifications
3. **File Types** - Source code, documentation, config, etc.
4. **Change Patterns** - Features, fixes, refactoring, etc.
5. **Scope** - Affected directories or modules

Based on this analysis, it generates contextual commit messages in your chosen style.

---

## Message Styles

### 1. Conventional Commits (Default)

Follows the [Conventional Commits](https://www.conventionalcommits.org/) specification with automatic type detection.

**Format:** `<type>(<scope>): <subject>`

**Example:**
```
feat(components): update 2 tsx files

- 2 files changed: 45 insertions(+), 12 deletions(-)
```

**Detected Types:**
- `feat` - New features (more additions than deletions)
- `fix` - Bug fixes (modifications to source files)
- `docs` - Documentation changes (README, .md files)
- `style` - CSS/SCSS changes
- `refactor` - Code refactoring (more deletions)
- `test` - Test files
- `chore` - Config files, build scripts

---

### 2. Simple

Clean, concise messages perfect for quick commits.

**Examples:**
```
Update package.json

Update src/index.ts and src/types.ts

Update 5 files (+32/-8): src/App.tsx, src/utils.ts and 3 more files
```

**Best For:**
- Quick, simple changes
- Personal projects
- Rapid development

---

### 3. Detailed

Comprehensive messages with full context and file listings.

**Example:**
```
feat: Update 4 files

Modified: 2 ts files, 1 tsx file, 1 json file

Changes: 67 additions, 23 deletions

Files:
  - src/services/aiService.ts
  - src/services/defaultCommitGenerator.ts
  - src/ui/dashboard.tsx
  - package.json
```

**Best For:**
- Team projects
- Open source contributions
- Detailed change tracking

---

## Configuration

### Enable/Disable AI Generation

```json
{
  "gitAutoCommit.useAIGeneration": false  // Use default generator
}
```

### Set Message Style

```json
{
  "gitAutoCommit.commitMessageStyle": "conventional"  // or "simple" or "detailed"
}
```

---

## When Is It Used?

The default generator activates in these scenarios:

### 1. **AI Disabled**
When `useAIGeneration` is set to `false`:
```json
{
  "gitAutoCommit.useAIGeneration": false
}
```

### 2. **No API Key**
When AI is enabled but no API key is configured:
- Shows info message: "Using default commit message generator"
- Generates message using default generator
- Offers option to configure AI

### 3. **AI Failure**
When AI API call fails for any reason:
- Shows warning with error details
- Automatically falls back to default generator
- Ensures you always get a commit message

---

## Example Generations

### Example 1: Adding New Feature
**Files:** `src/components/Button.tsx`, `src/styles/button.css`

**Conventional:**
```
feat(components): update 2 files

- 2 files changed: 34 insertions(+), 5 deletions(-)
```

**Simple:**
```
Update 2 files (+34/-5): src/components/Button.tsx, src/styles/button.css
```

**Detailed:**
```
feat: Update 2 files

Modified: 1 tsx file, 1 css file

Changes: 34 additions, 5 deletions

Files:
  - src/components/Button.tsx
  - src/styles/button.css
```

---

### Example 2: Bug Fix
**Files:** `src/utils/validation.ts`

**Conventional:**
```
fix(utils): update validation.ts
```

**Simple:**
```
Update src/utils/validation.ts
```

**Detailed:**
```
fix: Update 1 file

Modified: 1 ts file

Changes: 3 additions, 2 deletions

Files:
  - src/utils/validation.ts
```

---

### Example 3: Documentation Update
**Files:** `README.md`, `docs/api.md`

**Conventional:**
```
docs: update 2 md files

- 2 files changed: 45 insertions(+), 10 deletions(-)
```

**Simple:**
```
Update 2 files (+45/-10): README.md, docs/api.md
```

**Detailed:**
```
docs: Update 2 files

Modified: 2 md files

Changes: 45 additions, 10 deletions

Files:
  - README.md
  - docs/api.md
```

---

## Comparison with AI Generation

| Feature | Default Generator | AI Generation |
|---------|------------------|---------------|
| Speed | Instant | 1-3 seconds |
| Cost | Free | API costs |
| Privacy | 100% local | Sends code to API |
| Reliability | Always works | Can fail |
| Quality | Good | Excellent |
| Context | File-based | Semantic understanding |
| Internet | Not required | Required |

---

**Last Updated:** January 2025  
**Version:** 1.0.5+
