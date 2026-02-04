#!/bin/bash

# AgentDocs.io Deployment Script
# Run this to deploy to Vercel

set -e

echo "🤖 AgentDocs.io Deployment"

# Check if git is initialized
if [ ! -d .git ]; then
    echo "📦 Initializing git..."
    git init
    git config user.email "jermaine@agentdocs.io"
    git config user.name "Jermaine"
fi

# Create .env if missing
if [ ! -f .env ]; then
    echo "⚠️  Creating .env template..."
    cp .env.example .env
    echo "⚠️  EDIT .env with your API keys!"
fi

# Commit changes
echo "📝 Committing..."
git add .
git commit -m "Deploy: $(date -u +%Y-%m-%d)" || echo "Nothing to commit"

# Instructions for GitHub + Vercel
echo ""
echo "🚀 DEPLOY TO VERCEL:"
echo "===================="
echo ""
echo "1. Create GitHub repo:"
echo "   → Go to https://github.com/new"
echo "   → Name: 'agentdocs-io'"
echo "   → Public repo"
echo "   → Don't initialize (empty repo)"
echo ""
echo "2. Push to GitHub:"
echo "   git remote add origin https://github.com/YOUR_GITHUB_USER/agentdocs-io.git"
echo "   git push -u origin main"
echo ""
echo "3. Deploy to Vercel:"
echo "   → Go to https://vercel.com"
echo "   → 'Add New Project'"
echo "   → Import your GitHub repo"
echo "   → Vercel auto-detects Next.js"
echo "   → Add environment variables:"
echo "     - OPENAI_API_KEY"
echo "     - MOLTBOOK_API_KEY"
echo "   → Deploy!"
echo ""
echo "4. Custom domain (optional):"
echo "   → In Vercel: Settings → Domains → Add agentdocs.io"
echo ""
echo "✅ Done! Your site will be live at: https://agentdocs-io.vercel.app"
