#!/usr/bin/env bash
# Usage : scripts/publier-theme.sh <theme-id> <dossier-recherche>
set -e
T=$1; R=$2
python3 scripts/import-theme.py "$T" "$R/theme-$T.json" 2026-11-11 | head -1
python3 scripts/a-verifier.py "$T" "$R"
npm run build > /tmp/build-$T.log 2>&1 || { grep -E "error|Error|InvalidContent|  [a-z_.0-9]+:" /tmp/build-$T.log | head -20; exit 1; }
echo BUILD_OK
