require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3001;

// Usage tracking middleware
const { rateLimitMiddleware, getStats, getAllStats, RATE_LIMITS } = require('./lib/usage.js');

app.use(cors()); 
app.use(express.json()); 
app.use(express.static('public'));
// Serve index.html for root path
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Apply rate limiting to API routes
app.use('/api/', rateLimitMiddleware);

// Health check (no rate limit)
app.get('/health', (req, res) => res.json({ 
  status: 'ok',
  tier: 'free',
  limits: RATE_LIMITS.free
}));
app.post('/api/import', async (req, res) => {
  try {
    const { url } = req.body;
    const { importDocumentation } = require('./api/summarize.js');
    const { embedDocument } = require('./lib/embeddings.js');
    const { upsertVectors } = require('./lib/pinecone.js');
    const doc = await importDocumentation(url, {});
    const docId = Buffer.from(url).toString('base64').substring(0, 24);
    
    // PRIORITY 5: Improved chunking - embed full document content
    // Store 1 vector per 500-800 tokens for better retrieval
    const vectors = await embedDocument(docId, doc.title, url, doc.content || doc.summary + ' ' + doc.questions);
    await upsertVectors(vectors);
    
    res.json({ 
      success: true, 
      data: doc, 
      docId,
      chunksCreated: vectors.length  // Track how many chunks were created
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});
app.get('/api/stats', (req, res) => {
  const apiKey = req.headers['x-api-key'] || 'anonymous';
  const userStats = getStats(apiKey);
  const allStats = getAllStats();
  
  res.json({
    status: 'ok',
    user: userStats,
    platform: allStats,
    limits: RATE_LIMITS[userStats.tier || 'free']
  });
});

// Get usage stats for current user
app.get('/api/usage', (req, res) => {
  const apiKey = req.headers['x-api-key'] || 'anonymous';
  const stats = getStats(apiKey);
  const limits = RATE_LIMITS[stats.tier || 'free'];
  
  res.json({
    tier: stats.tier || 'free',
    docsIndexed: stats.docsIndexed || 0,
    queries: stats.queries || 0,
    docsLimit: limits.docsPerMonth === -1 ? 'unlimited' : limits.docsPerMonth,
    queriesLimit: limits.queriesPerMonth === -1 ? 'unlimited' : limits.queriesPerMonth,
    upgrade: stats.tier !== 'pro' && stats.tier !== 'enterprise' ? 'Pro ($29/mo)' : null
  });
});

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

app.listen(PORT, () => console.log('Running on ' + PORT));
module.exports = app;
