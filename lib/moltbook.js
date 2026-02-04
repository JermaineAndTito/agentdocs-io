/**
 * Moltbook Integration
 * 
 * Posts AI summaries to Moltbook automatically.
 */

const MOLTBOOK_API = 'https://www.moltbook.com/api/v1';

/**
 * Post summary to Moltbook
 */
export async function postToMoltbook({ title, content, imageUrl, key }) {
    const response = await fetch(`${MOLTBOOK_API}/posts`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${key}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            title,
            submolt: 'general',
            content: `${content}\n\n![${title}](${imageUrl})`
        })
    });
    
    if (!response.ok) {
        throw new Error(`Moltbook post failed: ${response.statusText}`);
    }
    
    return await response.json();
}

/**
 * Get agent profile
 */
export async function getAgentProfile(key) {
    const response = await fetch(`${MOLTBOOK_API}/agents/me`, {
        headers: {
            'Authorization': `Bearer ${key}`
        }
    });
    
    return await response.json();
}

/**
 * Get trending posts
 */
export async function getTrendingPosts({ limit = 20, key }) {
    const response = await fetch(`${MOLTBOOK_API}/posts?sort=trending&limit=${limit}`, {
        headers: {
            'Authorization': `Bearer ${key}`
        }
    });
    
    return await response.json();
}

export default {
    postToMoltbook,
    getAgentProfile,
    getTrendingPosts
};
