#!/bin/bash

# Start Vision Agents Backend
# This script starts the Python Vision Agents server

set -e

echo "🚀 Starting Vision Agents Backend..."

# Check if we're in the right directory
if [ ! -f "pyproject.toml" ]; then
    cd vision-backend 2>/dev/null || {
        echo "❌ Error: Run this script from the project root or vision-backend directory"
        exit 1
    }
fi

# Check for uv
if ! command -v uv &> /dev/null; then
    echo "📦 Installing uv package manager..."
    curl -LsSf https://astral.sh/uv/install.sh | sh
    source ~/.bashrc 2>/dev/null || source ~/.zshrc 2>/dev/null
fi

# Check for .env file
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        echo "⚠️  No .env file found. Creating from .env.example..."
        cp .env.example .env
        echo "📝 Please edit vision-backend/.env with your API keys"
        echo ""
        echo "Required:"
        echo "  - GEMINI_API_KEY: Get from https://makersuite.google.com/app/apikey"
        echo ""
        echo "Optional (for full Vision Agents features):"
        echo "  - STREAM_API_KEY: Get from https://getstream.io/"
        echo "  - ELEVENLABS_API_KEY: For voice synthesis"
        echo "  - DEEPGRAM_API_KEY: For speech recognition"
        echo ""
    else
        echo "❌ Error: No .env or .env.example file found"
        exit 1
    fi
fi

# Install dependencies
echo "📦 Installing Python dependencies..."
uv sync

# Start the server
echo ""
echo "✅ Starting server on http://127.0.0.1:8765"
echo "   Health check: http://127.0.0.1:8765/health"
echo "   Press Ctrl+C to stop"
echo ""

uv run python server.py
