import { firstAndLastDayOf, monthOfSqlDate, yearOfSqlDate } from "./util";

describe("rezept-adapter", () => {
  it("should parse sqldate", () => {
    const sqldate = "2023-06-29";
    expect(yearOfSqlDate(sqldate)).equal(2023);
    expect(monthOfSqlDate(sqldate)).equal(6);
  });

  it("should calculate first and last date", () => {
    expect(firstAndLastDayOf("2023-06-29")).deep.equal(["2023-06-01", "2023-06-30"]);
    expect(firstAndLastDayOf("2024-01-4")).deep.equal(["2024-01-01", "2024-01-31"]);
  })
})