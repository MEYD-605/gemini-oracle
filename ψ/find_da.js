const fs = require('fs');

const asarPath = 'C:\\Program Files\\OneXConsole\\resources\\app.asar';
const buf = fs.readFileSync(asarPath);
const str = buf.toString('latin1');

const idx = 15545788; // Where Sa is defined
const windowStart = Math.max(0, idx - 8000);
const windowStr = str.slice(windowStart, idx);

// Search for da= or da =
const reDa = /(da\s*=\s*[^;,\n]+)/g;
let m;
while ((m = reDa.exec(windowStr)) !== null) {
  console.log('da assignment:', m[0]);
}

// Search for w= or w =
const reW = /([a-zA-Z0-9_$]+\s*=\s*[^;,\n]*invoke\([^)]*\))/g;
while ((m = reW.exec(windowStr)) !== null) {
  console.log('invoke assignment:', m[0]);
}

// Let's also check o.default.supportFunc
console.log('o.default.supportFunc search:');
let funcIdx = str.indexOf('supportFunc', 15000000);
if (funcIdx !== -1) {
  console.log(str.slice(funcIdx - 100, funcIdx + 300));
}
