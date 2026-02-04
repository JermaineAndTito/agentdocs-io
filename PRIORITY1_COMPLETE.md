# Priority 1 Complete: /api/ask Endpoint Added

## Changes Made

**File: server.js**

Added endpoint after `/api/stats`:

```javascript
// PRIORITY 1: Query API - Ask questions about indexed docs
app.post('/api/ask', async (req, res) => {
  try {
    const { question, docIds } = req.body;
    if (!question) return res.status(400).json({ error: 'question required' });
    const { askDocs } = require('./api/query.js');
    const result = await askDocs(question, docIds);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});
```

## Usage

```bash
# Ask a question about indexed docs
curl -X POST https://agentdocs-io-v2.vercel.app/api/ask \
  -H "Content-Type: application/json" \
  -d '{"question": "How do I use prompt caching?"}'

# Response:
{
  "answer": "Prompt caching allows you to cache...",
  "sources": ["https://docs.anthropic.com/...", "https://docs.example.com/..."]
}
```

## Next Steps

1. Deploy changes: `git pull` on server or push to GitHub
2. Test the endpoint
3. Move to Priority 2: Frontend UI
