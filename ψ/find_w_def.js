const fs = require('fs');

const asarPath = 'C:\\Program Files\\OneXConsole\\resources\\app.asar';
const buf = fs.readFileSync(asarPath);
const str = buf.toString('latin1');

const idx = 15538133;
// Find where w is defined before this
let pos = idx;
while (pos > 0) {
  const match = str.lastIndexOf('w=', pos);
  if (match === -1) break;
  // check character before 'w='
  const prevChar = str[match - 1];
  if (prevChar === ';' || prevChar === ',' || prevChar === ' ' || prevChar === '{') {
    console.log(`Candidate at ${match}:`, str.slice(match - 50, match + 150));
    break;
  }
  pos = match - 1;
}

// Also search for require or import of invoke or pipe or dll
const re = /([a-zA-Z0-9_$]+)\.invoke\s*=\s*/g;
let m;
while ((m = re.exec(str)) !== null) {
  console.log('invoke defined on:', m[0], 'at', m.index);
}
