const { dateToSqlDate } = require("./date-to-sql-date");

test("it should convert 2023-03-02", () => {
  expect(dateToSqlDate(new Date("2023-03-02"))).toBe("2023-03-02");
})