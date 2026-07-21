#!/usr/bin/env bash
# Build script for Render — installs dependencies + Playwright Chromium
set -e

echo "Installing Python dependencies..."
pip install -r requirements.txt

echo "Installing Playwright Chromium browser..."
# Skip system dependency installation (no root on Render) and host validation
export PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS=1
playwright install chromium

echo "Build complete!"
