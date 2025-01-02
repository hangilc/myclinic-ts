import { describe, it, expect } from "vitest";
import { defaultDates } from "./fax-shohousen-helper";
import { dateToSqlDate } from "myclinic-model";

describe("fax-shohousen-helper", () => {
  it("should calculate upper half dates", () => {
    const today = new Date(2024, 2, 2);
    const [fromDate, uptoDate] = defaultDates(today);
    expect(dateToSqlDate(fromDate)).to.be.equal("2024-02-16")
    expect(dateToSqlDate(uptoDate)).to.be.equal("2024-02-29");
  });

  it("should calculate lower half dates", () => {})
  const today = new Date(2024, 2, 20);
  const [fromDate, uptoDate] = defaultDates(today);
  expect(dateToSqlDate(fromDate)).to.be.equal("2024-03-01")
  expect(dateToSqlDate(uptoDate)).to.be.equal("2024-03-15");
});
3