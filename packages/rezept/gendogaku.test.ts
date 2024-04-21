import { isBirthday75, isUnder70 } from "./gendogaku";

describe("gendogaku", () => {
  it("should determine birthday month 75", () => {
    expect(isBirthday75(2075, 4, 2000, 4, 12)).toBe(true);
    expect(isBirthday75(2075, 3, 2000, 4, 12)).toBe(false);
    expect(isBirthday75(2075, 5, 2000, 4, 12)).toBe(false);
    expect(isBirthday75(2075, 4, 2000, 4, 1)).toBe(false);
  })

  it("should determine under 70", () => {
    expect(isUnder70(2070, 4, 2020, 5, 12)).toBe(true);
    expect(isUnder70(2070, 4, 2000, 5, 12)).toBe(true);
    expect(isUnder70(2070, 5, 2000, 5, 12)).toBe(true);
    expect(isUnder70(2070, 6, 2000, 5, 12)).toBe(false);
    expect(isUnder70(2071, 6, 2000, 5, 12)).toBe(false);
    expect(isUnder70(2070, 4, 2020, 5, 1)).toBe(true);
    expect(isUnder70(2070, 4, 2000, 5, 1)).toBe(true);
    expect(isUnder70(2070, 5, 2000, 5, 1)).toBe(false);
    expect(isUnder70(2070, 6, 2000, 5, 1)).toBe(false);
    expect(isUnder70(2071, 6, 2000, 5, 1)).toBe(false);
  })
})