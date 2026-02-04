# AgentDocs MCP Server

This MCP (Model Context Protocol) server exposes AgentDocs.io tools to AI agents like OpenClaw/Claude.

## Installation

```bash
cd mcp-server
npm install
```

## Configuration

Set environment variables:

```bash
export AGENTDOCS_API_URL=https://agentdocs-io-v2.vercel.app
# Or run locally
export AGENTDOCS_API_URL=http://localhost:3001
```

## Running

```bash
npm start
```

## MCP Tools Exposed

### agentdocs_search

Semantic search across all indexed documentation.

**Input:**
```json
{
  "query": "How does authentication work?",
  "topK": 5
}
```

**Output:**
```json
{
  "matches": [
    {
      "score": 0.89,
      "metadata": {
        "url": "https://docs.example.com/auth",
        "text": "To authenticate, send your API key..."
      }
    }
  ]
}
```

### agentdocs_ask

Ask a question and get a synthesized answer with sources.

**Input:**
```json
{
  "question": "How do I implement rate limiting?",
  "docIds": ["doc123", "doc456"]
}
```

**Output:**
```json
{
  "answer": "Rate limiting can be implemented by...",
  "sources": [
    "https://docs.example.com/rate-limits",
    "https://docs.anthropic.com/api/rate-limits"
  ]
}
```

### agentdocs_index

Index a new documentation URL.

**Input:**
```json
{
  "url": "https://docs.example.com/new-api"
}
```

**Output:**
```json
{
  "success": true,
  "docId": "abc123",
  "title": "New API Documentation"
}
```

## OpenClaw Integration

Add to your OpenClaw configuration:

```json
{
  "mcpServers": {
    "agentdocs": {
      "command": "node",
      "args": ["/path/to/mcp-server/dist/index.js"],
      "env": {
        "AGENTDOCS_API_URL": "https://agentdocs-io-v2.vercel.app"
      }
    }
  }
}
```

## Testing

```bash
npm test
```

## License

MIT
