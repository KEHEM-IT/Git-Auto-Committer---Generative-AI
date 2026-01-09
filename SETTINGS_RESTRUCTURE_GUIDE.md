# Settings Restructure Guide

## Overview
The AI configuration settings have been restructured for better usability. Instead of having separate settings for each provider's API key, we now have a unified configuration approach.

## Changes Made

### ❌ Old Configuration (Removed)
```json
{
  "gitAutoCommit.aiProvider": "openai",
  "gitAutoCommit.aiModel": "gpt-4o-mini",
  "gitAutoCommit.openaiApiKey": "sk-...",
  "gitAutoCommit.anthropicApiKey": "sk-ant-...",
  "gitAutoCommit.geminiApiKey": "...",
  "gitAutoCommit.openrouterApiKey": "..."
}
```

### ✅ New Configuration (Current)
```json
{
  "gitAutoCommit.aiProvider": "openai",
  "gitAutoCommit.aiModel": "gpt-4o-mini", 
  "gitAutoCommit.aiApiKey": "your-api-key-here"
}
```

## Benefits

1. **Simplified Configuration**: Only one API key field instead of four
2. **Better User Experience**: Users only need to manage one API key at a time
3. **Clearer Settings UI**: Settings are more organized in VS Code settings
4. **Easier to Understand**: Less confusion about which API key to use

## Settings Details

### `gitAutoCommit.aiProvider`
- **Type**: Dropdown selection
- **Options**: 
  - `openai` - OpenAI (GPT-4, GPT-4o, GPT-3.5)
  - `anthropic` - Anthropic (Claude models)
  - `gemini` - Google Gemini
  - `openrouter` - OpenRouter (Access to multiple models)
- **Default**: `openai`

### `gitAutoCommit.aiModel`
- **Type**: String input
- **Examples**:
  - OpenAI: `gpt-4o-mini`, `gpt-4o`, `gpt-4-turbo`
  - Anthropic: `claude-3-5-sonnet-20241022`, `claude-3-opus-20240229`
  - Gemini: `gemini-pro`, `gemini-1.5-pro`
- **Default**: `gpt-4o-mini`

### `gitAutoCommit.aiApiKey`
- **Type**: String input (password field in UI)
- **Description**: Single API key field for the selected provider
- **Help Links Provided**:
  - OpenAI: https://platform.openai.com/api-keys
  - Anthropic: https://console.anthropic.com/settings/keys
  - Gemini: https://makersuite.google.com/app/apikey
  - OpenRouter: https://openrouter.ai/keys

## Migration Guide

If you're upgrading from an older version:

1. **Open VS Code Settings**: `File > Preferences > Settings` or `Ctrl+,`
2. **Search for**: `Git Auto Commit`
3. **Update your settings**:
   - Select your preferred `AI Provider`
   - Enter your API key in `AI Api Key`
   - Specify your desired `AI Model`

### Example Migration

**Before** (Old format - will no longer work):
```json
{
  "gitAutoCommit.aiProvider": "anthropic",
  "gitAutoCommit.anthropicApiKey": "sk-ant-xxxxx"
}
```

**After** (New format):
```json
{
  "gitAutoCommit.aiProvider": "anthropic",
  "gitAutoCommit.aiApiKey": "sk-ant-xxxxx",
  "gitAutoCommit.aiModel": "claude-3-5-sonnet-20241022"
}
```

## Using the Configure AI Command

The easiest way to configure AI settings is using the built-in command:

1. Open Command Palette: `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac)
2. Type: `Git Auto Commit: Configure AI`
3. Follow the prompts to:
   - Select your AI provider
   - Enter your API key
   - Choose your model
   - Enable AI generation

## Code Changes

### Files Modified

1. **package.json**
   - Removed individual API key settings
   - Added unified `gitAutoCommit.aiApiKey` setting
   - Added helpful markdown descriptions with links

2. **src/services/aiService.ts**
   - Updated to read from new configuration structure
   - Changed interface name from `AICommiterConfig` to `AIConfig`
   - Modified `getAIConfig()` method to use new settings

3. **src/commands/configureAI.ts**
   - Updated to save to single `aiApiKey` setting
   - Removed provider-specific API key logic

## Backwards Compatibility

⚠️ **Important**: This change is **not backwards compatible**. Users will need to reconfigure their API keys after updating to this version.

However, the configuration process is now simpler and more intuitive.

## Testing

After making these changes:

1. **Compile the extension**: `npm run compile`
2. **Test in VS Code**:
   - Press `F5` to launch Extension Development Host
   - Run `Git Auto Commit: Configure AI` command
   - Verify settings are saved correctly
   - Test commit message generation

## Support

If you encounter any issues:

1. Check your settings in VS Code Settings UI
2. Verify your API key is correctly entered
3. Ensure you selected the right provider
4. Check the Output panel for error messages

---

**Last Updated**: January 2026
