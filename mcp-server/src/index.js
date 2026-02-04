#!/usr/bin/env node

/**
 * AgentDocs MCP Server
 * 
 * Exposes AgentDocs.io tools to AI agents via Model Context Protocol.
 */

const { createServer } = require('http');
const fs = require('fs');
const path = require('path');

// Configuration
const PORT = process.env.MCP_PORT || 3002;
const API_URL = process.env.AGENTDOCS_API_URL || 'http://localhost:3001';

// MCP Protocol Types
const MessageType = {
  JSONRPC: '2.0',
  INIT: 'initialize',
  NOTIFICATION: 'notification',
  REQUEST: 'request',
  RESPONSE: 'response'
};

/**
 * Call AgentDocs API
 */
async function callAgentDocs(endpoint, method, body) {
  const url = new URL(endpoint, API_URL);
  
  const response = await fetch(url.toString(), {
    method: method || 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
    body: body ? JSON.stringify(body) : undefined
  });
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * MCP Request Handler
 */
async function handleRequest(req, res) {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };

  if (req.method === 'OPTIONS') {
    res.writeHead(204, headers);
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    res.writeHead(405, headers);
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', async () => {
    try {
      const request = JSON.parse(body);
      
      // Handle different request types
      if (request.method === 'initialize') {
        res.writeHead(200, headers);
        res.end(JSON.stringify({
          jsonrpc: '2.0',
          id: request.id,
          result: {
            name: 'agentdocs',
            version: '1.0.0',
            tools: [
              {
                name: 'agentdocs_search',
                description: 'Semantic search across indexed documentation',
                inputSchema: {
                  type: 'object',
                  properties: {
                    query: { type: 'string', description: 'Search query' },
                    topK: { type: 'number', description: 'Number of results (default: 5)' }
                  },
                  required: ['query']
                }
              },
              {
                name: 'agentdocs_ask',
                description: 'Ask a question about documentation and get synthesized answer',
                inputSchema: {
                  type: 'object',
                  properties: {
                    question: { type: 'string', description: 'Question to ask' },
                    docIds: { 
                      type: 'array', 
                      items: { type: 'string' },
                      description: 'Optional document IDs to search' 
                    }
                  },
                  required: ['question']
                }
              },
              {
                name: 'agentdocs_index',
                description: 'Index a new documentation URL',
                inputSchema: {
                  type: 'object',
                  properties: {
                    url: { type: 'string', description: 'Documentation URL to index' }
                  },
                  required: ['url']
                }
              }
            ]
          }
        }));
        return;
      }

      // Handle tool calls
      if (request.method === 'tools/call') {
        const { name, arguments: args } = request.params;
        
        try {
          let result;
          
          switch (name) {
            case 'agentdocs_search':
              result = await callAgentDocs('/api/search', 'POST', {
                query: args.query,
                topK: args.topK || 5
              });
              break;
              
            case 'agentdocs_ask':
              result = await callAgentDocs('/api/ask', 'POST', {
                question: args.question,
                docIds: args.docIds
              });
              break;
              
            case 'agentdocs_index':
              result = await callAgentDocs('/api/import', 'POST', {
                url: args.url
              });
              break;
              
            default:
              throw new Error(`Unknown tool: ${name}`);
          }
          
          res.writeHead(200, headers);
          res.end(JSON.stringify({
            jsonrpc: '2.0',
            id: request.id,
            result: {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(result, null, 2)
                }
              ]
            }
          }));
        } catch (error) {
          res.writeHead(200, headers);
          res.end(JSON.stringify({
            jsonrpc: '2.0',
            id: request.id,
            result: {
              content: [
                {
                  type: 'text',
                  text: `Error: ${error.message}`
                }
              ]
            }
          }));
        }
        return;
      }

      // Handle ping
      if (request.method === 'ping') {
        res.writeHead(200, headers);
        res.end(JSON.stringify({ jsonrpc: '2.0', id: request.id, result: 'pong' }));
        return;
      }

      // Unknown request
      res.writeHead(200, headers);
      res.end(JSON.stringify({
        jsonrpc: '2.0',
        id: request.id,
        error: { code: -32601, message: 'Method not found' }
      }));

    } catch (error) {
      res.writeHead(200, headers);
      res.end(JSON.stringify({
        jsonrpc: '2.0',
        error: { code: -32603, message: error.message }
      }));
    }
  });
}

// Start server
const server = createServer(handleRequest);

server.listen(PORT, () => {
  console.log(`🤖 AgentDocs MCP Server running on port ${PORT}`);
  console.log(`   API URL: ${API_URL}`);
  console.log(`   Tools: agentdocs_search, agentdocs_ask, agentdocs_index`);
});

server.on('error', (error) => {
  console.error('Server error:', error);
  process.exit(1);
});
