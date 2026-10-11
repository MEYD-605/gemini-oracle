// cdp_rgb.js - OneXConsole Hardware RGB Controller via Chrome DevTools Protocol (CDP)
// Author: No.6 Gemini for ClubSGame

const COLOR_MAP = {
  cyan:   [0, 255, 230, 2],
  normal: [0, 255, 230, 2],
  orange: [255, 120, 0, 3],
  amber:  [255, 120, 0, 3],
  mobile: [255, 120, 0, 3],
  red:    [255, 0, 0, 4],
  alert:  [255, 0, 0, 4],
  green:  [0, 255, 0, 3],
  bypass: [0, 255, 120, 2],
  blue:   [0, 100, 255, 3],
  purple: [160, 0, 255, 3],
  joker:  [160, 0, 255, 3],
};

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.log("Usage: node cdp_rgb.js <color_name|off|r g b [level]>");
    console.log("Examples: node cdp_rgb.js cyan | node cdp_rgb.js red | node cdp_rgb.js off | node cdp_rgb.js 0 255 230 4");
    process.exit(0);
  }

  let mode = "color";
  let r = 0, g = 255, b = 230, level = 2;
  let presetId = 1;
  const first = args[0].toLowerCase();

  if (first === "off") {
    mode = "off";
  } else if (first === "preset") {
    mode = "preset";
    presetId = parseInt(args[1] || "1", 10);
  } else if (COLOR_MAP[first]) {
    [r, g, b, level] = COLOR_MAP[first];
    if (args[1] && !isNaN(parseInt(args[1], 10))) {
      level = parseInt(args[1], 10);
    }
  } else if (!isNaN(parseInt(args[0], 10)) && args.length >= 3) {
    r = parseInt(args[0], 10);
    g = parseInt(args[1], 10);
    b = parseInt(args[2], 10);
    if (args[3] && !isNaN(parseInt(args[3], 10))) {
      level = parseInt(args[3], 10);
    }
  } else {
    console.error("Unknown color or command:", first);
    process.exit(1);
  }

  // Safety clamps
  r = Math.max(0, Math.min(255, r));
  g = Math.max(0, Math.min(255, g));
  b = Math.max(0, Math.min(255, b));
  level = Math.max(1, Math.min(4, level));

  const timeout = setTimeout(() => {
    console.error("Timeout connecting to OneXConsole CDP (port 9222)");
    process.exit(1);
  }, 3000);

  try {
    const res = await fetch("http://127.0.0.1:9222/json");
    const targets = await res.json();
    let target = targets.find(t => t.url && t.url.includes("gamemgrapp"));
    if (!target) {
      target = targets.find(t => t.type === "page");
    }
    if (!target || !target.webSocketDebuggerUrl) {
      console.error("No valid OneXConsole page target found in CDP");
      clearTimeout(timeout);
      process.exit(1);
    }

    const ws = new WebSocket(target.webSocketDebuggerUrl);

    ws.onopen = () => {
      let expr;
      if (mode === "off") {
        expr = `(() => {
          if (!window.ipcRenderer) return { error: "no_ipc" };
          window.ipcRenderer.send("toDisableRgb");
          window.ipcRenderer.send("setRGBEnable", false);
          return { status: "OFF" };
        })()`;
      } else if (mode === "preset") {
        expr = `(() => {
          if (!window.ipcRenderer) return { error: "no_ipc" };
          window.ipcRenderer.send("setRGBEnable", true);
          window.ipcRenderer.send("rgbSetLightLevel", 4);
          window.ipcRenderer.send("rgbSelected", JSON.stringify({
            mode: 1,
            rgbId: ${presetId},
            rgbValue: ${presetId}
          }), false);
          return { status: "PRESET", presetId: ${presetId} };
        })()`;
      } else {
        expr = `(() => {
          if (!window.ipcRenderer) return { error: "no_ipc" };
          window.ipcRenderer.send("setRGBEnable", true);
          window.ipcRenderer.send("rgbSetLightLevel", ${level});
          const payload = JSON.stringify({
            mode: 2,
            rgbId: 2,
            rgbValue: { r: ${r}, g: ${g}, b: ${b} }
          });
          window.ipcRenderer.send("rgbSelected", payload, false);
          window.ipcRenderer.send("rgbSelected", payload, true);
          return { status: "OK", r: ${r}, g: ${g}, b: ${b}, level: ${level} };
        })()`;
      }

      ws.send(JSON.stringify({
        id: 2002,
        method: "Runtime.evaluate",
        params: { expression: expr, returnByValue: true }
      }));
    };

    ws.onmessage = (evt) => {
      clearTimeout(timeout);
      try {
        const data = JSON.parse(evt.data);
        if (data.id === 2002) {
          const val = data.result?.result?.value;
          console.log("RGB Result:", JSON.stringify(val));
          ws.close();
          process.exit(0);
        }
      } catch (err) {
        console.error("Parse error:", err);
        ws.close();
        process.exit(1);
      }
    };

    ws.onerror = (err) => {
      clearTimeout(timeout);
      console.error("WebSocket error:", err);
      process.exit(1);
    };

  } catch (err) {
    clearTimeout(timeout);
    console.error("Fetch error:", err.message);
    process.exit(1);
  }
}

main();
