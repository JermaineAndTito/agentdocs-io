/**
 * Web Fetch Utility
 * 
 * Fetches web content for documentation processing.
 */

/**
 * Fetch URL content
 */
export async function webFetch(url, options = {}) {
    const { timeout = 30000, headers = {} } = options;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'AgentDocs.io Bot/1.0',
                ...headers
            },
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const contentType = response.headers.get('content-type') || '';
        
        if (contentType.includes('application/json')) {
            return { text: await response.text(), json: await response.json() };
        }
        
        return {
            text: await response.text(),
            html: await response.text(),
            json: null
        };
    } catch (error) {
        clearTimeout(timeoutId);
        
        if (error.name === 'AbortError') {
            throw new Error(`Request timed out (>${timeout}ms)`);
        }
        
        throw error;
    }
}

/**
 * Extract text from HTML
 */
export function extractText(html) {
    return html
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
        .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '')
        .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

export default {
    webFetch,
    extractText
};
