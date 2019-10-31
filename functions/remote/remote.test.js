const file = require('./remote');

test('smoke test', () => {
  const response = file.health();
  expect(response).toBeTruthy;
});
