import { RezeptComment, type ShinryouEx, type VisitEx } from "myclinic-model";
import type { CheckError } from "../check";
import api from "@/lib/api";
import { DateWrapper } from "myclinic-util";
import { ShinryouMemoWrapper } from "@/lib/shinryou-memo";

const issueDateCode = 850100090
const byoumeiCode = 830100083

export async function checkRyouyouDouisho(visits: VisitEx[]): Promise<CheckError[]> {
  const checkErrors: CheckError[] = []
  for (let visit of visits) {
    for (let shinryou of visit.shinryouList) {
      const name = shinryou.master.name;
      if (name === "療養費同意書交付料") {
        const date = visit.visitedAt.substring(0, 10);
        const fromDate = DateWrapper.from(date).setDay(1).incMonth(-5).setDay(16).asSqlDate();
        const uptoDate = DateWrapper.from(date).incDay(-1).asSqlDate();
        console.log("fromDate", fromDate, uptoDate);
        const prevs = await api.listVisitIdByDateIntervalAndPatient(
          fromDate, uptoDate, visit.patient.patientId);
        let lastDate = "";
        for (let prev of prevs) {
          const list = await api.listShinryouForVisit(prev);
          for (let shinryou of list) {
            if (shinryou.shinryoucode === 113004310) { // 療養費同意書交付料
              const visit = await api.getVisit(shinryou.visitId);
              const d = visit.visitedAt.substring(0, 10);
              if (lastDate < d) {
                lastDate = d;
              }
            }
          }
        }
        if (lastDate !== "") {
          let dueDate = kasanStartDate(lastDate);
          checkErrors.push({
            code: `療養費同意書交付料算定不可：以前${lastDate}に算定されているので、` +
              `次に算定できるのは、${dueDate}です。`,
          })
        }
        let comments = ShinryouMemoWrapper.from(shinryou.memo).getComments();
        let issueDateFound = false;
        let byoumeiFound = false;
        for (let c of comments) {
          let code = c.code;
          if (code === issueDateCode) {
            issueDateFound = true;
          } else if (code === byoumeiCode) {
            byoumeiFound = true;
          }
        }
        if( !issueDateFound ){
          checkErrors.push({
            code: "療養費同意書交付料算定：交付年月日コメントなし",
            fix: fixIssueDateFun(shinryou, visit),
            hint: "コメント追加",
          })
        }
        if( !byoumeiFound ){
          checkErrors.push({
            code: "療養費同意書交付料算定：病名なし",
            fix: fixByoumeiFun(shinryou),
            hint: "病名追加",
          })
        }
      }
    }
  }
  return checkErrors;
}

function fixIssueDateFun(shinryouEx: ShinryouEx, visit: VisitEx): () => Promise<boolean> {
  return async () => {
    const shinryou = shinryouEx.asShinryou();
    const wrapper = ShinryouMemoWrapper.from(shinryou.memo);
    let comments = wrapper.getComments();
    const date = DateWrapper.from(visit.visitedAt);
    const com = RezeptComment.new50(issueDateCode, date);
    const index = comments.findIndex(c => c.code === issueDateCode);
    if( index < 0 ){
      comments.push(com);
    } else {
      comments[index] = com;
    }
    wrapper.setComments(comments);
    const newShinryou = Object.assign({}, shinryou, { memo: wrapper.memo })
    await api.updateShinryou(newShinryou);
    return true;
  }
}

function fixByoumeiFun(shinryouEx: ShinryouEx): () => Promise<boolean> {
  return async () => {
    const shinryou = shinryouEx.asShinryou();
    const wrapper = ShinryouMemoWrapper.from(shinryou.memo);
    let comments = wrapper.getComments();
    let byoumei = prompt("病名（筋麻痺、片麻痺など）：");
    if( byoumei == undefined || byoumei.trim() == ""){
      return false;
    }
    const com = RezeptComment.new30(byoumeiCode, byoumei);
    const index = comments.findIndex(c => c.code === byoumeiCode);
    if( index < 0 ){
      comments.push(com);
    } else {
      comments[index] = com;
    }
    wrapper.setComments(comments);
    const newShinryou = Object.assign({}, shinryou, { memo: wrapper.memo })
    await api.updateShinryou(newShinryou);
    return true;
  }
}

function kasanStartDate(prevDate: string): string {
  const prev = DateWrapper.from(prevDate);
  if (prev.getDay() < 16) {
    return prev.setDay(1).incMonth(5).asSqlDate();
  } else {
    return prev.setDay(1).incMonth(6).asSqlDate();
  }
}

