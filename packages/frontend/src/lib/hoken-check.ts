import { Kouhi, Koukikourei, Roujin, Shahokokuho } from "myclinic-model";
import api from "./api";
import { dateIntervalsOverlap } from "./interval-overlap";

export async function countInvalidUsage(h: Shahokokuho | Koukikourei | Kouhi | Roujin): Promise<number> {
  let cBefore: number;
  let cAfter: number;
  if( h instanceof Shahokokuho ){
    cBefore = await api.countShahokokuhoUsageBefore(h.shahokokuhoId, h.validFrom);
    if( h.validUpto !== "0000-00-00" ){
      cAfter = await api.countShahokokuhoUsageAfter(h.shahokokuhoId, h.validUpto);
    } else {
      cAfter = 0;
    }
  } else if( h instanceof Koukikourei) {
    cBefore = await api.countKoukikoureiUsageBefore(h.koukikoureiId, h.validFrom);
    if( h.validUpto !== "0000-00-00" ){
      cAfter = await api.countKoukikoureiUsageAfter(h.koukikoureiId, h.validUpto);
    } else {
      cAfter = 0;
    }
  } else if( h instanceof Kouhi ){
    cBefore = await api.countKouhiUsageBefore(h.kouhiId, h.validFrom);
    if( h.validUpto !== "0000-00-00" ){
      cAfter = await api.countKouhiUsageAfter(h.kouhiId, h.validUpto);
    } else {
      cAfter = 0;
    }
  } else {
    cBefore = 0;
    cAfter = 0;
  }
  return cBefore + cAfter;
}

export class OverlapExists {
  readonly isOverlapExistsClass: boolean = true;
  overlap: Shahokokuho | Koukikourei;

  constructor(overlap: Shahokokuho | Koukikourei) {
    this.overlap = overlap;
  }
}

export class Used {
  readonly isUsedClass: boolean = true;
}

type ErrorResult = OverlapExists | Used;

export async function checkHokenInterval(hoken: Shahokokuho | Koukikourei): Promise<ErrorResult[]> {
  if( hoken instanceof Shahokokuho ){
    return await checkShahokokuhoInterval(hoken);
  } else {
    return await checkKoukikoureiInterval(hoken);
  }
}

async function checkShahokokuhoInterval(shahokokuho: Shahokokuho): Promise<ErrorResult[]> {
  const shahokokuhoId = shahokokuho.shahokokuhoId;
  const errs: ErrorResult[] = [];
  let list = await listHoken(shahokokuho.patientId);
  if( shahokokuhoId !== 0 ){
    list = list.filter(h => {
      if( h instanceof Shahokokuho ){
        return h.shahokokuhoId !== shahokokuhoId;
      } else {
        return true;
      }
    });
  }
  list.forEach(h => {
    if( dateIntervalsOverlap(shahokokuho.validFrom, shahokokuho.validUpto, h.validFrom, h.validUpto) ){
      console.log("overlap", shahokokuho, h);
      errs.push(new OverlapExists(h));
    }
  });
  if( shahokokuhoId > 0 ){
    const cBefore = await api.countShahokokuhoUsageBefore(shahokokuhoId, shahokokuho.validFrom);
    if( cBefore > 0 ){
      errs.push(new Used());
    }
    if( shahokokuho.validUpto !== "0000-00-00" ){
      const cAfter = await api.countShahokokuhoUsageAfter(shahokokuhoId, shahokokuho.validUpto);
      if( cAfter > 0 ){
        errs.push(new Used());
      }
    }
  }
  return errs;
}

async function checkKoukikoureiInterval(koukikourei: Koukikourei): Promise<ErrorResult[]> {
  const koukikoureiId = koukikourei.koukikoureiId;
  const errs: ErrorResult[] = [];
  let list = await listHoken(koukikourei.patientId);
  if( koukikoureiId !== 0 ){
    list = list.filter(h => {
      if( h instanceof Koukikourei ){
        return h.koukikoureiId !== koukikoureiId;
      } else {
        return true;
      }
    });
  }
  list.forEach(h => {
    if( dateIntervalsOverlap(koukikourei.validFrom, koukikourei.validUpto, h.validFrom, h.validUpto) ){
      errs.push(new OverlapExists(h));
    }
  });
  if( koukikoureiId > 0 ){
    const cBefore = await api.countKoukikoureiUsageBefore(koukikoureiId, koukikourei.validFrom);
    if( cBefore > 0 ){
      errs.push(new Used());
    }
    if( koukikourei.validUpto !== "0000-00-00" ){
      const cAfter = await api.countKoukikoureiUsageAfter(koukikoureiId, koukikourei.validUpto);
      if( cAfter > 0 ){
        errs.push(new Used());
      }
    }
  }
  return errs;
}

async function listHoken(patientId: number): Promise<(Shahokokuho | Koukikourei)[]> {
  const [shahokokuhoList, koukikoureiList] = await api.listAllHoken(patientId);
  const list: (Shahokokuho | Koukikourei)[] = [];
  list.push(...shahokokuhoList);
  list.push(...koukikoureiList);
  return list;
}

