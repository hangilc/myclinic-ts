import type { PrescExample } from "@/lib/presc-example";
import type { IyakuhinMaster } from "myclinic-model"

export type SearchIyakuhinResult = ({
  kind: "master";
  master: IyakuhinMaster;
} | {
  kind: "ippanmei";
  master: IyakuhinMaster;
} | {
  kind: "alias";
  alias: string;
}) & { id: number };

let iyakuhinResultSerialId = 1;

export function createIyakuhinResultFromMaster(m: IyakuhinMaster): SearchIyakuhinResult {
  return { id: iyakuhinResultSerialId++, kind: "master", master: m };
}

export function createIyakuhinResultFromIppanmei(m: IyakuhinMaster): SearchIyakuhinResult {
  return { id: iyakuhinResultSerialId++, kind: "ippanmei", master: m };
}

export function createIyakuhinResultFromAlias(alias: string): SearchIyakuhinResult {
  return { id: iyakuhinResultSerialId++, kind: "alias", alias};
}

export function iyakuhinResultRep(r: SearchIyakuhinResult): string {
  switch(r.kind){
    case "master": return r.master.name;
    case "ippanmei": return r.master.name;
    case "alias": return `(別) ${r.alias}`;
  }
}
