import api from "@/lib/api";
import type { ShinryouEx } from "myclinic-model";

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

