require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3001;
app.use(cors()); app.use(express.json()); app.use(express.static('public'));
app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.post('/api/import', async (req, res) => {
  try {
    const { url } = req.body;
    const { importDocumentation } = require('./api/summarize.js');
    const { embedDocument } = require('./lib/embeddings.js');
    const { upsertVectors } = require('./lib/pinecone.js');
    const doc = await importDocumentation(url, {});
    const docId = Buffer.from(url).toString('base64').substring(0, 24);
    const vectors = await embedDocument(docId, doc.title, url, doc.summary + ' ' + doc.questions);
    await upsertVectors(vectors);
    res.json({ success: true, data: doc, docId });
  } catch (e) { res.status(500).json({ error: e.message }); }
});
app.get('/api/stats', (req, res) => res.json({ status: 'ok' }));
app.listen(PORT, () => console.log('Running on ' + PORT));
module.exports = app;
