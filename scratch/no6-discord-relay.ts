#!/usr/bin/env bun
/**
 * No.6 Gemini Custom Discord WebSocket Relay Server.
 * 
 * Written in Bun + TypeScript.
 * Connects directly to Discord Gateway WebSocket and relays incoming authorized messages
 * into Gemini Agent via the 'maw hey' CLI command.
 */

import { existsSync, readFileSync } from "fs";
import { spawnSync } from "child_process";
import { join } from "path";
import { homedir } from "os";

const GATEWAY_URL = "wss://gateway.discord.gg/?v=10&encoding=json";

// Authorized users to relay messages from
const ALLOWED_USERS: Record<string, string> = {
  "910909378876571658": "Bo",
  "691531480689541170": "P'Nat",
  "811599337665986561": "พี่โม",
};

class No6DiscordRelay {
  private token: string = "";
  private ws: WebSocket | null = null;
  private heartbeatInterval: Timer | null = null;
  private seq: number | null = null;
  private sessionId: string | null = null;

  constructor() {
    this.loadToken();
  }

  private loadToken() {
    // Attempt to load from env first
    let token = process.env.DISCORD_BOT_TOKEN;

    // Fallback to local .env in discord-no6 channel config
    const envFile = join(homedir(), ".claude", "channels", "discord-no6", ".env");
    if (!token && existsSync(envFile)) {
      const match = readFileSync(envFile, "utf-8").match(/^DISCORD_BOT_TOKEN=(.+)$/m);
      if (match) token = match[1].trim();
    }

    if (!token) {
      console.error(`Error: DISCORD_BOT_TOKEN is required. Set it in process env or ${envFile}`);
      process.exit(1);
    }
    this.token = token;
  }

  public start() {
    console.log("Starting No.6 Discord WebSocket Relay...");
    this.connect();
  }

  private connect() {
    console.log(`Connecting to Discord Gateway: ${GATEWAY_URL}`);
    this.ws = new WebSocket(GATEWAY_URL);

    this.ws.onopen = () => {
      console.log("WebSocket connection established.");
    };

    this.ws.onmessage = async (event) => {
      try {
        const payload = JSON.parse(event.data.toString());
        await this.handlePayload(payload);
      } catch (err: any) {
        console.error("Payload parsing error:", err.message);
      }
    };

    this.ws.onclose = (event) => {
      console.log(`WebSocket closed: Code ${event.code}, Reason: ${event.reason || "None"}. Reconnecting in 5s...`);
      this.cleanup();
      setTimeout(() => this.connect(), 5000);
    };

    this.ws.onerror = (err) => {
      console.error("WebSocket error observed:", err);
    };
  }

  private cleanup() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private async handlePayload(payload: any) {
    const { op, t, d, s } = payload;
    if (s !== undefined && s !== null) {
      this.seq = s;
    }

    switch (op) {
      case 10: // Hello Payload
        console.log(`Hello received. Heartbeat interval: ${d.heartbeat_interval}ms`);
        this.startHeartbeat(d.heartbeat_interval);
        this.identify();
        break;

      case 11: // Heartbeat ACK
        // Heartbeat acknowledged by server, do nothing
        break;

      case 0: // Dispatch Event
        if (t === "READY") {
          this.sessionId = d.session_id;
          console.log(`Session Ready! Authenticated as Bot: ${d.user.username}#${d.user.discriminator}`);
        } else if (t === "MESSAGE_CREATE") {
          await this.handleMessage(d);
        }
        break;

      default:
        // Other opcodes ignored for minimal setup
        break;
    }
  }

  private startHeartbeat(intervalMs: number) {
    this.cleanup();
    this.heartbeatInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ op: 1, d: this.seq }));
      }
    }, intervalMs);
  }

  private identify() {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    console.log("Sending Identify Payload...");
    const payload = {
      op: 2,
      d: {
        token: this.token,
        intents: 37377, // GUILDS | GUILD_MESSAGES | DIRECT_MESSAGES | MESSAGE_CONTENT
        properties: {
          os: process.platform,
          browser: "no6-custom-relay",
          device: "no6-custom-relay",
        },
      },
    };
    this.ws.send(JSON.stringify(payload));
  }

  private async handleMessage(msg: any) {
    // Prevent self-loop
    if (msg.author.bot) return;

    const authorId = msg.author.id;
    const authorName = msg.author.username;
    const content = msg.content;
    const channelId = msg.channel_id;

    // Filter: Check if author is in the allowed users list
    const friendlyName = ALLOWED_USERS[authorId];
    if (!friendlyName) {
      // Ignored non-authorized messages
      return;
    }

    console.log(`[Inbound Message] #${channelId} from ${friendlyName} (${authorName}): ${content.substring(0, 50)}`);

    // Prepare formatted text for 'maw hey' command
    const formattedText = `[Discord #channel จาก ${friendlyName}] ${content}`;
    
    // Relay to 06-gemini agent using 'maw hey' CLI command
    const targetAgent = "06-gemini";
    console.log(`Relaying to '${targetAgent}' via 'maw hey'...`);

    const mawBin = process.platform === "darwin" ? "maw" : "/usr/local/bin/maw-rs";
    const result = spawnSync(mawBin, ["hey", targetAgent, formattedText], { timeout: 25000 });

    if (result.status === 0) {
      console.log("✓ Successfully relayed message to Gemini.");
    } else {
      console.error(`✗ Failed to relay message. exit code: ${result.status}, stderr: ${result.stderr?.toString()}`);
    }
  }
}

// Start the relay
const relay = new No6DiscordRelay();
relay.start();
