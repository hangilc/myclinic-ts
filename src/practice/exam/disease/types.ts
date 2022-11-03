import type { ByoumeiMaster, Disease, DiseaseAdj, ShuushokugoMaster } from "@/lib/model";
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

export function startDateRep(data: DiseaseData): string {
  return kanjidate.format(kanjidate.f3, data[0].startDate);
}
