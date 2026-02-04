#!/bin/bash
# AgentDocs.io GitHub Push Script
# Run this to push to GitHub

set -e

echo "🚀 Pushing AgentDocs.io to GitHub..."

# Check if origin remote exists
if ! git remote get-url origin &>/dev/null; then
    echo "📝 Adding GitHub remote..."
    git remote add origin https://github.com/YOUR_GITHUB_USERNAME/agentdocs-io.git
fi

# Commit any changes
echo "📝 Checking for changes..."
git add . 2>/dev/null || true
if git diff --cached --quiet; then
    echo "✅ No new changes to commit"
else
    git commit -m "Update: $(date -u +%Y-%m-%d\ %H:%M)" || echo "Commit failed or nothing to commit"
fi

# Push to GitHub
echo "⬆️  Pushing to GitHub..."
git push -u origin master

echo ""
echo "✅ Pushed to GitHub!"
echo "📦 Next: Import to Vercel at https://vercel.com"
