import api from "@/lib/api";
import type { VisitEx } from "myclinic-model";
import type { CheckError } from "./check";

export async function checkOnshi(visit: VisitEx): Promise<CheckError | undefined> {
  const onshi = await api.findOnshi(visit.visitId);
  if( onshi ){
    return undefined;
  } else {
    return {
      code: "オンライン資格確認なし",
      hint: visit.visitedAt,
    }
  }
}