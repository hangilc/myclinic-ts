import { describe, it, expect } from "vitest";
import type { DrugGroup } from "@/lib/parse-shohou";
import {
  get剤形区分FromGroup,
} from "./denshi-tmpl";
import type { 剤形区分 } from "../denshi-shohou/denshi-shohou";

describe("denshi-tmpl", () => {
  it("should get proper 剤形区分", () => {
    let group: DrugGroup = {
      drugs: [],
      usage: { kind: "days", days: "5", usage: "分３　毎食後" },
      groupComments: [],
    };
    let kubun = get剤形区分FromGroup(group);
    expect(kubun).toBe("内服");

    group = {
      drugs: [],
      usage: { kind: "other", usage: "１日１回、１回１枚、患部に貼付" },
      groupComments: [],
    };
    kubun = get剤形区分FromGroup(group);
    expect(kubun).toBe("外用");

    group = {
      drugs: [],
      usage: { kind: "other", usage: "１日２回、患部に塗布" },
      groupComments: [],
    };
    kubun = get剤形区分FromGroup(group);
    expect(kubun).toBe("外用");

    group = {
      drugs: [{
        name: "ラキソベロン内服液０．７５％１０ｍＬ",
        amount: "２０",
        unit: "ｍＬ",
        drugComments: []
      }],
      usage: { kind: "other", usage: "１日１回、寝る前、５滴" },
      groupComments: [],
    };
    kubun = get剤形区分FromGroup(group);
    expect(kubun).toBe("内服滴剤");
  });

  it("should get 剤形区分 in improper cases", () => {
    let group: DrugGroup;
    let kubun: 剤形区分;
    group = {
      drugs: [{
        name: "ラキソベロン内服液０．７５％１０ｍＬ",
        amount: "２０",
        unit: "ｍＬ",
        drugComments: []
      }, {
        name: "ロキソニンパップ１００ｍｇ　１０ｃｍ×１４ｃｍ",
        amount: "21",
        unit: "枚",
        drugComments: []
      }],
      usage: { kind: "other", usage: "１日２回使用" },
      groupComments: [],
    };
    kubun = get剤形区分FromGroup(group);
    expect(kubun).toBe("不明");
  })
});