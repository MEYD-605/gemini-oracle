# Handoff: OnePlus 8T Venus Research, r42 Buddying, and School Closure

**Date**: 2026-10-20 19:45
**Context**: ~41% (405k tokens)
📡 Session: b9e494b1 | sombo-oracle

## What We Did

### 1. School Lane Archive & Closure (Nazt Directive)
- Handled official closure order for school Discord channel (`1500775333283237970`):
  * Downloaded full 100-message raw dump: `ψ/inbox/school/1500775333283237970-channel-dump.json`
  * Generated full chronological markdown transcript: `ψ/inbox/school/1500775333283237970-full-transcript.md`
  * Synthesized the 7 core foundational lessons learned to `ψ/inbox/school/2026-10-20_school_channel_lessons_learned.md`
  * Persisted milestone to HAOS Arra Memory: ID `3392e80a-c35b-427a-ae5f-a98f67c4db6a` (importance 4)
  * Committed archive files to git (`2b4f35a`, +1161 lines)
  * Tagged and notified Master Bo in the school channel and directly via Discord DM. Clarified Jizo's git verification remark with empirical proof.

### 2. OnePlus 8T Hardware Battery & Power Bypass Verification
- Audited live hardware registers on OnePlus 8T via I2C:
  * Fuel gauge BQ27541 (`i2c 16 0x55`): `current_now = -1000 uA` (0mA charge current), `voltage_now = 8.34V`, `temp = 37.0°C`, `status = Discharging`
  * Charger MP2762A (`i2c 5 0x5c`): `0x08 = 0x06` (`CHG_EN = 0`), `0x02 = 0x00` (`FCC = 0mA`), `0x00/0x0F = 0x3c` (3000mA input limit), `0x13 = 0x03` (`Power Good`, `Not Charging`)
- Confirmed hardware bypass daemon `/usr/local/sbin/clubs8t-charger.sh` (service `clubs8t-charger.service`) enforces 60% battery ceiling with hysteresis (charge back at <=55%). Battery is completely decoupled from charging stress and runs 100% on 5V 3A VBUS.
- Explained to Bo why userspace bypass is safer and more flexible than premature kernel C-driver bypass during active camera bringup. Discussed cooling fan options.

### 3. Deep Research on `venus.mbn` & Video Decode Hardware Crash
- Dispatched deep-researcher subagent to investigate why `venus-core.ko` crashed after 1.5s (~42 frames) on SM8250 mainline:
  * Decoded exception: `SFR message from FW: Exception: TID = Unknown IP = 0x3bcd4 FA = 0x0 cause = 0x6`
  * Processor: Tensilica Xtensa core (ELF machine 94). In Xtensa ISA, `EXCCAUSE = 0x6` is `IntegerDivideByZeroCause`.
  * Machine code at `IP = 0x3bcd4` in `venus.b09`: `50 00 e2` (`REMU`/`QUOU` unsigned division/remainder with divisor = 0).
  * Root causes: Upstream `sm8250.dtsi` has an accidental **3x overclock** (720–1332 MHz vs 240–444 MHz) and **completely omitted the `mmcx` power domain** (undervolted core logic). Additionally, `CONFIG_CMA_SIZE_MBYTES=32` is exhausted by 720p NV12 DPB queues.
  * System reset mechanism: When Venus halts, TrustZone secure watchdog bites after ~20s, pulling PMIC `PS_HOLD` low and triggering a cold hardware power cycle.
  * Cryptographic signing: Bound to OnePlus OEM root key (`OEM_PK_HASH`). Generic/other OEM blobs fail, but OxygenOS 12/13/14 blobs are signed with the same key.
  * Preserved full research report at `ψ/docs/2026-10-20-venus-mbn-deep-research.md` (commit `ad2cc2e`).

### 4. Council Buddying with No.5 (GmForge) on OnePlus 8T Camera & Modem
- Handed over technical diagnosis to No.5 via MQTT (`send_to_oracle`).
- Assisted No.5 with `/clear` via `seat-send 05-gmforge "/clear"` when their context reached 49%, bringing them back fresh at 13% context on Opus 5.5.
- r41 C-PHY deployed on 8T: sensor transmits frames (0x0100=1, frame counter increments), but CSID flags `UNMAPPED_VC_DT` (bit 22).
- Identified that IMX586 emits Embedded Metadata (VC0, DT 0x12) or PDAF stats which must be mapped in CSID LUT.
- No.5 completed building Kernel r42 (`#43-postmarketos-qcom-sm8250`, apk sha256 `1fcbf312...01ed0`) with patch `0033` logging `unmap_hdr0` to decode exact VC/DT.
- Analyzed mobile modem stability: SDX55 drops on warm resets due to PCIe linkdown (requires cold reboot) and 5G NSA carrier hopping (locked with `mmcli -m 0 --set-allowed-modes=4g` and MHI power control `on`).

### 5. Linux Smartphone OS Architecture & UBports Comparison
- Explained why Waydroid lagged initially (software rendering fallback to CPU SwiftShader, KWin/SurfaceFlinger contention, and audio socket race).
- Researched and compared UBports (Ubuntu Touch) porting guide (`https://docs.ubports.com/en/latest/porting/`):
  * UBports = Halium GSI (borrows legacy Android 4.19 kernel & vendor blobs, fast initial bringup but locked to obsolete Android stack).
  * postmarketOS = True Mainline Linux 7.2 (pure Unix, native DRM/KMS/V4L2, 10-year lifespan, returning to true Unix philosophy).
- Dispatched Haiku subagent to synthesize the official postmarketOS wiki smartphone porting guide.

## Pending & Next Session
- [ ] Receive completion of Haiku subagent on official pmOS porting guide (`ψ/learn/pmos-porting-guide/`)
- [ ] Monitor No.5's installation of Kernel r42 on 8T and cold reboot verification
- [ ] Assist No.5 with r43 resolution based on r42 `unmap_hdr0` logs
- [ ] Standby for Master Bo's directives

## Key Files
- `ψ/docs/2026-10-20-venus-mbn-deep-research.md`
- `ψ/inbox/school/2026-10-20_school_channel_lessons_learned.md`
- `ψ/inbox/school/1500775333283237970-channel-dump.json`
- `ψ/inbox/school/1500775333283237970-full-transcript.md`
- `ψ/focus.md`
- `/Users/admin/oneplus-8t-prep/runbook/INSTALL-RUNBOOK.md`
