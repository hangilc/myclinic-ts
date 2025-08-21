import type { IyakuhinMaster, PrescExample } from "myclinic-model"

export type SearchIyakuhinResult = {
  kind: "master";
  master: IyakuhinMaster;
} | {
  kind: "example";
  example: PrescExample;
}
