import { mk医療機関情報レコード } from "./records/medical-institute-record";
import { ShotokuKubunCode, 男女区分コード, 診査支払い機関コード, 診査支払い機関コードCode } from "./codes";
import { adjustOptString, calcSeikyuuMonth, commonRecord給付割合, extract都道府県コードfromAddress, formatHokenshaBangou, formatYearMonth, hokenRecordJitsuNissu, optionFold, resolveGendogakuTokkiJikou, resolve保険種別 } from "./helper";
import { ClinicInfo, Hokensha, RezeptKouhi, RezeptPatient, RezeptVisit } from "./rezept-types";
import { 診療行為レコードData } from "records/shinryoukoui-record";
import { 特定器材レコードData } from "records/tokuteikizai-record";
import { 医薬品レコードData } from "records/iyakuhin-record";
import { cvtVisitsToShinryouDataList } from "shinryoukoui-item-util";
import { TensuuCollector } from "tensuu-collector";
import { cvtVisitsToIyakuhinDataList } from "iyakuhin-item-util";
import { cvtVisitsToKizaiDataList } from "tokuteikizai-item-util";
import { mkレセプト共通レコード } from "records/common-record";
import { mk保険者レコード } from "records/hokensha-record";

export interface CreateRezeptArg {
  seikyuuSaki: "kokuho" | "shaho";
  year: number;
  month: number;
  clinicInfo: ClinicInfo;
  visitsList: RezeptVisit[][];
  hokensha: Hokensha | undefined;
  kouhiList: RezeptKouhi[];
  patient: RezeptPatient;
  shotokuKubun: ShotokuKubunCode | undefined;
}

export function createRezept(arg: CreateRezeptArg, serial: number): string {
  const { seikyuuSaki, year, month, clinicInfo, visitsList, hokensha, kouhiList, patient, shotokuKubun } = arg;
  const rows: string[] = [];
  rows.push(create医療機関情報レコード(
    seikyuuSaki === "shaho" ? 診査支払い機関コード.社保基金 : 診査支払い機関コード.国健連合,
    year, month, clinicInfo));
  for (let visits of visitsList) {
    rows.push(createレセプト共通レコード(year, month, serial++, hokensha, kouhiList, patient, visits, shotokuKubun));
    const tenCol = new TensuuCollector();
    const { shinryouDataList, iyakuhinDataList, kizaiDataList } = calcVisits(visits, tenCol);
    if (hokensha) {
      const hokenFutan: number | undefined = undefined; // ToDo: 限度額に達した場合に設定
      rows.push(create保険者レコード(hokensha, visits, tenCol.getHokenTotal(), hokenFutan));
    }
  }
  return rows.join("\r\n") + "\r\n\x1A";
}

function create医療機関情報レコード(seikyuu: 診査支払い機関コードCode, year: number, month: number,
  clinicInfo: ClinicInfo): string {
  const [seikyuuYear, seikyuuMonth] = calcSeikyuuMonth(year, month);

  return mk医療機関情報レコード({
    診査支払い機関: seikyuu,
    都道府県: extract都道府県コードfromAddress(clinicInfo.address),
    医療機関コード: clinicInfo.kikancode,
    医療機関名称: clinicInfo.name,
    year: seikyuuYear,
    month: seikyuuMonth,
    電話番号: clinicInfo.tel,
  });
}

function createレセプト共通レコード(
  year: number,
  month: number,
  serial: number,
  hokensha: Hokensha | undefined,
  kouhiList: RezeptKouhi[],
  patient: RezeptPatient,
  visits: RezeptVisit[],
  shotokuKubun: ShotokuKubunCode | undefined,
): string {
  const tokkijikouGendo = resolveGendogakuTokkiJikou(hokensha, shotokuKubun);
  return mkレセプト共通レコード({
    レセプト番号: serial,
    レセプト種別: resolve保険種別(hokensha, kouhiList.length),
    診療年月: formatYearMonth(year, month),
    氏名: patient.name,
    男女区分: patient.sex === "M" ? 男女区分コード.男 : 男女区分コード.女,
    生年月日: patient.birthday.replaceAll("-", ""),
    給付割合: optionFold(hokensha, commonRecord給付割合, ""),
    レセプト特記事項: tokkijikouGendo ?? "",
    カルテ番号等: patient.patientId,
    検索番号: "",
    請求情報: "",
  });
}

function create保険者レコード(
  hokensha: Hokensha,
  visits: RezeptVisit[],
  合計点数: number,
  医療保険負担金額: number | undefined,
): string {
  return mk保険者レコード({
    保険者番号: formatHokenshaBangou(hokensha.hokenshaBangou),
    被保険者証記号: adjustOptString(hokensha.hihokenshaKigou),
    被保険者証番号: hokensha.hihokenshaBangou,
    診療実日数: hokenRecordJitsuNissu(visits),
    合計点数,
    医療保険負担金額
  });
}

export function calcVisits(visits: RezeptVisit[], collector: TensuuCollector): {
  shinryouDataList: 診療行為レコードData[];
  iyakuhinDataList: 医薬品レコードData[];
  kizaiDataList: 特定器材レコードData[];
} {
  const shinryouDataList = cvtVisitsToShinryouDataList(visits);
  const iyakuhinDataList = cvtVisitsToIyakuhinDataList(visits);
  const kizaiDataList = cvtVisitsToKizaiDataList(visits);
  shinryouDataList.filter(dl => dl.点数 !== undefined).forEach(dl => collector.add(dl.負担区分, dl.点数! * dl.回数));
  iyakuhinDataList.filter(dl => dl.点数 !== undefined).forEach(dl => collector.add(dl.負担区分, dl.点数! * dl.回数));
  kizaiDataList.filter(dl => dl.点数 !== undefined).forEach(dl => collector.add(dl.負担区分, dl.点数! * dl.回数));
  return {
    shinryouDataList, iyakuhinDataList, kizaiDataList,
  }
}

