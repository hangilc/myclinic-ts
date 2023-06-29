import type { DiseaseData, ConductDrugEx, ConductEx, ConductKizaiEx, ConductShinryouEx, HokenInfo, Kouhi, Koukikourei, RezeptShoujouShouki, Shahokokuho, Shinryou, ShinryouEx, ShinryouMaster, Visit, VisitEx, Patient } from "myclinic-model";
import type { RezeptComment } from "myclinic-model/model";
import type { RezeptUnit } from "myclinic-rezept";
import { is診療識別コードCode, is負担区分コードName, 診療識別コード, 負担区分コード, type ShotokuKubunCode, type 診療識別コードCode, type 負担区分コードCode } from "myclinic-rezept/codes";
import { resolve保険種別 } from "myclinic-rezept/helper";
import type { Hokensha, RezeptConduct, RezeptConductDrug, RezeptConductKizai, RezeptConductShinryou, RezeptDisease, RezeptKouhi, RezeptPatient, RezeptShinryou, RezeptVisit } from "myclinic-rezept/rezept-types";
import { OnshiResult } from "onshi-result";
import type { LimitApplicationCertificateClassificationFlagLabel } from "onshi-result/codes";
import type { ResultItem } from "onshi-result/ResultItem";
import api from "./api";
import { firstAndLastDayOf } from "./util";

const KouhiOrder: number[] = [
  13, 14, 18, 29, 30, 10, 11, 20, 21, 15,
  16, 24, 22, 28, 17, 79, 19, 23, 52, 54,
  51, 38, 53, 66, 62, 25, 12
];

const KouhiOrderMap: Record<number, number> = calcKouhiOrderMap();

function calcKouhiOrderMap(): Record<number, number> {
  const map: Record<number, number> = {};
  KouhiOrder.forEach((k, i) => {
    map[k] = i + 1;
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

function hokenOfShinryou(shinryou: ShinryouEx, shahokokuho: Shahokokuho | undefined, koukikourei: Koukikourei | undefined,
  kouhiList: Kouhi[]): [Shahokokuho | undefined, Koukikourei | undefined, Kouhi[]] {
  return [shahokokuho, koukikourei, kouhiList];
}

function hokenOfConduct(conduct: ConductEx, shahokokuho: Shahokokuho | undefined, koukikourei: Koukikourei | undefined,
  kouhiList: Kouhi[]): [Shahokokuho | undefined, Koukikourei | undefined, Kouhi[]] {
  return [shahokokuho, koukikourei, kouhiList];
}

class HokenCollector {
  shahokokuho: Shahokokuho | undefined = undefined;
  koukikourei: Koukikourei | undefined = undefined;
  kouhilist: Kouhi[] = [];

  addShahokokuho(shahokokuho: Shahokokuho): void {
    if (this.shahokokuho === undefined) {
      this.shahokokuho = shahokokuho;
    } else {
      if (this.shahokokuho.shahokokuhoId !== shahokokuho.shahokokuhoId) {
        throw new Error("Inconsistent shahokokuho");
      }
    }
  }

  addKoukikourei(koukikourei: Koukikourei): void {
    if (this.koukikourei === undefined) {
      this.koukikourei = koukikourei;
    } else {
      if (this.koukikourei.koukikoureiId !== koukikourei.koukikoureiId) {
        throw new Error("Inconsistent shahokokuho");
      }
    }
  }

  addKouhi(kouhi: Kouhi): void {
    const index = this.kouhilist.findIndex(k => k.kouhiId === kouhi.kouhiId);
    if (index < 0) {
      this.kouhilist.push(kouhi);
    }
  }

  add(shahokokuho: Shahokokuho | undefined, koukikourei: Koukikourei | undefined, kouhiList: Kouhi[]): void {
    if (shahokokuho) {
      this.addShahokokuho(shahokokuho);
    }
    if (koukikourei) {
      this.addKoukikourei(koukikourei);
    }
    kouhiList.forEach(kouhi => this.addKouhi(kouhi));
  }

  finishAdd(): void {
    sortKouhiList(this.kouhilist);
  }

  scanVisits(visits: VisitEx[]): void {
    visits.forEach(visit => {
      visit.shinryouList.forEach(shinryou => {
        const [shahokokuho, koukikourei, kouhiList] = hokenOfShinryou(
          shinryou, visit.hoken.shahokokuho, visit.hoken.koukikourei, visit.hoken.kouhiList);
        this.add(shahokokuho, koukikourei, kouhiList);
      });
      visit.conducts.forEach(conduct => {
        const [shahokokuho, koukikourei, kouhiList] = hokenOfConduct(
          conduct, visit.hoken.shahokokuho, visit.hoken.koukikourei, visit.hoken.kouhiList);
        this.add(shahokokuho, koukikourei, kouhiList);
      });
    });
    this.finishAdd();
  }

  getFutanKubun(): 負担区分コードCode {
    let name = this.kouhilist.map((_k, i) => (i + 1).toString()).join("");
    if (this.shahokokuho || this.koukikourei) {
      name = "H" + name;
    }
    if (!is負担区分コードName(name)) {
      throw new Error("Cannot happen");
    }
    return 負担区分コード[name];
  }

  getFutanKubunOf(shahokokuho: Shahokokuho | undefined, koukikourei: Koukikourei | undefined, kouhiList: Kouhi[])
    : 負担区分コードCode {
    const kouhiIndexList: number[] = [];
    kouhiList.forEach(kouhi => {
      const i = this.kouhilist.findIndex(k => k.kouhiId === kouhi.kouhiId);
      if (i < 0) {
        throw new Error("Cannot happen");
      }
      kouhiIndexList.push(i + 1);
    });
    kouhiIndexList.sort();
    let name = kouhiIndexList.map(i => i.toString()).join("");
    if (shahokokuho || koukikourei) {
      name = "H" + name;
    }
    if (!is負担区分コードName(name)) {
      throw new Error("Cannot happen");
    }
    return 負担区分コード[name];
  }
}

async function resolveOnshi(visitId: number): Promise<ResultItem | undefined> {
  const onshi = await api.findOnshi(visitId);
  if (onshi) {
    const result = OnshiResult.cast(JSON.parse(onshi.kakunin));
    if (result.isValid) {
      return result.resultList[0];
    }
  }
  return undefined;
}

async function resolveGendo(visitIds: number[]):
  Promise<LimitApplicationCertificateClassificationFlagLabel | undefined> {
  let gendo: LimitApplicationCertificateClassificationFlagLabel | undefined = undefined;
  for (let visitId of visitIds) {
    const resultItem = await resolveOnshi(visitId);
    if (resultItem) {
      const g = resultItem.limitApplicationCertificateRelatedInfo?.limitApplicationCertificateClassificationFlag;
      if (g) {
        gendo = g;
      }
    }
  }
  return gendo;
}

function resolveShotokuKubun(shahokokuho: Shahokokuho | undefined,
  koukikourei: Koukikourei | undefined,
  gendo: LimitApplicationCertificateClassificationFlagLabel | undefined): ShotokuKubunCode | undefined {
  if (gendo) {
    return gendo;
  }
  if (koukikourei) {
    switch (koukikourei.futanWari) {
      case 3: return "現役並みⅢ";
      case 2: return "一般Ⅱ";
      case 1: return "一般Ⅰ";
    }
  } else if (shahokokuho) {
    switch (shahokokuho.koureiStore) {
      case 3: return "現役並みⅢ";
      case 2:
      case 1:
        return "一般";
      default: break;
    }
  }
  return undefined;
}

async function resolveShotokuKubunOfVisits(shahokokuho: Shahokokuho | undefined,
  koukikourei: Koukikourei | undefined, visitIds: number[]): Promise<ShotokuKubunCode | undefined> {
  const gendo = await resolveGendo(visitIds);
  return resolveShotokuKubun(shahokokuho, koukikourei, gendo);
}

async function adjCodesOfDisease(diseaseId: number): Promise<number[]> {
  const dex: DiseaseData = await api.getDiseaseEx(diseaseId);
  return dex.adjList.map(e => {
    const [adj, master] = e;
    return adj.shuushokugocode;
  });
}

async function diseasesOfPatient(patientId: number, firstDay: string, lastDay: string): Promise<RezeptDisease[]> {
  const result: RezeptDisease[] = [];
  const ds = await api.listDiseaseActiveAt(patientId, firstDay, lastDay);
  for (let i = 0; i < ds.length; i++) {
    const disease = ds[i];
    const adjCodes = await adjCodesOfDisease(disease.diseaseId);
    let endReason: "N" | "C" | "S" | "D";
    switch (disease.endReasonStore) {
      case "N": case "C": case "S": case "D": {
        endReason = disease.endReasonStore;
        break;
      }
      default: {
        throw new Error("Unknown end reason: " + disease.endReasonStore);
      }
    }
    result.push({
      shoubyoumeicode: disease.shoubyoumeicode,
      adjcodes: adjCodes,
      startDate: disease.startDate,
      endReason: endReason,
    });
  }
  return result;
}

export async function cvtVistsToUnit(modelVisits: Visit[]): Promise<RezeptUnit> {
  if (modelVisits.length === 0) {
    throw new Error("Cannot happen");
  }
  const visitExList: VisitEx[] = await Promise.all(modelVisits.map(mv => api.getVisitEx(mv.visitId)));
  const hokenCollector = new HokenCollector();
  hokenCollector.scanVisits(visitExList);
  const visits: RezeptVisit[] = await Promise.all(visitExList.map(visitEx =>
    cvtModelVisitToRezeptVisit(visitEx, hokenCollector)));
  const hokensha: Hokensha | undefined = createHokensha(hokenCollector.shahokokuho, hokenCollector.koukikourei);
  if( hokensha ){
    hokensha.edaban = await resolveEdaban(modelVisits);
  }
  const kouhiList: RezeptKouhi[] = hokenCollector.kouhilist.map(kouhi => ({
    futansha: kouhi.futansha,
    jukyuusha: kouhi.jukyuusha,
  }));
  const shotokuKubun: ShotokuKubunCode | undefined = await resolveShotokuKubunOfVisits(
    hokenCollector.shahokokuho, hokenCollector.koukikourei, modelVisits.map(visit => visit.visitId)
  );
  const modelPatient: Patient = visitExList[0].patient;
  const patientId: number = modelPatient.patientId;
  let sex: "M" | "F" = "M";
  if (modelPatient.sex === "F") {
    sex = "F";
  }
  const patient: RezeptPatient = {
    name: modelPatient.rezeptName || modelPatient.fullName("　"),
    sex,
    birthday: modelPatient.birthday,
    patientId: patientId.toString(),
  }
  const visitedAt = modelVisits[0].visitedAt.substring(0, 10);
  const [firstDay, lastDay] = firstAndLastDayOf(visitedAt);
  const diseases: RezeptDisease[] = await diseasesOfPatient(patientId, firstDay, lastDay);
  return {
    visits,
    patient,
    hokensha,
    kouhiList,
    shotokuKubun,
    diseases,
  }
}

function commentsOfVisit(visit: VisitEx): RezeptComment[] {
  return [];
}

function shoujouShoukiOfVisit(visit: VisitEx): RezeptShoujouShouki[] {
  return [];
}

async function cvtModelVisitToRezeptVisit(visitEx: VisitEx, hokenCollector: HokenCollector): Promise<RezeptVisit> {
  return {
    visitedAt: visitEx.visitedAt.substring(0, 10),
    shinryouList: visitEx.shinryouList.map(shinryou => cvtToRezeptShinryou(shinryou, visitEx.hoken, hokenCollector)),
    conducts: visitEx.conducts.map(conduct => cvtToRezeptConduct(conduct, visitEx.hoken, hokenCollector)),
    shoujouShoukiList: shoujouShoukiOfVisit(visitEx),
    comments: commentsOfVisit(visitEx),
  }
}

function cvtToRezeptShinryou(shinryou: ShinryouEx, hoken: HokenInfo, hokenCollector: HokenCollector): RezeptShinryou {
  const [shahokokuho, koukikourei, kouhiList] = hokenOfShinryou(shinryou, hoken.shahokokuho,
    hoken.koukikourei, hoken.kouhiList);
  return {
    shikibetsuCode: resolveShinryouShikibetsu(shinryou.master),
    futanKubun: hokenCollector.getFutanKubunOf(shahokokuho, koukikourei, kouhiList),
    master: {
      shinryoucode: shinryou.master.shinryoucode,
      tensuu: parseInt(shinryou.master.tensuuStore),
      name: shinryou.master.name,
      houkatsukensa: shinryou.master.houkatsukensa,
    },
    comments: shinryou.asShinryou().comments,
  };
}

function shikibetsuOfConduct(conductKind: number): 診療識別コードCode {
  switch (conductKind) {
    case 3: return 診療識別コード.画像診断;
    default: return 診療識別コード.処置;
  }
}

function cvtToRezeptConduct(conduct: ConductEx, hoken: HokenInfo, hokenCollector: HokenCollector): RezeptConduct {
  const [shahokokuho, koukikourei, kouhiList] = hokenOfConduct(conduct, hoken.shahokokuho,
    hoken.koukikourei, hoken.kouhiList);
  return {
    shikibetsuCode: shikibetsuOfConduct(conduct.kind.code),
    futanKubun: hokenCollector.getFutanKubunOf(shahokokuho, koukikourei, kouhiList),
    shinryouList: conduct.shinryouList.map(cs => cvtToRezeptConductShinryou(cs)),
    drugList: conduct.drugs.map(cd => cvtToRezeptConductDrug(cd)),
    kizaiList: conduct.kizaiList.map(ck => cvtToRezeptConductKizai(ck)),
  };
}

function commenctsOfConductShinryou(cs: ConductShinryouEx): RezeptComment[] {
  return [];
}

function commenctsOfConductDrug(cs: ConductDrugEx): RezeptComment[] {
  return [];
}

function commenctsOfConductKizai(cs: ConductKizaiEx): RezeptComment[] {
  return [];
}

function cvtToRezeptConductShinryou(cs: ConductShinryouEx): RezeptConductShinryou {
  return {
    master: {
      shinryoucode: cs.master.shinryoucode,
      tensuu: parseInt(cs.master.tensuuStore),
      name: cs.master.name,
      houkatsukensa: cs.master.houkatsukensa,
    },
    comments: commenctsOfConductShinryou(cs),
  }
}

function cvtToRezeptConductDrug(cd: ConductDrugEx): RezeptConductDrug {
  return {
    master: {
      iyakuhincode: cd.master.iyakuhincode,
      yakka: parseFloat(cd.master.yakkaStore),
      name: cd.master.name,
      unit: cd.master.unit,
    },
    amount: cd.amount,
    comments: commenctsOfConductDrug(cd),
  };
}

function cvtToRezeptConductKizai(ck: ConductKizaiEx): RezeptConductKizai {
  return {
    master: {
      kizaicode: ck.master.kizaicode,
      kingaku: parseFloat(ck.master.kingakuStore),
      name: ck.master.name,
      unit: ck.master.unit,
    },
    amount: ck.amount,
    comments: commenctsOfConductKizai(ck),
  };
}

function resolveShinryouShikibetsu(master: ShinryouMaster): 診療識別コードCode {
  const shinryouShubetsu = Math.floor(parseInt(master.shuukeisaki) / 10).toString();
  if (!is診療識別コードCode(shinryouShubetsu)) {
    throw new Error("Unknown 診療識別コード: " + shinryouShubetsu);
  }
  return shinryouShubetsu;
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

async function shahokokuhoOfVisit(visit: Visit): Promise<Shahokokuho | undefined> {
  if (visit.shahokokuhoId > 0) {
    return await api.getShahokokuho(visit.shahokokuhoId);
  } else {
    return undefined;
  }
}

async function resolveEdaban(visits: Visit[]): Promise<string | undefined> {
  let onshiEdaban: string | undefined = undefined;
  let hokenshoEdaban: string | undefined = undefined;
  for (let visit of visits) {
    const ri = await resolveOnshi(visit.visitId);
    if (ri) {
      if (ri.insuredBranchNumber !== undefined) {
        onshiEdaban = ri.insuredBranchNumber;
      }
    } else {
      const shahokokuho = await shahokokuhoOfVisit(visit);
      if (shahokokuho) {
        if (shahokokuho.edaban !== "") {
          hokenshoEdaban = shahokokuho.edaban;
        }
      }
    }
  }
  return onshiEdaban || hokenshoEdaban;
}

function createHokensha(shahokokuho: Shahokokuho | undefined, koukikourei: Koukikourei | undefined): Hokensha | undefined {
  if (shahokokuho) {
    let futanWari = 3;
    if (shahokokuho.koureiStore > 0) {
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
