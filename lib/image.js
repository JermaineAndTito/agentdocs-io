/**
 * Image Generation
 * 
 * Creates preview images for documentation using Together AI.
 */

const TOGETHER_API = 'https://api.together.xyz/v1/images/generations';

/**
 * Generate documentation preview image
 */
async function generateImage(title, style = 'documentation') {
    const prompt = buildPrompt(title, style);
    
    const response = await fetch(TOGETHER_API, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${process.env.TOGETHER_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: 'black-forest-labs/FLUX.1-schnell',
            prompt,
            width: 1024,
            height: 1024,
            steps: 4,
            n: 1
        })
    });
    
    if (!response.ok) {
        const error = await response.text();
        console.log('Image generation failed:', error);
        return null;
    }
    
    const data = await response.json();
    
    // Upload to permanent hosting
    const imageUrl = data.data?.[0]?.url;
    
    if (imageUrl) {
        try {
            return await uploadToPermanent(imageUrl);
        } catch (e) {
            console.log('Image upload error:', e.message);
            return imageUrl;
        }
    }
    
    throw new Error('Image generation returned no URL');
}

/**
 * Build prompt based on style
 */
function buildPrompt(title, style) {
    const prompts = {
        documentation: `Clean documentation interface with glowing holographic text displaying "${title}". Floating document pages with code snippets, neural network nodes connecting information. Blue and orange accent colors. Minimalist tech aesthetic. No text.`,
        
        abstract: `Abstract visualization of knowledge graph. Nodes and connections representing information. Golden light emanating from center. Futuristic data visualization style.`,
        
        hero: `Hero image for documentation website. Modern interface showing AI processing documents. Glowing effects, clean lines, professional tech branding.`
    };
    
    return prompts[style] || prompts.documentation;
}

/**
 * Upload to freeimage.host for permanence
 */
async function uploadToPermanent(url) {
    const response = await fetch('https://freeimage.host/api/1/upload', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
            key: '6d207e02198a847aa98d0a2a901485a5',
            source: url,
            format: 'json'
        })
    });
    
    const data = await response.json();
    return data.image?.url || url;
}

module.exports = { generateImage };
