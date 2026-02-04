const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Estimate tokens (rough approximation: 4 chars per token)
function estimateTokens(text) {
  return Math.ceil(text.length / 4);
}

// PRIORITY 5: Improved chunking - 500-800 tokens per chunk with overlap
function chunkText(text, minSize, maxSize, overlap) {
  minSize = minSize || 500;
  maxSize = maxSize || 800;
  overlap = overlap || 100;
  
  // Split by paragraphs first to preserve context
  const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 0);
  const chunks = [];
  let currentChunk = '';
  let currentTokens = 0;
  
  for (const para of paragraphs) {
    const paraTokens = estimateTokens(para);
    
    // If paragraph is huge, split it further
    if (paraTokens > maxSize) {
      // Split by sentences
      const sentences = para.match(/[^.!?]+[.!?]+/g) || [para];
      for (const sentence of sentences) {
        const sentTokens = estimateTokens(sentence);
        
        if (currentTokens + sentTokens > maxSize && currentChunk.length > 0) {
          // Save current chunk and start new one with overlap
          chunks.push(currentChunk.trim());
          currentChunk = currentChunk.slice(-overlap) + ' ' + sentence;
          currentTokens = estimateTokens(currentChunk);
        } else {
          currentChunk += ' ' + sentence;
          currentTokens += sentTokens;
        }
      }
    } else {
      // Paragraph fits in chunk
      if (currentTokens + paraTokens > maxSize && currentChunk.length > 0) {
        // Save current chunk and start new one with overlap
        chunks.push(currentChunk.trim());
        currentChunk = currentChunk.slice(-overlap) + ' ' + para;
        currentTokens = estimateTokens(currentChunk);
      } else {
        currentChunk += ' ' + para;
        currentTokens += paraTokens;
      }
    }
  }
  
  // Don't forget the last chunk
  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks.filter(c => c.length > 100); // Filter out tiny chunks
}

async function createEmbedding(text) {
  const res = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + OPENAI_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'text-embedding-3-small', input: text })
  });
  const data = await res.json();
  return data.data[0].embedding;
}

async function embedDocument(docId, title, url, content) {
  // PRIORITY 5: Create multiple chunks from full document content
  const chunks = chunkText(content);
  const vectors = [];
  
  console.log(`Creating ${chunks.length} chunks from ${estimateTokens(content)} tokens of content`);
  
  for (let i = 0; i < chunks.length; i++) {
    const chunkTokens = estimateTokens(chunks[i]);
    const emb = await createEmbedding(chunks[i]);
    vectors.push({
      id: docId + '-' + i,
      values: emb,
      metadata: { 
        docId: docId, 
        title: title, 
        url: url, 
        chunk: i, 
        totalChunks: chunks.length,
        chunkTokens: chunkTokens,
        text: chunks[i].substring(0, 500) + '...' // Store preview for debugging
      }
    });
  }
  return vectors;
}

module.exports = { createEmbedding, chunkText, embedDocument };