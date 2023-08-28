import { ShotokuKubunCode, 男女区分コード, 診査支払い機関コード, 診査支払い機関コードCode } from "codes";
import { calcSeikyuuMonth, commonRecord給付割合, extract都道府県コードfromAddress, formatYearMonth, optionFold, resolveGendogakuTokkiJikou, resolve保険種別 } from "helper";
import { handleIyakuhinTekiyouOfVisits } from "iyakuhin-item-util";
import { ClinicInfo } from "myclinic-model";
import { mkレセプト共通レコード } from "records/common-record";
import { mk医療機関情報レコード } from "records/medical-institute-record";
import { create診療報酬請求書レコード } from "records/seikyuu-record";
import { Hokensha, RezeptDisease, RezeptKouhi, RezeptPatient, RezeptVisit } from "rezept-types";
import { handleShinryouTekiyouOfVisits } from "shinryoukoui-item-util";
import { Combiner } from "tekiyou-item";
import { TensuuCollector } from "tensuu-collector";
import { handleKizaiTekiyouOfVisits } from "tokuteikizai-item-util";

interface PatientUnit {
  getRows(serial: number): string[];
  hasHoken(): boolean ;
  getKouhiListLength(): number;
  getSouten(): number;
}

export class RezeptFrame {
  rows: string[] = [];
  serial: number = 1;
  rezeptCount: number = 0;
  rezeptSouten: number = 0;

  constructor(seikyuuSaki: "shaho" | "kokuho", year: number, month: number, clinicInfo: ClinicInfo) {
    this.rows.push(create医療機関情報レコード(
      seikyuuSaki === "shaho" ? 診査支払い機関コード.社保基金 : 診査支払い機関コード.国健連合,
      year, month, clinicInfo));
  }

  add(unit: PatientUnit): void {
    this.rows.push(...unit.getRows());
    this.rezeptCount += (unit.hasHoken() ? 1 : 0) + unit.getKouhiListLength();
    this.rezeptSouten += unit.getSouten();
  }

  finish(): void {
    this.rows.push(create診療報酬請求書レコード({
      rezeptCount: this.rezeptCount,
      totalTen: this.rezeptSouten,
    }))
  }

  output(): string {
    return this.rows.join("\r\n") + "\r\n\x1A";
  }
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

function calcVisits(visits: RezeptVisit[], collector: TensuuCollector, comb: Combiner): void {
  handleShinryouTekiyouOfVisits(visits, comb);
  handleIyakuhinTekiyouOfVisits(visits, comb);
  handleKizaiTekiyouOfVisits(visits, comb);
  comb.iter((shikibetsu, futanKubun, ten, count) => {
    collector.add(futanKubun, ten * count);
  });
}


export interface RezeptUnit {
  visits: RezeptVisit[];
  patient: RezeptPatient;
  hokensha: Hokensha | undefined;
  kouhiList: RezeptKouhi[];
  shotokuKubun: ShotokuKubunCode | undefined;
  diseases: RezeptDisease[];
}

export function rezeptUnitToPatientUnit(rezeptUnit: RezeptUnit, year: number, month: number): PatientUnit {
  const { visits, hokensha, kouhiList, shotokuKubun, diseases, patient } = rezeptUnit;
  const rows: string[] = [];
  if (visits.length === 0) {
    throw new Error("No visits");
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
    diseases.sort((a, b) => a.startDate.localeCompare(b.startDate));
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
  return {
    getRows(serial: number): string[] {
      return [
        createレセプト共通レコード(year, month, serial, hokensha, kouhiList, patient, visits, shotokuKubun),
        ...rows
      ];
    },
    hasHoken(): boolean {
      return hokensha !== undefined;
    },
    getKouhiListLength(): number {
      return kouhiList.length;
    },
    getSouten(): number {
      return tenCol.getRezeptSouten();
    }
  }
}