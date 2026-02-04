const OPENAI_KEY = process.env.OPENAI_API_KEY;

async function fetchUrlContent(url) {
  const res = await fetch(url);
  return await res.text();
}

function extractTitle(content) {
  const titleMatch = content.match(/<title[^>]*>([^<]+)<\/title>/i);
  const h1Match = content.match(/<h1[^>]*>([^<]+)<\/h1>/i);
  return titleMatch ? titleMatch[1] : (h1Match ? h1Match[1] : 'Untitled Doc');
}

async function generateSummary(content) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + OPENAI_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'system', content: 'Summarize this documentation in 3-5 bullet points.' }, { role: 'user', content: content.substring(0, 16000) }],
      max_tokens: 500
    })
  });
  const data = await res.json();
  if (data.error) throw new Error('OpenAI error: ' + data.error.message);
  if (!data.choices || !data.choices[0]) throw new Error('OpenAI returned no choices: ' + JSON.stringify(data));
  return data.choices[0].message.content;
}

async function generateQuestions(content) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + OPENAI_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'system', content: 'Generate 5 common Q&A pairs from this doc.' }, { role: 'user', content: content.substring(0, 16000) }],
      max_tokens: 800
    })
  });
  const data = await res.json();
  if (data.error) throw new Error('OpenAI error: ' + data.error.message);
  if (!data.choices || !data.choices[0]) throw new Error('OpenAI returned no choices');
  return data.choices[0].message.content;
}

async function importDocumentation(url, options) {
  options = options || {};
  const content = await fetchUrlContent(url);
  
  // Process in chunks if content is very long
  let fullContent = content;
  if (content.length > 50000) {
    fullContent = content.substring(0, 50000) + '...';
  }
  
  const summary = await generateSummary(fullContent);
  const questions = await generateQuestions(fullContent);
  
  return {
    url: url,
    title: extractTitle(content),
    content: fullContent,  // Store full content for chunking
    summary: summary,
    questions: questions,
    wordCount: content.split(/\s+/).length,
    processedAt: new Date().toISOString()
  };
}

async function publishToMoltbook(doc) {
  return { status: 'skipped', message: 'Moltbook publish not implemented' };
}

module.exports = { importDocumentation, publishToMoltbook };