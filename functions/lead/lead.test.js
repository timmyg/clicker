require('dotenv').config({ path: '../.env.example' });
const file = require('./lead');

test('smoke test', () => {
  const response = file.health();
  expect(response).toBeTruthy;
});
