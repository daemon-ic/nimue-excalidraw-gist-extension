#!/bin/bash

# Setup script for Chrome Extension with Vite and pnpm

echo "🚀 Setting up Chrome Extension with Vite and pnpm..."

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "📦 pnpm not found. Installing pnpm..."
    npm install -g pnpm
    
    if [ $? -eq 0 ]; then
        echo "✅ pnpm installed successfully!"
    else
        echo "❌ Failed to install pnpm. Please install it manually:"
        echo "npm install -g pnpm"
        exit 1
    fi
else
    echo "✅ pnpm is already installed"
fi

# Install project dependencies
echo "📦 Installing project dependencies..."
pnpm install

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully!"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

# Build the project
echo "🔨 Building the extension..."
pnpm run build

if [ $? -eq 0 ]; then
    echo "✅ Build completed successfully!"
    echo ""
    echo "🎉 Setup complete! Your Chrome extension is ready."
    echo ""
    echo "📋 Next steps:"
    echo "1. Open Chrome and go to chrome://extensions/"
    echo "2. Enable 'Developer mode' (toggle in top right)"
    echo "3. Click 'Load unpacked'"
    echo "4. Select the 'dist' folder from this project"
    echo "5. The extension should now appear in your extensions list"
    echo ""
    echo "🔄 Development commands:"
    echo "- Start dev server: pnpm dev"
    echo "- Build extension: pnpm build"
    echo "- Type check: pnpm type-check"
    echo "- Clean project: pnpm clean"
else
    echo "❌ Build failed! Check the error messages above."
    exit 1
fi 