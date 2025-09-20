import type { Koukikourei } from "myclinic-model";

export type ReferSrc = {
  kind: "koukikourei";
  koukikourei: Koukikourei;
} | {
  kind: "none";
}