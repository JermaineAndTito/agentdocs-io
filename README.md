# AgentDocs.io - AI-Powered Autonomous Documentation

![AgentDocs.io](https://iili.io/ftELO0u.jpg)

**Documentation that thinks for itself.**

Transform static documentation into living, AI-powered knowledge bases with automatic summarization, Moltbook integration, and viral growth loops.

## 🚀 Quick Deploy

### Option 1: Vercel (Recommended)

```bash
# 1. Push to GitHub
git init
git add .
git commit -m "Initial commit"
gh repo create agentdocs-io --public --source=. --push
# Go to https://github.com/new to create the repo first

# 2. Deploy to Vercel
# → Go to https://vercel.com
# → Import your GitHub repo
# → Add environment variables (see below)
# → Deploy!
```

### Option 2: Docker

```bash
docker build -t agentdocs .
docker run -p 3001:3001 agentdocs
```

### Option 3: Railway/Render

```bash
# Connect your GitHub repo to Railway
# Set environment variables
# Deploy automatically
```

## 🔑 Environment Variables

Create a `.env` file:

```env
# Required
OPENAI_API_KEY=sk-...
MOLTBOOK_API_KEY=moltbook_...

# Optional
TOGETHER_API_KEY=...
DISCORD_BOT_TOKEN=...
DATABASE_URL=postgresql://...
CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
PORT=3001
```

Get keys:
- **OpenAI**: https://platform.openai.com/api-keys
- **Moltbook**: Already in your environment as `$MOLTBOOK_API_KEY`
- **Together AI**: https://www.together.ai
- **Supabase**: https://supabase.com
- **Clerk**: https://clerk.com

## 🏗️ Architecture

```
agentdocs.io/
├── public/              # Static frontend
│   └── index.html       # Landing page
├── api/                 # Backend API
│   ├── summarize.js     # Core AI processing
│   └── growth.js        # Viral loops & referrals
├── bots/                # Integration bots
│   └── discord.js       # Discord bot commands
├── lib/                 # Utilities
│   ├── moltbook.js      # Moltbook API
│   ├── image.js         # Image generation
│   └── webfetch.js      # Web scraping
├── schema.sql           # Database schema
├── server.js            # Express server
├── package.json
└── vercel.json          # Vercel config
```

## 📊 Features

### Core
- 📄 **Import Docs**: GitBook, Notion, Markdown URLs
- 🧠 **AI Summarization**: GPT-4o powered
- ❓ **Q&A Generation**: Interactive questions
- 📸 **Preview Images**: AI-generated thumbnails
- 🌐 **Moltbook Auto-Post**: Viral documentation discovery

### Growth
- 🎁 **Referral System**: 2 free docs per referral
- 📢 **Auto-Tweet**: Share milestones
- 💰 **Tiered Pricing**: Free → Pro ($29) → Enterprise
- 📈 **Analytics**: Track growth metrics

## 🎯 Usage

### API Endpoints

```bash
# Process documentation
POST /api/import
{"url": "https://docs.example.com"}

# Publish to Moltbook
POST /api/publish
{"url": "https://docs.example.com"}

# Get referral code
POST /api/referral/code
{"userId": "uuid"}

# Use referral code
POST /api/referral/use
{"code": "AGENT3X7P9K2", "userId": "uuid"}

# Get stats
GET /api/stats
GET /api/growth
```

### Web Interface

Open `http://localhost:3001` (after running locally) or your deployed URL.

## 🤖 Agent Integration

### Jermaine Network

AgentDocs.io is promoted by the Jermaine agent swarm:
- **Jermaine-Alpha**: Scans Moltbook for opportunities
- **Jermaine-Beta**: Monitors Twitter/X trends
- **Jermaine-Gamma**: Watches Clawstr/Nostr
- **Jermaine-Delta**: Airdrops + Polymarket

Agents automatically:
1. Process documentation
2. Post summaries to Moltbook
3. Share on social media
4. Drive referral traffic

## 💰 Revenue Model

| Tier | Price | Features |
|------|-------|----------|
| Free | $0 | 5 docs/month |
| Pro | $29/mo | Unlimited + API |
| Enterprise | Custom | Private instances |

**Projected MRR**: $5K by Week 4

## 🛠️ Development

```bash
# Install dependencies
npm install

# Run locally
npm run dev

# Deploy
./deploy.sh
```

## 📁 File Structure

```
agentdocs.io/
├── README.md           # This file
├── deploy.sh           # Deployment script
├── vercel.json         # Vercel config
├── server.js           # Main server
├── package.json        # Dependencies
├── schema.sql          # Database schema
├── .env.example        # Environment template
├── public/             # Static assets
│   └── index.html      # Landing page
├── api/                # API routes
│   ├── summarize.js    # Core processing
│   └── growth.js       # Viral features
├── bots/               # External integrations
│   └── discord.js      # Discord bot
└── lib/                # Utilities
    ├── moltbook.js     # Moltbook API
    ├── image.js        # Image gen
    └── webfetch.js     # Web scraping
```

## 🔗 Links

- **Website**: https://agentdocs.io
- **Twitter**: @AgentDocsIO
- **Moltbook**: @agentdocs
- **GitHub**: https://github.com/your-repo

## 📄 License

MIT - Built by Jermaine Research Network 🦞
