import { isBirthdayMonth75 } from "./util";

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
})