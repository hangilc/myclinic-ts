import type { PrescInfoData } from "@/lib/denshi-shohou/presc-info";
import type { Shohousen2024Data } from "@/lib/drawer/forms/shohousen-2024/shohousenData2024";
import type { DrugGroup, Shohou } from "@/lib/parse-shohou";
import { DateWrapper } from "myclinic-util";

export function denshiToPrint(src: PrescInfoData): Shohousen2024Data {
  const data: Shohousen2024Data = {
    clinicAddress: src.医療機関所在地,
    clinicName: src.医療機関名称,
    clinicPhone: src.医療機関電話番号,
    clinicKikancode: src.医療機関コード,
    doctorName: src.医師漢字氏名,
    clinicTodoufuken: src.医療機関都道府県コード,
    hokenshaBangou: src.保険者番号,
    hihokenshaKigou: src.被保険者証記号,
    hihokenshaBangou: src.被保険者証番号,
    edaban: src.被保険者証枝番,
    futansha: src.第一公費レコード?.公費負担者番号,
    jukyuusha: src.第一公費レコード?.公費受給者番号,
    futansha2: src.第二公費レコード?.公費負担者番号,
    jukyuusha2: src.第二公費レコード?.公費受給者番号,
    shimei: src.患者漢字氏名,
    birthdate: DateWrapper.fromOnshiDate(src.患者生年月日).asSqlDate(), // YYYY-MM-DD
    sex: src.患者性別 === "男" ? "M" : "F", //"M" | "F",
    hokenKubun: src.被保険者被扶養者 === "被保険者" ? "hihokensha" : "hifuyousha", // "hihokensha" | "hifuyousha",
    koufuDate: DateWrapper.fromOnshiDate(src.処方箋交付年月日).asSqlDate(), // YYYY-MM-DD
    drugs: toDrugs(src),
    isDenshi: true,
    accessCode: src.引換番号,
  };
  return data;
}

function toDrugs(src: PrescInfoData): Shohou {
  let groups: DrugGroup[] = [];
  let shohouComments: string[] = [];
  let bikou: string[] = [];
  let kigen: string | undefined = undefined;
  if (src.使用期限年月日) {
    kigen = DateWrapper.fromOnshiDate(src.使用期限年月日).asSqlDate();
  }
  if (src.備考レコード) {
    bikou.push(...src.備考レコード.map(rec => rec.備考));
  }
    src.提供情報レコード?.提供診療情報レコード?.forEach(rec => {
      const drug = rec.薬品名称 ? `【${rec.薬品名称}】` : "";
      const comm = rec.コメント;
      bikou.push(drug + comm);
    });
    src.提供情報レコード?.検査値データ等レコード?.forEach(rec => {
      bikou.push(rec.検査値データ等);
    });
  return {
    groups, shohouComments, bikou, kigen,
  }
}