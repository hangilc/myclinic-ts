import {
  DiseaseEndReasonType, ByoumeiMaster,
  type Disease,
  DiseaseData,
  type DiseaseAdj,
  type DiseaseExample, ShuushokugoMaster, dateToSqlDate, stringToOptionalDate, optionalDateToSqlDate,
} from "myclinic-model";
import * as kanjidate from "kanjidate";
import api from "@/lib/api";
import { writable, type Writable } from "svelte/store";

// export type DiseaseData = [
//   Disease,
//   ByoumeiMaster,
//   [DiseaseAdj, ShuushokugoMaster][]
// ];

// export function byoumeiName(data: DiseaseData): string {
//   return data[1].name;
// }

// function shuushokugoNames(data: DiseaseData): [string, string] {
//   const pres: string[] = [];
//   const posts: string[] = [];
//   data[2].forEach(([_adj, master]: [DiseaseAdj, ShuushokugoMaster]) => {
//     if( master.isPrefix ){
//       pres.push(master.name);
//     } else {
//       posts.push(master.name);
//     }
//   });
//   return [pres.join(""), posts.join("")];
// }

export function fullName(data: DiseaseData): string {
  return data.byoumeiMaster.fullName(data.shuushokugoMasters);
}

// export function getStartDate(data: DiseaseData): string {
//   return data[0].startDate;
// }

// export function startDateOf(data: DiseaseData): Date {
//   return new Date(getStartDate(data));
// }

// export function getEndDate(data: DiseaseData): string {
//   return data[0].endDate;
// }

// export function endDateOf(data: DiseaseData): Date | null {
//   const s = getEndDate(data);
//   return s === "0000-00-00" ? null : new Date(s);
// }

// export function hasEndDate(data: DiseaseData): boolean {
//   return getEndDate(data) !== "0000-00-00";
// }

export function startDateRep(date: Date): string {
  return kanjidate.format(kanjidate.f3, date);
}

export function endDateRep(date: Date | undefined): string {
  if (date == null) {
    return "未終了";
  } else {
    return kanjidate.format(kanjidate.f3, date);
  }
}

// export function getEndReason(data: DiseaseData): DiseaseEndReasonType {
//   const s = data[0].endReasonStore;
//   return DiseaseEndReasonType.fromCode(s);
// }

export async function resolveDiseaseExample(
  ex: DiseaseExample,
  at: string | Date
): Promise<[ByoumeiMaster | null, ShuushokugoMaster[]]> {
  let b: ByoumeiMaster | null;
  if (ex.byoumei == null) {
    b = null;
  } else {
    b = await api.resolveByoumeiMasterByName(ex.byoumei, at);
    if (b == null) {
      throw new Error("Cannot resolve byoumei: " + ex.byoumei);
    }
  }
  async function resolveAdjList(list: string[]): Promise<ShuushokugoMaster[]> {
    return Promise.all(
      list.map(async (name) => {
        const adj = await api.resolveShuushokugoMasterByName(name, at);
        if (adj == null) {
          throw new Error("Cannot resolve adj: " + name);
        }
        return adj;
      })
    );
  }
  const adj: ShuushokugoMaster[] = await resolveAdjList(ex.preAdjList.concat(ex.postAdjList));
  return [b, adj];
}

export type SearchResultType =
  | ByoumeiMaster
  | ShuushokugoMaster
  | DiseaseExample;

export class EditData {
  disease: Disease;
  byoumeiMaster: ByoumeiMaster;
  shuushokugoList: ShuushokugoMaster[];
  
  constructor(src: DiseaseData) {
    this.disease = src.disease.clone();
    this.byoumeiMaster = src.byoumeiMaster;
    this.shuushokugoList = src.adjList.map(tuple => tuple[1]);
  }

  get fullName(): string {
    return this.byoumeiMaster.fullName(this.shuushokugoList);
  }

  setByoumeiMaster(m: ByoumeiMaster): void {
    this.disease.shoubyoumeicode = m.shoubyoumeicode;
    this.byoumeiMaster = m;
  }

  get startDate(): Date {
    return this.disease.startDateAsDate;
  }

  setStartDate(date: Date): void {
    this.disease.startDate = dateToSqlDate(date);
  }

  get endDate(): Date | undefined {
    return stringToOptionalDate(this.disease.endDate);
  }

  setEndDate(date: Date | undefined): void {
    this.disease.endDate = optionalDateToSqlDate(date);
  }

  get endReason(): DiseaseEndReasonType {
    return this.disease.endReason;
  }

  setEndReason(reason: DiseaseEndReasonType): void {
    this.disease.endReasonStore = reason.code;
  }

  clearShuushokugoList(): void {
    this.shuushokugoList = [];
  }

  addToShuushokugoList(...m: ShuushokugoMaster[]): void {
    this.shuushokugoList.push(...m);
  }

  get shuushokugocodes(): number[] {
    return this.shuushokugoList.map(m => m.shuushokugocode);
  }
}
