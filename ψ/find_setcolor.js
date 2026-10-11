const fs = require('fs');

const asarPath = 'C:\\Program Files\\OneXConsole\\resources\\app.asar';
const buf = fs.readFileSync(asarPath);
const str = buf.toString('latin1');

// Search for Sa.setColor definition or where Sa is imported/defined
const matches = [];
let idx = 0;
while ((idx = str.indexOf('.setColor(', idx)) !== -1) {
  const start = Math.max(0, idx - 100);
  const end = Math.min(str.length, idx + 200);
  matches.push({ idx, snippet: str.slice(start, end).replace(/[\r\n]+/g, ' ') });
  idx += 10;
}

console.log(str.slice(15545500, 15547500));
