import type { KoukikoureiFormValues } from "../koukikourei-form-values";

export type ReferSrc = {
  kind: "koukikourei";
  koukikourei: KoukikoureiFormValues;
} | {
  kind: "none";
}