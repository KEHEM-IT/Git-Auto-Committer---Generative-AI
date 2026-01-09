#!/bin/bash

# Git Auto Commit Extension Setup Script
# This script automates the setup process

echo "🚀 Setting up Git Auto Commit Extension..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed. Please install Node.js first."
    exit 1
fi

echo "✓ Node.js found: $(node --version)"
echo "✓ NPM found: $(npm --version)"

# Create directory structure
echo ""
echo "📁 Creating directory structure..."
mkdir -p src
mkdir -p .vscode
mkdir -p out

# Check if main.ts exists in root and warn user
if [ -f "main.ts" ]; then
    echo "⚠️  Warning: Found 'main.ts' in root directory."
    echo "   The code should be in 'src/extension.ts' instead."
    read -p "   Would you like to move it to src/extension.ts? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        mv main.ts src/extension.ts
        echo "✓ Moved main.ts to src/extension.ts"
    fi
fi

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install --save-dev @types/node@^16.18.0 @types/vscode@^1.75.0 typescript@^4.9.5

echo ""
echo "📦 Installing development tools..."
npm install --save-dev @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint

# Create .vscode/launch.json if it doesn't exist
if [ ! -f ".vscode/launch.json" ]; then
    echo ""
    echo "📝 Creating .vscode/launch.json..."
    cat > .vscode/launch.json << 'EOF'
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Run Extension",
      "type": "extensionHost",
      "request": "launch",
      "args": [
        "--extensionDevelopmentPath=${workspaceFolder}"
      ],
      "outFiles": [
        "${workspaceFolder}/out/**/*.js"
      ],
      "preLaunchTask": "${defaultBuildTask}"
    }
  ]
}
EOF
    echo "✓ Created .vscode/launch.json"
fi

# Create .vscodeignore if it doesn't exist
if [ ! -f ".vscodeignore" ]; then
    echo ""
    echo "📝 Creating .vscodeignore..."
    cat > .vscodeignore << 'EOF'
.vscode/**
.vscode-test/**
src/**
.gitignore
vsc-extension-quickstart.md
**/tsconfig.json
**/.eslintrc.json
**/*.map
**/*.ts
node_modules/**
setup.sh
EOF
    echo "✓ Created .vscodeignore"
fi

# Create .gitignore if it doesn't exist
if [ ! -f ".gitignore" ]; then
    echo ""
    echo "📝 Creating .gitignore..."
    cat > .gitignore << 'EOF'
out
node_modules
.vscode-test/
*.vsix
.DS_Store
EOF
    echo "✓ Created .gitignore"
fi

# Compile TypeScript
echo ""
echo "🔨 Compiling TypeScript..."
npm run compile

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Setup completed successfully!"
    echo ""
    echo "Next steps:"
    echo "  1. Make sure your extension code is in 'src/extension.ts'"
    echo "  2. Press F5 in VS Code to run the extension"
    echo "  3. Test it in the Extension Development Host window"
    echo ""
    echo "Useful commands:"
    echo "  npm run compile  - Compile TypeScript"
    echo "  npm run watch    - Watch mode (auto-compile)"
    echo ""
    echo "Happy coding! 🎉"
else
    echo ""
    echo "❌ Compilation failed. Please check the errors above."
    echo ""
    echo "Common issues:"
    echo "  - Make sure your code is in src/extension.ts"
    echo "  - Check for TypeScript errors in the code"
    echo "  - Verify tsconfig.json is correct"
    exit 1
fi