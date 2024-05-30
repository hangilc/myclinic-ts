import { calcAge } from "./date-util"

describe("date-util", () => {
  it("should calculate age", () => {
    expect(calcAge("2000-05-01", "2024-05-01")).toBe(24);
    expect(calcAge("2000-05-01", "2024-05-01")).toBe(24);
    expect(calcAge("2000-05-01", "2024-04-30")).toBe(23);
  });
})