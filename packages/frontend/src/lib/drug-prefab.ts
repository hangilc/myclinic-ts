import type {
  剤形レコード,
  用法レコード,
  用法補足レコード,
  薬品情報,
} from "./denshi-shohou/presc-info";

export interface DrugPrefab {
  id: string;
  presc: PrescOfPrefab;
  alias: string[];
  tag: string[];
  comment: string;
}

export interface PrescOfPrefab {
  剤形レコード: 剤形レコード;
  用法レコード: 用法レコード;
  用法補足レコード?: 用法補足レコード[];
  薬品情報グループ: [薬品情報];
}

export async function exapleDrugPrefab(): Promise<DrugPrefab[]> {
  return [
    {
      id: "example-id-1",
      presc: {
        剤形レコード: {
          剤形区分: "内服",
          調剤数量: 5,
        },
        用法レコード: {
          用法コード: "1013044400000000",
          用法名称: "１日３回朝昼夕食後　服用",
        },
        薬品情報グループ: [
          {
            薬品レコード: {
              分量: "3",
              力価フラグ: "薬価単位",
              単位名: "錠",
              情報区分: "医薬品",
              薬品コード: "620000033",
              薬品コード種別: "レセプト電算処理システム用コード",
              薬品名称: "カロナール錠３００　３００ｍｇ",
            },
          },
        ],
      },
      alias: [],
      tag: [],
      comment: "",
    },
  ];
}

export function searchDrugPrefab(
  fab: DrugPrefab[],
  name: string
): DrugPrefab[] {
  const result: DrugPrefab[] = [];
  for (let entry of fab) {
    for (let a of entry.alias) {
      if (a.includes(name)) {
        result.push(entry);
        continue;
      }
    }
    if (entry.presc.薬品情報グループ[0].薬品レコード.薬品名称.includes(name)) {
      result.push(entry);
    }
  }
  return result;
}
