# Troubleshooting Guide

## Error: "Cannot find type definition file for 'node'"

### Cause
TypeScript can't find the Node.js type definitions.

### Solution
```bash
npm install --save-dev @types/node
```

If still not working:
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## Error: "Cannot find type definition file for 'vscode'"

### Cause
Missing VS Code API type definitions.

### Solution
```bash
npm install --save-dev @types/vscode
```

Make sure your `package.json` has:
```json
{
  "engines": {
    "vscode": "^1.75.0"
  },
  "devDependencies": {
    "@types/vscode": "^1.75.0"
  }
}
```

---

## Error: "File is not under 'rootDir'"

### Cause
Your TypeScript file is in the wrong location.

### Solution
**MUST HAVE THIS STRUCTURE:**
```
Your-Project/
├── src/
│   └── extension.ts    ← Code goes HERE
├── package.json
└── tsconfig.json
```

**NOT THIS:**
```
Your-Project/
├── main.ts             ← WRONG! Don't put code here
├── extension.ts        ← WRONG! Don't put code here
└── package.json
```

**Fix it:**
```bash
# Create src folder if it doesn't exist
mkdir src

# Move your code file
mv main.ts src/extension.ts
# or
mv extension.ts src/extension.ts
```

---

## Error: Compilation Fails

### Check These:

1. **Is your code in `src/extension.ts`?**
   ```bash
   ls src/extension.ts
   # Should show: src/extension.ts
   ```

2. **Is `tsconfig.json` correct?**
   ```json
   {
     "compilerOptions": {
       "rootDir": "src",    ← Must be "src"
       "outDir": "out"      ← Must be "out"
     }
   }
   ```

3. **Clean and rebuild:**
   ```bash
   rm -rf out
   npm run compile
   ```

---

## Error: Extension Not Loading

### Check These:

1. **Is compilation successful?**
   ```bash
   npm run compile
   # Should see: "Compiled successfully"
   ```

2. **Does `out/extension.js` exist?**
   ```bash
   ls out/extension.js
   # Should show: out/extension.js
   ```

3. **Is `package.json` correct?**
   ```json
   {
     "main": "./out/extension.js"  ← Must point to compiled file
   }
   ```

4. **Check Debug Console:**
   - Press F5 to launch Extension Development Host
   - In the original VS Code window: `View > Output`
   - Select "Extension Host" from dropdown
   - Look for error messages

---

## Error: Commands Not Showing

### Solution

1. **Reload the Extension Development Host:**
   - In the Extension Development Host window
   - Press `Ctrl+R` (or `Cmd+R` on Mac)

2. **Check activation events in `package.json`:**
   ```json
   {
     "activationEvents": [
       "onStartupFinished"
     ]
   }
   ```

3. **Verify commands are registered:**
   ```json
   {
     "contributes": {
       "commands": [
         {
           "command": "gitAutoCommit.generateCommit",
           "title": "Generate Commit Message"
         }
       ]
     }
   }
   ```

---

## Error: Git Commands Not Working

### Check These:

1. **Is Git installed?**
   ```bash
   git --version
   # Should show: git version x.x.x
   ```

2. **Are you in a Git repository?**
   ```bash
   git status
   # Should NOT show: "not a git repository"
   ```

3. **Open a Git repository:**
   - File > Open Folder
   - Choose a folder that has `.git` directory
   - Or initialize: `git init`

---

## Issue: TypeScript Errors in VS Code

### Solution

1. **Reload VS Code:**
   - Press `Ctrl+Shift+P`
   - Type "Reload Window"
   - Press Enter

2. **Check TypeScript version:**
   - Bottom right corner of VS Code
   - Should show TypeScript version
   - Click it and select "Use Workspace Version"

3. **Restart TypeScript server:**
   - `Ctrl+Shift+P`
   - Type "TypeScript: Restart TS Server"

---

## Issue: Changes Not Reflected

### Solution

1. **Recompile:**
   ```bash
   npm run compile
   ```

2. **Reload Extension Development Host:**
   - Press `Ctrl+R` in the Extension Host window

3. **Use Watch Mode (Recommended):**
   ```bash
   npm run watch
   ```
   This auto-compiles when you save files.

---

## Complete Reset (Nuclear Option)

If nothing works, start fresh:

```bash
# 1. Delete everything
rm -rf node_modules out package-lock.json

# 2. Reinstall
npm install

# 3. Recompile
npm run compile

# 4. Test
# Press F5 in VS Code
```

---

## Still Not Working?

### Checklist:

- [ ] Node.js is installed (`node --version` works)
- [ ] Code is in `src/extension.ts` (not root!)
- [ ] `node_modules` folder exists
- [ ] `@types/vscode` and `@types/node` are installed
- [ ] `tsconfig.json` has `rootDir: "src"`
- [ ] `package.json` has `main: "./out/extension.js"`
- [ ] Compilation is successful (no errors)
- [ ] `out/extension.js` file exists
- [ ] You're testing in a Git repository

### Get Help:

1. Check the output in Debug Console
2. Look for errors in Problems panel (Ctrl+Shift+M)
3. Review the terminal output carefully
4. Post the error message to get help

---

## Quick Commands Reference

```bash
# Setup
npm install                    # Install dependencies
npm run compile               # Compile once
npm run watch                 # Auto-compile on changes

# Debugging
code .                        # Open in VS Code
# Press F5                    # Launch Extension Host
# Ctrl+R (in Host)            # Reload extension

# Cleanup
rm -rf out                    # Delete compiled files
rm -rf node_modules           # Delete dependencies
npm install                   # Reinstall everything
```

---

## Windows-Specific Issues

### PowerShell Execution Policy

If scripts won't run:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Path Issues

Use forward slashes or double backslashes:
```json
"rootDir": "src"          ✓ Good
"rootDir": "src/"         ✓ Good
"rootDir": "src\\"        ✓ Good
"rootDir": "src\"         ✗ Bad
```

---

## Success Indicators

You know it's working when:

✅ No errors in terminal after `npm run compile`  
✅ `out/extension.js` file exists  
✅ F5 opens "Extension Development Host" window  
✅ Ctrl+Shift+P shows your commands  
✅ Extension activates without errors in Debug Console  

Happy coding! 🚀