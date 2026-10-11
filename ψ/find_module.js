const fs = require('fs');

const asarPath = 'C:\\Program Files\\OneXConsole\\resources\\app.asar';
const buf = fs.readFileSync(asarPath);
const str = buf.toString('latin1');

// Search for the webpack module boundary or imports before 15545702
let idx = 15545702;
// Find "/***/ (" or similar webpack markers
let markerIdx = str.lastIndexOf('/***/', idx);
console.log('Marker at:', markerIdx);
console.log(str.slice(markerIdx, markerIdx + 800));
