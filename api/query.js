const { createEmbedding } = require('../lib/embeddings.js');
const { queryVectors } = require('../lib/pinecone.js');
const OPENAI_KEY = process.env.OPENAI_API_KEY;

async function queryDocs(question, docIds, topK) {
  topK = topK || 10;  // Increased to get more chunks for synthesis
  const emb = await createEmbedding(question);
  const filter = docIds && docIds.length > 0 ? { docId: { $in: docIds } } : undefined;
  const result = await queryVectors(emb, topK, filter);
  return result.matches || [];
}

async function askDocs(question, docIds) {
  // PRIORITY 5: Retrieve more chunks for better context
  const chunks = await queryDocs(question, docIds, 10);
  
  if (chunks.length === 0) {
    return { 
      answer: 'No relevant documentation found.', 
      sources: [],
      chunksRetrieved: 0
    };
  }
  
  // Group chunks by doc and build context
  const context = chunks.map(c => c.metadata.text).join('\n\n---\n\n');
  
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + OPENAI_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'Answer the question based only on the provided documentation context. Be concise, accurate, and helpful. Cite sources when possible. If the answer is not in the context, say so.' },
        { role: 'user', content: 'Documentation Context:\n' + context + '\n\nQuestion: ' + question }
      ],
      max_tokens: 800
    })
  });
  
  const data = await res.json();
  
  // Deduplicate sources
  const sources = [...new Set(chunks.map(c => ({
    url: c.metadata.url,
    title: c.metadata.title,
    chunk: c.metadata.chunk
  })))];
  
  return { 
    answer: data.choices[0].message.content, 
    sources: sources,
    chunksRetrieved: chunks.length
  };
}

module.exports = { queryDocs, askDocs };