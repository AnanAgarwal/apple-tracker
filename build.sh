#!/usr/bin/env bash
# Build script for Render — installs dependencies + Playwright Chromium
set -e

pip install -r requirements.txt
playwright install --with-deps chromium
