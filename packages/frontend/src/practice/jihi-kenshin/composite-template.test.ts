import type { CompositeItem } from "@/lib/drawer/compiler/compiler";
import { parseCompTmpl } from "./composite-template";
import { describe, it, expect } from "vitest";

describe("composite-template", () => {
  it("should parse simple template", () => {
    function f(key: string): CompositeItem[] {
      if( key === "efg" ){
        return [{
          kind: "gap",
          width: 2,
        }];
      } else {
        return [];
      }
    }
    const parsed = parseCompTmpl("abcd [[efg]] hij", f);
    expect(parsed).deep.equal([
      { kind: "text", text: "abcd "},
      { kind: "gap", width: 2},
      { kind: "text", text: " hij"},
    ])
  })
});