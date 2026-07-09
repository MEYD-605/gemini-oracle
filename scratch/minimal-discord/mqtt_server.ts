#!/usr/bin/env bun
/**
 * Minimal MQTT-based Channel Gateway for Claude Code.
 * 
 * Connected directly to local Mosquitto MQTT Broker.
 * - Inbound: Subscribes to 'claude/inbound' topic to receive messages
 * - Outbound: Publishes replies to 'claude/outbound' topic
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { ListToolsRequestSchema, CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js'
import mqtt from 'mqtt'

const MQTT_BROKER = process.env.MQTT_BROKER ?? 'mqtt://127.0.0.1:1883'
const INBOUND_TOPIC = 'claude/inbound'
const OUTBOUND_TOPIC = 'claude/outbound'

// 1. Setup MCP Server (Experimental Claude Channel capability)
const mcp = new Server(
  { name: 'mqtt-minimal-gateway', version: '0.1.0' },
  {
    capabilities: { tools: {}, experimental: { 'claude/channel': {} } },
    instructions: `You are connected to an MQTT-based channel gateway. Use the 'reply' tool to publish messages back to the active channel/client via MQTT topic '${OUTBOUND_TOPIC}'.`,
  },
)

mcp.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'reply',
      description: 'Publish a message back to the active MQTT topic channel.',
      inputSchema: {
        type: 'object',
        properties: {
          text: { type: 'string', description: 'Message body to send' },
          channel_id: { type: 'string', description: 'Target channel_id / client_id' },
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
      const payload = JSON.stringify({
        text: args.text,
        channel_id: args.channel_id,
        ts: Date.now(),
      })

      // Publish response back to the outbound topic
      client.publish(OUTBOUND_TOPIC, payload, { qos: 1 })
      return { content: [{ type: 'text', text: 'sent' }] }
    }
    throw new Error(`Unknown tool: ${req.params.name}`)
  } catch (err: any) {
    return { content: [{ type: 'text', text: `Error: ${err.message}` }], isError: true }
  }
})

// 2. Setup MQTT Client and connect to local Mosquitto
const client = mqtt.connect(MQTT_BROKER)

client.on('connect', () => {
  process.stderr.write(`MQTT: Connected to broker at ${MQTT_BROKER}\n`)
  client.subscribe(INBOUND_TOPIC, (err) => {
    if (err) {
      process.stderr.write(`MQTT: Subscription error on '${INBOUND_TOPIC}': ${err.message}\n`)
    } else {
      process.stderr.write(`MQTT: Subscribed to '${INBOUND_TOPIC}' topic\n`)
    }
  })
})

client.on('message', async (topic, message) => {
  if (topic === INBOUND_TOPIC) {
    try {
      const raw = message.toString()
      let content = raw
      let chatId = 'mqtt_general'
      let messageId = `msg-${Date.now()}`
      let user = 'mqtt_user'

      // Attempt to parse JSON payload if provided
      try {
        const parsed = JSON.parse(raw)
        if (parsed.content) content = parsed.content
        if (parsed.chat_id) chatId = parsed.chat_id
        if (parsed.message_id) messageId = parsed.message_id
        if (parsed.user) user = parsed.user
      } catch {
        // Fallback to raw text if not valid JSON
      }

      // Notify Claude Code about the new inbound MQTT message via MCP
      await mcp.notification({
        method: 'notifications/claude/channel',
        params: {
          content,
          meta: {
            chat_id: chatId,
            message_id: messageId,
            user,
            ts: new Date().toISOString(),
          },
        },
      })
    } catch (err: any) {
      process.stderr.write(`MQTT: Inbound processing error: ${err.message}\n`)
    }
  }
})

client.on('error', (err) => {
  process.stderr.write(`MQTT: Connection error: ${err.message}\n`)
})

// 3. Connect Transport
await mcp.connect(new StdioServerTransport())
process.stderr.write(`Minimal MQTT MCP Gateway online\n`)
