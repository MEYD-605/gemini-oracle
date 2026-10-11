async function test() {
  const res = await fetch("http://127.0.0.1:9222/json");
  const targets = await res.json();
  const target = targets.find(t => t.url && (t.url.includes("gamemgrapp") || t.type === "page"));
  console.log("Connecting to:", target.url);
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  ws.onopen = () => {
    const expr = `(() => {
      try {
        window.ipcRenderer.send("setRGBEnable", true);
        window.ipcRenderer.send("rgbSetLightLevel", 4);
        window.ipcRenderer.send("rgbSelected", JSON.stringify({
          mode: 2,
          rgbId: 2,
          rgbValue: { r: 0, g: 255, b: 230 }
        }), false);
        window.ipcRenderer.send("rgbSelected", JSON.stringify({
          mode: 2,
          rgbId: 2,
          rgbValue: { r: 0, g: 255, b: 230 }
        }), true);
        return { success: true };
      } catch (e) {
        return { error: e.message };
      }
    })()`;
    ws.send(JSON.stringify({
      id: 2,
      method: "Runtime.evaluate",
      params: { expression: expr, returnByValue: true }
    }));
  };
  ws.onmessage = (evt) => {
    console.log("Result:", evt.data);
    ws.close();
    process.exit(0);
  };
}
test();
