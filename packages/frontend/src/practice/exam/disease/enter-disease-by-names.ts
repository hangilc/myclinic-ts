import api from "@/lib/api";
import type { DiseaseEnterData, ShuushokugoMaster } from "myclinic-model";

export async function enterDiseaseByNames(
  patientId: number,
  at: string,
  diseaseName: string,
  adjNames: string[]
): Promise<number | string> {
  const dmaster = await api.resolveByoumeiMasterByName(diseaseName, at);
  if (!dmaster) {
    return `不明な病名：${diseaseName}`;
  }
  const amasters = await Promise.all(
    adjNames.map((adjName) =>
      fetchShuushokugoMaster(adjName, at)
    )
  );
  const adjCodes: number[] = [];
  for (let m of amasters) {
    if (typeof m === "string") {
      return m;
    }
    adjCodes.push(m.shuushokugocode);
  }
  const data: DiseaseEnterData = {
    patientId,
    byoumeicode: dmaster.shoubyoumeicode,
    startDate: at,
    adjCodes,
  };
  return await api.enterDiseaseEx(data);
}

async function fetchShuushokugoMaster(name: string, at: string): Promise<ShuushokugoMaster | string> {
  let master = await api.resolveShuushokugoMasterByName(name, at);
  if( master ){
    return master;
  } else {
    return `不明な修飾語：${name}`;
  }
}
