# Testing Guide for Git Auto Commit Extension Updates

## Quick Test Checklist

### 1. Compile the Extension
```bash
cd "D:\Web\VSCode Extensions\Git Auto Commit Generator"
npm run compile
```

### 2. Package the Extension
```bash
# If you don't have vsce installed
npm install -g @vscode/vsce

# Package the extension
vsce package
```

### 3. Test Fresh Installation

#### A. Clean Slate Test (Recommended)
1. **Uninstall the current extension** from VS Code
2. **Delete global state**:
   ```bash
   # Windows (PowerShell)
   Remove-Item -Recurse -Force "$env:APPDATA\Code\User\globalStorage\kehem-it.git-auto-commit" -ErrorAction SilentlyContinue
   
   # Or manually navigate to:
   # C:\Users\YourUsername\AppData\Roaming\Code\User\globalStorage\
   # And delete the "kehem-it.git-auto-commit" folder
   ```
3. **Install the new VSIX**:
   - Press `Ctrl+Shift+P`
   - Type "Extensions: Install from VSIX"
   - Select your newly packaged `.vsix` file
4. **Expected Result**: Welcome screen should open automatically in a new tab within 1 second

#### B. Force Show Welcome Screen (For Quick Testing)
If you don't want to reset everything:
1. Open Command Palette (`Ctrl+Shift+P`)
2. Type "Git Auto Commit: Show Welcome Screen"
3. Press Enter

### 4. Test Settings Access

#### From Welcome Screen:
1. Click "Open Settings" button in the welcome screen
2. **Expected Result**: VS Code settings should open showing the Git Auto Commit extension settings
3. **Check**: URL in settings should show `@ext:KEHEM-IT.git-auto-commit`

#### From Status Bar:
1. Click the Git Auto Commit icon in the status bar (bottom right)
2. Click "⚙️ Settings"
3. **Expected Result**: Same as above - settings should open correctly

### 5. Test Dark Mode Support
1. **Switch to Dark Theme**:
   - `Ctrl+K Ctrl+T` (or `Cmd+K Cmd+T` on Mac)
   - Select "Dark+ (default dark)"
   - Open welcome screen
   - **Expected**: Dark blue-purple gradient background

2. **Switch to Light Theme**:
   - `Ctrl+K Ctrl+T`
   - Select "Light+ (default light)"
   - Open welcome screen
   - **Expected**: Purple-pink gradient background

### 6. Test User Flow
1. Open the welcome screen
2. Click "Enable Auto-Commit" button
3. **Expected**: 
   - Shows success message: "✓ Auto-commit enabled!"
   - Welcome screen closes
   - Dashboard opens automatically after 500ms

### 7. Verify Font Awesome Icons
Check that all these icons render correctly in the welcome screen:
- 🚀 Rocket (main logo)
- ⚡ Bolt (Auto Commit)
- 🧠 Brain (AI-Powered)
- 📈 Chart Line (Smart Dashboard)
- 🔔 Bell (Smart Reminders)
- 🎛️ Sliders (Highly Configurable)
- ⏱️ Gauge (Status Bar)

## Common Issues & Solutions

### Issue: Welcome screen doesn't open on install
**Solutions**:
1. Check the Output panel:
   - `View → Output`
   - Select "Git Auto Commit" from dropdown
   - Look for any errors
2. Try reloading VS Code: `Ctrl+R`
3. Manually trigger: `Ctrl+Shift+P` → "Git Auto Commit: Show Welcome Screen"

### Issue: Settings open to wrong page
**Check**:
1. The extension ID in package.json should show:
   - `"name": "git-auto-commit"`
   - `"publisher": "KEHEM IT"`
2. The actual extension ID VS Code uses is: `KEHEM-IT.git-auto-commit`
3. If still wrong, verify in VS Code:
   - Go to Extensions view
   - Find your extension
   - Click the gear icon → "Copy Extension ID"
   - Use that ID in the settings command

### Issue: TypeScript compilation errors
```bash
# Clean and rebuild
rm -rf out
npm run compile
```

## Build Commands Reference

```bash
# Install dependencies (if needed)
npm install

# Compile TypeScript
npm run compile

# Watch mode (auto-compile on save)
npm run watch

# Package extension
vsce package

# Install specific version
code --install-extension git-auto-commit-1.0.0.vsix
```

## Developer Tools

### Check Extension Logs
1. `Help → Toggle Developer Tools` (or `Ctrl+Shift+I`)
2. Go to Console tab
3. Filter by "Git Auto Commit"

### Check Global State
```javascript
// In VS Code Developer Tools Console
// This shows the current state
localStorage.getItem('vscode.globalState.kehem-it.git-auto-commit')
```

### Reset Welcome Screen State (for testing)
```javascript
// In VS Code Developer Tools Console
// This will show the welcome screen again on next reload
const state = JSON.parse(localStorage.getItem('vscode.globalState.kehem-it.git-auto-commit') || '{}');
delete state.hasShownWelcome;
localStorage.setItem('vscode.globalState.kehem-it.git-auto-commit', JSON.stringify(state));
```

## Final Checklist Before Publishing

- [ ] Extension compiles without errors
- [ ] Welcome screen opens on fresh install
- [ ] Settings open correctly from both welcome screen and status bar
- [ ] Dark/Light theme support works
- [ ] All Font Awesome icons display correctly
- [ ] Enable Auto-Commit button works and opens dashboard
- [ ] "Got It!" button closes welcome screen without errors
- [ ] Configure AI button works
- [ ] No console errors in Developer Tools

## Notes

- Make sure to increment the version in `package.json` before building
- Test in a clean VS Code workspace to simulate real user experience
- The 500ms delay in activation is intentional to prevent race conditions
