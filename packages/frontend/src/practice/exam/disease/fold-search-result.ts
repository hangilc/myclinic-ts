import api from "@/lib/api";
import {
  ByoumeiMaster,
  DiseaseExample,
  ShuushokugoMaster,
} from "myclinic-model";

export async function foldSearchResult(
  r: ByoumeiMaster | ShuushokugoMaster | DiseaseExample,
  at: Date,
  byoumeiHandler: (m: ByoumeiMaster) => void,
  adjHandler: (a: ShuushokugoMaster) => void,
  exampleHandler: (m: ByoumeiMaster | null, as: ShuushokugoMaster[]) => void
) {
  if (ByoumeiMaster.isByoumeiMaster(r)) {
    byoumeiHandler(r);
  } else if (ShuushokugoMaster.isShuushokugoMaster(r)) {
    adjHandler(r);
  } else if (DiseaseExample.isDiseaseExample(r)) {
    console.log("example", r);
    let m: ByoumeiMaster | null = null;
    let as: ShuushokugoMaster[] = [];
    if (r.byoumei != null) {
      m = await api.resolveByoumeiMasterByName(r.byoumei, at);
      if (m == null) {
        throw new Error("Cannot resolve byoumei: " + r.byoumei);
      }
    }
    let promises = [...r.preAdjList, ...r.postAdjList].map(async (name) => {
      const am = await api.resolveShuushokugoMasterByName(name, at);
      if (am != null) {
        as.push(am);
      } else {
        throw new Error("Cannot resolve adj name: " + r.byoumei);
      }
    });
    await Promise.all(promises);
    console.log("calling handler", typeof as, as.length)
    exampleHandler(m, as);
  }
}
