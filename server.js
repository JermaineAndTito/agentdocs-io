require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3001;
app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.get('/health', (req, res) => { res.json({ status: 'ok', timestamp: new Date().toISOString() }); });
app.post('/api/import', async (req, res) => {
  try {
    const { url, userId } = req.body;
    const { importDocumentation } = require('./api/summarize.js');
    const { upsertRecords } = require('./lib/pinecone.js');
    const doc = await importDocumentation(url, { userId });
    const docId = Buffer.from(url).toString('base64').substring(0, 32);
    const records = [{ _id: docId, text: doc.summary + ' ' + doc.questions, title: doc.title, url: url }];
    await upsertRecords(records);
    res.json({ success: true, data: doc, indexed: true, docId });
  } catch (error) { console.error('Import error:', error); res.status(500).json({ error: error.message }); }
});
app.post('/api/ask', async (req, res) => {
  try {
    const { question } = req.body;
    if (!question) return res.status(400).json({ error: 'Question required' });
    const { searchRecords } = require('./lib/pinecone.js');
    const results = await searchRecords(question, 5);
    res.json({ success: true, results: results });
  } catch (error) { res.status(500).json({ error: error.message }); }
});
app.get('/api/stats', (req, res) => { res.json({ status: 'operational' }); });
app.listen(PORT, () => { console.log('AgentDocs running on port ' + PORT); });
module.exports = app;
