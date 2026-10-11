# AGY CLI Family Version Audit & Roadmap Report

**Author:** No.6 Gemini (Lead of agy CLI family) · `[maclab:no6]`  
**To:** Sombo 88 (`[maclab:sombo-oracle]`) & Master Bo (`borde9902`)  
**Date:** 2026-10-06 16:25 GMT+7  
**Scope:** agy CLI Family (No.6 Gemini, No.8 Agy-Nano2, No.10 X)  

---

## 1. Executive Summary & Version Status per Seat

| Seat | Node / Host | Platform | Binary Path | Current Version | Live Process Status |
|---|---|---|---|---|---|
| **No.6 Gemini** | **MacLab** (100.83.0.1) | macOS (Darwin x86_64) | `/Users/admin/.local/bin/agy` | **1.2.16** | Active (tmux `06-gemini`) |
| **No.8 Agy-Nano2** | **MacLab** (100.83.0.1) | macOS (Darwin x86_64) | `/Users/admin/.local/bin/agy` (via `start-no8.sh`) | **1.2.16** | Active (tmux `08-agy-nano2`) |
| **No.10 X** | **ClubSGame** (100.87.51.122) | Windows 11 Native | `C:\Users\noone\...\Google.AntigravityCLI...\agy.exe` | **1.3.0** | Active (PID 4352) |

---

## 2. Key Findings & Drift Analysis

1. **Version Drift Detected:**
   - **ClubSGame (No.10)** is running **v1.3.0** (managed via Windows WinGet `Google.AntigravityCLI`).
   - **MacLab (No.6 & No.8)** are on **v1.2.16** (standalone macOS binary in `/Users/admin/.local/bin/agy`).
   - Difference: MacLab is currently **1 minor release behind** ClubSGame.

2. **Shared Binary Dependency on MacLab (Risk Flag):**
   - Both No.6 and No.8 point to the single shared executable `/Users/admin/.local/bin/agy`.
   - If `agy update` is executed directly on MacLab, it will modify the binary for **both** No.6 and No.8 simultaneously.

3. **Safe Rollout Strategy (Adhering to "Test on One Seat First"):**
   - **Step A:** Decouple binary paths or stage the upgrade into an isolated binary (e.g., `/Users/admin/.local/bin/agy-1.3.0` or local per-seat path).
   - **Step B:** Pilot upgrade on **No.6 Gemini** first during a controlled maintenance window.
   - **Step C:** Verify interoperability with fleet bridges (Discord relay, Arra MCP, 9router, tmux, and cross-CLI communication with Claude Code / Hermes).
   - **Step D:** Once verified stable on No.6, propagate to **No.8 Agy-Nano2**.

---

## 3. Standing by for Sombo & Bo Directives
- **Zero changes made** to any binary or config.
- Awaiting confirmation from Sombo 88 on when to stage and test the MacLab upgrade to 1.3.0.
