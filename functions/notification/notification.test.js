const file = require("./notification");

test("smoke test", () => {
  const response = file.health();
  expect(response).toBeTruthy;
});
