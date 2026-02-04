const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
const PINECONE_INDEX_HOST = 'https://agentdocs-urz86of.svc.aped-4627-b74a.pinecone.io';

async function upsertVectors(vectors) {
  const res = await fetch(PINECONE_INDEX_HOST + '/vectors/upsert', {
    method: 'POST',
    headers: { 'Api-Key': PINECONE_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ vectors })
  });
  if (!res.ok) throw new Error('Pinecone upsert failed');
  return res.json();
}

async function queryVectors(vector, topK, filter) {
  const body = { vector, topK: topK || 5, includeMetadata: true };
  if (filter) body.filter = filter;
  const res = await fetch(PINECONE_INDEX_HOST + '/query', {
    method: 'POST',
    headers: { 'Api-Key': PINECONE_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error('Pinecone query failed');
  return res.json();
}

module.exports = { upsertVectors, queryVectors };