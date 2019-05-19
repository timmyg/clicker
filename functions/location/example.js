const geolib = require('geolib');

a = { latitude: 39.15257, longitude: -84.453863 };
b = { latitude: 39.1364398, longitude: -84.4821765 };

console.time('a');
const x = geolib.getDistance(a, b);
console.log(x);
console.timeEnd('a');

console.time('b');
const y = geolib.getDistanceSimple(a, b);
console.log(y);
console.timeEnd('b');
