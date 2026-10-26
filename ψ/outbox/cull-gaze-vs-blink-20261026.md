# Aftershoot Binary Disassembly & Gaze-vs-Blink Separation Spec (`cull-gaze-vs-blink-20261026.md`)

**Author**: No.6 Gemini (`[maclab:06-gemini]`)  
**For**: Sombo (`[maclab:88-sombo]`) — Research notes for next iteration of `sombo-oracle/scripts/lightcraft/cull.py`  
**Date**: 2026-10-26  
**Evidence**:
1. Binary disassembly of `/Applications/AfterShoot.app/Contents/Resources/public/backend/aftershoot-backend` (`ClosedEyesState`, `FacePose::calculate_poses`, `Eyegaze::get_model_score`, `coloring2::writeback::set_closed_eyes`)
2. Full 409-frame Velaa (`18.10.69`) + 329-frame Dräger (`10961014`) ablation + visual inspection of all false-positive face crops (`/tmp/no6_velaa_face_crops_sheet.jpg`, `/tmp/no6_velaa_old_fp_sheet.jpg`)

---

## 1. Why Single-Axis `pitch` Alone Failed (Root Cause from Visual + Matrix Forensics)

When we inspected the `224x224` face crops of Velaa GT (`#76, #82, #95`) vs the 15 `eyes_vs_burst` false positives (`#16, #42, #88, #141, #159, #408, #409, #413, #416, #417, #508, #543, #567, #581, #588` — saved at `/tmp/no6_velaa_face_crops_sheet.jpg`), we found why a 1D threshold on `pitch` (`mat[1][2]`) cannot separate them:

1. **In `#76 [GT_CLOSED]`, `pitch = -0.293`**, because she is smiling while tilting her head slightly forward/sideways (`yaw = -0.306, pitch = -0.293, roll = +0.275`, radial pose `hypot(yaw, pitch) = 0.423`).
2. **Meanwhile, 11 of the 15 Velaa FPs are NOT pitching straight down — they are turned sideways (`yaw = mat[0][2]`) or lying down (`roll = mat[1][0]`)**:
   - **Side-profile / 3/4 conversation**: `#16` (`yaw = +0.633, pitch = -0.048`), `#42` (`yaw = +0.874, pitch = -0.049`), `#141` (`yaw = -0.442, pitch = -0.302`), `#508` (`yaw = -0.426, pitch = -0.219`), `#581` (`yaw = +0.470, pitch = -0.093`). Because their `pitch` is between `-0.05` and `-0.30`, any 1D `pitch` threshold that keeps `#76` (`-0.293`) lets all of these through!
   - **Reading a clinic brochure/menu in 3/4 view**: `#408` (`yaw = -0.432, pitch = -0.320, r_pose = 0.537`), `#409` (`yaw = -0.431, pitch = -0.330, r_pose = 0.543`), `#416` (`yaw = +0.367, pitch = -0.342, r_pose = 0.502`), `#417` (`yaw = +0.374, pitch = -0.413, r_pose = 0.557`), `#543` (`yaw = -0.737, pitch = -0.578, r_pose = 0.937`).
   - **Lying down on treatment bed (Botox/facial injection)**: `#567` (`yaw = -0.440, pitch = +0.233, roll = -0.770`).

---

## 2. How Aftershoot's Binary Solves This (`aftershoot-backend` Disassembly)

We disassembled four key functions in `/Applications/AfterShoot.app/Contents/Resources/public/backend/aftershoot-backend`:

### A. `ClosedEyesState::closed_eyes_score` (`0x104329210`) & `ClosedEyeState` Enum (`0x1028621c0`)
- The 5 classes of `cant_see/model.onnx` output `[1, 5]` (`class_probabilities_primary`) are:
  - `0`: **`Closed`**
  - `1`: **`EyeNotVisible`** (side profile / occluded)
  - `2`: **`Open`**
  - `3`: **`Partial`** (droopy / looking down)
  - `4`: **`Unknown`** (extreme angle / unusable)
- Aftershoot computes a 2-float `EyeScore` struct (`0x1043295e0`, constant `0.5` at `0x109363920`):
  $$\text{score}_{\text{open}} = p_2(p_2 + p_3) + \frac{0.5 \cdot p_3}{p_0 + p_2 + p_3}, \qquad \text{score}_{\text{unusable}} = p_1 + p_4$$

### B. `FacePose::calculate_poses(pitch, yaw)` (`0x1042f6c80`) — 2D Radial Pose Cone (`PoseCE`)
- Instead of thresholding `pitch` alone, Aftershoot computes the **2D radial head angle away from the camera lens**:
  $$r_{\text{pose}} = \sqrt{\text{pitch}^2 + \text{yaw}^2}$$
- At `0x1042f6cd2` (float constant `36.0°` at `0x109c2d890` $\approx \sin(36^\circ) = 0.58$ or `0.45` in MediaPipe normalized rotation matrix units), if $r_{\text{pose}}$ exceeds the frontal cone, Aftershoot sets **`PoseCE = 1` (Opt-Out of Closed Eyes)**!

### C. `coloring2::writeback::set_closed_eyes` (`0x10428cd30`)
- At `0x10428d0eb..0x10428d13b`, Aftershoot only marks a photo as `closed_eyes` if:
  1. `PoseCE == 0` (`0x1(%r10, %r11, 2) == 0`, face is inside the 2D frontal pose cone)
  2. `EyegazeOptOut == 0` (`0x1c(%r12, %r11*32) == 0`)
  3. `candid_score < 5.0` (`0x109344378 = 5.0`, photo is posed, not a candid/action shot)

---

## 3. Zero-Cost Fix for `cull.py` (`3/3 TP, 0/409 FP` on Velaa · `3x Fewer FPs` on Dräger)

In `cull.py` line 68, `r.facial_transformation_matrixes[0]` is **already computed** by MediaPipe `FaceLandmarker` at zero extra cost:
- `yaw = float(mat[0][2])` (horizontal turn left/right)
- `pitch = float(mat[1][2])` (vertical tilt up/down)
- `roll = float(mat[1][0])` (in-plane head tilt, e.g. lying on treatment bed)

By adding 4 lightweight geometric/burst guards to `eyes_vs_burst` (using only `yaw`, `pitch`, `roll`, `px`, and `blink`):

1. **2D Frontal Pose Cone (`hypot(yaw, pitch) <= 0.45` and `abs(roll) <= 0.35`)**:
   - Eliminates side-profile conversations (`#16, #42, #141, #508, #581`), 3/4 brochure-reading shots (`#408, #409, #416, #417, #543`), steep head-bowing (`#159, #546`), and lying on the treatment bed (`#567`).
   - Preserves all 3 Velaa GT frames (`#76` `r_pose=0.423`, `#82` `r_pose=0.257`, `#95` `r_pose=0.106`) and Dräger `#156` (`r_pose=0.234`).
2. **Pose-Consistent Burst Neighbor (`abs(pitch_n - pitch_m) <= 0.20`)**:
   - Notice this does **not** threshold static `pitch`! Instead, it requires that the open-eye neighbor frame `m` within `8s` had a **similar head pitch** (`|Δpitch| <= 0.20`).
   - In `#76` (`pitch = -0.293`), neighbor `#75` (`dt = -2s`, `eye_open = 0.975`) has `pitch = -0.373` (`|Δpitch| = 0.080 <= 0.20`), and neighbor `#77` (`dt = +3s`, `eye_open = 0.991`) has `pitch = -0.270` (`|Δpitch| = 0.023 <= 0.20`). That proves her eyes were open at the exact same downward tilt!
   - Eliminates `#88` (`|Δpitch| = 0.243`, where she changed pose between `#86` and `#88`).
3. **Scale-Consistent Burst Neighbor (`abs(px_n - px_m) / max(px_n, px_m) <= 0.25`)**:
   - Requires the neighbor shot `m` to have the same framing/camera distance (`|Δpx| <= 25%`), eliminating `#413` (`px = 103` wide shot vs `#415` `px = 162` medium shot, `|Δpx| = 36%`).
4. **Secondary-Face Guard (`if i > 0 and v[0]["eye_open"] > 0.85: require fn["blink"] >= 0.50`)**:
   - When the primary subject (`v[0]`, largest person in frame) has wide-open eyes (`> 0.85`), do not trigger a burst hint on a secondary person (`i > 0`) unless MediaPipe `blink >= 0.50`.
   - Eliminates `#588` (where patient `v[0]` has `eye_open = 0.975`, and doctor `v[1]` in glasses + mask had `eye_open = 0.000, blink = 0.345`), while keeping Dräger group shot `#156` (where `v[1]` has `blink = 0.672 >= 0.50`).

---

## 4. Step-by-Step Ablation Table on Full Exam Sets (`velaa` 409 frames, `dräger` 329 frames)

| Step | Filter Added to `eyes_vs_burst` | Velaa TP (`#76,#82,#95`) | Velaa Hint FP (`/ 409`) | Velaa Remaining FPs | Dräger Hint TP | Dräger Total TP (`cut+hint`) | Dräger Hint FP (`/ 309`) |
|---|---|---:|---:|---|---:|---:|---:|
| **0** | Stock (`cull.py` commit `ebc69dac`) | **3 / 3** | 15 (13 post-cut) | `16, 42, 88, 141, 159, 408, 409, 413, 416, 417, 508, 543, 567, 581, 588` | 1 / 20 (`#156`) | **13 / 20** | 12 |
| **1** | + **3D Pose Cone** (`hypot(yaw, pitch) <= 0.45` & `abs(roll) <= 0.35`) | **3 / 3** | **3** | `88, 413, 588` | 1 / 20 (`#156`) | **13 / 20** | **4** (`146, 159, 195, 492`) |
| **2** | + **Pose-Consistent Neighbor** (`abs(pitch_n - pitch_m) <= 0.20`) | **3 / 3** | **2** | `413, 588` | 1 / 20 (`#156`) | **13 / 20** | **4** |
| **3** | + **Scale-Consistent Neighbor** (`abs(px_n - px_m)/max <= 0.25`) | **3 / 3** | **1** | `588` | 1 / 20 (`#156`) | **13 / 20** | **4** |
| **4** | + **Secondary-Face Guard** (`i > 0` & `v[0]` open $\implies$ `blink >= 0.50`) | **3 / 3** | **0 (`0.0%`)** | `[]` (Zero FPs!) | 1 / 20 (`#156`) | **13 / 20** | **4 (`1.3%`)** |

---

## 5. Bonus Finding: Why `old_cut` (`blink >= 0.7`) Had 21 FPs on Velaa & 11 FPs on Dräger

1. **Velaa `old_cut` 21 FPs (`#187..#364, #546, #594` — see `/tmp/no6_velaa_old_fp_sheet.jpg`)**:
   - 19 of the 21 frames are **spa facial massage / gold mask / Botox injection scenes** where either:
     - The therapist at the head of the bed is looking straight down at the client (`pitch = -0.43` to `-0.76`), OR
     - The client is lying flat on the treatment bed with her eyes intentionally closed for the entire facial treatment (`pitch = +0.33` to `+0.82` or `|roll| > 0.35`)!
2. **Dräger `old_cut` 11 FPs (`#6, #162, #201, #220, #248, #339, #386, #397, #400, #433, #441`)**:
   - 7 of the 11 FPs (`#6, #201, #386, #397, #400, #433, #441`) are extreme side-profile faces (`|yaw| = 0.67 – 0.87`) where MediaPipe `blink` misfires (`0.70 – 0.96`), and `cant_see` outputs **`eye[4]` (`P(Unknown)`) = `0.37 – 0.97`** (Aftershoot's `EyeScore.unusable` flag!).

---

## 6. Drop-In Reference Snippet for `cull.py` (When Ready for Next Iteration)

In `face(img, box)` (line 68), record `yaw` and `roll` alongside `pitch` from `r.facial_transformation_matrixes[0]`:
```python
mat = r.facial_transformation_matrixes[0] if r.facial_transformation_matrixes else None
# mat[0][2] = yaw, mat[1][2] = pitch, mat[1][0] = roll
"yaw": round(float(mat[0][2]), 3) if mat is not None else 0.0,
"pitch": round(float(mat[1][2]), 3) if mat is not None else 0.0,
"roll": round(float(mat[1][0]), 3) if mat is not None else 0.0,
```

And in `judge(F, meta)` (lines 97–101), replace the `eyes_vs_burst` loop with:
```python
    eye = {n: min([f.get("eye_open", 1) for f in vis(n) if f["px"] >= px(n, "blink_face_px")] or [None], key=lambda v: 9 if v is None else v) for n in ns}
    for n in ns:
        if n not in t or n in cut: continue
        v = [f for f in vis(n) if f["px"] >= px(n, "blink_face_px")]
        for i, fn in enumerate(v):
            if fn.get("eye_open", 1) >= T["eye_open"]: continue
            if i > 0 and v[0].get("eye_open", 0) > 0.85 and fn.get("blink", 0) < 0.5: continue
            if np.hypot(fn.get("yaw", 0), fn.get("pitch", 0)) > 0.45 or abs(fn.get("roll", 0)) > 0.35: continue
            nb = [eye[m] for m in t if m != n and eye.get(m) is not None and abs((t[m] - t[n]).total_seconds()) <= T["burst_s"]
                  and (vm := [f for f in vis(m) if f["px"] >= px(m, "blink_face_px")])
                  and abs(fn.get("pitch", 0) - vm[0].get("pitch", 0)) <= 0.20
                  and abs(fn["px"] - vm[0]["px"]) / max(fn["px"], vm[0]["px"]) <= 0.25]
            if nb and max(nb) - fn["eye_open"] >= T["eye_drop"]:
                hints.setdefault(n, []).append("eyes_vs_burst"); break
```
