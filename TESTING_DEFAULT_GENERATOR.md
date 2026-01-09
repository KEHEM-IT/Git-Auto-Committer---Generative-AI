# Default Commit Generator - Testing Guide

## Quick Test Checklist

### ✅ Pre-Test Setup
1. Open the project in VSCode
2. Run `npm install` (if not already done)
3. Compile TypeScript: `npm run compile`
4. Press F5 to launch Extension Development Host

---

## Test Scenario 1: Default Generator (No AI)

### Setup
```json
// In VSCode settings
{
  "gitAutoCommit.useAIGeneration": false,
  "gitAutoCommit.commitMessageStyle": "conventional"
}
```

### Steps
1. Make some changes to files (e.g., edit `README.md`)
2. Run command: "Git Auto Commit: Generate Commit Message"
3. Check Source Control input box

### Expected Result
✅ Commit message appears instantly  
✅ No API key prompt  
✅ Message follows format: `type(scope): subject`  
✅ Example: `docs: update readme.md`

---

## Test Scenario 2: AI Disabled + Simple Style

### Setup
```json
{
  "gitAutoCommit.useAIGeneration": false,
  "gitAutoCommit.commitMessageStyle": "simple"
}
```

### Steps
1. Edit multiple files (e.g., 3-4 TypeScript files)
2. Generate commit message
3. Check output

### Expected Result
✅ Message like: `Update 4 files (+32/-8): file1.ts, file2.ts and 2 more files`  
✅ Clean, concise format  
✅ Shows file count and change stats  

---

## Test Scenario 3: AI Disabled + Detailed Style

### Setup
```json
{
  "gitAutoCommit.useAIGeneration": false,
  "gitAutoCommit.commitMessageStyle": "detailed"
}
```

### Steps
1. Modify mixed file types (ts, tsx, json, md)
2. Generate commit message
3. Review message details

### Expected Result
✅ Multi-line message with sections:
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

---

## Test Scenario 4: AI Enabled But No API Key

### Setup
```json
{
  "gitAutoCommit.useAIGeneration": true,
  "gitAutoCommit.aiApiKey": "",
  "gitAutoCommit.commitMessageStyle": "conventional"
}
```

### Steps
1. Make changes
2. Generate commit message
3. Check for info message

### Expected Result
✅ Shows message: "Using default commit message generator. Configure AI for smarter messages."  
✅ Button appears: "Configure AI"  
✅ Commit message still generated using default generator  
✅ Message follows conventional format  

---

## Test Scenario 5: AI Enabled + Valid Key (Fallback Test)

### Setup
```json
{
  "gitAutoCommit.useAIGeneration": true,
  "gitAutoCommit.aiApiKey": "invalid-key-for-testing",
  "gitAutoCommit.commitMessageStyle": "detailed"
}
```

### Steps
1. Make changes
2. Generate commit message
3. AI should fail (invalid key)

### Expected Result
✅ Shows warning: "AI generation failed: [error]. Using default generator."  
✅ Falls back to default generator  
✅ Message generated in detailed style  
✅ Extension continues working  

---

## Test Scenario 6: File Type Detection

### Test 6a: Documentation Files
1. Edit `README.md` and create `docs/guide.md`
2. Generate commit with conventional style

**Expected:** `docs: update 2 md files`

### Test 6b: Config Files
1. Edit `package.json` and `tsconfig.json`
2. Generate commit

**Expected:** `chore(config): update 2 json files`  
or `chore: update 2 json files`

### Test 6c: Test Files
1. Create/edit files with `.test.ts` or `.spec.ts`
2. Generate commit

**Expected:** `test: update N test files`

### Test 6d: Style Files
1. Edit `.css` or `.scss` files
2. Generate commit

**Expected:** `style: update N css files`

### Test 6e: Source Code
1. Edit `.ts`, `.tsx`, or `.js` files
2. Generate commit

**Expected:** `feat: ...` or `fix: ...` (depending on additions/deletions)

---

## Test Scenario 7: Scope Detection

### Test 7a: Single Directory
1. Edit multiple files in `src/components/`
2. Generate conventional commit

**Expected:** `type(components): ...`

### Test 7b: Multiple Directories
1. Edit files in `src/utils/` and `src/services/`
2. Generate commit

**Expected:** `type(src): ...` (common parent)

### Test 7c: Root Level
1. Edit files directly in root (README.md, package.json)
2. Generate commit

**Expected:** `type: ...` (no scope)

---

## Test Scenario 8: Change Type Detection

### Test 8a: More Additions (Feature)
1. Add 50 new lines, delete 10 lines
2. Generate commit

**Expected:** Type = `feat`

### Test 8b: More Deletions (Refactor)
1. Delete 50 lines, add 10 lines
2. Generate commit

**Expected:** Type = `refactor`

### Test 8c: Balanced Changes (Fix)
1. Add 20 lines, delete 20 lines in source files
2. Generate commit

**Expected:** Type = `fix`

---

## Test Scenario 9: Message Style Switching

1. Make changes to 3 files
2. Generate with `conventional` → Note message
3. Change setting to `simple` without committing
4. Generate again → Compare message
5. Change to `detailed`
6. Generate again → Compare all three

**Expected:** Three different formats for same changes

---

## Test Scenario 10: Integration with Auto-Commit

### Setup
```json
{
  "gitAutoCommit.useAIGeneration": false,
  "gitAutoCommit.enableAutoCommit": true,
  "gitAutoCommit.autoCommitInterval": 1,
  "gitAutoCommit.commitMessageStyle": "simple"
}
```

### Steps
1. Make a small change
2. Wait 1 minute (or configured interval)
3. Check if auto-commit triggers

**Expected:**
✅ Default generator creates message automatically  
✅ Commit happens without AI  
✅ No errors or API key prompts  

---

## Edge Cases to Test

### Edge Case 1: No Changes
1. Don't make any changes
2. Try to generate commit

**Expected:** "No changes to commit"

### Edge Case 2: Single Character Change
1. Add/remove one character from a file
2. Generate commit

**Expected:** Valid commit message generated

### Edge Case 3: Binary Files
1. Add an image or binary file
2. Generate commit

**Expected:** Handles gracefully, generates message

### Edge Case 4: Very Long File Names
1. Edit file with very long path
2. Generate commit

**Expected:** Truncates or handles appropriately

### Edge Case 5: Special Characters in Filenames
1. Edit file with spaces, unicode, etc.
2. Generate commit

**Expected:** Escapes or handles correctly

---

## Performance Tests

### Test 1: Large Diff (100+ files)
1. Edit many files at once
2. Generate commit

**Expected:**
✅ Generates in < 1 second  
✅ No timeout or freeze  
✅ Message is still meaningful  

### Test 2: Very Large Single File
1. Edit file with 10,000+ lines
2. Generate commit

**Expected:** Handles without performance issues

---

## Verification Checklist

After all tests, verify:

- [ ] No TypeScript compilation errors
- [ ] No runtime errors in console
- [ ] All three styles work correctly
- [ ] Type detection is logical
- [ ] Scope detection makes sense
- [ ] Messages are readable and useful
- [ ] No API calls when AI disabled
- [ ] Graceful fallback when AI fails
- [ ] Settings are respected
- [ ] Works with auto-commit
- [ ] Source Control integration works
- [ ] No memory leaks or performance issues

---

## How to Report Issues

If you find bugs during testing:

1. **Note the scenario** - Which test case failed?
2. **Copy the error** - Any console errors?
3. **Document the diff** - What files were changed?
4. **Expected vs Actual** - What should happen vs what happened?
5. **Settings** - What configuration was active?
6. **Create issue** on GitHub with all above details

---

## Success Criteria

The implementation is successful if:

✅ All 10 test scenarios pass  
✅ Edge cases are handled  
✅ Performance is acceptable  
✅ No errors in normal usage  
✅ Messages are meaningful and useful  
✅ Fallback logic works correctly  
✅ Settings are applied properly  

---

**Test Date:** ___________  
**Tester:** ___________  
**Version:** 1.0.5+  
**Status:** [ ] PASS [ ] FAIL [ ] NEEDS FIXES

**Notes:**
