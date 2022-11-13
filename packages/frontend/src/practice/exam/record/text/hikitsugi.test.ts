import { describe, expect, it } from "vitest"
import { extractHikitsugi, hasHikitsugi } from "./hikitsugi"

describe("hikitsugi", () => {
  it("should detect hikitsugi sentences", () => {
    expect(hasHikitsugi("● ４月、採血。")).toBe(true);
    expect(hasHikitsugi("★ レボフロキサシン禁。")).toBe(true);
    expect(hasHikitsugi("頭痛がある。")).toBe(false);
  });

  it("should extract hikitsugi sentneces.", () => {
    expect(extractHikitsugi("● ４月、採血。\n頭痛がする。")).toBe("● ４月、採血。\n")
    expect(extractHikitsugi(
      `★レボフロキサシン禁\n● ４月、採血。\n頭痛がする。`
      )).toBe("★レボフロキサシン禁\n● ４月、採血。\n")
  });
});