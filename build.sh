#!/usr/bin/env bash
# Build script for Render
set -e

echo "Installing Python dependencies..."
pip install -r requirements.txt

echo "Installing Playwright Chromium browser..."
# Install browsers inside the project directory so they persist to runtime
export PLAYWRIGHT_BROWSERS_PATH=/opt/render/project/src/.browsers
export PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS=1
playwright install chromium

echo "Installed browsers at: /opt/render/project/src/.browsers"
ls -la /opt/render/project/src/.browsers/ || true

echo "Build complete!"
