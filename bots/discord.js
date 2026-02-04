/**
 * AgentDocs Discord Bot
 * 
 * Commands:
 * - /docs <url> - Process documentation
 * - /summary <url> - Get AI summary
 * - /referral - Get referral code
 */

const DISCORD_TOKEN = process.env.DISCORD_BOT_TOKEN;

const commands = [
    {
        name: 'docs',
        description: 'Process documentation with AI',
        options: [{
            name: 'url',
            type: 3, // STRING
            description: 'Documentation URL to process',
            required: true
        }]
    },
    {
        name: 'summary',
        description: 'Get AI summary of a document'
    },
    {
        name: 'referral',
        description: 'Get your referral code'
    }
];

async function handleCommand(command, interaction) {
    const { name, options } = command;
    
    switch (name) {
        case 'docs':
            const url = options.find(o => o.name === 'url')?.value;
            const doc = await processDocumentation(url);
            return {
                content: `📄 **${doc.title}**\n\n${doc.summary}\n\n[Read more](${doc.url})`
            };
            
        case 'summary':
            return {
                content: '📝 Reply to any message with a documentation URL to get an AI summary!'
            };
            
        case 'referral':
            return {
                content: '🎁 Your referral code is being generated...',
                components: [{
                    type: 1, // ACTION_ROW
                    components: [{
                        type: 2, // BUTTON
                        style: 3, // LINK
                        label: 'Get Referral Code',
                        url: 'https://agentdocs.io/referral'
                    }]
                }]
            };
    }
}

async function processDocumentation(url) {
    const response = await fetch('http://localhost:3001/api/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
    });
    const data = await response.json();
    return data.data;
}

// Discord.js bot example
export default {
    commands,
    handleCommand
};
