import type { RP剤情報 } from "./denshi-shohou/presc-info";

export type PrescExample = RP剤情報 & {
  comment?: string;
};