const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
const PINECONE_HOST = 'https://agentdocs-urz86of.svc.aped-4627-b74a.pinecone.io';
async function upsertVectors(vectors) {
  const res = await fetch(PINECONE_HOST + '/vectors/upsert', {
    method: 'POST',
    headers: { 'Api-Key': PINECONE_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ vectors })
  });
  return res.json();
}
async function queryVectors(vector, topK) {
  const res = await fetch(PINECONE_HOST + '/query', {
    method: 'POST',
    headers: { 'Api-Key': PINECONE_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ vector, topK: topK || 5, includeMetadata: true })
  });
  return res.json();
}
module.exports = { upsertVectors, queryVectors };
