import { describe, it, expect } from "vitest"
import { shahokokuhoRep2, kouhiRep } from "./hoken-rep"

describe("hoken-rep", () => {
  it("should handle 国家公務員共済", () => {
    expect(shahokokuhoRep2(31130354, 0)).toBe("国家公務員共済");
  });

  it("should handle マル障（１割負担）", () => {
    expect(kouhiRep(80136712)).toBe("心身障害");
  })
});