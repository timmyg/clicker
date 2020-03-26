const { health } = require('./job');

test('smoke test', () => {
  const response = health();
  expect(response).toBeTruthy;
});
