# 🍺 maw-beer-break

> **"The Oracle Keeps the Human Human"**  
> CLI Altar & Burnout Guard for context-switching to beer. Designed for P'Nat's Quiz day (Topic: *"ชวน Oracle กินเบียร์"*).

---

## 🔮 Core Concept & Insights

Derived from the distillation of P'Nat's brain (`Soul-Brews-Studio/opensource-nat-brain-oracle`):
1. **AI Life Buddy**: AI should reduce workload so the human has time to live, read, and drink beer (*"Create AI to reduce work -> Have time for beer + reading + living"*).
2. **Burnout Prevention**: Context-switching between code and beer brewing/tasting prevents cognitive exhaustion, enabling deep sustainable flow (*"Beer <-> Code switching prevents burnout"*).
3. **The Life Arc**: Before Beer (burnout) -> Beer Era (community, lost tech edge) -> Balanced Now (90% code, 10% beer). This tool helps monitor this balance.
4. **Trust Signals**: Mentioning beer acts as a warm trust signal in collaborative workflows.

This CLI tool implements these insights by offering a **Burnout Guard** that monitors active session hours and git commit activity, warning when cognitive fatigue sets in. It then offers a **CLI Altar** where the human can select a custom Chiang Mai craft recipe, play pentatonic Torii bells, see a pouring animation, and record the context switch in the permanent logs under the principle **"Nothing is Deleted"**.

---

## 🚀 Commands & Features

### 1. `maw beer-break check`
Analyzes current git repository logs and coding duration to calculate a **Burnout Risk Index (0-100%)**. 
If risk is critical, it halts execution and directs the developer to the altar.
```bash
maw beer-break check --session-hours 3.5
```

### 2. `maw beer-break pour`
Triggers the interactive Altar:
- Synthesizes and plays a 6-note **Pentatonic Bell Melody** `[C4 -> D4 -> E4 -> G4 -> A4 -> C5]` using the system bell (`\x07`) to clear mental clutter.
- Renders a real-time **ASCII Glass Pouring Animation** with bubbling liquid and foam.
- Logs the moment under `ψ/memory/logs/beer-moments.jsonl` under the *"Nothing is Deleted"* principle.
```bash
maw beer-break pour --recipe 1
```

### 3. `maw beer-break recipes`
Displays detailed descriptions of P'Nat's brain-aligned recipes:
1. **Snow Mash Wheat (Batch 001)** — Wheat Ale with Maillard complexity (honey aroma without honey).
2. **Lager-ithm** — Clean lager to clear the developer stack.
3. **IP-Address IPA** — Double dry-hopped citrus blast for creative burst.
4. **Byte Stout** — Chiang Mai coffee bean espresso stout for all-nighter recovery.
5. **Sour Code** — Unpredictable tart ale with Chiang Mai Maker Club garden wild yeast.
```bash
maw beer-break recipes
```

### 4. `maw beer-break stats`
Reads the chronicle logs (`beer-moments.jsonl`) to compute your favorite brews, break frequencies, and your **Life Arc Balance Score**.
```bash
maw beer-break stats
```

---

## 🛠️ Installation & Local Setup

To link this plugin to your `maw` installation:
```bash
ln -sf /root/Code/github.com/MEYD-605/gemini-oracle/maw-beer-break /root/.maw/plugins/beer-break
```

Verify the installation:
```bash
maw beer-break help
```

---

*Built by 🤖 No.6 Gemini from ai-core (Antigravity CLI Agent)*
