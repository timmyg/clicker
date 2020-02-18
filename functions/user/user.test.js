const file = require('./user');
const { getTokenValue } = require('./user');

test('smoke test', () => {
  const response = file.health();
  expect(response).toBeTruthy;
});

describe('cost per tokens', () => {
  test('5 tokens, $10', () => {
    const response = getTokenValue({ lifetimeTokens: 5, lifetimeSpent: 10 });
    expect(response).toBe(2);
  });
  test('6 tokens, $15', () => {
    const response = getTokenValue({ lifetimeTokens: 6, lifetimeSpent: 15 });
    expect(response).toBe(2.5);
  });
  test('7 tokens, $20', () => {
    const response = getTokenValue({ lifetimeTokens: 7, lifetimeSpent: 20 });
    expect(response).toBe(2.86);
  });
  test('3 tokens, $10', () => {
    const response = getTokenValue({ lifetimeTokens: 3, lifetimeSpent: 10 });
    expect(response).toBe(3.34);
  });
});
