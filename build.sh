#!/usr/bin/env bash
# Build script for Render — installs dependencies + Playwright Chromium
set -e

echo "Installing Python dependencies..."
pip install -r requirements.txt

echo "Installing Playwright Chromium browser..."
playwright install --with-deps chromium

echo "Build complete!"
