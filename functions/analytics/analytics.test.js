const file = require('./analytics');

test('smoke test', () => {
  const response = file.health();
  expect(response).toBeTruthy;
});
