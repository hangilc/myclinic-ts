import type { PrescInfoData } from "@/lib/denshi-shohou/presc-info";

export type TextMemo = ShohouTextMemo;

export interface ShohouTextMemo {
  kind: "shohou";
  shohou: PrescInfoData;
  register: any | undefined;
}
