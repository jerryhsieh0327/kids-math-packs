#!/bin/sh
set -e; cd "$(dirname "$0")"
python3 build.py
node --check assets/quiz.js
echo "Now publish via Composio GITHUB_COMMIT_MULTIPLE_FILES (see README.md)."
