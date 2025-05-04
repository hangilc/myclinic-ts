import type { VisitEx } from "myclinic-model";
import type { CheckError } from "../check";
import api from "@/lib/api";
import { DateWrapper } from "myclinic-util";

export async function checkRyouyouDouisho(visits: VisitEx[]): Promise<CheckError[]> {
  const checkErrors: CheckError[] = []
  for(let visit of visits){
    for(let shinryou of visit.shinryouList){
      const name = shinryou.master.name;
      if( name === "療養費同意書交付料"){
        const date = visit.visitedAt.substring(0, 10);
        const fromDate = DateWrapper.from(date).setDay(1).incMonth(-5).setDay(16).asSqlDate();
        const uptoDate = DateWrapper.from(date).incDay(-1).asSqlDate();
        console.log("fromDate", fromDate, uptoDate);
        const prevs = await api.listVisitIdByDateIntervalAndPatient(
          fromDate, uptoDate, visit.patient.patientId);
        let lastDate = "";
        for(let prev of prevs){
          const list = await api.listShinryouForVisit(prev);
          for(let shinryou of list){
            if( shinryou.shinryoucode === 113004310 ){ // 療養費同意書交付料
              const visit = await api.getVisit(shinryou.visitId);
              const d = visit.visitedAt.substring(0, 10);
              if( lastDate < d ){
                lastDate = d;
              }
            }
          }
        }
        if( lastDate !== "" ){
          let dueDate = kasanStartDate(lastDate);
          checkErrors.push({
            code: `療養費同意書交付料算定不可：以前${lastDate}に算定されているので、` +
              `次に算定できるのは、${dueDate}です。`
          })
        }
      }
    }
  }
  return checkErrors;
}

function kasanStartDate(prevDate: string): string {
  const prev = DateWrapper.from(prevDate);
  if( prev.getDay() < 16 ){
    return prev.setDay(1).incMonth(5).asSqlDate();
  } else {
    return prev.setDay(1).incMonth(6).asSqlDate();
  }
}

