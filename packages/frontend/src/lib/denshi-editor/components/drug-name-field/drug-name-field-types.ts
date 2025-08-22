import type { PrescExample } from "@/lib/presc-example";
import type { IyakuhinMaster } from "myclinic-model"

export type SearchIyakuhinResult = ({
  kind: "master";
  master: IyakuhinMaster;
} | {
  kind: "example";
  example: PrescExample;
}) & { id: number };

let iyakuhinResultSerialId = 1;

export function createIyakuhinResultFromMaster(m: IyakuhinMaster): SearchIyakuhinResult {
  return { id: iyakuhinResultSerialId++, kind: "master", master: m };
}

export function createIyakuhinResultFromExample(e: PrescExample): SearchIyakuhinResult {
  return { id: iyakuhinResultSerialId++, kind: "example", example: e };
}

export function iyakuhinResultRep(r: SearchIyakuhinResult): string {
  switch(r.kind){
    case "master": return r.master.name;
    case "example": return `(登) ${r.example.薬品情報グループ[0].薬品レコード.薬品名称}`;
  }
}
