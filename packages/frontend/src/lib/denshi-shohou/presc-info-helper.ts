import { DateWrapper } from "myclinic-util";
import type { PrescInfoData, RP剤情報, 薬品情報 } from "./presc-info";

export function issueDateOfPrescInfoAsSqlDate(data: PrescInfoData): string {
  return DateWrapper.fromOnshiDate(data.処方箋交付年月日).asSqlDate();
}

export function createEmptyRP剤情報(): RP剤情報 {
  return {
    剤形レコード: {
      剤形区分: "内服",
      調剤数量: 0,
    },
    用法レコード: {
      用法コード: "",
      用法名称: ""
    },
    薬品情報グループ: []
  }
}

export function createSingleDrugRP剤情報(): RP剤情報 {
  const r = createEmptyRP剤情報();
  r.薬品情報グループ.push(createBlank薬品情報());
  return r;
}

export function createBlank薬品情報(): 薬品情報 {
  return {
    薬品レコード: {
      情報区分: "医薬品",
      薬品コード種別: "レセプト電算処理システム用コード",
      薬品コード: "",
      薬品名称: "",
      分量: "",
      力価フラグ: "薬価単位",
      単位名: ""
    }
  };
}

export function clear保険区分レコード(groups: RP剤情報[]) {
  for(const group of groups){
    for(const drug of group.薬品情報グループ){
      drug.負担区分レコード = undefined;
    }
  }
}