const file = require('./voucher');

test('smoke test', () => {
  const response = file.health();
  expect(response).toBeTruthy;
});
