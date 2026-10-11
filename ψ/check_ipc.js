async function test() {
  const res = await fetch("http://127.0.0.1:9222/json");
  const targets = await res.json();
  const target = targets.find(t => t.url && (t.url.includes("gamemgrapp") || t.type === "page"));
  console.log("Connecting to:", target.url);
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  ws.onopen = () => {
    const expr = `({
      hasIpcRenderer: typeof window.ipcRenderer !== 'undefined',
      hasRequire: typeof window.require !== 'undefined',
      ipcKeys: window.ipcRenderer ? Object.keys(window.ipcRenderer) : null
    })`;
    ws.send(JSON.stringify({
      id: 1,
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
