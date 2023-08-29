import { ShotokuKubunCode, 男女区分コード, 診査支払い機関コードCode } from "./codes";
import { adjustOptString, calcJitsuNissuu, calcSeikyuuMonth, commonRecord給付割合, extract都道府県コードfromAddress, formatHokenshaBangou, formatYearMonth, optionFold, resolveGendogakuTokkiJikou, resolve保険種別 } from "./helper";
import { mkレセプト共通レコード } from "./records/common-record";
import { mk保険者レコード } from "./records/hokensha-record";
import { mk公費レコード } from "./records/kouhi-record";
import { mk医療機関情報レコード } from "./records/medical-institute-record";
import { mk資格確認レコード } from "./records/shikaku-kakunin-record";
import { ClinicInfo, HokenSelector, Hokensha, RezeptKouhi, RezeptPatient, RezeptVisit } from "./rezept-types";

export function create医療機関情報レコード(seikyuu: 診査支払い機関コードCode, year: number, month: number,
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

export function createレセプト共通レコード(
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

export function create保険者レコード(
  hokensha: Hokensha,
  visits: RezeptVisit[],
  合計点数: number,
  医療保険負担金額: number | undefined,
): string {
  return mk保険者レコード({
    保険者番号: formatHokenshaBangou(hokensha.hokenshaBangou),
    被保険者証記号: adjustOptString(hokensha.hihokenshaKigou),
    被保険者証番号: hokensha.hihokenshaBangou,
    診療実日数: calcJitsuNissuu(visits, "H"),
    合計点数,
    医療保険負担金額
  });
}

export function create公費レコード(
  kouhi: RezeptKouhi,
  selector: HokenSelector,
  visits: RezeptVisit[],
  souten: number,
  futanKingaku: number | undefined,
): string {
  return mk公費レコード({
    負担者番号: kouhi.futansha,
    受給者番号: kouhi.jukyuusha,
    診療実日数: calcJitsuNissuu(visits, selector),
    合計点数: souten,
    負担金額: futanKingaku,
  })
}

export function create資格確認レコード(edaban: string | undefined): string {
  return mk資格確認レコード({
    確認区分コード: undefined,
    枝番: edaban,
  })
}
