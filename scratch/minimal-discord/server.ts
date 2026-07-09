#!/usr/bin/env bun
/**
 * Minimal Discord Channel Gateway for Claude Code.
 * 
 * Inspired by 'fakechat' official implementation.
 * Pure Stdio MCP server connecting directly to Discord without complex pairing/groups logic.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { ListToolsRequestSchema, CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js'
import { Client, GatewayIntentBits, Partials, type Message } from 'discord.js'
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { homedir } from 'os'
import { join } from 'path'

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

// 1. Setup Discord Client (Minimal Intents)
const client = new Client({
  intents: [
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Channel],
})

// 2. Setup MCP Server (Experimental Claude Channel capability)
const mcp = new Server(
  { name: 'discord-minimal', version: '0.1.0' },
  {
    capabilities: { tools: {}, experimental: { 'claude/channel': {} } },
    instructions: `You are connected to a minimal Discord channel. Use the 'reply' tool to reply back to the current active chat_id/channel.`,
  },
)

mcp.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'reply',
      description: 'Send a message back to the active Discord channel/user.',
      inputSchema: {
        type: 'object',
        properties: {
          text: { type: 'string', description: 'Message body to send' },
          channel_id: { type: 'string', description: 'Discord channel ID (snowflake) to direct reply' },
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
      const channel = await client.channels.fetch(args.channel_id)
      if (channel && 'send' in channel) {
        await (channel as any).send(args.text)
        return { content: [{ type: 'text', text: 'sent' }] }
      }
      throw new Error(`Channel ${args.channel_id} is not writable.`)
    }
    throw new Error(`Unknown tool: ${req.params.name}`)
  } catch (err: any) {
    return { content: [{ type: 'text', text: `Error: ${err.message}` }], isError: true }
  }
})

// 3. Listen to incoming Discord messages and notify MCP
client.on('messageCreate', async (msg: Message) => {
  // Ignore bot messages to prevent loops
  if (msg.author.bot) return

  // Push incoming message as MCP notification to Claude Code
  await mcp.notification({
    method: 'notifications/claude/channel',
    params: {
      content: msg.content,
      meta: {
        chat_id: msg.channelId,
        message_id: msg.id,
        user: msg.author.username,
        ts: msg.createdAt.toISOString(),
      },
    },
  })
})

// 4. Connect Transport & Start Discord Bot
await mcp.connect(new StdioServerTransport())
await client.login(token)
process.stderr.write('Minimal Discord Channel MCP Server online\n')
