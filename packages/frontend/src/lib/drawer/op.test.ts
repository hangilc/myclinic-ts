import { describe, it, expect } from "vitest";
import { OpMoveTo } from "./op";

describe("Op should be JSON serialized", () => {
  it("OpMoveTo should be JSON serialized", () => {
    const src = new OpMoveTo(10, 20);
    const exp = ["move_to", 10, 20];
    console.log(JSON.stringify(src));
    console.log(JSON.stringify(exp));
    expect(JSON.parse(JSON.stringify(src))).deep.equal(exp);
  })
});