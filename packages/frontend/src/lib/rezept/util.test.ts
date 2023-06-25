import { isBirthdayMonth75, roundTo10 } from "./util";

describe("rezept util", () => {
  it("should check birthday monthy 75", () => {
    expect(isBirthdayMonth75("1900-03-12", 1975, 3)).equal(true);
  });

  it("should check birthday monthy 75 (1st day)", () => {
    expect(isBirthdayMonth75("1900-03-01", 1975, 3)).equal(false);
  });

  it("should check birthday monthy 75 (1st day)", () => {
    expect(isBirthdayMonth75("1900-03-01", 1975, 1)).equal(false);
  });

  it("should check birthday monthy 75 (false age)", () => {
    expect(isBirthdayMonth75("1900-03-12", 1980, 3)).equal(false);
  });

  it("should round 21 to 20", () => {
    expect(roundTo10(21)).equal(20);
  });

  it("should round 35 to 40", () => {
    expect(roundTo10(35)).equal(40);
  });

  it("should round 38 to 40", () => {
    expect(roundTo10(38)).equal(40);
  });

  it("should round 40 to 40", () => {
    expect(roundTo10(40)).equal(40);
  });
})