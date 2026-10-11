const fs = require('fs');

const asarPath = 'C:\\Program Files\\OneXConsole\\resources\\app.asar';
const buf = fs.readFileSync(asarPath);
const str = buf.toString('latin1');

function printAround(idx, lenBefore = 100, lenAfter = 1200) {
  const start = Math.max(0, idx - lenBefore);
  const end = Math.min(str.length, idx + lenAfter);
  console.log(str.slice(start, end));
}

console.log('=== rgbSelected around 15637559 ===');
printAround(15637559, 50, 1000);

console.log('\n=== rgbSetLightLevel around 15638223 ===');
printAround(15638223, 50, 800);

console.log('\n=== setRGBEnable around 16058519 ===');
printAround(16058519, 50, 800);
