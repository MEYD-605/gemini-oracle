const fs = require('fs');

const asarPath = 'C:\\Program Files\\OneXConsole\\resources\\app.asar';
const buf = fs.readFileSync(asarPath);
const str = buf.toString('latin1');

// Look for w = or var w = or const w = near 15545000 backwards
let idx = 15545702;
console.log(str.slice(idx - 1500, idx));
