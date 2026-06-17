# 📝 Frontend Board Core Logic Findings Report
*Audited by: No.6 Gemini (Pack Leader, Oracle Council)*  
*Target Branch: `meyd605/workboard-extras` (commit [baacab0](file:///root/Code/github.com/ekzhang/sshx/commit/baacab0))*

---

## 🔍 Overview of lane audit
This audit covers the **Frontend board CORE LOGIC** lane. We inspected the event loop, gesture math, layout tiling, pointer tracking, and unmount cleanup logic. We identified several critical bugs, race conditions, and memory leaks.

---

## 🚨 Detailed Findings

### 1. `touchZoom.ts` Gesture Event Listener Leak (Typo Bug)
* **Rank**: **HIGH**
* **Location**: [src/lib/action/touchZoom.ts:291-294](file:///root/Code/github.com/ekzhang/sshx/src/lib/action/touchZoom.ts#L291-L294)
* **Reason**: In the `destroy()` method of the `TouchZoom` class, the code calls `document.addEventListener` instead of `document.removeEventListener` to clean up the `gesturestart` and `gesturechange` listeners:
  ```typescript
  // src/lib/action/touchZoom.ts
  destroy() {
    if (this.#node) {
      // @ts-ignore
      document.addEventListener("gesturestart", this.#preventGesture); // BUG: should be removeEventListener
      // @ts-ignore
      document.addEventListener("gesturechange", this.#preventGesture); // BUG: should be removeEventListener
  ```
* **Impact**: Every time a `TouchZoom` instance is created and destroyed, new gesture prevention listeners are leaked on the global `document` object. This causes a memory leak of the `TouchZoom` closure context and duplicated event handlers.

---

### 2. `Session.svelte` Missing `touchZoom.destroy()` Call (Cleanup Leak)
* **Rank**: **HIGH**
* **Location**: [src/lib/Session.svelte:1339-1353](file:///root/Code/github.com/ekzhang/sshx/src/lib/Session.svelte#L1339-L1353) (in `onDestroy`)
* **Reason**: When the main `Session.svelte` component is unmounted (e.g. during page navigation), it fails to call `touchZoom.destroy()`.
* **Impact**: All window resize listeners (`window.addEventListener("resize", this.#updateBoundsD)`), scroll container listeners, and document gesture listeners registered by the `TouchZoom` constructor remain active. This prevents Svelte's entire infinite canvas element and scope from being garbage collected, causing a significant memory leak.

---

### 3. `tileWindows` Race Condition causing `y: NaN` (Logic Race)
* **Rank**: **HIGH**
* **Location**: [src/lib/Session.svelte:1123-1220](file:///root/Code/github.com/ekzhang/sshx/src/lib/Session.svelte#L1123-L1220)
* **Reason**: The `tileWindows()` method reads `shells.length` as `n` before awaiting `settleLayout()`. If a terminal is added or closed by a concurrent peer while the layout is settling (which yields execution for two `requestAnimationFrame` frames), the list of `shells` changes. When execution resumes, `boxes = shells.map` uses the updated shell list, but the dimensions arrays `colW` and `rowH` are sized using the stale `n` value.
  When accessing `rowH[row]` where `row >= nRows`, it reads `undefined`, yielding `Math.max(undefined, b.h) = NaN`. Consequently, `rowY[row]` is `undefined`, resulting in a computed `y` coordinate of `NaN`, which is then dispatched to the server.
* **Impact**: Concurrently opening or closing windows during tiling operations will cause window coordinates to collapse to `NaN`, leading to visual failures and server-side model validation errors.

---

### 4. Pointer Hijacking on Multi-touch (Pointer Event Race)
* **Rank**: **HIGH**
* **Location**: 
  - [src/lib/ui/Board.svelte:188-229](file:///root/Code/github.com/ekzhang/sshx/src/lib/ui/Board.svelte#L188-L229) (`onMove` / `endDrag`)
  - [src/lib/Session.svelte:586-628](file:///root/Code/github.com/ekzhang/sshx/src/lib/Session.svelte#L586-L628) (`handleMouse` / `handleMouseEnd`)
* **Reason**: Pointer events are used for dragging and resizing terminals and board items to support mobile/touch devices. However, the move and end handlers listen globally to `window` pointer events without tracking the initiating `pointerId`.
* **Impact**: In a multi-touch scenario (e.g., a user pinching to zoom, or touching the canvas with a second finger while dragging an item), any secondary finger movement dispatches `pointermove` events that are processed by the drag handler. This causes the dragged window or item to jump erratically to the coordinates of the second finger. Similarly, lifting the second finger dispatches a `pointerup` event that prematurely terminates the primary drag state.

---

### 5. `Board.svelte` Multi-touch Long-press Timer Leak (Multi-touch Race)
* **Rank**: **MED**
* **Location**: [src/lib/ui/Board.svelte:118-146](file:///root/Code/github.com/ekzhang/sshx/src/lib/ui/Board.svelte#L118-L146) (`onPointerDown`)
* **Reason**: When a touch down is detected, `onPointerDown` schedules a `pressTimer` for the long-press drag gesture. It does not check if an active `pressTimer` is already scheduled before assigning the new one:
  ```typescript
  pressTimer = setTimeout(() => { ... }, LONG_PRESS_MS);
  ```
* **Impact**: If a user touches the screen with a second finger while a long press is pending, the original timer ID is overwritten and leaked. When the first timer fires, it uses the state variables (`pressItem`/`pressEvent`) updated by the second finger, triggering premature drag states and duplicate window listener bindings.

---

### 6. `Board.svelte` Window Event Listener Leak on Unmount (Cleanup Leak)
* **Rank**: **MED**
* **Location**: [src/lib/ui/Board.svelte](file:///root/Code/github.com/ekzhang/sshx/src/lib/ui/Board.svelte)
* **Reason**: Unlike `Session.svelte`, `Board.svelte` has no `onDestroy` lifecycle method. If a user is active (dragging or resizing) when the board is unmounted or toggled off, any window-level listeners (`onMove`, `endDrag`, `onResize`, `endResize`) remain attached to `window`.
* **Impact**: Memory leaks of the Svelte board instance closures and runtime exceptions when global event handlers dispatch to destroyed components.

---

### 7. Dead Code in `Session.svelte` (Cleanliness)
* **Rank**: **LOW**
* **Location**: [src/lib/Session.svelte:24, 29, 193](file:///root/Code/github.com/ekzhang/sshx/src/lib/Session.svelte#L24)
* **Reason**: `VoiceController` type and `createVoiceCapture` helper are imported, and `let voice: VoiceController | null = null;` is defined, but they are never instantiated or used.
* **Impact**: Minor codebase clutter.

---
*Report compiled: 2026-06-13T18:24:45+07:00 (GMT+7)*
