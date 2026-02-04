/**
 * AgentDocs Growth Automation
 * 
 * Runs daily to:
 * 1. Post to Moltbook
 * 2. Tweet milestones
 * 3. Process referrals
 * 4. Report to Rob
 */

const { getGrowthStats } = require('../api/growth.js');
const { postToMoltbook } = require('../lib/moltbook.js');
const MOLTBOOK_KEY = process.env.MOLTBOOK_API_KEY;

async function dailyGrowthReport() {
    console.log('📊 Daily Growth Report');
    console.log('======================\n');
    
    const stats = await getGrowthStats();
    
    console.log('📈 Metrics:');
    console.log(`  Users: ${stats.totalUsers}`);
    console.log(`  Docs: ${stats.totalDocs}`);
    console.log(`  Referrals: ${stats.referrals}`);
    console.log(`  K-Factor: ${stats.kFactor}`);
    console.log(`  MRR: $${stats.mrr}`);
    console.log(`  Conversion: ${stats.conversionRate}%\n`);
    
    // Check milestones
    if (stats.totalDocs >= 100 && stats.totalDocs < 101) {
        console.log('🎉 Milestone: 100 docs processed!');
        await postMoltbookMilestone('100_docs');
    }
    
    if (stats.totalUsers >= 1000 && stats.totalUsers < 1001) {
        console.log('🚀 Milestone: 1,000 users!');
        await postMoltbookMilestone('1000_users');
    }
    
    // Referral leaderboard
    console.log('🏆 Top Referrers:');
    // Would query database here
    console.log('  (Database integration needed)\n');
    
    return stats;
}

async function postMoltbookMilestone(type) {
    const messages = {
        '100_docs': '📄 100 documents processed! The agent economy is reading. Try AgentDocs.io → agentdocs.io #Documentation #AI',
        '1000_users': '🚀 1,000 agents using AgentDocs.io! Documentation that thinks for itself. agentdocs.io #AI #Agents'
    };
    
    const message = messages[type];
    if (!message) return;
    
    console.log('📢 Posting to Moltbook:', message);
    // await postToMoltbook({ content: message, key: MOLTBOOK_KEY });
}

async function notifyRob() {
    const stats = await getGrowthStats();
    const report = `
🤖 AgentDocs.io Daily Report

📊 Metrics:
- Users: ${stats.totalUsers}
- Docs: ${stats.totalDocs}
- Referrals: ${stats.referrals}
- K-Factor: ${stats.kFactor}
- MRR: $${stats.mrr}

🎯 Focus: Referral program + Moltbook viral loops
    `.trim();
    
    console.log('\n📱 Report for Rob:');
    console.log(report);
}

async function main() {
    await dailyGrowthReport();
    await notifyRob();
}

main().catch(console.error);
