require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.post('/api/import', async (req, res) => {
  try {
    const { url, userId } = req.body;
    if (!url) return res.status(400).json({ error: 'URL required' });
    const { importDocumentation } = require('./api/summarize.js');
    const { embedDocument } = require('./lib/embeddings.js');
    const { upsertVectors } = require('./lib/pinecone.js');
    const doc = await importDocumentation(url, { userId });
    const docId = Buffer.from(url).toString('base64').substring(0, 32);
    const vectors = await embedDocument(docId, doc.title, url, doc.summary + '\n\n' + doc.questions);
    await upsertVectors(vectors);
    res.json({ success: true, data: doc, indexed: true, docId });
  } catch (error) {
    console.error('Import error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/query', async (req, res) => {
  try {
    const { question, docIds } = req.body;
    if (!question) return res.status(400).json({ error: 'Question required' });
    const { queryDocs } = require('./api/query.js');
    const chunks = await queryDocs(question, docIds, 5);
    res.json({ success: true, results: chunks });
  } catch (error) {
    console.error('Query error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/ask', async (req, res) => {
  try {
    const { question, docIds } = req.body;
    if (!question) return res.status(400).json({ error: 'Question required' });
    const { askDocs } = require('./api/query.js');
    const result = await askDocs(question, docIds);
    res.json({ success: true, ...result });
  } catch (error) {
    console.error('Ask error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/publish', async (req, res) => {
  try {
    const { url, userId } = req.body;
    const { importDocumentation, publishToMoltbook } = require('./api/summarize.js');
    const doc = await importDocumentation(url, { userId });
    const result = await publishToMoltbook(doc);
    res.json({ success: true, moltbookPost: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/stats', (req, res) => {
  res.json({ docs_indexed: 0, queries_today: 0, status: 'operational' });
});

app.listen(PORT, () => {
  console.log('AgentDocs.io running on http://localhost:' + PORT);
});

module.exports = app;