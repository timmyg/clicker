require('dotenv').config({ path: '../.env' });
const file = require('./location');

test('smoke test', () => {
  const response = file.health();
  expect(response).toBeTruthy;
});
