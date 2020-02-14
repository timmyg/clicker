const file = require('./audit');

test('smoke test', () => {
  const response = file.health();
  expect(response).toBeTruthy;
});
