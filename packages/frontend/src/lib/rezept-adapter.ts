import type { Kouhi, Koukikourei, Shahokokuho, Visit } from "myclinic-model";
import { resolve保険種別 } from "myclinic-rezept/helper";
import type { Hokensha } from "myclinic-rezept/rezept-types";
import api from "./api";

const KouhiOrder: number[] = [
  13, 14, 18, 29, 30, 10, 11, 20, 21, 15, 
  16, 24, 22, 28, 17, 79, 19, 23, 52, 54,
  51, 38, 53, 66, 62, 25, 12
];

const KouhiOrderMap: Record<number, number> = calcKouhiOrderMap();

function calcKouhiOrderMap(): Record<number, number> {
  const map: Record<number, number> = {};
  KouhiOrder.forEach((k, i) => {
    map[k] = i+1;
  });
  return map;
}

export async function loadVisits(year: number, month: number): Promise<{
  shaho: Visit[][];
  kokuho: Visit[][];
}> {
  const visits = await listVisitForRezept(year, month);
  const patientVisitsMap = classifyByPatient(visits);
  const shahoList: Visit[][] = [];
  const kokuhoList: Visit[][] = [];
  for (let patientId of patientVisitsMap.keys()) {
    const vs = patientVisitsMap.get(patientId)!;
    const seikyuu = await classifyBySeikyuuSaki(vs);
    Array.from((await classifyByHokenOnlyShubetsu(seikyuu.社保基金)).values()).forEach(vs => shahoList.push(vs));
    Array.from((await classifyByHokenOnlyShubetsu(seikyuu.国保連合)).values()).forEach(vs => kokuhoList.push(vs));
  }
  return {
    shaho: shahoList,
    kokuho: kokuhoList,
  }
}

async function listVisitForRezept(year: number, month: number): Promise<Visit[]> {
  const visits = await api.listVisitByMonth(year, month);
  return visits.filter(visit => {
    if (visit.shahokokuhoId > 0 && visit.koukikoureiId > 0) {
      throw new Error("重複保険：" + visit.visitId);
    }
    if (visit.shahokokuhoId > 0 || visit.koukikoureiId > 0) {
      return true;
    } else {
      return visit.kouhi1Id > 0 || visit.kouhi2Id > 0 || visit.kouhi3Id > 0;
    }
  });
}

function classifyByPatient(visits: Visit[]): Map<number, Visit[]> {
  const patientIds = setOf(visits.map(visit => visit.patientId));
  const classified = classifyBy(visits, visit => visit.patientId);
  const map: Map<number, Visit[]> = new Map();
  patientIds.forEach(patientId => {
    map.set(patientId, classified.get(patientId)!);
  })
  return map;
}

function setOf<T>(items: T[]): T[] {
  const as: T[] = [];
  items.forEach(item => {
    if (!as.includes(item)) {
      as.push(item);
    }
  });
  return as;
}

function classifyBy<K, V>(items: V[], getKey: (item: V) => K): Map<K, V[]> {
  return classify(items.map(item => [getKey(item), item]));
}

function classify<K, V>(items: [K, V][]): Map<K, V[]> {
  const map: Map<K, V[]> = new Map();
  items.forEach(([k, v]) => {
    if (map.has(k)) {
      map.get(k)!.push(v);
    } else {
      map.set(k, [v]);
    }
  })
  return map;
}

async function classifyBySeikyuuSaki(visits: Visit[]): Promise<{
  "社保基金": Visit[];
  "国保連合": Visit[];
}> {
  const shahoList: Visit[] = [];
  const kokuhoList: Visit[] = [];
  await Promise.all(visits.map(async visit => {
    if (await isForKokuhoRengou(visit)) {
      kokuhoList.push(visit);
    } else {
      shahoList.push(visit);
    }
  }));
  return {
    "社保基金": shahoList,
    "国保連合": kokuhoList,
  }
}

// Kouhi memo 公費単独請求先
// { "kouhi-tandoku-seikyuu-saki": "shaho" } -- 社保基金
// { "kouhi-tandoku-seikyuu-saki": "kokuho" } -- 国保連合

export async function isForKokuhoRengou(visit: Visit): Promise<boolean> {
  if (visit.shahokokuhoId > 0) {
    const shahokokuho = await api.getShahokokuho(visit.shahokokuhoId);
    return is国保(shahokokuho.hokenshaBangou);
  } else if (visit.koukikoureiId > 0) {
    return true;
  } else {
    const kouhiList: Kouhi[] = await Promise.all(visit.kouhiIdList.map(api.getKouhi));
    sortKouhiList(kouhiList);
    if (kouhiList.length === 0) {
      throw new Error("No hoken and no kouhi: " + JSON.stringify(visit));
    }
    const memo = kouhiList[0].memoAsJson;
    const seikyuu = memo["kouhi-tandoku-seikyuu-saki"];
    if (!seikyuu) {
      throw new Error("Cannot resolve kouhi-tandoku-seikyuu-saki: " + JSON.stringify(kouhiList[0]));
    }
    if (seikyuu === "shaho") {
      return false;
    } else if (seikyuu === "kokuho") {
      return true;
    } else {
      throw new Error("Unknown seikyuu saki (should be 'shaho' or 'kokuho'): " + seikyuu);
    }
  }
}

function is国保(hokenshaBangou: number): boolean {
  return hokenshaBangou < 1000000;
}

function sortKouhiList(kouhiList: Kouhi[]): void {
  function houbetsu(futansha: number): number {
    return Math.floor(futansha / 1000000);
  }

  function calcOrder(futansha: number): number {
    const hb = houbetsu(futansha);
    let order = KouhiOrderMap[hb];
    if (order === undefined) {
      if (isマル都(futansha)) {
        order = 100
      } else {
        order = futansha;
      }
    }
    return order;

  }
  kouhiList.sort((a, b) => calcOrder(a.futansha) - calcOrder(b.futansha));
}

function isマル都(負担者番号: number): boolean {
  return [
    51136018, // 難病医療（特定疾患）
    83136010, // 難病医療
    51137016, // 特殊医療
    82138009, // 特殊医療
    82134008, // 小児精神病、被爆者の子に対する医療
    82137001, // 大気汚染関連疾病
    82137555, // 大気汚染関連疾病
    82137670, // 大気汚染関連疾病
    82137530, // 大気汚染関連疾病
    38136016, // Ｂ型・Ｃ型ウイルス肝炎治療
    38136024, // 肝がん・重度肝硬変医療
    87136008, // 妊娠高血圧症候群等
    93137008, // 結核一般医療
    83133007, // 精神通院医療
  ].includes(負担者番号);
}

async function classifyByHokenOnlyShubetsu(visits: Visit[]): Promise<Map<string, Visit[]>> {
  const items: [string, Visit][] = await Promise.all(visits.map(async visit => {
    const shahokokuho = visit.shahokokuhoId > 0 ? await api.getShahokokuho(visit.shahokokuhoId) : undefined;
    const koukikourei = visit.koukikoureiId > 0 ? await api.getKoukikourei(visit.koukikoureiId) : undefined;
    const hokensha = createHokensha(shahokokuho, koukikourei);
    const shubetsu = resolve保険種別(hokensha, 0);
    const hokenshaBangou1 = shahokokuho ? shahokokuho.hokenshaBangou : 0;
    const hokenshaBangou2 = koukikourei ? parseInt(koukikourei.hokenshaBangou) : 0;
    const encode = `${shubetsu}|${hokenshaBangou1}|${hokenshaBangou2}`;
    return [encode, visit];
  }));
  return classify(items);
}

function createHokensha(shahokokuho: Shahokokuho | undefined, koukikourei: Koukikourei | undefined): Hokensha | undefined {
  if( shahokokuho ){
    let futanWari = 3;
    if( shahokokuho.koureiStore > 0 ){
      futanWari = shahokokuho.koureiStore;
    }
    return {
      futanWari,
      hokenshaBangou: shahokokuho.hokenshaBangou,
      hihokenshaKigou: shahokokuho.hihokenshaKigou,
      hihokenshaBangou: shahokokuho.hihokenshaBangou,
      isHonnin: shahokokuho.honninStore !== 0,
      isKoureiJukyuusha: shahokokuho.koureiStore > 0,
      edaban: shahokokuho.edaban,
    }
  } else if (koukikourei) {
    return {
      futanWari: koukikourei.futanWari,
      hokenshaBangou: parseInt(koukikourei.hokenshaBangou),
      hihokenshaBangou: koukikourei.hihokenshaBangou,
    }
  } else {
    return undefined;
  }
}
