import { describe, it, expect } from "vitest"
import { sm } from "./sm"

describe("sm (StringMargin)", () => {
  it("should render simple one line", () => {
    expect(sm`abcd efg`).toBe("abcd efg");
  });

  it("should render simple one line with expression", () => {
    expect(sm`abcd ${1 + 2} efg`).toBe("abcd 3 efg");
  });

  it("shoud render multiple line", () => {
    expect(sm`
    abcd
    efg
    hij
    `).toBe("abcd\nefg\nhij\n")
  });

  it("shoud render multiple line with expression", () => {
    expect(sm`
    abcd
    efg ${1 + 2}
    hij
    `).toBe("abcd\nefg 3\nhij\n")
  })
});
