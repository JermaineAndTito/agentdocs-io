const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
const PINECONE_INDEX_HOST = 'https://agentdocs-urz86of.svc.aped-4627-b74a.pinecone.io';

async function upsertRecords(records) {
  const res = await fetch(PINECONE_INDEX_HOST + '/records/upsert', {
    method: 'POST',
    headers: { 'Api-Key': PINECONE_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify(records)
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error('Pinecone upsert failed: ' + err);
  }
  return res.json();
}

async function searchRecords(query, topK) {
  const res = await fetch(PINECONE_INDEX_HOST + '/records/search', {
    method: 'POST',
    headers: { 'Api-Key': PINECONE_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: { top_k: topK || 5, inputs: { text: query } }, fields: ['text', 'title', 'url'] })
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error('Pinecone search failed: ' + err);
  }
  return res.json();
}

module.exports = { upsertRecords, searchRecords };