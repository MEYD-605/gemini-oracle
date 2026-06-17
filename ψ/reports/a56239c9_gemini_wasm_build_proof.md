# No.6 Gemini — ESP32 WASM Build Proof & Verification

This document verifies the custom freestanding WebAssembly module and ESP32 firmware build for **No.6 Gemini's** Airdramon desk-pet integration, including the statically embedded GIF data.

## 1. WebAssembly Module (`gemini.wasm`)

- **Source File**: [gemini.c](file:///root/Code/github.com/MEYD-605/workshop-04-esp32-wasm/submissions/06-gemini/wasm/gemini.c)
- **Compilation Tool**: `zig 0.14.1` (Target: `wasm32-freestanding`, ReleaseSmall)
- **Compiled WASM Size**: **18,049 bytes** (Zero imports, contains embedded 17.8KB Airdramon GIF data)
- **C Header Embed**: [gemini_wasm.h](file:///root/Code/github.com/MEYD-605/workshop-04-esp32-wasm/submissions/06-gemini/wasm/gemini_wasm.h) (`unsigned char gemini_wasm[]`)

### Exported Functions

| Export Name | C Signature | Behavior | Verification Result |
|---|---|---|---|
| `add` | `int add(int, int)` | Canonical arithmetic check | `add(2,3) = 5` **PASS** |
| `gemini_sum` | `int gemini_sum(int, int)` | Sums two integers | `gemini_sum(12,25) = 37` **PASS** |
| `gemini_pack_size` | `int gemini_pack_size(void)` | Returns mascot pack size | `gemini_pack_size() = 37` **PASS** |
| `gemini_skill_check` | `int gemini_skill_check(int)` | Computes skill check (`score * 6`) | `gemini_skill_check(6) = 36` **PASS** |
| `gemini_gif_size` | `int gemini_gif_size(void)` | Returns embedded GIF size | `gemini_gif_size() = 17822` **PASS** |
| `gemini_gif_ptr` | `const unsigned char* gemini_gif_ptr(void)` | Returns linear memory address of GIF data | `gemini_gif_ptr() = 1048576` **PASS** |

### Local Node.js Verification Output
```text
add(2,3) = 5 PASS
gemini_sum(12,25) = 37 PASS
gemini_pack_size() = 37 PASS
gemini_skill_check(6) = 36 PASS
gemini_gif_size() = 17822 PASS
gemini_gif_ptr() = 1048576 (WASM offset) PASS
gemini.wasm: 18049 bytes, zero-import module verified
```

---

## 2. PlatformIO ESP32 Firmware Build

- **Source Code**: [main.cpp](file:///root/Code/github.com/MEYD-605/workshop-04-esp32-wasm/submissions/06-gemini/platformio/src/main.cpp)
- **Engine**: `wasm3` interpreter running natively on the ESP32
- **Compilation Status**: **SUCCESS**
- **Sizes**:
  - **RAM (DRAM)**: `40,281 bytes` (12.33%)
  - **Flash**: `370,512 bytes` (28.3%)
- **Firmware Binary**: [firmware.bin](file:///root/Code/github.com/MEYD-605/workshop-04-esp32-wasm/submissions/06-gemini/platformio/.pio/build/esp32dev/firmware.bin)

### Staged Web Flasher Manifest Output
```text
staged /root/Code/github.com/MEYD-605/workshop-04-esp32-wasm/submissions/06-gemini/webflasher/dist
gemini-oracle-bootloader.bin 23552
gemini-oracle-partitions.bin 3072
gemini-oracle-boot_app0.bin 8192
gemini-oracle-firmware.bin 370768
```

---

## 3. Web Flasher Preview (Mascot Simulation)

The upscaled `airdramon.gif` (96x96 pixels nearest-neighbor) is registered under state animations. The WASM-decoded desk-pet preview renders as follows in the simulated display bezel:

![Gemini Preview Bezel Image](/root/.no6-home/.gemini/antigravity-cli/brain/a56239c9-fd4b-48de-a9cf-dec10713c6c6/gemini_preview.png)
