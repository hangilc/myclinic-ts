const { pad } = require("./pad");

test("pad 1 to size 2", () => {
  expect(pad(1, 2, "0")).toBe("01");
})