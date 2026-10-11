const fs = require('fs');

const asarPath = 'C:\\Program Files\\OneXConsole\\resources\\app.asar';
console.log('Reading asar...');
const buf = fs.readFileSync(asarPath);
const str = buf.toString('latin1');
console.log('File size:', buf.length);

// Search for any ipcMain.handle or ipcMain.on
const reHandle = /ipcMain\.(handle|on)\s*\(\s*['"`]([^'"`]+)['"`]/g;
let m;
const handlers = new Set();
while ((m = reHandle.exec(str)) !== null) {
  handlers.add(`${m[1]}: ${m[2]}`);
}
console.log('Total IPC handlers found:', handlers.size);
console.log('Handlers matching rgb or program:', Array.from(handlers).filter(h => /rgb|program|light|led/i.test(h)));

// Search for any /rgb/ or rgb patterns
const reRgb = /['"`]([^'"`]*rgb[^'"`]*)['"`]/gi;
const rgbMatches = new Set();
while ((m = reRgb.exec(str)) !== null) {
  if (m[1].length < 80) rgbMatches.add(m[1]);
}
console.log('\nRGB string literals:', Array.from(rgbMatches).slice(0, 50));
