# System Architecture Analysis: `knowald/ha-fusion`

**Repository**: `knowald/ha-fusion`  
**Analyzed Version**: `2026.8.2` (`package.json`)  
**Target Environment**: Node.js 22 LTS, SvelteKit 2 (`@sveltejs/kit` ^2.69.2), Svelte 5 (`svelte` ^5.56.8), Express 5 (`express` ^5.2.1), Docker / Home Assistant OS Addon  
**Date**: 2026-10-28  

---

## 1. Architectural Overview & System Philosophy

`ha-fusion` is an opinionated, modern, high-performance touch-first dashboard for Home Assistant. Rather than relying on Home Assistant's native Lovelace UI or rendering purely through client-side Web Components, `ha-fusion` is built as an independent, standalone single-page application (SPA) powered by SvelteKit and Svelte 5 Runes, backed by a lightweight Node.js Express reverse proxy.

### Core Architectural Axioms
1. **Single Dynamic Page Shell**: The entire dashboard application runs inside a single SvelteKit route (`src/routes/+page.svelte`), maintaining instant navigation without multi-page client transitions or full reloads.
2. **Dynamic Code Splitting**: Heavy dependencies (`maplibre-gl`, `konva`, `hls.js`, `@event-calendar/core`, `codemirror`, modal dialogues) are loaded strictly on demand via dynamic ES module imports (`import(...)`), keeping initial bundle size minimal and boot times fast.
3. **Flat File Data Persistence**: Dashboard layouts, user configurations, and custom scripts are serialized as YAML and JSON files stored in the persistent `./data` directory (`./data/dashboard.yaml`, `./data/configuration.yaml`, `./data/custom_css.css`, `./data/custom_js.js`), avoiding database dependencies.
4. **Direct WebSocket Stream with Home Assistant**: The frontend establishes a direct bi-directional WebSocket connection with Home Assistant via `home-assistant-js-websocket`, subscribing to real-time entity state streams, configuration, services, and custom event triggers (`HA_FUSION`).
5. **Universal Deployment (Ingress + Standalone Docker)**: Designed from the ground up to operate interchangeably as a native Home Assistant OS (HAOS) Ingress Add-on or as an independent standalone Docker container via an adaptive reverse proxy in `server.js`.

```
+-----------------------------------------------------------------------------------------+
|                                    Client Browser                                       |
|                                                                                         |
|  +--------------------+   +----------------------------------------------------------+  |
|  |     Theme CSS      |   |            SvelteKit Root Shell (+page.svelte)           |  |
|  |  (:root variables) |   |                                                          |  |
|  +--------------------+   |  +----------------------------------------------------+  |  |
|                           |  | Top Drawer Header (src/lib/Drawer/Index.svelte)    |  |  |
|  +--------------------+   |  +----------------------------------------------------+  |  |
|  |   Modals Portal    |   |  +--------------------+  +----------------------------+  |  |
|  |  (svelte-modals)   |   |  | Sidebar Navigation |  | Views Bar (Views.svelte)   |  |  |
|  +--------------------+   |  | (Sidebar/Index)    |  +----------------------------+  |  |
|                           |  |                    |  | Main Section Grid          |  |  |
|  +--------------------+   |  | (Widgets, Sensors, |  | (Main/Index.svelte)        |  |  |
|  | Dynamic Components |   |  |  Graphs, History)  |  | (Horizontal/Vertical Stack,|  |  |
|  | (Konva, HLS, Map)  |   |  |                    |  |  Buttons, Media, Scenes)   |  |  |
|  +--------------------+   |  +--------------------+  +----------------------------+  |  |
|                           +----------------------------------------------------------+  |
+-----------------------------------------------------------------------------------------+
                    |                                             ^
       REST / Local Assets Proxy                                  | Real-time WebSocket
         (/api/*, /local/*)                                       | (States, Services, Config)
                    v                                             v
+---------------------------------------+             +-----------------------------------+
|      Express Server (server.js)       |             |                                   |
|   - Dynamic Ingress Target Detection  |             |                                   |
|   - Reverse Proxy Middleware          |             |                                   |
|   - SvelteKit SSR/Static Handler      |             |                                   |
+---------------------------------------+             |          Home Assistant           |
                    |                                 |          (Core / HAOS)            |
        Local Filesystem Storage                      |                                   |
     (data/*.yaml, data/*.css, etc.)                  |   - WebSocket API (:8123)         |
                    v                                 |   - Camera Proxy / Media Streams  |
+---------------------------------------+             |   - REST API                      |
|            ./data Storage             |             |                                   |
|  - dashboard.yaml                     |             |                                   |
|  - configuration.yaml                 |             |                                   |
|  - custom_css.css / custom_js.js      |             |                                   |
+---------------------------------------+             +-----------------------------------+
```

---

## 2. Directory Structure & Layout Philosophy

The repository exhibits strict domain segregation between server orchestration, API endpoints, Svelte UI modules, drag-and-drop actions, and third-party canvas engines:

```
ha-fusion/
├── .github/
│   └── workflows/
│       ├── ci.yml                 # Linting, check, tests
│       ├── docker-publish.yml     # Multi-arch container build (amd64, arm64, armv7)
│       └── sync-addon.yml         # Auto-syncs releases to knowald/addon-ha-fusion
├── data/                          # Persistent storage mount point (YAML, CSS, JS)
│   └── .gitkeep
├── docs/                          # Project documentation and release checklists
├── scripts/
│   └── translations/              # Tooling to extract translations from HA container
│       ├── fetch.py               # HA python translation scraper
│       ├── generate.sh            # Pipeline script piping fetch to split
│       └── split.py               # Splits translation blobs into static JSON files
├── src/
│   ├── ambient.d.ts               # Ambient type declarations
│   ├── app.d.ts                   # SvelteKit App namespace
│   ├── app.html                   # HTML template shell
│   ├── global.d.ts                # Global module declarations (@event-calendar/core)
│   ├── hooks.server.ts            # Strips large SvelteKit 'link' headers for reverse proxies
│   ├── lib/
│   │   ├── Actions/               # Svelte DOM actions
│   │   │   ├── ripple.ts          # Touch/click ripple effect action
│   │   │   └── sortable.ts        # SortableJS integration with Svelte 5 AST anchor preservation
│   │   ├── Components/            # Shared atomic components (CodeEditor, ColorPicker, Theme, etc.)
│   │   ├── Drawer/                # Header toolbar and editing drawer components
│   │   ├── Main/                  # Dashboard core grid layout, views, and card items
│   │   │   ├── Camera/            # Camera streaming engines (HLS, WebRTC, Proxy, Info)
│   │   │   ├── legacyDrag.ts      # Multi-level tree manipulation for section/item drag transfers
│   │   │   └── legacyDrag.test.ts # Vitest unit tests for drag-and-drop tree manipulation
│   │   ├── Modal/                 # Modal dialogs
│   │   │   ├── PictureElements/   # Konva 2D Canvas floorplan editor and viewer subsystem
│   │   │   ├── VisibilityConfig/  # Visual rule builder for conditional rendering
│   │   │   ├── Index.svelte       # Master modal shell (drag-to-dismiss, backdrop, focus-trap)
│   │   │   └── *Modal.svelte      # 25+ domain entity modals (Light, Climate, Cover, Media, etc.)
│   │   ├── Settings/              # Dashboard settings, connection, addons, and theme management
│   │   ├── Sidebar/               # Left aside panel (Graph, Sensor, History, Weather, Timer, etc.)
│   │   ├── Conditional.ts         # Visibility evaluation engine (state, numeric, screen media queries)
│   │   ├── Modals.ts              # Wrapper over svelte-modals/legacy with dynamic import loosening
│   │   ├── Socket.ts              # WebSocket lifecycle, auth negotiation, entity state store updates
│   │   ├── Stores.ts              # Svelte stores, reactive state bridges, dashboard mutation helpers
│   │   ├── Types.ts               # Full TypeScript type definitions for dashboard domain
│   │   ├── Utils.ts               # State helpers, entity name formatting, service resolution
│   │   └── Weather.ts             # Weather condition mappings and icon set declarations
│   └── routes/
│       ├── +layout.svelte         # Root layout: mounts Modals backdrop and global style resets
│       ├── +page.server.ts        # SSR loader: parses configuration.yaml, dashboard.yaml, themes, translations
│       ├── +page.svelte           # Single dashboard shell, layout grid, keyboard handlers, socket init
│       └── _api/                  # Backend REST API routes for persistence and external queries
│           ├── custom_css/        # GET/POST custom CSS
│           ├── custom_js/         # GET/POST custom JS
│           ├── get_all_themes/    # Enumerates and validates theme YAML definitions
│           ├── get_calendar/      # Proxies authenticated calendar requests
│           ├── get_docs/          # Fetches and renders markdown docs via marked
│           ├── get_translation/   # Delivers translation files
│           ├── list_languages/    # Lists available UI locales
│           ├── load_theme/        # Retrieves specific theme payload
│           ├── log_backend/       # Client logging to Node console
│           ├── save_config/       # Writes ./data/configuration.yaml
│           ├── save_dashboard/    # Writes ./data/dashboard.yaml
│           ├── version/           # Version check and updater
│           └── youtube/           # YouTube watch history fetcher via youtubei.js
├── static/                        # Static assets (themes, documentation, translations, icons)
├── Dockerfile                     # Multi-stage cross-platform production Dockerfile
├── docker-compose.yml             # Standard Docker Compose specification
├── server.js                      # Production Express server with dynamic Ingress proxy
├── svelte.config.js               # SvelteKit configuration with Runes enforcement
└── vite.config.ts                 # Vite bundler configuration with dependency prebundling rules
```

---

## 3. Entry Points & Runtime Boot Lifecycle

### A. Production Express Server (`server.js`)
In production, the application is not launched via `vite preview` or standalone SvelteKit node adapters directly; it is wrapped in an Express server (`server.js:1-73`):
1. **Dynamic Target Detection (`entryMiddleware`, `server.js:14-48`)**:
   - If running in standalone Docker (`ADDON=false`), it reads `HASS_URL` from the environment.
   - If running as a Home Assistant OS Add-on (`ADDON=true`), it dynamically parses the request headers:
     - **Ingress Mode**: Evaluates `x-hass-source`, `x-forwarded-proto`, and `x-forwarded-host` to construct `target = ${forwardedProto}://${forwardedHost}` (`server.js:28-30`).
     - **Direct Exposed Port Mode**: Replaces the container's `EXPOSED_PORT` in the incoming `host` header with `HASS_PORT` (`server.js:33-36`).
   - The resolved target URL is injected into request headers (`req.headers['X-Proxy-Target'] = target`) and attached to `req.target`.
2. **Reverse Proxy Middleware (`server.js:51-57`)**:
   - Uses `http-proxy-middleware` to proxy `/local/` (Home Assistant custom cards, www folder assets) and `/api/` (camera proxy streams, REST calls) directly to Home Assistant with `changeOrigin: true`.
3. **SvelteKit Handler (`server.js:60`)**:
   - Hands all other routes over to SvelteKit's compiled handler (`./build/handler.js`).

### B. Server-Side Load (`src/routes/+page.server.ts`)
When the client makes the initial document request:
1. `src/hooks.server.ts:7-10` intercepts the response and deletes the SvelteKit `Link` header to avoid upstream reverse proxy buffer overflow (`upstream sent too big header while reading response header from upstream`).
2. `+page.server.ts:33-69` executes server-side:
   - Reads `./data/configuration.yaml` and `./data/dashboard.yaml` asynchronously in parallel via `fs/promises` (`+page.server.ts:40-43`).
   - Dynamically resolves `configuration.hassUrl` from `process.env.HASS_URL` or the incoming `X-Proxy-Target` header (`+page.server.ts:46`).
   - Determines theme and locale paths (`./static` in dev, `./build/client` in production).
   - Loads the active theme YAML (`dashboard.theme || 'godis'`) and translations (`en.json` merged with `configuration.locale.json` falling back to `_default`).
   - Returns `{ configuration, dashboard, theme, translations }` to the client.

### C. Client Hydration & WebSocket Lifecycle (`src/routes/+page.svelte`)
When the page loads in the browser (`browser === true`):
1. Seeds the Svelte stores with SSR data (`$configuration`, `$dashboard`, `$translation`, `$selectedLanguage`, `$customJs`, `$youtubeAddon`, `$currentViewId`).
2. Sets `document.documentElement.lang` (`+page.svelte:73`).
3. Unregisters existing service workers to avoid interference with MJPEG camera streams (`+page.svelte:125-134`).
4. Initiates WebSocket connection loop:
   - Calls `connect()` immediately, retrying every 3000ms via `setInterval` until authenticated (`+page.svelte:75-94`).
   - An `$effect` hook watches `$configuration?.token` to trigger `updateConnection()` on token updates (`+page.svelte:99-101`).
   - Automatically cleans up the interval on unmount (`onDestroy`).

---

## 4. Home Assistant Integration & Authentication Architecture

Communication with Home Assistant is orchestrated entirely in `src/lib/Socket.ts` using the official `home-assistant-js-websocket` library.

### A. Three-Tier Authentication Hierarchy (`Socket.ts:61-105`)

```
                      +---------------------------------------+
                      | authentication(configuration) called   |
                      +---------------------------------------+
                                          |
                        Is configuration.token present?
                                   /             \
                             [YES]                 [NO]
                                 /                   \
        +--------------------------------+   Is userAgent "Home Assistant"?
        | createLongLivedTokenAuth(...)  |              /            \
        +--------------------------------+        [YES]                [NO]
                                 |                  /                    \
                                 |    +------------------------+   +------------------------+
                                 |    | Open TokenModal.svelte |   | Normal getAuth(...)    |
                                 |    | (Require LLAT input)   |   | OAuth Redirect Flow    |
                                 |    +------------------------+   +------------------------+
                                 |                  |                          |
                                 |            Prompt user           Detect Ingress path?
                                 |                  |                   /         \
                                 |                  |             [YES]             [NO]
                                 |                  |               /                 \
                                 |                  |   +-----------------------+  Standard
                                 |                  |   | Explicit redirectUrl  |  OAuth Flow
                                 |                  |   | preserving Ingress URI|
                                 |                  |   +-----------------------+
                                 |                  |              |
                                 +------------------+--------------+
                                                    |
                                      +---------------------------+
                                      | createConnection({ auth })|
                                      +---------------------------+
```

1. **Long-Lived Access Token (LLAT)**:
   - If `configuration?.token` is set, calls `createLongLivedTokenAuth(configuration?.hassUrl, configuration?.token)` (`Socket.ts:71-72`).
2. **Companion App Guard**:
   - If running inside the mobile app (`navigator.userAgent.includes('Home Assistant')`) without a token:
   - Ingress and companion app redirect mechanisms conflict with standard OAuth redirects.
   - The app intercepts this by opening `TokenModal.svelte` (`Socket.ts:76-84`) forcing the user to provide a Long-Lived Access Token.
3. **Standard OAuth / Ingress Auth (`getAuth`)**:
   - Calls `getAuth` with token caching in `localStorage.hassTokens`.
   - **Ingress Detection**: If `window.location.pathname.includes('/api/hassio_ingress/')`, it passes an explicit `redirectUrl = ${window.location.origin}${window.location.pathname}` (`Socket.ts:93-97`). This prevents the OAuth callback from redirecting to the Home Assistant root UI instead of the Ingress panel.
   - Cleans up query string upon successful return (`history.replaceState(null, '', location.pathname)` when `auth_callback=1`).

### B. Real-Time WebSocket Subscriptions (`Socket.ts:106-207`)
Once `createConnection({ auth })` resolves:
- **Entities**: `subscribeEntities(conn, (hassEntities) => states.set(hassEntities))` streams every entity state change into the `$states` store (`Socket.ts:116`).
- **Config**: `subscribeConfig(conn, (hassConfig) => config.set(hassConfig))` streams HA core config into `$config` (`Socket.ts:119`).
- **Services**: `subscribeServices(conn, (hassServices) => services.set(hassServices))` streams available services into `$services` (`Socket.ts:122`).
- **Persistent Notifications**: Subscribes to `persistent_notification/subscribe`, tracking added, removed, updated, and current notifications into `$persistentNotifications` (`Socket.ts:175-207`).
- **Custom Event Trigger (`HA_FUSION`)**: Subscribes to the Home Assistant event bus for `HA_FUSION` events:
  - `close_popup`: Programmatically closes any open modal dialog via `closeModal()` (`Socket.ts:152-155`).
  - `refresh`: Forces dashboard reload via `location.reload()` (`Socket.ts:158-161`).

### C. Service Execution (`callService`)
All UI entity interactions (toggle light, change climate temperature, run automation, operate vacuum) call `callService($connection, domain, service, serviceData)` from `home-assistant-js-websocket`. Entity domain services are dynamically resolved via `getTogglableService(entity)` in `src/lib/Utils.ts:96-149`.

---

## 5. State Management & Svelte 5 Runes Reactivity

The application represents an architecture migrated to Svelte 5 while retaining Svelte's lightweight Store contracts for global event streaming.

### A. Runes Configuration (`svelte.config.js`)
`svelte.config.js:21-28` configures the Svelte compiler via `dynamicCompileOptions`:
```javascript
dynamicCompileOptions({ filename }) {
    if (!filename.includes('node_modules')) {
        return { runes: true };
    }
}
```
All internal project components run under strict Svelte 5 Runes mode (`$state`, `$derived`, `$effect`, `$props()`), while third-party legacy dependencies in `node_modules` remain in legacy component mode.

### B. Core Reactive Stores (`src/lib/Stores.ts`)
Global cross-cutting state is organized into specialized stores:
- **Home Assistant Telemetry**: `connection`, `config`, `states` (`HassEntities`), `services`, `connected`.
- **Dashboard Data**: `configuration` (`Configuration`), `dashboard` (`Dashboard`), `customJs`.
- **Navigation & Drawer**: `currentViewId`, `showDrawer`, `drawerSearch`, `filterDashboard`, `editMode`.
- **Canvas & Visuals**: `motion` (animation duration ms), `konvaStore`, `konvaImageCache`.
- **History & Undo/Redo**: `history` (JSON string array), `historyIndex`, `record`.

### C. The State Proxy & Deep Cloning Synchronization Pattern
A central architectural challenge in Svelte 5 is the interplay between Svelte 5 `$state` proxies, Svelte stores, and deep object graphs. `src/lib/Stores.ts:32-54` documents and solves this problem:

1. **Why `dashboard.update` requires deep cloning (`refreshDashboard`)**:
   - In-place modifications to `$dashboard` do not trigger UI updates because derived stores (e.g. `view` in `+page.svelte`) and keyed `{#each}` blocks compare object references. In-place mutations keep references identical, causing Svelte to skip re-rendering.
   - `refreshDashboard(id?)` runs `dashboard.update((d) => JSON.parse(JSON.stringify(d)))`, creating fresh object references across the tree and re-linking the caller's selection via `getSelected(id, get(dashboard))`.
2. **Why `updateDashboard(sel, mutate)` is mandatory**:
   - In configuration modals (rendered via `svelte-modals`), props passed to modal dialogs become Svelte 5 `$state` proxies upon reassignment.
   - Writes to a detached proxy never reach the raw graph in the store.
   - `updateDashboard(sel, mutate)` finds the live raw object in the store matching `sel.id`, executes the mutation against the canonical store graph, calls `refreshDashboard()`, and returns the newly linked object.

### D. Declarative Visibility Engine (`src/lib/Conditional.ts`)
Sections and cards can be dynamically shown or hidden based on Home Assistant entity states or viewport criteria (`handleVisibility`, `Conditional.ts:9-53`):
- **Supported Conditions**:
  - `state`: Exact match (`state`) or negation (`state_not`) against `$states[entity].state`.
  - `numeric_state`: Floating-point comparison with `above` and/or `below` boundaries.
  - `and` / `or`: Recursive nested logical rule sets.
  - `screen`: Reactive CSS media queries via `window.matchMedia`. `mediaQueries` store maintains live `change` event listeners that update dynamically when the viewport resizes, cleaning up listeners on section removal.

---

## 6. UI Component Hierarchy & Interaction Flow

The UI layout is defined in `src/routes/+page.svelte` using a CSS Grid container (`#layout`):

```
+-----------------------------------------------------------------------------------------+
|                                    #layout (Grid)                                       |
|  grid-template-areas:                                                                   |
|    "header header"                                                                      |
|    "aside  nav"                                                                         |
|    "aside  main"                                                                        |
+-----------------------------------------------------------------------------------------+
| Header:  Drawer (src/lib/Drawer/Index.svelte)                                           |
|          [EditMode] [Add Item] [Appearance] [Undo/Redo] [Search Input] [Settings]       |
+------------------------------------+----------------------------------------------------+
| Aside:   Sidebar                   | Nav:     Views Bar (src/lib/Main/Views.svelte)     |
|          (src/lib/Sidebar/         |          [View 1] [View 2] [View 3] [+]            |
|           Index.svelte)            +----------------------------------------------------+
|                                    | Main:    Content Grid (src/lib/Main/Index.svelte)  |
|          - Date & Time             |                                                    |
|          - Sensor Readings         |  +----------------------------------------------+  |
|          - History Graphs (D3)     |  | Section: Living Room                        |  |
|          - Camera Miniatures       |  |  [Light Button] [Climate Card] [Switch]     |  |
|          - Weather & Forecast      |  +----------------------------------------------+  |
|          - Timers & Notifications  |  | Horizontal / Vertical Stacks                 |  |
|                                    |  +----------------------------------------------+  |
|                                    |  | Scenes / Custom Media Player / PictureElem  |  |
|                                    |  +----------------------------------------------+  |
+------------------------------------+----------------------------------------------------+
```

### A. Responsive Grid Re-Layout
On desktop displays:
- Columns: `sidebarWidth px` (default 350px) + `auto`.
- Mobile breakpoint (`@media (max-width: 768px)`, `+page.svelte:273-285`):
  - Collapses grid-template-areas to `'header' -> 'aside' -> 'nav' -> 'main'`.

### B. Drag and Drop with Svelte 5 Fragment Preservation (`src/lib/Actions/sortable.ts`)
To allow live reordering of views, sections, and cards in `$editMode`:
- Wraps `SortableJS` via a custom Svelte action `use:sortable`.
- **Svelte 5 DOM Anchor Hazard Solved (`sortable.ts:90-100`)**: Svelte 5 tracks each-item fragments using DOM comment anchors. If SortableJS moves DOM nodes directly, reverting by index can land a node on the wrong side of an anchor comment, permanently corrupting Svelte's reconciliation fragment ranges.
- `sortable.ts` tracks original node anchors in a `WeakMap<Element, { parent: Node; next: Node | null }>`, ensuring dragged elements are reverted to their exact original anchor positions before Svelte commits reorders.
- **Alt-Drag Cloning**: Supports duplicating items on drag by holding the `Alt` key, managed by window-level listeners and `legacyDrag.ts:transferLegacyItem` / `transferLegacySection`.

### C. Unified Modal System (`src/lib/Modals.ts` & `src/lib/Modal/Index.svelte`)
All modal dialogues mount through `svelte-modals/legacy` injected in `src/routes/+layout.svelte`:
- `src/lib/Modals.ts` loosens strict typing to support dynamic module loaders: `openModal(() => import('$lib/Modal/LightModal.svelte'), { sel })`.
- `Modal/Index.svelte` provides touch-gesture drag-to-dismiss (`draggingModal`), backdrop opacity transitions, and focus trapping (`trapFocus`).

---

## 7. Specialized Subsystems & External Integrations

| Subsystem | Primary Technologies | File Locations | Implementation Mechanics |
|---|---|---|---|
| **2D Floorplan Canvas** | `konva` (^10.3.0) | `src/lib/Modal/PictureElements/` (`konvaBase.ts`, `konvaEditor.ts`, `konvaViewer.ts`) | Full WYSIWYG floorplan editor & viewer. Supports layers, shapes, state icons, state labels, images, guides, undo/redo stack, and image caching (`konvaImageCache`). In viewer mode, shapes trigger `callService` on click. |
| **Live Camera Streams** | `hls.js` (^1.6.16), WebRTC, MJPEG | `src/lib/Main/Camera/` (`HLS.svelte`, `WebRTC.svelte`, `Proxy.svelte`) | Adaptive camera streaming: uses WebRTC when supported, HLS via dynamic `import('hls.js')`, or falls back to Home Assistant camera proxy MJPEG streams (`/api/camera_proxy_stream/`). |
| **Sensor History Charts** | `d3-array`, `d3-scale`, `d3-shape` | `src/lib/Sidebar/Graph.svelte` | Queries HA history API; computes linear and time scales; renders SVG area and curve charts with touch/hover tooltips. |
| **Interactive Maps** | `maplibre-gl` (^5.24.0) | `src/lib/Modal/DeviceTrackerModal.svelte` | Displays person and device tracker GPS coordinates on vector tile maps with live markers and popups. |
| **Calendar Engine** | `@event-calendar/core` (^5.12.0) | `src/lib/Modal/CalendarModal.svelte`, `src/routes/_api/get_calendar/` | Renders day grid and list views of Home Assistant calendar entities. |
| **Code Editor** | `codemirror` 6 | `src/lib/Components/CodeEditor.svelte`, `src/lib/Modal/CodeConfig.svelte` | In-dashboard YAML and CSS editing with one-dark theme, autocomplete, and live syntax validation. |
| **Color Temperature Wheel** | `@jaames/iro` (^5.5.2) | `src/lib/Components/ColorPicker.svelte` | Interactive RGB color wheel and Kelvin temperature slider for lights. |
| **YouTube Media History** | `youtubei.js` (^17.2.0) | `src/routes/_api/youtube/+server.ts` | Server-side integration with YouTube Innertube API to look up high-res artwork and metadata when HA media players are active. |
| **Dynamic Custom Injectors** | Native DOM `<style>` / `<script>` | `src/lib/Components/CustomCss.svelte`, `CustomJs.svelte` | Loads user-defined CSS and JS from `./data/custom_css.css` and `./data/custom_js.js` via Blob URLs. |

---

## 8. Backend API Routes (`src/routes/_api/`) & Data Persistence

SvelteKit server endpoints under `src/routes/_api/` handle backend persistence and proxy tasks:

```
src/routes/_api/
├── save_dashboard/+server.ts    # POST: Serializes JSON payload to YAML -> ./data/dashboard.yaml
├── save_config/+server.ts       # POST: Serializes JSON payload to YAML -> ./data/configuration.yaml
├── custom_css/+server.ts        # GET: Reads / creates ./data/custom_css.css
│                                # POST: Writes content to ./data/custom_css.css
├── custom_js/+server.ts         # GET: Reads / creates ./data/custom_js.js
│                                # POST: Writes content to ./data/custom_js.js
├── load_theme/+server.ts        # POST: Loads and returns specific theme YAML
├── get_all_themes/+server.ts    # GET: Scans ./themes/*.yaml, validates titles, returns array
├── get_calendar/+server.ts      # POST: Fetches external calendar feeds with Bearer auth
├── get_docs/+server.ts          # POST: Reads markdown docs, parses with marked, returns HTML
├── get_translation/+server.ts   # POST: Delivers static translation JSON
├── list_languages/+server.ts    # GET: Lists available translation JSON filenames
├── log_backend/+server.ts       # POST: Logs client debug payloads to Node server console
├── version/+server.ts           # GET/POST: Manages installed vs latest version in ./data/version.json
└── youtube/+server.ts           # POST: Polling, auth, and history search via youtubei.js
```

---

## 9. Containerization, Add-on Sync & Build Pipeline

### A. Production Multi-Stage Container (`Dockerfile`)
- **Stage 1 (`builder`)**: Uses `node:22` on the native host platform (`--platform=$BUILDPLATFORM`) to avoid QEMU emulation segfaults on 32-bit platforms (e.g. `linux/arm/v7`). Installs dependencies via `pnpm`, builds SvelteKit via `pnpm run build`, and prunes dev dependencies with `pnpm prune --prod` (`Dockerfile:7-22`).
- **Stage 2 (Runtime)**: Minimal `node:22-alpine` image copying `./build`, `./node_modules`, `server.js`, and `package.json`. Exposes port `5050` with default environment `PORT=5050`, `NODE_ENV=production`, `ADDON=false` (`Dockerfile:25-40`).

### B. Home Assistant Add-on Ecosystem (`.github/workflows/sync-addon.yml`)
When a release tag is published on `knowald/ha-fusion`:
- The GitHub Actions workflow checks out `knowald/addon-ha-fusion` using a fine-grained Personal Access Token (`ADDON_REPO_TOKEN`).
- Updates `version: <TAG>` in `config.yaml`.
- Updates `CHANGELOG.md` with the release notes.
- Commits and pushes back to `knowald/addon-ha-fusion`, which automatically triggers the Addon repository's native multi-arch build pipeline.

---

## 10. Summary Matrix

| Architectural Dimension | Implementation Details |
|---|---|
| **Frontend Framework** | Svelte 5 (`^5.56.8`) with Runes (`dynamicCompileOptions: { runes: true }`) |
| **Application Metaphor** | Single-page application shell (`src/routes/+page.svelte`) inside SvelteKit 2 |
| **Server Engine** | Express 5 (`^5.2.1`) in `server.js` wrapping compiled SvelteKit handler |
| **Home Assistant Transport** | Direct client-side WebSocket via `home-assistant-js-websocket` (`^9.6.0`) |
| **Authentication Flow** | Tri-mode: Long-Lived Token (LLAT), Companion App Modal prompt, or OAuth Redirect with Ingress URL preservation |
| **Data Storage Engine** | Flat YAML/JSON in `./data` (`dashboard.yaml`, `configuration.yaml`, `custom_css.css`, `custom_js.js`) |
| **Dynamic Capabilities** | Code-split dynamic module loading (`#await import(...)` and `openModal(() => import(...))`) |
| **Canvas / Floorplan** | Konva 2D Canvas Editor & Viewer (`src/lib/Modal/PictureElements/`) |
| **Streaming Media** | HLS (`hls.js`), WebRTC, and MJPEG HTTP proxying via `http-proxy-middleware` |
| **Add-on Distribution** | Auto-synchronized to `knowald/addon-ha-fusion` with dynamic header inspection for Ingress |
