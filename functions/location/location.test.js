require('dotenv').config({ path: '../.env' });
const file = require('./location');

test('smoke test', () => {
  console.log(file);
  const response = file.health();
  expect(response).toBeTruthy;
});
