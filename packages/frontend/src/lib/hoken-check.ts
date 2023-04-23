import { Koukikourei, Shahokokuho } from "myclinic-model";
import api from "./api";
import { dateIntervalsOverlap } from "./interval-overlap";

export class OverlapExists {
  readonly isOverlapExistsClass: boolean = true;
  overlap: Shahokokuho | Koukikourei;

  constructor(overlap: Shahokokuho | Koukikourei) {
    this.overlap = overlap;
  }
}

type ErrorResult = OverlapExists;

export async function checkHokenInterval(hoken: Shahokokuho | Koukikourei): Promise<ErrorResult[]> {
  if( hoken instanceof Shahokokuho ){
    return await checkShahokokuhoInterval(hoken);
  } else {
    return await checkKoukikoureiInterval(hoken);
  }
}

async function checkShahokokuhoInterval(shahokokuho: Shahokokuho): Promise<ErrorResult[]> {
  const errs: ErrorResult[] = [];
  let list = await listHoken(shahokokuho.patientId);
  if( shahokokuho.shahokokuhoId !== 0 ){
    list = list.filter(h => {
      if( h instanceof Shahokokuho ){
        return h.shahokokuhoId !== shahokokuho.shahokokuhoId;
      } else {
        return true;
      }
    });
  }
  list.forEach(h => {
    if( dateIntervalsOverlap(shahokokuho.validFrom, shahokokuho.validUpto, h.validFrom, h.validUpto) ){
      errs.push(new OverlapExists(h));
    }
  });
  const cBefore = await api.countSh
  return errs;
}

async function checkKoukikoureiInterval(koukikourei: Koukikourei): Promise<ErrorResult[]> {

}

async function listHoken(patientId: number): Promise<(Shahokokuho | Koukikourei)[]> {
  const [shahokokuhoList, koukikoureiList] = await api.listAllHoken(patientId);
  const list: (Shahokokuho | Koukikourei)[] = [];
  list.push(...shahokokuhoList);
  list.push(...koukikoureiList);
  return list;
}

