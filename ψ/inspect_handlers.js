const fs = require('fs');

const asarPath = 'C:\\Program Files\\OneXConsole\\resources\\app.asar';
const buf = fs.readFileSync(asarPath);
const str = buf.toString('latin1');

const handlers = [
  'setRGBEnable',
  'rgbSetLightLevel',
  'rgbSelected',
  'rgbPartitionSelected',
  'toDisableRgb'
];

for (const h of handlers) {
  console.log(`\n=== HANDLER: ${h} ===`);
  let idx = 0;
  while ((idx = str.indexOf(h, idx)) !== -1) {
    const start = Math.max(0, idx - 100);
    const end = Math.min(str.length, idx + 400);
    const snippet = str.slice(start, end);
    if (snippet.includes('ipcMain') || snippet.includes('ipcRenderer') || snippet.includes('function') || snippet.includes('=>')) {
      console.log('--- Occurrence at', idx, '---');
      console.log(snippet.replace(/[\r\n]+/g, ' '));
    }
    idx += h.length;
  }
}
