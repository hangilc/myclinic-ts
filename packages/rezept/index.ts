import { mk医療機関情報レコード } from "./records/medical-institute-record";
import { ShotokuKubunCode, 男女区分コード, 診査支払い機関コード, 診査支払い機関コードCode, 診療識別コード, 負担区分コードCode } from "./codes";
import { adjustOptString, calcSeikyuuMonth, commonRecord給付割合, extract都道府県コードfromAddress, formatHokenshaBangou, formatYearMonth, calcJitsuNissuu, optionFold, resolveGendogakuTokkiJikou, resolve保険種別 } from "./helper";
import { ClinicInfo, HokenSelector, Hokensha, RezeptComment, RezeptDisease, RezeptKouhi, RezeptPatient, RezeptVisit } from "./rezept-types";
import { handleShinryouTekiyouOfVisits } from "./shinryoukoui-item-util";
import { TensuuCollector } from "./tensuu-collector";
import { handleIyakuhinTekiyouOfVisits } from "./iyakuhin-item-util";
import { handleKizaiTekiyouOfVisits } from "./tokuteikizai-item-util";
import { mkレセプト共通レコード } from "./records/common-record";
import { mk保険者レコード } from "./records/hokensha-record";
import { mk公費レコード } from "./records/kouhi-record";
import { mk資格確認レコード } from "./records/shikaku-kakunin-record";
import { endReasonToKubun, mk症病名レコード } from "./records/shoubyoumei-record";
import { mk症状詳記レコード } from "./records/shoujoushouki-record";
import { mkコメントレコード } from "./records/comment-record";
import { create診療報酬請求書レコード } from "./records/seikyuu-record";
import { Combiner } from "./tekiyou-item";

export interface RezeptUnit {
  visits: RezeptVisit[];
  patient: RezeptPatient;
  hokensha: Hokensha | undefined;
  kouhiList: RezeptKouhi[];
  shotokuKubun: ShotokuKubunCode | undefined;
  diseases: RezeptDisease[];
}

export interface CreateRezeptArg {
  seikyuuSaki: "kokuho" | "shaho";
  year: number;
  month: number;
  clinicInfo: ClinicInfo;
  units: RezeptUnit[];
}

export function createRezept(arg: CreateRezeptArg): string {
  const { seikyuuSaki, year, month, clinicInfo, units } = arg;
  const rows: string[] = [];
  rows.push(create医療機関情報レコード(
    seikyuuSaki === "shaho" ? 診査支払い機関コード.社保基金 : 診査支払い機関コード.国健連合,
    year, month, clinicInfo));
  let serial = 1;
  let rezeptCount = 0;
  let rezeptSouten = 0;
  for (let unit of units) {
    const { visits, hokensha, kouhiList, shotokuKubun, diseases, patient } = unit;
    if (visits.length === 0) {
      continue;
    }
    rows.push(createレセプト共通レコード(year, month, serial++, hokensha, kouhiList, patient, visits, shotokuKubun));
    const tenCol = new TensuuCollector();
    const comb = new Combiner();
    calcVisits(visits, tenCol, comb);
    if (hokensha) {
      const hokenFutan: number | undefined = undefined; // ToDo: 限度額に達した場合に設定
      rows.push(create保険者レコード(hokensha, visits, tenCol.getHokenTotal(), hokenFutan));
    }
    if (kouhiList.length > 0) {
      const kouhiTotals: number[] = tenCol.getKouhiTotals();
      kouhiList.forEach((kouhi, index) => {
        let sel: HokenSelector;
        switch (index) {
          case 0: sel = "1"; break;
          case 1: sel = "2"; break;
          case 2: sel = "3"; break;
          case 3: sel = "4"; break;
          default: throw new Error("Too many kouhi.");
        }
        rows.push(create公費レコード(kouhi, sel, visits, kouhiTotals[index], undefined));
      })
    }
    if (hokensha && hokensha.edaban !== undefined) {
      const edaban = hokensha.edaban;
      rows.push(create資格確認レコード(edaban));
    }
    {
      diseases.forEach((disease, i) => {
        const adjCodes = disease.adjcodes;
        rows.push(mk症病名レコード({
          傷病名コード: disease.shoubyoumeicode,
          診療開始日: disease.startDate.replaceAll("-", ""),
          転帰区分: endReasonToKubun(disease.endReason),
          修飾語コード: (adjCodes.length > 5 ? adjCodes.slice(0, 5) : adjCodes).join(""),
          主傷病: i === 0,
        }));
      })
    }
    {
      visits.forEach(visit => {
        visit.shoujouShoukiList.forEach(shouki => {
          rows.push(mk症状詳記レコード({
            症状詳記区分: shouki.kubun,
            症状詳記データ: shouki.text,
          }))
        })
      })
    }
    rows.push(...comb.toRecords());
    // rows.push(...shinryouDataList.map(mk診療行為レコード));
    // rows.push(...iyakuhinDataList.map(mk医薬品レコード));
    // rows.push(...kizaiDataList.map(mk特定器材レコード));
    for (let visit of visits) {
      visit.comments.forEach(comm => {
        const futanKubun = resolveFutankubunOfVisitComment(comm, visit);
        const shikibetsucode = comm.shikibetsuCode ?? 診療識別コード.全体に係る識別コード;
        rows.push(mkコメントレコード({
          診療識別: shikibetsucode,
          負担区分: futanKubun,
          コメントコード: comm.code,
          文字データ: comm.text,
        }))
      })
    }
    rezeptCount += (hokensha ? 1 : 0) + kouhiList.length;
    rezeptSouten += tenCol.getRezeptSouten();
  }
  rows.push(create診療報酬請求書レコード({
    rezeptCount: rezeptCount,
    totalTen: rezeptSouten,
  }))
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
    診療実日数: calcJitsuNissuu(visits, "H"),
    合計点数,
    医療保険負担金額
  });
}

function create公費レコード(
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

function create資格確認レコード(edaban: string | undefined): string {
  return mk資格確認レコード({
    確認区分コード: undefined,
    枝番: edaban,
  })
}

export function calcVisits(visits: RezeptVisit[], collector: TensuuCollector, comb: Combiner): void {
  handleShinryouTekiyouOfVisits(visits, comb);
  handleIyakuhinTekiyouOfVisits(visits, comb);
  handleKizaiTekiyouOfVisits(visits, comb);
  comb.iter((shikibetsu, futanKubun, ten, count) => {
    collector.add(futanKubun, ten * count);
  });
}

function resolveFutankubunOfVisitComment(comm: RezeptComment, visit: RezeptVisit): 負担区分コードCode {
  if (comm.futanKubun) {
    return comm.futanKubun;
  } else {
    if (calcJitsuNissuu([visit], "H")) {
      return "1";
    } else if (calcJitsuNissuu([visit], "1")) {
      return "5";
    } else {
      throw new Error("No hoken and no kouhi.");
    }
  }
}