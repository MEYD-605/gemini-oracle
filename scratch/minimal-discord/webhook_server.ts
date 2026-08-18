#!/usr/bin/env bun
/**
 * Minimal Webhook-based Discord MCP Gateway for Claude Code.
 * 
 * HTTP Server version (No Discord Gateway WebSocket connection, no 'discord.js' library).
 * - Inbound: Receives messages via HTTP POST Webhook
 * - Outbound: Sends messages back to Discord using standard fetch HTTP REST API
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { ListToolsRequestSchema, CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js'
import { readFileSync, existsSync } from 'fs'
import { homedir } from 'os'
import { join } from 'path'

const PORT = Number(process.env.DISCORD_WEBHOOK_PORT ?? 8788)
const STATE_DIR = join(homedir(), '.claude', 'channels', 'discord')
const ENV_FILE = join(STATE_DIR, '.env')

// Load token from local config
let token = process.env.DISCORD_BOT_TOKEN
if (!token && existsSync(ENV_FILE)) {
  const m = readFileSync(ENV_FILE, 'utf8').match(/^DISCORD_BOT_TOKEN=(.+)$/m)
  if (m) token = m[1].trim()
}

if (!token) {
  process.stderr.write(`Error: DISCORD_BOT_TOKEN is required. Set it in ${ENV_FILE}\n`)
  process.exit(1)
}

// 1. Setup MCP Server (Experimental Claude Channel capability)
const mcp = new Server(
  { name: 'discord-webhook-minimal', version: '0.1.0' },
  {
    capabilities: { tools: {}, experimental: { 'claude/channel': {} } },
    instructions: `You are connected to a webhook-based Discord channel. Use the 'reply' tool to reply back to the active channel_id.`,
  },
)

mcp.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'reply',
      description: 'Send a message back to the active Discord channel via HTTP REST API.',
      inputSchema: {
        type: 'object',
        properties: {
          text: { type: 'string', description: 'Message body to send' },
          channel_id: { type: 'string', description: 'Discord channel ID (snowflake) to send' },
        },
        required: ['text', 'channel_id'],
      },
    },
  ],
}))

mcp.setRequestHandler(CallToolRequestSchema, async req => {
  const args = (req.params.arguments ?? {}) as { text: string; channel_id: string }
  try {
    if (req.params.name === 'reply') {
      // Outbound message via standard Discord HTTP API
      const res = await fetch(`https://discord.com/api/v10/channels/${args.channel_id}/messages`, {
        method: 'POST',
        headers: {
          Authorization: `Bot ${token}`,
          'Content-Type': 'application/json',
          'User-Agent': 'maw-minimal-discord-webhook/1.0',
        },
        body: JSON.stringify({ content: args.text }),
      })

      if (res.status >= 300) {
        const errorText = await res.text()
        throw new Error(`Discord API returned status ${res.status}: ${errorText}`)
      }

      return { content: [{ type: 'text', text: 'sent' }] }
    }
    throw new Error(`Unknown tool: ${req.params.name}`)
  } catch (err: any) {
    return { content: [{ type: 'text', text: `Error: ${err.message}` }], isError: true }
  }
})

// 2. Setup HTTP Webhook Server using Bun.serve
Bun.serve({
  port: PORT,
  hostname: '127.0.0.1',
  async fetch(req) {
    const url = new URL(req.url)

    // Accept webhook incoming messages at POST /webhook or POST /
    if (req.method === 'POST') {
      try {
        const body = await req.json() as {
          content: string
          channel_id: string
          message_id: string
          author: { username: string; id: string; bot?: boolean }
          timestamp?: string
        }

        // Drop messages from bots to prevent loops
        if (body.author?.bot) {
          return new Response('Ignored bot message', { status: 200 })
        }

        // Notify Claude Code about the new inbound message via MCP
        await mcp.notification({
          method: 'notifications/claude/channel',
          params: {
            content: body.content,
            meta: {
              chat_id: body.channel_id,
              message_id: body.message_id,
              user: body.author.username,
              user_id: body.author.id,
              ts: body.timestamp ?? new Date().toISOString(),
            },
          },
        })

        return new Response('Received', { status: 200 })
      } catch (err: any) {
        return new Response(`Error: ${err.message}`, { status: 400 })
      }
    }

    return new Response('Minimal Webhook Server is running.', { status: 200 })
  },
})

// 3. Connect Transport
await mcp.connect(new StdioServerTransport())
process.stderr.write(`Minimal Discord Webhook MCP Server online at http://localhost:${PORT}\n`)
