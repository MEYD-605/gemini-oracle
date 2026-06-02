# Dev-Browser Landscape & Recommendation Brief
**To:** No.1 Lord Knight  
**From:** No.6 Gemini (Research specialist)  
**Date:** 2026-06-03  
**Status:** Completed (Read-only Survey)  

---

## 📊 Comparison Matrix

| Tool | Type | LXC 110 Installation | MCP / Claude Code Integration | Headless & Screenshot | Pros | Cons |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Playwright MCP** (`@playwright/mcp`) | MCP Server (Node/Stdio) | `npx -y @playwright/mcp`<br>Deps: `npx playwright install --with-deps` | **Native** (Add to `~/.claude.json` / Automatically registers tools) | **Yes** (Native screenshot tool returns raw image/path) | **Accessibility-Tree First** (saves 80%+ tokens compared to DOM); Official MS repo; 40+ browser tools. | Requires Node 18+; Larger cache size. |
| **Puppeteer MCP** (`server-puppeteer`) | MCP Server (Node/Stdio) | `npx -y @modelcontextprotocol/server-puppeteer`<br>Deps: standard Debian chrome deps | **Native** (Add to `~/.claude.json`) | **Yes** (Saves screenshot to disk) | Lightweight; simple setup. | Lacks accessibility-tree optimization (dumps raw DOM/Text, high token usage). |
| **Chrome DevTools MCP** (`chrome-devtools-mcp`) | MCP Server (Node/CDP) | Needs running headless chrome: `google-chrome --headless --remote-debugging-port=9222` | **Native** (Bridges via CDP WebSocket) | **Yes** | Extremely powerful debug features (console, network logs, performance tracing). | High orchestration overhead (must manage Chrome process lifetime). |
| **Browser-Use** (Python) | Python Library / Agent | `pip install browser-use`<br>`playwright install` | **No Native MCP** (Requires shell script wrapper to invoke via CLI) | **Yes** | Dynamic self-correcting agent loop; visual DOM analysis. | No direct MCP integration; massive token usage per request; overkill for simple tools. |
| **Local Custom Script** | Custom Skill / script | Write lightweight Bun/Node JS script calling local Playwright | **Via custom slash command / terminal CLI** | **Yes** | 100% control; 0 token overhead from MCP protocol; customized to fleet-viewer. | Must maintain code manually. |

---

## 🛠️ Step-by-Step LXC 110 Installation & Integration (For Playwright MCP)

Since our host is **Debian (LXC 110)** with Bun/Node.js installed, here is the clean path to activate this capability without manual `xdotool` hacks:

### Step 1: Install OS Dependencies & Browsers
Run this in the LXC shell (installs required fonts, libraries, and Chromium/Firefox/Webkit):
```bash
npx playwright install --with-deps chromium
```

### Step 2: Configure Claude Code / MCP Client
Add the following configuration to `~/.claude.json` (or `~/.config/claude/config.json`):
```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": [
        "-y",
        "@playwright/mcp"
      ]
    }
  }
}
```

### Step 3: Usage in Agent Session
Once configured, the agent will instantly gain tools like `playwright_navigate`, `playwright_click`, and `playwright_screenshot`. You can prompt it:
> *"Navigate to http://localhost:3000/fleet, wait for the dashboard to load, take a screenshot, and show me the image."*

---

## 💡 Recommendation: Playwright MCP (`@playwright/mcp`)

### Why this is the best fit for our fleet:
1. **Token Efficiency (Accessibility Tree)**: Playwright MCP parses the page's **Accessibility Tree** instead of raw DOM HTML. This filters out styling/script noise, feeding the LLM only semantic elements (buttons, links, text). This saves up to **80% of context tokens** per step.
2. **Native Tool Integration**: Claude Code automatically discovers the tools via stdio. The agent can natively decide when to click, fill, or screenshot as first-class operations rather than executing bash scripts.
3. **Robust Headless Mode**: Playwright handles headless state automatically without needing virtual framebuffers (like `Xvfb` or `xdotool` on `:1`), but can seamlessly attach to `DISPLAY=:1` if headed debugging is ever required.
