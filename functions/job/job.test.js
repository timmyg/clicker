const { getChannelForZone, health } = require('./job');

test('smoke test', () => {
  const response = health();
  expect(response).toBeTruthy;
});

test('get initial channels', () => {
  expect(getChannelForZone(0)).toBe(206);
  expect(getChannelForZone(1)).toBe(209);
  expect(getChannelForZone(2)).toBe(212);
  expect(getChannelForZone(3)).toBe(219);
  expect(getChannelForZone(4)).toBe(213);
  expect(getChannelForZone(5)).toBe(206);
});
