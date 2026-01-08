@echo off
setlocal enabledelayedexpansion

echo.
echo ========================================
echo Git Auto Commit Extension Setup
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo [OK] Node.js found: 
node --version
echo [OK] NPM found: 
npm --version
echo.

REM Create directory structure
echo Creating directory structure...
if not exist "src" mkdir src
if not exist ".vscode" mkdir .vscode
if not exist "out" mkdir out
echo [OK] Directories created
echo.

REM Check for main.ts in root
if exist "main.ts" (
    echo [WARNING] Found 'main.ts' in root directory.
    echo The code should be in 'src\extension.ts' instead.
    set /p move="Would you like to move it to src\extension.ts? (Y/N): "
    if /i "!move!"=="Y" (
        move main.ts src\extension.ts
        echo [OK] Moved main.ts to src\extension.ts
    )
    echo.
)

REM Install dependencies
echo Installing dependencies...
call npm install --save-dev @types/node@^16.18.0 @types/vscode@^1.75.0 typescript@^4.9.5
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install dependencies
    pause
    exit /b 1
)
echo [OK] Dependencies installed
echo.

echo Installing development tools...
call npm install --save-dev @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint
echo [OK] Development tools installed
echo.

REM Create .vscode/launch.json
if not exist ".vscode\launch.json" (
    echo Creating .vscode\launch.json...
    (
        echo {
        echo   "version": "0.2.0",
        echo   "configurations": [
        echo     {
        echo       "name": "Run Extension",
        echo       "type": "extensionHost",
        echo       "request": "launch",
        echo       "args": [
        echo         "--extensionDevelopmentPath=${workspaceFolder}"
        echo       ],
        echo       "outFiles": [
        echo         "${workspaceFolder}/out/**/*.js"
        echo       ],
        echo       "preLaunchTask": "${defaultBuildTask}"
        echo     }
        echo   ]
        echo }
    ) > .vscode\launch.json
    echo [OK] Created .vscode\launch.json
    echo.
)

REM Create .vscodeignore
if not exist ".vscodeignore" (
    echo Creating .vscodeignore...
    (
        echo .vscode/**
        echo .vscode-test/**
        echo src/**
        echo .gitignore
        echo vsc-extension-quickstart.md
        echo **/tsconfig.json
        echo **/.eslintrc.json
        echo **/*.map
        echo **/*.ts
        echo node_modules/**
        echo setup.bat
        echo setup.sh
    ) > .vscodeignore
    echo [OK] Created .vscodeignore
    echo.
)

REM Create .gitignore
if not exist ".gitignore" (
    echo Creating .gitignore...
    (
        echo out
        echo node_modules
        echo .vscode-test/
        echo *.vsix
        echo .DS_Store
    ) > .gitignore
    echo [OK] Created .gitignore
    echo.
)

REM Compile TypeScript
echo Compiling TypeScript...
call npm run compile
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Compilation failed!
    echo.
    echo Common issues:
    echo   - Make sure your code is in src\extension.ts
    echo   - Check for TypeScript errors
    echo   - Verify tsconfig.json is correct
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo Setup completed successfully!
echo ========================================
echo.
echo Next steps:
echo   1. Make sure your extension code is in 'src\extension.ts'
echo   2. Press F5 in VS Code to run the extension
echo   3. Test it in the Extension Development Host window
echo.
echo Useful commands:
echo   npm run compile  - Compile TypeScript
echo   npm run watch    - Watch mode (auto-compile)
echo.
echo Happy coding! ^_^
echo.
pause