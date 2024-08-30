import type { PrescInfoData } from "@/lib/denshi-shohou/presc-info";
import type { RegisterResult } from "@/lib/denshi-shohou/shohou-interface";

export type TextMemo = ShohouTextMemo;

export interface ShohouTextMemo {
  kind: "shohou";
  shohou: PrescInfoData;
  prescriptionId: string | undefined;
}
