import { unevenDisp } from "@/lib/denshi-shohou/disp/disp-util";
import type {
  PrescInfoData, RP剤情報, 剤形レコード,
  用法レコード,
  用法補足レコード,
  薬品情報,
} from "@/lib/denshi-shohou/presc-info";
import type { Shohousen2024Data } from "@/lib/drawer/forms/shohousen-2024/shohousenData2024";
import type { Drug, DrugGroup, Senpatsu, Shohou, Usage } from "@/lib/parse-shohou";
import { toZenkaku } from "@/lib/zenkaku";
import { DateWrapper } from "myclinic-util";
import type { ShohousenData2025 } from "@/lib/drawer/forms/shohousen-2025/data2025";
import { drugKouhiRep } from "@/lib/denshi-helper";

export function denshiToPrint2(src: PrescInfoData): ShohousenData2025 {
  const data: ShohousenData2025 = {
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
    shohou: toDrugs(src),
    isDenshi: true,
    accessCode: src.引換番号,
  };
  return data;
}

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
    drugs: toDrugsOld(src),
    isDenshi: true,
    accessCode: src.引換番号,
  };
  return data;
}

function toDrugs(src: PrescInfoData): Shohou {
  let groups: DrugGroup[] = [];
  let bikou: string[] = [];
  let kigen: string | undefined = undefined;
  src.RP剤情報グループ.forEach(g => {
    groups.push(toGroup(g))
  })
  if (src.使用期限年月日) {
    kigen = DateWrapper.fromOnshiDate(src.使用期限年月日).asSqlDate();
  }
  switch (src.保険一部負担金区分) {
    case "高齢者一般": {
      bikou.push("高９");
      break;
    }
    case "高齢者８割": {
      bikou.push("高８");
      break;
    }
    case "高齢者７割": {
      bikou.push("高７");
      break;
    }
    default: break;
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
    groups,
    bikou,
    kigen,
  }
}

function toDrugsOld(src: PrescInfoData): Shohou {
  let groups: DrugGroup[] = [];
  // let shohouComments: string[] = [];
  let bikou: string[] = [];
  let kigen: string | undefined = undefined;
  src.RP剤情報グループ.forEach(g => {
    groups.push(toGroupOld(g))
  })
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
    groups,
    // shohouComments, 
    bikou,
    kigen,
  }
}

function toGroup(g: RP剤情報): DrugGroup {
  let 剤形レコード: 剤形レコード = g.剤形レコード;
  let 用法レコード: 用法レコード = g.用法レコード;
  let 用法補足レコード: 用法補足レコード[] = g.用法補足レコード ?? [];
  let 薬品情報グループ: 薬品情報[] = g.薬品情報グループ;
  let drugs: Drug[] = 薬品情報グループ.map(toShohouDrug)
  let usage: Usage = toUsage(剤形レコード, 用法レコード);
  let groupComments: string[] = [];
  用法補足レコード.forEach(a => {
    groupComments.push(a.用法補足情報);
  })

  return { drugs, usage, groupComments };
}

function toGroupOld(g: RP剤情報): DrugGroup {
  let 剤形レコード: 剤形レコード = g.剤形レコード;
  let 用法レコード: 用法レコード = g.用法レコード;
  let 用法補足レコード: 用法補足レコード[] = g.用法補足レコード ?? [];
  let 薬品情報グループ: 薬品情報[] = g.薬品情報グループ;
  let drugs: Drug[] = 薬品情報グループ.map(toShohouDrugOld)
  let usage: Usage = toUsage(剤形レコード, 用法レコード);
  let groupComments: string[] = [];
  用法補足レコード.forEach(a => {
    groupComments.push(a.用法補足情報);
  })

  return { drugs, usage, groupComments };
}

// function composeDrugKouhi(rec: 負担区分レコード): string {
//   const parts: string[] = [];
//   function rep(label: string, value: boolean | undefined) {
//     if (value === undefined) {
//       return;
//     }
//     const s = value ? "適用" : "不適用";
//     parts.push(`${label}${s}`);
//   }
//   rep("第一公費", rec.第一公費負担区分);
//   rep("第二公費", rec.第二公費負担区分);
//   rep("第三公費", rec.第三公費負担区分);
//   rep("特殊公費", rec.特殊公費負担区分);
//   return parts.join("・");
// }

function toShohouDrug(info: 薬品情報): Drug {
  let name: string = info.薬品レコード.薬品名称;
  let amount: string = toZenkaku(info.薬品レコード.分量);
  let unit: string = info.薬品レコード.単位名;
  let senpatsu: Senpatsu | undefined = undefined;
  let uneven: string | undefined = undefined;
  let kouhi: string | undefined = undefined;
  if (info.不均等レコード) {
    uneven = toZenkaku(`(${unevenDisp(info.不均等レコード)})`);
  }
  if (info.負担区分レコード) {
    kouhi = drugKouhiRep(info.負担区分レコード);
  }
  let drugComments: string[] = [];
  (info.薬品補足レコード ?? []).forEach(info => {
    if (info.薬品補足情報 === "後発品変更不可") {
      senpatsu = "henkoufuka";
    } else if (info.薬品補足情報 === "先発医薬品患者希望") {
      senpatsu = "kanjakibou";
    } else {
      drugComments.push(info.薬品補足情報);
    }
  })
  return {
    name, amount, unit, senpatsu, uneven, kouhi, drugComments
  }
}

function toShohouDrugOld(info: 薬品情報): Drug {
  let name: string = info.薬品レコード.薬品名称;
  let amount: string = toZenkaku(info.薬品レコード.分量);
  let unit: string = info.薬品レコード.単位名;
  let senpatsu: Senpatsu | undefined = undefined;
  let uneven: string | undefined = undefined;
  let drugComments: string[] = [];
  if (info.不均等レコード) {
    let s = toZenkaku(`(${unevenDisp(info.不均等レコード)})`);
    drugComments.push(s);
  }
  (info.薬品補足レコード ?? []).forEach(info => {
    if (info.薬品補足情報 === "後発品変更不可") {
      senpatsu = "henkoufuka";
    } else if (info.薬品補足情報 === "先発医薬品患者希望") {
      senpatsu = "kanjakibou";
    } else {
      drugComments.push(info.薬品補足情報);
    }
  })
  return {
    name, amount, unit, senpatsu, uneven, drugComments
  }
}

function toUsage(z: 剤形レコード, u: 用法レコード): Usage {
  if (z.剤形区分 === "内服") {
    return {
      kind: "days",
      days: toZenkaku(z.調剤数量.toString()),
      usage: u.用法名称,
    }
  } else if (z.剤形区分 === "頓服") {
    return {
      kind: "times",
      times: toZenkaku(z.調剤数量.toString()),
      usage: u.用法名称
    }
  } else {
    return {
      kind: "other",
      usage: u.用法名称
    }
  }
}
