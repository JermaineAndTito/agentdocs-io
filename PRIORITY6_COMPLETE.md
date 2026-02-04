# Priority 6 Complete: Usage Tracking & Limits

## What Was Built

### lib/usage.js - Usage Tracking System

**Features:**
- ✅ Track docs indexed per user
- ✅ Track queries per user
- ✅ Enforce free tier limits
- ✅ API key authentication

**Free Tier Limits:**
| Metric | Limit |
|--------|-------|
| Docs/month | 5 |
| Queries/month | 100 |

**Pro Tier ($29/mo):**
| Metric | Limit |
|--------|-------|
| Docs/month | 50 |
| Queries/month | 5,000 |

**Enterprise Tier:**
- Unlimited everything

## API Changes

### New Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/usage` | GET | Get current user's usage stats |
| `/api/stats` | GET | Get user + platform stats |

### Updated Endpoints

All `/api/*` endpoints now require rate limiting.

### Rate Limit Headers

Every API response includes:

```
X-RateLimit-Tier: free
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 3
```

### Rate Limit Response (429)

```json
{
  "error": "Rate limit exceeded",
  "tier": "free",
  "current": 5,
  "limit": 5,
  "upgrade": "Pro ($29/mo)",
  "message": "You've reached your free tier limit. Upgrade to continue using AgentDocs."
}
```

## Usage

```bash
# Check your usage
curl -H "X-API-Key: ag_xxxx" https://agentdocs-io-v2.vercel.app/api/usage

# Response:
{
  "tier": "free",
  "docsIndexed": 2,
  "queries": 15,
  "docsLimit": 5,
  "queriesLimit": 100,
  "upgrade": "Pro ($29/mo)"
}
```

## CLI Tools

```bash
# Check all-time stats
node lib/usage.js stats

# Generate API key
node lib/usage.js key

# Check usage for key
node lib/usage.js check ag_xxxx

# Reset monthly usage
node lib/usage.js reset ag_xxxx
```

## Files Created/Modified

| File | Change |
|------|--------|
| `lib/usage.js` | Created - Usage tracking system |
| `server.js` | Added rate limiting middleware |
| `server.js` | Added `/api/usage` endpoint |

## Next Steps

1. Deploy changes to Vercel
2. Test rate limiting
3. Add API key generation UI
4. Consider database upgrade for production

## Success Metrics

- [x] Track docs indexed per user
- [x] Track queries per user
- [x] Enforce free tier limits
- [x] Add API key authentication
- [ ] 25+ docs indexed (in progress)
