import api from "@/lib/api";
import type { Disease, ShinryouEx, VisitEx } from "myclinic-model";

export class ShinryouCollector {
  map: Record<string, ShinryouEx[]> = {};

  add(shinryou: ShinryouEx) {
    let name = shinryou.master.name;
    let bind = this.map[name];
    if( bind === undefined ){
      this.map[name] = [shinryou];
    } else {
      bind.push(shinryou)
    }
  }
}

export async function batchDeleteShinryou(list: ShinryouEx[]): Promise<boolean>{
  await Promise.all(list.map(s => api.deleteShinryou(s.shinryouId)))
  return true;
}

export function isShoshinName(name: string): boolean {
  const list = ["初診", "初診料"];
  return list.indexOf(name) >= 0;
}

export function isSaishinName(name: string): boolean {
  const list = ["再診（診療所）", "再診", "再診料", "同日再診（診療所）", "同日再診", "同日再診料"];
  return list.indexOf(name) >= 0;
}

export function fixByDeleteShinryou(shinryou: ShinryouEx): () => Promise<boolean> {
  return async () => {
    await api.deleteShinryou(shinryou.shinryouId);
    return true;
  }
}

export async function getDiseases(visit: VisitEx): Promise<Disease[]> {
  const at = visit.visitedAt.substring(0, 10);
  return await api.listDiseaseActiveAt(visit.patient.patientId, at, at);
}




