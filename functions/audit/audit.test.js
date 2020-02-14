const file = require('./admin');

test('smoke test', () => {
  const response = file.health();
  expect(response).toBeTruthy;
});
