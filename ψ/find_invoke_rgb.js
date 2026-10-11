const fs = require('fs');

const asarPath = 'C:\\Program Files\\OneXConsole\\resources\\app.asar';
const buf = fs.readFileSync(asarPath);
const str = buf.toString('latin1');

let idx = 0;
while ((idx = str.indexOf('.invoke("/rgb/', idx)) !== -1) {
  const start = Math.max(0, idx - 150);
  const end = Math.min(str.length, idx + 150);
  console.log(`[${idx}] ${str.slice(start, end).replace(/[\r\n]+/g, ' ')}`);
  idx += 15;
}
