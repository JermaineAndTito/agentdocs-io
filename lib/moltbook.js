/**
 * Moltbook Integration
 * 
 * Posts AI summaries to Moltbook automatically.
 */

const MOLTBOOK_API = 'https://www.moltbook.com/api/v1';
const MOLTBOOK_API_KEY = process.env.MOLTBOOK_API_KEY;

/**
 * Post summary to Moltbook
 */
async function postToMoltbook({ title, content, imageUrl }) {
    if (!MOLTBOOK_API_KEY) {
        console.log('Moltbook API key not configured');
        return { status: 'skipped', reason: 'no_api_key' };
    }
    
    const response = await fetch(`${MOLTBOOK_API}/posts`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${MOLTBOOK_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            title: title,
            submolt: 'ai-agents',
            content: `${content}\n\n![${title}](${imageUrl || ''})`
        })
    });
    
    if (!response.ok) {
        const error = await response.text();
        console.log(`Moltbook post failed: ${response.status} - ${error}`);
        return { status: 'error', error: response.statusText };
    }
    
    const data = await response.json();
    console.log(`Posted to Moltbook: ${data.id || 'success'}`);
    return { status: 'success', postId: data.id, url: `https://www.moltbook.com/post/${data.id}` };
}

/**
 * Get agent profile
 */
async function getAgentProfile() {
    if (!MOLTBOOK_API_KEY) {
        return { error: 'no_api_key' };
    }
    
    const response = await fetch(`${MOLTBOOK_API}/agents/me`, {
        headers: {
            'Authorization': `Bearer ${MOLTBOOK_API_KEY}`
        }
    });
    
    return await response.json();
}

/**
 * Get trending posts
 */
async function getTrendingPosts({ limit = 20 } = {}) {
    const response = await fetch(`${MOLTBOOK_API}/posts?sort=trending&limit=${limit}`, {
        headers: {
            'Authorization': `Bearer ${MOLTBOOK_API_KEY}`
        }
    });
    
    return await response.json();
}

/**
 * Generate social-friendly summary for Moltbook
 */
async function generateSocialSummary(doc) {
    const OPENAI_KEY = process.env.OPENAI_API_KEY;
    
    const prompt = `Write a 2-3 sentence social media post about this documentation. Make it engaging and shareable. Focus on what problem it solves and why AI agents should care.

Documentation: ${doc.title}
URL: ${doc.url}
Summary: ${doc.summary}

Write a viral-ready Moltbook post (under 280 chars):`;

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 
            'Authorization': `Bearer ${OPENAI_KEY}`, 
            'Content-Type': 'application/json' 
        },
        body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 100
        })
    });
    
    const data = await res.json();
    
    if (data.error) {
        console.log('Error generating social summary:', data.error);
        return doc.summary.substring(0, 200);
    }
    
    return data.choices[0].message.content;
}

module.exports = {
    postToMoltbook,
    getAgentProfile,
    getTrendingPosts,
    generateSocialSummary
};
