require('dotenv').config({ path: '../.env.example' });
const file = require('./reservation');

test('smoke test', () => {
  const response = file.health();
  expect(response).toBeTruthy;
});
