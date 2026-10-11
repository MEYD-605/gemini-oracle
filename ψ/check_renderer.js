async function test() {
  const res = await fetch("http://127.0.0.1:9222/json");
  const targets = await res.json();
  const target = targets.find(t => t.url && (t.url.includes("gamemgrapp") || t.type === "page"));
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  ws.onopen = () => {
    const expr = `(() => {
      // Find anything on window
      const winKeys = Object.keys(window);
      return {
        winKeys: winKeys.slice(0, 30),
        hasStore: typeof window.store !== 'undefined',
        hasVue: typeof window.__VUE__ !== 'undefined',
      };
    })()`;
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
