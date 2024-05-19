import { Payer, PaymentSetting, calcPayments } from "./futan/calc";
import { calcVisits } from "./calc-visits";
import { ShotokuKubunCode, 男女区分コード, 診査支払い機関コード, 診査支払い機関コードCode, 診療識別コード, 負担区分コードNameOf } from "./codes";
import { resolveFutankubunOfVisitComment } from "./helper";
import { createレセプト共通レコード, create保険者レコード, create公費レコード, create医療機関情報レコード, create資格確認レコード } from "./record-creators";
import { mkコメントレコード } from "./records/comment-record";
import { create診療報酬請求書レコード } from "./records/seikyuu-record";
import { endReasonToKubun, mk症病名レコード } from "./records/shoubyoumei-record";
import { mk症状詳記レコード } from "./records/shoujoushouki-record";
import { ClinicInfo, HokenSelector, Hokensha, RezeptDisease, RezeptKouhi, RezeptPatient, RezeptVisit } from "./rezept-types";
import { Combiner } from "./tekiyou-item";
import { TensuuCollector } from "./tensuu-collector";
import { futanKubunNameToHokenCollection } from "./hoken-collector";

export interface PatientUnit {
  getRows(serial: number): string[];
  hasHoken(): boolean;
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
    this.rows.push(...unit.getRows(this.serial++));
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

export interface RezeptUnit {
  visits: RezeptVisit[];
  patient: RezeptPatient;
  hokensha: Hokensha | undefined;
  kouhiList: RezeptKouhi[];
  shotokuKubun: ShotokuKubunCode | undefined;
  diseases: RezeptDisease[];
}

export interface RezeptUnitToPatientUnitOption {
  searchNumber?: number;
}

export function rezeptUnitToPatientUnit(rezeptUnit: RezeptUnit, year: number, month: number,
  opt: RezeptUnitToPatientUnitOption = {}, ctx: Partial<PaymentSetting> = {}): PatientUnit {
  const { visits, hokensha, kouhiList, shotokuKubun, diseases, patient } = rezeptUnit;
  if (!hokensha) {
    throw new Error("No hokensha");
  }
  const rows: string[] = [];
  if (visits.length === 0) {
    throw new Error("No visits");
  }
  const tenCol = new TensuuCollector();
  const comb = new Combiner();
  calcVisits(visits, tenCol, comb);
  doCalcPayments(hokensha, kouhiList, tenCol, ctx);
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
        createレセプト共通レコード(year, month, serial, hokensha, kouhiList, patient, visits, shotokuKubun,
          opt.searchNumber),
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

function doCalcPayments(hokensha: Hokensha, kouhiList: RezeptKouhi[], tencol: TensuuCollector, ctx: Partial<PaymentSetting>) {
  const bills: [number, Payer[]][] = [];
  for (let [kubun, ten] of tencol.totalTen.entries()) {
    const kubunName = 負担区分コードNameOf(kubun);
    const h = futanKubunNameToHokenCollection(kubunName, hokensha, kouhiList);
    const payers: Payer[] = [];
    if (h.hokensha != undefined) {
      payers.push(h.hokensha.payer);
    }
    payers.push(...h.kouhiList.map(k => k.payer));
    bills.push([ten, payers]);
  }
  calcPayments(bills, ctx);
  console.log("hoken payment", hokensha?.payer.payment);
  console.log("kouhi payments", kouhiList.map(k => JSON.stringify(k.payer.payment)).join("\n"));
}