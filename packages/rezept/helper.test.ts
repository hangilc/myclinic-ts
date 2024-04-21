import { parseSqlDate } from "./helper"

describe("rezept helper", () => {
  it("should parse sqldate", () => {
    expect(parseSqlDate("2024-04-21")).toMatchObject({ year: 2024, month: 4, day: 21 });
  });
})