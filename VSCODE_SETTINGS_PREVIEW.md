# VS Code Settings Preview

This document shows exactly what users will see when they open their VS Code settings.

## Before Opening Settings

**Method 1**: Command Palette
- Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac)
- Type: "Preferences: Open Settings"

**Method 2**: Menu
- File > Preferences > Settings

**Method 3**: Keyboard Shortcut
- Press `Ctrl+,` (Windows/Linux) or `Cmd+,` (Mac)

## What Users Will See

After opening Settings and searching for "Git Auto Commit":

---

### 🔧 Git Auto Commit Settings

#### ▶ Auto Commit

**Enable Auto Commit** `gitAutoCommit.enableAutoCommit`
- Type: Checkbox
- Default: ☐ Unchecked
- Description: Automatically commit changes after the specified interval

**Auto Commit Without Confirmation** `gitAutoCommit.autoCommitWithoutConfirmation`
- Type: Checkbox  
- Default: ☐ Unchecked
- Description: ⚠️ Auto-commit WITHOUT confirmation dialogs (use with caution!)

**Auto Commit Interval** `gitAutoCommit.autoCommitInterval`
- Type: Number input
- Default: 10
- Range: 1-120
- Description: Auto commit interval in minutes (1-120)

#### ▶ Reminder Settings

**Enable Reminder** `gitAutoCommit.enableReminder`
- Type: Checkbox
- Default: ☑ Checked
- Description: Show reminder notification when there are uncommitted changes

**Reminder Interval** `gitAutoCommit.reminderInterval`
- Type: Number input
- Default: 5
- Range: 1-60
- Description: Reminder interval in minutes (1-60)

#### ▶ AI Configuration

**Use AI Generation** `gitAutoCommit.useAIGeneration`
- Type: Checkbox
- Default: ☐ Unchecked
- Description: Use AI to generate more detailed commit messages (requires API configuration)

**AI Provider** `gitAutoCommit.aiProvider` ⭐ NEW
- Type: Dropdown ▼
- Options:
  ```
  ○ openai          - OpenAI (GPT-4, GPT-4o, GPT-3.5)
  ○ anthropic       - Anthropic (Claude models)
  ○ gemini          - Google Gemini
  ○ openrouter      - OpenRouter (Access to multiple models)
  ```
- Default: openai
- Description: AI provider for commit message generation

**AI Model** `gitAutoCommit.aiModel` ⭐ NEW
- Type: Text input
- Default: gpt-4o-mini
- Description: AI model to use. Examples:
  - OpenAI: `gpt-4o-mini`, `gpt-4o`, `gpt-4-turbo`
  - Anthropic: `claude-3-5-sonnet-20241022`, `claude-3-opus-20240229`
  - Gemini: `gemini-pro`, `gemini-1.5-pro`

**AI Api Key** `gitAutoCommit.aiApiKey` ⭐ NEW
- Type: Password input (•••••••)
- Default: (empty)
- Description: API Key for the selected AI provider. Get your key from:
  - OpenAI: https://platform.openai.com/api-keys
  - Anthropic: https://console.anthropic.com/settings/keys
  - Gemini: https://makersuite.google.com/app/apikey
  - OpenRouter: https://openrouter.ai/keys

#### ▶ Commit Style

**Commit Message Style** `gitAutoCommit.commitMessageStyle`
- Type: Dropdown ▼
- Options:
  ```
  ○ conventional    - conventional (feat:, fix:, etc.)
  ○ simple          - simple
  ○ detailed        - detailed
  ```
- Default: conventional
- Description: Commit message style

---

## Settings.json View

Users can also edit settings in JSON format. Here's what they'll see:

```json
{
  // Git Auto Commit Configuration
  "gitAutoCommit.enableAutoCommit": false,
  "gitAutoCommit.autoCommitWithoutConfirmation": false,
  "gitAutoCommit.autoCommitInterval": 10,
  "gitAutoCommit.enableReminder": true,
  "gitAutoCommit.reminderInterval": 5,
  "gitAutoCommit.useAIGeneration": false,
  "gitAutoCommit.aiProvider": "openai",
  "gitAutoCommit.aiModel": "gpt-4o-mini",
  "gitAutoCommit.aiApiKey": "",
  "gitAutoCommit.commitMessageStyle": "conventional"
}
```

## IntelliSense Features

When users edit `settings.json`, they'll get:

### 1. Auto-completion
Typing `"gitAutoCommit.` will show all available settings with descriptions

### 2. Validation
- Invalid values will be underlined in red
- Hover shows the error message
- Suggests valid values

### 3. Enum Suggestions
For dropdown settings like `aiProvider`, IntelliSense shows:
```
"gitAutoCommit.aiProvider": "█"
                            ▼
    ┌─────────────────────────────────────────┐
    │ ○ openai     (OpenAI GPT models)       │
    │ ○ anthropic  (Anthropic Claude models) │
    │ ○ gemini     (Google Gemini)           │
    │ ○ openrouter (OpenRouter)              │
    └─────────────────────────────────────────┘
```

## Visual Comparison

### OLD Settings Structure (Removed)
```
❌ Git Auto Commit: Ai Commiter
   ├── Provider: [text input]
   ├── Api Key: [text input]  
   └── Model: [text input]
```
Problems:
- Not clear it was for AI
- All text inputs (no validation)
- No helpful descriptions
- Confusing nested structure

### NEW Settings Structure (Current)
```
✅ Use AI Generation [checkbox]
✅ AI Provider [dropdown with descriptions]
✅ AI Model [text input with examples]
✅ AI Api Key [password field with links]
```
Benefits:
- Clear purpose
- Proper input types
- Helpful descriptions
- Easy to configure

## User Workflow

### First-Time Setup

1. User installs extension
2. Opens Settings: `Ctrl+,`
3. Searches: "git auto commit"
4. Sees clear AI settings:
   - Checks "Use AI Generation"
   - Selects provider from dropdown
   - Enters API key (with helpful links)
   - (Optional) Specifies model

### Using Configure Command

Alternatively, users can use the built-in command:

1. Command Palette: `Ctrl+Shift+P`
2. Type: "Git Auto Commit: Configure AI"
3. Follow interactive prompts:
   ```
   [1/4] Select AI provider:
         › OpenAI (GPT-4, GPT-4o, GPT-3.5)
           Anthropic (Claude models)
           Google Gemini
           OpenRouter (Access to multiple models)
   
   [2/4] Enter your OpenAI API key:
         › ••••••••••••••••••••••••••
         Current: Not set
   
   [3/4] Select AI model (optional):
         › gpt-4o-mini
           gpt-4o
           gpt-4-turbo
   
   [4/4] Enable AI-powered commit messages?
         › Yes
           No
   
   ✓ AI configured: OpenAI (gpt-4o-mini)
   [Test It] [View Settings]
   ```

## Settings Discoverability

The new structure makes settings easier to find because:

1. **Logical grouping**: AI settings are together
2. **Clear naming**: "AI Provider" is obvious
3. **Helpful descriptions**: Users know what each setting does
4. **Links provided**: Direct access to get API keys
5. **Examples shown**: Users know what values to enter

---

**Last Updated**: January 10, 2026
**Status**: Implementation Complete
