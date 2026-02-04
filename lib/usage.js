/**
* AgentDocs.io - Usage Tracking & Rate Limiting
* In-memory only (no file writes for Vercel compatibility)
*/

let usageData = {
  users: {},
  totalDocs: 0,
  totalQueries: 0
};

const RATE_LIMITS = {
  free: { docsPerMonth: 5, queriesPerMonth: 100 },
  pro: { docsPerMonth: 50, queriesPerMonth: 5000 }
};

function rateLimitMiddleware(req, res, next) {
  const apiKey = req.headers['x-api-key'] || 'anonymous';
  if (typeof usageData.users[apiKey] === 'undefined') {
    usageData.users[apiKey] = { docsIndexed: 0, queries: 0, tier: 'free' };
  }
  req.usage = usageData.users[apiKey];
  req.apiKey = apiKey;
  next();
}

function trackDocIndexed(apiKey) {
  if (typeof usageData.users[apiKey] === 'undefined') {
    usageData.users[apiKey] = { docsIndexed: 0, queries: 0, tier: 'free' };
  }
  usageData.users[apiKey].docsIndexed++;
  usageData.totalDocs++;
}

function trackQuery(apiKey) {
  if (typeof usageData.users[apiKey] === 'undefined') {
    usageData.users[apiKey] = { docsIndexed: 0, queries: 0, tier: 'free' };
  }
  usageData.users[apiKey].queries++;
  usageData.totalQueries++;
}

function getStats(apiKey) {
  return usageData.users[apiKey] || { docsIndexed: 0, queries: 0, tier: 'free' };
}

function getAllStats() {
  return { totalDocs: usageData.totalDocs, totalQueries: usageData.totalQueries };
}

module.exports = { rateLimitMiddleware, trackDocIndexed, trackQuery, getStats, getAllStats, RATE_LIMITS };
