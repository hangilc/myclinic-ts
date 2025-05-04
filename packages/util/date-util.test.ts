import { calcAge, DateWrapper } from "./date-util"

describe("date-util", () => {
  it("should calculate age", () => {
    expect(calcAge("2000-05-01", "2024-05-01")).toBe(24);
    expect(calcAge("2000-05-01", "2024-05-01")).toBe(24);
    expect(calcAge("2000-05-01", "2024-04-30")).toBe(23);
  });

  it("should set day", () => {
    expect(DateWrapper.from("2025-05-04").setDay(1).asSqlDate()).toBe("2025-05-01");
  });

  it("should set month", () => {
    expect(DateWrapper.from("2025-05-04").setMonth(6).asSqlDate()).toBe("2025-06-04");
  });
})
