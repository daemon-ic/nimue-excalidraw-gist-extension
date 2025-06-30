#!/bin/bash

# Build script for Chrome Extension with Vite (using pnpm)

echo "🚀 Building Chrome Extension with pnpm..."

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm is not installed. Please install pnpm first:"
    echo "npm install -g pnpm"
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies with pnpm..."
    pnpm install
fi

# Build the extension
echo "🔨 Building extension..."
pnpm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build completed successfully!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Open Chrome and go to chrome://extensions/"
    echo "2. Enable 'Developer mode' (toggle in top right)"
    echo "3. Click 'Load unpacked'"
    echo "4. Select the 'dist' folder from this project"
    echo "5. The extension should now appear in your extensions list"
    echo ""
    echo "🔄 To reload after changes:"
    echo "- Click the refresh icon on the extension card in chrome://extensions/"
    echo "- Or run this script again: ./build.sh"
    echo ""
    echo "📦 Package manager commands:"
    echo "- Install dependencies: pnpm install"
    echo "- Add new dependency: pnpm add <package>"
    echo "- Add dev dependency: pnpm add -D <package>"
    echo "- Run dev server: pnpm dev"
else
    echo "❌ Build failed! Check the error messages above."
    exit 1
fi 