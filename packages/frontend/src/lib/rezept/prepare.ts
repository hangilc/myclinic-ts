import type { ClinicInfo, Visit } from "myclinic-model";
import api from "../api";
import { 男女区分コード, 診査支払い機関コード, type 診査支払い機関コードCode } from "./codes";
import { mk医療機関情報レコード } from "./records/medical-institute-record";
import { classifyBy, isForKokuhoRengou, resolve保険種別, withClassified, withClassifiedBy, classify, setOf, calcSeikyuuMonth, extract都道府県コードfromAddress, resolve保険種別OfVisits, formatYearMonth, resolvePatientName, commonRecord給付割合, resolveGendo } from "./util";

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
    const visits = (await this.loadVisits()).shaho;
    const rows: string[] = [];
    rows.push(this.create医療機関情報レコード(診査支払い機関コード.社保基金));
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

  async createレセプト共通レコード(serial: number, isShaho: boolean, visits: Visit[]): Promise<string> {
    const patient = await api.getPatient(visits[0].patientId);
    const gendo = resolveGendo(visits);
    const tokkijikouGendo = resolveGendogakuTokkiJikou(hoken, gendo);
    return mkレセプト共通レコード({
      レセプト番号: serial,
      レセプト種別: await resolve保険種別OfVisits(visits),
      診療年月: formatYearMonth(this.year, this.month),
      氏名: resolvePatientName(patient),
      男女区分: patient.sex === "M" ? 男女区分コード.男 : 男女区分コード.女,
      生年月日:  patient.birthday.replaceAll("-", ""),
      給付割合: await commonRecord給付割合(visits[0]),
      レセプト特記事項,
      カルテ番号等: patient.patientId.toString(),
      検索番号: "",
      請求情報: "",
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
function mkレセプト共通レコード(arg0: { レセプト番号: any; レセプト種別: any; 診療年月: any; 氏名: any; 男女区分: any; 生年月日: any; 給付割合: any; レセプト特記事項: any; カルテ番号等: any; 検索番号: any; 請求情報: any; }): string | PromiseLike<string> {
  throw new Error("Function not implemented.");
}

