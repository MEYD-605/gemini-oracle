# maclab Bo personal — Grok image/video from stored face refs

**Trigger:** Bo asks “ทำรูปจากหน้าที่เก็บไว้”, face-swap, personal likeness, Grok video, or whether maclab can still gen media.

## Canonical vault (machine truth)

| Item | Path |
|------|------|
| Zone root | `lord-knight-oracle/ψ/data/maclab-home/bo-personal/` |
| Face refs | `.../bo-personal/face-reference/` + `face-reference/manifest.json` |
| Primary refs | `03-grok_image_1782248549405.jpg`, `06-IMG_20260529_171346.png` |
| Edit outputs | `.../bo-personal/edits/` + `edits/manifest.json` |
| Policy | `bo-personal/CONSTRUCTURE.md`, `bo-personal/infra.md` |

**Verify files exist** before claiming “เก็บเมื่อวานยังอยู่”:

```bash
REF="$HOME/Code/github.com/MEYD-605/lord-knight-oracle/ψ/data/maclab-home/bo-personal/face-reference"
ls -la "$REF/03-grok_image_1782248549405.jpg" "$REF/06-IMG_20260529_171346.png"
```

## Grok Imagine (correct lane for Bo likeness)

Grok skill: `~/.grok/skills/imagine/SKILL.md`

| Task | Tool | Rule |
|------|------|------|
| Bo face / likeness | `image_edit` + ref from `face-reference/` | **Never** `image_gen` from scratch for named real person |
| New generic scene (no Bo face) | `image_gen` | OK when not likeness |
| Video | No text-to-video | **`image_edit` frame first** → `image_to_video` per shot (6s/10s) → `ffmpeg -f concat -c copy` on maclab |

**Real people video:** reference-first — animate from a composed frame that used `image_edit` with vault refs.

## Hermes No.5 DM vs Grok (do not conflate)

| Channel | Engine | Bo face work |
|---------|--------|----------------|
| Hermes DM (`~/.hermes-no5`, this profile) | e.g. FAL `image_generate` in Hermes tools | Not Grok Imagine; for Bo likeness prefer **Grok** or explicit ref paths |
| Grok Build / `00-gmgrok` tmux | `image_edit` / `image_to_video` | **Canonical** for vault-aligned personal media |

When Bo says “Grok ทำได้หมดทั้งรูปทั้งวีดีโอ” — affirm **Grok path** + vault refs; clarify Hermes is a separate lane unless user wants delegate to Grok.

## Local maclab services (verify, do not assume)

| Capability | Typical prove |
|------------|----------------|
| ffmpeg post | `command -v ffmpeg` |
| ComfyUI `:8188` | `pgrep -fl ComfyUI` or listen on 8188 — **often absent** on maclab; not required for Grok cloud gen |
| GPU | `system_profiler SPDisplaysDataType` · `load-guard` / `~/.maw/gpu-incident.active` |

**Pitfall:** Answering “ทำรูปได้ไหม” from memory about ComfyUI — always probe host. Bo personal workflow in production has been **Grok `image_edit`** (see `edits/manifest.json`).

## Report shape (Bo DM, Thai)

1. Refs on disk (paths + count from manifest)
2. รูป: Grok `image_edit` + which primary ref
3. วิดีโอ: shot plan → edit frame → `image_to_video` → ffmpeg
4. ถ้าจะทำเลย: ถาม aspect (9:16 / 16:9) + สไตล์/ฉาก

Unhealthy media infra (disk full, gpu-incident) → `maclab:01-lord-knight`, not alarm Bo unless tagged.