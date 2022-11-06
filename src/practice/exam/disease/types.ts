import { DiseaseEndReasonObject, type ByoumeiMaster, type Disease, type DiseaseAdj, type DiseaseEndReasonType, type DiseaseExample, type ShuushokugoMaster } from "@/lib/model";
import * as kanjidate from "kanjidate";

export type DiseaseData = [Disease, ByoumeiMaster, [DiseaseAdj, ShuushokugoMaster][]]

export function byoumeiName(data: DiseaseData): string {
  return data[1].name;
}

export function shuushokugoName(data: DiseaseData): string {
  return data[2].map(a => a[1].name).join("");
}

export function fullName(data: DiseaseData): string {
  return byoumeiName(data) + shuushokugoName(data);
}

export function getStartDate(data: DiseaseData): string {
  return data[0].startDate;
}

export function startDateOf(data: DiseaseData): Date {
  return new Date(getStartDate(data));
}

export function getEndDate(data: DiseaseData): string {
  return data[0].endDate;
}

export function endDateOf(data: DiseaseData): Date | null {
  const s = getEndDate(data);
  return s === "0000-00-00" ? null : new Date(s);
}

export function hasEndDate(data: DiseaseData): boolean {
  return getEndDate(data) !== "0000-00-00";
}

export function startDateRep(data: DiseaseData): string {
  return kanjidate.format(kanjidate.f3, getStartDate(data));
}

export function endDateRep(data: DiseaseData): string {
  const d = getEndDate(data);
  if( d === "0000-00-00" ) {
    return "未終了";
  } else {
    return kanjidate.format(kanjidate.f3, d);
  }
}

export function getEndReason(data: DiseaseData): DiseaseEndReasonType {
  const s = data[0].endReasonStore;
  return DiseaseEndReasonObject.fromCode(s);
}

export type SearchResultType = ByoumeiMaster | ShuushokugoMaster | DiseaseExample;
