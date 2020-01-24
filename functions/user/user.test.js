const file = require("./user");

test("smoke test", () => {
  const response = file.health();
  expect(response).toBeTruthy;
});
