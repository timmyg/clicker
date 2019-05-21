const geolib = require('geolib');

const a = { latitude: 39.1525741, longitude: -84.4538577 };
const b = { latitude: 39.1520072, longitude: -84.4448429 };

console.time('a');
const meters = geolib.getDistance(a, b);
const miles = geolib.convertUnit('mi', meters);
console.log({ meters, miles });
console.timeEnd('a');

console.time('b');
const meters2 = geolib.getDistanceSimple(a, b);
const miles2 = geolib.convertUnit('mi', meters2);
const rounded = Math.round(10 * miles2) / 10;
console.log({ meters2, miles2, rounded });
console.timeEnd('b');
