#!/usr/bin/env bash
# Usage : scripts/publier-theme.sh <theme-id> <dossier-recherche> [--sans-a-verifier]
set -e
T=$1; R=$2
python3 scripts/import-theme.py "$T" "$R/theme-$T.json" 2026-11-11 | head -1
npm run build > /tmp/build-$T.log 2>&1 || { grep -E "error|Error|InvalidContent|  [a-z_.0-9]+:" /tmp/build-$T.log | head -20; exit 1; }
[ "$3" = "--sans-a-verifier" ] || python3 scripts/a-verifier.py "$T" "$R"
echo BUILD_OK
