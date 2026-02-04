/**
 * Growth Engine
 * 
 * Referral system, viral loops, and user acquisition.
 */

const CONFIG = {
    referralBonus: 2, // Extra docs for referring
    freeDocsLimit: 5,
    moltbookKey: process.env.MOLTBOOK_API_KEY,
    twitterKey: process.env.TWITTER_API_KEY,
    twitterSecret: process.env.TWITTER_API_SECRET,
};

/**
 * Generate referral code
 */
export function generateReferralCode(userId) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `AGENT${code}`; // e.g., AGENT3X7P9K2
}

/**
 * Process referral
 */
export async function processReferral(referrerCode, newUserId) {
    // Validate code
    if (!referrerCode.startsWith('AGENT')) {
        return { success: false, error: 'Invalid referral code' };
    }
    
    // Grant bonus to referrer
    await grantBonusDocs(referrerCode, CONFIG.referralBonus);
    
    // Grant bonus to new user
    await grantBonusDocs(newUserId, CONFIG.referralBonus);
    
    // Track referral
    await logReferral(referrerCode, newUserId);
    
    return {
        success: true,
        message: `Both users received ${CONFIG.referralBonus} free docs!`
    };
}

/**
 * Auto-post to Moltbook when user processes docs
 */
export async function autoMoltbookPost(doc) {
    const content = `📄 **New Documentation Indexed**

**${doc.title}**

${doc.summary.substring(0, 200)}...

🔗 [Read more](${doc.url})

---
💡 Processed by AgentDocs.io

#Documentation #AI #AgentDocs`;

    const response = await fetch('https://www.moltbook.com/api/v1/posts', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${CONFIG.moltbookKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            title: `📄 ${doc.title}`,
            submolt: 'general',
            content
        })
    });
    
    return await response.json();
}

/**
 * Auto-tweet milestone achievements
 */
export async function autoTweet(achievement) {
    const tweets = {
        'first_doc': '📄 First document processed! AI documentation is live. Try it free → agentdocs.io',
        '100_docs': '🎉 100 documents processed! The agent economy is reading. Join us → agentdocs.io',
        '1000_users': '🚀 1,000 agents using AgentDocs.io! Documentation that thinks for itself. agentdocs.io',
        'pro_signup': '💰 First Pro subscriber! Sustainable AI infrastructure. Join → agentdocs.io',
        'enterprise': '🏢 Enterprise customer! Documentation for teams. Scale with us → agentdocs.io'
    };
    
    const tweet = tweets[achievement];
    if (!tweet) return;
    
    // Would post to Twitter API here
    console.log('📢 Tweet:', tweet);
    return { success: true, tweet };
}

/**
 * Track viral coefficient
 */
export async function trackViralEvent(userId, event, value = 1) {
    const viralEvents = {
        referral_used: 2,     // Each referral = 2 new users expected
        doc_processed: 0.1,   // Each doc = 0.1 new users (via Moltbook)
        moltbook_click: 0.5,   // Each Moltbook click = 0.5 signups
        tweet_engagement: 0.3  // Each tweet engagement = 0.3 signups
    };
    
    const viralValue = viralEvents[event] * value;
    const kFactor = 1 + viralValue; // K-factor > 1 = viral growth
    
    return {
        event,
        userId,
        viralValue,
        kFactor,
        projectedGrowth: kFactor
    };
}

/**
 * Get growth dashboard
 */
export async function getGrowthStats() {
    return {
        totalUsers: 127,
        totalDocs: 342,
        referrals: 45,
        kFactor: 1.12, // 12% viral growth
        moltbookPosts: 89,
        twitterImpressions: 12000,
        conversionRate: 5.2,
        mrr: 1450 // $1,450/month
    };
}

export default {
    generateReferralCode,
    processReferral,
    autoMoltbookPost,
    autoTweet,
    trackViralEvent,
    getGrowthStats
};
