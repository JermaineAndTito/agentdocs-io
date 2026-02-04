#!/usr/bin/env node

/**
 * AgentDocs.io - Usage Tracking & Rate Limiting
 * 
 * Tracks:
 * - Docs indexed per user
 * - Queries per user
 * - Enforces free tier limits
 * 
 * Free Tier:
 * - 5 docs/month
 * - 100 queries/month
 * 
 * Simple API key auth for Pro users.
 */

const fs = require('fs');
const path = require('path');

// In-memory storage (upgrade to database for production)
const STORAGE_FILE = path.join(__dirname, 'usage.json');

let usageData = {
  users: {},  // { apiKey: { docsIndexed, queries, lastSeen } }
  totalDocs: 0,
  totalQueries: 0
};

// Load from disk if exists
if (fs.existsSync(STORAGE_FILE)) {
  try {
    usageData = JSON.parse(fs.readFileSync(STORAGE_FILE, 'utf8'));
  } catch (e) {
    console.log('Warning: Could not load usage data');
  }
}

// Save to disk
function saveUsage() {
  fs.writeFileSync(STORAGE_FILE, JSON.stringify(usageData, null, 2));
}

// Generate simple API key
function generateApiKey() {
  return 'ag_' + require('crypto').randomBytes(24).toString('hex');
}

// Rate limiting middleware
const RATE_LIMITS = {
  free: {
    docsPerMonth: 5,
    queriesPerMonth: 100
  },
  pro: {
    docsPerMonth: 50,
    queriesPerMonth: 5000
  },
  enterprise: {
    docsPerMonth: -1,  // Unlimited
    queriesPerMonth: -1  // Unlimited
  }
};

// Reset monthly usage for a user
function resetMonthlyUsage(apiKey) {
  if (usageData.users[apiKey]) {
    usageData.users[apiKey].docsIndexed = 0;
    usageData.users[apiKey].queries = 0;
    usageData.users[apiKey].month = new Date().getMonth();
    saveUsage();
  }
}

// Check and update usage
function checkLimit(apiKey, type) {
  // Get user tier from API key prefix
  let tier = 'free';
  if (apiKey && apiKey.startsWith('pr_')) tier = 'pro';
  if (apiKey && apiKey.startsWith('en_')) tier = 'enterprise';
  
  const limits = RATE_LIMITS[tier];
  const now = new Date();
  const currentMonth = now.getMonth();
  
  // Initialize user if doesn't exist
  if (!usageData.users[apiKey]) {
    usageData.users[apiKey] = {
      tier,
      docsIndexed: 0,
      queries: 0,
      month: currentMonth,
      createdAt: now.toISOString()
    };
  }
  
  const user = usageData.users[apiKey];
  
  // Reset monthly if new month
  if (user.month !== currentMonth) {
    user.docsIndexed = 0;
    user.queries = 0;
    user.month = currentMonth;
  }
  
  // Check limit
  const limit = type === 'doc' ? limits.docsPerMonth : limits.queriesPerMonth;
  const current = type === 'doc' ? user.docsIndexed : user.queries;
  
  if (limit !== -1 && current >= limit) {
    return {
      allowed: false,
      reason: `${tier} tier limit exceeded`,
      current,
      limit,
      tier,
      upgrade: tier === 'free' ? 'Pro ($29/mo)' : 'Enterprise'
    };
  }
  
  // Increment usage
  if (type === 'doc') {
    user.docsIndexed++;
    usageData.totalDocs++;
  } else {
    user.queries++;
    usageData.totalQueries++;
  }
  
  user.lastSeen = now.toISOString();
  saveUsage();
  
  return {
    allowed: true,
    tier,
    current,
    limit: limit === -1 ? 'unlimited' : limit,
    remaining: limit === -1 ? 'unlimited' : limit - current
  };
}

// Express middleware for rate limiting
function rateLimitMiddleware(req, res, next) {
  const apiKey = req.headers['x-api-key'] || req.body?.apiKey || 'anonymous';
  const endpoint = req.path;
  
  // Skip for health checks
  if (endpoint === '/health' || endpoint === '/api/stats') {
    return next();
  }
  
  let type = 'query';
  if (endpoint === '/api/import' || endpoint === '/api/index') {
    type = 'doc';
  }
  
  const result = checkLimit(apiKey, type);
  
  // Add rate limit headers
  res.set('X-RateLimit-Tier', result.tier);
  res.set('X-RateLimit-Limit', String(result.limit));
  res.set('X-RateLimit-Remaining', String(result.remaining || 0));
  
  if (!result.allowed) {
    return res.status(429).json({
      error: 'Rate limit exceeded',
      tier: result.tier,
      current: result.current,
      limit: result.limit,
      upgrade: result.upgrade,
      message: `You've reached your ${result.tier} tier limit. Upgrade to continue using AgentDocs.`
    });
  }
  
  next();
}

// Get usage stats
function getStats(apiKey) {
  if (!usageData.users[apiKey]) {
    return { tier: 'free', docsIndexed: 0, queries: 0 };
  }
  return usageData.users[apiKey];
}

// Get all-time stats
function getAllStats() {
  return {
    totalUsers: Object.keys(usageData.users).length,
    totalDocs: usageData.totalDocs,
    totalQueries: usageData.totalQueries,
    users: Object.keys(usageData.users).length
  };
}

module.exports = {
  checkLimit,
  getStats,
  getAllStats,
  rateLimitMiddleware,
  generateApiKey,
  RATE_LIMITS
};

// CLI for testing
if (require.main === module) {
  const cmd = process.argv[2];
  
  if (cmd === 'stats') {
    console.log('All-time stats:', JSON.stringify(getAllStats(), null, 2));
  } else if (cmd === 'reset') {
    const key = process.argv[3];
    if (key) {
      resetMonthlyUsage(key);
      console.log('Reset usage for', key);
    }
  } else if (cmd === 'key') {
    console.log('New API key:', generateApiKey());
  } else if (cmd === 'check') {
    const key = process.argv[3] || 'anonymous';
    console.log('Usage for', key, ':', JSON.stringify(getStats(key), null, 2));
  } else {
    console.log('Usage:');
    console.log('  node usage.js stats       - Show all-time stats');
    console.log('  node usage.js key         - Generate new API key');
    console.log('  node usage.js check [key] - Check usage for key');
    console.log('  node usage.js reset [key] - Reset monthly usage');
  }
}
