# Claude Code Architecture & System Design Analysis

**Document Version:** 1.0.0  
**Timestamp:** 2026-07-16T20:44:29+07:00 (GMT+7)  
**Agent Sign-off:** 🤖 No.6 Gemini จาก ai-core  

---

## 1. Directory Structure & Organization Philosophy

The `claude-code-best` codebase is organized as a modular monorepo utilizing **Bun Workspaces**. It splits code between the core CLI client and helper workspace packages located under the `packages/` directory.

### Core Directory Layout
*   **`src/`**: Contains the main application code for the CLI client.
    *   **`entrypoints/`**: Houses all execution startup routes (CLI, MCP, SDK/init).
    *   **`bootstrap/`**: Handles early, lightweight singletons and session-global state (e.g., CWD, project root, model overrides, telemetry counters).
    *   **`commands/`**: Command definitions (subcommands like `auth`, `mcp`, `review`, etc.) that populate the CLI's command dictionary.
    *   **`components/`**: React components specifically designed for terminal rendering using the Ink framework.
    *   **`screens/`**: High-level terminal UI screens (such as the main interactive `REPL.tsx` screen).
    *   **`state/`**: Global state management configuration utilizing Zustand-style stores.
    *   **`services/`**: Supporting services (telemetry, MCP client/server integration, Langfuse tracing, local databases, auth providers, etc.).
    *   **`utils/`**: Shared logic covering platform specifics, git, subprocess env configuration, shell interaction, and performance shims.
*   **`packages/`**: Contains individual packages representing internal libraries, native addons, and decoupled servers.
    *   **`@ant/`**: Workspace namespace for platform-level frameworks and providers:
        *   `ink/`: A custom fork of the React Ink terminal renderer, handling keybindings, custom themes, and layout calculations.
        *   `model-provider/`: The model abstraction layer supporting Anthropic, Bedrock, Vertex, OpenAI, Gemini, and Grok.
        *   `computer-use-mcp/` / `computer-use-input/` / `computer-use-swift/`: Screen capture and mouse/keyboard control backends.
    *   **`builtin-tools/`**: Holds implementation files for the 60+ core capabilities (e.g., `BashTool`, `FileEditTool`, `GlobTool`).
    *   **`mcp-client/`**: Model Context Protocol client implementation.
    *   **`remote-control-server/`**: A self-hosted bridge server (including Web UI) to relay client-agent interactions.
    *   **`*-napi/`**: Native Node/Bun N-API addons for platform-level features like audio capture, modifiers, color diffs, and image manipulation.

### Organization Philosophy
1.  **Strict Performance Boundaries**: The boot-critical paths have zero execution cost. The shebang launcher avoids loading React/Ink, telemetry, and heavy UI components until interactive execution is actively requested.
2.  **Native vs. Script Separation**: High-performance or OS-level tasks (audio capturing, modifier key detection, screenshot processing) are delegated to N-API addons under `packages/` to keep the main client codebase platform-independent.
3.  **Compile-time Dead Code Elimination (DCE)**: The codebase extensively relies on `feature('FEATURE_NAME')` checks. The Vite and Bun build pipelines evaluate these compile-time macros, allowing treeshaking to strip massive modules (such as the daemon supervisor or remote control server) from external builds.

---

## 2. Entry Points

The codebase provides multiple ways to launch the runner, each routing through argument checks in the primary entrypoint:

### 1. The Shebang Entry Wrappers
*   **`dist/cli-node.js`** / **`dist/cli-bun.js`**: Built artifacts containing standard Node and Bun shebang lines:
    ```bash
    #!/usr/bin/env node
    import "./cli.js"
    ```
    These serve as shebang entrypoints for standard system execution.

### 2. The Core Startup Route
*   [src/entrypoints/cli.tsx](file:///root/Code/github.com/MEYD-605/gemini-oracle/%CF%88/learn/claude-code-best/claude-code/origin/src/entrypoints/cli.tsx): The absolute root of source code execution. It contains the primary `main()` function, checking arguments to match fast-path scenarios:
    *   **`--version` / `-v`**: Immediately prints version and exits (0 heavy imports).
    *   **`--dump-system-prompt`**: Builds configuration, resolves model type, renders the current prompt context, prints it, and exits.
    *   **`--claude-in-chrome-mcp` / `--chrome-native-host`**: Launches the background Chrome Native Host or Chrome MCP controller.
    *   **`--computer-use-mcp`**: Launches a standalone MCP server providing OS/mouse control.
    *   **`--acp`**: Starts standard Agent Client Protocol execution over stdin/stdout.
    *   **`weixin`**: Forwards arguments directly to the WeChat bot integration CLI.
    *   **`--daemon-worker`**: Starts a supervisor daemon worker.
    *   **`remote-control` / `rc` / `bridge`**: Activates the remote control socket client.
    *   **`daemon` subcommand**: Starts/stops background supervisor sessions.
    *   **`ps` / `logs` / `attach` / `kill`**: Connects/manages background daemon sessions.
    *   **`job` / `new` / `reply`**: Job template executors.
    *   **`--tmux` + `--worktree`**: Automatically handles environment pre-allocation inside a TMUX pane before booting.
    *   **Interactive Fallback**: Sets up the early terminal input capturer and imports [src/main.tsx](file:///root/Code/github.com/MEYD-605/gemini-oracle/%CF%88/learn/claude-code-best/claude-code/origin/src/main.tsx) to launch the interactive loop.

### 3. Interactive CLI Router
*   [src/main.tsx](file:///root/Code/github.com/MEYD-605/gemini-oracle/%CF%88/learn/claude-code-best/claude-code/origin/src/main.tsx): Defines Commander.js subcommands (such as `auth`, `mcp`, `plugin`, `doctor`, etc.). Its main action handler resolves user credentials, prompts for folder trust if needed, retrieves available tools/MCP resources, and initializes either:
    *   **TUI Mode**: Bootstraps the terminal TUI via `launchRepl()`.
    *   **Headless/SDK Mode**: Orchestrates directly via `QueryEngine`.

### 4. Initialization Entrypoint
*   [src/entrypoints/init.ts](file:///root/Code/github.com/MEYD-605/gemini-oracle/%CF%88/learn/claude-code-best/claude-code/origin/src/entrypoints/init.ts): Centralized, memoized function `init()` that runs once before executing the core client. It applies CA certificates, initializes mTLS tunnel agents, turns on telemetry (OTel/Sentry/Langfuse), starts balance polling, and configures OS specific shells.

### 5. MCP Integration Entrypoint
*   [src/entrypoints/mcp.ts](file:///root/Code/github.com/MEYD-605/gemini-oracle/%CF%88/learn/claude-code-best/claude-code/origin/src/entrypoints/mcp.ts): Exposes the internal capability set as a Model Context Protocol (MCP) server, mapping core CLI tools to list/call schemas.

---

## 3. Core Abstractions & Relationships

The runtime system uses a clear hierarchy to coordinate model prompts, user feedback, and file operations.

```mermaid
graph TD
    classDef core fill:#2a1b15,stroke:#4a3b35,color:#eedec9,stroke-width:2px;
    classDef package fill:#1b252c,stroke:#2b3a42,color:#dbe6ec,stroke-width:1px;

    cli_tsx[cli.tsx]:::core -->|boots| init_ts[init.ts]:::core
    cli_tsx -->|default path| main_tsx[main.tsx]:::core
    main_tsx -->|runs TUI| REPL_tsx[REPL.tsx]:::core
    main_tsx -->|runs Headless/SDK| QueryEngine[QueryEngine.ts]:::core
    REPL_tsx -->|owns screen| AppState[AppStateStore.ts]:::core
    REPL_tsx -->|executes queries| QueryEngine
    QueryEngine -->|calls turn loop| query_ts[query.ts]:::core
    query_ts -->|calls model| ModelProvider[@ant/model-provider]:::package
    query_ts -->|manages execution| ToolOrchestrator[toolOrchestration.ts]:::core
    ToolOrchestrator -->|executes| ToolExecution[toolExecution.ts]:::core
    ToolExecution -->|runs| BuiltinTools[@claude-code-best/builtin-tools]:::package
    BuiltinTools -.->|requires authorization| CanUseTool[useCanUseTool.ts]:::core
```

### 1. The Query Lifecycle Orchestrator (`QueryEngine.ts`)
*   **Definition**: [src/QueryEngine.ts](file:///root/Code/github.com/MEYD-605/gemini-oracle/%CF%88/learn/claude-code-best/claude-code/origin/src/QueryEngine.ts)
*   **Role**: Manages the life cycle of a conversation. It encapsulates session state, active options (effort configuration, model type, thinking settings), token usage aggregation, and context compaction.
*   **Turn execution**: When a user inputs text, `QueryEngine` triggers `submitMessage()`, running a generator yielding message steps (deltas, tool calls, and final completions).

### 2. The Core Execution Loop (`query.ts`)
*   **Definition**: [src/query.ts](file:///root/Code/github.com/MEYD-605/gemini-oracle/%CF%88/learn/claude-code-best/claude-code/origin/src/query.ts)
*   **Role**: The primary engine loop. It builds system context and messages, invokes the LLM API stream, parses events, and decides if it must run tools requested by the model. It handles looping calls recursively until the model terminates with a text block (or exceeds the maximum turn budget).

### 3. Tool and ToolUseContext Abstraction (`Tool.ts`)
*   **Definition**: [src/Tool.ts](file:///root/Code/github.com/MEYD-605/gemini-oracle/%CF%88/learn/claude-code-best/claude-code/origin/src/Tool.ts)
*   **Role**: Defines the contract for all tools. A `Tool` implements Zod input schemas, concurrency indicators, read-only/destructive definitions, and a `call()` function that carries out the operation.
*   **Context**: Tool execution receives a `ToolUseContext`, which packs state accessors, cancellation signals (`AbortController`), Langfuse trace spans, and file caches (`readFileState`).

### 4. Model Provider Wrapper (`@ant/model-provider`)
*   **Definition**: `packages/@ant/model-provider`
*   **Role**: Standardizes LLM communication. It translates Anthropic's Message/Tool protocols to other provider endpoints (e.g. converting tool declarations to Gemini's FunctionDeclaration format, and transforming their return streams back into Anthropic's stream format). This decouples the core CLI client from the specific target model provider.

### 5. Application State Store (`AppStateStore.ts` / `AppState.tsx`)
*   **Definition**: `src/state/AppStateStore.ts` and `src/state/AppState.tsx`
*   **Role**: The central Zustand state store. It holds session metadata, active tool configurations, workspace connection status, and UI settings. The terminal TUI binds directly to this store to handle real-time rendering.

---

## 4. Dependencies & Transitive Patterns

```
                                [cli.tsx] (Fast entry)
                                   |
                  +----------------+----------------+
                  | (Dynamic)                       | (Dynamic)
             [main.tsx]                      [init.ts]
                  |                                 |
        +---------+---------+            +----------+----------+
        |                   |            |                     |
   [REPL.tsx]       [QueryEngine.ts]  [instrumentation.ts] [sentry/langfuse]
        |                   |            |                     
   (@ant/ink)          (query.ts)     (@opentelemetry/sdk)     
                            |            
                   (@ant/model-provider) 
                            |            
               (@claude-code-best/builtin-tools)
                            |
                 (Platform Native N-APIs)
```

### Direct Dependencies
*   **React & React Reconciler**: The terminal TUI is built on top of React, feeding into a custom reconciler fork (`@ant/ink`).
*   **Commander.js**: Handles command parsing, subcommands, and flags configuration in `src/main.tsx`.
*   **OpenTelemetry SDK**: Standardizes metric counts and log sinks.
*   **Sentry & Langfuse**: Powers error reporting and step-by-step trace visualization.

### Transitive Patterns & Optimization Strategies
1.  **Lazy-Loading Modules**: To combat long module evaluation times, the codebase dynamically imports massive packages only when needed. For instance:
    *   `src/entrypoints/init.ts` dynamically imports OpenTelemetry sdk-logs only after checking that telemetry is enabled.
    *   `src/main.tsx` dynamically imports `SentryErrorBoundary` and `REPL.tsx` to delay React/Ink layout initialization.
    *   This pattern minimizes startup memory. A simple `--version` run consumes only **~35MB RSS**, compared to a fully loaded session which can reach **~500MB**.
2.  **Shared Reconciler Deduplication**: Because workspace packages and the core app all import React components, the build scripts enforce strict module deduplication via Vite and Bun configs:
    ```javascript
    dedupe: ['react', 'react-reconciler', 'react-compiler-runtime']
    ```
    This prevents duplicate contexts and separate fiber reconciler trees from clashing.
3.  **Chunk Code-Splitting for Bun**: Bun eagerly parses single large files, which consumes high RSS due to bytecode initialization. Splitting the build output into 600+ smaller modules inside `dist/chunks/` allows the JS engine to parse code on demand, drastically lowering client memory usage.
