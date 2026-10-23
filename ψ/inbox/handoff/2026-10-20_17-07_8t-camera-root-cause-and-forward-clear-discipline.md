# Handoff: OnePlus 8T Camera Root Cause & Forward Self-Clear Protocol

**Date**: 2026-10-20 17:07
**Context**: ~12%
📡 Session: f006687f | sombo-oracle

## What We Did
- **Executed SOMBO RETURN PROTOCOL**:
  - Read newest handoff `2026-10-20_16-28_8t-dual-camera-deployed-r40-verified.md`.
  - Sent full status report to Bo's Discord DM (Self-check progress log non-null, fleet drift check, DEV status block).
  - Aligned No.1 Lord Knight over MQTT (`send_to_oracle`: `[maclab:88-sombo] sombo respawned`).
- **Investigated Rear Camera Stream Stalling**:
  - Verified front camera (`cam -c 2 -C1`): captures 8.35MB frame in 150ms instantly with zero issues.
  - Verified rear camera (`cam -c 1 -C1`): hardware init passes (chip_id=0x0586), streamon completes with zero errors, interrupts register on CSID/VFE (`ac6a000.camss_msm_vfe0`), but frame buffer does not complete to userspace.
  - Deep-dived Qualcomm CAMSS CSIPHY timing & DTS configuration:
    * `imx586.c` hardcodes `link_freq_menu_items = { 400000000ULL }` (400 MHz), while kebab DTS `camr_imx586_ep` specifies `link-frequencies = /bits/ 64 <200000000>` (200 MHz).
    * `camss-csiphy-3ph-1-0.c` calculates `settle_cnt = csiphy_settle_cnt_calc(link_freq, timer_clk_rate)` directly from `link_freq` — mismatch causes CSIPHY D-PHY settle timer misalignment.
    * Sensor MCLK in DTS is set to 19.2 MHz (`CAM_CC_MCLK0_CLK`), whereas `ftbl_cam_cc_mclk0_clk_src` in `camcc-sm8250.c` supports 24 MHz via `P_CAM_CC_PLL2_OUT_EARLY` (matching the reference 24 MHz register tables).
  - Enabled dynamic debug on 8T (`camss*` and `imx586*`) to observe real-time VFE/CSID/CSIPHY negotiation.
- **Handled Bo's Live Feedback on Phone Screen Freeze**:
  - Bo reported on Discord: `กล้ององยังค้างอยู่เลย` -> `เดี๋ยวๆหยุดก่อน`.
  - Identified cause: `plasma-camera` defaults to Camera 0 (Rear IMX586), waiting indefinitely for frame buffers and freezing the viewfinder surface.
  - Promptly executed `killall -9 plasma-camera`, verified process terminated cleanly and phone UI returned to responsive state.
  - Verified phone health: battery 85%, temperature 39.6°C, charging active.
  - Re-anchored protocol on `/forward` self-clear discipline (`auto-clear-after-forward.md`).

## Pending
- [ ] Align IMX586 DTS & driver link-frequency (sync 200 MHz vs 400 MHz or enable 24 MHz MCLK)
- [ ] Configure `plasma-camera` default to Camera 1 (Front IMX471) or test camera switcher toggle
- [ ] Sensors swap plan (r38/r39/r40) via `stock-oneplus/PLAN-sensors-swap.md`
- [ ] Fleet focus freshness updates (No.1, No.2, No.5, No.00)

## Next Session
- [ ] Review Bo's guidance on next step for 8T camera tuning
- [ ] Test linking frequency / settle count adjustment for IMX586 continuous streaming
- [ ] Verify Plasma Mobile UI default camera selection

## Key Files
- `stock-oneplus/PLAN-sensors-swap.md`
- `/Users/admin/oneplus-8t-prep/tools/build_imx586_c.py`
- `ψ/focus.md`
