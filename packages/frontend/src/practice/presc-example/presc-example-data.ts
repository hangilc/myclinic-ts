import type { PrescExample } from "@/lib/presc-example";
// import type { RP剤情報 } from "@/lib/denshi-shohou/presc-info";

export interface PrescExampleData {
  data: PrescExample;
  id: number;
  isEditingComment: boolean;
  commentInput: string;
};

let serialId = 1;

export function createPrescExampleData(data: PrescExample): PrescExampleData {
  return {
    data, 
    id: serialId++,
    isEditingComment: false,
    commentInput: data.comment ?? "",
  }
}

export function newPrescEampleData(): PrescExampleData {
  // const RP剤情報: RP剤情報 = {
  //   剤形レコード: {
  //     剤形区分: "医療材料",
  //     調剤数量: 1,
  //   },
  //   用法レコード: {
  //     用法コード: "",
  //     用法名称: ""
  //   },
  //   薬品情報グループ: [{
  //     薬品レコード: {
  //       情報区分: "医療材料",
  //       薬品コード種別: "レセプト電算処理システム用コード",
  //       薬品コード: "",
  //       薬品名称: "",
  //       分量: "",
  //       力価フラグ: "薬価単位",
  //       単位名: ""
  //     }
  //   }]
  // }
  throw new Error("newPrescEampleData not implemented");
}
