import api from "@/lib/api";
import { Hoken } from "./hoken";

export async function listCurrentHoken(patientId: number): Promise<Hoken[]> {
  const [shahoList, koukikoureiList, roujinList, kouhiList] =
    await api.getPatientHoken(patientId, new Date());
  return Hoken.batchFromHoken(shahoList, koukikoureiList, roujinList, kouhiList);
}
