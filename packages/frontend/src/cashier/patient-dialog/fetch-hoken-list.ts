import api from "@/lib/api";
import type { Kouhi, Koukikourei, Roujin, Shahokokuho } from "myclinic-model";
import { Hoken } from "./hoken";

export async function fetchHokenList(patientId: number): Promise<Hoken[]> {
  const [shahoList, koukikoureiList, roujinList, kouhiList] =
    await api.getPatientHoken(patientId, new Date());
  return batchFromHoken(shahoList, koukikoureiList, roujinList, kouhiList);
}

export async function batchFromHoken(shahokokuhoList: Shahokokuho[], koukikoureiList: Koukikourei[], 
  roujinList: Roujin[], kouhiList: Kouhi[]): Promise<Hoken[]> {
    const [shahoMap, koukiMap, roujinMap, kouhiMap] = await api.batchCountHokenUsage(
      shahokokuhoList.map(e => e.shahokokuhoId), 
      koukikoureiList.map(e => e.koukikoureiId), 
      roujinList.map(e => e.roujinId), 
      kouhiList.map(e => e.kouhiId)
    );
    const shahokokuhoHokens: Hoken[] = shahokokuhoList.map(h => {
      return new Hoken(h, shahoMap[h.shahokokuhoId]);
    });
    const koukikoureiHokens: Hoken[] = koukikoureiList.map(h => {
      return new Hoken(h, koukiMap[h.koukikoureiId]);
    });
    const roujinHokens: Hoken[] = roujinList.map(h => {
      return new Hoken(h, roujinMap[h.roujinId]);
    });
    const kouhiHokens: Hoken[] = kouhiList.map(h => {
      return new Hoken(h, kouhiMap[h.kouhiId]);
    })
    return [...shahokokuhoHokens, ...koukikoureiHokens, 
      ...roujinHokens, ...kouhiHokens];
  }
