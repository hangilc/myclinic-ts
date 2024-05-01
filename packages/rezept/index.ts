import { ShotokuKubunCode, 男女区分コード, 診査支払い機関コード, 診査支払い機関コードCode, 診療識別コード, 負担区分コードCode } from "./codes";
import { ClinicInfo, HokenSelector, Hokensha, RezeptComment, RezeptDisease, RezeptKouhi, RezeptPatient, RezeptVisit } from "./rezept-types";
import { TensuuCollector } from "./tensuu-collector";
import { endReasonToKubun, mk症病名レコード } from "./records/shoubyoumei-record";
import { mk症状詳記レコード } from "./records/shoujoushouki-record";
import { mkコメントレコード } from "./records/comment-record";
import { create診療報酬請求書レコード } from "./records/seikyuu-record";
import { Combiner } from "./tekiyou-item";
import { createレセプト共通レコード, create保険者レコード, create公費レコード, create医療機関情報レコード, create資格確認レコード } from "./record-creators";
import { calcVisits } from "./calc-visits";
import { resolveFutankubunOfVisitComment } from "./helper";
export { roundTo10 } from "./helper";
export * from "./tensuu-collector";
export * from "./tekiyou-item";
export * from "./rezept-frame";
export * from "./calc-visits";
export * from "./item-collector";
export * from "./houkatsu";

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
        rows.push(create公費レコード(kouhi, sel, visits, kouhiTotals[index], kouhi.jikofutan));
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
    rezeptCount += (hokensha ? 1 : 0) + kouhiList.length;
    rezeptSouten += tenCol.getRezeptSouten();
  }
  rows.push(create診療報酬請求書レコード({
    rezeptCount: rezeptCount,
    totalTen: rezeptSouten,
  }))
  return rows.join("\r\n") + "\r\n\x1A";
}
