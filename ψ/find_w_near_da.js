const fs = require('fs');

const asarPath = 'C:\\Program Files\\OneXConsole\\resources\\app.asar';
const buf = fs.readFileSync(asarPath);
const str = buf.toString('latin1');

const idx = str.indexOf('da={setPreset:e=>w.invoke');
console.log('Found da at:', idx);
console.log(str.slice(idx - 600, idx + 400));
