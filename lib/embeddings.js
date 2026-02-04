const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

async function createEmbedding(text) {
  const res = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + OPENAI_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'text-embedding-3-small', input: text })
  });
  const data = await res.json();
  return data.data[0].embedding;
}

function chunkText(text, size) {
  size = size || 800;
  const words = text.split(/\s+/);
  const chunks = [];
  for (let i = 0; i < words.length; i += size) {
    chunks.push(words.slice(i, i + size).join(' '));
  }
  return chunks;
}

async function embedDocument(docId, title, url, content) {
  const chunks = chunkText(content);
  const vectors = [];
  for (let i = 0; i < chunks.length; i++) {
    const emb = await createEmbedding(chunks[i]);
    vectors.push({
      id: docId + '-' + i,
      values: emb,
      metadata: { docId: docId, title: title, url: url, chunk: i, text: chunks[i].substring(0, 1000) }
    });
  }
  return vectors;
}

module.exports = { createEmbedding, chunkText, embedDocument };