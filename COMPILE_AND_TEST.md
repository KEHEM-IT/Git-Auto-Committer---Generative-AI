# Compile and Test Instructions

## Compilation

Run the following command in the terminal to compile the TypeScript code:

```bash
npm run compile
```

This will:
- Compile all TypeScript files from `src/` to `out/`
- Generate source maps for debugging
- Show any compilation errors if present

## Expected Output

If compilation is successful, you should see:
- No error messages
- Compiled `.js` and `.js.map` files in the `out/` directory

## Testing the Extension

### 1. Launch Extension Development Host

1. Open the project in VS Code
2. Press `F5` (or Run > Start Debugging)
3. This will open a new VS Code window with your extension loaded

### 2. Test AI Configuration

1. In the Extension Development Host window, open Command Palette: `Ctrl+Shift+P`
2. Type and select: `Git Auto Commit: Configure AI`
3. Follow the prompts to:
   - Select an AI provider
   - Enter an API key
   - Choose a model
   - Enable AI generation

### 3. Verify Settings

1. Open Settings: `Ctrl+,`
2. Search for: `Git Auto Commit`
3. Verify you can see and edit:
   - ✓ `AI Provider` (dropdown with 4 options)
   - ✓ `AI Model` (text input)
   - ✓ `AI Api Key` (password input)

### 4. Test Commit Generation

1. Make some changes to a file in your workspace
2. Open Command Palette: `Ctrl+Shift+P`
3. Type and select: `Git Auto Commit: Generate Commit Message`
4. Verify:
   - Message is generated
   - Changes are staged
   - Commit can be made

### 5. Check for Errors

Monitor these panels for any issues:
- **Debug Console**: For runtime errors
- **Problems Panel**: For TypeScript errors
- **Output Panel**: Select "Extension Host" for extension logs

## Common Issues and Solutions

### Issue: Compilation Errors

**Solution**: 
- Check the error messages
- Ensure all imports are correct
- Verify TypeScript version: `npm list typescript`

### Issue: Settings Not Showing Up

**Solution**:
- Reload the Extension Development Host window: `Ctrl+R`
- Check `package.json` for proper configuration schema

### Issue: API Key Not Working

**Solution**:
- Verify the API key is correctly entered
- Check that the correct provider is selected
- Look for error messages in the Output panel

## Files Modified

These files were changed during the settings restructure:

1. **package.json**
   - Changed configuration schema
   - Removed nested `aiCommiter` object
   - Added separate `aiProvider`, `aiModel`, `aiApiKey` settings

2. **src/services/aiService.ts**
   - Updated `getAIConfig()` method
   - Changed interface from `AICommiterConfig` to `AIConfig`
   - Updated all method signatures

3. **src/commands/configureAI.ts**
   - Simplified API key storage
   - Now uses single `aiApiKey` setting

4. **src/commands/generateCommit.ts**
   - Fixed method calls to match new AIService API
   - Removed redundant error handling

## Verification Checklist

Before considering the update complete, verify:

- [ ] Code compiles without errors
- [ ] Extension loads in Development Host
- [ ] Settings UI shows all three AI settings clearly
- [ ] Configure AI command works end-to-end
- [ ] Commit generation works with AI enabled
- [ ] Commit generation works with AI disabled
- [ ] No console errors during normal operation
- [ ] All existing features still work

## Next Steps

Once testing is complete:

1. Update version number in `package.json`
2. Update CHANGELOG.md with breaking changes note
3. Create a migration guide for existing users
4. Package and publish the extension

---

**Testing Date**: January 2026
**Status**: Ready for testing
