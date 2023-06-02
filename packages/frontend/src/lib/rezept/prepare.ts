import type { ClinicInfo, Kouhi, Koukikourei, Shahokokuho, Visit, VisitEx } from "myclinic-model";
import api from "../api";
import { 男女区分コード, 診査支払い機関コード, type 診査支払い機関コードCode } from "./codes";
import { cvtVisitsToIyakuhinDataList } from "./iyakuhin-item-util";
import { mkレセプト共通レコード } from "./records/common-record";
import { formatHokenshaBangou, hokenRecordJitsuNissu, hokenshaRecordBangou, hokenshaRecordKigou, mk保険者レコード } from "./records/hokensha-record";
import { mk医薬品レコード } from "./records/iyakuhin-record";
import { mk医療機関情報レコード } from "./records/medical-institute-record";
import { create診療報酬請求書レコード } from "./records/seikyuu-record";
import { mk診療行為レコード } from "./records/shinryoukoui-record";
import { mk特定器材レコード } from "./records/tokuteikizai-record";
import { cvtVisitsToShinryouDataList } from "./shinryoukoui-item-util";
import { TensuuCollector } from "./tensuu-collector";
import { cvtVisitsToKizaiDataList } from "./tokuteikizai-item-util";
import { classifyBy, isForKokuhoRengou, resolve保険種別, classify, setOf, calcSeikyuuMonth, extract都道府県コードfromAddress, formatYearMonth, resolvePatientName, commonRecord給付割合, resolveGendo, resolveGendogakuTokkiJikou, shahokokuhoOfVisit, koukikoureiOfVisit, getSortedKouhiListOfVisits, hokenshaBangouOfHoken, adjustOptString, calcRezeptCount } from "./util";

export class RezeptContext {
  year: number;
  month: number;
  clinicInfo: ClinicInfo;

  private constructor(year: number, month: number, clinicInfo: ClinicInfo) {
    this.year = year;
    this.month = month;
    this.clinicInfo = clinicInfo;
  }

  static async load(year: number, month: number): Promise<RezeptContext> {
    const clinicInfo = await api.getClinicInfo();
    return new RezeptContext(year, month, clinicInfo);
  }

  async createForShaho(): Promise<string> {
    let serial = 1;
    const visitsList = (await this.loadVisits()).shaho;
    const rows: string[] = [];
    rows.push(this.create医療機関情報レコード(診査支払い機関コード.社保基金));
    let rezeptCount = 0;
    let rezeptSouten = 0;
    for(let visits of visitsList) {
      const shahokokuho = await shahokokuhoOfVisit(visits[0]);
      const koukikourei = await koukikoureiOfVisit(visits[0]);
      const kouhiList = await getSortedKouhiListOfVisits(visits);
      const visitExList: VisitEx[] = await Promise.all(visits.map(visit => api.getVisitEx(visit.visitId)));
      const kouhiIdList = kouhiList.map(kouhi => kouhi.kouhiId);
      const shinryouDataList = cvtVisitsToShinryouDataList(visitExList, kouhiIdList);
      const iyakuhinDataList = cvtVisitsToIyakuhinDataList(visitExList, kouhiIdList);
      const kizaiDataList = cvtVisitsToKizaiDataList(visitExList, kouhiIdList);
      const tenCol = new TensuuCollector();
      shinryouDataList.filter(dl => dl.点数 !== undefined).forEach(dl => tenCol.add(dl.負担区分, dl.点数! * dl.回数));
      iyakuhinDataList.filter(dl => dl.点数 !== undefined).forEach(dl => tenCol.add(dl.負担区分, dl.点数! * dl.回数));
      kizaiDataList.filter(dl => dl.点数 !== undefined).forEach(dl => tenCol.add(dl.負担区分, dl.点数! * dl.回数));
      rows.push(await this.createレセプト共通レコード(
        serial++, shahokokuho, koukikourei, kouhiList, visits));
      rows.push(...shinryouDataList.map(mk診療行為レコード));
      rows.push(...iyakuhinDataList.map(mk医薬品レコード));
      rows.push(...kizaiDataList.map(mk特定器材レコード));
      rezeptCount += calcRezeptCount(visits);
      rezeptSouten += tenCol.getRezeptSouten();
    }
    rows.push(create診療報酬請求書レコード({
      rezeptCount: rezeptCount,
      totalTen: rezeptSouten,
    }))
    return rows.join("\r\n");
  }

  create医療機関情報レコード(seikyuu: 診査支払い機関コードCode): string {
    const [seikyuuYear, seikyuuMonth] = calcSeikyuuMonth(this.year, this.month);

    return mk医療機関情報レコード({
      診査支払い機関: seikyuu,
      都道府県: extract都道府県コードfromAddress(this.clinicInfo.address),
      医療機関コード: this.clinicInfo.kikancode,
      医療機関名称: this.clinicInfo.name,
      year: seikyuuYear,
      month: seikyuuMonth,
      電話番号: this.clinicInfo.tel,
    });
  }

  async createレセプト共通レコード(
    serial: number, 
    shahokokuho: Shahokokuho | undefined,
    koukikourei: Koukikourei | undefined,
    kouhiList: Kouhi[], 
    visits: Visit[]
  ): Promise<string> {
    const patient = await api.getPatient(visits[0].patientId);
    const gendo = await resolveGendo(visits);
    const tokkijikouGendo = resolveGendogakuTokkiJikou(shahokokuho, koukikourei, gendo);
    return mkレセプト共通レコード({
      レセプト番号: serial,
      レセプト種別: resolve保険種別(shahokokuho, koukikourei, kouhiList),
      診療年月: formatYearMonth(this.year, this.month),
      氏名: resolvePatientName(patient),
      男女区分: patient.sex === "M" ? 男女区分コード.男 : 男女区分コード.女,
      生年月日:  patient.birthday.replaceAll("-", ""),
      給付割合: await commonRecord給付割合(visits[0]),
      レセプト特記事項: tokkijikouGendo ?? "",
      カルテ番号等: patient.patientId.toString(),
      検索番号: "",
      請求情報: "",
    });
  }

  create保険者レコード(
    shahokokuho: Shahokokuho | undefined,
    koukikourei: Koukikourei | undefined,
    visits: Visit[],
    合計点数: number,
    医療保険負担金額: number | undefined,
  ): string {
    return mk保険者レコード({
      保険者番号: formatHokenshaBangou(hokenshaBangouOfHoken(shahokokuho, koukikourei)),
      被保険者証記号: adjustOptString(hokenshaRecordKigou(shahokokuho)),
      被保険者証番号: hokenshaRecordBangou(shahokokuho, koukikourei),
      診療実日数: hokenRecordJitsuNissu(visits),
      合計点数,
      医療保険負担金額
    });
  }

  async loadVisits(): Promise<{
    shaho: Visit[][];
    kokuho: Visit[][];
  }> {
    const visits = await listVisitForRezept(this.year, this.month);
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

async function classifyByHokenOnlyShubetsu(visits: Visit[]): Promise<Map<string, Visit[]>> {
  const items: [string, Visit][] = await Promise.all(visits.map(async visit => {
    const shahokokuho = visit.shahokokuhoId > 0 ? await api.getShahokokuho(visit.shahokokuhoId) : undefined;
    const koukikourei = visit.koukikoureiId > 0 ? await api.getKoukikourei(visit.koukikoureiId) : undefined;
    const shubetsu = resolve保険種別(shahokokuho, koukikourei, []);
    const hokenshaBangou1 = shahokokuho ? shahokokuho.hokenshaBangou : 0;
    const hokenshaBangou2 = koukikourei ? parseInt(koukikourei.hokenshaBangou) : 0;
    const encode = `${shubetsu}|${hokenshaBangou1}|${hokenshaBangou2}`;
    return [encode, visit];
  }));
  return classify(items);
}
