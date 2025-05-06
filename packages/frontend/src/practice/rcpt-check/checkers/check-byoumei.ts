import { DiseaseEnterData, type Disease, type VisitEx } from "myclinic-model";
import type { CheckError } from "../check";
import { getDiseases } from "./helper";
import api from "@/lib/api";

export async function checkByoumei(visits: VisitEx[]): Promise<CheckError[]> {
  const checkErrors: CheckError[] = [];
  for(let visit of visits){
    for(let shinryou of visit.shinryouList) {
      const name = shinryou.master.name;
      if( name === "ＨｂＡ１ｃ" ){
        const ds = await getDiseases(visit);
        if( !hasDiabetes(ds) ){
          checkErrors.push({
            code: "ＨｂＡ１ｃの病名がありません",
            fix: enterByoumei(2500013, [8002], visit),
            hint: "病名「糖尿病の疑い」を追加"
          })
        }
      } else if( name === "ＰＳＡ" ) {
        const ds = await getDiseases(visit);
        if( !hasProstateCancer(ds) ){
          checkErrors.push({
            code: "前立腺癌の病名がありません",
            fix: enterByoumei(1859003, [8002], visit),
            hint: "病名「前立腺癌」を追加",
          })
        }
      }
    }
  }
  return checkErrors;
}

function enterByoumei(shoubyoumeicode: number, shuushokugocodes: number[], visit: VisitEx):
() => Promise<boolean> {
  return async () => {
    const data: DiseaseEnterData = new DiseaseEnterData(
      visit.patient.patientId,
      shoubyoumeicode,
      visit.visitedAt.substring(0, 10),
      shuushokugocodes,
    );
    await api.enterDiseaseEx(data);
    return true;
  }
}

function hasDiabetes(ds: Disease[]): boolean {
  for(let d of ds){
    const shoubyoumeicode = d.shoubyoumeicode
    if( shoubyoumeicode === 2500013 ){ // 糖尿病
      return true;
    }
  }
  return false;
}

function hasProstateCancer(ds: Disease[]): boolean {
  for(let d of ds){
    const shoubyoumeicode = d.shoubyoumeicode
    if( shoubyoumeicode === 1859003 ){ // 前立腺癌
      return true;
    }
  }
  return false;
}

