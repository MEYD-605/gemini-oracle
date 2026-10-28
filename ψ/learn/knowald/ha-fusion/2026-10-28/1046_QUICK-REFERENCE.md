# ha-fusion: Quick Reference & Architectural Analysis

> **Target Repository**: [`knowald/ha-fusion`](https://github.com/knowald/ha-fusion)  
> **Original Creator**: [`matt8707/ha-fusion`](https://github.com/matt8707/ha-fusion)  
> **Maintained Fork**: [`knowald/ha-fusion`](https://github.com/knowald/ha-fusion)  
> **Source Base Analyzed**: Release `2026.8.2` (commit `65cc195`, tag `2026.8.2`)  
> **Citation Policy**: All statements cite verified source files under the target directory.

---

## 1. What It Does & Vision

### 1.1 Overview & Core Architecture
`ha-fusion` is an opinionated, high-performance, web-native custom dashboard for [Home Assistant](https://www.home-assistant.io/) ([README.md:1-7](file:///Users/admin/.no6-home/ghq/github.com/knowald/ha-fusion/README.md#L1-L7)). 

Built on **SvelteKit** (`^2.69.2`) and **Svelte 5** (`^5.56.8`) in native runes mode ([package.json:20,35](file:///Users/admin/.no6-home/ghq/github.com/knowald/ha-fusion/package.json#L20-L35)), it connects directly to Home Assistant via WebSockets using `home-assistant-js-websocket` (`^9.6.0`) ([package.json:62](file:///Users/admin/.no6-home/ghq/github.com/knowald/ha-fusion/package.json#L62); [src/lib/Socket.ts:1-24](file:///Users/admin/.no6-home/ghq/github.com/knowald/ha-fusion/src/lib/Socket.ts#L1-L24)). It provides a responsive visual dashboard with an interactive drag-and-drop editor that persists directly to human-readable YAML without requiring manual YAML authoring ([README.md:7-14](file:///Users/admin/.no6-home/ghq/github.com/knowald/ha-fusion/README.md#L7-L14)).

### 1.2 Key Capabilities
- **Visual Drag-and-Drop Layouts**: Arrange views, sections, horizontal/vertical stacks, and sidebar elements with mouse or touch; changes serialize to `./data/dashboard.yaml` ([README.md:13](file:///Users/admin/.no6-home/ghq/github.com/knowald/ha-fusion/README.md#L13); [src/routes/_api/save_dashboard/+server.ts:1-23](file:///Users/admin/.no6-home/ghq/github.com/knowald/ha-fusion/src/routes/_api/save_dashboard/+server.ts#L1-L23)).
- **Optimistic UI Updates**: Buttons and toggles immediately render their intended state on user tap/click before the Home Assistant WebSocket server confirms the state change ([README.md:15](file:///Users/admin/.no6-home/ghq/github.com/knowald/ha-fusion/README.md#L15); [src/lib/Main/Button.svelte:55-59](file:///Users/admin/.no6-home/ghq/github.com/knowald/ha-fusion/src/lib/Main/Button.svelte#L55-L59)).
- **Gesture-Based Light Controls**: Drag horizontally across any light button to continuously scrub brightness without opening a modal dialog ([README.md:16](file:///Users/admin/.no6-home/ghq/github.com/knowald/ha-fusion/README.md#L16); [src/lib/Main/Button.svelte:60-77](file:///Users/admin/.no6-home/ghq/github.com/knowald/ha-fusion/src/lib/Main/Button.svelte#L60-L77)).
- **Comprehensive Domain Coverage**: Dedicated buttons, cards, and modal dialogs for lights (including RGBW/RGBWW white channel sliders), covers, climate, media players, cameras, vacuums, locks, timers, automations, alarms, and lawn mowers ([README.md:14](file:///Users/admin/.no6-home/ghq/github.com/knowald/ha-fusion/README.md#L14); [src/lib/Modal/](file:///Users/admin/.no6-home/ghq/github.com/knowald/ha-fusion/src/lib/Modal/)).
- **Rich Sidebar System**: Configurable sidebar featuring weather reports, hourly/daily forecasts, D3-based history graphs, live HLS/MJPEG camera feeds, iframes, Jinja templates, notifications, and radial gauges ([README.md:17](file:///Users/admin/.no6-home/ghq/github.com/knowald/ha-fusion/README.md#L17); [src/lib/Sidebar/](file:///Users/admin/.no6-home/ghq/github.com/knowald/ha-fusion/src/lib/Sidebar/)).
- **Konva Floorplan Engine**: Interactive canvas-based floorplan viewer and graphical editor using `konva` (`^10.3.0`) for precise element placement, state icons, and interactive zones ([package.json:65](file:///Users/admin/.no6-home/ghq/github.com/knowald/ha-fusion/package.json#L65); [src/lib/Modal/PictureElements/](file:///Users/admin/.no6-home/ghq/github.com/knowald/ha-fusion/src/lib/Modal/PictureElements/)).
- **Spotify Integration**: Spotify player widgets with media controls, device routing, quick-play shortcuts, and dynamic rotating background art ([README.md:19](file:///Users/admin/.no6-home/ghq/github.com/knowald/ha-fusion/README.md#L19); [src/lib/Main/SpotifyPlayer.svelte](file:///Users/admin/.no6-home/ghq/github.com/knowald/ha-fusion/src/lib/Main/SpotifyPlayer.svelte)).

### 1.3 Comparison with Native Lovelace
| Dimension | Native Home Assistant Lovelace | ha-fusion |
| :--- | :--- | :--- |
| **Rendering Paradigm** | Polymer / Lit Web Components using encapsulated Shadow DOM | Svelte 5 compiled reactive DOM (zero virtual DOM / shadow DOM boundaries) |
| **Styling & Theming** | Requires `card-mod` hacks, deeply nested CSS variables, and per-card overrides | Clean global YAML themes, direct CSS variables, and native Custom CSS module ([src/routes/_api/custom_css/](file:///Users/admin/.no6-home/ghq/github.com/knowald/ha-fusion/src/routes/_api/custom_css/)) |
| **Layout System** | Masonry columns or newer experimental Sections view | 2D CSS Grid with nested Horizontal/Vertical Stacks and visual drag reordering ([src/lib/Main/Index.svelte:148-200](file:///Users/admin/.no6-home/ghq/github.com/knowald/ha-fusion/src/lib/Main/Index.svelte#L148-L200)) |
| **Floorplans** | `picture-elements` card with tedious manual pixel/percentage YAML calculations | Built-in graphical Konva canvas editor with guides, pan/zoom, undo/redo, and drag-and-drop ([src/lib/Modal/PictureElements/konvaEditor.ts](file:///Users/admin/.no6-home/ghq/github.com/knowald/ha-fusion/src/lib/Modal/PictureElements/konvaEditor.ts)) |
| **Interaction Latency** | Waits for server WebSocket event loop before updating card state | Instant optimistic UI updates on button tap ([src/lib/Main/Button.svelte:55-59](file:///Users/admin/.no6-home/ghq/github.com/knowald/ha-fusion/src/lib/Main/Button.svelte#L55-L59)) |
| **Configuration Storage** | Managed via HA Lovelace storage (`.storage/lovelace*`) or manual `ui-lovelace.yaml` | Plain text files: `./data/dashboard.yaml` and `./data/configuration.yaml` ([src/routes/+page.server.ts:40-43](file:///Users/admin/.no6-home/ghq/github.com/knowald/ha-fusion/src/routes/+page.server.ts#L40-L43)) |

---

## 2. Customization Capability

### 2.1 Drag-and-Drop Editor
- **Engine**: Powered by `sortablejs` (`^1.15.7`) via custom Svelte action wrappers ([package.json:68](file:///Users/admin/.no6-home/ghq/github.com/knowald/ha-fusion/package.json#L68); [src/lib/Actions/sortable.ts](file:///Users/admin/.no6-home/ghq/github.com/knowald/ha-fusion/src/lib/Actions/sortable.ts)).
- **Alt-Key Cloning**: Pressing the `Alt` key while dragging an item or section automatically clones the item, assigning newly generated IDs to all nested descendants ([src/routes/+page.svelte:174-177](file:///Users/admin/.no6-home/ghq/github.com/knowald/ha-fusion/src/routes/+page.svelte#L174-L177); [src/lib/Main/Index.svelte:42-51,75-83](file:///Users/admin/.no6-home/ghq/github.com/knowald/ha-fusion/src/lib/Main/Index.svelte#L42-L51)).
- **Undo / Redo Stack**: State snapshots are recorded on every change, accessible via `cmd+z` and `cmd+shift+z` ([README.md:107-108](file:///Users/admin/.no6-home/ghq/github.com/knowald/ha-fusion/README.md#L107-L108); [src/lib/Stores.ts:162-184](file:///Users/admin/.no6-home/ghq/github.com/knowald/ha-fusion/src/lib/Stores.ts#L162-L184)).

### 2.2 Views, Sections & Stacks
- **Data Model** ([src/lib/Types.ts:24-69](file:///Users/admin/.no6-home/ghq/github.com/knowald/ha-fusion/src/lib/Types.ts#L24-L69)):
  - `Dashboard`: Contains `views[]`, `sidebar[]`, `theme`, `hide_views`, `hide_sidebar`, and `sidebarWidth`.
  - `Views`: Each view has an `id`, `name`, `icon`, and `sections[]`.
  - `Section`: Supports standard items, or acts as a structural container (`horizontal-stack` or `vertical-stack`) that can nest additional sections recursively.
- **Card Sizing in Grid**:
  - Regular buttons occupy `grid-column: span 1; grid-row: span 1` ([src/lib/Main/Index.svelte:113-114](file:///Users/admin/.no6-home/ghq/github.com/knowald/ha-fusion/src/lib/Main/Index.svelte#L113-L114)).
  - Large widgets (`conditional_media`, `picture_elements`, `camera`, `spotify_player_large`, `entities`) automatically span `grid-column: span 2; grid-row: span 4` ([src/lib/Main/Index.svelte:105-114](file:///Users/admin/.no6-home/ghq/github.com/knowald/ha-fusion/src/lib/Main/Index.svelte#L105-L114)).

### 2.3 Conditional Visibility Logic
Sections can have granular display conditions ([src/lib/Conditional.ts:1-120](file:///Users/admin/.no6-home/ghq/github.com/knowald/ha-fusion/src/lib/Conditional.ts#L1-L120); [src/lib/Types.ts:57-68](file:///Users/admin/.no6-home/ghq/github.com/knowald/ha-fusion/src/lib/Types.ts#L57-L68)):
- **Entity State**: `state` equals or `state_not` equals target value.
- **Numeric State**: Evaluates numerical boundaries (`above` / `below`).
- **Screen Media Queries**: Uses CSS media query conditions (`condition: screen`, `media_query: "(min-width: 1024px)"`) to show or hide sections based on viewport size.
- **Logical Composition**: Combines multiple rules with `and` / `or` grouping.

### 2.4 Custom CSS & Custom JavaScript
- **Custom CSS**: Stored in `./data/custom_css.css`. Edited live in the UI via CodeMirror or loaded via `/_api/custom_css` endpoint ([src/routes/_api/custom_css/+server.ts:1-52](file:///Users/admin/.no6-home/ghq/github.com/knowald/ha-fusion/src/routes/_api/custom_css/+server.ts#L1-L52)). Injected directly into the document root ([src/routes/+page.svelte:257-259](file:///Users/admin/.no6-home/ghq/github.com/knowald/ha-fusion/src/routes/+page.svelte#L257-L259)).
- **Custom JS**: Stored in `./data/custom_javascript.js`. Activated when `custom_js: true` in `configuration.yaml` ([src/routes/_api/custom_js/+server.ts:1-29](file:///Users/admin/.no6-home/ghq/github.com/knowald/ha-fusion/src/routes/_api/custom_js/+server.ts#L1-L29); [src/routes/+page.svelte:250-254](file:///Users/admin/.no6-home/ghq/github.com/knowald/ha-fusion/src/routes/+page.svelte#L250-L254)).

### 2.5 Themes & Styling Variables
Themes are plain YAML files placed in `static/themes/` ([src/routes/_api/get_all_themes/+server.ts:17-39](file:///Users/admin/.no6-home/ghq/github.com/knowald/ha-fusion/src/routes/_api/get_all_themes/+server.ts#L17-L39)):
- **Bundled Themes**: `godis` (default), `contrast`, `muted`, `serene` ([static/themes/](file:///Users/admin/.no6-home/ghq/github.com/knowald/ha-fusion/static/themes/)).
- **Theme Variables**: Exposes CSS custom properties ([static/themes/godis.yaml:4-29](file:///Users/admin/.no6-home/ghq/github.com/knowald/ha-fusion/static/themes/godis.yaml#L4-L29)), including:
  ```yaml
  colors-text: rgb(255, 255, 255)
  colors-sidebar-background: rgba(0, 0, 0, 0.2)
  button-background-color-on: rgb(255, 255, 255)
  button-background-color-off: rgba(0, 0, 0, 0.3)
  button-name-color-on: rgb(0, 0, 0)
  button-name-color-off: rgb(255, 255, 255)
  modal-background-color: rgba(0, 0, 0, 0.3)
  border-radius: 0.4rem
  font-family: "'Inter Variable', system-ui"
  ```

### 2.6 Iconify Ecosystem Support
- Integrated via `@iconify/svelte` (`^5.2.2`) ([package.json:18](file:///Users/admin/.no6-home/ghq/github.com/knowald/ha-fusion/package.json#L18); [src/lib/Components/ComputeIcon.svelte:3](file:///Users/admin/.no6-home/ghq/github.com/knowald/ha-fusion/src/lib/Components/ComputeIcon.svelte#L3)).
- Supports any Iconify icon identifier (e.g. `mdi:home`, `ph:lightbulb`, `lucide:fan`, `tabler:temperature`).
- Built-in heuristic mapping (`computeIcon.ts`) automatically resolves entity domain and device-class icons when no explicit icon is specified ([src/lib/Modal/PictureElements/computeIcon.ts:9-100](file:///Users/admin/.no6-home/ghq/github.com/knowald/ha-fusion/src/lib/Modal/PictureElements/computeIcon.ts#L9-L100)).

### 2.7 Floorplans with Konva Canvas
- Full interactive canvas floorplan engine (`src/lib/Modal/PictureElements/`) powered by `konva` (`^10.3.0`) ([package.json:65](file:///Users/admin/.no6-home/ghq/github.com/knowald/ha-fusion/package.json#L65)).
- **Editor Features** (`KonvaEditor`):
  - Add and position state icons, state labels, text blocks, images, rectangles, and circles ([Toolbar.svelte:49-75](file:///Users/admin/.no6-home/ghq/github.com/knowald/ha-fusion/src/lib/Modal/PictureElements/Toolbar.svelte#L49-L75)).
  - Alignment guides: draggable vertical and horizontal guides ([Toolbar.svelte:81-85](file:///Users/admin/.no6-home/ghq/github.com/knowald/ha-fusion/src/lib/Modal/PictureElements/Toolbar.svelte#L81-L85)).
  - Navigation modes: Default select, Pan mode (spacebar drag), and Zoom mode ([KeyboardHandler.svelte:21-35](file:///Users/admin/.no6-home/ghq/github.com/knowald/ha-fusion/src/lib/Modal/PictureElements/KeyboardHandler.svelte#L21-L35)).
  - Dedicated Undo/Redo history stack ([TransformAttributes.svelte:191-202](file:///Users/admin/.no6-home/ghq/github.com/knowald/ha-fusion/src/lib/Modal/PictureElements/TransformAttributes.svelte#L191-L202)).
  - Interactive actions: bind arbitrary Home Assistant service calls on element click ([ActionPanel.svelte:125-127](file:///Users/admin/.no6-home/ghq/github.com/knowald/ha-fusion/src/lib/Modal/PictureElements/ActionPanel.svelte#L125-L127)).
- **Viewer Optimization** (`KonvaViewer`):
  - Canvas caching through `$konvaImageCache` prevents re-decoding image assets on state changes ([konvaBase.ts:223-239](file:///Users/admin/.no6-home/ghq/github.com/knowald/ha-fusion/src/lib/Modal/PictureElements/konvaBase.ts#L223-L239)).

---

## 3. Home Assistant Compatibility & Networking

### 3.1 Connection Protocol & WebSocket Client
- Implements `home-assistant-js-websocket` (`^9.6.0`) for real-time bidirectional communication ([package.json:62](file:///Users/admin/.no6-home/ghq/github.com/knowald/ha-fusion/package.json#L62); [src/lib/Socket.ts:1-14](file:///Users/admin/.no6-home/ghq/github.com/knowald/ha-fusion/src/lib/Socket.ts#L1-L14)).
- Subscribes to entities (`subscribeEntities`), server configuration (`subscribeConfig`), and available services (`subscribeServices`) ([src/lib/Socket.ts:116-122](file:///Users/admin/.no6-home/ghq/github.com/knowald/ha-fusion/src/lib/Socket.ts#L116-L122)).
- Custom event bus: Listens for `HA_FUSION` custom events (`close_popup`, `refresh`) and persistent notification updates ([src/lib/Socket.ts:145-207](file:///Users/admin/.no6-home/ghq/github.com/knowald/ha-fusion/src/lib/Socket.ts#L145-L207)).

### 3.2 Authentication Modes
1. **OAuth Redirect Flow**: Standard web browser login via `getAuth(...)` ([src/lib/Socket.ts:88-104](file:///Users/admin/.no6-home/ghq/github.com/knowald/ha-fusion/src/lib/Socket.ts#L88-L104)). Tokens are cached in `localStorage.hassTokens`.
2. **Long-Lived Access Token**:
   - Specified statically in `configuration.yaml` via `token: "<LONG_LIVED_TOKEN>"` ([src/lib/Types.ts:14](file:///Users/admin/.no6-home/ghq/github.com/knowald/ha-fusion/src/lib/Types.ts#L14)).
   - Invokes `createLongLivedTokenAuth(hassUrl, token)` ([src/lib/Socket.ts:71-73](file:///Users/admin/.no6-home/ghq/github.com/knowald/ha-fusion/src/lib/Socket.ts#L71-L73)).
   - **Companion App Fallback**: When loaded inside the official Home Assistant Companion App (`navigator.userAgent.includes('Home Assistant')`), OAuth redirects often fail; ha-fusion intercepts this and opens `TokenModal.svelte` prompting the user for a long-lived access token ([src/lib/Socket.ts:76-85](file:///Users/admin/.no6-home/ghq/github.com/knowald/ha-fusion/src/lib/Socket.ts#L76-L85)).

### 3.3 Home Assistant OS (HAOS) Add-on & Ingress Support
- **Add-on Repository**: Maintained at [`https://github.com/knowald/addon-ha-fusion`](https://github.com/knowald/addon-ha-fusion) ([README.md:34-36,80-81](file:///Users/admin/.no6-home/ghq/github.com/knowald/ha-fusion/README.md#L34-L36)).
- **Ingress Detection**: Evaluates `window.location.pathname.includes('/api/hassio_ingress/')` and computes clean callback URLs ([src/lib/Socket.ts:93-96](file:///Users/admin/.no6-home/ghq/github.com/knowald/ha-fusion/src/lib/Socket.ts#L93-L96)).
- **Reverse Proxy Engine**: Built into `server.js` using Express and `http-proxy-middleware` (`^4.2.0`) ([server.js:1-6](file:///Users/admin/.no6-home/ghq/github.com/knowald/ha-fusion/server.js#L1-L6)):
  - Reads `x-hass-source`, `x-forwarded-proto`, and `x-forwarded-host` from incoming Ingress headers to resolve the internal target URL dynamically ([server.js:18-30](file:///Users/admin/.no6-home/ghq/github.com/knowald/ha-fusion/server.js#L18-L30)).
  - Automatically proxies `/local/` (custom media/assets) and `/api/` endpoints to Home Assistant ([server.js:51-55](file:///Users/admin/.no6-home/ghq/github.com/knowald/ha-fusion/server.js#L51-L55)).

### 3.4 Ports & Networking Facts
- **Default Application Port**: `5050` (defined in `Dockerfile:35,39` and `docker-compose.yml:12,16`).
- **Default Dev Port**: `5173` (Vite dev server default, `.env.docker.example:40`).
- **Port 8099 Status**: **Not present in the `ha-fusion` codebase**. The container explicitly binds to port `5050` (`ENV PORT=5050`). In HAOS or Docker setups, users may bind `5050` to any host port (e.g. `-p 8099:5050` or `EXPOSED_PORT=8099`) via `.env.docker` or add-on network configuration, but port 5050 is the internal default.

---

## 4. TV & Wall Display Considerations

### 4.1 Screen Scaling & Responsive Viewport
- **Grid Layout**: Adapts dynamically between desktop and mobile ([src/routes/+page.svelte:263-285](file:///Users/admin/.no6-home/ghq/github.com/knowald/ha-fusion/src/routes/+page.svelte#L263-L285)).
  - Desktop (> 768px): Sidebar takes `$dashboard?.sidebarWidth || 350` px, main dashboard fills the remaining space.
  - Collapsible Sidebar: Can be hidden completely via `$dashboard.hide_sidebar: true` or collapsed to 0px ([src/routes/+page.svelte:208-210](file:///Users/admin/.no6-home/ghq/github.com/knowald/ha-fusion/src/routes/+page.svelte#L208-L210)).
- **Media Query Sections**: TV displays (1080p, 4K) can use conditional sections targeting `@media (min-width: 1920px)` to display high-density control panels, while hiding mobile-only elements (`hide_mobile: true` on sidebar items) ([src/lib/Types.ts:191,220,229](file:///Users/admin/.no6-home/ghq/github.com/knowald/ha-fusion/src/lib/Types.ts#L191)).
- **Dedicated TV View Query String**: Load directly to a specific view name with `?view=LivingRoomTV` ([README.md:97](file:///Users/admin/.no6-home/ghq/github.com/knowald/ha-fusion/README.md#L97)).
- **Kiosk Mode Lock**: Add `?menu=false` to query string to completely hide the drawer menu button, preventing accidental edit-mode triggers on wall-mounted screens or TVs ([README.md:98](file:///Users/admin/.no6-home/ghq/github.com/knowald/ha-fusion/README.md#L98); [src/routes/+page.svelte:118-120](file:///Users/admin/.no6-home/ghq/github.com/knowald/ha-fusion/src/routes/+page.svelte#L118-L120)).

### 4.2 Remote Control / D-Pad vs Mouse / Touch
- **D-Pad Limitation**: ha-fusion **does not include a spatial navigation engine** (e.g. directional D-pad grid focus algorithms like Android TV Leanback).
- **Tab Focus**: Buttons and elements specify standard HTML focus indices (`tabindex={isDisplayOnly ? -1 : 0}`) and `onkeydown` listeners for `Enter` / `Space` ([src/lib/Main/Button.svelte:715,768](file:///Users/admin/.no6-home/ghq/github.com/knowald/ha-fusion/src/lib/Main/Button.svelte#L715-L768)). Sequential tabbing across a wide 2D dashboard via standard TV remote arrow keys is tedious.
- **Gesture Controls Require Pointer**: Features like horizontal sliding across light buttons to adjust brightness (`slide_brightness`) rely on pointer drag events ([src/lib/Main/Button.svelte:60-77](file:///Users/admin/.no6-home/ghq/github.com/knowald/ha-fusion/src/lib/Main/Button.svelte#L60-L77)), which cannot be triggered with a directional D-pad.
- **TV Recommendation**: For smart TVs or TV sticks (Apple TV, Android TV, Fire TV), best results are achieved using:
  1. An **Air-Mouse** (gyroscope remote with on-screen mouse pointer), or
  2. A Bluetooth trackpad/mouse, or
  3. A browser with a built-in virtual cursor.

### 4.3 Low-Spec Hardware Performance (Svelte 5 Runes)
- **Zero Virtual DOM Overhead**: Svelte 5 compiles components directly into surgical DOM updates using signals/runes (`$state`, `$derived`, `$effect`, `$props`) ([CHANGELOG.md:89-90](file:///Users/admin/.no6-home/ghq/github.com/knowald/ha-fusion/CHANGELOG.md#L89-L90)). Memory and CPU usage remain minimal on low-power ARM devices (e.g. Raspberry Pi, Android TV sticks, budget tablets).
- **Push-Only WebSockets**: State changes stream over a single persistent WebSocket connection rather than continuous HTTP polling intervals, keeping network and CPU idle.
- **Lazy Code-Splitting**: SvelteKit dynamic imports (`#await import(...)`) defer loading modals, Konva floorplans, CodeMirror editors, and heavy libraries until actively requested ([src/routes/+page.svelte:215-258](file:///Users/admin/.no6-home/ghq/github.com/knowald/ha-fusion/src/routes/+page.svelte#L215-L258)).
- **Virtualization**: Employs `svelte-tiny-virtual-list` (`^3.0.1`) to render large lists without overloading browser memory ([package.json:70](file:///Users/admin/.no6-home/ghq/github.com/knowald/ha-fusion/package.json#L70)).
- **Service Worker Teardown**: Explicitly unregisters legacy service workers upon mounting to prevent buffering and frame lag on MJPEG camera feeds ([src/routes/+page.svelte:125-134](file:///Users/admin/.no6-home/ghq/github.com/knowald/ha-fusion/src/routes/+page.svelte#L125-L134)).

---

## 5. Installation & Quick Start Guide

### 5.1 Home Assistant OS (HAOS) Add-on
1. Open Home Assistant -> **Settings** -> **Add-ons** -> **Add-on Store**.
2. Click the three dots (top right) -> **Repositories** -> Add:
   ```text
   https://github.com/knowald/addon-ha-fusion
   ```
3. Refresh the add-on store, find **ha-fusion**, and click **Install** ([README.md:34-39](file:///Users/admin/.no6-home/ghq/github.com/knowald/ha-fusion/README.md#L34-L39)).
4. Start the add-on and open it via the Ingress sidebar.

### 5.2 Standalone Docker (docker-compose.yml)
Create a `docker-compose.yml` file ([docker-compose.yml:1-28](file:///Users/admin/.no6-home/ghq/github.com/knowald/ha-fusion/docker-compose.yml#L1-L28)):

```yaml
services:
  ha-fusion:
    container_name: ha-fusion
    image: ghcr.io/knowald/ha-fusion:latest
    restart: always
    ports:
      - '5050:5050'
    volumes:
      - ./data:/app/data
    environment:
      HASS_URL: http://192.168.1.241:8123
      TZ: Asia/Bangkok
      PORT: 5050
      NODE_ENV: production
    healthcheck:
      test: ['CMD', 'wget', '--quiet', '--tries=1', '--spider', 'http://localhost:5050']
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    networks:
      - ha-fusion-network

networks:
  ha-fusion-network:
    driver: bridge
```

Start the container:
```bash
docker compose up -d ha-fusion
```

### 5.3 Docker Run (CLI)
Run directly via Docker CLI ([README.md:63-73](file:///Users/admin/.no6-home/ghq/github.com/knowald/ha-fusion/README.md#L63-L73)):
```bash
docker run -d \
  --name ha-fusion \
  --network bridge \
  -p 5050:5050 \
  -v /path/to/ha-fusion-data:/app/data \
  -e TZ=Asia/Bangkok \
  -e HASS_URL=http://192.168.1.241:8123 \
  --restart always \
  ghcr.io/knowald/ha-fusion:latest
```

### 5.4 Environment Variables Reference
Derived from `.env.docker.example` and `server.js` ([.env.docker.example:1-40](file:///Users/admin/.no6-home/ghq/github.com/knowald/ha-fusion/.env.docker.example#L1-L40); [server.js:10-12](file:///Users/admin/.no6-home/ghq/github.com/knowald/ha-fusion/server.js#L10-L12)):

| Variable | Required | Default | Description |
| :--- | :---: | :---: | :--- |
| `HASS_URL` | **Yes** (Docker) | `None` | Base URL of Home Assistant (e.g. `http://192.168.1.241:8123`). In HAOS Add-on mode, resolved dynamically via Ingress headers. |
| `TZ` | No | `UTC` | Container timezone (e.g. `Asia/Bangkok`, `Europe/Stockholm`). |
| `PORT` | No | `5050` | Internal HTTP listening port for Express server. |
| `EXPOSED_PORT` | No | `5050` | Host port used by `docker-compose.yml` and URL proxy rewriters. |
| `DATA_PATH` | No | `./data` | Host directory mounted to `/app/data` containing `dashboard.yaml`, `configuration.yaml`, custom CSS/JS. |
| `ADDON` | No | `false` | Set to `true` when running inside Home Assistant OS Add-on environment to activate Ingress header sniffing. |
| `DEV_PORT` | No | `5173` | Port for Vite dev server during local development. |

### 5.5 Keyboard Shortcuts & URL Parameters
- **URL Query Parameters** ([README.md:93-99](file:///Users/admin/.no6-home/ghq/github.com/knowald/ha-fusion/README.md#L93-L99)):
  - `?view=<ViewName>`: Boots directly into a specific dashboard view on page load.
  - `?menu=false`: Hides the menu drawer trigger button (ideal for wall tablets and kiosk TVs).
- **Editor Keyboard Shortcuts** ([README.md:100-109](file:///Users/admin/.no6-home/ghq/github.com/knowald/ha-fusion/README.md#L100-L109); [src/routes/+page.svelte:174-177](file:///Users/admin/.no6-home/ghq/github.com/knowald/ha-fusion/src/routes/+page.svelte#L174-L177)):
  - `f`: Open drawer and focus search filter.
  - `esc`: Close open modal or drawer / blur active element.
  - `cmd + s`: Save dashboard configuration.
  - `cmd + z`: Undo last change.
  - `cmd + shift + z`: Redo undone change.
  - `Alt + Drag`: Duplicate and clone dragged section/item with newly generated IDs.
