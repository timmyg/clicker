const file = require('./user');
const { getTokenValue } = require('./user');

test('smoke test', () => {
  const response = file.health();
  expect(response).toBeTruthy;
});

describe('cost per tokens', () => {
  test('5 tokens, $10', () => {
    const response = getTokenValue({ lifetime: { tokens: 5, spent: 10 } });
    expect(response).toBe(2);
  });
  test('6 tokens, $15', () => {
    const response = getTokenValue({ lifetime: { tokens: 6, spent: 15 } });
    expect(response).toBe(2.5);
  });
  test('7 tokens, $20', () => {
    const response = getTokenValue({ lifetime: { tokens: 7, spent: 20 } });
    expect(response).toBe(2.86);
  });
  test('3 tokens, $10', () => {
    const response = getTokenValue({ lifetime: { tokens: 3, spent: 10 } });
    expect(response).toBe(3.34);
  });
});
