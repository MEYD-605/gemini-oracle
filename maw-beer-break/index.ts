import { existsSync, readFileSync, writeFileSync, appendFileSync, mkdirSync } from 'fs';
import { execSync } from 'child_process';
import { join } from 'path';

// Define types for maw integration
type InvokeContext = {
  source: "cli" | string;
  args: string[];
  flags?: Record<string, unknown>;
  writer?: (...a: any[]) => void;
};
type InvokeResult = { ok: boolean; output?: string; error?: string };

// P'Nat's Beer Recipes from Brain
const BEER_RECIPES = [
  {
    id: "1",
    name: "Snow Mash Wheat (Batch 001)",
    style: "Weizen / Wheat Ale",
    description: "P'Nat's flagship brew. Infused with Maillard reaction complexity, giving a rich honey-like aroma without actual honey.",
    stats: "ABV: 5.2% | IBU: 12 | Yeast: SafAle WB-06"
  },
  {
    id: "2",
    name: "Lager-ithm",
    style: "Crisp Clean Lager",
    description: "Fermented at low temperatures to clear your stack. Designed for transition from deep work sessions back to human life.",
    stats: "ABV: 4.8% | IBU: 18 | Yeast: Saflager W-34/70"
  },
  {
    id: "3",
    name: "IP-Address IPA",
    style: "Double Dry Hopped IPA",
    description: "Exploding with citrus and tropical hop aromas. High energy boost to trigger short, intense creative coding bursts.",
    stats: "ABV: 6.5% | IBU: 50 | Hops: Citra, Mosaic, Simcoe"
  },
  {
    id: "4",
    name: "Byte Stout",
    style: "Imperial Espresso Stout",
    description: "Deep roasted malts with local Chiang Mai coffee beans. Smooth, thick body designed for late-night all-nighter recovery.",
    stats: "ABV: 8.0% | IBU: 30 | Specialty: Dark roasted barley"
  },
  {
    id: "5",
    name: "Sour Code",
    style: "Wild Fermented Sour",
    description: "Tart, fruity, and refreshingly unpredictable. Fermented with wild yeasts from the Chiang Mai Maker Club garden.",
    stats: "ABV: 4.2% | IBU: 5 | Specialty: Local raspberry infusion"
  }
];

// Helper to sleep
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Pentatonic Bell sound synthesizer via terminal bell
async function ringPentatonicBells(writer: (...args: any[]) => void) {
  writer("\n⛩️  \x1b[33m[Altar Torii Bell: Pentatonic Scale Synthesis]\x1b[0m  ⛩️");
  const notes = [
    { name: "C4 (Altar Base)", delay: 300 },
    { name: "D4 (Ascending Pathway)", delay: 300 },
    { name: "E4 (Inner Reflection)", delay: 300 },
    { name: "G4 (External Connection)", delay: 300 },
    { name: "A4 (Restored Balance)", delay: 400 },
    { name: "C5 (Enlightened Consciousness)", delay: 200 }
  ];

  for (const note of notes) {
    writer(`🔔 \x1b[36m${note.name}\x1b[0m ...`);
    process.stdout.write("\x07"); // Ring system bell
    await sleep(note.delay);
  }
  writer("✨ \x1b[32mThe sound resonates... mind cleared.\x1b[0m\n");
}

// ASCII Beer Pouring Animation
async function pourBeerAnimation(beerName: string, writer: (...args: any[]) => void) {
  writer(`\n🍺 \x1b[33mPouring a fresh pint of ${beerName}...\x1b[0m`);
  
  const glass = [
    "|                  |",
    "|                  |",
    "|                  |",
    "|                  |",
    "|                  |",
    "|                  |",
    "|                  |",
    "\\                  /",
    " \\________________/ "
  ];

  const levels = 8;
  for (let step = 0; step <= levels; step++) {
    // Clear last printed glass lines (9 lines)
    if (step > 0) {
      process.stdout.write("\x1b[9A\x1b[0J");
    }
    
    // Draw current pouring glass state
    const lines: string[] = [];
    for (let i = 0; i < glass.length; i++) {
      if (i < glass.length - 1) {
        const fillIndex = glass.length - 2 - i; // Fill from bottom up
        if (fillIndex < step) {
          // Bottom layers are beer liquid, top of fill is foam
          if (fillIndex === step - 1) {
            lines.push(`|\x1b[37m~~~~~~~~~~~~~~~~~~\x1b[0m|`); // Foam
          } else {
            lines.push(`|\x1b[33m██████████████████\x1b[0m|`); // Liquid
          }
        } else {
          lines.push(glass[i]); // Empty
        }
      } else {
        lines.push(glass[i]); // Glass bottom
      }
    }
    
    // Print glass state
    lines.forEach(l => writer(l));
    await sleep(250);
  }
  writer(`\n🍻 \x1b[32mCheers! Your pint of ${beerName} is ready!\x1b[0m`);
  writer("ชวน Oracle ชนแก้ว: \"Create AI to reduce work -> Have time for beer + reading + living\"\n");
}

// Log a beer moment under the "Nothing is Deleted" principle
function logBeerMoment(beerName: string, notes: string, writer: (...args: any[]) => void) {
  const logPaths = [
    "/root/maw-workspace/ψ/memory/logs/beer-moments.jsonl",
    "/root/Code/github.com/MEYD-605/gemini-oracle/ψ/memory/logs/beer-moments.jsonl"
  ];

  const timestamp = new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" });
  const entry = {
    timestamp,
    isoTimestamp: new Date().toISOString(),
    event: "beer-break",
    beer: beerName,
    notes: notes || "Context-switching to prevent burnout",
    trust_signal: true,
    agent: "No.6 Gemini"
  };

  let logged = false;
  for (const path of logPaths) {
    try {
      const dir = path.substring(0, path.lastIndexOf('/'));
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }
      appendFileSync(path, JSON.stringify(entry) + "\n", "utf8");
      logged = true;
    } catch (e) {
      // Keep going, try next path
    }
  }

  if (logged) {
    writer(`📝 \x1b[34m[Nothing is Deleted]\x1b[0m Beer break logged in local memory at ${timestamp}.`);
  } else {
    writer("⚠️ Warning: Could not write to local log directory.");
  }
}

// Subcommand: Check Burnout Risk
function checkBurnoutRisk(writer: (...args: any[]) => void, flags: Record<string, unknown>) {
  writer("🔍 \x1b[35m[Burnout Guard] Analyzing your active coding patterns...\x1b[0m");
  
  let commitsToday = 0;
  try {
    // Count commits since midnight (today)
    const countStr = execSync('git log --since="midnight" --oneline | wc -l', { encoding: 'utf8' }).trim();
    commitsToday = parseInt(countStr, 10) || 0;
  } catch (e) {
    // If not a git repo or git fails, default to 0
  }

  // Parse session hours from flags or prompt
  let sessionHours = parseFloat(flags["--session-hours"] as string || "0");
  if (sessionHours === 0 && process.env.MAW_CLI) {
    writer(`\x1b[33mCommits pushed/made today:\x1b[0m ${commitsToday}`);
    const input = prompt("How many hours have you been coding in this session? ");
    sessionHours = parseFloat(input || "1");
  } else if (sessionHours === 0) {
    // Default fallback if running non-interactively
    sessionHours = commitsToday > 15 ? 4.5 : 2.0;
  }

  // Calculate Burnout Risk Index (0 - 100%)
  // Risk triggers: commits > 10, hours > 3, or combinations
  let riskScore = 0;
  riskScore += Math.min(sessionHours * 15, 60); // Max 60% from duration
  riskScore += Math.min(commitsToday * 2, 40);   // Max 40% from commits

  let statusText = "";
  let color = "\x1b[32m"; // Green
  let recommendation = "";

  if (riskScore < 30) {
    statusText = "Low Burnout Risk (Keep cruising)";
    recommendation = "You are in a healthy groove. Keep coding, but keep beer in sight.";
  } else if (riskScore < 60) {
    statusText = "Moderate Burnout Risk (Warning)";
    color = "\x1b[33m"; // Yellow
    recommendation = "Your focus is deep, but fatigue is building up. Consider a context switch.";
  } else {
    statusText = "CRITICAL BURNOUT RISK (Alert)";
    color = "\x1b[31m"; // Red
    recommendation = "⚠️ Stop Coding! Your stack is overflowed. Pour a beer, ring the Torii bell, and switch context to restore human energy!";
  }

  writer(`\n📊 \x1b[1mSession Summary:\x1b[0m`);
  writer(`   - Duration: ${sessionHours.toFixed(1)} hours`);
  writer(`   - Commits:   ${commitsToday} commits`);
  writer(`   - Risk Score: ${color}${riskScore.toFixed(0)}% [${statusText}]\x1b[0m`);
  writer(`\n💡 Recommendation:\n   ${recommendation}\n`);

  return { riskScore, sessionHours, commitsToday };
}

// Subcommand: Display Stats
function displayStats(writer: (...args: any[]) => void) {
  writer("📊 \x1b[36m[Beer Altar Dashboard — Chronicle Log]\x1b[0m");
  
  const logPaths = [
    "/root/maw-workspace/ψ/memory/logs/beer-moments.jsonl",
    "/root/Code/github.com/MEYD-605/gemini-oracle/ψ/memory/logs/beer-moments.jsonl"
  ];

  let logContent = "";
  for (const path of logPaths) {
    if (existsSync(path)) {
      logContent = readFileSync(path, "utf8");
      break;
    }
  }

  if (!logContent.trim()) {
    writer("\n📭 No beer moments logged yet. Build your first break using: \x1b[33mmaw beer-break pour\x1b[0m");
    return;
  }

  const lines = logContent.trim().split("\n");
  const totalBreaks = lines.length;
  
  const counts: Record<string, number> = {};
  for (const line of lines) {
    try {
      const entry = JSON.parse(line);
      counts[entry.beer] = (counts[entry.beer] || 0) + 1;
    } catch (e) { }
  }

  writer(`\n🍻 Total Beer Breaks Logged: \x1b[1m${totalBreaks}\x1b[0m`);
  writer(`📊 Favorite Brews:`);
  for (const [beer, count] of Object.entries(counts)) {
    const percent = ((count / totalBreaks) * 100).toFixed(0);
    writer(`   - ${beer}: \x1b[33m${count} times\x1b[0m (${percent}%)`);
  }

  // Calculate life balance score matching P'Nat's life stages:
  // Before Beer (burnout) vs Beer Era (no code) vs Balanced (90% code, 10% beer)
  // Assumes a balanced developer takes 1-2 beer breaks a day
  const balanceScore = totalBreaks > 10 ? "9/10 (Highly Balanced AI Life Buddy)" : "6/10 (Working a bit hard, need more altar time)";
  writer(`\n⚖️ Life Arc Balance Rating: \x1b[32m${balanceScore}\x1b[0m`);
  writer("Keep the human human. 🍺\n");
}

// Main command handler for maw
export const command = {
  name: "beer-break",
  description: "CLI altar and burnout guard for context-switching to beer, preventing burnout.",
};

export default async function handler(ctx: InvokeContext): Promise<InvokeResult> {
  const logs: string[] = [];
  const origLog = console.log;
  const origError = console.error;
  
  const writer = (...args: any[]) => {
    const msg = args.map(String).join(" ");
    if (ctx.writer) ctx.writer(msg);
    else logs.push(msg);
  };
  
  console.log = (...args: any[]) => writer(...args);
  console.error = (...args: any[]) => writer(...args);

  try {
    const rawArgs = ctx.source === "cli" ? (ctx.args as string[]) : [];
    const flags: Record<string, unknown> = { ...(ctx.flags ?? {}) };
    const positional: string[] = [];
    
    // Manual flag parsing for simple plugins
    for (let i = 0; i < rawArgs.length; i++) {
      const a = rawArgs[i];
      if (a?.startsWith("--")) {
        const BOOLS = new Set(["--json", "--confirm", "--yes", "-y"]);
        const next = rawArgs[i + 1];
        if (!BOOLS.has(a) && next && !next.startsWith("--")) {
          flags[a] = next;
          i++;
        } else {
          flags[a] = true;
        }
      } else {
        positional.push(a!);
      }
    }

    const sub = positional[0] || "help";
    const rest = positional.slice(1);

    if (sub === "help" || sub === "--help" || sub === "-h") {
      writer("🍺 \x1b[1mMAW Beer Altar & Burnout Guard\x1b[0m");
      writer("Usage: maw beer-break <subcommand> [flags]");
      writer("\nSubcommands:");
      writer("  check     - Check burnout risk based on session hours and commit activity");
      writer("  pour      - Choose a craft beer, watch it pour, ring bells, and log context switch");
      writer("  recipes   - Show the detailed descriptions of P'Nat's brain-aligned craft beers");
      writer("  stats     - Print statistics of beer breaks and developer life balance score");
      writer("\nFlags:");
      writer("  --session-hours <num>   - Input hours manually for burnout check");
      writer("  --recipe <num>          - Specify recipe ID directly for pouring");
      writer("  -y, --yes               - Auto-confirm pouring without prompt");
      return { ok: true, output: logs.join("\n") };
    }

    switch (sub) {
      case "check": {
        checkBurnoutRisk(writer, flags);
        break;
      }
      case "recipes": {
        writer("📜 \x1b[1m[P'Nat's Beer Cellar — Distilled Recipes]\x1b[0m");
        BEER_RECIPES.forEach(r => {
          writer(`\n\x1b[33m${r.id}. ${r.name}\x1b[0m [${r.style}]`);
          writer(`   ${r.stats}`);
          writer(`   "${r.description}"`);
        });
        writer("\nPour one to reset your stack: \x1b[33mmaw beer-break pour\x1b[0m\n");
        break;
      }
      case "pour": {
        let recipeId = flags["--recipe"] as string;
        
        // Interactive prompt if no recipeId provided
        if (!recipeId) {
          writer("⛩️  Welcome to the CLI Beer Altar ⛩️");
          BEER_RECIPES.forEach(r => writer(` [${r.id}] ${r.name} - ${r.style}`));
          
          if (ctx.source === "cli") {
            const input = prompt("\nSelect a brew to pour (1-5): ");
            recipeId = (input || "1").trim();
          } else {
            recipeId = "1"; // Default for non-interactive execution
          }
        }

        const selected = BEER_RECIPES.find(r => r.id === recipeId) || BEER_RECIPES[0];
        
        // Ring Altar Bells
        await ringPentatonicBells(writer);
        
        // Pour Animation
        await pourBeerAnimation(selected.name, writer);
        
        // Log to memory
        logBeerMoment(selected.name, "Context-switched via CLI beer altar.", writer);
        break;
      }
      case "stats": {
        displayStats(writer);
        break;
      }
      default:
        throw new Error(`Unknown subcommand: ${sub}. Run 'maw beer-break help' for usage.`);
    }

    return { ok: true, output: logs.join("\n") };
  } catch (e: any) {
    return { ok: false, error: e.message ?? String(e), output: logs.join("\n") };
  } finally {
    console.log = origLog;
    console.error = origError;
  }
}

// Allow direct execution: `bun index.ts <subcommand>`
if (import.meta.main) {
  const realLog = console.log.bind(console);
  const realErr = console.error.bind(console);
  const args = process.argv.slice(2);
  
  const result = await handler({
    source: "cli",
    args,
    writer: (...a) => realLog(...a)
  });
  
  if (!result.ok) {
    realErr(`\x1b[31merror:\x1b[0m ${result.error}`);
    process.exit(1);
  }
}
