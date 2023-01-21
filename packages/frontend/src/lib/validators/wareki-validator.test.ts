import { it, expect } from "vitest";
import { source } from "../validation";
import { validateWareki } from "./wareki-validator";

it("should validate wareki", () => {
  const vs = validateWareki({
    gengou: source("令和"),
    nen: source(5),
    month: source(1),
    day: source(21),
  });
  expect(vs.isValid).toBe(true);
  expect(vs.value).toStrictEqual(new Date(2023, 0, 21));
});

it("should detect wareki input error", () => {
  const vs = validateWareki({
    gengou: source("Reiwa"),
    nen: source(-5),
    month: source(13),
    day: source(32),
  });
  expect(vs.isValid).toBe(false);
  expect(vs.errorMessages).deep.equal([
    "元号 : 入力が元号名でありません",
    "年 : 正の数値でありません",
    "月 : 数値が正しい範囲内でありません",
    "日 : 数値が正しい範囲内でありません",
  ]);
});


